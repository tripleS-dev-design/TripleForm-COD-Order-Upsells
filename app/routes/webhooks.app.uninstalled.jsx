import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  console.log('🔔 Webhook APP_UNINSTALLED reçu');
  
  try {
    // Valide automatiquement le HMAC
    const { topic, shop } = await authenticate.webhook(request);
    
    console.log(`✅ Webhook ${topic} pour ${shop} validé (HMAC OK)`);
    
    // Supprimer toutes les sessions pour ce shop
    const deleted = await db.session.deleteMany({
      where: { shop }
    });
    
    console.log(`🗑️ ${deleted.count} sessions supprimées pour ${shop}`);
    
    return new Response(null, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erreur webhook APP_UNINSTALLED:', error.message);
    // Shopify retry si on retourne une erreur, donc on retourne 200
    return new Response(null, { status: 200 });
  }
};

// Bloque les GET - les webhooks sont en POST
export const loader = () => {
  console.log('❌ GET reçu sur webhook APP_UNINSTALLED');
  return new Response("Webhook endpoint - POST only", { status: 404 });
};
