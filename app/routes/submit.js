// ===== File: app/routes/proxy.submit.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";
import { trackOrderWithPixels } from "../utils/pixels.server";

import prisma from "../db.server";
import { decryptSecret } from "../utils/crypto.server";

const TF_TAG = "TripleForm COD";

/* ------------------------------------------------------------------ */
/* ✅ SAFE BODY PARSER (App Proxy JSON / urlencoded / form-data)        */
/* ------------------------------------------------------------------ */
async function readBodySafe(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      const j = await request.json();
      return j && typeof j === "object" ? j : {};
    } catch {}
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const obj = Object.fromEntries(params.entries());
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }

  try {
    const fd = await request.formData();
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    return obj;
  } catch {
    try {
      const text = await request.text();
      if (!text) return {};
      try {
        const j = JSON.parse(text);
        return j && typeof j === "object" ? j : {};
      } catch {
        const params = new URLSearchParams(text);
        const obj = Object.fromEntries(params.entries());
        return obj && typeof obj === "object" ? obj : {};
      }
    } catch {
      return {};
    }
  }
}

/* ------------------------------------------------------------------ */
/* Utils Phone / Country / Address                                     */
/* ------------------------------------------------------------------ */
function buildFullPhone(fields = {}) {
  const f = fields || {};

  const directCandidates = [
    f.fullPhone,
    f.phoneFull,
    f.whatsapp,
    f.whatsapp_phone,
    f.whatsappPhone,
  ].filter(Boolean);

  for (const c of directCandidates) {
    const s = String(c).trim();
    if (s.length >= 6) return s;
  }

  const prefix =
    (f.phonePrefix ||
      f.prefix ||
      f.dialCode ||
      f.country_code ||
      f.callingCode ||
      "") + "";

  const phoneRaw =
    (f.phone ||
      f.phone_number ||
      f.phoneDigits ||
      f.whatsapp_number ||
      f.mobile ||
      "") + "";

  const prefixTrim = prefix.trim();
  const phoneTrim = String(phoneRaw).trim();

  if (!prefixTrim && !phoneTrim) return "";

  if (phoneTrim && prefixTrim && phoneTrim.startsWith(prefixTrim)) return phoneTrim;
  if (prefixTrim && phoneTrim) return `${prefixTrim}${phoneTrim}`;
  if (phoneTrim) return phoneTrim;
  return prefixTrim;
}

async function resolveCountryCode(admin, fields = {}, body = {}) {
  const pick = (v) => (v == null ? "" : String(v)).trim();

  const fromBody = pick(body.countryCode || body.country || body.codCountry);
  if (fromBody) return fromBody.toUpperCase();

  const fromFields = pick(
    fields.country || fields.countryCode || fields.codCountry || fields.pays
  );
  if (fromFields) return fromFields.toUpperCase();

  if (admin) {
    try {
      const QUERY = `
        query tfShopCountry {
          shop { billingAddress { countryCode } }
        }
      `;
      const resp = await admin.graphql(QUERY);
      const data = await resp.json();
      const code = data?.data?.shop?.billingAddress?.countryCode;
      if (code) return String(code).toUpperCase();
    } catch (e) {
      console.error("resolveCountryCode shop fallback error:", e);
    }
  }

  return "DZ";
}

function buildShippingAddress(fields = {}, fullPhone = "", countryCode = "DZ") {
  const country =
    (fields.country || fields.countryCode || fields.codCountry || countryCode || "DZ") + "";
  return {
    firstName: (fields.name || "").trim(),
    address1: (fields.address || "").trim() || "—",
    city: (fields.city || "").trim() || "—",
    province: (fields.province || "").trim() || null,
    country: country.trim().toUpperCase(),
    zip: null,
    phone: fullPhone || null,
  };
}

/* ------------------------------------------------------------------ */
/* Anti-bot config loader + IP                                         */
/* ------------------------------------------------------------------ */
async function loadAntibotConfig(admin) {
  try {
    const QUERY = `
      query antibotSettingsForProxy {
        shop {
          metafield(namespace: "tripleform_cod", key: "antibot") {
            id
            value
            type
          }
        }
      }
    `;
    const resp = await admin.graphql(QUERY);
    const data = await resp.json();
    const mf = data?.data?.shop?.metafield || null;
    if (!mf?.value) return null;

    try {
      return JSON.parse(mf.value);
    } catch {
      return null;
    }
  } catch (e) {
    console.error("loadAntibotConfig error:", e);
    return null;
  }
}

