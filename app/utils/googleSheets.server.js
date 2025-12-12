// ===== File: app/services/google.server.js =====
// Services Google pour l'app TripleForm
// Contient : getSheetsConfigForShop, ensureValidAccessToken, testSheetConnection,
// et helpers pour gérer tokens Google OAuth (refresh).

/**
 * PRINCIPES
 * - Ce fichier évite d'ajouter googleapis pour rester léger et reproductible sur Render.
 * - Il utilise fetch pour appeler l'endpoint OAuth2 (token refresh) et l'API Google Sheets.
 * - Remplace les portions marquées TODO par tes accès DB (Prisma / knex / autre).
 *
 * Exports attendus par l'app :
 * - getSheetsConfigForShop(shop) => retourne la config google sheets pour la boutique (ou null)
 * - ensureValidAccessToken(shop) => retourne { accessToken, refreshToken?, expiresAt? } ou lève
 * - testSheetConnection(shop, sheet) => vérifie si on peut lire le spreadsheet
 *
 * NOTE sur environnements Render: si GOOGLE_PRIVATE_KEY contient des \n littéraux,
 * fais .replace(/\\n/g, "\n") avant de l'utiliser.
 */

///// Helpers /////
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * readEnv: lecture d'une variable d'environnement avec fallback
 */
function readEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

/**
 * nowSec: temps courant en secondes unix
 */
function nowSec() {
  return Math.floor(Date.now() / 1000);
}

/* ------------------------------------------------------------------ */
/* DB / persistence helpers (TO ADAPT)                                 */
/* ------------------------------------------------------------------ */
/**
 * getShopRow(shop)
 * - shop : peut être shop domain string ou un objet shop
 * Retourne un objet représentant la ligne de shop dans ta DB contenant les tokens Google si disponibles.
 *
 * TODO: remplacer par ta logique DB (Prisma / knex / sequelize)
 */
async function getShopRow(shop) {
  // Exemple d'usage :
  // if (typeof shop === "string") {
  //   return await prisma.shop.findUnique({ where: { domain: shop } });
  // }
  // return shop; // si on passe déjà un objet 'shop' depuis d'autres fonctions

  // Par défaut, renvoie null (aucune config)
  return null;
}

/**
 * saveShopGoogleTokens(shop, { accessToken, refreshToken, expiresAt })
 * - TODO: écrire dans ta DB les tokens google pour la boutique
 */
async function saveShopGoogleTokens(shop, { accessToken, refreshToken, expiresAt }) {
  // TODO: persister tokens dans ta DB (par ex. prisma.shop.update)
  // Example (pseudo):
  // await prisma.shop.update({ where: { domain: shopDomain }, data: { googleAccessToken: accessToken, googleRefreshToken: refreshToken, googleTokenExpiresAt: expiresAt }});
  return true;
}

/* ------------------------------------------------------------------ */
/* getSheetsConfigForShop                                              */
/* ------------------------------------------------------------------ */
/**
 * Retourne la configuration Google Sheets rattachée à une boutique.
 * Format attendu (exemple) :
 * {
 *   sheet: { spreadsheetId: "xxx", tabName: "Orders" },
 *   columns: [ { id, idx, header, appField, type }, ... ]
 * }
 *
 * TODO: remplacer la lecture par ta DB réelle.
 */
export async function getSheetsConfigForShop(shop) {
  // Si 'shop' est un objet contenant la config, retourne-la directement
  if (shop && typeof shop === "object" && shop.googleSheetsConfig) {
    return shop.googleSheetsConfig;
  }

  // Sinon, tente de lire depuis la DB (adapter getShopRow)
  const row = await getShopRow(shop);
  if (!row) return null;

  // Adapter en fonction de ta structure de DB
  // Par exemple: return row.googleSheetsConfig || null;
  return row.googleSheetsConfig || null;
}

/* ------------------------------------------------------------------ */
/* OAuth helpers: refresh token                                         */
/* ------------------------------------------------------------------ */
/**
 * oauthRefreshToken(refreshToken)
 * - Utilise l'endpoint OAuth2 de Google pour obtenir un nouvel access_token
 * - Retour : { access_token, expires_in, refresh_token? } ou lève une erreur
 */
