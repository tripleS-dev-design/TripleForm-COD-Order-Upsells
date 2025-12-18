// ===== File: app/services/google.server.js =====
import prisma from "../db.server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_OAUTH_REDIRECT_URL = process.env.GOOGLE_OAUTH_REDIRECT_URL;

const GOOGLE_AUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// ✅ Scopes corrigés pour Sheets + email
const SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/userinfo.email"
].join(" ");

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
 function buildGoogleAuthUrl({ shop, target = "orders" }) {
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
    scope: SHEETS_SCOPES,
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
  const expiryDate = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

  const baseUpdate = {
    googleUserId: user.id || user.sub || null,
    googleEmail: user.email || null,
    accessToken: tokens.access_token || null,
    scope: tokens.scope || SHEETS_SCOPES,
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
 async function getGoogleSettingsForShop(shop) {
  if (!shop) return null;
  return prisma.shopGoogleSettings.findUnique({
    where: { shopDomain: shop },
  });
}

// ---------- config Sheets (cfg) ----------
 async function ensureValidAccessToken(shop) {
  const row = await getGoogleSettingsForShop(shop);
  
  if (!row || !row.accessToken) {
    throw new Error("Aucun compte Google connecté pour cette boutique");
  }

  const now = Date.now();
  const expiryMs = row.tokenExpiryDate ? row.tokenExpiryDate.getTime() : null;

  // Si pas de date d'expiration, on utilise quand même le token
  if (!expiryMs) {
    console.warn(`[Google] Pas de date d'expiration pour ${shop}, on utilise le token actuel`);
    return row.accessToken; // ← Retourne DIRECTEMENT le token string
  }

  // Si expiré ou proche expiration, on rafraîchit
  if (expiryMs - 60_000 < now && row.refreshToken) {
    console.log(`[Google] Rafraîchissement token pour ${shop}`);
    const newTokens = await refreshAccessToken(row.refreshToken);
    
    const expiresIn = newTokens.expires_in ? Number(newTokens.expires_in) : 3600;
    const newExpiry = new Date(Date.now() + expiresIn * 1000);

    await prisma.shopGoogleSettings.update({
      where: { shopDomain: shop },
      data: {
        accessToken: newTokens.access_token,
        tokenExpiryDate: newExpiry,
        refreshToken: newTokens.refresh_token || row.refreshToken,
      },
    });

    return newTokens.access_token; // ← Retourne le NOUVEAU token string
  }

  return row.accessToken; // ← Token encore valide
}

// ---------- statut simplifié pour le front (UI Section3) ----------
 async function getGoogleStatusForShop(shop) {
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

// ---------- config Sheets (cfg) ----------
 async function getSheetsConfigForShop(shop) {
  const row = await getGoogleSettingsForShop(shop);
  if (!row?.sheetsConfigJson) return null;
  try {
    return JSON.parse(row.sheetsConfigJson);
  } catch (e) {
    console.warn("[Sheets] JSON invalide pour", shop, e);
    return null;
  }
}

 async function saveSheetsConfigForShop(shop, cfg) {
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

// ---------- test connexion feuille (VERSION CORRIGÉE) ----------
 async function testSheetConnection(shop, sheet) {
  if (!sheet?.spreadsheetId) {
    throw new Error("Spreadsheet ID manquant");
  }

  // CORRECTION : ensureValidAccessToken retourne DIRECTEMENT le token string
  const accessToken = await ensureValidAccessToken(shop);
  
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

// ---------- callback Google (VERSION FINALE CORRIGÉE) ----------
async function handleGoogleCallback(code, rawState) {
  // 1️⃣ Décoder le state
  const state = decodeState(rawState);

  if (!state || !state.shop) {
    console.error("[Google OAuth] State invalide:", rawState);
    throw new Error("State Google invalide ou shop manquant");
  }

  const shop = state.shop;
  const target = state.target || "orders";

  // 2️⃣ Échange code → tokens Google
  const tokens = await exchangeCodeForTokens(code);

  if (!tokens?.access_token) {
    throw new Error("Access token Google manquant");
  }

  // 3️⃣ Récupérer l’utilisateur Google (email)
  const user = await fetchGoogleUser(tokens.access_token);

  if (!user?.email) {
    throw new Error("Impossible de récupérer l’email Google");
  }

  // 4️⃣ Sauvegarde / mise à jour en DB (ShopGoogleSettings)
  await upsertGoogleAccountForShop(shop, tokens, user);

  console.log(
    `[Google OAuth] Connexion réussie : shop=${shop}, email=${user.email}`
  );

  // 5️⃣ Retour utilisé par api.google.callback.jsx
  return {
    shop,
    target,
    userEmail: user.email,
  };
}


// ---------- EXPORTS ----------
export {
  buildGoogleAuthUrl,
  getGoogleSettingsForShop,
  getSheetsConfigForShop,
  saveSheetsConfigForShop,
  getGoogleStatusForShop,
  ensureValidAccessToken,
  testSheetConnection,
  handleGoogleCallback,
};