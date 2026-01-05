// ===== File: app/routes/api.offers.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GET /api/offers/load
 *
 * ✅ Retourne un payload EXACTEMENT compatible avec Section2Offers.jsx (Option A)
 * - Même schema (global.colors, offers[], upsells[], thankYou)
 * - Accepte aussi les anciens formats et les convertit:
 *   1) Ancien format: { discount: {...}, upsell: {...}, display: {...} }
 *   2) Ancien tableau: [ { ...offer } ]
 *   3) Ancien schema v8: { global:{enabled,currency...}, offers:[{type,value,shopifyProductId...}], upsells:[...], display:{...} }
 *
 * Metafield:
 * namespace: "tripleform_cod"
 * key: "offers"
 */

const META_VERSION = 33;

/* ============================== Defaults (match Section2Offers.jsx) ============================== */
const DEFAULT_GLOBAL_COLORS = {
  paletteId: "clean-pro",
  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",
  iconBg: "#EEF2FF",
  buttonBg: "#111827",
  buttonTextColor: "#FFFFFF",
  buttonBorder: "#111827",
};

const DEFAULT_OFFER = {
  enabled: true,
  showInPreview: true,
  title: "Offre spéciale",
  description: "Ajoutez cette offre pour augmenter vos conversions",
  productId: "", // ✅ same name as Section2Offers.jsx
  iconUrl: "",
  imageUrl: "",
  layoutStyle: "image-left",
  useGlobalColors: true,
  colors: {
    cardBg: "#FFFFFF",
    borderColor: "#E5E7EB",
    iconBg: "#EEF2FF",
    buttonBg: "#111827",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "#111827",
  },
  buttonText: "Activer",
  qtyMultiplier: 1, // ✅ replaces minQuantity
  discountEnabled: false,
  discountType: "percentage", // "percentage" | "fixed"
  discountValue: 10,
};

const DEFAULT_UPSELL = {
  enabled: true,
  showInPreview: true,
  title: "Upsell",
  description: "Proposition complémentaire au produit",
  productId: "",
  iconUrl: "",
  imageUrl: "",
  layoutStyle: "image-left",
  useGlobalColors: true,
  colors: {
    cardBg: "#FFFFFF",
    borderColor: "#E5E7EB",
    iconBg: "#ECFDF5",
    buttonBg: "#111827",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "#111827",
  },
};

const DEFAULT_THANKYOU_COLORS = {
  paletteId: "brand-gradient",
  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",
  iconBg: "#EEF2FF",
  buttonBg: "#0B3B82",
  buttonTextColor: "#FFFFFF",
  buttonBorder: "#0B3B82",
};

const DEFAULT_THANKYOU = {
  enabled: true,
  mode: "simple", // "simple" | "popup"
  autoOpenDelayMs: 250,
  title: "Thank you!",
  message:
    "Your order has been received. Our team will contact you shortly to confirm.",
  imageUrl: "",
  iconUrl: "",
  primaryEnabled: true,
  primaryText: "Continue shopping",
  primaryUrl: "/",
  secondaryEnabled: false,
  secondaryText: "Track my order",
  secondaryUrl: "/pages/track-order",
  layout: "image-top",
  size: "md",
  useGlobalColors: true,
  colors: { ...DEFAULT_THANKYOU_COLORS },
  radius: 16,
  imageHeight: 160,
  showChip: true,
  chipText: "Order confirmed",
};

const DEFAULT_CFG = {
  meta: { version: META_VERSION },
  global: { enabled: true, colors: { ...DEFAULT_GLOBAL_COLORS } },
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
  thankYou: JSON.parse(JSON.stringify(DEFAULT_THANKYOU)),
};

