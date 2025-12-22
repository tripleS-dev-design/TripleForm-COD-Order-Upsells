// ===== File: /api/whatsapp/send-test.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, error: "Non autorisé" });
    }

    const { message, type = 'order' } = req.body;
    const shopId = session.shop;

    // Vérifier la connexion WhatsApp
    const whatsappStatus = await prisma.whatsappStatus.findUnique({
      where: { shopId },
    });

    if (!whatsappStatus?.connectedAt) {
      return res.status(400).json({ ok: false, error: "WhatsApp non connecté" });
    }

    const client = whatsappClients.get(shopId);
    if (!client) {
      return res.status(400).json({ ok: false, error: "Client WhatsApp non trouvé" });
    }

    // Obtenir la configuration
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId },
    });

    if (!config) {
      return res.status(400).json({ ok: false, error: "Configuration WhatsApp non trouvée" });
    }

    // Préparer le message de test
    const testData = {
      orderId: "1234",
      customerName: "Jean Dupont",
      customerPhone: whatsappStatus.phoneNumber,
      productName: "iPhone 15 Pro",
      orderTotal: "1 299,00 MAD",
      deliveryDate: "15 Mars 2024",
      shopName: session.shop.replace('.myshopify.com', ''),
      trackingUrl: "https://example.com/track/1234",
      supportNumber: whatsappStatus.phoneNumber,
      recoveryCode: config.recoveryCode || "RECOVERY10"
    };

    let finalMessage = message || config.messageTemplate;
    Object.keys(testData).forEach(key => {
      finalMessage = finalMessage.replace(new RegExp(`{${key}}`, 'g'), testData[key]);
    });

    // Envoyer le message
    try {
      const chat = await client.getChatById(`${whatsappStatus.phoneNumber}@c.us`);
      await chat.sendMessage(finalMessage);

      // Mettre à jour les statistiques
      await prisma.whatsappStats.upsert({
        where: { shopId },
        update: {
          totalMessages: { increment: 1 },
          successful: { increment: 1 },
          lastTestMessageAt: new Date()
        },
        create: {
          shopId,
          totalMessages: 1,
          successful: 1,
          lastTestMessageAt: new Date()
        }
      });

      res.json({ ok: true, message: "Message test envoyé avec succès" });
    } catch (error) {
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

      throw error;
    }

  } catch (error) {
    console.error("WhatsApp send test error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}