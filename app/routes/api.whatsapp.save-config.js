// app/routes/api.whatsapp.save-config.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  console.log("📦 WhatsApp Save Config - Action appelée");
  
  try {
    // 1. Authentifier la requête
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    
    console.log("✅ WhatsApp Save Config - Authentifié pour:", shop);

    // 2. Analyser les données JSON entrantes
    const body = await request.json();
    console.log("📥 WhatsApp Save Config - Données reçues:", body);

    const { config, mode } = body;

    // 3. Valider les champs requis
    if (!config) {
      return json(
        { ok: false, error: "Les données de configuration sont requises" },
        { status: 400 }
      );
    }

    // 4. Préparer les données pour la base
    const configData = {
      // Données de base
      phoneNumber: config.phoneNumber || '',
      businessName: config.businessName || '',
      orderMessage: config.orderMessage || "✅ Commande #{orderId} confirmée! Livraison dans 2-3 jours. Merci!",
      sendAutomatically: config.sendAutomatically ?? true,
      
      // Mode et token
      useToken: config.useToken ?? false,
      permanentToken: config.permanentToken || ''
    };

    // 5. Sauvegarder dans la base de données
    const savedConfig = await prisma.whatsappConfig.upsert({
      where: { shopDomain: shop },
      update: { 
        ...configData,
        mode: mode || 'simple',
        updatedAt: new Date()
      },
      create: { 
        shopDomain: shop,
        ...configData,
        mode: mode || 'simple'
      }
    });

    console.log("💾 WhatsApp Save Config - Configuration sauvegardée pour", shop);
    console.log("📊 Données sauvegardées:", savedConfig);

    // 6. Retourner une réponse de succès
    return json({ 
      ok: true, 
      message: "Configuration WhatsApp sauvegardée avec succès",
      config: savedConfig 
    });

  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde de la config WhatsApp:", error);
    return json({ 
      ok: false, 
      error: error.message || "Échec de la sauvegarde de la configuration" 
    }, { status: 500 });
  }
};

// Fonction loader pour les requêtes GET (optionnelle)
export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;
    
    // Charger la configuration existante
    const existingConfig = await prisma.whatsappConfig.findUnique({
      where: { shopDomain: shop }
    });

    return json({ 
      ok: true, 
      config: existingConfig || {},
      shop: shop 
    });
    
  } catch (error) {
    console.error("❌ Erreur lors du chargement de la config WhatsApp:", error);
    return json({ 
      ok: false, 
      error: "Impossible de charger la configuration" 
    }, { status: 500 });
  }
}