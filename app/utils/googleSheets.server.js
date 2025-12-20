// ===== File: app/utils/googleSheets.server.js =====
import prisma from '../db.server';
import { google } from 'googleapis';

/**
 * Rafraîchit un token Google expiré
 */
async function refreshGoogleToken(refreshToken) {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || refreshToken,
      expiry_date: credentials.expiry_date,
    };
  } catch (error) {
    console.error('Erreur refreshGoogleToken:', error);
    throw new Error(`Impossible de rafraîchir le token Google: ${error.message}`);
  }
}

/**
 * Récupère un token Google valide pour une boutique
 */
async function getValidAccessTokenForShop(shop) {
  console.log(`[GoogleSheets] Récupération token pour shop: ${shop}`);
  
  const shopSettings = await prisma.shopGoogleSettings.findUnique({
    where: { shopDomain: shop },
  });

  if (!shopSettings) {
    throw new Error('Aucun access token Google valide pour cette boutique (Google non connecté ?)');
  }

  // CORRECTION CRITIQUE : Vérifier d'abord les nouveaux champs, puis les anciens
  let accessToken = shopSettings.googleAccessToken;
  let refreshToken = shopSettings.googleRefreshToken;
  let expiryDate = shopSettings.googleTokenExpiry;

  // Si les nouveaux champs sont vides mais les anciens existent
  if (!accessToken && shopSettings.accessToken) {
    console.log(`[GoogleSheets] Migration des anciens tokens vers les nouveaux champs pour ${shop}`);
    
    accessToken = shopSettings.accessToken;
    refreshToken = shopSettings.refreshToken;
    expiryDate = shopSettings.tokenExpiryDate;

    // Migrer automatiquement vers les nouveaux champs
    await prisma.shopGoogleSettings.update({
      where: { shopDomain: shop },
      data: {
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        googleTokenExpiry: expiryDate,
      },
    });
  }

  if (!accessToken) {
    throw new Error('Aucun access token Google valide pour cette boutique (Google non connecté ?)');
  }

  const now = new Date();
  const expiry = expiryDate ? new Date(expiryDate) : null;
  
  if (expiry && expiry < now) {
    console.log(`[GoogleSheets] Token expiré pour ${shop}, rafraîchissement...`);
    
    if (!refreshToken) {
      throw new Error('Token expiré et aucun refresh token disponible');
    }

    const newTokens = await refreshGoogleToken(refreshToken);
    
    await prisma.shopGoogleSettings.update({
      where: { shopDomain: shop },
      data: {
        googleAccessToken: newTokens.access_token,
        googleRefreshToken: newTokens.refresh_token,
        googleTokenExpiry: new Date(newTokens.expiry_date),
      },
    });

    return newTokens.access_token;
  }

  return accessToken;
}

/**
 * Récupère la configuration Sheets pour une boutique
 */
async function getSheetsConfigForShop(shop) {
  const shopSettings = await prisma.shopGoogleSettings.findUnique({
    where: { shopDomain: shop },
  });

  if (!shopSettings) {
    return null;
  }

  // CORRECTION : Utiliser spreadsheetId si disponible, sinon chercher dans sheetsConfigJson
  let spreadsheetId = shopSettings.spreadsheetId;
  let sheetName = shopSettings.sheetName || 'Orders';
  let columns = shopSettings.columns ? JSON.parse(shopSettings.columns) : [];

  // Si pas de spreadsheetId dans les nouveaux champs, essayer de le trouver dans sheetsConfigJson
  if (!spreadsheetId && shopSettings.sheetsConfigJson) {
    try {
      const configJson = JSON.parse(shopSettings.sheetsConfigJson);
      if (configJson?.sheet?.spreadsheetId) {
        spreadsheetId = configJson.sheet.spreadsheetId;
        sheetName = configJson.sheet.tabName || sheetName;
      }
      if (configJson?.columns) {
        columns = configJson.columns;
      }
    } catch (error) {
      console.error('Erreur parsing sheetsConfigJson:', error);
    }
  }

  return {
    sheet: {
      spreadsheetId: spreadsheetId,
      tabName: sheetName
    },
    columns: columns
  };
}

/**
 * Teste la connexion à Google Sheets
 */
