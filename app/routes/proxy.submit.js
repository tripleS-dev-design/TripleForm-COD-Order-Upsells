// ===== File: app/routes/proxy.submit.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";
import { trackOrderWithPixels } from "../utils/pixels.server";

const TF_TAG = "TripleForm COD"; // 👈 tag unique pour reconnaître les commandes de l’app

/**
 * Essaie de reconstruire un numéro complet à partir de tous les champs.
 * - Cherche d’abord un champ déjà complet (fullPhone, phoneFull, whatsapp…)
 * - Sinon, combine un préfixe (+212, +213, etc.) avec le champ numéro.
 */
function buildFullPhone(fields = {}) {
  const f = fields || {};

  // 1) champs "évidents" déjà complets
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

  // 2) préfixe + numéro (on essaie d’être large sur les noms)
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
  const phoneTrim = phoneRaw.trim();

  if (!prefixTrim && !phoneTrim) return "";

  // si phone contient déjà le préfixe, on renvoie tel quel
  if (phoneTrim && prefixTrim && phoneTrim.startsWith(prefixTrim)) {
    return phoneTrim;
  }

  if (prefixTrim && phoneTrim) return `${prefixTrim}${phoneTrim}`;
  if (phoneTrim) return phoneTrim;
  return prefixTrim;
}

/**
 * Devine le code pays (ISO2) à partir du body / des champs / du shop.
 * On ne force plus "DZ" si le formulaire envoie autre chose.
 */
async function resolveCountryCode(admin, fields = {}, body = {}) {
  const pick = (v) => (v == null ? "" : String(v)).trim();

  // 1) D’abord ce que le front envoie explicitement
  const fromBody = pick(body.countryCode || body.country || body.codCountry);
  if (fromBody) return fromBody.toUpperCase();

  // 2) Ensuite ce qui peut venir des champs du formulaire
  const fromFields = pick(
    fields.country ||
      fields.countryCode ||
      fields.codCountry ||
      fields.pays
  );
  if (fromFields) return fromFields.toUpperCase();

  // 3) Sinon, on essaie de lire le pays par défaut du shop via l’Admin API
  if (admin) {
    try {
      const QUERY = `
        query tfShopCountry {
          shop {
            billingAddress {
              countryCode
            }
          }
        }
      `;
      const resp = await admin.graphql(QUERY);
      const data = await resp.json();
      const code = data?.data?.shop?.billingAddress?.countryCode;
      if (code) {
        return String(code).toUpperCase();
      }
    } catch (e) {
      console.error("resolveCountryCode shop fallback error:", e);
    }
  }

  // 4) Vieux fallback par défaut
  return "DZ";
}

/**
 * Construit l'adresse de livraison à partir des champs du formulaire
 */