function getClientIpFromRequest(request, antibot) {
  const headers = request.headers;
  const ipBlock = antibot?.ipBlock || {};
  let raw = "";

  if (ipBlock.clientIpHeader) {
    const h = ipBlock.clientIpHeader;
    raw =
      headers.get(h) ||
      headers.get(h.toLowerCase()) ||
      headers.get(h.toUpperCase()) ||
      "";
  }

  if (!raw) {
    raw =
      headers.get("x-forwarded-for") ||
      headers.get("X-Forwarded-For") ||
      headers.get("CF-Connecting-IP") ||
      headers.get("x-real-ip") ||
      "";
  }

  const first = raw.split(",")[0].trim();
  return first || null;
}

function normalizeDigits(str) {
  return (str || "").replace(/\D+/g, "");
}

function matchesPatterns(str, patterns = []) {
  if (!str) return false;
  const s = String(str);
  for (const p of patterns || []) {
    if (!p) continue;
    try {
      const re = new RegExp(p);
      if (re.test(s)) return true;
    } catch {}
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* ✅ Rate limit: bloque si > 2 commandes par client (IP/Phone)         */
/* ------------------------------------------------------------------ */
function getRateLimitConfig(antibotCfg) {
  // Tu peux le mettre dans metafield antibot.rateLimit
  const cfg = antibotCfg?.rateLimit || antibotCfg?.submitLimit || {};

  const enabled = cfg.enabled !== false; // default true
  const max = Number(cfg.maxAttempts != null ? cfg.maxAttempts : 2); // default 2
  const windowSec = Number(cfg.windowSec != null ? cfg.windowSec : 600); // default 10 min
  const useIp = cfg.useIp !== false; // default true
  const usePhone = cfg.usePhone !== false; // default true

  return { enabled, max, windowSec, useIp, usePhone };
}

async function enforceRateLimit({ shop, clientIp, fullPhone, antibotCfg }) {
  const rl = getRateLimitConfig(antibotCfg);
  if (!rl.enabled) return { blocked: false };

  const keys = [];
  const phoneDigits = normalizeDigits(fullPhone);

  if (rl.useIp && clientIp) keys.push({ keyType: "ip", keyValue: String(clientIp).trim() });
  if (rl.usePhone && phoneDigits) keys.push({ keyType: "phone", keyValue: phoneDigits });

  if (keys.length === 0) return { blocked: false };

  const since = new Date(Date.now() - rl.windowSec * 1000);

  // 1) check counts
  for (const k of keys) {
    const count = await prisma.tfSubmitAttempt.count({
      where: {
        shopDomain: shop,
        keyType: k.keyType,
        keyValue: k.keyValue,
        createdAt: { gte: since },
      },
    });

    // max=2 -> autorise 2, bloque à partir de 3
    if (count >= rl.max) {
      return {
        blocked: true,
        code: "RATE_LIMIT",
        reason: `${k.keyType} limit exceeded`,
        details: {
          keyType: k.keyType,
          windowSec: rl.windowSec,
          maxAttempts: rl.max,
        },
      };
    }
  }

  // 2) record attempt (on enregistre après check)
  try {
    await prisma.tfSubmitAttempt.createMany({
      data: keys.map((k) => ({
        shopDomain: shop,
        keyType: k.keyType,
        keyValue: k.keyValue,
      })),
    });
  } catch (e) {
    // Si erreur DB, on ne bloque pas l'achat (fail-open)
    console.error("RateLimit create attempt error:", e);
  }

  return { blocked: false };
}

/* ------------------------------------------------------------------ */
/* reCAPTCHA v3 (backend verification)                                 */
/* ------------------------------------------------------------------ */
async function verifyRecaptchaV3({
  token,
  remoteip,
  expectedAction,
  minScore = 0.5,
  secret,
}) {
  if (!secret) return { ok: false, reason: "missing_secret", success: false };
  if (!token) return { ok: false, reason: "missing_token", success: false };

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteip) form.set("remoteip", remoteip);

  const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const data = await resp.json().catch(() => ({}));

  const score =
    typeof data?.score === "number" ? data.score : Number(data?.score ?? 0);
  const action = String(data?.action || "");
  const success = data?.success === true;

  const actionOk = expectedAction ? action === expectedAction : true;
  const scoreOk = score >= Number(minScore);

  const ok = success && actionOk && scoreOk;

  let reason = "ok";
  if (!success) {
    reason =
      (data?.["error-codes"] && data["error-codes"].join(",")) || "google_failed";
  } else if (!actionOk) {
    reason = `action_mismatch:${action || "empty"}`;
  } else if (!scoreOk) {
    reason = `low_score:${score}`;
  }

  return { ok, success, score, action, reason, data };
}

/* ------------------------------------------------------------------ */
/* Anti-bot evaluation (tes règles)                                    */
/* ------------------------------------------------------------------ */
function evaluateAntibot({ config, clientIp, countryCode, fullPhone, honeypot }) {
  const res = {
    blocked: false,
    reasons: [],
    needsRecaptcha: false,
    recaptchaExpectedAction: "tf_submit",
    recaptchaMinScore: 0.5,
  };

  if (!config || typeof config !== "object") return res;

  const ipBlock = config.ipBlock || {};
  const phoneBlock = config.phoneBlock || {};
  const countryBlock = config.countryBlock || {};
  const honeypotCfg = config.honeypot || {};
  const recaptchaCfg = config.recaptcha || config.googleRecaptcha || {};
  const hp = honeypot || {};

  res.recaptchaExpectedAction =
    (recaptchaCfg.expectedAction || recaptchaCfg.action || "tf_submit").trim();

  res.recaptchaMinScore = Number(
    recaptchaCfg.minScore != null ? recaptchaCfg.minScore : 0.5
  );

  // IP
  if (ipBlock.enabled && clientIp) {
    const ip = clientIp;
    const allowList = ipBlock.allowList || [];
    const denyList = ipBlock.denyList || [];

    if (!allowList.includes(ip)) {
      if (denyList.includes(ip)) {
        res.blocked = true;
        res.reasons.push(`IP ${ip} dans denyList`);
      }
    }
  }

  // Téléphone
  if (phoneBlock.enabled && fullPhone) {
    const phone = String(fullPhone).trim();
    const digits = normalizeDigits(phone);

    if (phoneBlock.minDigits && digits.length < Number(phoneBlock.minDigits)) {
      res.blocked = true;
      res.reasons.push(
        `Téléphone trop court (${digits.length} < ${phoneBlock.minDigits})`
      );
    }

    if (!res.blocked && phoneBlock.requirePrefix) {
      const allowed = phoneBlock.allowedPrefixes || [];
      const ok = allowed.some((p) => phone.startsWith(String(p || "").trim()));
      if (!ok && allowed.length > 0) {
        res.blocked = true;
        res.reasons.push(`Préfixe téléphone non autorisé (${allowed.join(", ")})`);
      }
    }

    if (!res.blocked && Array.isArray(phoneBlock.blockedNumbers)) {
      if (phoneBlock.blockedNumbers.includes(phone)) {
        res.blocked = true;
        res.reasons.push("Téléphone dans la liste des numéros bloqués");
      }
    }

    if (!res.blocked && Array.isArray(phoneBlock.blockedPatterns)) {
      if (matchesPatterns(phone, phoneBlock.blockedPatterns)) {
        res.blocked = true;
        res.reasons.push("Téléphone correspond à un pattern bloqué");
      }
    }
  }

  // Pays
  if (countryBlock.enabled && countryCode) {
    const code = String(countryCode).trim().toUpperCase();
    const allowList = countryBlock.allowList || [];
    const denyList = countryBlock.denyList || [];
    const mode = countryBlock.defaultAction || "allow"; // allow | block | challenge

    if (mode === "allow") {
      if (denyList.includes(code)) {
        res.blocked = true;
        res.reasons.push(`Pays ${code} bloqué (denyList)`);
      }
    } else if (mode === "block") {
      if (!allowList.includes(code)) {
        res.blocked = true;
        res.reasons.push(`Pays ${code} non autorisé (mode block)`);
      }
    } else if (mode === "challenge") {
      res.needsRecaptcha = true;
      if (denyList.includes(code)) {
        res.blocked = true;
        res.reasons.push(`Pays ${code} bloqué (challenge + denyList)`);
      }
      if (!res.blocked && allowList.length > 0 && !allowList.includes(code)) {
        res.needsRecaptcha = true;
        res.reasons.push(`Pays ${code} en challenge (pas dans allowList)`);
      }
    }
  }

  // Honeypot
  if (honeypotCfg.enabled) {
    const fieldVal = (hp.fieldValue || "").trim();
    const timeMs = Number(hp.timeOnPageMs || 0);
    const mouseMoved = !!hp.mouseMoved;

    if (honeypotCfg.blockIfFilled && fieldVal) {
      res.blocked = true;
      res.reasons.push("Honeypot rempli (champ caché)");
    }

    if (!res.blocked && honeypotCfg.minFillTimeMs > 0) {
      if (timeMs > 0 && timeMs < Number(honeypotCfg.minFillTimeMs)) {
        res.blocked = true;
        res.reasons.push(`Soumission trop rapide (${timeMs}ms)`);
      }
    }

    if (!res.blocked && honeypotCfg.checkMouseMove) {
      if (!mouseMoved) {
        res.blocked = true;
        res.reasons.push("Aucun mouvement de souris détecté (honeypot)");
      }
    }
  }

  if (recaptchaCfg?.enabled) res.needsRecaptcha = true;

  return res;
}

/* ------------------------------------------------------------------ */
/* Fetch product info                                                  */
/* ------------------------------------------------------------------ */
async function fetchProductInfo(admin, variantGid) {
  if (!admin || !variantGid) return { productTitle: null, variantTitle: null };

  try {
    const QUERY = `
      query tfProductInfo($id: ID!) {
        productVariant(id: $id) {
          id
          title
          product { id title }
        }
      }
    `;
    const resp = await admin.graphql(QUERY, { variables: { id: variantGid } });
    const j = await resp.json();
    const pv = j?.data?.productVariant;
    if (!pv) return { productTitle: null, variantTitle: null };

    return {
      productTitle: pv.product?.title || null,
      variantTitle: pv.title || null,
    };
  } catch (e) {
    console.error("fetchProductInfo error:", e);
    return { productTitle: null, variantTitle: null };
  }
}

/* ------------------------------------------------------------------ */
/* ACTION                                                              */
/* ------------------------------------------------------------------ */
export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.public.appProxy(request);
    const shop = session?.shop;

    if (!shop) {
      return json(
        {
          ok: false,
          error:
            "Aucune session pour cette boutique via App Proxy. Ouvrez l’application depuis l’admin Shopify puis réessayez.",
        },
        { status: 401 }
      );
    }

    if (!admin) {
      return json(
        {
          ok: false,
          error: "Admin API indisponible pour cette boutique (offline session manquante).",
        },
        { status: 401 }
      );
    }

    const body = await readBodySafe(request);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Body manquant ou invalide." }, { status: 400 });
    }

    const rawVariantId = body.variantId;
    let variantGid = null;
    if (rawVariantId) {
      const s = String(rawVariantId);
      variantGid = s.startsWith("gid://") ? s : `gid://shopify/ProductVariant/${s}`;
    }

    const qty = Number(body.qty || 1);
    if (!variantGid || !(qty > 0)) {
      return json({ ok: false, error: "variantId/qty invalid." }, { status: 400 });
    }

    const productInfo = await fetchProductInfo(admin, variantGid);

    const fields = body.fields || {};
    const fullPhone = buildFullPhone(fields);
    const countryCode = await resolveCountryCode(admin, fields, body);

    const antibotCfg = await loadAntibotConfig(admin);
    const clientIp = getClientIpFromRequest(request, antibotCfg);
    const userAgent = request.headers.get("user-agent") || null;

    // ✅ 1) RATE LIMIT: bloque si > 2 commandes dans la fenêtre (par IP/phone)
    const rl = await enforceRateLimit({ shop, clientIp, fullPhone, antibotCfg });
    if (rl.blocked) {
      return json(
        {
          ok: false,
          code: rl.code,
          error:
            "Trop de tentatives de commande en peu de temps. Merci de patienter quelques minutes puis réessayer.",
          details: rl.details,
        },
        { status: 429 }
      );
    }

    const honeypotInfo = body.honeypot || {};

    const recaptchaTokenRaw =
      body.recaptchaToken ||
      body.recaptcha_token ||
      body["g-recaptcha-response"] ||
      body?.recaptcha?.token ||
      (typeof body?.recaptcha === "string" ? body.recaptcha : "") ||
      "";

    const recaptchaToken = String(recaptchaTokenRaw || "").trim();

    const clientRecaptchaAction = String(
      body.recaptchaAction || body.recaptcha_action || body?.recaptcha?.action || ""
    ).trim();

    // ✅ 2) TES REGLES ANTIBOT (honeypot / phone / country / etc.)
    const antibotResult = evaluateAntibot({
      config: antibotCfg,
      clientIp,
      countryCode,
      fullPhone,
      honeypot: honeypotInfo,
    });

    if (antibotResult.blocked) {
      return json(
        {
          ok: false,
          code: "ANTIBOT_BLOCKED",
          error:
            "Commande bloquée (sécurité anti-bot). Vérifiez vos informations et réessayez.",
          reasons: antibotResult.reasons,
        },
        { status: 403 }
      );
    }

    // ✅ 3) reCAPTCHA v3 (score)
    if (antibotResult.needsRecaptcha) {
      const minScore =
        antibotResult.recaptchaMinScore != null ? antibotResult.recaptchaMinScore : 0.5;

      const expectedAction =
        String(antibotResult.recaptchaExpectedAction || "tf_submit").trim() || "tf_submit";

      const row = await prisma.shopAntibotSettings.findUnique({
        where: { shopDomain: shop },
        select: { recaptchaSecretEnc: true },
      });

      let secret = "";
      if (row?.recaptchaSecretEnc) {
        try {
          secret = decryptSecret(row.recaptchaSecretEnc) || "";
        } catch (e) {
          console.error("Decrypt recaptcha secret failed:", e);
          secret = "";
        }
      }

      if (!secret) {
        return json(
          {
            ok: false,
            code: "RECAPTCHA_MISCONFIG",
            error:
              "reCAPTCHA est activé mais la clé secrète n’est pas configurée. Ouvrez l’app et ajoutez la clé.",
          },
          { status: 403 }
        );
      }

      const check = await verifyRecaptchaV3({
        token: recaptchaToken,
        remoteip: clientIp,
        expectedAction,
        minScore,
        secret,
      });

      if (!check.ok) {
        console.warn("TripleForm COD — reCAPTCHA failed:", {
          shop,
          clientIp,
          expectedAction,
          clientAction: clientRecaptchaAction || null,
          gotAction: check.action,
          score: check.score,
          success: check.success,
          reason: check.reason,
        });

        return json(
          {
            ok: false,
            code: "RECAPTCHA_FAILED",
            error:
              "Commande bloquée (vérification anti-robot). Réessayez ou vérifiez votre connexion.",
            details: {
              reason: check.reason,
              success: check.success,
              score: check.score,
              action: check.action,
              expectedAction,
            },
          },
          { status: 403 }
        );
      }
    }

    const shippingAddress = buildShippingAddress(fields, fullPhone, countryCode);

    const currency = body?.currency || null;
    const totals = {
      priceCents: body?.priceCents != null ? Number(body.priceCents) : null,
      totalCents: body?.totalCents != null ? Number(body.totalCents) : null,
      discountCents: body?.discountCents != null ? Number(body.discountCents) : null,
      qty,
      currency,
      productId: body?.productId || null,
      variantId: rawVariantId || null,
      pageUrl: body?.pageUrl || null,
      eventId: body?.eventId || null,
    };

    const note = [
      "Created by TripleForm COD",
      fields.notes ? `Notes: ${fields.notes}` : null,
      countryCode ? `Country: ${countryCode}` : null,
      currency && totals.totalCents != null
        ? `Total shown: ${(Number(totals.totalCents) / 100).toFixed(2)} ${currency}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const input = {
      lineItems: [{ variantId: variantGid, quantity: qty }],
      shippingAddress,
      tags: [TF_TAG],
      note,
      customAttributes: [
        { key: "tf_name", value: String(fields.name || "") },
        { key: "tf_phone", value: fullPhone },
        { key: "tf_city", value: String(fields.city || "") },
        { key: "tf_province", value: String(fields.province || "") },
        { key: "tf_country", value: countryCode || "" },
      ],
    };

    const CREATE = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder { id invoiceUrl }
          userErrors { field message }
        }
      }
    `;

    const createResp = await admin.graphql(CREATE, { variables: { input } });
    const createJson = await createResp.json();
    const createData = createJson?.data?.draftOrderCreate;
    const userErrA = createData?.userErrors || [];
    const draft = createData?.draftOrder || null;

    if (userErrA.length) {
      return json(
        { ok: false, error: userErrA[0]?.message || "draftOrderCreate error", details: userErrA },
        { status: 400 }
      );
    }

    if (!draft?.id) {
      return json({ ok: false, error: "No draft order id returned." }, { status: 500 });
    }

    const COMPLETE = `
      mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
        draftOrderComplete(id: $id, paymentPending: $paymentPending) {
          draftOrder {
            id
            invoiceUrl
            order { id name }
          }
          userErrors { field message }
        }
      }
    `;

    const compResp = await admin.graphql(COMPLETE, {
      variables: { id: draft.id, paymentPending: true },
    });

    const compJson = await compResp.json();
    const compData = compJson?.data?.draftOrderComplete;
    const userErrB = compData?.userErrors || [];
    const completedDraft = compData?.draftOrder || null;
    const orderObj = completedDraft?.order || null;

    if (userErrB.length) {
      return json(
        {
          ok: false,
          error: userErrB[0]?.message || "draftOrderComplete error",
          draftInvoiceUrl: draft?.invoiceUrl || null,
        },
        { status: 400 }
      );
    }

    const orderName = orderObj?.name || null;

    // Google Sheets (fail-safe)
    try {
      const orderForSheet = {
        shop,
        createdAt: new Date().toISOString(),
        order: {
          id: orderObj?.id || completedDraft?.id || draft.id || null,
          name: orderName,
        },
        customer: {
          name: fields.name || "",
          phone: fullPhone,
          city: fields.city || "",
          province: fields.province || "",
          address: fields.address || "",
          country: countryCode || "",
          notes: fields.notes || "",
        },
        cart: {
          productTitle:
            productInfo.productTitle ||
            body?.productTitle ||
            body?.product_title ||
            body?.productName ||
            body?.product_name ||
            body?.title ||
            (body?.product && (body.product.title || body.product.name)) ||
            "",
          variantTitle: productInfo.variantTitle || body?.variantTitle || body?.variant_title || "",
          quantity: qty,
          subtotal: totals.priceCents != null ? Number(totals.priceCents) / 100 : null,
          shipping: body?.shippingAmount != null ? Number(body.shippingAmount) : null,
          total: totals.totalCents != null ? Number(totals.totalCents) / 100 : null,
          totalCents: totals.totalCents != null ? Number(totals.totalCents) : null,
          currency,
        },
        meta: { source: "tripleform-cod" },
      };

      await appendOrderToSheet({ shop, order: orderForSheet });
    } catch (err) {
      console.error("Erreur Google Sheets :", err);
    }

    // Pixels
    try {
      await trackOrderWithPixels({
        admin,
        shop,
        totals,
        fields: { ...fields, fullPhone, countryCode },
        shippingAddress,
        orderName,
        clientIp,
        userAgent,
      });
    } catch (err) {
      console.error("Erreur tracking pixels Tripleform COD :", err);
    }

    return json({
      ok: true,
      draftId: completedDraft?.id || draft.id,
      draftInvoiceUrl: completedDraft?.invoiceUrl || draft?.invoiceUrl || null,
      orderName,
    });
  } catch (e) {
    console.error("proxy.submit error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

export const loader = () => json({ ok: true, where: "proxy.submit" });
