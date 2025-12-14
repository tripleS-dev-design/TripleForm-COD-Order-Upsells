import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  console.log('🔔 Webhook APP_SCOPES_UPDATE reçu');
  
  try {
    // Cette ligne valide automatiquement le HMAC
    const { topic, shop, session, payload } = await authenticate.webhook(request);
    
    console.log(`✅ Webhook ${topic} pour ${shop} validé`);
    console.log('📋 Nouvelles scopes:', payload.current);
    
    if (session) {
      // Mettre à jour les scopes dans la session
      await db.session.update({
        where: { id: session.id },
        data: { scope: payload.current.toString() }
      });
      console.log(`🔄 Scopes mises à jour pour ${shop}`);
    }
    
    return new Response(null, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erreur webhook APP_SCOPES_UPDATE:', error);
    return new Response(null, { status: 200 });
  }
};

// Bloque les GET accidentels
export const loader = () => {
  return new Response("Not found", { status: 404 });
};
