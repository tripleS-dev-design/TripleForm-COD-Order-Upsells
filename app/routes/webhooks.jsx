import { authenticate } from "../shopify.server";

// -- IMPORTANT : N'IMPORTE RIEN D'AUTRE (pas de db ici) --
// Toute la logique avec la base de données doit être À L'INTÉRIEUR de la fonction `action`.

export const action = async ({ request }) => {
  console.log('🔐 Réception d\'un webhook, début de la vérification HMAC...');

  try {
    // 1. CLONER LA REQUÊTE (CRITIQUE)
    const requestClone = request.clone();

    // 2. VALIDER LE HMAC
    const { topic, shop, payload } = await authenticate.webhook(requestClone);
    console.log(`✅ Webhook HMAC vérifié pour ${topic} depuis ${shop}`);

    // 3. IMPORTER db UNIQUEMENT ICI, À L'INTÉRIEUR DE LA FONCTION SERVEUR
    // Cela garantit qu'il ne sera jamais inclus dans le bundle client.
    const db = (await import("../db.server")).default;

    // 4. TRAITER CHAQUE TYPE DE WEBHOOK
    switch (topic) {
      case 'customers/data_request':
        console.log(`📋 Demande de données pour : ${payload.customer?.email}`);
        // Si tu stockes des données, tu devrais les rassembler ici.
        // Pour toi, un log suffit.
        break;

      case 'customers/redact':
        console.log(`🗑️  Demande de suppression client : ${payload.customer?.email}`);
        console.log(`   Commandes à supprimer : ${payload.orders_to_redact}`);
        // Si tu stockais des données client, tu devrais les supprimer de TA base ici.
        // Ex: await db.customerData.deleteMany({ where: { shop, customerId: payload.customer.id } });
        break;

      case 'shop/redact':
        console.log(`🏬 Demande de suppression BOUTIQUE pour : ${shop}`);
        // C'EST ICI QUE TU SUPPRIMES LES SESSIONS (comme pour app/uninstalled)
        // ⚠️ C'EST OBLIGATOIRE POUR PASSER LA REVUE.
        await db.session.deleteMany({
          where: { shop }
        });
        console.log(`   ➡️ Sessions de la boutique supprimées.`);
        break;

      case 'app/uninstalled':
        console.log(`🚨 App désinstallée de : ${shop}`);
        // Supprime aussi les sessions lors de la désinstallation
        await db.session.deleteMany({
          where: { shop }
        });
        break;

      case 'app/scopes_update':
        console.log(`🔄 Scopes mis à jour pour : ${shop}`);
        // Pas d'action nécessaire pour toi.
        break;

      default:
        console.warn(`⚠️  Topic non géré reçu : ${topic}`);
    }

    // 5. TOUJOURS RÉPONDRE 200
    return new Response(null, { status: 200 });

  } catch (error) {
    // 6. GESTION DES ERREURS
    console.error('❌ Échec du traitement du webhook :', error.message);
    const status = error.message.includes('HMAC') ? 401 : 500;
    return new Response(error.message, { status });
  }
};

// 7. BLOQUE LES REQUÊTES GET (optionnel mais recommandé)
export const loader = () => new Response("Méthode non autorisée", { status: 405 });
