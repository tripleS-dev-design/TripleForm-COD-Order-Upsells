// ===== File: /api/whatsapp/send-order-message.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const { orderId, customerPhone, orderData } = req.body;

    // Valider les données
    if (!orderId || !customerPhone) {
      return res.status(400).json({ ok: false, error: "Données manquantes" });
    }

    // Récupérer la session depuis l'en-tête ou autre méthode
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
      return res.status(400).json({ ok: false, error: "WhatsApp non connecté pour ce shop" });
    }

    // Récupérer la configuration
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId },
    });

    if (!config?.enabled) {
      return res.json({ ok: true, skipped: true, message: "WhatsApp désactivé pour ce shop" });
    }

    const client = whatsappClients.get(shopId);
    if (!client) {
      return res.status(400).json({ ok: false, error: "Client WhatsApp non disponible" });
    }

    // Préparer le message
    const templateData = {
      orderId,
      customerName: orderData?.customerName || "Client",
      customerPhone,
      productName: orderData?.productName || "Produit",
      orderTotal: orderData?.orderTotal || "0,00 MAD",
      deliveryDate: orderData?.deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      shopName: shopId.replace('.myshopify.com', ''),
      trackingUrl: orderData?.trackingUrl || `https://${shopId}/admin/orders/${orderId}`,
      supportNumber: whatsappStatus.phoneNumber
    };

    let finalMessage = config.messageTemplate;
    Object.keys(templateData).forEach(key => {
      finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), templateData[key]);
    });

    // Formater le numéro de téléphone
    const formattedPhone = customerPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('212')) {
      return res.status(400).json({ ok: false, error: "Numéro de téléphone invalide" });
    }

    // Vérifier les heures de bureau si activé
    if (config.businessHoursOnly) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [startHour, startMinute] = config.businessHoursStart.split(':').map(Number);
      const [endHour, endMinute] = config.businessHoursEnd.split(':').map(Number);
      
      const currentTime = currentHour * 60 + currentMinute;
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (currentTime < startTime || currentTime > endTime) {
        return res.json({ 
          ok: true, 
          scheduled: true, 
          message: "Message programmé pour les heures de bureau" 
        });
      }
    }

    // Envoyer le message
    try {
      const chatId = `${formattedPhone}@c.us`;
      
      // Vérifier si le chat existe déjà
      let chat;
      try {
        chat = await client.getChatById(chatId);
      } catch {
        // Créer un nouveau chat
        chat = await client.getChatById(chatId);
      }

      const sentMessage = await chat.sendMessage(finalMessage);

      // Mettre à jour les statistiques
      await prisma.whatsappStats.upsert({
        where: { shopId },
        update: {
          totalMessages: { increment: 1 },
          successful: { increment: 1 },
          ordersNotified: { increment: 1 },
          lastMessageAt: new Date()
        },
        create: {
          shopId,
          totalMessages: 1,
          successful: 1,
          ordersNotified: 1,
          lastMessageAt: new Date()
        }
      });

      // Enregistrer l'historique des messages
      await prisma.whatsappMessage.create({
        data: {
          shopId,
          messageId: sentMessage.id.id,
          orderId,
          customerPhone: formattedPhone,
          message: finalMessage,
          type: 'order_confirmation',
          status: 'sent',
          sentAt: new Date()
        }
      });

      res.json({ ok: true, message: "Message WhatsApp envoyé avec succès" });
    } catch (error) {
      // Gérer les erreurs et réessayer si configuré
      console.error("WhatsApp send error:", error);
      
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
          orderId,
          customerPhone: formattedPhone,
          message: finalMessage,
          type: 'order_confirmation',
          status: 'failed',
          error: error.message,
          sentAt: new Date()
        }
      });

      throw error;
    }

  } catch (error) {
    console.error("WhatsApp order message error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}