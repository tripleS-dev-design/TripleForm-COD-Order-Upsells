// ===== File: app/routes/api.google.connect.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { buildGoogleAuthUrl } from "../services/google.server";

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
      console.warn("[Google Connect] Impossible de parser le referer:", referer);
    }
  }
  
  return null;
}

export const loader = async ({ request }) => {
  try {
    // 1. Authentifier avec Shopify
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      console.error("[API Google Connect] Shop introuvable:", {
        sessionShop: session?.shop,
        adminShop: admin?.rest?.session?.shop,
        url: request.url
      });
      
      return json({
        success: false,
        error: "Shop non trouvé dans la session",
        requiresReauth: true,
        message: "Veuillez rafraîchir la page et réessayer"
      }, { status: 401 });
    }

    // 2. Récupérer la cible
    const url = new URL(request.url);
    const target = url.searchParams.get("target") || "orders";

    // 3. Construire l'URL Google OAuth
    const authUrl = buildGoogleAuthUrl({ shop, target });

    console.log(`[API Google Connect] URL générée pour ${shop}, target: ${target}`);

    // 4. Retourner l'URL en JSON pour le frontend
    return json({
      success: true,
      url: authUrl,
      shop: shop
    });

  } catch (error) {
    console.error("Erreur dans api.google.connect:", error);
    
    // Si l'authentification Shopify échoue, retourner une erreur JSON
    return json({
      success: false,
      error: "Session Shopify expirée ou invalide",
      requiresReauth: true,
      message: "Veuillez rafraîchir la page et réessayer"
    }, { status: 401 });
  }
};