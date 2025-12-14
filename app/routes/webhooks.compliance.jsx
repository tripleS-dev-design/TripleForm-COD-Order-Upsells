import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log(`✅ RGPD webhook ${topic} pour ${shop}`);

    // Shopify exige seulement que ça existe et réponde 200
    switch (topic) {
      case "customers/data_request":
        break;

      case "customers/redact":
        break;

      case "shop/redact":
        break;

      default:
        console.log("ℹ️ Topic ignoré:", topic);
    }

    // ⚠️ OBLIGATOIRE
    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("❌ RGPD webhook error:", error.message);
    return new Response("Unauthorized", { status: 401 });
  }
};

export const loader = () =>
  new Response("Method not allowed", { status: 405 });
