// ===== File: /api/whatsapp/save-config.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, error: "Non autorisé" });
    }

    const { config } = req.body;
    const shopId = session.shop;

    if (!config) {
      return res.status(400).json({ ok: false, error: "Configuration manquante" });
    }

    // Sauvegarder la configuration
    await prisma.whatsappConfig.upsert({
      where: { shopId },
      update: config,
      create: {
        shopId,
        ...config
      }
    });

    // Mettre à jour les métadonnées Shopify si nécessaire
    const metafield = {
      namespace: 'tripleform',
      key: 'whatsapp_config',
      value: JSON.stringify(config),
      type: 'json_string'
    };

    // Enregistrer dans Shopify metafields
    await shopify.rest.Metafield.all({
      session: session,
      metafield: metafield
    });

    res.json({ ok: true, message: "Configuration WhatsApp sauvegardée" });
  } catch (error) {
    console.error("WhatsApp save config error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}