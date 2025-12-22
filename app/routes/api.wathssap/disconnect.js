// ===== File: /api/whatsapp/disconnect.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, error: "Non autorisé" });
    }

    const shopId = session.shop;

    // Déconnecter le client WhatsApp
    const client = whatsappClients.get(shopId);
    if (client) {
      try {
        await client.logout();
        await client.destroy();
      } catch (error) {
        console.error("Error destroying WhatsApp client:", error);
      }
      whatsappClients.delete(shopId);
    }

    // Mettre à jour la base de données
    await prisma.whatsappStatus.update({
      where: { shopId },
      data: {
        qrCode: null,
        sessionId: null,
        phoneNumber: null,
        connectedAt: null,
        status: 'disconnected'
      }
    });

    res.json({ ok: true, message: "WhatsApp déconnecté avec succès" });
  } catch (error) {
    console.error("WhatsApp disconnect error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}