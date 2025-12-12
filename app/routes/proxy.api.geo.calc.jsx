// ===== File: app/routes/proxy.api.geo.calc.jsx =====
import { json } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";

/**
 * Récupère le shop depuis l’URL (?shop=) ou les headers d’app proxy
 */
function getShopFromExternalRequest(request) {
  const url = new URL(request.url);
  const qsShop = url.searchParams.get("shop");
  if (qsShop) return qsShop;

  const hdrShop = request.headers.get("x-shopify-shop-domain");
  if (hdrShop) return hdrShop;

  return null;
}

function normalizeStr(str) {
  return (str || "").toString().trim().toLowerCase();
}

/**
 * Applique la config GEO (isFree, mode, priceBrackets, provinceRates, cityRates, advanced)
 */
function calcShippingFromConfig(cfg, input) {
  const {
    country: countryIn = "MA",
    province = "",
    city = "",
    total = 0, // montant en devise (MAD, DZ, etc.)
    isCod = true,
  } = input || {};
  const orderTotal = Number(total) || 0;

  if (!cfg || typeof cfg !== "object") {
    return {
      amount: 0,
      currency: "MAD",
      baseRate: 0,
      codExtraFee: 0,
      final: 0,
      note: "",
      minOrderAmount: 0,
      freeThreshold: null,
      mode: "price",
      isFree: true,
      canSubmit: true,
      blockReason: null,
    };
  }

  const country = (countryIn || cfg.country || "MA").toUpperCase().slice(0, 2);
  const currency = cfg.currency || "MAD";
  const adv = cfg.advanced || {};
  const mode = cfg.mode || "price";

  let baseRate = 0;

  // --- 1) Livraison globale gratuite ---
  if (cfg.isFree) {
    baseRate = 0;
  }
  // --- 2) Mode par prix ---
  else if (mode === "price") {
    const brackets = cfg.priceBrackets || [];
    for (const b of brackets) {
      const min = b.min == null ? -Infinity : Number(b.min);
      const max = b.max == null ? Infinity : Number(b.max);
      if (orderTotal >= min && orderTotal < max) {
        baseRate = Number(b.rate || 0);
        break;
      }
    }
  }
  // --- 3) Mode par province / wilaya ---
  else if (mode === "province") {
    const arr = (cfg.provinceRates && cfg.provinceRates[country]) || [];
    const nProvince = normalizeStr(province);
    const match = arr.find((p) => {
      const nName = normalizeStr(p.name);
      const nCode = normalizeStr(p.code);
      return (
        (nName && nProvince && nName === nProvince) ||
        (nCode && nProvince && nCode === nProvince)
      );
    });
    baseRate = match ? Number(match.rate || 0) : 0;
  }
  // --- 4) Mode par ville ---
  else if (mode === "city") {
    const arr = (cfg.cityRates && cfg.cityRates[country]) || [];
    const nCity = normalizeStr(city);
    const match = arr.find((c) => normalizeStr(c.name) === nCity);
    baseRate = match ? Number(match.rate || 0) : 0;
  }

  // Tarif par défaut si rien trouvé
  if (!cfg.isFree && baseRate === 0 && adv.defaultRate != null) {
    baseRate = Number(adv.defaultRate || 0);
  }

  // Seuil de livraison gratuite
  if (!cfg.isFree && adv.freeThreshold != null) {
    const thr = Number(adv.freeThreshold);
    if (!Number.isNaN(thr) && thr > 0 && orderTotal >= thr) {
      baseRate = 0;
    }
  }

  // Frais COD éventuel
  let codExtraFee = 0;
  if (isCod && adv.codExtraFee != null) {
    codExtraFee = Number(adv.codExtraFee || 0);
  }

  const final = cfg.isFree ? 0 : baseRate + codExtraFee;

  // Minimum de commande
  let canSubmit = true;
  let blockReason = null;
  if (adv.minOrderAmount != null) {
    const minOrder = Number(adv.minOrderAmount || 0);
    if (!Number.isNaN(minOrder) && minOrder > 0 && orderTotal < minOrder) {
      canSubmit = false;
      blockReason = `Montant minimum de commande : ${minOrder.toFixed(
        2
      )} ${currency}`;
    }
  }

  const isFreeShipping = !!cfg.isFree || final === 0;

  return {
    amount: final,
    currency,
    baseRate,
    codExtraFee,
    final,
    note: adv.note || "",
    minOrderAmount: adv.minOrderAmount || 0,
    freeThreshold: adv.freeThreshold ?? null,
    mode,
    isFree: isFreeShipping,
    canSubmit,
    blockReason,
  };
}

/**
 * Utilisé par le JS du storefront (form COD)
 * → POST JSON depuis /apps/tripleform-cod/api/geo/calc
 */
export const action = async ({ request }) => {
  try {
    const shop = getShopFromExternalRequest(request);
    if (!shop) {
      return json(
        { ok: false, error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    // Payload envoyé par tripleform.js (recalcGeo)
    const body = await request.json().catch(() => ({}));
    const country = body.country || "MA";
    const province = body.province || "";
    const city = body.city || "";
    const cartTotalCents = Number(body.cartTotalCents || 0);
    const totalMoney = cartTotalCents / 100; // centimes → devise

    // Admin non authentifié (app proxy)
    const { admin } = await unauthenticated.admin(shop);

    // ❗ Correction GraphQL : metafield sur "shop", pas à la racine
    const q = await admin.graphql(`
      query GetGeoConfigForCalc {
        shop {
          id
          metafield(namespace: "tripleform_cod", key: "geo") {
            id
            type
            value
          }
        }
      }
    `);

    const payload = typeof q.json === "function" ? await q.json() : q;
    const raw = payload?.data?.shop?.metafield?.value;
    const cfg = raw ? JSON.parse(raw) : null;

    const shipping = calcShippingFromConfig(cfg, {
      country,
      province,
      city,
      total: totalMoney,
      isCod: true,
    });

    const labelAmount = (shipping.amount || 0)
      .toFixed(2)
      .replace(".", ",");
    const label = shipping.isFree
      ? "Livraison gratuite"
      : `${labelAmount} ${shipping.currency}`;

    return json({
      ok: true,
      shipping: {
        amount: shipping.amount, // ex: 29
        currency: shipping.currency,
        label,                    // ex: "29,00 MAD"
        baseRate: shipping.baseRate,
        codExtraFee: shipping.codExtraFee,
        note: shipping.note,
      },
      rules: {
        minOrderAmount: shipping.minOrderAmount,
        freeThreshold: shipping.freeThreshold,
      },
      canSubmit: shipping.canSubmit,
      blockReason: shipping.blockReason,
    });
  } catch (e) {
    console.error("geo.calc error", e);
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};

// facultatif : permet de tester en GET dans le navigateur
export const loader = (args) => action(args);
