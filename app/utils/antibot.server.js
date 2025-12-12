// ===== File: app/utils/antibot.server.js =====

/**
 * Config par défaut (même structure que Section5Antibot.jsx)
 */
export function getDefaultAntibotConfig() {
  return {
    meta: { version: 4 },

    ipBlock: {
      enabled: true,
      trustProxy: true,
      clientIpHeader: "x-forwarded-for",
      allowList: [],
      denyList: [],
      cidrList: [],
      autoBanAfterFails: 20,
      autoBanMinutes: 120,
      maxOrdersPerIpPerDay: 40,
    },

    phoneBlock: {
      enabled: false,
      minDigits: 8,
      requirePrefix: false,
      allowedPrefixes: ["+212", "+213"],
      blockedNumbers: [],
      blockedPatterns: ["^\\+?0{6,}$", "0000", "1234", "9999"],
      maxOrdersPerPhonePerDay: 40,
    },

    countryBlock: {
      enabled: false,
      defaultAction: "allow", // allow | block | challenge
      allowList: [],
      denyList: [],
    },

    recaptcha: {
      enabled: false,
      version: "v2_checkbox", // v2_checkbox | v2_invisible | v3
      siteKey: "",
      secretKey: "",
      minScore: 0.5,
    },

    honeypot: {
      enabled: true,
      fieldName: "tf_hp_token",
      minFillTimeMs: 3000,
      checkMouseMove: true,
      blockIfFilled: true,
    },
  };
}

/**
 * Charge la config Anti-bot depuis le metafield shop.tripleform_cod.antibot
 * admin: client Admin API (authenticate.admin(request).admin)
 */
export async function loadAntibotConfig(admin) {
  if (!admin) {
    return getDefaultAntibotConfig();
  }

  const QUERY = `
    query tfAntibotConfig {
      shop {
        metafield(namespace: "tripleform_cod", key: "antibot") {
          type
          value
        }
      }
    }
  `;

  try {
    const resp = await admin.graphql(QUERY);
    const json = await resp.json();
    const mf = json?.data?.shop?.metafield;

    if (!mf || !mf.value) {
      return getDefaultAntibotConfig();
    }

    let parsed;
    try {
      parsed = JSON.parse(mf.value);
    } catch {
      parsed = {};
    }

    const base = getDefaultAntibotConfig();
    const merged = {
      ...base,
      ...parsed,
      ipBlock: {
        ...base.ipBlock,
        ...(parsed.ipBlock || {}),
      },
      phoneBlock: {
        ...base.phoneBlock,
        ...(parsed.phoneBlock || {}),
      },
      countryBlock: {
        ...base.countryBlock,
        ...(parsed.countryBlock || {}),
      },
      recaptcha: {
        ...base.recaptcha,
        ...(parsed.recaptcha || {}),
      },
      honeypot: {
        ...base.honeypot,
        ...(parsed.honeypot || {}),
      },
    };

    if (!merged.meta) merged.meta = {};
    merged.meta.version = Number(merged.meta.version || 4);

    return merged;
  } catch (e) {
    console.error("loadAntibotConfig error:", e);
    return getDefaultAntibotConfig();
  }
}

/* ------------------------------------------------------------------ */
/* Helpers IP / CIDR                                                  */
/* ------------------------------------------------------------------ */

function ipToInt(ip) {
  const parts = String(ip || "").trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const p = Number(parts[i]);
    if (!Number.isFinite(p) || p < 0 || p > 255) return null;
    n = (n << 8) + p;
  }
  return n >>> 0; // force unsigned
}