/* ============================== utils ============================== */
function isObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}
function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  const i = Math.round(x);
  return Math.max(min, Math.min(max, i));
}
function toBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}
function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/* ============================== Normalizer (final schema) ============================== */
function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;

  // start with base
  const x = { ...d, ...(isObject(raw) ? raw : {}) };

  // meta
  x.meta = { ...d.meta, ...(isObject(raw?.meta) ? raw.meta : {}) };
  if (!x.meta?.version) x.meta.version = META_VERSION;

  // global
  x.global = { ...d.global, ...(isObject(raw?.global) ? raw.global : {}) };
  x.global.enabled = toBool(x.global.enabled, true);
  x.global.colors = {
    ...DEFAULT_GLOBAL_COLORS,
    ...(isObject(raw?.global?.colors) ? raw.global.colors : {}),
  };

  // offers/upsells arrays
  const rawOffers = Array.isArray(raw?.offers) ? raw.offers : d.offers;
  const rawUpsells = Array.isArray(raw?.upsells) ? raw.upsells : d.upsells;

  x.offers = rawOffers.slice(0, 3).map((o) => {
    const oo = isObject(o) ? o : {};
    const colors = isObject(oo.colors) ? oo.colors : {};
    return {
      ...DEFAULT_OFFER,
      ...oo,
      enabled: toBool(oo.enabled, DEFAULT_OFFER.enabled),
      showInPreview: toBool(oo.showInPreview, DEFAULT_OFFER.showInPreview),
      productId: oo.productId != null ? String(oo.productId) : "",
      iconUrl: oo.iconUrl || "",
      imageUrl: oo.imageUrl || "",
      layoutStyle: oo.layoutStyle || DEFAULT_OFFER.layoutStyle,
      useGlobalColors: oo.useGlobalColors !== false,
      colors: { ...DEFAULT_OFFER.colors, ...colors },
      buttonText: oo.buttonText || DEFAULT_OFFER.buttonText,
      qtyMultiplier: clampInt(oo.qtyMultiplier, 1, 3, DEFAULT_OFFER.qtyMultiplier),
      discountEnabled: toBool(oo.discountEnabled, false),
      discountType:
        oo.discountType === "fixed" ? "fixed" : "percentage",
      discountValue:
        typeof oo.discountValue === "number"
          ? oo.discountValue
          : oo.discountValue != null
          ? toNum(oo.discountValue, DEFAULT_OFFER.discountValue)
          : DEFAULT_OFFER.discountValue,
    };
  });

  x.upsells = rawUpsells.slice(0, 3).map((u) => {
    const uu = isObject(u) ? u : {};
    const colors = isObject(uu.colors) ? uu.colors : {};
    return {
      ...DEFAULT_UPSELL,
      ...uu,
      enabled: toBool(uu.enabled, DEFAULT_UPSELL.enabled),
      showInPreview: toBool(uu.showInPreview, DEFAULT_UPSELL.showInPreview),
      productId: uu.productId != null ? String(uu.productId) : "",
      iconUrl: uu.iconUrl || "",
      imageUrl: uu.imageUrl || "",
      layoutStyle: uu.layoutStyle || DEFAULT_UPSELL.layoutStyle,
      useGlobalColors: uu.useGlobalColors !== false,
      colors: { ...DEFAULT_UPSELL.colors, ...colors },
    };
  });

  // thankYou
  const tyRaw = isObject(raw?.thankYou) ? raw.thankYou : {};
  x.thankYou = {
    ...DEFAULT_THANKYOU,
    ...tyRaw,
    enabled: tyRaw.enabled !== false,
    mode: tyRaw.mode === "popup" ? "popup" : "simple",
    autoOpenDelayMs: clampInt(tyRaw.autoOpenDelayMs, 0, 5000, DEFAULT_THANKYOU.autoOpenDelayMs),
    imageUrl: tyRaw.imageUrl || "",
    iconUrl: tyRaw.iconUrl || "",
    primaryEnabled: tyRaw.primaryEnabled !== false,
    secondaryEnabled: !!tyRaw.secondaryEnabled,
    layout: tyRaw.layout || DEFAULT_THANKYOU.layout,
    size: tyRaw.size || DEFAULT_THANKYOU.size,
    useGlobalColors: tyRaw.useGlobalColors !== false,
    colors: {
      ...DEFAULT_THANKYOU_COLORS,
      ...(isObject(tyRaw.colors) ? tyRaw.colors : {}),
    },
    radius: clampInt(tyRaw.radius, 10, 28, DEFAULT_THANKYOU.radius),
    imageHeight: clampInt(tyRaw.imageHeight, 120, 240, DEFAULT_THANKYOU.imageHeight),
    showChip: tyRaw.showChip !== false,
    chipText: tyRaw.chipText || DEFAULT_THANKYOU.chipText,
  };

  return x;
}

