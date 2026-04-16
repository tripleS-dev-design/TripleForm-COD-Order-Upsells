// app/routes/api.carrier-service.jsx
import { json } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";
import { COUNTRY_DATA, getCurrencyByCountry } from "../data/countryData";

// Normalise une chaîne pour la comparaison (supprime accents, espaces, etc.)
function normalize(str) {
  return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Trouve la province (wilaya) dans COUNTRY_DATA à partir du nom Shopify
function findProvinceCode(countryCode, shopifyProvinceName) {
  const country = COUNTRY_DATA[countryCode];
  if (!country) return null;
  const provinces = country.provinces;
  const normalizedInput = normalize(shopifyProvinceName);
  
  // Parcourir les provinces pour trouver une correspondance (nom ou label)
  for (const [code, data] of Object.entries(provinces)) {
    if (normalize(data.label) === normalizedInput || normalize(code) === normalizedInput) {
      return code;
    }
  }
  return null;
}

// Trouve une ville dans une province donnée
function findCityInProvince(countryCode, provinceCode, shopifyCityName) {
  const country = COUNTRY_DATA[countryCode];
  if (!country) return false;
  const province = country.provinces[provinceCode];
  if (!province) return false;
  
  const cities = province.cities || [];
  const normalizedInput = normalize(shopifyCityName);
  return cities.some(city => normalize(city) === normalizedInput);
}

// Calcule les frais à partir de la config GEO du marchand
function calcShippingFromConfig(cfg, destination, cartTotal) {
  if (!cfg || cfg.isFree) return { amount: 0, currency: cfg.currency || "MAD" };

  const countryCode = (destination.country || cfg.country || "MA").toUpperCase();
  const provinceName = destination.province || "";
  const cityName = destination.city || "";
  const mode = cfg.mode || "province";
  let rate = 0;

  // Identifier le code province interne
  const provinceCode = findProvinceCode(countryCode, provinceName);

  if (mode === "price") {
    const brackets = cfg.priceBrackets || [];
    for (const b of brackets) {
      const min = b.min == null ? -Infinity : Number(b.min);
      const max = b.max == null ? Infinity : Number(b.max);
      if (cartTotal >= min && cartTotal < max) {
        rate = Number(b.rate || 0);
        break;
      }
    }
  } else if (mode === "province") {
    if (provinceCode) {
      const arr = cfg.provinceRates?.[countryCode] || [];
      const match = arr.find(p => p.code === provinceCode || p.name === provinceCode);
      rate = match ? Number(match.rate) : 0;
    }
  } else if (mode === "city") {
    if (provinceCode) {
      const arr = cfg.cityRates?.[countryCode] || [];
      const match = arr.find(c => 
        c.province === provinceCode && 
        findCityInProvince(countryCode, provinceCode, cityName)
      );
      rate = match ? Number(match.rate) : 0;
    }
  }

  if (rate === 0 && cfg.advanced?.defaultRate) {
    rate = Number(cfg.advanced.defaultRate);
  }
  if (cfg.advanced?.freeThreshold && cartTotal >= Number(cfg.advanced.freeThreshold)) {
    rate = 0;
  }

  const currency = getCurrencyByCountry(countryCode) || cfg.currency || "MAD";
  return { amount: rate, currency };
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json();
  const { rate } = body;
  const destination = rate.destination;
  const items = rate.items;
  const shop = request.headers.get("x-shopify-shop-domain");
  if (!shop) return json({ rates: [] });

  // Calculer total panier
  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Récupérer config GEO du marchand
  const { admin } = await unauthenticated.admin(shop);
  const res = await admin.graphql(`
    query {
      shop {
        metafield(namespace: "tripleform_cod", key: "geo") { value }
      }
    }
  `);
  const data = await res.json();
  const rawValue = data?.data?.shop?.metafield?.value;
  const cfg = rawValue ? JSON.parse(rawValue) : null;

  const shipping = calcShippingFromConfig(cfg, destination, cartTotal);
  const priceCents = Math.round(shipping.amount * 100);

  return json({
    rates: [{
      service_name: "TripleForm COD",
      service_code: "TF_COD",
      total_price: priceCents,
      description: shipping.amount === 0 ? "Livraison offerte" : "",
      currency: shipping.currency,
    }]
  });
}
