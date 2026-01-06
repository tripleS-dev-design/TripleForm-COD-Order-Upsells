// ===== File: app/sections/Section4Pixels.jsx =====
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@remix-run/react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Checkbox,
  Button,
  Badge,
  Tabs,
  Divider,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";

import TFSectionHeader from "../components/TFSectionHeader";
import UnsavedSaveBar from "../components/UnsavedSaveBar";
import { useUnsavedNavigationGuard } from "../hooks/useUnsavedNavigationGuard";

/* ======================= SAFE ICON helper (same idea as Offers) ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= i18n fallback helper (like Offers) ======================= */
function useT() {
  const { t } = useI18n();

  const tr = (key, fallback) => {
    try {
      const v = t(key);
      if (typeof v === "string" && v.trim() && v !== key) return v;
    } catch {}
    return fallback || key;
  };

  return { t, tr };
}

/* ======================= CSS / layout (match Section Offers) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ Header styles used by TFSectionHeader (same as Offers) */
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
  .tf-flags-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    min-width:0;
  }
  .tf-header-right{
    display:flex;
    gap:8px;
    align-items:center;
    justify-content:flex-end;
    flex-wrap:wrap;
  }

  .tf-shell { padding:16px; }

  .tf-topnav{
    margin: 14px 0 16px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:10px 12px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
  }

  /* ✅ Tabs centered + each tab has a "cadre" (boxed/pill) */
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
  /* Remove underline bar if it appears */
  .tf-topnav .Polaris-Tabs__Tab::after{
    display:none!important;
  }

  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 460px;
    gap:16px;
    align-items:start;
  }
  .tf-editor--full{ grid-template-columns: 1fr; }

  .tf-main-col{ display:grid; gap:14px; min-width:0; }

  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
    min-width:0;
  }

  /* ✅ Shopify settings tiles dashboard (same as Offers) */
  .tf-dashboard-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));
    gap:12px;
    align-items:stretch;
  }
  .tf-setting-tile{
    border:1px solid #E5E7EB;
    border-radius:14px;
    padding:12px;
    background:#fff;
    box-shadow:0 10px 26px rgba(15,23,42,0.06);
    transition:all .15s ease;
    cursor:pointer;
    min-width:0;
  }
  .tf-setting-tile:hover{
    transform:translateY(-1px);
    box-shadow:0 14px 34px rgba(15,23,42,0.10);
  }
  .tf-setting-tile-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
  }
  .tf-setting-tile-left{
    display:flex;
    gap:10px;
    min-width:0;
  }
  .tf-setting-ico{
    width:42px;
    height:42px;
    border-radius:12px;
    border:1px solid rgba(0,0,0,.08);
    background:#F1F5F9;
    display:grid;
    place-items:center;
    flex:0 0 auto;
  }
  .tf-setting-title{
    font-weight:950;
    font-size:13px;
    color:#111827;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-setting-desc{
    font-size:12px;
    color:#6B7280;
    line-height:1.35;
    margin-top:2px;
  }
  .tf-setting-bottom{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    margin-top:10px;
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

  /* ✅ Fix: Guide text must be horizontal (disable multi-columns / vertical modes) */
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
    word-break:normal;
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
    if (document.getElementById("tf-layout-css-pixels")) return;
    const s = document.createElement("style");
    s.id = "tf-layout-css-pixels";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
    return () => {
      try {
        s.remove();
      } catch {}
    };
  }, []);
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="300">{children}</BlockStack>
    </Card>
  );
}

