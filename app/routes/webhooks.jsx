import { authenticate } from "../shopify.server";
import db from "../db.server"; // Ton client Prisma

export const action = async ({ request }) => {
  console.log('🔐 Réception d\'un webhook, début de la vérification HMAC...');

  try {
    // 1. CLONER LA REQUÊTE AVANT TOUTE UTILISATION (CRITIQUE)
    // Le corps de la requête originale ne peut être lu qu'une seule fois.
    // `authenticate.webhook()` a besoin d'un flux "frais" pour valider le HMAC.
    const requestClone = request.clone();

    // 2. VALIDER LE HMAC DU WEBHOOK AVEC LA REQUÊTE CLONÉE
    // Cette fonction lance une erreur si le HMAC est invalide.
    const { topic, shop, session, payload } = await authenticate.webhook(requestClone);
    console.log(`✅ Webhook HMAC vérifié pour ${topic} depuis ${shop}`);

    // 3. TRAITER LE TYPE DE WEBHOOK SPÉCIFIQUE
    switch (topic) {
      case 'customers/data_request':
        console.log(`📋 Demande de données pour le client : ${payload.customer?.email}`);
        // Si tu stockes des données client, compile-les et fournis-les ici.
        // Comme tu n'en stockes pas, un log est suffisant.
        break;

      case 'customers/redact':
        console.log(`🗑️  Demande de suppression pour le client : ${payload.customer?.email}`);
        console.log(`   Commandes à supprimer : ${payload.orders_to_redact}`);
        // Si tu avais stocké des données, supprime ou anonymise-les ici.
        break;

      case 'shop/redact':
        console.log(`🏬 Demande de suppression de boutique pour : ${shop}`);
        // Supprime TOUTES les données associées à ce `shop_id` de ta base de données.
        // Exemple : await db.session.deleteMany({ where: { shop } });
        // Note : Shopify envoie ce webhook 48h après la désinstallation de l'app.
        break;

      default:
        console.warn(`⚠️  Topic non géré reçu : ${topic}`);
    }

    // 4. RÉPONDRE 200 POUR ACCUSER RÉCEPTION
    return new Response(null, { status: 200 });

  } catch (error) {
    // 5. GÉRER LES ERREURS HMAC OU AUTRES
    console.error('❌ Échec du traitement du webhook :', error.message);
    // Retourne 401 pour un HMAC invalide, 500 pour les autres erreurs.
    const status = error.message.includes('HMAC') ? 401 : 500;
    return new Response(error.message, { status });
  }
};

// Optionnel : Bloquer les requêtes GET sur ce point d'entrée
export const loader = () => new Response(null, { status: 405 });
