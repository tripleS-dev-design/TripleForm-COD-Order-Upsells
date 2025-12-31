// ===== File: app/sections/Section5Antibot.jsx =====
import React, { useEffect, useMemo, useState } from "react";
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
} from "@shopify/polaris";
import { useI18n } from "../i18n/react";

// ✅ même logique country que Section Form
import { getCountries, getPhonePrefixByCountry } from "../data/countryData";

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* HEADER */
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

  /* ===== Grid: left nav | center content | right guide ===== */
  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

  /* left rail */
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

  /* Center column */
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

  /* Right column */
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

  /* TITLES */
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

  .token-wrap { display:flex; flex-wrap:wrap; gap:8px; }
  .token {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 10px; border:1px solid #E5E7EB; border-radius:999px;
    background:#FFF; font-size:13px;
  }
  .token button {
    border:none; background:transparent; cursor:pointer; font-size:14px; line-height:1;
    color:#6B7280;
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
    if (document.getElementById("tf-antibot-css")) return;
    const s = document.createElement("style");
    s.id = "tf-antibot-css";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
  }, []);
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children, t }) {
  return (
    <Card>
      <div className="tf-group-title">{t(title)}</div>
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

/* ============================== Token helpers ============================== */
function normalizeItem(v) {
  return (v || "").trim();
}
function splitCSVorLines(s) {
  if (Array.isArray(s)) return s;
  if (!s) return [];
  return String(s)
    .split(/[,;\n\r]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function TokenEditor({
  label,
  items,
  placeholder,
  onAddItems,
  onRemoveAt,
  helpText,
  addLabel,
  addCSVLabel,
  removeLabel,
  emptyLabel,
}) {
  const [val, setVal] = useState("");

  const addOne = () => {
    const tVal = normalizeItem(val);
    if (!tVal) return;
    onAddItems([tVal]);
    setVal("");
  };
  const addCSV = () => {
    const arr = splitCSVorLines(val);
    if (!arr.length) return;
    onAddItems(arr.map(normalizeItem));
    setVal("");
  };
  const onKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOne();
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Text as="span" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <InlineStack gap="200" wrap blockAlign="center">
        <div style={{ flex: 1, minWidth: 220 }}>
          <TextField
            value={val}
            onChange={setVal}
            onKeyDown={onKey}
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
        <Button onClick={addOne}>{addLabel}</Button>
        <Button onClick={addCSV} variant="secondary">
          {addCSVLabel}
        </Button>
      </InlineStack>
      {helpText && (
        <Text as="p" tone="subdued">
          {helpText}
        </Text>
      )}
      <div className="token-wrap">
        {(items || []).map((it, idx) => (
          <span className="token" key={`${it}-${idx}`}>
            <span
              style={{
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={it}
            >
              {it}
            </span>
            <button aria-label={removeLabel} onClick={() => onRemoveAt(idx)}>
              ×
            </button>
          </span>
        ))}
        {(!items || items.length === 0) && (
          <Text tone="subdued" as="span">
            {emptyLabel}
          </Text>
        )}
      </div>
    </div>
  );
}

/* ============================== Country tokens (sync with Form countries logic) ============================== */
function CountryTokenPicker({
  label,
  items,
  options,
  codeToLabel,
  onAddCode,
  onRemoveAt,
  addLabel,
  removeLabel,
  emptyLabel,
  helpText,
}) {
  const [val, setVal] = useState("");

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Text as="span" variant="bodySm" tone="subdued">
        {label}
      </Text>

      <InlineStack gap="200" wrap blockAlign="center">
        <div style={{ flex: 1, minWidth: 220 }}>
          <Select options={options} value={val} onChange={setVal} label="" />
        </div>
        <Button
          onClick={() => {
            if (!val) return;
            onAddCode(val);
            setVal("");
          }}
        >
          {addLabel}
        </Button>
      </InlineStack>

      {helpText && (
        <Text as="p" tone="subdued">
          {helpText}
        </Text>
      )}

      <div className="token-wrap">
        {(items || []).map((code, idx) => {
          const name = codeToLabel(code);
          const show = name ? `${code} — ${name}` : code;
          return (
            <span className="token" key={`${code}-${idx}`}>
              <span
                style={{
                  maxWidth: 260,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={show}
              >
                {show}
              </span>
              <button aria-label={removeLabel} onClick={() => onRemoveAt(idx)}>
                ×
              </button>
            </span>
          );
        })}
        {(!items || items.length === 0) && (
          <Text tone="subdued" as="span">
            {emptyLabel}
          </Text>
        )}
      </div>
    </div>
  );
}

/* ============================== default config ============================== */
function defaultCfg() {
  return {
    meta: {
      version: 4,
      // ✅ country principal (même logique que section form)
      shopCountry: "MA",
    },

    ipBlock: {
      enabled: true,
      trustProxy: true,
      clientIpHeader: "x-forwarded-for",
      allowList: [],
      denyList: [],
      cidrList: [],
      autoBanAfterFails: 20,
      autoBanMinutes: 120,
      maxOrdersPerIpPerDay: 40,
    },

    phoneBlock: {
      enabled: false,
      minDigits: 8,
      requirePrefix: false,
      allowedPrefixes: ["+212", "+213"],
      blockedNumbers: [],
      blockedPatterns: ["^\\+?0{6,}$", "0000", "1234", "9999"],
      maxOrdersPerPhonePerDay: 40,
    },

    countryBlock: {
      enabled: false,
      defaultAction: "allow", // allow | block | challenge
      allowList: [], // ISO2 : MA, DZ, FR...
      denyList: [],
    },

    recaptcha: {
      enabled: false,
      version: "v2_checkbox", // v2_checkbox | v2_invisible | v3
      siteKey: "",
      secretKey: "",
      minScore: 0.5, // pour v3
    },

    honeypot: {
      enabled: true,
      fieldName: "tf_hp_token",
      minFillTimeMs: 3000,
      checkMouseMove: true,
      blockIfFilled: true,
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
                {t("section5.header.appTitle")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section5.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section5.header.pill")}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section5.buttons.saveStore")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== page ============================== */
export default function Section5Antibot() {
  useInjectCss();
  const { t: rawT } = useI18n();

  // Wrapper sécurisé pour éviter les erreurs i18n
  const t = (key, vars) => {
    try {
      return rawT(key, vars);
    } catch (e) {
      console.error("i18n error in Section5Antibot for key:", key, e);
      return key;
    }
  };

  // petit helper: si key manquante => fallback
  const tr = (key, fallback, vars) => {
    const r = t(key, vars);
    return r === key ? fallback : r;
  };

  const [cfg, setCfg] = useState(defaultCfg);
  const [sel, setSel] = useState("overview");
  const [saving, setSaving] = useState(false);

  /* ===== Countries options (same logic as Form section) ===== */
  const countriesList = useMemo(() => (getCountries?.() || []), []);
  const countryOptions = useMemo(() => {
    const base = [
      { label: tr("section5.country.selectPlaceholder", "Select country"), value: "" },
    ];
    const list = countriesList.map((c) => ({ label: c.label, value: c.code }));
    return [...base, ...list];
  }, [countriesList]); // eslint-disable-line react-hooks/exhaustive-deps

  const countryLabelByCode = useMemo(() => {
    const map = new Map();
    countriesList.forEach((c) => map.set(String(c.code || "").toUpperCase(), c.label));
    return map;
  }, [countriesList]);

  const codeToLabel = (code) => {
    const k = String(code || "").toUpperCase();
    return countryLabelByCode.get(k) || "";
  };

  const setMeta = (p) => setCfg((c) => ({ ...c, meta: { ...(c.meta || {}), ...p } }));

  // ✅ sync initial: si la section form a déjà un country, on le récupère
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tripleform_cod_config");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const formCountry = parsed?.behavior?.country;
      if (formCountry) {
        setCfg((prev) => {
          const current = prev?.meta?.shopCountry;
          if (current) return prev;
          return { ...prev, meta: { ...(prev.meta || {}), shopCountry: formCountry } };
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== load depuis localStorage (front) ===== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tripleform_cod_antibot_min_v4");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCfg((prev) => ({
          ...prev,
          ...parsed,
          meta: { ...(prev.meta || {}), ...(parsed.meta || {}) },
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== load depuis la boutique (metafield) ===== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const res = await fetch("/api/antibot/load", {
          credentials: "include",
        });
        const j = await res.json().catch(() => null);
        if (j?.ok && j.antibot) {
          setCfg((prev) => ({
            ...prev,
            ...j.antibot,
            meta: { ...(prev.meta || {}), ...(j.antibot?.meta || {}) },
          }));
        }
      } catch (e) {
        console.error("Erreur load antibot (remote):", e);
      }
    })();
  }, []);

  /* ===== save auto dans localStorage ===== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_antibot_min_v4",
        JSON.stringify(cfg)
      );
    } catch {
      /* ignore */
    }
  }, [cfg]);

  const handleSaveRemote = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/antibot/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ antibot: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Save failed");
      }
      alert(t("section5.save.success"));
    } catch (e) {
      alert(
        t("section5.save.error", {
          error: e?.message || t("section5.save.unknownError"),
        })
      );
    } finally {
      setSaving(false);
    }
  };

  // setters
  const setIP = (p) =>
    setCfg((c) => ({ ...c, ipBlock: { ...c.ipBlock, ...p } }));
  const setTEL = (p) =>
    setCfg((c) => ({ ...c, phoneBlock: { ...c.phoneBlock, ...p } }));
  const setCTRY = (p) =>
    setCfg((c) => ({ ...c, countryBlock: { ...c.countryBlock, ...p } }));
  const setRC = (p) =>
    setCfg((c) => ({ ...c, recaptcha: { ...c.recaptcha, ...p } }));
  const setHP = (p) =>
    setCfg((c) => ({ ...c, honeypot: { ...c.honeypot, ...p } }));

  // token ops
  const addItems = (arr, items) => {
    const set = new Set(arr || []);
    (items || []).forEach((v) => {
      const tVal = normalizeItem(v);
      if (tVal) set.add(tVal);
    });
    return Array.from(set);
  };
  const removeAt = (arr, idx) => (arr || []).filter((_, i) => i !== idx);

  // ✅ country change (same behavior as form: update prefixes suggestion)
  const handleShopCountryChange = (code) => {
    setMeta({ shopCountry: code });
    const prefix = getPhonePrefixByCountry?.(code);
    if (prefix) {
      setCfg((c) => {
        const cur = c.phoneBlock?.allowedPrefixes || [];
        if (cur.includes(prefix)) return c;
        return {
          ...c,
          phoneBlock: { ...c.phoneBlock, allowedPrefixes: [prefix, ...cur] },
        };
      });
    }
  };

  // rail
  const panels = [
    { key: "overview", label: t("section5.rail.panels.overview") },
    { key: "ip", label: t("section5.rail.panels.ip") },
    { key: "phone", label: t("section5.rail.panels.phone") },
    { key: "country", label: t("section5.rail.panels.country") },
    { key: "recap", label: t("section5.rail.panels.recap") },
    { key: "honeypot", label: t("section5.rail.panels.honeypot") },
  ];

  // stats rapides
  const countIPs =
    (cfg.ipBlock.allowList?.length || 0) +
    (cfg.ipBlock.denyList?.length || 0) +
    (cfg.ipBlock.cidrList?.length || 0);
  const countPhones =
    (cfg.phoneBlock.blockedNumbers?.length || 0) +
    (cfg.phoneBlock.blockedPatterns?.length || 0);

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? t("section5.status.on") : t("section5.status.off")}
    </Badge>
  );

  /* ===================== RENDER ===================== */
  return (
    <PageShell t={t} onSave={handleSaveRemote} saving={saving}>
      <div className="tf-editor">
        {/* ===== Rail gauche ===== */}
        <div className="tf-rail">
          {/* Menu panneaux */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section5.rail.title")}</div>
            <div className="tf-rail-list">
              {panels.map((it) => (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={sel === it.key ? 1 : 0}
                  onClick={() => setSel(it.key)}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé config */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section5.rail.statusTitle")}
            </div>
            <div style={{ padding: 10 }}>
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <Text as="span">IP</Text>
                  {statusBadge(cfg.ipBlock.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section5.rail.panels.phone")}</Text>
                  {statusBadge(cfg.phoneBlock.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section5.rail.panels.country")}</Text>
                  {statusBadge(cfg.countryBlock.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section5.rail.panels.recap")}</Text>
                  {statusBadge(cfg.recaptcha.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section5.rail.panels.honeypot")}</Text>
                  {statusBadge(cfg.honeypot.enabled)}
                </InlineStack>

                <Text tone="subdued" as="p">
                  {t("section5.rail.statusNote", {
                    ips: countIPs,
                    phones: countPhones,
                  })}
                </Text>
              </BlockStack>
            </div>
          </div>
        </div>

        {/* ===== Colonne centrale ===== */}
        <div className="tf-main-col">
          {/* --- OVERVIEW --- */}
          {sel === "overview" && (
            <div className="tf-panel">
              <GroupCard title="section5.overview.title" t={t}>
                <BlockStack gap="200">
                  <Text as="p">{t("section5.overview.description")}</Text>

                  {/* ✅ Store Country (sync logic) */}
                  <Grid2>
                    <Select
                      label={tr("section5.country.shopCountryLabel", "Store country")}
                      options={countryOptions}
                      value={cfg.meta?.shopCountry || ""}
                      onChange={handleShopCountryChange}
                    />
                  </Grid2>

                  <ul
                    style={{
                      paddingLeft: "1.2rem",
                      margin: 0,
                      fontSize: 13,
                    }}
                  >
                    <li>
                      <b>IP</b> : {t("section5.overview.ip")}
                    </li>
                    <li>
                      <b>{t("section5.rail.panels.phone")}</b> :{" "}
                      {t("section5.overview.phone")}
                    </li>
                    <li>
                      <b>{t("section5.rail.panels.country")}</b> :{" "}
                      {t("section5.overview.country")}
                    </li>
                    <li>
                      <b>{t("section5.rail.panels.recap")}</b> :{" "}
                      {t("section5.overview.recaptcha")}
                    </li>
                    <li>
                      <b>{t("section5.rail.panels.honeypot")}</b> :{" "}
                      {t("section5.overview.honeypot")}
                    </li>
                  </ul>
                  <Text tone="subdued" as="p">
                    Pour l&apos;instant, cette interface est uniquement <b>front</b>.
                    Tu pourras brancher la logique réelle dans tes routes Remix
                    et dans le bloc du formulaire COD.
                  </Text>
                </BlockStack>
              </GroupCard>
            </div>
          )}

          {/* --- IP --- */}
          {sel === "ip" && (
            <div className="tf-panel">
              <GroupCard title="section5.ipBlock.title" t={t}>
                <Grid3>
                  <Checkbox
                    label={t("section5.ipBlock.enable")}
                    checked={!!cfg.ipBlock.enabled}
                    onChange={(v) => setIP({ enabled: v })}
                  />
                  <Checkbox
                    label={t("section5.ipBlock.trustProxy")}
                    checked={!!cfg.ipBlock.trustProxy}
                    onChange={(v) => setIP({ trustProxy: v })}
                  />
                  <TextField
                    label={t("section5.ipBlock.clientIpHeader")}
                    value={cfg.ipBlock.clientIpHeader}
                    onChange={(v) => setIP({ clientIpHeader: v })}
                    autoComplete="off"
                  />
                </Grid3>

                <TokenEditor
                  label={t("section5.ipBlock.allowList")}
                  items={cfg.ipBlock.allowList}
                  placeholder={t("section5.ipBlock.allowListPlaceholder")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setIP({
                      allowList: addItems(cfg.ipBlock.allowList, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setIP({
                      allowList: removeAt(cfg.ipBlock.allowList, i),
                    })
                  }
                />
                <TokenEditor
                  label={t("section5.ipBlock.denyList")}
                  items={cfg.ipBlock.denyList}
                  placeholder={t("section5.ipBlock.denyListPlaceholder")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setIP({
                      denyList: addItems(cfg.ipBlock.denyList, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setIP({
                      denyList: removeAt(cfg.ipBlock.denyList, i),
                    })
                  }
                />
                <TokenEditor
                  label={t("section5.ipBlock.cidrList")}
                  items={cfg.ipBlock.cidrList}
                  placeholder={t("section5.ipBlock.cidrListPlaceholder")}
                  helpText={t("section5.ipBlock.cidrHelp")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setIP({
                      cidrList: addItems(cfg.ipBlock.cidrList, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setIP({
                      cidrList: removeAt(cfg.ipBlock.cidrList, i),
                    })
                  }
                />

                <Grid3>
                  <TextField
                    type="number"
                    label={t("section5.ipBlock.autoBanFails")}
                    value={String(cfg.ipBlock.autoBanAfterFails)}
                    onChange={(v) =>
                      setIP({ autoBanAfterFails: Number(v || 0) })
                    }
                  />
                  <TextField
                    type="number"
                    label={t("section5.ipBlock.autoBanMinutes")}
                    value={String(cfg.ipBlock.autoBanMinutes)}
                    onChange={(v) =>
                      setIP({ autoBanMinutes: Number(v || 0) })
                    }
                  />
                  <TextField
                    type="number"
                    label={t("section5.ipBlock.maxOrdersPerDay")}
                    value={String(cfg.ipBlock.maxOrdersPerIpPerDay)}
                    onChange={(v) =>
                      setIP({ maxOrdersPerIpPerDay: Number(v || 0) })
                    }
                  />
                </Grid3>
              </GroupCard>
            </div>
          )}

          {/* --- Téléphone --- */}
          {sel === "phone" && (
            <div className="tf-panel">
              <GroupCard title="section5.phoneBlock.title" t={t}>
                {/* ✅ store country select (same as form) */}
                <Grid3>
                  <Select
                    label={tr("section5.country.shopCountryLabel", "Store country")}
                    options={countryOptions}
                    value={cfg.meta?.shopCountry || ""}
                    onChange={handleShopCountryChange}
                  />
                </Grid3>

                <div style={{ height: 10 }} />

                <Grid3>
                  <Checkbox
                    label={t("section5.phoneBlock.enable")}
                    checked={!!cfg.phoneBlock.enabled}
                    onChange={(v) => setTEL({ enabled: v })}
                  />
                  <TextField
                    type="number"
                    label={t("section5.phoneBlock.minDigits")}
                    value={String(cfg.phoneBlock.minDigits)}
                    onChange={(v) =>
                      setTEL({ minDigits: Number(v || 0) })
                    }
                  />
                  <Checkbox
                    label={t("section5.phoneBlock.requirePrefix")}
                    checked={!!cfg.phoneBlock.requirePrefix}
                    onChange={(v) => setTEL({ requirePrefix: v })}
                  />
                </Grid3>

                <TokenEditor
                  label={t("section5.phoneBlock.allowedPrefixes")}
                  items={cfg.phoneBlock.allowedPrefixes}
                  placeholder={t("section5.phoneBlock.allowedPrefixesPlaceholder")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setTEL({
                      allowedPrefixes: addItems(cfg.phoneBlock.allowedPrefixes, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setTEL({
                      allowedPrefixes: removeAt(cfg.phoneBlock.allowedPrefixes, i),
                    })
                  }
                />
                <TokenEditor
                  label={t("section5.phoneBlock.blockedNumbers")}
                  items={cfg.phoneBlock.blockedNumbers}
                  placeholder={t("section5.phoneBlock.blockedNumbersPlaceholder")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setTEL({
                      blockedNumbers: addItems(cfg.phoneBlock.blockedNumbers, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setTEL({
                      blockedNumbers: removeAt(cfg.phoneBlock.blockedNumbers, i),
                    })
                  }
                />
                <TokenEditor
                  label={t("section5.phoneBlock.blockedPatterns")}
                  items={cfg.phoneBlock.blockedPatterns}
                  placeholder={t("section5.phoneBlock.blockedPatternsPlaceholder")}
                  addLabel={t("section5.buttons.add")}
                  addCSVLabel={t("section5.buttons.addCSV")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  onAddItems={(arr) =>
                    setTEL({
                      blockedPatterns: addItems(cfg.phoneBlock.blockedPatterns, arr),
                    })
                  }
                  onRemoveAt={(i) =>
                    setTEL({
                      blockedPatterns: removeAt(cfg.phoneBlock.blockedPatterns, i),
                    })
                  }
                />

                <Grid3>
                  <TextField
                    type="number"
                    label={t("section5.phoneBlock.maxOrdersPerDay")}
                    value={String(cfg.phoneBlock.maxOrdersPerPhonePerDay)}
                    onChange={(v) =>
                      setTEL({
                        maxOrdersPerPhonePerDay: Number(v || 0),
                      })
                    }
                  />
                </Grid3>
              </GroupCard>
            </div>
          )}

          {/* --- Pays --- */}
          {sel === "country" && (
            <div className="tf-panel">
              <GroupCard title="section5.countryBlock.title" t={t}>
                {/* ✅ store country select (same as form) */}
                <Grid3>
                  <Select
                    label={tr("section5.country.shopCountryLabel", "Store country")}
                    options={countryOptions}
                    value={cfg.meta?.shopCountry || ""}
                    onChange={handleShopCountryChange}
                  />
                </Grid3>

                <div style={{ height: 10 }} />

                <Grid3>
                  <Checkbox
                    label={t("section5.countryBlock.enable")}
                    checked={!!cfg.countryBlock.enabled}
                    onChange={(v) => setCTRY({ enabled: v })}
                  />
                  <Select
                    label={t("section5.countryBlock.defaultAction")}
                    value={cfg.countryBlock.defaultAction}
                    onChange={(v) => setCTRY({ defaultAction: v })}
                    options={[
                      {
                        label: t("section5.countryBlock.defaultActionOptions.allow"),
                        value: "allow",
                      },
                      {
                        label: t("section5.countryBlock.defaultActionOptions.block"),
                        value: "block",
                      },
                      {
                        label: t("section5.countryBlock.defaultActionOptions.challenge"),
                        value: "challenge",
                      },
                    ]}
                  />
                </Grid3>

                {/* ✅ allow list: picker dynamique (ISO2) */}
                <CountryTokenPicker
                  label={t("section5.countryBlock.allowList")}
                  items={cfg.countryBlock.allowList}
                  options={countryOptions}
                  codeToLabel={codeToLabel}
                  addLabel={t("section5.buttons.add")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  helpText={tr(
                    "section5.countryBlock.allowHelp",
                    "Pick countries to ALLOW (ISO codes)."
                  )}
                  onAddCode={(code) =>
                    setCTRY({
                      allowList: addItems(cfg.countryBlock.allowList, [String(code).toUpperCase()]),
                    })
                  }
                  onRemoveAt={(i) =>
                    setCTRY({
                      allowList: removeAt(cfg.countryBlock.allowList, i),
                    })
                  }
                />

                {/* ✅ deny list: picker dynamique (ISO2) */}
                <CountryTokenPicker
                  label={t("section5.countryBlock.denyList")}
                  items={cfg.countryBlock.denyList}
                  options={countryOptions}
                  codeToLabel={codeToLabel}
                  addLabel={t("section5.buttons.add")}
                  removeLabel={t("section5.buttons.remove")}
                  emptyLabel={t("section5.empty")}
                  helpText={tr(
                    "section5.countryBlock.denyHelp",
                    "Pick countries to BLOCK (ISO codes)."
                  )}
                  onAddCode={(code) =>
                    setCTRY({
                      denyList: addItems(cfg.countryBlock.denyList, [String(code).toUpperCase()]),
                    })
                  }
                  onRemoveAt={(i) =>
                    setCTRY({
                      denyList: removeAt(cfg.countryBlock.denyList, i),
                    })
                  }
                />
              </GroupCard>
            </div>
          )}

          {/* --- reCAPTCHA --- */}
          {sel === "recap" && (
            <div className="tf-panel">
              <GroupCard title="section5.recaptcha.title" t={t}>
                <Grid3>
                  <Checkbox
                    label={t("section5.recaptcha.enable")}
                    checked={!!cfg.recaptcha.enabled}
                    onChange={(v) => setRC({ enabled: v })}
                  />
                  <Select
                    label={t("section5.recaptcha.version")}
                    value={cfg.recaptcha.version}
                    onChange={(v) => setRC({ version: v })}
                    options={[
                      {
                        label: t("section5.recaptcha.versionOptions.v2_checkbox"),
                        value: "v2_checkbox",
                      },
                      {
                        label: t("section5.recaptcha.versionOptions.v2_invisible"),
                        value: "v2_invisible",
                      },
                      {
                        label: t("section5.recaptcha.versionOptions.v3"),
                        value: "v3",
                      },
                    ]}
                  />
                  <TextField
                    label={t("section5.recaptcha.siteKey")}
                    value={cfg.recaptcha.siteKey}
                    onChange={(v) => setRC({ siteKey: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label={t("section5.recaptcha.secretKey")}
                    value={cfg.recaptcha.secretKey}
                    onChange={(v) => setRC({ secretKey: v })}
                    autoComplete="off"
                  />
                  {cfg.recaptcha.version === "v3" && (
                    <TextField
                      type="number"
                      label={t("section5.recaptcha.minScore")}
                      value={String(cfg.recaptcha.minScore)}
                      onChange={(v) =>
                        setRC({ minScore: Number(v || 0.5) })
                      }
                    />
                  )}
                </Grid3>

                <Text tone="subdued" as="p">
                  {t("section5.recaptcha.helpText")}
                </Text>
              </GroupCard>
            </div>
          )}

          {/* --- Honeypot --- */}
          {sel === "honeypot" && (
            <div className="tf-panel">
              <GroupCard title="section5.honeypot.title" t={t}>
                <Grid2>
                  <Checkbox
                    label={t("section5.honeypot.enable")}
                    checked={!!cfg.honeypot.enabled}
                    onChange={(v) => setHP({ enabled: v })}
                  />
                  <Checkbox
                    label={t("section5.honeypot.blockIfFilled")}
                    checked={!!cfg.honeypot.blockIfFilled}
                    onChange={(v) => setHP({ blockIfFilled: v })}
                  />
                  <Checkbox
                    label={t("section5.honeypot.checkMouseMove")}
                    checked={!!cfg.honeypot.checkMouseMove}
                    onChange={(v) => setHP({ checkMouseMove: v })}
                  />
                  <TextField
                    label={t("section5.honeypot.fieldName")}
                    value={cfg.honeypot.fieldName}
                    onChange={(v) => setHP({ fieldName: v })}
                    autoComplete="off"
                  />
                  <TextField
                    type="number"
                    label={t("section5.honeypot.minTime")}
                    value={String(cfg.honeypot.minFillTimeMs)}
                    onChange={(v) =>
                      setHP({ minFillTimeMs: Number(v || 0) })
                    }
                    helpText={t("section5.honeypot.timeHelp")}
                  />
                </Grid2>

                <Text tone="subdued" as="p">
                  {t("section5.honeypot.description")}
                </Text>
              </GroupCard>
            </div>
          )}
        </div>

        {/* ===== Colonne droite (guide) ===== */}
        <div className="tf-side-col">
          <div className="tf-side-card">
            <Text as="h3" variant="headingSm">
              {t("section5.guide.title")}
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}
            >
              <p>{t("section5.guide.step1")}</p>
              <p>{t("section5.guide.step2")}</p>
              <p>{t("section5.guide.step3")}</p>
              <p>{t("section5.guide.step4")}</p>
              <p>{t("section5.guide.step5")}</p>
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