const Grid3 = ({ children, min = 210 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

function stableStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

/* ✅ Shopify-like settings tile (same component style as Offers) */
function SettingTileCard({
  iconName = "SettingsIcon",
  title,
  description,
  statusText,
  statusTone = "subdued",
  actionLabel,
  onOpen,
}) {
  return (
    <div className="tf-setting-tile" onClick={onOpen} role="button" tabIndex={0}>
      <div className="tf-setting-tile-top">
        <div className="tf-setting-tile-left">
          <div className="tf-setting-ico">
            <SafeIcon name={iconName} fallback="AppsIcon" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="tf-setting-title">{title}</div>
            <div className="tf-setting-desc">{description}</div>
          </div>
        </div>

        <Badge tone={statusTone}>{statusText}</Badge>
      </div>

      <div className="tf-setting-tile-bottom tf-setting-bottom">
        <Text as="p" variant="bodySm" tone="subdued">
          {/* spacer */}
        </Text>
        <Button
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen?.();
          }}
          icon={PI.ChevronRightIcon}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

/* ============================== default config ============================== */
const defaultCfg = () => ({
  meta: { version: 1 },

  google: {
    enabled: false,
    measurementId: "",
    adsConversionId: "",
    adsConversionLabel: "",
    sendPageView: true,
    sendPurchase: true,
  },

  fb: {
    enabled: false,
    name: "",
    pixelId: "",
    pageView: true,
    viewContent: true,
    addToCart: true,
    initiateCheckout: true,
    purchase: true,
    advancedMatching: true,
  },

  capi_fb: {
    enabled: false,
    pixelId: "",
    accessToken: "",
    testEventCode: "",
    useEventIdDedup: true,
    sendViewContent: false,
    sendAddToCart: true,
    sendPurchase: true,
  },

  tiktok: {
    enabled: false,
    name: "",
    pixelId: "",
    pageView: true,
    viewContent: true,
    addToCart: true,
    purchase: true,
  },

  tiktok_api: {
    enabled: false,
    pixelCode: "",
    accessToken: "",
    sendPurchase: true,
  },
});

/* ============================== page ============================== */
export default function Section4Pixels() {
  useInjectCss();

  const navigate = useNavigate();
  const { tr } = useT();

  const [cfg, setCfg] = useState(defaultCfg);
  const [view, setView] = useState("overview"); // overview | google | fb | capi_fb | tiktok | tiktok_api | tests

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  // ✅ same concept as Offers: baseline + signature => dirty
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedKey, setLastSavedKey] = useState("");
  const cfgSig = useMemo(() => stableStringify(cfg), [cfg]);

  const dirty = useMemo(() => {
    if (!hydrated) return false;
    if (!lastSavedKey) return false;
    return cfgSig !== lastSavedKey;
  }, [cfgSig, lastSavedKey, hydrated]);

  // ===== load from localStorage (baseline) =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const s = window.localStorage.getItem("tripleform_cod_pixels_v1");
      if (!s) return;

      const parsed = JSON.parse(s);

      setCfg((prev) => {
        const next = { ...prev, ...parsed };
        const key = stableStringify(next);
        setLastSavedKey(key);
        return next;
      });
    } catch (e) {
      console.error("load pixels localStorage:", e);
    }
  }, []);

  // ===== load from store (remote wins) =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pixels/load", { credentials: "include" });
        const j = await res.json().catch(() => null);
        if (cancelled) return;

        if (j?.ok && j.pixels) {
          setCfg((prev) => {
            const next = { ...prev, ...j.pixels };
            const key = stableStringify(next);
            setLastSavedKey(key);
            return next;
          });

          try {
            window.localStorage.setItem(
              "tripleform_cod_pixels_v1",
              JSON.stringify(j.pixels)
            );
          } catch {}
        } else {
          setLastSavedKey((k) => k || stableStringify(cfg));
        }
      } catch (e) {
        console.error("Error loading pixels (remote):", e);
        setLastSavedKey((k) => k || stableStringify(cfg));
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== auto-save to localStorage (optional) =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tripleform_cod_pixels_v1", JSON.stringify(cfg));
    } catch (e) {
      console.error("save pixels localStorage:", e);
    }
  }, [cfg]);

  /* === SAVE to store (returns boolean) === */
  const saveToShop = async () => {
    try {
      setTestError(null);

      const res = await fetch("/api/pixels/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pixels: cfg }),
      });

      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      setLastSavedKey(stableStringify(cfg));
      return true;
    } catch (e) {
      console.error("save pixels remote error:", e);
      return false;
    }
  };

  // ✅ unified navigation guard (only when user tries to leave the section)
  const guard = useUnsavedNavigationGuard({
    dirty,
    onSave: saveToShop,
    navigate,
  });

  /* === TEST backend button === */
  const handleTestRemote = async () => {
    try {
      setTestLoading(true);
      setTestResult(null);
      setTestError(null);

      const res = await fetch("/api/pixels/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Test failed");

      setTestResult(j);
    } catch (e) {
      setTestError(e?.message || tr("section4.tests.unknownError", "Unknown error"));
    } finally {
      setTestLoading(false);
    }
  };

  /* ===== simple setters ===== */
  const setGoogle = (p) => setCfg((c) => ({ ...c, google: { ...c.google, ...p } }));
  const setFB = (p) => setCfg((c) => ({ ...c, fb: { ...c.fb, ...p } }));
  const setCAPIFB = (p) => setCfg((c) => ({ ...c, capi_fb: { ...c.capi_fb, ...p } }));
  const setTT = (p) => setCfg((c) => ({ ...c, tiktok: { ...c.tiktok, ...p } }));
  const setTTAPI = (p) =>
    setCfg((c) => ({ ...c, tiktok_api: { ...c.tiktok_api, ...p } }));

  /* ===== Master toggle (no schema change: sets existing flags) ===== */
  const allEnabled = !!(
    cfg.google.enabled &&
    cfg.fb.enabled &&
    cfg.capi_fb.enabled &&
    cfg.tiktok.enabled &&
    cfg.tiktok_api.enabled
  );

  const toggleAll = (v) => {
    setCfg((c) => ({
      ...c,
      google: { ...c.google, enabled: v },
      fb: { ...c.fb, enabled: v },
      capi_fb: { ...c.capi_fb, enabled: v },
      tiktok: { ...c.tiktok, enabled: v },
      tiktok_api: { ...c.tiktok_api, enabled: v },
    }));
  };

  /* ===== Tabs (same spirit as Offers topnav) ===== */
  const tabs = useMemo(
    () => [
      { id: "overview", content: tr("section4.rail.panels.overview", "Overview") },
      { id: "google", content: tr("section4.rail.panels.google", "Google") },
      { id: "fb", content: tr("section4.rail.panels.fb", "Facebook Pixel") },
      { id: "capi_fb", content: tr("section4.rail.panels.capi_fb", "Facebook CAPI") },
      { id: "tiktok", content: tr("section4.rail.panels.tiktok", "TikTok Pixel") },
      { id: "tiktok_api", content: tr("section4.rail.panels.tiktok_api", "TikTok API") },
      { id: "tests", content: tr("section4.rail.panels.tests", "Tests") },
    ],
    [tr]
  );

  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === view));

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? tr("section4.status.on", "Enabled") : tr("section4.status.off", "Disabled")}
    </Badge>
  );

  const readyBadge = (ok) => (
    <Badge tone={ok ? "success" : "critical"}>
      {ok ? tr("section4.status.ready", "Ready") : tr("section4.status.notReady", "Not ready")}
    </Badge>
  );

  return (
    <>
      {/* ✅ Header unifié (same as Offers) */}
      <TFSectionHeader
        title={tr("section4.header.appTitle", "TripleForm COD")}
        subtitle={tr("section4.header.appSubtitle", "Pixels & Tracking")}
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
              {tr("section4.buttons.saveStore", "Save")}
            </Button>
          </InlineStack>
        }
      />

      {/* ✅ Save Bar: appears only when user tries to leave the section */}
      <UnsavedSaveBar
        open={guard.open}
        dirty={dirty}
        saving={guard.saving}
        mode={guard.mode}
        onSave={guard.onSave}
        onDiscard={guard.onDiscard}
        onCancel={guard.onCancel}
        t={(k, vars) => tr(k, vars?.fallback)}
      />

      <div className="tf-shell">
        {/* ✅ Top tabs bar (centered + boxed tabs) */}
        <div className="tf-topnav">
          <Tabs
            tabs={tabs}
            selected={selectedTabIndex}
            onSelect={(idx) => setView(tabs[idx]?.id || "overview")}
          />
        </div>

        <div className="tf-editor">
          {/* ====================== LEFT / MAIN ====================== */}
          <div className="tf-main-col">
            {/* ===== OVERVIEW (tiles like Shopify settings) ===== */}
            {view === "overview" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.overview.title", "Settings overview")}>
                    <Text as="p">
                      {tr(
                        "section4.overview.description",
                        "Configure tracking platforms and events. Your settings are saved to the shop."
                      )}
                    </Text>

                    <div className="tf-dashboard-grid" style={{ marginTop: 8 }}>
                      <SettingTileCard
                        iconName="AnalyticsIcon"
                        title={tr("section4.platforms.google", "Google")}
                        description={tr("section4.overview.googleDesc", "GA4 + Google Ads conversions")}
                        statusText={
                          cfg.google.enabled
                            ? tr("section4.status.on", "Enabled")
                            : tr("section4.status.off", "Disabled")
                        }
                        statusTone={cfg.google.enabled ? "success" : "critical"}
                        actionLabel={tr("common.configure", "Configure")}
                        onOpen={() => setView("google")}
                      />

                      <SettingTileCard
                        iconName="LogoFacebookIcon"
                        title={tr("section4.platforms.fbPixel", "Facebook Pixel")}
                        description={tr("section4.overview.fbPixelDesc", "Browser pixel events")}
                        statusText={
                          cfg.fb.enabled
                            ? tr("section4.status.on", "Enabled")
                            : tr("section4.status.off", "Disabled")
                        }
                        statusTone={cfg.fb.enabled ? "success" : "critical"}
                        actionLabel={tr("common.configure", "Configure")}
                        onOpen={() => setView("fb")}
                      />

                      <SettingTileCard
                        iconName="ShieldCheckMarkIcon"
                        title={tr("section4.platforms.fbCAPI", "Facebook CAPI")}
                        description={tr("section4.overview.fbCAPIDesc", "Server-side events (dedup supported)")}
                        statusText={
                          cfg.capi_fb.enabled
                            ? tr("section4.status.on", "Enabled")
                            : tr("section4.status.off", "Disabled")
                        }
                        statusTone={cfg.capi_fb.enabled ? "success" : "critical"}
                        actionLabel={tr("common.configure", "Configure")}
                        onOpen={() => setView("capi_fb")}
                      />

                      <SettingTileCard
                        iconName="MarketingIcon"
                        title={tr("section4.platforms.tiktokPixel", "TikTok Pixel")}
                        description={tr("section4.overview.tiktokPixelDesc", "Client-side TikTok tracking")}
                        statusText={
                          cfg.tiktok.enabled
                            ? tr("section4.status.on", "Enabled")
                            : tr("section4.status.off", "Disabled")
                        }
                        statusTone={cfg.tiktok.enabled ? "success" : "critical"}
                        actionLabel={tr("common.configure", "Configure")}
                        onOpen={() => setView("tiktok")}
                      />

                      <SettingTileCard
                        iconName="LockIcon"
                        title={tr("section4.platforms.tiktokAPI", "TikTok API")}
                        description={tr("section4.overview.tiktokAPIDesc", "Server-side purchase events")}
                        statusText={
                          cfg.tiktok_api.enabled
                            ? tr("section4.status.on", "Enabled")
                            : tr("section4.status.off", "Disabled")
                        }
                        statusTone={cfg.tiktok_api.enabled ? "success" : "critical"}
                        actionLabel={tr("common.configure", "Configure")}
                        onOpen={() => setView("tiktok_api")}
                      />

                      <SettingTileCard
                        iconName="SearchIcon"
                        title={tr("section4.tests.title", "Tests")}
                        description={tr("section4.tests.description", "Verify your setup and server readiness")}
                        statusText={tr("common.tools", "Tools")}
                        statusTone="subdued"
                        actionLabel={tr("common.open", "Open")}
                        onOpen={() => setView("tests")}
                      />
                    </div>

                    <Divider />

                    {/* ✅ Global-like block (same visual style as Offers “Global”) */}
                    <Card>
                      <div className="tf-group-title">{tr("section4.global.title", "Global")}</div>
                      <BlockStack gap="200">
                        <Checkbox
                          label={tr("section4.global.enableAll", "Enable all tracking platforms")}
                          checked={allEnabled}
                          onChange={(v) => toggleAll(v)}
                        />
                        <Text tone="subdued" as="p">
                          {tr(
                            "section4.global.help",
                            "This toggles Google, Facebook (Pixel + CAPI), and TikTok (Pixel + API). You can still configure each platform in detail."
                          )}
                        </Text>
                      </BlockStack>
                    </Card>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== GOOGLE ===== */}
            {view === "google" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.google.mainTitle", "Google tracking")}>
                    <Grid3>
                      <Checkbox
                        label={tr("section4.google.enableLabel", "Enable Google")}
                        checked={!!cfg.google.enabled}
                        onChange={(v) => setGoogle({ enabled: v })}
                      />
                      <TextField
                        label={tr("section4.google.measurementIdLabel", "GA4 Measurement ID")}
                        autoComplete="off"
                        value={cfg.google.measurementId}
                        onChange={(v) => setGoogle({ measurementId: v })}
                      />
                      <TextField
                        label={tr("section4.google.adsConversionIdLabel", "Google Ads Conversion ID")}
                        autoComplete="off"
                        value={cfg.google.adsConversionId}
                        onChange={(v) => setGoogle({ adsConversionId: v })}
                      />
                      <TextField
                        label={tr("section4.google.adsConversionLabel", "Google Ads Conversion Label")}
                        autoComplete="off"
                        value={cfg.google.adsConversionLabel}
                        onChange={(v) => setGoogle({ adsConversionLabel: v })}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {tr("section4.google.helpText", "Add your GA4 / Ads IDs to send events.")}
                    </Text>
                  </GroupCard>

                  <GroupCard title={tr("section4.google.eventsTitle", "Events")}>
                    <BlockStack gap="100">
                      <Checkbox
                        label={tr("section4.google.sendPageView", "Send PageView")}
                        checked={!!cfg.google.sendPageView}
                        onChange={(v) => setGoogle({ sendPageView: v })}
                      />
                      <Checkbox
                        label={tr("section4.google.sendPurchase", "Send Purchase")}
                        checked={!!cfg.google.sendPurchase}
                        onChange={(v) => setGoogle({ sendPurchase: v })}
                      />
                      <Text tone="subdued" as="p">
                        {tr("section4.google.eventsHelp", "Choose which events are sent to Google.")}
                      </Text>
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== FB PIXEL ===== */}
            {view === "fb" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.fbPixel.mainTitle", "Facebook Pixel")}>
                    <Grid3>
                      <Checkbox
                        label={tr("section4.fbPixel.enableLabel", "Enable Pixel")}
                        checked={!!cfg.fb.enabled}
                        onChange={(v) => setFB({ enabled: v })}
                      />
                      <TextField
                        label={tr("section4.fbPixel.nameLabel", "Name")}
                        autoComplete="off"
                        value={cfg.fb.name}
                        onChange={(v) => setFB({ name: v })}
                      />
                      <TextField
                        label={tr("section4.fbPixel.pixelIdLabel", "Pixel ID")}
                        autoComplete="off"
                        value={cfg.fb.pixelId}
                        onChange={(v) => setFB({ pixelId: v })}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {tr("section4.fbPixel.helpText", "Configure your browser Pixel tracking.")}
                    </Text>
                  </GroupCard>

                  <GroupCard title={tr("section4.fbPixel.eventsTitle", "Events")}>
                    <BlockStack gap="100">
                      <Checkbox
                        label={tr("section4.fbPixel.pageView", "PageView")}
                        checked={!!cfg.fb.pageView}
                        onChange={(v) => setFB({ pageView: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbPixel.viewContent", "ViewContent")}
                        checked={!!cfg.fb.viewContent}
                        onChange={(v) => setFB({ viewContent: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbPixel.addToCart", "AddToCart")}
                        checked={!!cfg.fb.addToCart}
                        onChange={(v) => setFB({ addToCart: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbPixel.initiateCheckout", "InitiateCheckout")}
                        checked={!!cfg.fb.initiateCheckout}
                        onChange={(v) => setFB({ initiateCheckout: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbPixel.purchase", "Purchase")}
                        checked={!!cfg.fb.purchase}
                        onChange={(v) => setFB({ purchase: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbPixel.advancedMatching", "Advanced matching")}
                        checked={!!cfg.fb.advancedMatching}
                        onChange={(v) => setFB({ advancedMatching: v })}
                      />
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== FB CAPI ===== */}
            {view === "capi_fb" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.fbCAPI.mainTitle", "Facebook Conversions API")}>
                    <Grid3>
                      <Checkbox
                        label={tr("section4.fbCAPI.enableLabel", "Enable CAPI")}
                        checked={!!cfg.capi_fb.enabled}
                        onChange={(v) => setCAPIFB({ enabled: v })}
                      />
                      <TextField
                        label={tr("section4.fbCAPI.pixelIdLabel", "Pixel ID")}
                        autoComplete="off"
                        value={cfg.capi_fb.pixelId}
                        onChange={(v) => setCAPIFB({ pixelId: v })}
                      />
                      <TextField
                        label={tr("section4.fbCAPI.accessTokenLabel", "Access token")}
                        autoComplete="off"
                        value={cfg.capi_fb.accessToken}
                        onChange={(v) => setCAPIFB({ accessToken: v })}
                      />
                      <TextField
                        label={tr("section4.fbCAPI.testEventCodeLabel", "Test event code")}
                        autoComplete="off"
                        value={cfg.capi_fb.testEventCode}
                        onChange={(v) => setCAPIFB({ testEventCode: v })}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {tr("section4.fbCAPI.helpText", "Server events with optional deduplication.")}
                    </Text>
                  </GroupCard>

                  <GroupCard title={tr("section4.fbCAPI.eventsTitle", "Events")}>
                    <BlockStack gap="100">
                      <Checkbox
                        label={tr("section4.fbCAPI.sendViewContent", "Send ViewContent")}
                        checked={!!cfg.capi_fb.sendViewContent}
                        onChange={(v) => setCAPIFB({ sendViewContent: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbCAPI.sendAddToCart", "Send AddToCart")}
                        checked={!!cfg.capi_fb.sendAddToCart}
                        onChange={(v) => setCAPIFB({ sendAddToCart: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbCAPI.sendPurchase", "Send Purchase")}
                        checked={!!cfg.capi_fb.sendPurchase}
                        onChange={(v) => setCAPIFB({ sendPurchase: v })}
                      />
                      <Checkbox
                        label={tr("section4.fbCAPI.useEventIdDedup", "Use eventId dedup")}
                        checked={!!cfg.capi_fb.useEventIdDedup}
                        onChange={(v) => setCAPIFB({ useEventIdDedup: v })}
                      />
                      <Text tone="subdued" as="p">
                        {tr("section4.fbCAPI.eventsHelp", "Enable events to be sent server-side.")}
                      </Text>
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== TIKTOK PIXEL ===== */}
            {view === "tiktok" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.tiktokPixel.mainTitle", "TikTok Pixel")}>
                    <Grid3>
                      <Checkbox
                        label={tr("section4.tiktokPixel.enableLabel", "Enable TikTok Pixel")}
                        checked={!!cfg.tiktok.enabled}
                        onChange={(v) => setTT({ enabled: v })}
                      />
                      <TextField
                        label={tr("section4.tiktokPixel.nameLabel", "Name")}
                        autoComplete="off"
                        value={cfg.tiktok.name}
                        onChange={(v) => setTT({ name: v })}
                      />
                      <TextField
                        label={tr("section4.tiktokPixel.pixelIdLabel", "Pixel ID")}
                        autoComplete="off"
                        value={cfg.tiktok.pixelId}
                        onChange={(v) => setTT({ pixelId: v })}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {tr("section4.tiktokPixel.helpText", "Configure client-side TikTok tracking.")}
                    </Text>
                  </GroupCard>

                  <GroupCard title={tr("section4.tiktokPixel.eventsTitle", "Events")}>
                    <BlockStack gap="100">
                      <Checkbox
                        label={tr("section4.tiktokPixel.pageView", "PageView")}
                        checked={!!cfg.tiktok.pageView}
                        onChange={(v) => setTT({ pageView: v })}
                      />
                      <Checkbox
                        label={tr("section4.tiktokPixel.viewContent", "ViewContent")}
                        checked={!!cfg.tiktok.viewContent}
                        onChange={(v) => setTT({ viewContent: v })}
                      />
                      <Checkbox
                        label={tr("section4.tiktokPixel.addToCart", "AddToCart")}
                        checked={!!cfg.tiktok.addToCart}
                        onChange={(v) => setTT({ addToCart: v })}
                      />
                      <Checkbox
                        label={tr("section4.tiktokPixel.purchase", "Purchase")}
                        checked={!!cfg.tiktok.purchase}
                        onChange={(v) => setTT({ purchase: v })}
                      />
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== TIKTOK API ===== */}
            {view === "tiktok_api" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.tiktokAPI.mainTitle", "TikTok Events API")}>
                    <Grid3>
                      <Checkbox
                        label={tr("section4.tiktokAPI.enableLabel", "Enable TikTok API")}
                        checked={!!cfg.tiktok_api.enabled}
                        onChange={(v) => setTTAPI({ enabled: v })}
                      />
                      <TextField
                        label={tr("section4.tiktokAPI.pixelCodeLabel", "Pixel code")}
                        autoComplete="off"
                        value={cfg.tiktok_api.pixelCode}
                        onChange={(v) => setTTAPI({ pixelCode: v })}
                      />
                      <TextField
                        label={tr("section4.tiktokAPI.accessTokenLabel", "Access token")}
                        autoComplete="off"
                        value={cfg.tiktok_api.accessToken}
                        onChange={(v) => setTTAPI({ accessToken: v })}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {tr("section4.tiktokAPI.helpText", "Send server-side TikTok events (purchase).")}
                    </Text>
                  </GroupCard>

                  <GroupCard title={tr("section4.tiktokAPI.eventsTitle", "Events")}>
                    <BlockStack gap="100">
                      <Checkbox
                        label={tr("section4.tiktokAPI.sendPurchase", "Send Purchase")}
                        checked={!!cfg.tiktok_api.sendPurchase}
                        onChange={(v) => setTTAPI({ sendPurchase: v })}
                      />
                      <Text tone="subdued" as="p">
                        {tr("section4.tiktokAPI.eventsHelp", "Choose which events are sent to TikTok API.")}
                      </Text>
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {/* ===== TESTS ===== */}
            {view === "tests" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title={tr("section4.tests.title", "Tests")}>
                    <BlockStack gap="200">
                      <Text as="p">
                        {tr("section4.tests.description", "Run checks to confirm your tracking setup.")}
                      </Text>

                      <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 13 }}>
                        <li>{tr("section4.tests.list.fbPixel", "Facebook Pixel readiness")}</li>
                        <li>{tr("section4.tests.list.tiktokPixel", "TikTok Pixel readiness")}</li>
                        <li>{tr("section4.tests.list.fbCAPI", "Facebook CAPI readiness")}</li>
                        <li>{tr("section4.tests.list.tiktokAPI", "TikTok API readiness")}</li>
                      </ul>

                      <InlineStack gap="200" align="start">
                        <Button variant="primary" onClick={handleTestRemote} loading={testLoading}>
                          {tr("section4.tests.testButton", "Run tests")}
                        </Button>
                      </InlineStack>

                      {testError && (
                        <Text tone="critical" as="p">
                          {tr("section4.tests.error", `Error: ${testError}`)}
                        </Text>
                      )}

                      {testResult && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 10,
                            borderRadius: 8,
                            border: "1px solid #E5E7EB",
                            background: "#F9FAFB",
                          }}
                        >
                          <BlockStack gap="150">
                            <InlineStack align="space-between">
                              <Text as="span">{tr("section4.tests.result.fbPixel", "FB Pixel")}</Text>
                              {readyBadge(!!testResult.fbClientReady)}
                            </InlineStack>
                            <InlineStack align="space-between">
                              <Text as="span">
                                {tr("section4.tests.result.tiktokPixel", "TikTok Pixel")}
                              </Text>
                              {readyBadge(!!testResult.tiktokClientReady)}
                            </InlineStack>
                            <InlineStack align="space-between">
                              <Text as="span">{tr("section4.tests.result.fbCAPI", "FB CAPI")}</Text>
                              {readyBadge(!!testResult.fbCapiReady)}
                            </InlineStack>
                            <InlineStack align="space-between">
                              <Text as="span">{tr("section4.tests.result.tiktokAPI", "TikTok API")}</Text>
                              {readyBadge(!!testResult.tiktokApiReady)}
                            </InlineStack>

                            <Text tone="subdued" as="p">
                              {tr("section4.tests.resultNote", "Tip: Save your settings, then re-run tests.")}
                            </Text>
                          </BlockStack>
                        </div>
                      )}
                    </BlockStack>
                  </GroupCard>
                </BlockStack>
              </div>
            )}
          </div>

          {/* ====================== RIGHT / STICKY (like Offers preview column) ====================== */}
          <div className="tf-preview-col">
            <div className="tf-preview-card" style={{ marginBottom: 12 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {tr("section4.preview.statusTitle", "Tracking status")}
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
                  <Text as="span">{tr("section4.platforms.google", "Google")}</Text>
                  {statusBadge(cfg.google.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{tr("section4.platforms.fbPixel", "FB Pixel")}</Text>
                  {statusBadge(cfg.fb.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{tr("section4.platforms.fbCAPI", "FB CAPI")}</Text>
                  {statusBadge(cfg.capi_fb.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{tr("section4.platforms.tiktokPixel", "TikTok Pixel")}</Text>
                  {statusBadge(cfg.tiktok.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{tr("section4.platforms.tiktokAPI", "TikTok API")}</Text>
                  {statusBadge(cfg.tiktok_api.enabled)}
                </InlineStack>
              </BlockStack>
            </div>

            {/* ✅ Guide fixed: normal horizontal list (no multi-column / no vertical look) */}
            <div className="tf-preview-card tf-guide-box">
              <Text as="h3" variant="headingSm">
                {tr("section4.guide.title", "Guide")}
              </Text>

              <ol className="tf-guide-ol">
                <li>{tr("section4.guide.step1", "1) Enable a platform in its tab.")}</li>
                <li>{tr("section4.guide.step2", "2) Enter IDs / tokens required by the platform.")}</li>
                <li>{tr("section4.guide.step3", "3) Select events you want to send.")}</li>
                <li>{tr("section4.guide.step4", "4) Click Save (top right).")}</li>
                <li>{tr("section4.guide.step5", "5) Use Tests to verify readiness.")}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