async function oauthRefreshToken(refreshToken) {
  if (!refreshToken) throw new Error("Missing refresh token");

  const body = new URLSearchParams({
    client_id: readEnv("GOOGLE_CLIENT_ID"),
    client_secret: readEnv("GOOGLE_CLIENT_SECRET"),
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = json?.error_description || json?.error || `Google token refresh failed with status ${res.status}`;
    throw new Error(err);
  }

  return json; // contient access_token, expires_in, scope, token_type, id_token (opt), refresh_token (rare)
}

/* ------------------------------------------------------------------ */
/* ensureValidAccessToken                                               */
/* ------------------------------------------------------------------ */
/**
 * Renvoie au minimum { accessToken, refreshToken?, expiresAt? }
 * - Si le token existant est expiré (ou absent) : tente de refresh via refresh_token.
 * - Si aucun token et process.env.GOOGLE_ACCESS_TOKEN est défini : l'utilise (pratique debug).
 *
 * NOTE: adapte la lecture/persistance depuis ta DB.
 */
export async function ensureValidAccessToken(shop) {
  // 1) si l'utilisateur a mis un token en dev via env -> retourne le
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return {
      accessToken: process.env.GOOGLE_ACCESS_TOKEN,
      source: "env",
    };
  }

  // 2) récupère la row shop depuis la DB
  const row = await getShopRow(shop);

  // 3) si row contient des tokens -> utilise-les
  const accessTokenFromRow = row?.googleAccessToken || null;
  const refreshTokenFromRow = row?.googleRefreshToken || null;
  const expiresAtFromRow = row?.googleTokenExpiresAt || null; // timestamp sec

  // 4) si on a un access token non expiré -> retourne
  if (accessTokenFromRow && expiresAtFromRow && Number(expiresAtFromRow) > nowSec() + 30) {
    return {
      accessToken: accessTokenFromRow,
      refreshToken: refreshTokenFromRow,
      expiresAt: expiresAtFromRow,
      source: "db",
    };
  }

  // 5) si on a refresh token -> refresh
  if (refreshTokenFromRow) {
    try {
      const tokenRes = await oauthRefreshToken(refreshTokenFromRow);
      const newAccessToken = tokenRes.access_token;
      const expiresIn = tokenRes.expires_in; // en secondes
      const newRefreshToken = tokenRes.refresh_token || refreshTokenFromRow; // Google renvoie parfois refresh_token, sinon garde l'ancien

      const newExpiresAt = nowSec() + (Number(expiresIn) || 3600);
      // Persiste les nouveaux tokens dans la DB
      await saveShopGoogleTokens(shop, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        source: "refreshed",
      };
    } catch (err) {
      // Si refresh échoue, on laisse tomber et on renvoie erreur
      throw new Error(`Failed to refresh Google token: ${String(err)}`);
    }
  }

  // 6) Pas de tokens du tout -> signaler
  throw new Error("No Google tokens available for this shop (access & refresh tokens missing). Connect Google for this shop.");
}

/* ------------------------------------------------------------------ */
/* testSheetConnection                                                   */
/* ------------------------------------------------------------------ */
/**
 * Vérifie la connexion à un spreadsheet Google.
 * - shop : shop domain / id ou objet shop (utilisé par ensureValidAccessToken)
 * - sheet : { spreadsheetId, tabName? }
 *
 * Retour : { ok: true, spreadsheet } ou { ok: false, error: "message" }
 */
export async function testSheetConnection(shop, sheet = {}) {
  try {
    const spreadsheetId = sheet?.spreadsheetId || process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      return { ok: false, error: "No spreadsheetId provided (cfg.sheet.spreadsheetId or GOOGLE_SHEET_ID)" };
    }

    // Récupérer token via ensureValidAccessToken
    let tokenObj;
    try {
      tokenObj = await ensureValidAccessToken(shop);
    } catch (err) {
      return { ok: false, error: `Could not obtain access token: ${String(err)}` };
    }

    const accessToken = tokenObj?.accessToken;
    if (!accessToken) {
      return { ok: false, error: "Missing access token" };
    }

    const url = `${GOOGLE_SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,title,sheets.properties`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg = json?.error?.message || json?.error || `Google Sheets API error status ${res.status}`;
      return { ok: false, error: msg };
    }

    return { ok: true, spreadsheet: json };
  } catch (err) {
    console.error("testSheetConnection error:", err);
    return { ok: false, error: String(err) };
  }
}

/* ------------------------------------------------------------------ */
/* Helper: append to sheet (utilisé ailleurs)                           */
/* ------------------------------------------------------------------ */
/**
 * appendValuesToSpreadsheet(spreadsheetId, range, values, accessToken)
 * - values : array of rows (each row = array of cell values)
 */
export async function appendValuesToSpreadsheet(spreadsheetId, range, values, accessToken) {
  if (!spreadsheetId) throw new Error("Missing spreadsheetId");
  if (!accessToken) throw new Error("Missing access token");

  const params = new URLSearchParams({
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
  });

  const url = `${GOOGLE_SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append?${params.toString()}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = json?.error?.message || json?.error || `Google Sheets append error: ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

/* ------------------------------------------------------------------ */
/* Optional: helper to create access token via Service Account (if used) */
/* ------------------------------------------------------------------ */
/**
 * If you use a Service Account instead of per-shop OAuth, implement a function here
 * to generate short-lived access tokens from GOOGLE_PRIVATE_KEY and GOOGLE_SERVICE_EMAIL.
 *
 * For now we don't implement it to avoid adding jwt libraries.
 */

/* ------------------------------------------------------------------ */
/* Exports summary (listés explicitement pour clarté)                   */
/* ------------------------------------------------------------------ */
export default {
  getSheetsConfigForShop,
  ensureValidAccessToken,
  testSheetConnection,
  appendValuesToSpreadsheet,
};