function buildShippingAddress(fields = {}, fullPhone = "", countryCode = "DZ") {
  const country =
    (fields.country ||
      fields.countryCode ||
      fields.codCountry ||
      countryCode ||
      "DZ") + "";
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

/* ====================== Anti-bot helpers ====================== */

/**
 * Charge la config anti-bot depuis shop.metafields (namespace tripleform_cod, key antibot)
 */
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

/**
 * Récupère l’IP client en respectant la config ipBlock.clientIpHeader si présent.
 */
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

/**
 * Vérifie si une chaîne matche une liste de patterns RegExp simples.
 */
function matchesPatterns(str, patterns = []) {
  if (!str) return false;
  const s = String(str);
  for (const p of patterns || []) {
    if (!p) continue;
    try {
      const re = new RegExp(p);
      if (re.test(s)) return true;
    } catch {
      // ignore pattern invalide
    }
  }
  return false;
}

/**
 * Applique les règles Anti-bot de base (IP, téléphone, pays + honeypot).
 */
function evaluateAntibot({
  config,
  clientIp,
  countryCode,
  fullPhone,
  honeypot,
}) {
  const res = {
    blocked: false,
    reasons: [],
  };

  if (!config || typeof config !== "object") return res;

  const ipBlock = config.ipBlock || {};
  const phoneBlock = config.phoneBlock || {};
  const countryBlock = config.countryBlock || {};
  const honeypotCfg = config.honeypot || {};
  const hp = honeypot || {};

  /* --- IP --- */
  if (ipBlock.enabled && clientIp) {
    const ip = clientIp;

    const allowList = ipBlock.allowList || [];
    const denyList = ipBlock.denyList || [];
    const cidrList = ipBlock.cidrList || [];

    // allowList prioritaire : si dedans -> jamais bloqué par IP
    if (!allowList.includes(ip)) {
      // deny exact
      if (denyList.includes(ip)) {
        res.blocked = true;
        res.reasons.push(`IP ${ip} dans denyList`);
      }

      // TODO: plus tard gérer les plages CIDR correctement
      if (!res.blocked && Array.isArray(cidrList) && cidrList.length > 0) {
        // pour l’instant, on ne bloque pas sur CIDR (éviter faux positifs)
      }
    }
  }

  /* --- Téléphone --- */
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
      const ok = allowed.some((p) =>
        phone.startsWith(String(p || "").trim())
      );
      if (!ok && allowed.length > 0) {
        res.blocked = true;
        res.reasons.push(
          `Préfixe téléphone non autorisé (attendu: ${allowed.join(", ")})`
        );
      }
    }

    if (
      !res.blocked &&
      Array.isArray(phoneBlock.blockedNumbers) &&
      phoneBlock.blockedNumbers.length > 0
    ) {
      if (phoneBlock.blockedNumbers.includes(phone)) {
        res.blocked = true;
        res.reasons.push("Téléphone dans la liste des numéros bloqués");
      }
    }

    if (
      !res.blocked &&
      Array.isArray(phoneBlock.blockedPatterns) &&
      phoneBlock.blockedPatterns.length > 0
    ) {
      if (matchesPatterns(phone, phoneBlock.blockedPatterns)) {
        res.blocked = true;
        res.reasons.push("Téléphone correspond à un pattern bloqué");
      }
    }

    // TODO: plus tard => maxOrdersPerPhonePerDay (nécessite stockage)
  }

  /* --- Pays --- */
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
      // tant qu’on n’a pas branché reCAPTCHA, on traite "challenge" comme block
      if (denyList.includes(code)) {
        res.blocked = true;
        res.reasons.push(`Pays ${code} bloqué (challenge + denyList)`);
      }
      if (!allowList.includes(code) && allowList.length > 0) {
        res.blocked = true;
        res.reasons.push(`Pays ${code} en challenge et pas dans allowList`);
      }
    }
  }

  /* --- Honeypot / temps / souris --- */
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
        res.reasons.push(
          `Soumission trop rapide (${timeMs}ms < ${honeypotCfg.minFillTimeMs}ms)`
        );
      }
    }

    if (!res.blocked && honeypotCfg.checkMouseMove) {
      if (!mouseMoved) {
        res.blocked = true;
        res.reasons.push("Aucun mouvement de souris détecté (honeypot)");
      }
    }
  }

  return res;
}

/* ====================== Fetch infos produit (Admin API) ====================== */

