// ===== File: app/utils/googleSheets.server.js =====
import {
  getSheetsConfigForShop,
  ensureValidAccessToken,
  testSheetConnection,
} from "../services/google.server";

/**
 * Colonnes par défaut si l’utilisateur n’a encore rien configuré
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
 * Transforme un appField en vraie valeur à partir de l’objet order
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
/* Append d’une commande vers Google Sheets (production OAuth)        */
/* ------------------------------------------------------------------ */

export async function appendOrderToSheet({ shop, admin, order }) {
  if (!shop) throw new Error("Missing shop");
  if (!order) throw new Error("Missing order payload");

  // 1) lire la config depuis la DB
  let cfg = await getSheetsConfigForShop(shop);
  if (!cfg) cfg = {};

  const columnsRaw =
    cfg && Array.isArray(cfg.columns) && cfg.columns.length
      ? cfg.columns
      : DEFAULT_COLUMNS;

  const columns = [...columnsRaw].sort((a, b) => (a.idx || 0) - (b.idx || 0));

  // 2) construire la ligne
  const row = columns.map((col) => {
    const val = resolveAppField(order, col.appField || "");
    return val == null ? "" : String(val);
  });

  // 3) choisir la feuille
  const fallbackSheetId = process.env.GOOGLE_SHEET_ID || "";
  const spreadsheetId =
    cfg.sheet?.spreadsheetId || fallbackSheetId;

  if (!spreadsheetId) {
    throw new Error(
      "Aucun Spreadsheet ID configuré (cfg.sheet.spreadsheetId ou GOOGLE_SHEET_ID)."
    );
  }

  const tabName = cfg.sheet?.tabName || "Orders";
  const range = `${tabName}!A:Z`;

  // 4) access token Google OAuth
  const settings = await ensureValidAccessToken(shop);
  const accessToken = settings.accessToken;
  if (!accessToken) {
    throw new Error("Aucun access token Google valide pour cette boutique.");
  }

  const params = new URLSearchParams({
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
  });

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${encodeURIComponent(range)}:append?${params.toString()}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || json?.error || "Erreur Google Sheets (append)";
    throw new Error(msg);
  }

  return true;
}
