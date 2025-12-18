import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { testSheetConnection } from "../services/google.server";

export const action = async ({ request }) => {
  const { shop } = await authenticate.admin(request);
  
  try {
    const body = await request.json();
    const { sheet, kind } = body;
    
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