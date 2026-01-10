// ===== File: app/sections/Section6Geo.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Checkbox,
  Button,
  Badge,
  Divider,
  Icon,
  Tabs,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

import { useI18n } from "../i18n/react";
import TFSectionHeader from "../components/TFSectionHeader";
import UnsavedSaveBar from "../components/UnsavedSaveBar";
import { useUnsavedNavigationGuard } from "../hooks/useUnsavedNavigationGuard";

// ✅ ton fichier séparé
import { COUNTRY_DATA } from "../data/countryData";

/* ======================= ✅ CRISP (load once) ======================= */
const CRISP_WEBSITE_ID = "7ea27a85-6b6c-4a48-8381-6c0fdc94c1ea";

function useCrisp() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Init globals
    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Avoid duplicates
    if (document.getElementById("crisp-chat-script")) return;

    const s = document.createElement("script");
    s.id = "crisp-chat-script";
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://client.crisp.chat/l.js";
    document.head.appendChild(s);
  }, []);
}

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

/* ======================= CSS / layout (MATCH Pixels) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ Header styles used by TFSectionHeader (same as Pixels/Offers) */
  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    padding:12px 16px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }
  .tf-header-row{
    display:grid;
    grid-template-columns:auto 1fr auto;
    gap:12px;
    align-items:center;
  }
  .tf-brand{ display:flex; align-items:center; gap:10px; min-width:0; }
  .tf-brand-text{ min-width:0; }
  .tf-brand-title{
    font-weight:950;
    color:#F9FAFB;
    line-height:1.1;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-brand-sub{
    font-size:12px;
    color:rgba(249,250,251,0.85);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-flags-wrap{ display:flex; justify-content:center; align-items:center; min-width:0; }
  .tf-header-right{ display:flex; gap:8px; align-items:center; justify-content:flex-end; flex-wrap:wrap; }

  .tf-shell { padding:16px; }

  /* ✅ Top nav container (same) */
  .tf-topnav{
    margin: 14px 0 16px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:10px 12px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
  }

  /* ✅ Tabs centered + boxed */
  .tf-topnav .Polaris-Tabs__Wrapper{
    display:flex!important;
    justify-content:center!important;
    width:100%;
  }
  .tf-topnav .Polaris-Tabs__TabList{
    display:flex!important;
    justify-content:center!important;
    align-items:center!important;
    flex-wrap:wrap;
    gap:10px;
  }
  .tf-topnav .Polaris-Tabs__Tab{
    padding:10px 14px!important;
    margin:0!important;
    border-radius:12px!important;
    font-weight:800!important;
    background:#F9FAFB!important;
    border:1px solid #E5E7EB!important;
    box-shadow:0 6px 14px rgba(15,23,42,0.05);
  }
  .tf-topnav .Polaris-Tabs__Tab:hover{
    background:#FFFFFF!important;
    box-shadow:0 10px 22px rgba(15,23,42,0.08);
  }
  .tf-topnav .Polaris-Tabs__Tab--selected{
    background:#FFFFFF!important;
    border-color:#2563EB!important;
    box-shadow:0 12px 28px rgba(37,99,235,0.18);
  }
  .tf-topnav .Polaris-Tabs__Tab::after{ display:none!important; }

  /* ✅ Main layout: content + right guide/status */
  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 360px;
    gap:16px;
    align-items:start;
  }
  .tf-main-col{ display:grid; gap:14px; min-width:0; }

  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
    min-width:0;
  }

  .tf-preview-col {
    position:sticky;
    top:124px;
    max-height:calc(100vh - 140px);
    overflow:auto;
  }
  .tf-preview-card {
    background:#fff;
    border-radius:12px;
    padding:14px;
    border:1px solid #E5E7EB;
    box-shadow:0 12px 32px rgba(15,23,42,0.08);
  }

  .tf-group-title {
    padding:8px 12px;
    background:linear-gradient(90deg,#1E40AF,#7C2D12);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:900;
    letter-spacing:.02em;
    margin-bottom:10px;
    font-size:13px;
    box-shadow:0 6px 16px rgba(30,64,175,0.15);
  }

  .row-card{
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:10px;
    background:#FFF;
  }

  /* ✅ Guide ALWAYS horizontal */
  .tf-guide-box{
    column-count:1!important;
    columns:auto!important;
    writing-mode: horizontal-tb!important;
    text-orientation: mixed!important;
  }
  .tf-guide-box *{
    column-count:1!important;
    columns:auto!important;
    writing-mode: horizontal-tb!important;
    text-orientation: mixed!important;
  }
  .tf-guide-ol{
    margin:10px 0 0 0;
    padding-left:18px;
    column-count:1!important;
    columns:auto!important;
  }
  .tf-guide-ol li{
    margin:0 0 8px 0;
    white-space:normal;
    overflow-wrap:anywhere;
    line-height:1.5;
    font-size:13px;
  }

  @media (max-width: 1200px) {
    .tf-editor { grid-template-columns:1fr; }
    .tf-preview-col { position:static; max-height:none; }
  }
  @media (max-width: 980px) {
    .tf-brand-sub{ display:none; }
    .tf-flags-wrap{ display:none; }
    .tf-topnav .Polaris-Tabs__TabList{ justify-content:flex-start!important; }
  }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-layout-css-geo")) return;
    const s = document.createElement("style");
    s.id = "tf-layout-css-geo";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
    return () => {
      try {
        s.remove();
      } catch {}
    };
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
  if (!provinceNameOrId)
    return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];

  const def = getCountryDef(countryCode);
  const prov =
    (def.provinces || []).find((p) => p.name === provinceNameOrId || p.id === provinceNameOrId) ||
    null;

  if (!prov)
    return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];

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

