// ===== File: app/routes/api.google.disconnect.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Helper robuste pour récupérer le shop
function getShopFromRequest(request, session, admin) {
  // 1. Depuis la session Shopify
  if (session?.shop) return session.shop;
  
  // 2. Depuis admin.rest.session
  if (admin?.rest?.session?.shop) return admin.rest.session.shop;
  
  // 3. Depuis les paramètres URL
  const url = new URL(request.url);
  const shopParam = url.searchParams.get("shop");
  if (shopParam) return shopParam;
  
  // 4. Depuis le referer (pour les app embedded Shopify)
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererShop = refererUrl.searchParams.get("shop");
      if (refererShop) return refererShop;
    } catch (e) {
      console.warn("[Google Disconnect] Impossible de parser le referer:", referer);
    }
  }
  
  return null;
}

export const action = async ({ request }) => {
  try {
    // Récupérer session et admin pour obtenir le shop de manière robuste
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);
    
    if (!shop) {
      console.error("[API Google Disconnect] Shop introuvable");
      return json({
        ok: false,
        error: "Shop introuvable. Veuillez rafraîchir la page."
      }, { status: 400 });
    }
    
    console.log(`[API Google Disconnect] Déconnexion pour ${shop}`);
    
    // Vérifier si des données existent avant de supprimer
    const existing = await prisma.shopGoogleSettings.findUnique({
      where: { shopDomain: shop },
    });
    
    let deletedCount = 0;
    if (existing) {
      await prisma.shopGoogleSettings.delete({
        where: { shopDomain: shop },
      });
      deletedCount = 1;
      console.log(`[API Google Disconnect] Compte Google supprimé pour ${shop}`);
    } else {
      console.log(`[API Google Disconnect] Aucun compte Google trouvé pour ${shop}`);
    }
    
    return json({
      ok: true,
      message: deletedCount > 0 
        ? "Compte Google déconnecté avec succès" 
        : "Aucun compte Google n'était connecté",
      count: deletedCount
    });
  } catch (error) {
    console.error("Google disconnect error:", error);
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2025') {
      // Record not found - ce n'est pas vraiment une erreur dans ce contexte
      return json({
        ok: true,
        message: "Aucune configuration Google trouvée à déconnecter",
        count: 0
      });
    }
    
    return json({
      ok: false,
      error: error.message || "Erreur lors de la déconnexion"
    }, { status: 500 });
  }
};