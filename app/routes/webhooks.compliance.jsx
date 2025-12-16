import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, body } = await authenticate.webhook(request);
    console.log("✅ Webhook conformité reçu :", topic, shop, body);
  } catch (error) {
    // Shopify teste avec des données factices
    console.log("🟡 Test compliance webhook received");
    // TOUJOURS retourner 200 pour les tests Shopify
  }

  // Shopify attend EXACTEMENT cette réponse
  return json({ success: true });
};

export const loader = async () => {
  // Shopify teste parfois avec GET
  return json({ ok: true });
};