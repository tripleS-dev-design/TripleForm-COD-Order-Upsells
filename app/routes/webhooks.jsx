// app/routes/webhooks.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // 1️⃣ Vérification automatique du HMAC par Shopify
    const result = await authenticate.webhook(request);
    
    const topic = result.topic;
    const shop = result.shop;
    const session = result.session;
    const payload = result.payload;

    console.log(`🔔 Webhook reçu : ${topic} pour ${shop}`);

    // 2️⃣ Importer la base de données (uniquement côté serveur)
    const dbModule = await import("../db.server");
    const db = dbModule.default || dbModule;

    // 3️⃣ Traiter chaque type de webhook
    switch (topic) {
      // ========== WEBHOOKS DE CONFORMITÉ (RGPD) ==========
      case "customers/data_request":
        console.log(`📋 Demande de données pour : ${payload?.customer?.email}`);
        // Ici, tu dois compiler les données que tu as sur ce client
        // et les envoyer à payload.data_request?.contact_email
        break;

      case "customers/redact":
        if (payload?.customer?.id) {
          // Supprime les données client si tu en stockes
          await db.customerData?.deleteMany({
            where: {
              shop: shop,
              customerId: payload.customer.id.toString()
            }
          });
          console.log(`✅ Données client supprimées pour ${shop}`);
        }
        break;

      case "shop/redact":
        // Supprime TOUTES les données de cette boutique
        await db.session.deleteMany({ where: { shop } });
        await db.customerData?.deleteMany({ where: { shop } });
        console.log(`✅ Toutes les données supprimées pour la boutique ${shop}`);
        break;

      // ========== WEBHOOKS D'APPLICATION ==========
      case "app/uninstalled":
        await db.session.deleteMany({ where: { shop } });
        await db.customerData?.deleteMany({ where: { shop } });
        console.log(`🚨 App désinstallée - données nettoyées pour ${shop}`);
        break;

      case "app/scopes_update":
        console.log(`🔄 Scopes mis à jour pour ${shop} :`, payload?.current);
        if (session && payload?.current) {
          await db.session.update({
            where: { id: session.id },
            data: { scope: payload.current.toString() }
          });
          console.log(`✅ Scopes mis à jour en base pour ${shop}`);
        }
        break;

      default:
        console.warn(`⚠️ Topic non géré : ${topic}`);
    }

    // 4️⃣ TOUJOURS répondre 200 OK
    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur webhook :", error.message);
    // 401 si HMAC invalide, 500 pour les autres erreurs
    const status = error.message.includes("HMAC") ? 401 : 500;
    return new Response(error.message, { status });
  }
};

// 5️⃣ Gestion des requêtes HEAD/GET
export const loader = ({ request }) => {
  // Shopify teste d'abord avec HEAD, il faut répondre 200
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, { status: 200 });
  }
  
  // Pour les GET, retourner 405
  return new Response(
    JSON.stringify({ 
      error: "Méthode non autorisée. Utilisez POST.",
      success: false 
    }), 
    { 
      status: 405,
      headers: { 
        'Content-Type': 'application/json',
        'Allow': 'POST, HEAD'
      }
    }
  );
};