/* ============================== default config (✅ stable ids) ============================== */
function defaultCfg() {
  const allCountries = Object.keys(GEO_COUNTRIES);

  return {
    meta: { version: 2 },
    country: "MA",
    currency: "MAD",

    isFree: false,
    mode: "province", // price | province | city

    // ✅ ids stables pour éviter dirty=true au démarrage
    priceBrackets: [
      { id: "b1", min: 0, max: 299, rate: 29 },
      { id: "b2", min: 299, max: null, rate: 0 },
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
  useCrisp(); // ✅ Crisp chargé quand tu entres dans GEO (et pas en double)
  const navigate = useNavigate();
  const { tr } = useT();

  const [hydrated, setHydrated] = useState(false);

  // ✅ init stable
  const initialCfg = useMemo(() => normalizeGeoCfg(defaultCfg()), []);
  const [cfg, setCfg] = useState(() => initialCfg);
  const [view, setView] = useState("province"); // province | city | price | advanced

  const lastSavedRef = useRef(stableStringify(initialCfg));
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
      } finally {
        if (!cancelled) setHydrated(true);
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

      // keep localStorage in sync
      try {
        window.localStorage.setItem("tripleform_cod_geo", JSON.stringify(payload));
      } catch {}

      return true;
    } catch (e) {
      console.warn("[Section6Geo] save failed:", e);
      return false;
    }
  };

  /* ✅ Guard unique: SaveBar يظهر غير ملي user كيحاول يخرج من section */
  const guard = useUnsavedNavigationGuard({
    dirty,
    onSave: saveGeo,
    navigate,
    isInternalHref: (href) => {
      if (!href) return false;
      if (href.startsWith("#")) return false;
      if (/^https?:\/\//i.test(href)) return false;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      return true;
    },
  });

  // Adapter like Pixels: t(key, {fallback})
  const tForBar = (k, vars) =>
    tr(k, typeof vars?.fallback === "string" ? vars.fallback : undefined, vars);

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
  const delBracket = (id) =>
    setCfg((c) => ({ ...c, priceBrackets: c.priceBrackets.filter((b) => b.id !== id) }));

  // provinces for current country
  const curProv = cfg.provinceRates[cfg.country] || [];
  const setProv = (arr) =>
    setCfg((c) => ({ ...c, provinceRates: { ...c.provinceRates, [c.country]: arr } }));
  const addProv = () => setProv([...curProv, { id: newId(), code: "", name: "", rate: 0 }]);
  const updProv = (id, patch) =>
    setProv(curProv.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delProv = (id) => setProv(curProv.filter((p) => p.id !== id));

  // cities for current country
  const curCity = cfg.cityRates[cfg.country] || [];
  const setCity = (arr) =>
    setCfg((c) => ({ ...c, cityRates: { ...c.cityRates, [c.country]: arr } }));
  const addCity = () => setCity([...curCity, { id: newId(), province: "", name: "", rate: 0 }]);
  const updCity = (id, patch) =>
    setCity(curCity.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci)));
  const delCity = (id) => setCity(curCity.filter((ci) => ci.id !== id));

  const countryDef = getCountryDef(cfg.country);
  const countryOptions = Object.entries(GEO_COUNTRIES).map(([code, data]) => ({
    label: data.label,
    value: code,
  }));

  const provinceOptionsWithPlaceholder = useMemo(
    () => getProvinceOptions(cfg.country, tr),
    [cfg.country, tr]
  );

  /* ===== Tabs (same style as Pixels) ===== */
  const tabs = useMemo(
    () => [
      { id: "province", content: tr("section6.rail.panels.province", "Province rates") },
      { id: "city", content: tr("section6.rail.panels.city", "City rates") },
      { id: "price", content: tr("section6.rail.panels.price", "Price brackets") },
      { id: "advanced", content: tr("section6.rail.panels.advanced", "Advanced") },
    ],
    [tr]
  );
  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === view));

  const modeLabel = () => {
    if (cfg.mode === "price") return tr("section6.mode.price", "Price");
    if (cfg.mode === "city") return tr("section6.mode.city", "City");
    return tr("section6.mode.province", "Province");
  };

  return (
    <>
      {/* ✅ HEADER: same as Pixels (Save = direct save) */}
      <TFSectionHeader
        title={tr("section6.header.appTitle", "TripleForm COD")}
        subtitle={tr(
          "section6.header.appSubtitle",
          "GEO — Shipping rates by province, city, or cart amount"
        )}
        rightSlot={
          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {!hydrated ? tr("common.loading", "Loading...") : ""}
            </div>
            <Button
              variant="primary"
              onClick={guard.manualSave}
              disabled={!dirty || guard.saving}
              loading={guard.saving}
            >
              {tr("section6.buttons.saveStore", "Save")}
            </Button>
          </InlineStack>
        }
      />

      {/* ✅ Save Bar: يظهر غير ملي user كيحاول يخرج من section */}
      <UnsavedSaveBar
        open={guard.open}
        dirty={dirty}
        saving={guard.saving}
        mode={guard.mode}
        onSave={guard.onSave}
        onDiscard={guard.onDiscard}
        onCancel={guard.onCancel}
        t={tForBar}
      />

      <div className="tf-shell">
        {/* ✅ Top tabs bar (centered + boxed like Pixels) */}
        <div className="tf-topnav">
          <Tabs
            tabs={tabs}
            selected={selectedTabIndex}
            onSelect={(idx) => setView(tabs[idx]?.id || "province")}
          />
        </div>

        <div className="tf-editor">
          {/* ====================== LEFT / MAIN ====================== */}
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
                      {
                        label: tr("section6.general.countries.selectPlaceholder", "Select country"),
                        value: "",
                      },
                      ...countryOptions,
                    ]}
                    helpText={tr(
                      "section6.general.countryHelp",
                      "This will be the default geo for rates."
                    )}
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
                    {tr(
                      "section6.general.freeShippingInfo",
                      "Free shipping enabled: rates are ignored."
                    )}
                  </Text>
                )}
              </GroupCard>

              {/* Province view */}
              {!cfg.isFree && view === "province" && (
                <GroupCard
                  title={tr("section6.province.title", "Province rates — {{country}}", {
                    country: countryDef.label,
                  })}
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
                            label={tr("section6.province.rateLabel", "Rate ({{currency}})", {
                              currency: cfg.currency,
                            })}
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
                  title={tr("section6.city.title", "City rates — {{country}}", {
                    country: countryDef.label,
                  })}
                  tr={tr}
                >
                  <Text tone="subdued" as="p">
                    {tr(
                      "section6.city.description",
                      "Define shipping rate per city inside a province."
                    )}
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
                              label={tr("section6.city.rateLabel", "Rate ({{currency}})", {
                                currency: cfg.currency,
                              })}
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
                            label={tr("section6.price.rateLabel", "Rate ({{currency}})", {
                              currency: cfg.currency,
                            })}
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

                  <Text tone="subdued" as="p">
                    {tr("section6.tip", "Tip: Save your settings before leaving this section.")}
                  </Text>
                </GroupCard>
              )}
            </div>
          </div>

          {/* ====================== RIGHT / STICKY ====================== */}
          <div className="tf-preview-col">
            <div className="tf-preview-card" style={{ marginBottom: 12 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {tr("section6.preview.statusTitle", "Geo status")}
                </Text>
                {dirty ? (
                  <Badge tone="warning">{tr("common.unsavedShort", "Unsaved")}</Badge>
                ) : (
                  <Badge tone="success">{tr("common.saved", "Saved")}</Badge>
                )}
              </InlineStack>

              <Divider />

              <BlockStack gap="150" style={{ marginTop: 10 }}>
                <InlineStack align="space-between">
                  <Text as="span">{tr("section6.rail.type", "Shipping")}</Text>
                  <Badge>{cfg.isFree ? tr("section6.rail.free", "Free") : tr("section6.rail.paid", "Paid")}</Badge>
                </InlineStack>

                {!cfg.isFree ? (
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section6.rail.mode", "Mode")}</Text>
                    <Badge tone="info">{modeLabel()}</Badge>
                  </InlineStack>
                ) : null}

                <InlineStack align="space-between">
                  <Text as="span">{tr("section6.rail.country", "Country")}</Text>
                  <Badge tone="info">{cfg.country || "—"}</Badge>
                </InlineStack>

                <InlineStack align="space-between">
                  <Text as="span">{tr("section6.rail.currency", "Currency")}</Text>
                  <Badge tone="info">{cfg.currency || "—"}</Badge>
                </InlineStack>
              </BlockStack>
            </div>

            <div className="tf-preview-card tf-guide-box">
              <Text as="h3" variant="headingSm">
                {tr("section6.guide.title", "Guide")}
              </Text>

              <ol className="tf-guide-ol">
                <li>{tr("section6.guide.step1", "Choose your shipping type (free/paid).")}</li>
                <li>{tr("section6.guide.step2", "Pick a pricing mode: province, city, or cart amount.")}</li>
                <li>{tr("section6.guide.step3", "Add rates and keep entries clean.")}</li>
                <li>{tr("section6.guide.step4", "Use Advanced only if you need global rules.")}</li>
                <li>{tr("section6.guide.step5", "When leaving the section, save if needed.")}</li>
              </ol>

              {dirty ? (
                <Text tone="subdued" as="p" style={{ marginTop: 8 }}>
                  {tr("common.savebar.unsaved", "You have unsaved changes.")} —{" "}
                  {tr("section6.tip", "Click Save in the header.")}
                </Text>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