/* ============================== Converters (old -> new schema) ============================== */
function mapOldDiscountType(t) {
  // old: "percent" | "percentage" | "fixed" | "amount"
  const s = String(t || "").toLowerCase();
  if (s.includes("fix") || s.includes("amount")) return "fixed";
  return "percentage";
}

function convertOldDiscountUpsellObjectFormat(raw) {
  // old: { discount: {...}, upsell: {...}, global: {...}, display: {...} }
  const discount = isObject(raw?.discount) ? raw.discount : null;
  const upsell = isObject(raw?.upsell) ? raw.upsell : null;

  const offer = {
    ...DEFAULT_OFFER,
    enabled: toBool(discount?.enabled, false),
    title: discount?.previewTitle || discount?.title || DEFAULT_OFFER.title,
    description:
      discount?.previewDescription || discount?.description || DEFAULT_OFFER.description,
    imageUrl: discount?.imageUrl || "",
    iconUrl: discount?.iconUrl || "", // if existed
    // old icon emoji -> keep in title? we can't store emoji field now, ignore safely
    productId:
      discount?.shopifyProductId != null
        ? String(discount.shopifyProductId)
        : discount?.productId != null
        ? String(discount.productId)
        : "",
    qtyMultiplier: clampInt(discount?.minQuantity, 1, 3, 1),
    discountEnabled: toBool(discount?.enabled, false),
    discountType: mapOldDiscountType(discount?.type),
    discountValue: toNum(discount?.value, 10),
  };

  const ups = {
    ...DEFAULT_UPSELL,
    enabled: toBool(upsell?.enabled, false),
    title: upsell?.previewTitle || upsell?.title || DEFAULT_UPSELL.title,
    description:
      upsell?.previewDescription || upsell?.description || DEFAULT_UPSELL.description,
    imageUrl: upsell?.imageUrl || "",
    iconUrl: upsell?.iconUrl || "",
    productId:
      upsell?.shopifyProductId != null
        ? String(upsell.shopifyProductId)
        : upsell?.productId != null
        ? String(upsell.productId)
        : "",
  };

  const converted = {
    ...DEFAULT_CFG,
    meta: { version: META_VERSION },
    global: {
      enabled: raw?.global?.enabled !== false,
      colors: { ...DEFAULT_GLOBAL_COLORS },
    },
    offers: [offer],
    upsells: [ups],
    thankYou: JSON.parse(JSON.stringify(DEFAULT_THANKYOU)),
  };

  return withDefaults(converted);
}

function convertOldV8Schema(raw) {
  // old v8: { global:{enabled,currency,rounding}, offers:[{type,value,minQuantity,shopifyProductId,icon,imageUrl...}], upsells:[...], display:{...} }
  const offers = Array.isArray(raw?.offers) ? raw.offers : [];
  const upsells = Array.isArray(raw?.upsells) ? raw.upsells : [];

  const mappedOffers = (offers.length ? offers : [null]).map((o) => {
    const oo = isObject(o) ? o : {};
    return {
      ...DEFAULT_OFFER,
      enabled: toBool(oo.enabled, DEFAULT_OFFER.enabled),
      showInPreview: toBool(oo.showInPreview, true),
      title: oo.title || DEFAULT_OFFER.title,
      description: oo.description || DEFAULT_OFFER.description,
      productId:
        oo.shopifyProductId != null
          ? String(oo.shopifyProductId)
          : oo.productId != null
          ? String(oo.productId)
          : "",
      imageUrl: oo.imageUrl || "",
      iconUrl: oo.iconUrl || "",

      // map old discount fields to new
      discountEnabled: toBool(oo.enabled, false) && (oo.type || oo.value != null),
      discountType: mapOldDiscountType(oo.type),
      discountValue: toNum(oo.value, DEFAULT_OFFER.discountValue),

      qtyMultiplier: clampInt(oo.minQuantity, 1, 3, DEFAULT_OFFER.qtyMultiplier),
    };
  });

  const mappedUpsells = (upsells.length ? upsells : [null]).map((u) => {
    const uu = isObject(u) ? u : {};
    return {
      ...DEFAULT_UPSELL,
      enabled: toBool(uu.enabled, DEFAULT_UPSELL.enabled),
      showInPreview: toBool(uu.showInPreview, true),
      title: uu.title || DEFAULT_UPSELL.title,
      description: uu.description || DEFAULT_UPSELL.description,
      productId:
        uu.shopifyProductId != null
          ? String(uu.shopifyProductId)
          : uu.productId != null
          ? String(uu.productId)
          : "",
      imageUrl: uu.imageUrl || "",
      iconUrl: uu.iconUrl || "",
    };
  });

  const converted = {
    ...DEFAULT_CFG,
    meta: { version: META_VERSION },
    global: {
      enabled: raw?.global?.enabled !== false,
      colors: { ...DEFAULT_GLOBAL_COLORS },
    },
    offers: mappedOffers,
    upsells: mappedUpsells,
    // old schema didn't have thankYou; keep default
    thankYou: JSON.parse(JSON.stringify(DEFAULT_THANKYOU)),
  };

  return withDefaults(converted);
}

