// ===== File: app/routes/api.save-sheets.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { saveSheetsConfigForShop } from "../services/google.server";

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
      console.warn("[Save Sheets] Impossible de parser le referer:", referer);
    }
  }
  
  return null;
}

export const action = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      console.error("[API Save Sheets] Shop introuvable");
      return json({ 
        ok: false, 
        error: "Shop introuvable. Veuillez rafraîchir la page." 
      }, { status: 400 });
    }

    console.log(`[API Save Sheets] Sauvegarde config pour ${shop}`);
    
    const body = await request.json().catch(() => ({}));
    const sheets = body?.sheets || {};

    // Validation basique
    if (!sheets || typeof sheets !== 'object') {
      return json({ 
        ok: false, 
        error: "Configuration invalide" 
      }, { status: 400 });
    }

    await saveSheetsConfigForShop(shop, sheets);

    console.log(`[API Save Sheets] Config sauvegardée pour ${shop}`);
    
    return json({ 
      ok: true,
      message: "Configuration sauvegardée avec succès"
    });
  } catch (e) {
    console.error("Erreur /api/save-sheets:", e);
    return json({ 
      ok: false, 
      error: String(e?.message || e) 
    }, { status: 500 });
  }
};