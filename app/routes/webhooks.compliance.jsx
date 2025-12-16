import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  // Vérifie la signature HMAC (comme dans l'ancienne app)
  const { topic, shop, body } = await authenticate.webhook(request);

  console.log("📦 Webhook conformité reçu :", topic, shop, body);

  // Réponse obligatoire 200 OK
  return json({ success: true });
};

export const loader = async () => {
  return json({ ok: true });
};
