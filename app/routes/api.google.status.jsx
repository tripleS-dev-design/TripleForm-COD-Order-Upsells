// ===== File: app/routes/api.google.status.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getGoogleStatusForShop } from "../services/google.server";

// helper robuste pour récupérer le shop
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
      console.warn("[Google Status] Impossible de parser le referer:", referer);
    }
  }
  
  return null;
}

export const loader = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      console.error("[API Google Status] Shop introuvable:", {
        sessionShop: session?.shop,
        adminShop: admin?.rest?.session?.shop,
        url: request.url
      });
      
      return json({
        ok: false,
        connected: false,
        error: "Shop introuvable. Veuillez rafraîchir la page.",
        accountEmail: null,
        mainSheetName: null,
        abandonedSheetName: null,
      }, { status: 400 });
    }

    console.log(`[API Google Status] Shop identifié: ${shop}`);

    const status = await getGoogleStatusForShop(shop);

    return json({
      ok: true,
      ...status,
    });
  } catch (e) {
    console.error("Erreur /api/google/status:", e);
    return json(
      {
        ok: false,
        connected: false,
        error: String(e?.message || e),
        accountEmail: null,
        mainSheetName: null,
        abandonedSheetName: null,
      },
      { status: 500 }
    );
  }
};