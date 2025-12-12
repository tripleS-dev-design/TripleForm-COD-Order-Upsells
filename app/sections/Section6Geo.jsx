// ===== File: app/sections/Section6Geo.jsx =====
import React, { useEffect, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Badge,
} from "@shopify/polaris";
import { useI18n } from "../i18n/react";

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* HEADER — gradient comme Sheets */
  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:12px 16px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }

  .tf-shell { padding:16px; }

  /* ===== Grille: nav gauche | contenu centre | guide droite ===== */
  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

  /* rail gauche */
  .tf-rail {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-rail-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    margin-bottom:12px;
  }
  .tf-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
  }
  .tf-rail-list {
    padding:8px;
    display:grid;
    gap:8px;
  }
  .tf-rail-item {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:8px 10px;
    cursor:pointer;
    font-size:13px;
  }
  .tf-rail-item[data-sel="1"] {
    outline:2px solid #2563EB;
    box-shadow:0 12px 26px rgba(37,99,235,.25);
  }

  /* Colonne centrale (contenu principal) */
  .tf-main-col {
    display:grid;
    gap:16px;
    min-width:0;
  }
  .tf-panel {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    min-width:0;
  }

  /* Colonne droite (guide) */
  .tf-side-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow-y:auto;
    overflow-x:hidden;
    width:320px;
    flex:none;
  }
  .tf-side-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    margin-bottom:12px;
  }

  /* TITRES — même bande que Sheets */
  .tf-group-title {
    padding:10px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:1px solid rgba(0,167,163,0.85);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:800;
    letter-spacing:.2px;
    margin-bottom:10px;
    box-shadow:0 6px 18px rgba(11,59,130,0.35);
  }

  .row-card {
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:10px;
    background:#FFF;
  }

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }
  }