async function testSheetConnection(shop, sheetConfig) {
  try {
    const accessToken = await getValidAccessTokenForShop(shop);
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = sheetConfig?.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Aucun spreadsheetId fourni');
    }

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title,sheets.properties.title',
    });

    return {
      success: true,
      spreadsheetTitle: response.data.properties.title,
      sheets: response.data.sheets.map(s => s.properties.title)
    };
  } catch (error) {
    console.error('Erreur testSheetConnection:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Colonnes par défaut
 */
const DEFAULT_COLUMNS = [
  {
    id: "c1",
    idx: 1,
    header: "Order date",
    type: "datetime",
    appField: "order.date",
  },
  {
    id: "c2",
    idx: 2,
    header: "Order ID",
    type: "string",
    appField: "order.id",
  },
  {
    id: "c3",
    idx: 3,
    header: "Nom complet",
    type: "string",
    appField: "customer.name",
  },
  {
    id: "c4",
    idx: 4,
    header: "Téléphone",
    type: "phone",
    appField: "customer.phone",
  },
  {
    id: "c5",
    idx: 5,
    header: "Total commande",
    type: "currency",
    appField: "cart.totalWithShipping",
  },
  {
    id: "c6",
    idx: 6,
    header: "Ville",
    type: "string",
    appField: "customer.city",
  },
];

function getDeep(obj, path) {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

/**
 * Transforme un appField en vraie valeur
 */
function resolveAppField(order, appField) {
  const o = order || {};
  const customer = o.customer || {};
  const cart = o.cart || {};
  const ord = o.order || {};

  switch (appField) {
    case "order.date":
      return o.createdAt || ord.createdAt || "";
    case "order.id":
      return ord.id || "";
    case "order.name":
      return ord.name || "";

    case "customer.name":
      return customer.name || "";
    case "customer.phone":
      return customer.phone || "";
    case "customer.city":
      return customer.city || "";
    case "customer.province":
      return customer.province || "";
    case "customer.country":
      return customer.country || "";
    case "customer.address":
      return customer.address || "";
    case "customer.notes":
      return customer.notes || "";

    case "cart.quantity":
      return cart.quantity ?? "";
    case "cart.productTitle":
      return cart.productTitle || "";
    case "cart.variantTitle":
      return cart.variantTitle || "";
    case "cart.offerName":
      return cart.offerName || "";
    case "cart.upsellName":
      return cart.upsellName || "";

    case "cart.subtotal":
      return cart.subtotal ?? "";
    case "cart.shipping":
      return cart.shipping ?? "";

    case "cart.total":
    case "cart.totalWithShipping": {
      if (cart.total != null) {
        const cur = cart.currency || "";
        return `${cart.total} ${cur}`.trim();
      }
      if (cart.totalCents != null) {
        const cur = cart.currency || "";
        return `${cart.totalCents / 100} ${cur}`.trim();
      }
      return "";
    }

    case "cart.currency":
      return cart.currency || "";

    default:
      return getDeep(o, appField) ?? "";
  }
}

/* ------------------------------------------------------------------ */
/* Test Google Sheets (bouton "Tester la connexion")                  */
/* ------------------------------------------------------------------ */

export async function testGoogleSheetsConnection({ shop, sheet, kind = "orders" }) {
  const effectiveSheet = sheet || {};
  return testSheetConnection(shop, effectiveSheet);
}

/* ------------------------------------------------------------------ */
/* Append d'une commande vers Google Sheets (App Proxy compatible)    */
/* ------------------------------------------------------------------ */

export async function appendOrderToSheet({ shop, order }) {
  console.log(`[GoogleSheets] appendOrderToSheet pour shop: ${shop}`);
  
  if (!shop) throw new Error("Missing shop");
  if (!order) throw new Error("Missing order payload");

  // 1) Récupérer la configuration
  let cfg = await getSheetsConfigForShop(shop);
  
  if (!cfg || !cfg.sheet || !cfg.sheet.spreadsheetId) {
    throw new Error("Aucune configuration Google Sheets trouvée pour cette boutique");
  }

  const columnsRaw = cfg && Array.isArray(cfg.columns) && cfg.columns.length
    ? cfg.columns
    : DEFAULT_COLUMNS;

  const columns = [...columnsRaw].sort(
    (a, b) => (a.idx || 0) - (b.idx || 0)
  );

  // 2) Construire la ligne
  const row = columns.map((col) => {
    const val = resolveAppField(order, col.appField || "");
    return val == null ? "" : String(val);
  });

  // 3) Récupérer les IDs de feuille
  const spreadsheetId = cfg.sheet.spreadsheetId;
  const tabName = cfg.sheet.tabName || "Orders";
  const range = `${tabName}!A:Z`;

  // 4) Récupérer le token Google VALIDE
  const accessToken = await getValidAccessTokenForShop(shop);

  // 5) Utiliser directement googleapis pour l'appel API
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    console.log(`[GoogleSheets] Commande ajoutée avec succès à ${spreadsheetId}, onglet ${tabName}`);
    console.log(`[GoogleSheets] Cellules mises à jour: ${response.data.updates?.updatedRange || 'N/A'}`);
    
    return true;
  } catch (error) {
    console.error('Erreur Google Sheets API:', error.message);
    
    if (error.code === 401 || error.message.includes('invalid_grant')) {
      throw new Error('Token Google invalide ou expiré. Reconnectez Google dans l\'admin de l\'app.');
    }
    
    if (error.code === 403) {
      throw new Error('Permission refusée. Vérifiez que le compte Google a bien accès à cette feuille.');
    }
    
    throw new Error(`Erreur Google Sheets: ${error.message}`);
  }
}