// ===== File: app/routes/api.google-sheets.test.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { testSheetConnection } from "../services/google.server";

// helper robuste pour récupérer le shop
function getShopFromRequest(request, session, admin) {
  return (
    session?.shop ||
    admin?.rest?.session?.shop ||
    new URL(request.url).searchParams.get("shop")
  );
}

export const action = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);
    
    if (!shop) {
      console.error("[API Test Sheets] Shop introuvable");
      return json({
        ok: false,
        error: "Shop introuvable. Veuillez rafraîchir la page."
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { sheet, kind } = body;
    
    if (!sheet?.spreadsheetId) {
      return json({
        ok: false,
        error: "Spreadsheet ID manquant"
      }, { status: 400 });
    }
    
    console.log(`[API Test Sheets] Test pour ${shop}, spreadsheet: ${sheet.spreadsheetId}`);
    
    const result = await testSheetConnection(shop, sheet);
    
    return json({
      ok: true,
      spreadsheetTitle: result.spreadsheetTitle,
      tabChecked: result.tabChecked
    });
  } catch (error) {
    console.error("Google Sheets test error:", error);
    return json({
      ok: false,
      error: error.message || "Erreur de connexion à Google Sheets"
    }, { status: 500 });
  }
};