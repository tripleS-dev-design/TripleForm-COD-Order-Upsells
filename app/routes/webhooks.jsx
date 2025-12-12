// ===== File: app/routes/webhooks.jsx =====
import { authenticate } from "../shopify.server";
import { setBillingInactive, prisma } from "../models/shop.server.js";

// Shopify enverra des POST webhooks sur cette route
export const action = async ({ request }) => {
  const { shop, topic /*, session, payload */ } = await authenticate.webhook(request);

  console.log(`[Webhook] ${topic} for ${shop}`);

  try {
    if (topic === "APP_UNINSTALLED") {
      // 1) Désactiver le billing pour ce shop
      await setBillingInactive(shop).catch(() => {});

      // 2) Supprimer toutes les sessions OAuth liées à ce shop
      await prisma.session.deleteMany({ where: { shop } }).catch(() => {});

      // (Optionnels)
      // // Reset usage:
      // await prisma.shop.update({ where: { shopDomain: shop }, data: { usageMonth: null, usageCount: 0 }});
      // // Purge autres configs si tu veux:
      // await prisma.googleSheetConfig?.deleteMany({ where: { shopDomain: shop }});
      // await prisma.pixelConfig?.deleteMany({ where: { shopDomain: shop }});
    }
  } catch (err) {
    console.error("Webhook handling error:", err);
    // On renvoie 200 pour ack le webhook (Shopify réessaie sinon)
    return new Response(null, { status: 200 });
  }

  return new Response(null, { status: 200 });
};

// Bloque les GET accidentels
export const loader = () => new Response("Not found", { status: 404 });
