// ===== File: app/sections/Section5Antibot.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";

import { useI18n } from "../i18n/react";
import { COUNTRY_DATA } from "../data/countryData";

/* ✅ NEW shared system */
import TFSectionHeader from "../components/TFSectionHeader";
import UnsavedSaveBar from "../components/UnsavedSaveBar";
import { useUnsavedNavigationGuard } from "../hooks/useUnsavedNavigationGuard";

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= i18n fallback helper ======================= */
function useT() {
  const { t } = useI18n();

  const tr = (key, fallback, vars) => {
    try {
      const v = t(key, vars);
      if (typeof v === "string" && v.trim() && v !== key) return v;
    } catch {}
    return fallback || key;
  };

  // adapter for shared components expecting t(key, vars?)
  const tAdapter = (key, vars) => tr(key, key, vars);

  return { t, tr, tAdapter };
}

/* ======================= CSS / layout (NO backticks) ======================= */
const LAYOUT_CSS = [
  "html, body { margin:0; background:#F6F7F9; }",
  ".Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }",
  ".Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }",

  ".tf-shell{ padding:16px; }",

  "/* layout */",
  ".tf-editor{ display:grid; grid-template-columns: 260px minmax(0,1fr) 320px; gap:16px; align-items:start; }",
  ".tf-rail{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow:auto; }",
  ".tf-rail-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:12px; }",
  ".tf-rail-head{ padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:800; }",
  ".tf-rail-list{ padding:8px; display:grid; gap:8px; }",
  ".tf-rail-item{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:10px 12px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:space-between; gap:10px; }",
  ".tf-rail-item[data-sel='1']{ outline:2px solid #00A7A3; background:rgba(0,167,163,0.06); }",

  ".tf-main-col{ display:grid; gap:16px; min-width:0; }",
  ".tf-panel{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; min-width:0; box-shadow:0 8px 24px rgba(15,23,42,0.04); }",

  ".tf-side-col{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow:auto; width:320px; }",
  ".tf-side-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; margin-bottom:12px; }",

  ".tf-group-title{ padding:10px 12px; background:linear-gradient(90deg,#0B3B82,#7D0031); border:1px solid rgba(0,167,163,0.85); color:#F9FAFB; border-radius:10px; font-weight:900; letter-spacing:.2px; margin-bottom:10px; box-shadow:0 6px 18px rgba(11,59,130,0.35); }",

  ".token-wrap{ display:flex; flex-wrap:wrap; gap:8px; }",
  ".token{ display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border:1px solid #E5E7EB; border-radius:999px; background:#FFF; font-size:13px; }",
  ".token button{ border:none; background:transparent; cursor:pointer; font-size:14px; line-height:1; color:#6B7280; }",

  ".tf-guide-text p{ font-size:13px; line-height:1.5; margin:0 0 6px 0; white-space:normal; }",

  "@media (max-width: 980px) {",
  "  .tf-editor{ grid-template-columns: 1fr; }",
  "  .tf-rail, .tf-side-col{ position:static; max-height:none; width:auto; }",
  "}",
].join("\n");

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
function GroupCard({ title, children, tr }) {
  return (
    <Card>
      <div className="tf-group-title">{tr(title, title)}</div>
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

      {helpText ? (
        <Text as="p" tone="subdued">
          {helpText}
        </Text>
      ) : null}

      <div className="token-wrap">
        {(items || []).map((it, idx) => (
          <span className="token" key={it + "-" + idx}>
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
        {!items || items.length === 0 ? (
          <Text tone="subdued" as="span">
            {emptyLabel}
          </Text>
        ) : null}
      </div>
    </div>
  );
}

/* ============================== default config ============================== */
function defaultCfg() {
  return {
    meta: { version: 5 },

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
      defaultAction: "allow",
      allowList: [],
      denyList: [],
      geoRules: [],
    },

    // ✅ reCAPTCHA V2 ONLY
    recaptcha: {
      enabled: false,
      version: "v2",
      siteKey: "",
      secretKey: "",
      v2Size: "normal",
      v2Theme: "light",
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

/* ============================== helpers ============================== */
function stableStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}
function normalizeAntibotCfg(cfg) {
  const x = cfg || defaultCfg();
  return {
    ...x,
    recaptcha: {
      ...(x.recaptcha || {}),
      version: "v2",
      v2Size: (x.recaptcha && x.recaptcha.v2Size) || "normal",
      v2Theme: (x.recaptcha && x.recaptcha.v2Theme) || "light",
    },
  };
}

/* ============================== GEO helpers ============================== */
function geoKey(r) {
  return (r?.country || "") + "|" + (r?.province || "") + "|" + (r?.city || "");
}
function getCountryLabel(cc) {
  const c = COUNTRY_DATA && COUNTRY_DATA[cc];
  return (c && c.label) || cc || "??";
}
function getProvinceLabel(cc, prov) {
  const c = COUNTRY_DATA && COUNTRY_DATA[cc];
  const p = c && c.provinces && c.provinces[prov];
  return (p && p.label) || prov || "";
}

export default function Section5Antibot() {
  useInjectCss();

  const navigate = useNavigate();
  const { tr, tAdapter } = useT();

  const [cfg, setCfg] = useState(() => defaultCfg());
  const [sel, setSel] = useState("overview");

  // ✅ last saved snapshot (for dirty comparison)
  const lastSavedRef = useRef(
    stableStringify(normalizeAntibotCfg(defaultCfg()))
  );

  // ✅ manual open (header Save opens the bar, doesn't save مباشرة)
  const [manualOpen, setManualOpen] = useState(false);

  // GEO inputs
  const [geoCountry, setGeoCountry] = useState("MA");
  const [geoProvince, setGeoProvince] = useState("");
  const [geoCity, setGeoCity] = useState("");

  const normalizedCfg = useMemo(() => normalizeAntibotCfg(cfg), [cfg]);

  const dirty = useMemo(() => {
    const now = stableStringify(normalizedCfg);
    return now !== (lastSavedRef.current || "");
  }, [normalizedCfg]);

  /* -------------------- local load (fallback) -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("tripleform_cod_antibot_min_v5");
      if (raw) {
        const parsed = JSON.parse(raw);
        const fixed = normalizeAntibotCfg({ ...defaultCfg(), ...parsed });
        setCfg(fixed);
        lastSavedRef.current = stableStringify(fixed);
      } else {
        const init = normalizeAntibotCfg(defaultCfg());
        lastSavedRef.current = stableStringify(init);
      }
    } catch {
      const init = normalizeAntibotCfg(defaultCfg());
      lastSavedRef.current = stableStringify(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- remote load -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const res = await fetch("/api/antibot/load", { credentials: "include" });
        const j = await res.json().catch(() => null);
        if (j && j.ok && j.antibot) {
          const fixed = normalizeAntibotCfg({ ...defaultCfg(), ...j.antibot });
          setCfg(fixed);
          lastSavedRef.current = stableStringify(fixed);
        }
      } catch (e) {
        console.error("Erreur load antibot (remote):", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- persist local (no alerts) -------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_antibot_min_v5",
        stableStringify(normalizedCfg)
      );
    } catch {}
  }, [normalizedCfg]);

  /* -------------------- save remote (single source of truth) -------------------- */
  const handleSaveRemote = async () => {
    try {
      const payload = normalizeAntibotCfg(cfg);

      const res = await fetch("/api/antibot/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ antibot: payload }),
      });

      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || (j && j.ok === false)) {
        throw new Error((j && j.error) || "Save failed");
      }

      lastSavedRef.current = stableStringify(payload);
      return true;
    } catch (e) {
      console.error("Erreur save antibot:", e);
      return false;
    }
  };

  /* -------------------- ✅ unified guard (only on leaving the section route) -------------------- */
  const guard = useUnsavedNavigationGuard({
    dirty,
    onSave: handleSaveRemote,
    navigate,
  });

  /* -------------------- header Save opens the bar (not save مباشرة) -------------------- */
  const openSavePrompt = () => {
    // if you want it to open even when not dirty, remove this guard
    if (!dirty) return;
    setManualOpen(true);
  };

  const barOpen = guard.open || manualOpen;
  const barMode = guard.open ? guard.mode : manualOpen ? "attention" : guard.mode;

  const barOnSave = async () => {
    const ok = await guard.onSave?.();
    // after saving manually, close manual prompt
    setManualOpen(false);
    return ok;
  };

  const barOnDiscard = () => {
    // if we are blocking navigation, discard should follow guard logic
    if (guard.open) guard.onDiscard?.();
    // if it's a manual prompt, discard = close prompt (no navigation)
    setManualOpen(false);
  };

  const barOnCancel = () => {
    // "stay" / close
    guard.onCancel?.();
    setManualOpen(false);
  };

  /* -------------------- setters -------------------- */
  const setIP = (p) => setCfg((c) => ({ ...c, ipBlock: { ...c.ipBlock, ...p } }));
  const setTEL = (p) =>
    setCfg((c) => ({ ...c, phoneBlock: { ...c.phoneBlock, ...p } }));
  const setCTRY = (p) =>
    setCfg((c) => ({ ...c, countryBlock: { ...c.countryBlock, ...p } }));
  const setRC = (p) =>
    setCfg((c) => ({
      ...c,
      recaptcha: { ...c.recaptcha, ...p, version: "v2" },
    }));
  const setHP = (p) =>
    setCfg((c) => ({ ...c, honeypot: { ...c.honeypot, ...p } }));

  const addItems = (arr, items) => {
    const set = new Set(arr || []);
    (items || []).forEach((v) => {
      const tv = normalizeItem(v);
      if (tv) set.add(tv);
    });
    return Array.from(set);
  };
  const removeAt = (arr, idx) => (arr || []).filter((_, i) => i !== idx);

  /* -------------------- left rail panels -------------------- */
  const panels = [
    { key: "overview", label: tr("section5.rail.panels.overview", "Overview") },
    { key: "ip", label: tr("section5.rail.panels.ip", "IP Block") },
    { key: "phone", label: tr("section5.rail.panels.phone", "Phone Block") },
    { key: "country", label: tr("section5.rail.panels.country", "Country / GEO") },
    { key: "recap", label: tr("section5.rail.panels.recap", "reCAPTCHA") },
    { key: "honeypot", label: tr("section5.rail.panels.honeypot", "Honeypot") },
  ];

  const countIPs =
    (cfg.ipBlock.allowList?.length || 0) + (cfg.ipBlock.denyList?.length || 0);
  const countPhones =
    (cfg.phoneBlock.blockedNumbers?.length || 0) +
    (cfg.phoneBlock.blockedPatterns?.length || 0);
  const geoCount = cfg.countryBlock?.geoRules?.length || 0;

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? tr("section5.status.on", "On") : tr("section5.status.off", "Off")}
    </Badge>
  );

  const countryOptions = useMemo(() => {
    const keys = Object.keys(COUNTRY_DATA || {});
    const list = keys.map((cc) => ({
      label: getCountryLabel(cc) + " (" + cc + ")",
      value: cc,
    }));
    list.sort((a, b) => (a.value === "MA" ? -1 : b.value === "MA" ? 1 : 0));
    return list;
  }, []);

  const provinceOptions = useMemo(() => {
    const c = COUNTRY_DATA && COUNTRY_DATA[geoCountry];
    const provinces = (c && c.provinces) || {};
    const keys = Object.keys(provinces);
    return [{ label: "Any province", value: "" }].concat(
      keys.map((k) => ({
        label: (provinces[k] && provinces[k].label) || k,
        value: k,
      }))
    );
  }, [geoCountry]);

  const cityOptions = useMemo(() => {
    const c = COUNTRY_DATA && COUNTRY_DATA[geoCountry];
    const provinces = (c && c.provinces) || {};
    if (!geoProvince || !provinces[geoProvince])
      return [{ label: "Any city", value: "" }];
    const cities = provinces[geoProvince].cities || [];
    return [{ label: "Any city", value: "" }].concat(
      cities.map((x) => ({ label: x, value: x }))
    );
  }, [geoCountry, geoProvince]);

  const geoRulePills = useMemo(() => {
    const list = (cfg.countryBlock && cfg.countryBlock.geoRules) || [];
    return list.map((r) => {
      const cc = r.country;
      const cLabel = getCountryLabel(cc);
      if (!r.province) return cLabel + " (" + cc + ")";
      const pLabel = getProvinceLabel(cc, r.province);
      if (!r.city) return cLabel + " (" + cc + ") • " + pLabel;
      return cLabel + " (" + cc + ") • " + pLabel + " • " + r.city;
    });
  }, [cfg.countryBlock]);

  const addGeoRule = () => {
    const rule = { country: geoCountry, province: geoProvince || "", city: geoCity || "" };

    setCfg((c) => {
      const current = (c.countryBlock && c.countryBlock.geoRules) || [];
      const k = geoKey(rule);
      if (current.some((x) => geoKey(x) === k)) return c;
      return {
        ...c,
        countryBlock: {
          ...c.countryBlock,
          geoRules: [rule].concat(current),
        },
      };
    });

    setGeoCity("");
  };

  const removeGeoRuleAt = (idx) => {
    const current = (cfg.countryBlock && cfg.countryBlock.geoRules) || [];
    setCTRY({ geoRules: current.filter((_, i) => i !== idx) });
  };

  return (
    <>
      {/* ✅ COMMON HEADER (same everywhere + flags fixed) */}
      <TFSectionHeader
        title={tr("section5.header.appTitle", "TripleForm — AntiBot")}
        subtitle={tr(
          "section5.header.appSubtitle",
          "Protect your COD form from spam orders"
        )}
        rightSlot={
          <Button
            variant="primary"
            size="slim"
            onClick={openSavePrompt} // ✅ opens bar (doesn't save مباشرة)
            disabled={!dirty}
          >
            {tr("common.save", "Save")}
          </Button>
        }
      />

      {/* ✅ Unified Save Bar (works for leaving-guard + manual header click) */}
      <UnsavedSaveBar
        open={barOpen}
        dirty={dirty}
        saving={guard.saving}
        mode={barMode}
        onSave={barOnSave}
        onDiscard={barOnDiscard}
        onCancel={barOnCancel}
        t={tAdapter}
      />

      <div className="tf-shell">
        <div className="tf-editor">
          {/* Rail */}
          <div className="tf-rail">
            <div className="tf-rail-card">
              <div className="tf-rail-head">{tr("section5.rail.title", "Panels")}</div>
              <div className="tf-rail-list">
                {panels.map((it) => (
                  <div
                    key={it.key}
                    className="tf-rail-item"
                    data-sel={sel === it.key ? 1 : 0}
                    onClick={() => setSel(it.key)}
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
              <div className="tf-rail-head">{tr("section5.rail.statusTitle", "Status")}</div>
              <div style={{ padding: 10 }}>
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <Text as="span">IP</Text>
                    {statusBadge(cfg.ipBlock.enabled)}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section5.rail.panels.phone", "Phone")}</Text>
                    {statusBadge(cfg.phoneBlock.enabled)}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section5.rail.panels.country", "Country")}</Text>
                    {statusBadge(cfg.countryBlock.enabled)}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section5.rail.panels.recap", "reCAPTCHA")}</Text>
                    {statusBadge(cfg.recaptcha.enabled)}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section5.rail.panels.honeypot", "Honeypot")}</Text>
                    {statusBadge(cfg.honeypot.enabled)}
                  </InlineStack>

                  <Text tone="subdued" as="p">
                    {tr("section5.rail.statusNote", "IPs: {{ips}} • Phones: {{phones}}", {
                      ips: countIPs,
                      phones: countPhones,
                    })}
                    {geoCount ? " • GEO: " + geoCount : ""}
                  </Text>
                </BlockStack>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="tf-main-col">
            {sel === "overview" && (
              <div className="tf-panel">
                <GroupCard title="section5.overview.title" tr={tr}>
                  <BlockStack gap="200">
                    <Text as="p">
                      {tr("section5.overview.description", "Configure antibot protections.")}
                    </Text>
                    <Text tone="subdued" as="p">
                      ✅ Smart GEO dropdown (Country/Province/City). ✅ IP/Phone UI clean. ✅ reCAPTCHA v2 only.
                    </Text>
                  </BlockStack>
                </GroupCard>
              </div>
            )}

            {sel === "ip" && (
              <div className="tf-panel">
                <GroupCard title="section5.ipBlock.title" tr={tr}>
                  <Grid3>
                    <Checkbox
                      label={tr("section5.ipBlock.enable", "Enable")}
                      checked={!!cfg.ipBlock.enabled}
                      onChange={(v) => setIP({ enabled: v })}
                    />
                    <Checkbox
                      label={tr("section5.ipBlock.trustProxy", "Trust proxy")}
                      checked={!!cfg.ipBlock.trustProxy}
                      onChange={(v) => setIP({ trustProxy: v })}
                    />
                    <TextField
                      label={tr("section5.ipBlock.clientIpHeader", "Client IP header")}
                      value={cfg.ipBlock.clientIpHeader}
                      onChange={(v) => setIP({ clientIpHeader: v })}
                      autoComplete="off"
                    />
                  </Grid3>

                  <Grid3>
                    <TextField
                      type="number"
                      label={tr("section5.ipBlock.maxOrdersPerDay", "Max orders per IP / day")}
                      value={String(cfg.ipBlock.maxOrdersPerIpPerDay)}
                      onChange={(v) => setIP({ maxOrdersPerIpPerDay: Number(v || 0) })}
                    />
                  </Grid3>

                  <Divider />

                  <TokenEditor
                    label={tr("section5.ipBlock.allowList", "Allow list")}
                    items={cfg.ipBlock.allowList}
                    placeholder={tr("section5.ipBlock.allowListPlaceholder", "Add IP...")}
                    addLabel={tr("section5.buttons.add", "Add")}
                    addCSVLabel={tr("section5.buttons.addCSV", "Add CSV")}
                    removeLabel={tr("section5.buttons.remove", "Remove")}
                    emptyLabel={tr("section5.empty", "Empty")}
                    onAddItems={(arr) => setIP({ allowList: addItems(cfg.ipBlock.allowList, arr) })}
                    onRemoveAt={(i) => setIP({ allowList: removeAt(cfg.ipBlock.allowList, i) })}
                  />

                  <TokenEditor
                    label={tr("section5.ipBlock.denyList", "Deny list")}
                    items={cfg.ipBlock.denyList}
                    placeholder={tr("section5.ipBlock.denyListPlaceholder", "Add IP...")}
                    addLabel={tr("section5.buttons.add", "Add")}
                    addCSVLabel={tr("section5.buttons.addCSV", "Add CSV")}
                    removeLabel={tr("section5.buttons.remove", "Remove")}
                    emptyLabel={tr("section5.empty", "Empty")}
                    onAddItems={(arr) => setIP({ denyList: addItems(cfg.ipBlock.denyList, arr) })}
                    onRemoveAt={(i) => setIP({ denyList: removeAt(cfg.ipBlock.denyList, i) })}
                  />
                </GroupCard>
              </div>
            )}

            {sel === "phone" && (
              <div className="tf-panel">
                <GroupCard title="section5.phoneBlock.title" tr={tr}>
                  <Grid3>
                    <Checkbox
                      label={tr("section5.phoneBlock.enable", "Enable")}
                      checked={!!cfg.phoneBlock.enabled}
                      onChange={(v) => setTEL({ enabled: v })}
                    />
                    <TextField
                      type="number"
                      label={tr("section5.phoneBlock.minDigits", "Min digits")}
                      value={String(cfg.phoneBlock.minDigits)}
                      onChange={(v) => setTEL({ minDigits: Number(v || 0) })}
                    />
                    <TextField
                      type="number"
                      label={tr("section5.phoneBlock.maxOrdersPerDay", "Max orders per phone / day")}
                      value={String(cfg.phoneBlock.maxOrdersPerPhonePerDay)}
                      onChange={(v) => setTEL({ maxOrdersPerPhonePerDay: Number(v || 0) })}
                    />
                  </Grid3>

                  <Divider />

                  <TokenEditor
                    label={tr("section5.phoneBlock.blockedNumbers", "Blocked numbers")}
                    items={cfg.phoneBlock.blockedNumbers}
                    placeholder={tr("section5.phoneBlock.blockedNumbersPlaceholder", "+2126...")}
                    addLabel={tr("section5.buttons.add", "Add")}
                    addCSVLabel={tr("section5.buttons.addCSV", "Add CSV")}
                    removeLabel={tr("section5.buttons.remove", "Remove")}
                    emptyLabel={tr("section5.empty", "Empty")}
                    onAddItems={(arr) =>
                      setTEL({ blockedNumbers: addItems(cfg.phoneBlock.blockedNumbers, arr) })
                    }
                    onRemoveAt={(i) =>
                      setTEL({ blockedNumbers: removeAt(cfg.phoneBlock.blockedNumbers, i) })
                    }
                  />
                </GroupCard>
              </div>
            )}

            {sel === "country" && (
              <div className="tf-panel">
                <GroupCard title="section5.countryBlock.title" tr={tr}>
                  <Grid3>
                    <Checkbox
                      label={tr("section5.countryBlock.enable", "Enable")}
                      checked={!!cfg.countryBlock.enabled}
                      onChange={(v) => setCTRY({ enabled: v })}
                    />
                    <Select
                      label={tr("section5.countryBlock.defaultAction", "Default action")}
                      value={cfg.countryBlock.defaultAction}
                      onChange={(v) => setCTRY({ defaultAction: v })}
                      options={[
                        {
                          label: tr("section5.countryBlock.defaultActionOptions.allow", "Allow"),
                          value: "allow",
                        },
                        {
                          label: tr("section5.countryBlock.defaultActionOptions.block", "Block"),
                          value: "block",
                        },
                        {
                          label: tr("section5.countryBlock.defaultActionOptions.challenge", "Challenge"),
                          value: "challenge",
                        },
                      ]}
                    />
                  </Grid3>

                  <Divider />

                  <Text as="h3" variant="headingSm">
                    Smart GEO (Country / Province / City)
                  </Text>

                  <Grid3>
                    <Select
                      label="Country"
                      value={geoCountry}
                      onChange={(v) => {
                        setGeoCountry(v);
                        setGeoProvince("");
                        setGeoCity("");
                      }}
                      options={countryOptions}
                    />
                    <Select
                      label="Province"
                      value={geoProvince}
                      onChange={(v) => {
                        setGeoProvince(v);
                        setGeoCity("");
                      }}
                      options={provinceOptions}
                    />
                    <Select
                      label="City"
                      value={geoCity}
                      onChange={setGeoCity}
                      options={cityOptions}
                      disabled={!geoProvince}
                    />
                  </Grid3>

                  <InlineStack gap="200" wrap>
                    <Button onClick={addGeoRule}>{tr("section5.buttons.add", "Add")}</Button>
                    <Text tone="subdued" as="span">
                      Country only = whole country. Province/City = precise rule.
                    </Text>
                  </InlineStack>

                  <div className="token-wrap" style={{ marginTop: 10 }}>
                    {(geoRulePills || []).map((label, idx) => (
                      <span className="token" key={label + "-" + idx}>
                        <span title={label}>{label}</span>
                        <button
                          aria-label={tr("section5.buttons.remove", "Remove")}
                          onClick={() => removeGeoRuleAt(idx)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {!geoRulePills || geoRulePills.length === 0 ? (
                      <Text tone="subdued" as="span">
                        {tr("section5.empty", "Empty")}
                      </Text>
                    ) : null}
                  </div>

                  <Divider />

                  <TokenEditor
                    label={tr("section5.countryBlock.allowList", "Allow list")}
                    items={cfg.countryBlock.allowList}
                    placeholder={tr("section5.countryBlock.allowListPlaceholder", "MA, DZ...")}
                    addLabel={tr("section5.buttons.add", "Add")}
                    addCSVLabel={tr("section5.buttons.addCSV", "Add CSV")}
                    removeLabel={tr("section5.buttons.remove", "Remove")}
                    emptyLabel={tr("section5.empty", "Empty")}
                    onAddItems={(arr) =>
                      setCTRY({ allowList: addItems(cfg.countryBlock.allowList, arr) })
                    }
                    onRemoveAt={(i) =>
                      setCTRY({ allowList: removeAt(cfg.countryBlock.allowList, i) })
                    }
                  />

                  <TokenEditor
                    label={tr("section5.countryBlock.denyList", "Deny list")}
                    items={cfg.countryBlock.denyList}
                    placeholder={tr("section5.countryBlock.denyListPlaceholder", "XX, YY...")}
                    addLabel={tr("section5.buttons.add", "Add")}
                    addCSVLabel={tr("section5.buttons.addCSV", "Add CSV")}
                    removeLabel={tr("section5.buttons.remove", "Remove")}
                    emptyLabel={tr("section5.empty", "Empty")}
                    onAddItems={(arr) =>
                      setCTRY({ denyList: addItems(cfg.countryBlock.denyList, arr) })
                    }
                    onRemoveAt={(i) =>
                      setCTRY({ denyList: removeAt(cfg.countryBlock.denyList, i) })
                    }
                  />
                </GroupCard>
              </div>
            )}

            {sel === "recap" && (
              <div className="tf-panel">
                <GroupCard title="section5.recaptcha.title" tr={tr}>
                  <Grid3>
                    <Checkbox
                      label={tr("section5.recaptcha.enable", "Enable")}
                      checked={!!cfg.recaptcha.enabled}
                      onChange={(v) => setRC({ enabled: v })}
                    />

                    <div style={{ display: "grid", gap: 6 }}>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {tr("section5.recaptcha.version", "Version")}
                      </Text>
                      <Badge tone="info">v2</Badge>
                    </div>

                    <TextField
                      label={tr("section5.recaptcha.siteKey", "Site key")}
                      value={cfg.recaptcha.siteKey}
                      onChange={(v) => setRC({ siteKey: v })}
                      autoComplete="off"
                    />

                    <TextField
                      label={tr("section5.recaptcha.secretKey", "Secret key")}
                      value={cfg.recaptcha.secretKey}
                      onChange={(v) => setRC({ secretKey: v })}
                      autoComplete="off"
                    />

                    <Select
                      label="V2 size"
                      options={[
                        { label: "normal", value: "normal" },
                        { label: "compact", value: "compact" },
                        { label: "invisible", value: "invisible" },
                      ]}
                      value={cfg.recaptcha.v2Size || "normal"}
                      onChange={(v) => setRC({ v2Size: v })}
                    />

                    <Select
                      label="V2 theme"
                      options={[
                        { label: "light", value: "light" },
                        { label: "dark", value: "dark" },
                      ]}
                      value={cfg.recaptcha.v2Theme || "light"}
                      onChange={(v) => setRC({ v2Theme: v })}
                    />
                  </Grid3>

                  <Text tone="subdued" as="p">
                    ✅ reCAPTCHA v2 only. Paste Site key + Secret key. (No score/action)
                  </Text>
                </GroupCard>
              </div>
            )}

            {sel === "honeypot" && (
              <div className="tf-panel">
                <GroupCard title="section5.honeypot.title" tr={tr}>
                  <Grid2>
                    <Checkbox
                      label={tr("section5.honeypot.enable", "Enable")}
                      checked={!!cfg.honeypot.enabled}
                      onChange={(v) => setHP({ enabled: v })}
                    />
                    <Checkbox
                      label={tr("section5.honeypot.blockIfFilled", "Block if filled")}
                      checked={!!cfg.honeypot.blockIfFilled}
                      onChange={(v) => setHP({ blockIfFilled: v })}
                    />
                    <Checkbox
                      label={tr("section5.honeypot.checkMouseMove", "Check mouse move")}
                      checked={!!cfg.honeypot.checkMouseMove}
                      onChange={(v) => setHP({ checkMouseMove: v })}
                    />
                    <TextField
                      label={tr("section5.honeypot.fieldName", "Field name")}
                      value={cfg.honeypot.fieldName}
                      onChange={(v) => setHP({ fieldName: v })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section5.honeypot.minTime", "Minimum fill time (ms)")}
                      value={String(cfg.honeypot.minFillTimeMs)}
                      onChange={(v) => setHP({ minFillTimeMs: Number(v || 0) })}
                      helpText={tr(
                        "section5.honeypot.timeHelp",
                        "If user submits too fast, treat as bot."
                      )}
                    />
                  </Grid2>

                  <Text tone="subdued" as="p">
                    {tr(
                      "section5.honeypot.description",
                      "Honeypot adds a hidden field and timing checks to block bots."
                    )}
                  </Text>
                </GroupCard>
              </div>
            )}
          </div>

          {/* Right guide */}
          <div className="tf-side-col">
            <div className="tf-side-card">
              <Text as="h3" variant="headingSm">
                {tr("section5.guide.title", "Guide")}
              </Text>

              <BlockStack gap="150" className="tf-guide-text" style={{ marginTop: 8 }}>
                <p>{tr("section5.guide.step1", "Enable the blocks you need.")}</p>
                <p>{tr("section5.guide.step2", "Add allow/deny lists carefully.")}</p>
                <p>{tr("section5.guide.step3", "Use GEO rules for precise targeting.")}</p>
                <p>{tr("section5.guide.step4", "Use reCAPTCHA v2 only if necessary.")}</p>
                <p>{tr("section5.guide.step5", "Always Save before leaving this section.")}</p>
              </BlockStack>
            </div>

            {dirty ? (
              <div className="tf-side-card">
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="warning">
                    {tr("common.savebar.badgeUnsaved", "Unsaved")}
                  </Badge>
                  <Text as="span" fontWeight="bold">
                    {tr("common.savebar.unsaved", "You have unsaved changes.")}
                  </Text>
                </InlineStack>

                <div style={{ marginTop: 10 }}>
                  <Button variant="primary" onClick={openSavePrompt}>
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
