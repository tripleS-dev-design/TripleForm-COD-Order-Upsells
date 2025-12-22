// ===== File: /api/whatsapp/status.js =====
export default async function handler(req, res) {
  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, error: "Non autorisé" });
    }

    // Récupérer le statut WhatsApp depuis la base de données
    const whatsappStatus = await prisma.whatsappStatus.findUnique({
      where: { shopId: session.shop },
    });

    // Récupérer la configuration
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId: session.shop },
    });

    // Vérifier si la session WhatsApp est toujours valide
    const isConnected = whatsappStatus?.sessionId && 
                       whatsappStatus?.connectedAt &&
                       new Date(whatsappStatus.connectedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Récupérer les statistiques
    const stats = await prisma.whatsappStats.findUnique({
      where: { shopId: session.shop },
    });

    res.json({
      ok: true,
      connected: isConnected,
      phoneNumber: whatsappStatus?.phoneNumber,
      sessionStatus: isConnected ? 'connected' : 'disconnected',
      qrCode: whatsappStatus?.qrCode,
      lastConnected: whatsappStatus?.connectedAt,
      messagesSent: stats?.messagesSent || 0,
      recoveryRate: stats?.recoveryRate || 0,
      stats: stats || {
        totalMessages: 0,
        successful: 0,
        failed: 0,
        recoveryConverted: 0,
        avgResponseTime: 0
      },
      config: config || null
    });
  } catch (error) {
    console.error("WhatsApp status error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}