import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  try {
    const { shop, session, topic } = await authenticate.webhook(request);
    console.log(`✅ Received ${topic} webhook for ${shop}`);

    if (session) {
      await db.session.deleteMany({ where: { shop } });
    }
  } catch (error) {
    // Accepte les requêtes de test Shopify
    console.log("🟡 Test uninstalled webhook received");
    // Retourner 200 quand même
  }

  return new Response();
};