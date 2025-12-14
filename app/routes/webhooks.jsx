import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, session, payload } =
      await authenticate.webhook(request);

    console.log(`🔔 Webhook ${topic} reçu pour ${shop}`);

    const db = await import("../db.server");

    switch (topic) {
      case "customers/data_request":
      case "customers/redact":
        // Shopify attend juste 200
        break;

      case "shop/redact":
      case "app/uninstalled":
        await db.default.session.deleteMany({ where: { shop } });
        break;

      case "app/scopes_update":
        if (session && payload?.current) {
          await db.default.session.update({
            where: { id: session.id },
            data: { scope: payload.current.toString() },
          });
        }
        break;

      default:
        // IMPORTANT : 200 même si non géré
        break;
    }

    // 🔑 TOUJOURS 200 SI authenticate.webhook a réussi
    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("❌ Webhook rejeté (HMAC ou format invalide)");
    // 🔑 OBLIGATOIRE pour Shopify Partner checks
    return new Response("Invalid webhook", { status: 401 });
  }
};

export const loader = () => new Response(null, { status: 200 });
