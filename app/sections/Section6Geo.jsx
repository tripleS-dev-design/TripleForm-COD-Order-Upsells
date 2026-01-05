// ===== File: app/sections/Section6Geo.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Badge,
  Divider,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";

import { useI18n } from "../i18n/react";
import TFSectionHeader from "../components/TFSectionHeader";
import UnsavedSaveBar from "../components/UnsavedSaveBar";
import { useUnsavedNavigationGuard } from "../hooks/useUnsavedNavigationGuard";

// ✅ ton fichier séparé
import { COUNTRY_DATA } from "../data/countryData";

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= i18n wrapper ======================= */
function useT() {
  const { t } = useI18n();

  const tr = (key, fallback, vars) => {
    try {
      const v = t(key, vars);
      if (typeof v === "string" && v.trim() && v !== key) return v;
    } catch {}
    return fallback || key;
  };

  return { t, tr };
}

/* ======================= CSS / layout (NO backticks) ======================= */
const LAYOUT_CSS = [
  "html, body { margin:0; background:#F6F7F9; }",
  ".Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }",
  ".Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }",

  "/* ✅ HEADER (TFSectionHeader) */",
  ".tf-header{ background:linear-gradient(90deg,#0B3B82,#7D0031); padding:6px 10px; position:sticky; top:0; z-index:60; box-shadow:0 10px 28px rgba(11,59,130,0.45); }",
  ".tf-header-row{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; min-height:44px; }",
  ".tf-brand{ display:flex; align-items:center; gap:10px; min-width:0; }",
  ".tf-brand-text{ display:flex; flex-direction:column; min-width:0; line-height:1.05; }",
  ".tf-brand-title{ font-weight:950; color:#F9FAFB; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
  ".tf-brand-sub{ font-size:11px; color:rgba(249,250,251,0.78); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
  ".tf-flags-wrap{ display:flex; justify-content:center; align-items:center; width:100%; min-width:0; }",
  ".tf-header-right{ display:flex; align-items:center; justify-content:flex-end; gap:10px; min-width:0; flex-wrap:wrap; }",

  ".tf-shell{ padding:16px; }",

  "/* ===== Grille: rail gauche | contenu centre | guide droite ===== */",
  ".tf-editor{ display:grid; grid-template-columns: 260px minmax(0,1fr) 320px; gap:16px; align-items:start; }",

  "/* rail gauche */",
  ".tf-rail{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow:auto; }",
  ".tf-rail-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:12px; }",
  ".tf-rail-head{ padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:800; }",
  ".tf-rail-list{ padding:8px; display:grid; gap:8px; }",
  ".tf-rail-item{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:10px 12px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:space-between; gap:10px; }",
  ".tf-rail-item[data-sel='1']{ outline:2px solid #00A7A3; background:rgba(0,167,163,0.06); }",

  "/* centre */",
  ".tf-main-col{ display:grid; gap:16px; min-width:0; }",
  ".tf-panel{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; min-width:0; box-shadow:0 8px 24px rgba(15,23,42,0.04); }",

  "/* droite */",
  ".tf-side-col{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow-y:auto; overflow-x:hidden; width:320px; flex:none; }",
  ".tf-side-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; margin-bottom:12px; }",

  "/* TITRES */",
  ".tf-group-title{ padding:10px 12px; background:linear-gradient(90deg,#0B3B82,#7D0031); border:1px solid rgba(0,167,163,0.85); color:#F9FAFB; border-radius:10px; font-weight:900; letter-spacing:.2px; margin-bottom:10px; box-shadow:0 6px 18px rgba(11,59,130,0.35); }",
  ".row-card{ border:1px solid #E5E7EB; border-radius:10px; padding:10px; background:#FFF; }",
  ".tf-guide-text p{ font-size:13px; line-height:1.5; margin:0 0 6px 0; white-space:normal; }",

  "@media (max-width: 980px) {",
  "  .tf-editor { grid-template-columns: 1fr; }",
  "  .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }",
  "  .tf-brand-sub{ display:none; }",
  "  .tf-flags-wrap{ display:none; }",
  "}",
].join("\n");

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-geo-css")) return;
    const s = document.createElement("style");
    s.id = "tf-geo-css";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
  }, []);
}

