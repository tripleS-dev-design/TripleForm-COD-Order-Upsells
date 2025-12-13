// ===== File: app/services/google.server.js =====
import { prisma } from "../db.server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_OAUTH_REDIRECT_URL = process.env.GOOGLE_OAUTH_REDIRECT_URL;

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

// ---------- helpers state (shop + target dans l’URL Google) ----------
function encodeState(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeState(state) {
  try {
    const txt = Buffer.from(state, "base64url").toString("utf8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

// ---------- URL OAuth Google ----------
export function buildGoogleAuthUrl({ shop, target = "orders" }) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_OAUTH_REDIRECT_URL) {
    console.warn(
      "[Google OAuth] GOOGLE_CLIENT_ID / SECRET / OAUTH_REDIRECT_URL manquants dans .env"
    );
  }

  const state = encodeState({ shop, target });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URL || "",
    response_type: "code",
    scope: SHEETS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

// ---------- échange code => tokens ----------
async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID || "",
    client_secret: GOOGLE_CLIENT_SECRET || "",
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URL || "",
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error || json?.error_description || "Erreur Google OAuth";
    throw new Error(msg);
  }
  return json;
}

// ---------- refresh token ----------
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new Error("Aucun refresh token Google enregistré");
  }

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: GOOGLE_CLIENT_ID || "",
    client_secret: GOOGLE_CLIENT_SECRET || "",
    grant_type: "refresh_token",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error || json?.error_description || "Erreur refresh token";
    throw new Error(msg);
  }
  return json;
}

// ---------- récupérer l'utilisateur Google ----------
async function fetchGoogleUser(accessToken) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error("Impossible de récupérer le compte Google");
  }
  return json; // { id, email, name, ... }
}

// ---------- enregistrer / mettre à jour le compte Google pour une boutique ----------
async function upsertGoogleAccountForShop(shop, tokens, user) {
  const expiresIn = tokens.expires_in ? Number(tokens.expires_in) : null;
  const expiryDate = expiresIn
    ? new Date(Date.now() + expiresIn * 1000)
    : null;

  const baseUpdate = {
    googleUserId: user.id || user.sub || null,
    googleEmail: user.email || null,
    accessToken: tokens.access_token || null,
    scope: tokens.scope || SHEETS_SCOPE,
    tokenType: tokens.token_type || "Bearer",
    tokenExpiryDate: expiryDate,
  };

  const updateData = {
    ...baseUpdate,
    ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
  };

  return prisma.shopGoogleSettings.upsert({
    where: { shopDomain: shop },
    create: {
      shopDomain: shop,
      refreshToken: tokens.refresh_token || null,
      ...baseUpdate,
    },
    update: updateData,
  });
}

// ---------- lecture des settings Google ----------
export async function getGoogleSettingsForShop(shop) {
  if (!shop) return null;
  return prisma.shopGoogleSettings.findUnique({
    where: { shopDomain: shop },
  });
}

// ---------- config Sheets (cfg) ----------
export async function getSheetsConfigForShop(shop) {
  const row = await getGoogleSettingsForShop(shop);
  if (!row?.sheetsConfigJson) return null;
  try {
    return JSON.parse(row.sheetsConfigJson);
  } catch (e) {
    console.warn("[Sheets] JSON invalide pour", shop, e);
    return null;
  }
}

export async function saveSheetsConfigForShop(shop, cfg) {
  const json = JSON.stringify(cfg || {});
  return prisma.shopGoogleSettings.upsert({
    where: { shopDomain: shop },
    create: {
      shopDomain: shop,
      sheetsConfigJson: json,
    },
    update: {
      sheetsConfigJson: json,
    },
  });
}

// ---------- statut simplifié pour le front (UI Section3) ----------
export async function getGoogleStatusForShop(shop) {
  const row = await getGoogleSettingsForShop(shop);
  if (!row) {
    return {
      connected: false,
      accountEmail: null,
      mainSheetName: null,
      abandonedSheetName: null,
    };
  }

  let cfg = null;
  try {
    cfg = row.sheetsConfigJson ? JSON.parse(row.sheetsConfigJson) : null;
  } catch {
    cfg = null;
  }

  const mainSheetName = cfg?.sheet?.tabName || null;
  const abandonedSheetName = cfg?.abandonedSheet?.tabName || null;

  return {
    connected: !!row.accessToken,
    accountEmail: row.googleEmail || null,
    mainSheetName,
    abandonedSheetName,
  };
}

// ---------- s’assurer qu’on a un accessToken valide ----------
export async function ensureValidAccessToken(shop) {
  const row = await getGoogleSettingsForShop(shop);
  if (!row || !row.accessToken) {
    throw new Error("Aucun compte Google connecté pour cette boutique");
  }

  const now = Date.now();
  const expiryMs = row.tokenExpiryDate
    ? row.tokenExpiryDate.getTime()
    : null;

  if (expiryMs && expiryMs - 60_000 < now && row.refreshToken) {
    const newTokens = await refreshAccessToken(row.refreshToken);

    const expiresIn = newTokens.expires_in
      ? Number(newTokens.expires_in)
      : null;
    const newExpiry = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    const updated = await prisma.shopGoogleSettings.update({
      where: { shopDomain: shop },
      data: {
        accessToken: newTokens.access_token || row.accessToken,
        tokenExpiryDate: newExpiry || row.tokenExpiryDate,
        scope: newTokens.scope || row.scope,
        tokenType: newTokens.token_type || row.tokenType,
      },
    });

    return updated;
  }

  return row;
}

// ---------- test connexion feuille ----------
export async function testSheetConnection(shop, sheet) {
  if (!sheet?.spreadsheetId) {
    throw new Error("Spreadsheet ID manquant");
  }

  const settings = await ensureValidAccessToken(shop);
  const accessToken = settings.accessToken;
  if (!accessToken) {
    throw new Error("Aucun token Google valide pour cette boutique");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    sheet.spreadsheetId
  )}?includeGridData=false`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.error ||
      "Impossible d’accéder à cette feuille Google Sheets";
    throw new Error(msg);
  }

  const tabName = sheet.tabName;
  if (tabName && Array.isArray(json.sheets)) {
    const ok = json.sheets.some(
      (s) => s.properties?.title === tabName
    );
    if (!ok) {
      throw new Error(
        `L’onglet “${tabName}” n’existe pas dans cette feuille Google Sheets`
      );
    }
  }

  return {
    ok: true,
    spreadsheetTitle: json.properties?.title || null,
    tabChecked: !!tabName,
  };
}

// ---------- callback Google (après OAuth) ----------
export async function handleGoogleCallback(code, rawState) {
  const state = decodeState(rawState);
  if (!state || !state.shop) {
    throw new Error("State Google invalide ou manquant");
  }

  const shop = state.shop;
  const target = state.target || "orders";

  const tokens = await exchangeCodeForTokens(code);
  const user = await fetchGoogleUser(tokens.access_token);

  await upsertGoogleAccountForShop(shop, tokens, user);

  return { shop, target, userEmail: user.email || null };
}
