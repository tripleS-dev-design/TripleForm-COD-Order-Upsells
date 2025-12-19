// ===== File: app/routes/proxy.api.geo.calc.jsx =====
import { json } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";

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

  console.log("=== CALC SHIPPING DEBUG ===");
  console.log("Configuration reçue:", cfg);
  console.log("Paramètres d'entrée:", { countryIn, province, city, orderTotal });

  if (!cfg || typeof cfg !== "object") {
    console.log("DEBUG: Aucune configuration GEO trouvée");
    return {
      amount: 0,
      currency: "MAD",
      final: 0,
      isFree: true,
    };
  }

  // ✅ CORRECTION : S'assurer que isFree est défini
  const isFreeGlobal = cfg.isFree === true;
  
  console.log("DEBUG: isFreeGlobal:", isFreeGlobal);
  console.log("DEBUG: Mode:", cfg.mode || "province");

  // Si livraison globale gratuite, retourner 0
  if (isFreeGlobal) {
    console.log("DEBUG: Livraison globale gratuite activée");
    return {
      amount: 0,
      currency: cfg.currency || "MAD",
      final: 0,
      isFree: true,
    };
  }

  const country = (countryIn || cfg.country || "MA").toUpperCase().slice(0, 2);
  const currency = cfg.currency || "MAD";
  const adv = cfg.advanced || {};
  const mode = cfg.mode || "province";

  let baseRate = 0;

  // --- 1) Mode par prix ---
  if (mode === "price") {
    console.log("DEBUG: Mode prix, montant commande:", orderTotal);
    const brackets = cfg.priceBrackets || [];
    
    for (const b of brackets) {
      const min = b.min == null ? -Infinity : Number(b.min);
      const max = b.max == null ? Infinity : Number(b.max);
      
      if (orderTotal >= min && orderTotal < max) {
        baseRate = Number(b.rate || 0);
        console.log("DEBUG: Tranche trouvée, taux:", baseRate);
        break;
      }
    }
  }
  // --- 2) Mode par province / wilaya ---
  else if (mode === "province") {
    console.log("DEBUG: Mode province, province cherchée:", province);
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
    console.log("DEBUG: Province match:", match, "taux:", baseRate);
  }
  // --- 3) Mode par ville ---
  else if (mode === "city") {
    console.log("DEBUG: Mode ville, ville:", city, "province:", province);
    const arr = (cfg.cityRates && cfg.cityRates[country]) || [];
    
    const nCity = normalizeStr(city);
    const nProvince = normalizeStr(province);
    
    const match = arr.find((c) => 
      normalizeStr(c.name) === nCity && 
      normalizeStr(c.province) === nProvince
    );
    baseRate = match ? Number(match.rate || 0) : 0;
    console.log("DEBUG: Ville match:", match, "taux:", baseRate);
  }

  // ✅ CORRECTION : Utiliser le taux par défaut seulement si pas de match
  if (baseRate === 0 && adv.defaultRate != null) {
    const defaultRate = Number(adv.defaultRate || 0);
    if (defaultRate > 0) {
      console.log("DEBUG: Utilisation taux par défaut:", defaultRate);
      baseRate = defaultRate;
    }
  }

  // ✅ CORRECTION : Seuil de livraison gratuite
  if (adv.freeThreshold != null) {
    const thr = Number(adv.freeThreshold);
    console.log("DEBUG: Seuil gratuit:", thr, "Montant commande:", orderTotal);
    
    if (!Number.isNaN(thr) && thr > 0 && orderTotal >= thr) {
      console.log("DEBUG: Seuil atteint, livraison gratuite");
      baseRate = 0;
    }
  }

  // Frais COD éventuel
  let codExtraFee = 0;
  if (isCod && adv.codExtraFee != null) {
    codExtraFee = Number(adv.codExtraFee || 0);
    console.log("DEBUG: Frais COD:", codExtraFee);
  }

  const final = baseRate + codExtraFee;
  const isFreeShipping = final === 0;
  
  console.log("DEBUG: Total frais:", final, "Devise:", currency);
  console.log("DEBUG: Livraison gratuite ?", isFreeShipping);

  return {
    amount: final,
    currency,
    final,
    isFree: isFreeShipping,
    note: adv.note || "",
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
      console.error("GEO CALC ERREUR: Shop manquant");
      return json(
        { ok: false, error: "Missing shop parameter" },
        { status: 400 }
      );
    }

    // Récupérer les données du frontend
    let body = {};
    if (request.method === "POST") {
      body = await request.json().catch(() => ({}));
    } else {
      const url = new URL(request.url);
      body = {
        country: url.searchParams.get("country"),
        province: url.searchParams.get("province"),
        city: url.searchParams.get("city"),
        subtotalCents: url.searchParams.get("subtotalCents"),
      };
    }

    const country = body.country || "MA";
    const province = body.province || "";
    const city = body.city || "";
    const cartTotalCents = Number(body.subtotalCents || 0);
    const totalMoney = cartTotalCents / 100; // centimes → devise

    console.log("=== REQUÊTE GEO CALC ===");
    console.log("Shop:", shop);
    console.log("Paramètres:", { country, province, city, cartTotalCents, totalMoney });

    // Récupérer la configuration GEO
    const { admin } = await unauthenticated.admin(shop);

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

    console.log("Configuration GEO chargée:", cfg);

    // Calculer les frais
    const shipping = calcShippingFromConfig(cfg, {
      country,
      province,
      city,
      total: totalMoney,
      isCod: true,
    });

    console.log("Résultat calcul shipping:", shipping);

    // ✅ CORRECTION CRITIQUE: Convertir en centimes pour le frontend
    const shippingAmountInCents = Math.round(shipping.final * 100);
    
    // ✅ RETOURNER LES DEUX FORMATS pour compatibilité
    const response = {
      ok: true,
      // Format pour nouveau JS (conversion en centimes côté serveur)
      shippingAmount: shippingAmountInCents,
      
      // Format pour ancien JS
      shipping: {
        amount: shipping.final, // en devise
        currency: shipping.currency,
        note: shipping.note || "",
      },
      
      // Informations de debug
      debug: {
        configExists: !!cfg,
        isFreeGlobal: cfg?.isFree === true,
        mode: cfg?.mode || "province",
        originalAmount: shipping.final,
        convertedToCents: shippingAmountInCents,
        currency: shipping.currency,
      }
    };

    console.log("Réponse envoyée:", response);
    return json(response);

  } catch (e) {
    console.error("geo.calc error", e);
    return json(
      { 
        ok: false, 
        error: String(e?.message || e),
        shippingAmount: 0 // Retourner 0 en cas d'erreur
      },
      { status: 500 }
    );
  }
};

// Permet de tester en GET
export const loader = (args) => action(args);