async function fetchProductInfo(admin, variantGid) {
  if (!admin || !variantGid) return { productTitle: null, variantTitle: null };

  try {
    const QUERY = `
      query tfProductInfo($id: ID!) {
        productVariant(id: $id) {
          id
          title
          product {
            id
            title
          }
        }
      }
    `;
    const resp = await admin.graphql(QUERY, {
      variables: { id: variantGid },
    });
    const json = await resp.json();
    const pv = json?.data?.productVariant;
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

/* ====================== ACTION (submit COD) ====================== */

export const action = async ({ request }) => {
  try {
    // 1) Authentifier la requête App Proxy
    const { admin, session } = await authenticate.public.appProxy(request);

    const shop = session?.shop; // ex: "selyadev.myshopify.com"

    if (!shop) {
      return json(
        {
          ok: false,
          error:
            "No session for this shop via app proxy. Ouvre l’app depuis l’admin une fois puis réessaie.",
        },
        { status: 401 }
      );
    }

    if (!admin) {
      return json(
        {
          ok: false,
          error:
            "Admin API client unavailable for this shop (no offline session).",
        },
        { status: 401 }
      );
    }

    // 2) Lire le JSON envoyé par le formulaire COD
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return json(
        { ok: false, error: "Missing or invalid JSON body." },
        { status: 400 }
      );
    }

    // ---- variantId → GID Shopify obligatoire ----
    const rawVariantId = body.variantId; // "4636..." ou "gid://shopify/ProductVariant/4636..."
    let variantGid = null;

    if (rawVariantId) {
      const s = String(rawVariantId);
      variantGid = s.startsWith("gid://")
        ? s
        : `gid://shopify/ProductVariant/${s}`;
    }

    const qty = Number(body.qty || 1);

    if (!variantGid || !(qty > 0)) {
      return json(
        { ok: false, error: "variantId/qty invalid." },
        { status: 400 }
      );
    }
    // ---------------------------------------------

    // ⚙️ Récupérer infos produit / variante
    const productInfo = await fetchProductInfo(admin, variantGid);

    // 3) Téléphone complet + pays + config Anti-bot
    const fields = body.fields || {};
    const fullPhone = buildFullPhone(fields);
    const countryCode = await resolveCountryCode(admin, fields, body);

    // 🔐 Infos Honeypot venant du front
    const honeypotInfo = body.honeypot || {};

    // Chargement de la config anti-bot (si elle existe)
    const antibotCfg = await loadAntibotConfig(admin);

    // IP & user-agent
    const clientIp = getClientIpFromRequest(request, antibotCfg);
    const userAgent = request.headers.get("user-agent") || null;

    // Vérification Anti-bot (IP / téléphone / pays / honeypot)
    const antibotResult = evaluateAntibot({
      config: antibotCfg,
      clientIp,
      countryCode,
      fullPhone,
      honeypot: honeypotInfo,
    });

    if (antibotResult.blocked) {
      console.warn(
        "TripleForm COD — Anti-bot blocked request:",
        shop,
        clientIp,
        antibotResult.reasons
      );
      return json(
        {
          ok: false,
          code: "ANTIBOT_BLOCKED",
          error: "Request blocked by Anti-bot rules.",
          reasons: antibotResult.reasons,
        },
        { status: 403 }
      );
    }

    // Adresse de livraison
    const shippingAddress = buildShippingAddress(
      fields,
      fullPhone,
      countryCode
    );

    // Totaux (pour Sheets + pixels)
    const currency = body?.currency || null;
    const totals = {
      priceCents:
        body?.priceCents != null ? Number(body.priceCents) : null,
      totalCents:
        body?.totalCents != null ? Number(body.totalCents) : null,
      discountCents:
        body?.discountCents != null ? Number(body.discountCents) : null,
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
        ? `Total shown: ${(Number(totals.totalCents) / 100).toFixed(
            2
          )} ${currency}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const input = {
      lineItems: [
        {
          variantId: variantGid,
          quantity: qty,
        },
      ],
      shippingAddress,
      // 👇 tag spécial pour reconnaître les commandes TripleForm dans les dashboards
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

    // 4) draftOrderCreate
    const CREATE = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder { id invoiceUrl }
          userErrors { field message }
        }
      }
    `;

    const createResp = await admin.graphql(CREATE, {
      variables: { input },
    });
    const createJson = await createResp.json();
    const createData = createJson?.data?.draftOrderCreate;
    const userErrA = createData?.userErrors || [];
    const draft = createData?.draftOrder || null;

    if (userErrA.length) {
      return json(
        {
          ok: false,
          error: userErrA[0]?.message || "draftOrderCreate error",
          details: userErrA,
        },
        { status: 400 }
      );
    }

    if (!draft?.id) {
      return json(
        { ok: false, error: "No draft order id returned." },
        { status: 500 }
      );
    }

    // 5) draftOrderComplete → crée la vraie commande
    const COMPLETE = `
      mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
        draftOrderComplete(id: $id, paymentPending: $paymentPending) {
          draftOrder {
            id
            invoiceUrl
            order {
              id
              name
            }
          }
          userErrors {
            field
            message
          }
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

    // 6) Envoi vers Google Sheets (serveur -> Google)
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
          // ✅ vrai titre produit (Admin API, puis fallback éventuel sur le body)
          productTitle:
            productInfo.productTitle ||
            body?.productTitle ||
            body?.product_title ||
            body?.productName ||
            body?.product_name ||
            body?.title ||
            (body?.product &&
              (body.product.title || body.product.name)) ||
            "",

          // ✅ titre de la variante (si tu veux une colonne séparée)
          variantTitle:
            productInfo.variantTitle ||
            body?.variantTitle ||
            body?.variant_title ||
            "",

          // quantité
          quantity: qty,

          // montants (en money, pas en cents)
          subtotal:
            totals.priceCents != null
              ? Number(totals.priceCents) / 100
              : null,

          shipping:
            body?.shippingAmount != null
              ? Number(body.shippingAmount)
              : null,

          total:
            totals.totalCents != null
              ? Number(totals.totalCents) / 100
              : null,

          totalCents:
            totals.totalCents != null ? Number(totals.totalCents) : null,
          currency,
        },

        meta: {
          source: "tripleform-cod",
        },
      };

      await appendOrderToSheet({ shop, admin, order: orderForSheet });
    } catch (err) {
      console.error(
        "Erreur lors de l'envoi de la commande vers Google Sheets :",
        err
      );
      // on ne bloque pas la commande si Sheets échoue
    }

    // 7) Tracking Pixels (Facebook CAPI Purchase, etc.)
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
      // pareil : on ne bloque pas la commande si le tracking échoue
    }

    // ✅ Succès : la commande est créée
    return json({
      ok: true,
      draftId: completedDraft?.id || draft.id,
      draftInvoiceUrl:
        completedDraft?.invoiceUrl || draft?.invoiceUrl || null,
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

// Optionnel pour tester vite fait dans le navigateur
export const loader = () => json({ ok: true, where: "proxy.submit" });
