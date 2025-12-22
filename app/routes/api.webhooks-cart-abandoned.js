// ===== File: /api/webhooks/cart-abandoned.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];

    if (!hmac || !topic || !shop) {
      return res.status(401).json({ ok: false, error: "Webhook non autorisé" });
    }

    const verified = verifyWebhook(req);
    if (!verified) {
      return res.status(401).json({ ok: false, error: "Signature invalide" });
    }

    const cartData = req.body;

    // Vérifier si c'est un vrai abandon (panier avec articles mais non acheté)
    if (!cartData.line_items || cartData.line_items.length === 0) {
      return res.json({ ok: true, skipped: true, message: "Panier vide" });
    }

    // Récupérer le numéro de téléphone
    const customerPhone = cartData.contact || cartData.customer?.phone;
    if (!customerPhone) {
      return res.json({ ok: true, skipped: true, message: "Pas de numéro de téléphone" });
    }

    // Vérifier la configuration WhatsApp
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId: shop },
    });

    if (!config?.recoveryEnabled) {
      return res.json({ ok: true, skipped: true, message: "Recovery désactivé" });
    }

    // Enregistrer le panier abandonné
    const cartToken = cartData.token || cartData.id;
    
    await prisma.abandonedCart.upsert({
      where: { token: cartToken },
      update: {
        shopId: shop,
        customerPhone,
        customerEmail: cartData.customer?.email,
        items: JSON.stringify(cartData.line_items),
        total: parseFloat(cartData.total_price || 0),
        currency: cartData.currency || 'MAD',
        abandonedAt: new Date(),
        recoveryStatus: 'pending'
      },
      create: {
        token: cartToken,
        shopId: shop,
        customerPhone,
        customerEmail: cartData.customer?.email,
        items: JSON.stringify(cartData.line_items),
        total: parseFloat(cartData.total_price || 0),
        currency: cartData.currency || 'MAD',
        abandonedAt: new Date(),
        recoveryStatus: 'pending'
      }
    });

    // Déterminer le délai de recovery
    let delay = 60 * 60 * 1000; // 1h par défaut
    switch (config.recoveryDelay) {
      case '30min':
        delay = 30 * 60 * 1000;
        break;
      case '2h':
        delay = 2 * 60 * 60 * 1000;
        break;
      case '6h':
        delay = 6 * 60 * 60 * 1000;
        break;
      case '24h':
        delay = 24 * 60 * 60 * 1000;
        break;
    }

    // Programmer l'envoi du message de recovery
    setTimeout(async () => {
      try {
        // Vérifier si le panier a été récupéré entre-temps
        const cart = await prisma.abandonedCart.findUnique({
          where: { token: cartToken },
        });

        if (cart?.recoveryStatus !== 'pending') {
          return; // Déjà traité
        }

        const cartDataForMessage = {
          customerName: cartData.customer?.first_name + ' ' + cartData.customer?.last_name,
          customerPhone,
          productName: cartData.line_items[0]?.title || 'Produit',
          cartTotal: `${cart.total.toFixed(2)} ${cart.currency}`,
          cartUrl: `https://${shop}/cart/${cartToken}`
        };

        await fetch(`https://${process.env.HOST}/api/whatsapp/send-recovery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Shop-Domain': shop
          },
          body: JSON.stringify({
            cartToken,
            customerPhone,
            cartData: cartDataForMessage
          })
        });
      } catch (error) {
        console.error("Erreur d'envoi recovery:", error);
        
        // Marquer comme échoué
        await prisma.abandonedCart.update({
          where: { token: cartToken },
          data: {
            recoveryStatus: 'failed',
            recoveryError: error.message
          }
        });
      }
    }, delay);

    res.json({ ok: true, message: "Panier abandonné enregistré" });
  } catch (error) {
    console.error("Webhook cart abandoned error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}