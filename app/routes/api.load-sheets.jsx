// ===== File: app/routes/api.load-sheets.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  ensureValidAccessToken,
  getSheetsConfigForShop,
} from "../services/google.server";

// Helper robuste pour récupérer le shop
function getShopFromRequest(request, session, admin) {
  // 1. Depuis la session
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
      console.warn("Impossible de parser le referer:", referer);
    }
  }
  
  return null;
}

export const loader = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      console.error("[API Load Sheets] Shop introuvable:", {
        sessionShop: session?.shop,
        adminShop: admin?.rest?.session?.shop,
        url: request.url
      });
      return json(
        { ok: false, error: "Shop introuvable. Veuillez rafraîchir la page." },
        { status: 400 }
      );
    }

    console.log(`[API Load Sheets] Shop identifié: ${shop}`);

    // 1️⃣ Token Google valide
    const accessToken = await ensureValidAccessToken(shop);

    // 2️⃣ Charger les Google Sheets via Google Drive API
    const driveRes = await fetch(
      "https://www.googleapis.com/drive/v3/files" +
        "?q=mimeType='application/vnd.google-apps.spreadsheet'" +
        "&fields=files(id,name)" +
        "&pageSize=1000",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const driveJson = await driveRes.json().catch(() => null);

    if (!driveRes.ok) {
      // Erreur spécifique pour les scopes manquants
      if (driveRes.status === 403 || driveRes.status === 401) {
        const errorMsg = driveJson?.error?.message || "Permissions Google insuffisantes";
        console.error("[API Load Sheets] Erreur Google API:", errorMsg);
        
        // Si c'est une erreur de scope, proposer de se reconnecter
        if (errorMsg.includes("insufficient authentication scopes") || 
            errorMsg.includes("Request had insufficient authentication scopes")) {
          return json({
            ok: false,
            error: "Permissions Google insuffisantes. Veuillez vous déconnecter et vous reconnecter à Google.",
            needsReauth: true
          }, { status: 403 });
        }
      }
      
      throw new Error(
        driveJson?.error?.message ||
        "Impossible de charger les Google Sheets"
      );
    }

    const spreadsheets =
      driveJson?.files?.map((f) => ({
        id: f.id,
        name: f.name,
      })) || [];

    console.log(`[API Load Sheets] ${spreadsheets.length} feuilles trouvées pour ${shop}`);

    // 3️⃣ Charger la config existante
    const cfg = await getSheetsConfigForShop(shop);

    return json({
      ok: true,
      spreadsheets,
      config: cfg || null,
    });
  } catch (e) {
    console.error("Erreur /api/load-sheets:", e);
    return json(
      {
        ok: false,
        error: String(e?.message || e),
      },
      { status: 500 }
    );
  }
};