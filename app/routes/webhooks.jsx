import { authenticate } from "../shopify.server";

// -- IMPORTANT : N'IMPORTE RIEN D'AUTRE (pas de db ici) --
// Toute la logique avec la base de données doit être À L'INTÉRIEUR de la fonction `action`.

export const action = async ({ request }) => {
  console.log('🔐 Réception d\'un webhook, début de la vérification HMAC...');

  try {
    // 1. CLONER LA REQUÊTE (CRITIQUE)
    // Le corps de la requête ne peut être lu qu'une fois
    const requestClone = request.clone();

    // 2. VALIDER LE HMAC
    const { topic, shop, session, payload } = await authenticate.webhook(requestClone);
    console.log(`✅ Webhook HMAC vérifié pour ${topic} depuis ${shop}`);

    // 3. IMPORTER db UNIQUEMENT ICI, À L'INTÉRIEUR DE LA FONCTION SERVEUR
    // Cela garantit qu'il ne sera jamais inclus dans le bundle client.
    const db = (await import("../db.server")).default;

    // 4. TRAITER CHAQUE TYPE DE WEBHOOK
    switch (topic) {
      case 'customers/data_request':
        console.log(`📋 Demande de données pour : ${payload.customer?.email || 'ID: ' + payload.customer?.id}`);
        console.log('📦 Données à fournir :', payload);
        // Ici, tu devrais compiler et envoyer les données client que tu stockes
        // à l'adresse email spécifiée dans payload.data_request.contact_email
        break;

      case 'customers/redact':
        console.log(`🗑️  Demande de suppression client : ${payload.customer?.email || 'ID: ' + payload.customer?.id}`);
        console.log(`📝 Commandes à supprimer : ${payload.orders_to_redact?.join(', ') || 'aucune'}`);
        
        // Supprime les données client de TA base de données
        if (payload.customer?.id) {
          await db.customerData.deleteMany({
            where: { 
              shop: shop,
              customerId: payload.customer.id.toString()
            }
          });
          console.log(`✅ Données client supprimées pour ${shop}`);
        }
        break;

      case 'shop/redact':
        console.log(`🏬 Demande de suppression BOUTIQUE pour : ${shop}`);
        console.log(`📅 Date d'effet : ${payload.shop_domain} le ${payload.shop_redact?.effective_date}`);
        
        // SUPPRIME TOUTES LES DONNÉES ASSOCIÉES À CETTE BOUTIQUE
        // ⚠️ OBLIGATOIRE POUR PASSER LA REVUE SHOPIFY
        
        // 1. Supprime les sessions
        await db.session.deleteMany({ where: { shop } });
        console.log(`   ➡️ Sessions supprimées`);
        
        // 2. Supprime les données client stockées
        await db.customerData.deleteMany({ where: { shop } });
        console.log(`   ➡️ Données client supprimées`);
        
        // 3. Supprime toute autre donnée liée à cette boutique
        // await db.otherTable.deleteMany({ where: { shop } });
        
        break;

      case 'app/uninstalled':
        console.log(`🚨 App désinstallée de : ${shop}`);
        // Nettoie immédiatement les données
        await db.session.deleteMany({ where: { shop } });
        await db.customerData.deleteMany({ where: { shop } });
        console.log(`✅ Données nettoyées après désinstallation`);
        break;

      case 'app/scopes_update':
        console.log(`🔄 Scopes mis à jour pour : ${shop}`);
        console.log(`📋 Nouveaux scopes : ${payload.authorization_scope?.join(', ')}`);
        // Met à jour les scopes dans ta base de données si nécessaire
        // await db.shop.update({ where: { shop }, data: { scopes: payload.authorization_scope } });
        break;

      default:
        console.warn(`⚠️  Topic non géré reçu : ${topic}`, payload);
    }

    // 5. TOUJOURS RÉPONDRE 200 OK
    return new Response(null, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // 6. GESTION DES ERREURS
    console.error('❌ Échec du traitement du webhook :', error.message);
    
    // Log détaillé pour le débogage
    console.error('📋 Détails de l\'erreur:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Retourne 401 pour HMAC invalide, 500 pour les autres erreurs
    const status = error.message.includes('HMAC') ? 401 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// 7. BLOQUE LES REQUÊTES GET (recommandé pour la sécurité)
export const loader = () => {
  return new Response(
    JSON.stringify({ 
      error: 'Méthode non autorisée. Utilisez POST.',
      success: false 
    }), 
    { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    }
  );
};