function convertOldArrayOffers(rawArray) {
  // old: [ {offer...} ] (simple list)
  const mappedOffers = rawArray.slice(0, 3).map((o) => {
    const oo = isObject(o) ? o : {};
    return {
      ...DEFAULT_OFFER,
      ...oo,
      // normalize typical older fields:
      productId:
        oo.shopifyProductId != null
          ? String(oo.shopifyProductId)
          : oo.productId != null
          ? String(oo.productId)
          : "",
      discountType: mapOldDiscountType(oo.type || oo.discountType),
      discountValue:
        oo.value != null ? toNum(oo.value, DEFAULT_OFFER.discountValue) : toNum(oo.discountValue, DEFAULT_OFFER.discountValue),
      discountEnabled:
        oo.discountEnabled != null
          ? toBool(oo.discountEnabled, false)
          : oo.type != null || oo.value != null
          ? true
          : false,
      qtyMultiplier: clampInt(oo.minQuantity || oo.qtyMultiplier, 1, 3, 1),
      showInPreview: toBool(oo.showInPreview, true),
    };
  });

  const converted = {
    ...DEFAULT_CFG,
    meta: { version: META_VERSION },
    offers: mappedOffers.length ? mappedOffers : DEFAULT_CFG.offers,
  };

  return withDefaults(converted);
}

/* ============================== Loader ============================== */
export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    if (!admin) {
      return json(
        { ok: false, error: "Unauthorized: no admin session" },
        { status: 401 }
      );
    }

    const QUERY = `
      query offersSettingsForAdmin {
        shop {
          metafield(namespace: "tripleform_cod", key: "offers") {
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

    // default
    let payload = JSON.parse(JSON.stringify(DEFAULT_CFG));

    if (mf?.value) {
      const rawValue = safeParseJson(mf.value);

      if (rawValue) {
        // ✅ 1) OLD object format: {discount, upsell}
        if (isObject(rawValue) && (rawValue.discount || rawValue.upsell)) {
          payload = convertOldDiscountUpsellObjectFormat(rawValue);
        }
        // ✅ 2) OLD array format
        else if (Array.isArray(rawValue)) {
          payload = convertOldArrayOffers(rawValue);
        }
        // ✅ 3) OLD v8-like schema (type/value/minQuantity/shopifyProductId...)
        else if (
          isObject(rawValue) &&
          (Array.isArray(rawValue.offers) ||
            Array.isArray(rawValue.upsells) ||
            rawValue.display ||
            (rawValue.global && (rawValue.global.currency || rawValue.global.rounding)))
        ) {
          payload = convertOldV8Schema(rawValue);
        }
        // ✅ 4) Already new schema (or close) => just normalize
        else if (isObject(rawValue)) {
          payload = withDefaults(rawValue);
        }
      }
    }

    // ✅ Always return the final schema
    return json({ ok: true, offers: payload });
  } catch (e) {
    console.error("api.offers.load error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

// ✅ Keep it if you want POST to behave same as GET (not required, but safe)
export const action = loader;
