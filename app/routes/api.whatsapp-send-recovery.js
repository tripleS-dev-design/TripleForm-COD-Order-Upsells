// ===== File: /api/whatsapp/send-recovery.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const { cartToken, customerPhone, cartData } = req.body;

    if (!cartToken || !customerPhone) {
      return res.status(400).json({ ok: false, error: "Données manquantes" });
    }

    const shopDomain = req.headers['x-shopify-shop-domain'];
    if (!shopDomain) {
      return res.status(401).json({ ok: false, error: "Shop non identifié" });
    }

    const shopId = shopDomain;

    // Vérifier la connexion WhatsApp
    const whatsappStatus = await prisma.whatsappStatus.findUnique({
      where: { shopId },
    });

    if (!whatsappStatus?.connectedAt) {
      return res.status(400).json({ ok: false, error: "WhatsApp non connecté" });
    }

    // Récupérer la configuration
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId },
    });

    if (!config?.recoveryEnabled) {
      return res.json({ ok: true, skipped: true, message: "Recovery désactivé" });
    }

    const client = whatsappClients.get(shopId);
    if (!client) {
      return res.status(400).json({ ok: false, error: "Client WhatsApp non disponible" });
    }

    // Préparer le message de recovery
    const templateData = {
      customerName: cartData?.customerName || "Client",
      customerPhone,
      productName: cartData?.productName || "Produit",
      cartTotal: cartData?.cartTotal || "0,00 MAD",
      shopName: shopId.replace('.myshopify.com', ''),
      recoveryCode: config.recoveryCode || "RECOVERY10",
      discountAmount: config.recoveryDiscount || "10%",
      cartUrl: cartData?.cartUrl || `https://${shopId}/cart/${cartToken}`
    };

    let finalMessage = config.recoveryMessage;
    Object.keys(templateData).forEach(key => {
      finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), templateData[key]);
    });

    // Formater le numéro de téléphone
    const formattedPhone = customerPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('212')) {
      return res.status(400).json({ ok: false, error: "Numéro de téléphone invalide" });
    }

    // Envoyer le message
    try {
      const chatId = `${formattedPhone}@c.us`;
      let chat;
      
      try {
        chat = await client.getChatById(chatId);
      } catch {
        chat = await client.getChatById(chatId);
      }

      const sentMessage = await chat.sendMessage(finalMessage);

      // Mettre à jour les statistiques de recovery
      await prisma.whatsappStats.upsert({
        where: { shopId },
        update: {
          totalMessages: { increment: 1 },
          successful: { increment: 1 },
          recoverySent: { increment: 1 },
          lastRecoveryAt: new Date()
        },
        create: {
          shopId,
          totalMessages: 1,
          successful: 1,
          recoverySent: 1,
          lastRecoveryAt: new Date()
        }
      });

      // Enregistrer dans l'historique
      await prisma.whatsappMessage.create({
        data: {
          shopId,
          messageId: sentMessage.id.id,
          cartToken,
          customerPhone: formattedPhone,
          message: finalMessage,
          type: 'cart_recovery',
          status: 'sent',
          sentAt: new Date()
        }
      });

      // Mettre à jour le panier abandonné
      await prisma.abandonedCart.update({
        where: { token: cartToken },
        data: {
          recoverySentAt: new Date(),
          recoveryMessageId: sentMessage.id.id,
          recoveryStatus: 'sent'
        }
      });

      res.json({ ok: true, message: "Message de recovery envoyé avec succès" });
    } catch (error) {
      console.error("WhatsApp recovery error:", error);
      
      await prisma.whatsappStats.upsert({
        where: { shopId },
        update: {
          totalMessages: { increment: 1 },
          failed: { increment: 1 },
          lastError: error.message
        },
        create: {
          shopId,
          totalMessages: 1,
          failed: 1,
          lastError: error.message
        }
      });

      // Enregistrer l'échec
      await prisma.whatsappMessage.create({
        data: {
          shopId,
          cartToken,
          customerPhone: formattedPhone,
          message: finalMessage,
          type: 'cart_recovery',
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        }
      });

      throw error;
    }

  } catch (error) {
    console.error("WhatsApp recovery error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}