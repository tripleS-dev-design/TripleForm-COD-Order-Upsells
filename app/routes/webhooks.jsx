import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // 1️⃣ Cloner la requête
    const requestClone = request.clone();

    // 2️⃣ Vérifier HMAC
    const result = await authenticate.webhook(requestClone);

    // 3️⃣ Déstructurer avec sécurité
    const topic = result.topic;
    const shop = result.shop;
    const session = result.session;
    const payload = result.payload;

    console.log(`✅ Webhook ${topic} reçu pour ${shop}`);

    // 4️⃣ Importer db uniquement côté serveur
    const db = (await import("../db.server")).default;

    // 5️⃣ Traiter les webhooks
    switch (topic) {
      case "customers/data_request":
        console.log(`📋 Demande de données pour : ${payload?.customer?.email}`);
        break;

      case "customers/redact":
        if (payload?.customer?.id) {
          await db.customerData.deleteMany({
            where: { shop, customerId: payload.customer.id.toString() },
          });
          console.log(`✅ Données client supprimées pour ${shop}`);
        }
        break;

      case "shop/redact":
        await db.session.deleteMany({ where: { shop } });
        await db.customerData.deleteMany({ where: { shop } });
        console.log(`✅ Données de la boutique supprimées pour ${shop}`);
        break;

      case "app/uninstalled":
        await db.session.deleteMany({ where: { shop } });
        await db.customerData.deleteMany({ where: { shop } });
        console.log(`✅ Données nettoyées après désinstallation`);
        break;

      case "app/scopes_update":
        if (session && payload?.current) {
          await db.session.update({
            where: { id: session.id },
            data: { scope: payload.current.toString() },
          });
          console.log(`✅ Scopes mis à jour pour ${shop}`);
        }
        break;

      default:
        console.warn(`⚠️ Topic non géré : ${topic}`);
    }

    // 6️⃣ Réponse obligatoire
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("❌ Erreur webhook :", err);
    return new Response(err.message, { status: 500 });
  }
};

// Bloquer les GET
export const loader = () => new Response("Méthode non autorisée", { status: 405 });