`;

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

/* ======================= Catalogue pays / wilayas / villes ======================= */
// Même logique que le front : MA / DZ / TN avec provinces + villes
const GEO_COUNTRIES = {
  MA: {
    label: "Maroc",
    provinces: [
      {
        id: "casablanca",
        name: "Casablanca-Settat",
        cities: ["Casablanca", "Mohammedia", "Settat", "Berrechid", "El Jadida"],
      },
      {
        id: "rabat",
        name: "Rabat-Salé-Kénitra",
        cities: ["Rabat", "Salé", "Kénitra", "Témara", "Khémisset"],
      },
      {
        id: "tanger",
        name: "Tanger-Tétouan-Al Hoceïma",
        cities: ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Martil"],
      },
      {
        id: "fes",
        name: "Fès-Meknès",
        cities: ["Fès", "Meknès", "Ifrane", "Sefrou"],
      },
      {
        id: "marrakech",
        name: "Marrakech-Safi",
        cities: ["Marrakech", "Safi", "Essaouira", "Chichaoua"],
      },
      {
        id: "oriental",
        name: "L'Oriental",
        cities: ["Oujda", "Nador", "Berkane"],
      },
      {
        id: "souss",
        name: "Souss-Massa",
        cities: ["Agadir", "Inezgane", "Taroudant"],
      },
      {
        id: "beni-mellal",
        name: "Béni Mellal-Khénifra",
        cities: ["Béni Mellal", "Khénifra"],
      },
      {
        id: "draa-tafilalet",
        name: "Drâa-Tafilalet",
        cities: ["Errachidia", "Ouarzazate", "Zagora"],
      },
      {
        id: "guelmim",
        name: "Guelmim-Oued Noun",
        cities: ["Guelmim"],
      },
      {
        id: "laayoune",
        name: "Laâyoune-Sakia El Hamra",
        cities: ["Laâyoune", "Boujdour"],
      },
      {
        id: "dakhla",
        name: "Dakhla-Oued Ed Dahab",
        cities: ["Dakhla"],
      },
    ],
  },

  DZ: {
    label: "Algérie",
    provinces: [
      {
        id: "alger",
        name: "Alger",
        cities: ["Alger", "Bab Ezzouar", "Kouba", "Hussein Dey"],
      },
      {
        id: "oran",
        name: "Oran",
        cities: ["Oran", "Es Senia", "Bir El Djir"],
      },
      {
        id: "constantine",
        name: "Constantine",
        cities: ["Constantine", "El Khroub"],
      },
      {
        id: "setif",
        name: "Sétif",
        cities: ["Sétif", "El Eulma"],
      },
      {
        id: "blida",
        name: "Blida",
        cities: ["Blida", "Boufarik", "Mouzaïa"],
      },
      {
        id: "annaba",
        name: "Annaba",
        cities: ["Annaba", "El Bouni"],
      },
      {
        id: "tlemcen",
        name: "Tlemcen",
        cities: ["Tlemcen", "Maghnia"],
      },
      {
        id: "bejaia",
        name: "Béjaïa",
        cities: ["Béjaïa", "Akbou"],
      },
      { id: "batna", name: "Batna", cities: ["Batna"] },
      { id: "tiaret", name: "Tiaret", cities: ["Tiaret"] },
    ],
  },

  TN: {
    label: "Tunisie",
    provinces: [
      {
        id: "tunis",
        name: "Tunis",
        cities: ["Tunis", "La Marsa", "Carthage"],
      },
      {
        id: "ariana",
        name: "Ariana",
        cities: ["Ariana", "Raoued"],
      },
      {
        id: "ben-arous",
        name: "Ben Arous",
        cities: ["Ben Arous", "Ezzahra"],
      },
      {
        id: "manouba",
        name: "Manouba",
        cities: ["Manouba", "Douar Hicher"],
      },
      {
        id: "sfax",
        name: "Sfax",
        cities: ["Sfax", "Sakiet Ezzit"],
      },
      {
        id: "sousse",
        name: "Sousse",
        cities: ["Sousse", "Hammam Sousse"],
      },
      {
        id: "monastir",
        name: "Monastir",
        cities: ["Monastir", "Sahline"],
      },
      {
        id: "nabeul",
        name: "Nabeul",
        cities: ["Nabeul", "Hammamet"],
      },
      {
        id: "bizerte",
        name: "Bizerte",
        cities: ["Bizerte", "Menzel Bourguiba"],
      },
      { id: "gabes", name: "Gabès", cities: ["Gabès"] },
      { id: "gafsa", name: "Gafsa", cities: ["Gafsa"] },
      { id: "kairouan", name: "Kairouan", cities: ["Kairouan"] },
      { id: "kasserine", name: "Kasserine", cities: ["Kasserine"] },
    ],
  },
};

function getCountryDef(code) {
  const c = (code || "MA").toUpperCase();
  return GEO_COUNTRIES[c] || GEO_COUNTRIES.MA;
}

function getProvinceOptions(countryCode) {
  const def = getCountryDef(countryCode);
  return (def.provinces || []).map((p) => ({
    label: p.name,
    value: p.name,
  }));
}

function getCityOptions(countryCode, provinceNameOrId) {
  if (!provinceNameOrId) return [];
  const def = getCountryDef(countryCode);
  const prov =
    (def.provinces || []).find(
      (p) => p.name === provinceNameOrId || p.id === provinceNameOrId
    ) || null;
  if (!prov) return [];
  return (prov.cities || []).map((city) => ({
    label: city,
    value: city,
  }));
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

const Grid2 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

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

/* ============================== config par défaut ============================== */
function defaultCfg() {
  return {
    meta: { version: 2 },

    country: "MA",
    currency: "MAD",

    // Livraison globale
    isFree: true,
    mode: "province", // price | province | city

    // Tarifs "par prix"
    priceBrackets: [
      { id: newId(), min: 0, max: 299, rate: 29 },
      { id: newId(), min: 299, max: null, rate: 0 },
    ],

    // Tarifs par province / wilaya
    provinceRates: {
      MA: [],
      DZ: [],
      TN: [],
    },

    // Tarifs par ville / baladiya
    cityRates: {
      MA: [],
      DZ: [],
      TN: [],
    },

    // Options avancées
    advanced: {
      defaultRate: 0,
      freeThreshold: null,
      minOrderAmount: 0,
      codExtraFee: 0,
      note: "",
    },
  };
}

/* ============================== HEADER SHELL ============================== */
function PageShell({ children, t, onSave, saving }) {
  return (
    <>
      <div className="tf-header">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(11,59,130,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
              }}
            >
              <img
                src="/tripleform-cod-icon.png"
                alt="TripleForm COD"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#F9FAFB" }}>
                {t("section6.header.appTitle")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section6.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section6.header.pill")}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section6.buttons.saveStore")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== Page ============================== */
export default function Section6Geo() {
  useInjectCss();
  const { t: rawT } = useI18n();

  // Wrapper sécurisé pour éviter les erreurs
  const t = (key, vars) => {
    try {
      return rawT(key, vars);
    } catch (e) {
      console.error("i18n error in Section6Geo for key:", key, e);
      return key;
    }
  };

  const [cfg, setCfg] = useState(() => defaultCfg());
  const [view, setView] = useState("province"); // price | province | city | advanced
  const [saving, setSaving] = useState(false);

  const countryDef = getCountryDef(cfg.country);
  const provinceOptions = getProvinceOptions(cfg.country);
  const provinceOptionsWithPlaceholder = [
    { label: t("section6.select.provincePlaceholder"), value: "" },
    ...provinceOptions,
  ];

  // ---------- LOAD: localStorage + server ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) localStorage (rapide)
    try {
      const s = window.localStorage.getItem("tripleform_cod_geo_min_v2");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === "object") {
          setCfg((old) => ({ ...old, ...parsed }));
        }
      }
    } catch {
      /* ignore */
    }

    // 2) serveur (metafield shop)
    let cancelled = false;
    async function loadFromServer() {
      try {
        const res = await fetch("/api/geo/load", {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!json?.ok || !json.geo || cancelled) return;
        setCfg((old) => ({ ...old, ...json.geo }));

        // sync localStorage
        try {
          window.localStorage.setItem(
            "tripleform_cod_geo_min_v2",
            JSON.stringify(json.geo)
          );
        } catch {
          /* ignore */
        }
      } catch (e) {
        console.warn("[Section6Geo] load server failed:", e);
      }
    }

    loadFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- SAVE vers localStorage à chaque changement ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_geo_min_v2",
        JSON.stringify(cfg)
      );
    } catch {
      /* ignore */
    }
  }, [cfg]);

  const saveGeo = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/geo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ geo: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false)
        throw new Error(j?.error || "Save failed");
      alert(t("section6.save.success"));
    } catch (e) {
      alert(
        t("section6.save.error", {
          error: e?.message || t("section6.save.unknownError"),
        })
      );
    } finally {
      setSaving(false);
    }
  };

  /* ====== helpers ====== */
  const setRoot = (p) => setCfg((c) => ({ ...c, ...p }));
  const setAdvanced = (p) =>
    setCfg((c) => ({ ...c, advanced: { ...c.advanced, ...p } }));

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
      priceBrackets: [
        ...c.priceBrackets,
        { id: newId(), min: 0, max: null, rate: 0 },
      ],
    }));
  const updBracket = (id, patch) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    }));
  const delBracket = (id) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.filter((b) => b.id !== id),
    }));

  // provinces for current country
  const curProv = cfg.provinceRates[cfg.country] || [];
  const setProv = (arr) =>
    setCfg((c) => ({
      ...c,
      provinceRates: { ...c.provinceRates, [c.country]: arr },
    }));
  const addProv = () =>
    setProv([...curProv, { id: newId(), code: "", name: "", rate: 0 }]);
  const updProv = (id, patch) =>
    setProv(curProv.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delProv = (id) => setProv(curProv.filter((p) => p.id !== id));

  // cities for current country
  const curCity = cfg.cityRates[cfg.country] || [];
  const setCity = (arr) =>
    setCfg((c) => ({
      ...c,
      cityRates: { ...c.cityRates, [c.country]: arr },
    }));
  const addCity = () =>
    setCity([...curCity, { id: newId(), province: "", name: "", rate: 0 }]);
  const updCity = (id, patch) =>
    setCity(curCity.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci)));
  const delCity = (id) => setCity(curCity.filter((ci) => ci.id !== id));

  /* ====== rail (panneaux) ====== */
  const panels = [
    { key: "province", label: t("section6.rail.panels.province") },
    { key: "city", label: t("section6.rail.panels.city") },
    { key: "price", label: t("section6.rail.panels.price") },
    { key: "advanced", label: t("section6.rail.panels.advanced") },
  ];

  const countBrackets = cfg.priceBrackets?.length || 0;
  const countProv = curProv.length;
  const countCity = curCity.length;

  const modeLabel = () => {
    if (cfg.mode === "price") return t("section6.mode.price");
    if (cfg.mode === "city") return t("section6.mode.city");
    return t("section6.mode.province");
  };

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? t("section6.status.enabled") : t("section6.status.disabled")}
    </Badge>
  );
  // (statusBadge gardé si tu veux l'utiliser plus tard)

  /* ===================== RENDER ===================== */
  return (
    <PageShell t={t} onSave={saveGeo} saving={saving}>
      <div className="tf-editor">
        {/* ===== Rail gauche ===== */}
        <div className="tf-rail">
          {/* Menu panneaux */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section6.rail.title")}</div>
            <div className="tf-rail-list">
              {panels.map((it) => (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={view === it.key ? 1 : 0}
                  onClick={() => setView(it.key)}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé livraison */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section6.rail.summaryTitle")}
            </div>
            <div style={{ padding: 10 }}>
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <Text as="span">{t("section6.rail.type")}</Text>
                  <Badge>
                    {cfg.isFree
                      ? t("section6.rail.free")
                      : t("section6.rail.paid")}
                  </Badge>
                </InlineStack>
                {!cfg.isFree && (
                  <InlineStack align="space-between">
                    <Text as="span">{t("section6.rail.mode")}</Text>
                    <Badge>{modeLabel()}</Badge>
                  </InlineStack>
                )}
                {!cfg.isFree && (
                  <>
                    <InlineStack align="space-between">
                      <Text as="span">
                        {t("section6.rail.priceBrackets")}
                      </Text>
                      <Badge tone="info">{countBrackets}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span">{t("section6.rail.provinces")}</Text>
                      <Badge tone="info">{countProv}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span">{t("section6.rail.cities")}</Text>
                      <Badge tone="info">{countCity}</Badge>
                    </InlineStack>
                  </>
                )}
                <Text tone="subdued" as="p">
                  {t("section6.rail.countryCurrency", {
                    country: cfg.country || "—",
                    currency: cfg.currency || "—",
                  })}
                </Text>

                <InlineStack gap="200">
                  <Button
                    size="slim"
                    variant="primary"
                    onClick={saveGeo}
                    loading={saving}
                  >
                    {t("section6.buttons.saveStore")}
                  </Button>
                </InlineStack>
              </BlockStack>
            </div>
          </div>
        </div>

        {/* ===== Colonne centrale ===== */}
        <div className="tf-main-col">
          <div className="tf-panel">
            {/* Basique en haut : pays + gratuit/payant */}
            <GroupCard title={t("section6.general.title")}>
              <Grid3>
                <Select
                  label={t("section6.general.shippingType")}
                  value={cfg.isFree ? "free" : "paid"}
                  onChange={(v) => setRoot({ isFree: v === "free" })}
                  options={[
                    {
                      label: t("section6.general.freeOption"),
                      value: "free",
                    },
                    {
                      label: t("section6.general.paidOption"),
                      value: "paid",
                    },
                  ]}
                />
                <Select
                  label={t("section6.general.mainCountry")}
                  value={cfg.country}
                  onChange={setCountry}
                  options={[
                    {
                      label: t("section6.general.countries.MA"),
                      value: "MA",
                    },
                    {
                      label: t("section6.general.countries.DZ"),
                      value: "DZ",
                    },
                    {
                      label: t("section6.general.countries.TN"),
                      value: "TN",
                    },
                  ]}
                  helpText={t("section6.general.countryHelp")}
                />
                <TextField
                  label={t("section6.general.currency")}
                  value={cfg.currency}
                  onChange={(v) => setRoot({ currency: v })}
                  autoComplete="off"
                  helpText={t("section6.general.currencyHelp")}
                />
              </Grid3>

              {!cfg.isFree && (
                <Grid3>
                  <Select
                    label={t("section6.general.pricingMode")}
                    value={cfg.mode}
                    onChange={(v) => {
                      setRoot({ mode: v });
                      if (v === "price" || v === "province" || v === "city") {
                        setView(v);
                      }
                    }}
                    options={[
                      {
                        label: t("section6.general.modeProvince"),
                        value: "province",
                      },
                      {
                        label: t("section6.general.modeCity"),
                        value: "city",
                      },
                      {
                        label: t("section6.general.modePrice"),
                        value: "price",
                      },
                    ]}
                  />
                </Grid3>
              )}

              {cfg.isFree && (
                <Text tone="subdued" as="p">
                  {t("section6.general.freeShippingInfo")}
                </Text>
              )}
            </GroupCard>

            {/* Si gratuit → info simple */}
            {cfg.isFree && view !== "advanced" && (
              <GroupCard title={t("section6.general.info")}>
                <Text tone="subdued" as="p">
                  {t("section6.general.freeShippingDetails")}
                </Text>
              </GroupCard>
            )}

            {/* ===== Vue par province ===== */}
            {!cfg.isFree && view === "province" && (
              <GroupCard
                title={t("section6.province.title", {
                  country: countryDef.label,
                })}
              >
                <Text tone="subdued" as="p">
                  {t("section6.province.description")}
                </Text>
                <BlockStack gap="200">
                  {curProv.map((p) => (
                    <div className="row-card" key={p.id}>
                      <Grid3>
                        <Select
                          label={t("section6.province.provinceLabel")}
                          value={p.name || ""}
                          options={provinceOptionsWithPlaceholder}
                          onChange={(v) => updProv(p.id, { name: v })}
                          helpText={t("section6.province.provinceHelp")}
                        />
                        <TextField
                          label={t("section6.province.codeLabel")}
                          value={p.code}
                          onChange={(v) => updProv(p.id, { code: v })}
                          autoComplete="off"
                          helpText={t("section6.province.codeHelp")}
                        />
                        <TextField
                          type="number"
                          label={t("section6.province.rateLabel", {
                            currency: cfg.currency,
                          })}
                          value={String(p.rate)}
                          onChange={(v) =>
                            updProv(p.id, { rate: Number(v || 0) })
                          }
                          autoComplete="off"
                          helpText={t("section6.province.rateHelp")}
                        />
                      </Grid3>
                      <InlineStack align="end">
                        <Button
                          tone="critical"
                          onClick={() => delProv(p.id)}
                        >
                          {t("section6.buttons.deleteProvince")}
                        </Button>
                      </InlineStack>
                    </div>
                  ))}
                  <Button onClick={addProv}>
                    {t("section6.buttons.addProvince")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Vue par ville ===== */}
            {!cfg.isFree && view === "city" && (
              <GroupCard
                title={t("section6.city.title", {
                  country: countryDef.label,
                })}
              >
                <Text tone="subdued" as="p">
                  {t("section6.city.description")}
                </Text>
                <BlockStack gap="200">
                  {curCity.map((ci) => {
                    const cityOptions = getCityOptions(
                      cfg.country,
                      ci.province
                    );
                    const cityOptionsWithPlaceholder = [
                      { label: t("section6.select.cityPlaceholder"), value: "" },
                      ...cityOptions,
                    ];
                    return (
                      <div className="row-card" key={ci.id}>
                        <Grid3>
                          <Select
                            label={t("section6.city.provinceLabel")}
                            value={ci.province || ""}
                            options={provinceOptionsWithPlaceholder}
                            onChange={(v) =>
                              updCity(ci.id, {
                                province: v,
                                name: "",
                              })
                            }
                            helpText={t("section6.city.provinceHelp")}
                          />
                          <Select
                            label={t("section6.city.cityLabel")}
                            value={ci.name || ""}
                            options={cityOptionsWithPlaceholder}
                            onChange={(v) => updCity(ci.id, { name: v })}
                            disabled={!ci.province}
                            helpText={
                              ci.province
                                ? t("section6.city.cityHelpEnabled")
                                : t("section6.city.cityHelpDisabled")
                            }
                          />
                          <TextField
                            type="number"
                            label={t("section6.city.rateLabel", {
                              currency: cfg.currency,
                            })}
                            value={String(ci.rate)}
                            onChange={(v) =>
                              updCity(ci.id, { rate: Number(v || 0) })
                            }
                            autoComplete="off"
                            helpText={t("section6.city.rateHelp")}
                          />
                        </Grid3>
                        <InlineStack align="end">
                          <Button
                            tone="critical"
                            onClick={() => delCity(ci.id)}
                          >
                            {t("section6.buttons.deleteCity")}
                          </Button>
                        </InlineStack>
                      </div>
                    );
                  })}
                  <Button onClick={addCity}>
                    {t("section6.buttons.addCity")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Vue par prix ===== */}
            {!cfg.isFree && view === "price" && (
              <GroupCard title={t("section6.price.title")}>
                <Text tone="subdued" as="p">
                  {t("section6.price.description", {
                    currency: cfg.currency,
                  })}
                </Text>
                <BlockStack gap="200">
                  {(cfg.priceBrackets || []).map((b) => (
                    <div className="row-card" key={b.id}>
                      <Grid3>
                        <TextField
                          type="number"
                          label={t("section6.price.minAmount")}
                          value={b.min == null ? "" : String(b.min)}
                          onChange={(v) =>
                            updBracket(b.id, {
                              min: v === "" ? null : Number(v),
                            })
                          }
                          autoComplete="off"
                        />
                        <TextField
                          type="number"
                          label={t("section6.price.maxAmount")}
                          value={b.max == null ? "" : String(b.max)}
                          onChange={(v) =>
                            updBracket(b.id, {
                              max: v === "" ? null : Number(v),
                            })
                          }
                          autoComplete="off"
                          helpText={t("section6.price.maxHelp")}
                        />
                        <TextField
                          type="number"
                          label={t("section6.price.rateLabel", {
                            currency: cfg.currency,
                          })}
                          value={String(b.rate)}
                          onChange={(v) =>
                            updBracket(b.id, { rate: Number(v || 0) })
                          }
                          autoComplete="off"
                        />
                      </Grid3>
                      <InlineStack align="end">
                        <Button
                          tone="critical"
                          onClick={() => delBracket(b.id)}
                        >
                          {t("section6.buttons.deleteBracket")}
                        </Button>
                      </InlineStack>
                    </div>
                  ))}
                  <Button onClick={addBracket}>
                    {t("section6.buttons.addBracket")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Options avancées ===== */}
            {view === "advanced" && (
              <GroupCard title={t("section6.advanced.title")}>
                <Grid3>
                  <TextField
                    type="number"
                    label={t("section6.advanced.defaultRate", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.defaultRate)}
                    onChange={(v) =>
                      setAdvanced({ defaultRate: Number(v || 0) })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.defaultRateHelp")}
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.freeThreshold", {
                      currency: cfg.currency,
                    })}
                    value={
                      cfg.advanced.freeThreshold == null
                        ? ""
                        : String(cfg.advanced.freeThreshold)
                    }
                    onChange={(v) =>
                      setAdvanced({
                        freeThreshold: v === "" ? null : Number(v),
                      })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.freeThresholdHelp")}
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.minOrderAmount", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.minOrderAmount)}
                    onChange={(v) =>
                      setAdvanced({ minOrderAmount: Number(v || 0) })
                    }
                    autoComplete="off"
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.codExtraFee", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.codExtraFee)}
                    onChange={(v) =>
                      setAdvanced({ codExtraFee: Number(v || 0) })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.codExtraFeeHelp")}
                  />
                </Grid3>
                <TextField
                  label={t("section6.advanced.note")}
                  value={cfg.advanced.note}
                  onChange={(v) => setAdvanced({ note: v })}
                  autoComplete="off"
                  multiline={3}
                  helpText={t("section6.advanced.noteHelp")}
                />

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    onClick={saveGeo}
                    loading={saving}
                  >
                    {t("section6.buttons.save")}
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
              {t("section6.guide.title")}
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}
            >
              <p>{t("section6.guide.step1")}</p>
              <p>{t("section6.guide.step2")}</p>
              <p>{t("section6.guide.step3")}</p>
              <p>{t("section6.guide.step4")}</p>
              <p>{t("section6.guide.step5")}</p>
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
