import { authenticate } from "../shopify.server";
import db from "../db.server";
// Si tu as un modèle pour le billing, sinon enlève cette ligne
// import { setBillingInactive } from "../models/shop.server.js";

export const action = async ({ request }) => {
  console.log('🔔 Webhook APP_UNINSTALLED reçu');
  
  try {
    // Cette ligne valide automatiquement le HMAC
    const { topic, shop } = await authenticate.webhook(request);
    
    console.log(`✅ Webhook ${topic} pour ${shop} validé`);
    
    // 1. Supprimer les sessions pour ce shop
    await db.session.deleteMany({
      where: { shop }
    });
    
    console.log(`🗑️ Sessions supprimées pour ${shop}`);
    
    // 2. Si tu as un système de billing, le désactiver
    // await setBillingInactive(shop);
    
    // 3. Optionnel: Supprimer d'autres données liées à ce shop
    // (Si tu as d'autres tables dans ta base de données)
    
    return new Response(null, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erreur webhook APP_UNINSTALLED:', error);
    // Toujours retourner 200 pour éviter les retries de Shopify
    return new Response(null, { status: 200 });
  }
};

// Bloque les GET accidentels
export const loader = () => {
  return new Response("Not found", { status: 404 });
};
