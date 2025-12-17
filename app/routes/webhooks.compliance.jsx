// app/routes/webhooks.compliance.tsx ou .jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    // ✅ Vérifie la signature HMAC + parse le payload
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log("✅ Webhook conformité reçu :", topic, "pour", shop);

    // Exemple de routing par topic RGPD
    switch (topic) {
      case "customers/data_request": {
        console.log("📋 Demande de données client:", payload?.customer?.email);
        // Si tu stockes des données client, tu peux lancer un job pour les préparer
        break;
      }

      case "customers/redact": {
        console.log("🗑️ Demande de suppression client:", payload?.customer?.email);
        // Si tu as des données client dans ta DB, tu les supprimes ici
        break;
      }

      case "shop/redact": {
        console.log("🏬 Demande de suppression boutique:", shop);
        const dbModule = await import("../db.server");
        const db = dbModule.default || dbModule;

        await db.session.deleteMany({ where: { shop } });
        // Si tu as d'autres tables liées à la boutique, supprime-les aussi ici
        break;
      }

      default: {
        console.warn("⚠️ Topic conformité non géré:", topic);
      }
    }

    // ✅ HMAC VALIDE : on confirme à Shopify que tout va bien
    return json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur webhook conformité:", error);

    // ⚠️ HMAC INVALIDE (ou autre erreur dans authenticate.webhook) :
    // Shopify attend un 401 pour considérer que tu refuses les webhooks non signés correctement.
    return new Response("Invalid webhook signature", { status: 401 });
  }
};

export const loader = async ({ request }) => {
  // Shopify peut faire un HEAD ou GET pour vérifier l'URL
  if (request.method === "HEAD") {
    return new Response(null, { status: 200 });
  }

  // GET n'est pas utilisé pour les webhooks, mais ce n'est pas grave de renvoyer 200 simple.
  return json({ ok: true });
};