function ipInCidr(ip, cidr) {
  const [range, bitsStr] = String(cidr || "").split("/");
  const bits = Number(bitsStr);
  if (!range || !Number.isFinite(bits) || bits < 0 || bits > 32) return false;

  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(range);
  if (ipInt == null || rangeInt == null) return false;

  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

/**
 * Extrait l'IP client en fonction de la config.
 * On regarde d'abord ipBlock.clientIpHeader, puis quelques headers standards.
 */
export function getClientIpFromRequest(request, config) {
  if (!request) return null;
  const headers = request.headers;
  const ipCfg = config?.ipBlock || {};

  const headerName = (ipCfg.clientIpHeader || "x-forwarded-for").toLowerCase();

  function firstHeaderVal(name) {
    const v =
      headers.get(name) ||
      headers.get(name.toLowerCase()) ||
      headers.get(name.toUpperCase());
    if (!v) return null;
    // x-forwarded-for peut contenir plusieurs IP séparées par virgule
    return v.split(",")[0].trim() || null;
  }

  const candidates = [
    headerName,
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
  ];

  for (const h of candidates) {
    const val = firstHeaderVal(h);
    if (val) return val;
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Helpers téléphone / pays                                           */
/* ------------------------------------------------------------------ */

function normalizeDigits(phone) {
  return String(phone || "").replace(/\D+/g, "");
}

/**
 * phone: numéro complet ou partiel (ex: "+212600001111")
 * return: { ok, reason, code }
 */
function checkPhoneBlock(config, phone) {
  const cfg = config?.phoneBlock || {};
  if (!cfg.enabled) {
    return { ok: true };
  }

  const raw = String(phone || "").trim();
  const digits = normalizeDigits(raw);

  // min digits
  if (cfg.minDigits && digits.length < cfg.minDigits) {
    return {
      ok: false,
      code: "phone_min_digits",
      reason: `Phone has less than ${cfg.minDigits} digits`,
    };
  }

  // require prefix
  if (cfg.requirePrefix && (cfg.allowedPrefixes || []).length > 0) {
    const okPrefix = (cfg.allowedPrefixes || []).some((p) =>
      raw.startsWith(String(p || "").trim())
    );
    if (!okPrefix) {
      return {
        ok: false,
        code: "phone_prefix",
        reason: "Phone prefix not allowed",
      };
    }
  }

  // blocked exact numbers
  if ((cfg.blockedNumbers || []).includes(raw)) {
    return {
      ok: false,
      code: "phone_blocked_exact",
      reason: "Phone is in blockedNumbers",
    };
  }

  // blocked patterns (regex)
  for (const pattern of cfg.blockedPatterns || []) {
    const pat = String(pattern || "").trim();
    if (!pat) continue;
    try {
      const re = new RegExp(pat);
      if (re.test(raw)) {
        return {
          ok: false,
          code: "phone_blocked_pattern",
          reason: `Phone matches blocked pattern "${pat}"`,
        };
      }
    } catch {
      // ignore regex errors
    }
  }

  // (limites par numéro / jour → à gérer avec une DB plus tard)
  return { ok: true };
}

/**
 * clientIp: "1.2.3.4"
 */
function checkIpBlock(config, clientIp) {
  const cfg = config?.ipBlock || {};
  if (!cfg.enabled || !clientIp) {
    return { ok: true };
  }

  const ip = String(clientIp || "").trim();
  if (!ip) return { ok: true };

  // allowList prioritaire
  if ((cfg.allowList || []).includes(ip)) {
    return { ok: true };
  }

  // denyList exact
  if ((cfg.denyList || []).includes(ip)) {
    return {
      ok: false,
      code: "ip_deny_list",
      reason: "IP is in denyList",
    };
  }

  // cidrList
  for (const cidr of cfg.cidrList || []) {
    const c = String(cidr || "").trim();
    if (!c) continue;
    if (ipInCidr(ip, c)) {
      return {
        ok: false,
        code: "ip_cidr_block",
        reason: `IP is in blocked CIDR range ${c}`,
      };
    }
  }

  // (limites par IP / jour → à gérer plus tard avec une DB)
  return { ok: true };
}

/**
 * countryCode: code ISO2 (ex: "MA", "DZ", "FR")
 * Retourne { action: "allow" | "block" | "challenge", ok: boolean }
 */
function checkCountryBlock(config, countryCode) {
  const cfg = config?.countryBlock || {};
  if (!cfg.enabled) {
    return { ok: true, action: "allow" };
  }

  const code = String(countryCode || "").toUpperCase();
  const allowList = (cfg.allowList || []).map((c) =>
    String(c || "").toUpperCase()
  );
  const denyList = (cfg.denyList || []).map((c) =>
    String(c || "").toUpperCase()
  );
  const defaultAction = cfg.defaultAction || "allow";

  // si le pays est explicitement autorisé
  if (allowList.includes(code)) {
    return { ok: true, action: "allow" };
  }

  // si le pays est explicitement bloqué
  if (denyList.includes(code)) {
    return { ok: false, action: "block", code: "country_deny_list" };
  }

  // sinon comportement par défaut
  if (defaultAction === "block") {
    return {
      ok: false,
      action: "block",
      code: "country_default_block",
    };
  }
  if (defaultAction === "challenge") {
    // pour l'instant on considère challenge = bloqué (à adapter quand tu
    // brancheras reCAPTCHA côté front/back)
    return {
      ok: false,
      action: "challenge",
      code: "country_challenge",
    };
  }

  // defaultAction === "allow"
  return { ok: true, action: "allow" };
}

/* ------------------------------------------------------------------ */
/* checkRequestWithAntibot                                            */
/* ------------------------------------------------------------------ */

/**
 * Vérifie une requête de soumission COD avec la config Anti-bot.
 *
 * params:
 *  - admin: client Admin API
 *  - request: Remix request (pour IP)
 *  - phone: numéro téléphone complet (ex: "+212600001111")
 *  - countryCode: pays du client (ISO2, ex: "MA") si dispo
 *  - overrideConfig: si tu veux passer une config déjà chargée
 *
 * Retour:
 *  {
 *    ok: boolean,
 *    reason?: string,
 *    code?: string,
 *    details?: any,
 *  }
 */
export async function checkRequestWithAntibot({
  admin,
  request,
  phone,
  countryCode,
  overrideConfig,
}) {
  const config =
    overrideConfig || (await loadAntibotConfig(admin));

  // IP
  const ip = getClientIpFromRequest(request, config);
  const ipRes = checkIpBlock(config, ip);
  if (!ipRes.ok) {
    return {
      ok: false,
      code: ipRes.code || "ip_block",
      reason: ipRes.reason || "Blocked by IP rules",
      details: { ip },
    };
  }

  // Phone
  const phoneRes = checkPhoneBlock(config, phone);
  if (!phoneRes.ok) {
    return {
      ok: false,
      code: phoneRes.code || "phone_block",
      reason: phoneRes.reason || "Blocked by phone rules",
      details: { phone },
    };
  }

  // Country (si on en a un)
  if (countryCode) {
    const cRes = checkCountryBlock(config, countryCode);
    if (!cRes.ok) {
      return {
        ok: false,
        code: cRes.code || "country_block",
        reason:
          cRes.reason ||
          `Blocked by country rules (${cRes.action || "block"})`,
        details: { countryCode },
      };
    }
  }

  // reCAPTCHA & honeypot seront gérés côté front + autre route,
  // ici on ne fait que IP / phone / pays.
  return { ok: true };
}
