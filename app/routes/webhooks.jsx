// app/routes/webhooks.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // 1️⃣ Vérification HMAC automatique
    const result = await authenticate.webhook(request);
    
    const topic = result.topic;
    const shop = result.shop;
    const session = result.session;
    const payload = result.payload;

    console.log(`🔔 Webhook ${topic} reçu pour ${shop}`);

    // 2️⃣ Importer la DB (ton db.server.js est bon)
    const db = await import("../db.server");
    // Pas besoin de .default car tu exportes directement prisma

    // 3️⃣ Traiter les webhooks
    switch (topic) {
      // Webhooks de conformité RGPD
      case "customers/data_request":
        console.log(`📋 Demande de données client: ${payload?.customer?.email}`);
        // Tu n'as pas de données à fournir
        break;

      case "customers/redact":
        console.log(`🗑️ Suppression client: ${payload?.customer?.email}`);
        // Tu n'as pas de données à supprimer
        break;

      case "shop/redact":
        console.log(`🏬 Suppression boutique: ${shop}`);
        await db.default.session.deleteMany({ where: { shop } });
        console.log("✅ Sessions supprimées");
        break;

      // Webhooks d'application
      case "app/uninstalled":
        console.log(`🚨 App désinstallée de: ${shop}`);
        await db.default.session.deleteMany({ where: { shop } });
        console.log("✅ Sessions supprimées");
        break;

      case "app/scopes_update":
        console.log(`🔄 Scopes mis à jour pour: ${shop}`);
        if (session && payload?.current) {
          await db.default.session.update({
            where: { id: session.id },
            data: { scope: payload.current.toString() }
          });
          console.log("✅ Scopes mis à jour");
        }
        break;

      default:
        console.warn(`⚠️ Topic non géré: ${topic}`);
    }

    // 4️⃣ TOUJOURS répondre 200
    return new Response(null, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur webhook:", error.message);
    const status = error.message.includes("HMAC") ? 401 : 500;
    return new Response(error.message, { status });
  }
};

// Gestion HEAD/GET
export const loader = ({ request }) => {
  if (request.method === "HEAD") {
    return new Response(null, { status: 200 });
  }
  return new Response("Méthode non autorisée", { status: 405 });
};
