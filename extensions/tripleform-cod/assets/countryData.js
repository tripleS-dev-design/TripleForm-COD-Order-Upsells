/* =========================================================
   TripleForm COD - countryData.js (Storefront)
   Uses generated JSON -> window.TripleFormCountryData
   ========================================================= */

(function () {
  "use strict";

  // ✅ IMPORTANT:
  // Shopify theme assets can't "import".
  // So we embed the JSON by copying its content here OR by pasting it during build.

  // 👉 Option A (recommandée): tu copies le contenu du JSON generated ici:
  // const DATA = { ... huge json ... };

  // 👉 Option B: si tu veux garder plus clean, tu colles le JSON dans un fichier
  // countryData.generated.js qui fait: window.__TRIPLEFORM_COUNTRY_JSON__ = {...}
  // puis ici tu lis window.__TRIPLEFORM_COUNTRY_JSON__.

  // ✅ Pour rester simple (Option B):
  const DATA = window.__TRIPLEFORM_COUNTRY_JSON__ || { countries: [] };

  function safeUpper(s) {
    return typeof s === "string" ? s.toUpperCase() : "";
  }

  function getCountries() {
    return (DATA.countries || []).map((c) => ({ code: c.code, label: c.label }));
  }

  function getProvinces(countryCode) {
    const cc = safeUpper(countryCode);
    if (!cc) return [];
    const c = (DATA.countries || []).find((x) => x.code === cc);
    return (c?.provinces || []).map((p) => ({ code: p.code, label: p.label }));
  }

  function getCities(countryCode, provinceCode) {
    const cc = safeUpper(countryCode);
    const pc = safeUpper(provinceCode);
    if (!cc || !pc) return [];
    const c = (DATA.countries || []).find((x) => x.code === cc);
    const p = (c?.provinces || []).find((x) => x.code === pc);
    return (p?.cities || []).slice();
  }

  function getPhonePrefixByCountry(countryCode) {
    const cc = safeUpper(countryCode);
    if (!cc) return "";
    const c = (DATA.countries || []).find((x) => x.code === cc);
    return c?.phonePrefix || "";
  }

  function getCurrencyByCountry(countryCode) {
    const cc = safeUpper(countryCode);
    if (!cc) return "USD";
    const c = (DATA.countries || []).find((x) => x.code === cc);
    return c?.currency || "USD";
  }

  window.TripleFormCountryData = {
    countries: DATA.countries || [],
    getCountries,
    getProvinces,
    getCities,
    getPhonePrefixByCountry,
    getCurrencyByCountry,
  };
})();