/* ======================= COUNTRY_DATA -> GEO_COUNTRIES ======================= */
const GEO_COUNTRIES = Object.keys(COUNTRY_DATA || {}).reduce((acc, countryCode) => {
  const country = COUNTRY_DATA[countryCode];
  acc[countryCode] = {
    label: country.label,
    provinces: Object.entries(country.provinces || {}).map(([key, province]) => ({
      id: key.toLowerCase().replace(/_/g, "-"),
      name: province.label,
      cities: province.cities || [],
    })),
  };
  return acc;
}, {});

function getCountryDef(code) {
  const c = (code || "MA").toUpperCase();
  return GEO_COUNTRIES[c] || GEO_COUNTRIES.MA;
}

function getProvinceOptions(countryCode, tr) {
  const def = getCountryDef(countryCode);
  return [{ label: tr("section6.select.provincePlaceholder", "Select province"), value: "" }].concat(
    (def.provinces || []).map((p) => ({ label: p.name, value: p.name }))
  );
}

function getCityOptions(countryCode, provinceNameOrId, tr) {
  if (!provinceNameOrId) return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];
  const def = getCountryDef(countryCode);
  const prov =
    (def.provinces || []).find((p) => p.name === provinceNameOrId || p.id === provinceNameOrId) || null;

  if (!prov) return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];

  return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }].concat(
    (prov.cities || []).map((city) => ({ label: city, value: city }))
  );
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children, tr }) {
  return (
    <Card>
      <div className="tf-group-title">{typeof title === "string" ? tr(title, title) : title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

const Grid3 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

const newId = () => Math.random().toString(36).slice(2, 8);

/* ============================== default config ============================== */
function defaultCfg() {
  const allCountries = Object.keys(GEO_COUNTRIES);
  return {
    meta: { version: 2 },
    country: "MA",
    currency: "MAD",

    isFree: false,
    mode: "province", // price | province | city

    priceBrackets: [
      { id: newId(), min: 0, max: 299, rate: 29 },
      { id: newId(), min: 299, max: null, rate: 0 },
    ],

    provinceRates: Object.fromEntries(allCountries.map((c) => [c, []])),
    cityRates: Object.fromEntries(allCountries.map((c) => [c, []])),

    advanced: {
      defaultRate: 0,
      freeThreshold: null,
      minOrderAmount: 0,
      codExtraFee: 0,
      note: "",
    },
  };
}

function stableStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}

function normalizeGeoCfg(cfg) {
  const x = cfg || defaultCfg();
  const allCountries = Object.keys(GEO_COUNTRIES);

  const next = { ...defaultCfg(), ...x };
  if (!next.provinceRates) next.provinceRates = {};
  if (!next.cityRates) next.cityRates = {};

  allCountries.forEach((cc) => {
    if (!Array.isArray(next.provinceRates[cc])) next.provinceRates[cc] = [];
    if (!Array.isArray(next.cityRates[cc])) next.cityRates[cc] = [];
  });

  return next;
}

/* ============================== Page ============================== */
export default function Section6Geo() {
  useInjectCss();
  const navigate = useNavigate();
  const { tr } = useT();

  const [cfg, setCfg] = useState(() => normalizeGeoCfg(defaultCfg()));
  const [view, setView] = useState("province"); // price | province | city | advanced
  const [saving, setSaving] = useState(false);

  const lastSavedRef = useRef(stableStringify(normalizeGeoCfg(defaultCfg())));
  const normalizedCfg = useMemo(() => normalizeGeoCfg(cfg), [cfg]);

  const dirty = useMemo(() => {
    const now = stableStringify(normalizedCfg);
    return now !== (lastSavedRef.current || "");
  }, [normalizedCfg]);

  /* ---------- LOAD: localStorage + server ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) localStorage
    try {
      const s = window.localStorage.getItem("tripleform_cod_geo");
      if (s) {
        const parsed = JSON.parse(s);
        const fixed = normalizeGeoCfg({ ...defaultCfg(), ...parsed });
        setCfg(fixed);
        lastSavedRef.current = stableStringify(fixed);
      } else {
        const init = normalizeGeoCfg(defaultCfg());
        lastSavedRef.current = stableStringify(init);
      }
    } catch {
      const init = normalizeGeoCfg(defaultCfg());
      lastSavedRef.current = stableStringify(init);
    }

    // 2) server
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo/load", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!json?.ok || !json.geo || cancelled) return;

        const fixed = normalizeGeoCfg({ ...defaultCfg(), ...json.geo });
        setCfg(fixed);
        lastSavedRef.current = stableStringify(fixed);

        // sync localStorage
        try {
          window.localStorage.setItem("tripleform_cod_geo", JSON.stringify(fixed));
        } catch {}
      } catch (e) {
        console.warn("[Section6Geo] load server failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- persist local (silent) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tripleform_cod_geo", JSON.stringify(normalizedCfg));
    } catch {}
  }, [normalizedCfg]);

  /* ---------- SAVE remote (returns boolean for the guard) ---------- */
  const saveGeo = async () => {
    try {
      setSaving(true);
      const payload = normalizeGeoCfg(cfg);

      const res = await fetch("/api/geo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ geo: payload }),
      });

      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      lastSavedRef.current = stableStringify(payload);
      return true;
    } catch (e) {
      console.warn("[Section6Geo] save failed:", e);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* ✅ Guard unique: bloque seulement quand user quitte la section (route change) */
  const guard = useUnsavedNavigationGuard({
    dirty,
    onSave: saveGeo,
    navigate: (href) => navigate(href),
    isInternalHref: (href) => {
      if (!href) return false;
      if (href.startsWith("#")) return false;
      if (/^https?:\/\//i.test(href)) return false;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      return true;
    },
  });

  /* ====== helpers ====== */
  const setRoot = (p) => setCfg((c) => ({ ...c, ...p }));
  const setAdvanced = (p) => setCfg((c) => ({ ...c, advanced: { ...c.advanced, ...p } }));

  const setCountry = (iso2) => {
    const code = (iso2 || "").toUpperCase().slice(0, 2) || "MA";
    setCfg((c) => {
      const next = { ...c, country: code };
      if (!next.provinceRates[code]) next.provinceRates[code] = [];
      if (!next.cityRates[code]) next.cityRates[code] = [];
      return next;
    });
  };

  // price brackets
  const addBracket = () =>
    setCfg((c) => ({
      ...c,
      priceBrackets: [...c.priceBrackets, { id: newId(), min: 0, max: null, rate: 0 }],
    }));
  const updBracket = (id, patch) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  const delBracket = (id) => setCfg((c) => ({ ...c, priceBrackets: c.priceBrackets.filter((b) => b.id !== id) }));

  // provinces for current country
  const curProv = cfg.provinceRates[cfg.country] || [];
  const setProv = (arr) => setCfg((c) => ({ ...c, provinceRates: { ...c.provinceRates, [c.country]: arr } }));
  const addProv = () => setProv([...curProv, { id: newId(), code: "", name: "", rate: 0 }]);
  const updProv = (id, patch) => setProv(curProv.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delProv = (id) => setProv(curProv.filter((p) => p.id !== id));

  // cities for current country
  const curCity = cfg.cityRates[cfg.country] || [];
  const setCity = (arr) => setCfg((c) => ({ ...c, cityRates: { ...c.cityRates, [c.country]: arr } }));
  const addCity = () => setCity([...curCity, { id: newId(), province: "", name: "", rate: 0 }]);
  const updCity = (id, patch) => setCity(curCity.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci)));
  const delCity = (id) => setCity(curCity.filter((ci) => ci.id !== id));

  /* ===== rail (panneaux) ===== */
  const panels = [
    { key: "province", label: tr("section6.rail.panels.province", "Province rates") },
    { key: "city", label: tr("section6.rail.panels.city", "City rates") },
    { key: "price", label: tr("section6.rail.panels.price", "Price brackets") },
    { key: "advanced", label: tr("section6.rail.panels.advanced", "Advanced") },
  ];

  const countBrackets = cfg.priceBrackets?.length || 0;
  const countProv = curProv.length;
  const countCity = curCity.length;

  const modeLabel = () => {
    if (cfg.mode === "price") return tr("section6.mode.price", "Price");
    if (cfg.mode === "city") return tr("section6.mode.city", "City");
    return tr("section6.mode.province", "Province");
  };

  const countryDef = getCountryDef(cfg.country);
  const countryOptions = Object.entries(GEO_COUNTRIES).map(([code, data]) => ({ label: data.label, value: code }));

  const provinceOptionsWithPlaceholder = useMemo(() => getProvinceOptions(cfg.country, tr), [cfg.country, tr]);

  return (
    <>
      {/* ✅ HEADER COMMUN + FLAGS */}
      <TFSectionHeader
        title={tr("section6.header.appTitle", "TripleForm — GEO")}
        subtitle={tr("section6.header.appSubtitle", "Shipping rates by province, city, or cart amount")}
        rightSlot={
          <Button variant="primary" size="slim" onClick={saveGeo} loading={saving}>
            {tr("section6.buttons.saveStore", "Save")}
          </Button>
        }
      />

      {/* ✅ BAR “UNSAVED” (s’affiche uniquement quand user veut quitter la section) */}
      <UnsavedSaveBar
        open={guard.open}
        dirty={dirty}
        saving={guard.saving}
        mode={guard.mode}
        onSave={guard.onSave}
        onDiscard={guard.onDiscard}
        onCancel={guard.onCancel}
        t={(key) => tr(key, key)}
      />

      <div className="tf-shell">
        <div className="tf-editor">
          {/* ===== Rail gauche ===== */}
          <div className="tf-rail">
            <div className="tf-rail-card">
              <div className="tf-rail-head">{tr("section6.rail.title", "Panels")}</div>
              <div className="tf-rail-list">
                {panels.map((it) => (
                  <div
                    key={it.key}
                    className="tf-rail-item"
                    data-sel={view === it.key ? 1 : 0}
                    onClick={() => setView(it.key)} // ✅ pas d’alerte ici (même section)
                  >
                    <span style={{ fontWeight: 800 }}>{it.label}</span>
                    <span style={{ opacity: 0.75 }}>
                      <SafeIcon name="ChevronRightIcon" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tf-rail-card">
              <div className="tf-rail-head">{tr("section6.rail.summaryTitle", "Summary")}</div>
              <div style={{ padding: 10 }}>
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section6.rail.type", "Shipping")}</Text>
                    <Badge>{cfg.isFree ? tr("section6.rail.free", "Free") : tr("section6.rail.paid", "Paid")}</Badge>
                  </InlineStack>

                  {!cfg.isFree ? (
                    <>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.mode", "Mode")}</Text>
                        <Badge>{modeLabel()}</Badge>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.priceBrackets", "Brackets")}</Text>
                        <Badge tone="info">{countBrackets}</Badge>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.provinces", "Provinces")}</Text>
                        <Badge tone="info">{countProv}</Badge>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.cities", "Cities")}</Text>
                        <Badge tone="info">{countCity}</Badge>
                      </InlineStack>
                    </>
                  ) : null}

                  <Text tone="subdued" as="p">
                    {tr("section6.rail.countryCurrency", "Country: {{country}} • Currency: {{currency}}", {
                      country: cfg.country || "—",
                      currency: cfg.currency || "—",
                    })}
                  </Text>

                  <Button size="slim" variant="primary" onClick={saveGeo} loading={saving}>
                    {tr("section6.buttons.saveStore", "Save")}
                  </Button>
                </BlockStack>
              </div>
            </div>
          </div>

          {/* ===== Colonne centrale ===== */}
          <div className="tf-main-col">
            <div className="tf-panel">
              {/* General */}
              <GroupCard title="section6.general.title" tr={tr}>
                <Grid3>
                  <Select
                    label={tr("section6.general.shippingType", "Shipping type")}
                    value={cfg.isFree ? "free" : "paid"}
                    onChange={(v) => setRoot({ isFree: v === "free" })}
                    options={[
                      { label: tr("section6.general.freeOption", "Free shipping"), value: "free" },
                      { label: tr("section6.general.paidOption", "Paid shipping"), value: "paid" },
                    ]}
                  />

                  <Select
                    label={tr("section6.general.mainCountry", "Main country")}
                    value={cfg.country}
                    onChange={setCountry}
                    options={[
                      { label: tr("section6.general.countries.selectPlaceholder", "Select country"), value: "" },
                      ...countryOptions,
                    ]}
                    helpText={tr("section6.general.countryHelp", "This will be the default geo for rates.")}
                  />

                  <TextField
                    label={tr("section6.general.currency", "Currency")}
                    value={cfg.currency}
                    onChange={(v) => setRoot({ currency: v })}
                    autoComplete="off"
                    helpText={tr("section6.general.currencyHelp", "Example: MAD, DZD, EUR...")}
                  />
                </Grid3>

                {!cfg.isFree ? (
                  <Grid3>
                    <Select
                      label={tr("section6.general.pricingMode", "Pricing mode")}
                      value={cfg.mode}
                      onChange={(v) => {
                        setRoot({ mode: v });
                        if (v === "price" || v === "province" || v === "city") setView(v);
                      }}
                      options={[
                        { label: tr("section6.general.modeProvince", "By province"), value: "province" },
                        { label: tr("section6.general.modeCity", "By city"), value: "city" },
                        { label: tr("section6.general.modePrice", "By cart amount"), value: "price" },
                      ]}
                    />
                  </Grid3>
                ) : (
                  <Text tone="subdued" as="p">
                    {tr("section6.general.freeShippingInfo", "Free shipping enabled: rates are ignored.")}
                  </Text>
                )}
              </GroupCard>

              {/* Province view */}
              {!cfg.isFree && view === "province" && (
                <GroupCard
                  title={tr("section6.province.title", "Province rates — {{country}}", { country: countryDef.label })}
                  tr={tr}
                >
                  <Text tone="subdued" as="p">
                    {tr("section6.province.description", "Define shipping rate per province.")}
                  </Text>

                  <BlockStack gap="200">
                    {curProv.map((p) => (
                      <div className="row-card" key={p.id}>
                        <Grid3>
                          <Select
                            label={tr("section6.province.provinceLabel", "Province")}
                            value={p.name || ""}
                            options={provinceOptionsWithPlaceholder}
                            onChange={(v) => updProv(p.id, { name: v })}
                          />
                          <TextField
                            label={tr("section6.province.codeLabel", "Code")}
                            value={p.code}
                            onChange={(v) => updProv(p.id, { code: v })}
                            autoComplete="off"
                          />
                          <TextField
                            type="number"
                            label={tr("section6.province.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                            value={String(p.rate)}
                            onChange={(v) => updProv(p.id, { rate: Number(v || 0) })}
                            autoComplete="off"
                          />
                        </Grid3>

                        <InlineStack align="end">
                          <Button tone="critical" onClick={() => delProv(p.id)}>
                            {tr("section6.buttons.deleteProvince", "Delete")}
                          </Button>
                        </InlineStack>
                      </div>
                    ))}

                    <Button onClick={addProv}>{tr("section6.buttons.addProvince", "Add province")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* City view */}
              {!cfg.isFree && view === "city" && (
                <GroupCard
                  title={tr("section6.city.title", "City rates — {{country}}", { country: countryDef.label })}
                  tr={tr}
                >
                  <Text tone="subdued" as="p">
                    {tr("section6.city.description", "Define shipping rate per city inside a province.")}
                  </Text>

                  <BlockStack gap="200">
                    {curCity.map((ci) => {
                      const cityOptionsWithPlaceholder = getCityOptions(cfg.country, ci.province, tr);
                      return (
                        <div className="row-card" key={ci.id}>
                          <Grid3>
                            <Select
                              label={tr("section6.city.provinceLabel", "Province")}
                              value={ci.province || ""}
                              options={provinceOptionsWithPlaceholder}
                              onChange={(v) => updCity(ci.id, { province: v, name: "" })}
                            />
                            <Select
                              label={tr("section6.city.cityLabel", "City")}
                              value={ci.name || ""}
                              options={cityOptionsWithPlaceholder}
                              onChange={(v) => updCity(ci.id, { name: v })}
                              disabled={!ci.province}
                            />
                            <TextField
                              type="number"
                              label={tr("section6.city.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                              value={String(ci.rate)}
                              onChange={(v) => updCity(ci.id, { rate: Number(v || 0) })}
                              autoComplete="off"
                            />
                          </Grid3>

                          <InlineStack align="end">
                            <Button tone="critical" onClick={() => delCity(ci.id)}>
                              {tr("section6.buttons.deleteCity", "Delete")}
                            </Button>
                          </InlineStack>
                        </div>
                      );
                    })}

                    <Button onClick={addCity}>{tr("section6.buttons.addCity", "Add city")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* Price view */}
              {!cfg.isFree && view === "price" && (
                <GroupCard title="section6.price.title" tr={tr}>
                  <Text tone="subdued" as="p">
                    {tr("section6.price.description", "Define rate by cart amount ({{currency}}).", {
                      currency: cfg.currency,
                    })}
                  </Text>

                  <BlockStack gap="200">
                    {(cfg.priceBrackets || []).map((b) => (
                      <div className="row-card" key={b.id}>
                        <Grid3>
                          <TextField
                            type="number"
                            label={tr("section6.price.minAmount", "Min")}
                            value={b.min == null ? "" : String(b.min)}
                            onChange={(v) => updBracket(b.id, { min: v === "" ? null : Number(v) })}
                            autoComplete="off"
                          />
                          <TextField
                            type="number"
                            label={tr("section6.price.maxAmount", "Max")}
                            value={b.max == null ? "" : String(b.max)}
                            onChange={(v) => updBracket(b.id, { max: v === "" ? null : Number(v) })}
                            autoComplete="off"
                            helpText={tr("section6.price.maxHelp", "Leave empty for no limit")}
                          />
                          <TextField
                            type="number"
                            label={tr("section6.price.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                            value={String(b.rate)}
                            onChange={(v) => updBracket(b.id, { rate: Number(v || 0) })}
                            autoComplete="off"
                          />
                        </Grid3>

                        <InlineStack align="end">
                          <Button tone="critical" onClick={() => delBracket(b.id)}>
                            {tr("section6.buttons.deleteBracket", "Delete")}
                          </Button>
                        </InlineStack>
                      </div>
                    ))}

                    <Button onClick={addBracket}>{tr("section6.buttons.addBracket", "Add bracket")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* Advanced */}
              {view === "advanced" && (
                <GroupCard title="section6.advanced.title" tr={tr}>
                  <Grid3>
                    <TextField
                      type="number"
                      label={tr("section6.advanced.defaultRate", "Default rate ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.defaultRate)}
                      onChange={(v) => setAdvanced({ defaultRate: Number(v || 0) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.freeThreshold", "Free threshold ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={cfg.advanced.freeThreshold == null ? "" : String(cfg.advanced.freeThreshold)}
                      onChange={(v) => setAdvanced({ freeThreshold: v === "" ? null : Number(v) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.minOrderAmount", "Min order ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.minOrderAmount)}
                      onChange={(v) => setAdvanced({ minOrderAmount: Number(v || 0) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.codExtraFee", "COD extra fee ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.codExtraFee)}
                      onChange={(v) => setAdvanced({ codExtraFee: Number(v || 0) })}
                      autoComplete="off"
                    />
                  </Grid3>

                  <TextField
                    label={tr("section6.advanced.note", "Note")}
                    value={cfg.advanced.note}
                    onChange={(v) => setAdvanced({ note: v })}
                    autoComplete="off"
                    multiline={3}
                  />

                  <Divider />

                  <InlineStack align="end">
                    <Button variant="primary" onClick={saveGeo} loading={saving}>
                      {tr("section6.buttons.save", "Save")}
                    </Button>
                  </InlineStack>
                </GroupCard>
              )}
            </div>
          </div>

          {/* ===== Colonne droite — guide ===== */}
          <div className="tf-side-col">
            <div className="tf-side-card">
              <Text as="h3" variant="headingSm">
                {tr("section6.guide.title", "Guide")}
              </Text>

              <BlockStack gap="150" className="tf-guide-text" style={{ marginTop: 8 }}>
                <p>{tr("section6.guide.step1", "Choose your shipping type (free/paid).")}</p>
                <p>{tr("section6.guide.step2", "Pick a pricing mode: province, city, or cart amount.")}</p>
                <p>{tr("section6.guide.step3", "Add rates and keep entries clean.")}</p>
                <p>{tr("section6.guide.step4", "Use Advanced only if you need global rules.")}</p>
                <p>{tr("section6.guide.step5", "When leaving the section, save if needed.")}</p>
              </BlockStack>
            </div>

            {dirty ? (
              <div className="tf-side-card">
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="warning">{tr("common.savebar.badgeUnsaved", "Unsaved")}</Badge>
                  <Text as="span" fontWeight="bold">
                    {tr("common.savebar.unsaved", "You have unsaved changes.")}
                  </Text>
                </InlineStack>
                <div style={{ marginTop: 10 }}>
                  <Button variant="primary" fullWidth onClick={saveGeo} loading={saving}>
                    {tr("common.save", "Save")}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
