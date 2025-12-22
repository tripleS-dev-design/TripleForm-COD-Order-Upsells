// ===== File: /api/webhooks/order-created.js =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier le webhook Shopify
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];

    if (!hmac || !topic || !shop) {
      return res.status(401).json({ ok: false, error: "Webhook non autorisé" });
    }

    // Vérifier l'authenticité du webhook
    const verified = verifyWebhook(req);
    if (!verified) {
      return res.status(401).json({ ok: false, error: "Signature invalide" });
    }

    const order = req.body;

    // Vérifier si c'est une commande COD
    const isCOD = order.payment_gateway_names?.some(gateway => 
      gateway.toLowerCase().includes('cod') || 
      gateway.toLowerCase().includes('cash')
    );

    if (!isCOD) {
      return res.json({ ok: true, skipped: true, message: "Commande non COD" });
    }

    // Récupérer le numéro de téléphone du client
    const customerPhone = order.customer?.phone || order.billing_address?.phone;
    if (!customerPhone) {
      return res.json({ ok: true, skipped: true, message: "Pas de numéro de téléphone" });
    }

    // Vérifier si WhatsApp est configuré pour ce shop
    const config = await prisma.whatsappConfig.findUnique({
      where: { shopId: shop },
    });

    if (!config?.enabled) {
      return res.json({ ok: true, skipped: true, message: "WhatsApp désactivé" });
    }

    // Préparer les données pour le message
    const orderData = {
      orderId: order.order_number || order.id.toString().split('/').pop(),
      customerName: order.customer?.first_name + ' ' + order.customer?.last_name,
      customerPhone,
      productName: order.line_items?.[0]?.title || 'Produit',
      orderTotal: `${parseFloat(order.total_price || 0).toFixed(2)} ${order.currency || 'MAD'}`,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      trackingUrl: order.order_status_url
    };

    // Déterminer le délai d'envoi
    let delay = 0;
    switch (config.sendDelay) {
      case '5min':
        delay = 5 * 60 * 1000;
        break;
      case '30min':
        delay = 30 * 60 * 1000;
        break;
      case '1h':
        delay = 60 * 60 * 1000;
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

    // Programmer l'envoi du message
    if (delay > 0) {
      setTimeout(async () => {
        try {
          await fetch(`https://${process.env.HOST}/api/whatsapp/send-order-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Shop-Domain': shop
            },
            body: JSON.stringify({
              orderId: orderData.orderId,
              customerPhone,
              orderData
            })
          });
        } catch (error) {
          console.error("Erreur d'envoi WhatsApp programmé:", error);
        }
      }, delay);
    } else {
      // Envoyer immédiatement
      await fetch(`https://${process.env.HOST}/api/whatsapp/send-order-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Shop-Domain': shop
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          customerPhone,
          orderData
        })
      });
    }

    res.json({ ok: true, message: "Webhook traité avec succès" });
  } catch (error) {
    console.error("Webhook order created error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}