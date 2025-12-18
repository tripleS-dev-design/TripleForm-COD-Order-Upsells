import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ensureValidAccessToken } from "../services/google.server";

// Helper pour obtenir le shop
function getShopFromRequest(request, session, admin) {
  return (
    session?.shop ||
    admin?.rest?.session?.shop ||
    new URL(request.url).searchParams.get("shop")
  );
}

export const loader = async ({ request }) => {
  try {
    console.log("[API Google Sheets Tabs] Début de la requête");
    
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      console.error("[API Google Sheets Tabs] Shop introuvable");
      return json({ ok: false, error: "Shop introuvable" }, { status: 400 });
    }

    const url = new URL(request.url);
    const spreadsheetId = url.searchParams.get("spreadsheetId");

    console.log("[API Google Sheets Tabs] Paramètres:", {
      shop,
      spreadsheetId
    });

    if (!spreadsheetId) {
      return json({ ok: false, error: "Spreadsheet ID manquant" }, { status: 400 });
    }

    // 1. Obtenir un token Google valide
    console.log("[API Google Sheets Tabs] Obtention du token pour shop:", shop);
    const accessToken = await ensureValidAccessToken(shop);

    if (!accessToken) {
      console.error("[API Google Sheets Tabs] Token non disponible pour shop:", shop);
      return json({ 
        ok: false, 
        error: "Token Google non disponible. Vérifiez que vous êtes connecté à Google." 
      }, { status: 401 });
    }

    // 2. Récupérer les onglets du spreadsheet via Google Sheets API
    console.log("[API Google Sheets Tabs] Appel Google Sheets API pour spreadsheet:", spreadsheetId);
    const sheetsRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const sheetsData = await sheetsRes.json().catch(() => null);

    if (!sheetsRes.ok) {
      console.error("[API Google Sheets Tabs] Erreur Google Sheets API:", sheetsData);
      return json({
        ok: false,
        error: sheetsData?.error?.message || "Impossible de charger les onglets du Google Sheet"
      }, { status: 500 });
    }

    // 3. Formater les onglets
    const tabs = (sheetsData.sheets || []).map(sheet => ({
      name: sheet.properties.title,
      index: sheet.properties.index
    }));

    console.log("[API Google Sheets Tabs] Succès - onglets trouvés:", tabs.length);

    return json({
      ok: true,
      tabs,
      spreadsheetId
    });

  } catch (error) {
    console.error("[API Google Sheets Tabs] Erreur générale:", error);
    return json(
      { 
        ok: false, 
        error: error.message || "Erreur interne lors du chargement des onglets" 
      },
      { status: 500 }
    );
  }
};