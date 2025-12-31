// ===== File: app/data/countryData.js =====

import { Country, State, City } from "country-state-city";

/**
 * ✅ Choix:
 * - false => uniquement les pays populaires (recommandé pour UI rapide)
 * - true  => tous les pays disponibles
 */
export const USE_ALL_COUNTRIES = false;

/**
 * ✅ Liste de pays populaires (tu peux en ajouter / enlever)
 * Codes ISO2
 */
export const POPULAR_COUNTRY_CODES = [
  // North Africa / MENA
  "MA", "DZ", "TN", "EG", "SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "IQ",
  // Europe
  "FR", "ES", "IT", "DE", "GB", "NL", "BE", "CH", "AT", "SE", "NO", "DK", "FI", "IE", "PT", "GR",
  "PL", "CZ", "HU", "RO", "BG", "UA",
  // Americas
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE",
  // Africa
  "NG", "ZA", "KE", "GH", "SN", "CI", "CM", "ET", "TZ", "UG",
  // Asia
  "TR", "PK", "IN", "BD", "LK",
  "ID", "MY", "SG", "TH", "VN", "PH",
  "JP", "KR", "CN", "TW", "HK",
  // Oceania
  "AU", "NZ",
];

/* ============================== Helpers ============================== */
const safeUpper = (s) => (typeof s === "string" ? s.toUpperCase() : "");
const uniq = (arr) => Array.from(new Set(arr));

/**
 * ✅ Countries list for Select
 * return [{ code, label }]
 */
export function getCountries() {
  const all = Country.getAllCountries() || [];
  const filtered = USE_ALL_COUNTRIES
    ? all
    : all.filter((c) => POPULAR_COUNTRY_CODES.includes(safeUpper(c.isoCode)));

  return filtered
    .map((c) => ({
      code: c.isoCode,
      label: c.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

/**
 * ✅ Provinces / States list for Select
 * return [{ code, label }]
 */
export function getProvinces(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return [];

  const states = State.getStatesOfCountry(cc) || [];
  return states
    .map((s) => ({
      code: s.isoCode, // ex: "CAS"...
      label: s.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

/**
 * ✅ Cities list (string[])
 */
export function getCities(countryCode, provinceCode) {
  const cc = safeUpper(countryCode);
  const pc = safeUpper(provinceCode);
  if (!cc || !pc) return [];

  const cities = City.getCitiesOfState(cc, pc) || [];
  return uniq(
    cities
      .map((c) => c.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr"))
  );
}

/**
 * ✅ Phone prefix like "+212"
 */
export function getPhonePrefixByCountry(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return "";

  const c = Country.getCountryByCode(cc);
  const phone = c?.phonecode; // "212"
  if (!phone) return "";
  return phone.startsWith("+") ? phone : `+${phone}`;
}

/**
 * ✅ Currency by country (from library)
 * fallback => "USD"
 */
export function getCurrencyByCountry(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return "USD";

  const c = Country.getCountryByCode(cc);
  const cur = c?.currency; // "MAD", "EUR", ...
  return cur || "USD";
}

/**
 * ✅ Exemple shipping (preview only)
 * Tu peux enrichir plus tard.
 */
export const getShippingExample = (city, countryCode) => {
  const shippingExamples = {
    MA: {
      Casablanca: { amount: 29, note: "Livraison standard" },
      Rabat: { amount: 25, note: "Livraison standard" },
      Marrakech: { amount: 35, note: "Livraison express" },
      "Fès": { amount: 30, note: "Livraison standard" },
      Tanger: { amount: 40, note: "Livraison express" },
      Agadir: { amount: 45, note: "Livraison express" },
      Oujda: { amount: 50, note: "Livraison express" },
    },
    DZ: {
      Alger: { amount: 45, note: "Livraison standard" },
      Oran: { amount: 40, note: "Livraison standard" },
      Constantine: { amount: 50, note: "Livraison express" },
      Annaba: { amount: 55, note: "Livraison express" },
    },
    FR: {
      Paris: { amount: 8.5, note: "Livraison standard" },
      Lyon: { amount: 7.5, note: "Livraison standard" },
      Marseille: { amount: 8, note: "Livraison standard" },
      Toulouse: { amount: 9, note: "Livraison standard" },
    },
    ES: {
      Madrid: { amount: 6.5, note: "Livraison standard" },
      Barcelona: { amount: 7, note: "Livraison standard" },
      Valencia: { amount: 7.5, note: "Livraison standard" },
    },
    US: {
      "New York City": { amount: 9.9, note: "Standard shipping" },
      "Los Angeles": { amount: 12.5, note: "Standard shipping" },
    },
    AE: {
      Dubai: { amount: 15, note: "Standard delivery" },
      "Abu Dhabi": { amount: 18, note: "Express delivery" },
    },
    SA: {
      Riyadh: { amount: 18, note: "Standard delivery" },
      Jeddah: { amount: 20, note: "Express delivery" },
    },
  };

  const cc = safeUpper(countryCode) || "MA";
  const cityName = typeof city === "string" ? city : "";

  const countryData = shippingExamples[cc] || shippingExamples.MA;
  const cityData = countryData[cityName];

  if (cityData) return cityData;

  // fallback simple
  if (cc === "MA") return { amount: 30, note: "Livraison standard" };
  if (cc === "FR") return { amount: 8, note: "Livraison standard" };
  if (cc === "ES") return { amount: 7, note: "Livraison standard" };
  if (cc === "US") return { amount: 10, note: "Standard shipping" };

  return { amount: 10, note: "Standard delivery" };
};
