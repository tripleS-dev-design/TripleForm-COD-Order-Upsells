// ===== File: app/sections/Section4Pixels.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Checkbox,
  Button,
  Badge,
} from "@shopify/polaris";
import { useI18n } from "../i18n/react";
import CountryFlagsBar from "../components/CountryFlagsBar";

/* ======================= CSS / layout (match Section Form) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ HEADER SLIM + FLAGS (same as Section Form) */
  .tf-header{
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:6px 10px;
    position:sticky;
    top:0;
    z-index:60;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }
  .tf-header-row{
    display:grid;
    grid-template-columns: auto 1fr auto;
    align-items:center;
    gap:10px;
    min-height:44px;
  }
  .tf-brand{
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }
  .tf-brand-text{
    display:flex;
    flex-direction:column;
    min-width:0;
    line-height:1.05;
  }
  .tf-brand-title{
    font-weight:900;
    color:#F9FAFB;
    font-size:13px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-brand-sub{
    font-size:11px;
    color:rgba(249,250,251,0.78);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-flags-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    width:100%;
    min-width:0;
  }
  .tf-header-right{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:10px;
    min-width:0;
  }

  /* ✅ SAVE BAR (slim, pro) — same as Section Form */
  .tf-savebar{
    position:sticky;
    top:56px;
    z-index:55;
    padding:8px 10px;
    background:rgba(255,255,255,0.86);
    backdrop-filter: blur(10px);
    border-bottom:1px solid #E5E7EB;
  }
  .tf-savebar-inner{
    max-width:1100px;
    margin:0 auto;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:10px 12px;
    border-radius:14px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,.06);
  }
  .tf-savebar-left{
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }
  .tf-savebadge{
    font-size:12px;
    font-weight:900;
    padding:6px 10px;
    border-radius:999px;
    border:1px solid #E5E7EB;
    background:#F8FAFC;
    white-space:nowrap;
  }
  .tf-savebar-text{
    display:flex;
    flex-direction:column;
    min-width:0;
    line-height:1.15;
  }
  .tf-savemsg{
    font-size:13px;
    font-weight:700;
    color:#0F172A;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .tf-savesub{
    font-size:12px;
    color:#64748B;
    font-weight:600;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }

  @keyframes tfBarBlink { 0%,100%{filter:none} 50%{filter:brightness(1.15)} }
  @keyframes tfBarSlide { 0%{transform:translateX(0)} 50%{transform:translateX(10px)} 100%{transform:translateX(0)} }
  .tf-attention{
    animation: tfBarBlink .9s ease-in-out 2, tfBarSlide .9s ease-in-out 2;
    border-color:#F97316 !important;
    box-shadow:0 10px 24px rgba(249,115,22,.18);
  }

  .tf-shell { padding:16px; }

  /* ===== Grid: left rail | center content | right guide ===== */
  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

  .tf-rail {
    position:sticky;
    top:116px;
    max-height:calc(100vh - 132px);
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

  .tf-side-col {
    position:sticky;
    top:116px;
    max-height:calc(100vh - 132px);
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

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }
    .tf-brand-sub{ display:none; }
  }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-pixels-css")) return;
    const s = document.createElement("style");
    s.id = "tf-pixels-css";
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
function GroupCard({ title, children, t }) {
  return (
    <Card>
      <div className="tf-group-title">{t(title)}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

const Grid3 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
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

/* ============================== SaveBarSlim (same design as Section Form) ============================== */
function SaveBarSlim({ show, dirty, saving, notice, attention, onSave, t }) {
  if (!show) return null; // ✅ key: only show when user switches panel / save result
  if (!dirty && !notice) return null;

  const isError = notice?.type === "error";
  const isSuccess = notice?.type === "success";

  const badgeText = isError ? "Error" : isSuccess ? "Saved" : dirty ? "Unsaved" : "Info";
  const badgeStyle = isError
    ? { background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }
    : isSuccess
    ? { background: "#ECFDF5", borderColor: "#86EFAC", color: "#065F46" }
    : dirty
    ? { background: "#FFF7ED", borderColor: "#FDBA74", color: "#9A3412" }
    : {};

  const mainMsg =
    notice?.msg ||
    (dirty ? (t?.("common.unsavedChanges") || "You have unsaved changes.") : "");

  const subMsg =
    dirty
      ? (t?.("common.unsavedSub") ||
          "Save before leaving this section to avoid losing changes.")
      : "";

  return (
    <div className="tf-savebar">
      <div className={`tf-savebar-inner ${attention ? "tf-attention" : ""}`}>
        <div className="tf-savebar-left">
          <span className="tf-savebadge" style={badgeStyle}>
            {badgeText}
          </span>

          <div className="tf-savebar-text">
            <div className="tf-savemsg">{mainMsg}</div>
            {subMsg ? <div className="tf-savesub">{subMsg}</div> : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dirty ? (
            <Button variant="primary" onClick={onSave} loading={saving}>
              {t?.("common.save") || "Save"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============================== HEADER SHELL (with flags) ============================== */
function PageShell({ children, t, onSave, saving }) {
  return (
    <>
      <div className="tf-header">
        <div className="tf-header-row">
          {/* LEFT: brand */}
          <div className="tf-brand">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(11,59,130,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
                flex: "0 0 auto",
              }}
            >
              <img
                src="/tripleform-cod-icon.png"
                alt="TripleForm COD"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>

            <div className="tf-brand-text">
              <div className="tf-brand-title">
                {t("section4.header.appTitle") || "TripleForm COD"}
              </div>
              <div className="tf-brand-sub">
                {t("section4.header.appSubtitle") || "Pixels & Tracking"}
              </div>
            </div>
          </div>

          {/* CENTER: flags */}
          <div className="tf-flags-wrap">
            <CountryFlagsBar />
          </div>

          {/* RIGHT: actions */}
          <div className="tf-header-right">
            <Button variant="primary" size="slim" onClick={onSave} loading={saving}>
              {t("section4.buttons.saveStore") || "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== page ============================== */
export default function Section4Pixels() {
  useInjectCss();

  const { t: rawT } = useI18n();
  const t = (key, vars) => {
    try {
      return rawT(key, vars);
    } catch (e) {
      console.error("i18n error in Section4Pixels for key:", key, e);
      return key;
    }
  };

  const [cfg, setCfg] = useState(defaultCfg);
  const [view, setView] = useState("overview"); // overview | google | fb | capi_fb | tiktok | tiktok_api | tests

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const [saving, setSaving] = useState(false);

  // ✅ unified dirty snapshot
  const lastSavedRef = useRef(stableStringify(defaultCfg()));
  const cfgSig = useMemo(() => stableStringify(cfg), [cfg]);
  const [dirty, setDirty] = useState(false);

  // ✅ SaveBar behavior (ONLY on panel switch OR save result)
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null); // {type,msg}
  const [saveAttention, setSaveAttention] = useState(false);
  const attentionTimerRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const lastViewRef = useRef(view);

  const bumpAttention = () => {
    setSaveAttention(true);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
    if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    attentionTimerRef.current = setTimeout(() => setSaveAttention(false), 1600);
  };

  const pushNotice = (type, msg) => {
    setSaveNotice({ type, msg });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setSaveNotice(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  // ✅ Detect dirty (NO spam bar here)
  useEffect(() => {
    setDirty(cfgSig !== lastSavedRef.current);
  }, [cfgSig]);

  // ✅ When user switches panel: if dirty => SHOW save bar + attention
  useEffect(() => {
    const prev = lastViewRef.current;
    if (prev !== view) {
      if (dirty) {
        setShowSaveBar(true);
        bumpAttention();
        // optional message (keeps badge Unsaved)
        pushNotice(
          null,
          t("common.unsavedChanges") ||
            "You have unsaved changes. Save to apply them to your store."
        );
      }
      lastViewRef.current = view;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // ===== load from localStorage =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const s = window.localStorage.getItem("tripleform_cod_pixels_v1");
      if (s) {
        const parsed = JSON.parse(s);
        setCfg((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("load pixels localStorage:", e);
    }
  }, []);

  // ===== load from store (metafield) =====
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
            lastSavedRef.current = stableStringify(next);
            return next;
          });

          try {
            window.localStorage.setItem(
              "tripleform_cod_pixels_v1",
              JSON.stringify(j.pixels)
            );
          } catch {}

          setShowSaveBar(false);
          setSaveNotice(null);
          setSaveAttention(false);
        }
      } catch (e) {
        console.error("Error loading pixels (remote):", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== auto-save to localStorage =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tripleform_cod_pixels_v1", JSON.stringify(cfg));
    } catch (e) {
      console.error("save pixels localStorage:", e);
    }
  }, [cfg]);

  /* === SAVE to store === */
  const handleSaveRemote = async () => {
    try {
      setSaving(true);
      setTestError(null);

      const res = await fetch("/api/pixels/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pixels: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      lastSavedRef.current = stableStringify(cfg);
      setDirty(false);

      // ✅ show bar for feedback, then auto-hide
      setShowSaveBar(true);
      pushNotice(
        "success",
        t("section4.save.success") ||
          "Saved successfully. Your tracking settings are now applied."
      );

      setTimeout(() => {
        setShowSaveBar(false);
      }, 1800);
    } catch (e) {
      setShowSaveBar(true);
      bumpAttention();
      pushNotice(
        "error",
        t("section4.save.error", { error: e?.message }) ||
          `Save failed: ${e?.message || "Unknown error"}`
      );
    } finally {
      setSaving(false);
    }
  };

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
      setTestError(e?.message || t("section4.tests.unknownError"));
    } finally {
      setTestLoading(false);
    }
  };

  /* ===== simple setters ===== */
  const setGoogle = (p) => setCfg((c) => ({ ...c, google: { ...c.google, ...p } }));
  const setFB = (p) => setCfg((c) => ({ ...c, fb: { ...c.fb, ...p } }));
  const setCAPIFB = (p) => setCfg((c) => ({ ...c, capi_fb: { ...c.capi_fb, ...p } }));
  const setTT = (p) => setCfg((c) => ({ ...c, tiktok: { ...c.tiktok, ...p } }));
  const setTTAPI = (p) => setCfg((c) => ({ ...c, tiktok_api: { ...c.tiktok_api, ...p } }));

  /* ===== rail menu ===== */
  const panels = [
    { key: "overview", label: t("section4.rail.panels.overview") },
    { key: "google", label: t("section4.rail.panels.google") },
    { key: "fb", label: t("section4.rail.panels.fb") },
    { key: "capi_fb", label: t("section4.rail.panels.capi_fb") },
    { key: "tiktok", label: t("section4.rail.panels.tiktok") },
    { key: "tiktok_api", label: t("section4.rail.panels.tiktok_api") },
    { key: "tests", label: t("section4.rail.panels.tests") },
  ];

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? t("section4.status.on") : t("section4.status.off")}
    </Badge>
  );

  const readyBadge = (ok) => (
    <Badge tone={ok ? "success" : "critical"}>
      {ok ? t("section4.status.ready") : t("section4.status.notReady")}
    </Badge>
  );

  const go = (nextKey) => setView(nextKey);

  return (
    <PageShell t={t} onSave={handleSaveRemote} saving={saving}>
      {/* ✅ SaveBarSlim — shows ONLY when switching panel while dirty OR after save/error */}
      <SaveBarSlim
        show={showSaveBar}
        dirty={dirty}
        saving={saving}
        notice={saveNotice}
        attention={saveAttention}
        onSave={handleSaveRemote}
        t={t}
      />

      <div className="tf-editor">
        {/* ===== Left rail ===== */}
        <div className="tf-rail">
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section4.rail.title")}</div>
            <div className="tf-rail-list">
              {panels.map((it) => (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={view === it.key ? 1 : 0}
                  onClick={() => go(it.key)}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section4.rail.statusTitle")}</div>
            <div style={{ padding: 10 }}>
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <Text as="span">{t("section4.platforms.google")}</Text>
                  {statusBadge(cfg.google.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section4.platforms.fbPixel")}</Text>
                  {statusBadge(cfg.fb.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section4.platforms.fbCAPI")}</Text>
                  {statusBadge(cfg.capi_fb.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section4.platforms.tiktokPixel")}</Text>
                  {statusBadge(cfg.tiktok.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">{t("section4.platforms.tiktokAPI")}</Text>
                  {statusBadge(cfg.tiktok_api.enabled)}
                </InlineStack>

                {dirty ? (
                  <Text as="p" tone="warning">
                    {t("common.unsavedShort") || "Unsaved changes"}
                  </Text>
                ) : null}
              </BlockStack>
            </div>
          </div>
        </div>

        {/* ===== Center column ===== */}
        <div className="tf-main-col">
          {view === "overview" && (
            <div className="tf-panel">
              <GroupCard t={t} title="section4.overview.title">
                <BlockStack gap="200">
                  <Text as="p">{t("section4.overview.description")}</Text>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 13 }}>
                    <li>
                      <b>{t("section4.platforms.google")}</b>: {t("section4.overview.googleDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.fbPixel")}</b>: {t("section4.overview.fbPixelDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.fbCAPI")}</b>: {t("section4.overview.fbCAPIDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.tiktokPixel")}</b>: {t("section4.overview.tiktokPixelDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.tiktokAPI")}</b>: {t("section4.overview.tiktokAPIDesc")}
                    </li>
                  </ul>
                </BlockStack>
              </GroupCard>
            </div>
          )}

          {view === "google" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.google.mainTitle">
                  <Grid3>
                    <Checkbox
                      label={t("section4.google.enableLabel")}
                      checked={!!cfg.google.enabled}
                      onChange={(v) => setGoogle({ enabled: v })}
                    />
                    <TextField
                      label={t("section4.google.measurementIdLabel")}
                      autoComplete="off"
                      value={cfg.google.measurementId}
                      onChange={(v) => setGoogle({ measurementId: v })}
                    />
                    <TextField
                      label={t("section4.google.adsConversionIdLabel")}
                      autoComplete="off"
                      value={cfg.google.adsConversionId}
                      onChange={(v) => setGoogle({ adsConversionId: v })}
                    />
                    <TextField
                      label={t("section4.google.adsConversionLabel")}
                      autoComplete="off"
                      value={cfg.google.adsConversionLabel}
                      onChange={(v) => setGoogle({ adsConversionLabel: v })}
                    />
                  </Grid3>
                  <Text tone="subdued" as="p">
                    {t("section4.google.helpText")}
                  </Text>
                </GroupCard>

                <GroupCard t={t} title="section4.google.eventsTitle">
                  <BlockStack gap="100">
                    <Checkbox
                      label={t("section4.google.sendPageView")}
                      checked={!!cfg.google.sendPageView}
                      onChange={(v) => setGoogle({ sendPageView: v })}
                    />
                    <Checkbox
                      label={t("section4.google.sendPurchase")}
                      checked={!!cfg.google.sendPurchase}
                      onChange={(v) => setGoogle({ sendPurchase: v })}
                    />
                    <Text tone="subdued" as="p">
                      {t("section4.google.eventsHelp")}
                    </Text>
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {view === "fb" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.fbPixel.mainTitle">
                  <Grid3>
                    <Checkbox
                      label={t("section4.fbPixel.enableLabel")}
                      checked={!!cfg.fb.enabled}
                      onChange={(v) => setFB({ enabled: v })}
                    />
                    <TextField
                      label={t("section4.fbPixel.nameLabel")}
                      autoComplete="off"
                      value={cfg.fb.name}
                      onChange={(v) => setFB({ name: v })}
                    />
                    <TextField
                      label={t("section4.fbPixel.pixelIdLabel")}
                      autoComplete="off"
                      value={cfg.fb.pixelId}
                      onChange={(v) => setFB({ pixelId: v })}
                    />
                  </Grid3>
                  <Text tone="subdued" as="p">
                    {t("section4.fbPixel.helpText")}
                  </Text>
                </GroupCard>

                <GroupCard t={t} title="section4.fbPixel.eventsTitle">
                  <BlockStack gap="100">
                    <Checkbox
                      label={t("section4.fbPixel.pageView")}
                      checked={!!cfg.fb.pageView}
                      onChange={(v) => setFB({ pageView: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.viewContent")}
                      checked={!!cfg.fb.viewContent}
                      onChange={(v) => setFB({ viewContent: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.addToCart")}
                      checked={!!cfg.fb.addToCart}
                      onChange={(v) => setFB({ addToCart: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.initiateCheckout")}
                      checked={!!cfg.fb.initiateCheckout}
                      onChange={(v) => setFB({ initiateCheckout: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.purchase")}
                      checked={!!cfg.fb.purchase}
                      onChange={(v) => setFB({ purchase: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.advancedMatching")}
                      checked={!!cfg.fb.advancedMatching}
                      onChange={(v) => setFB({ advancedMatching: v })}
                    />
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {view === "capi_fb" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.fbCAPI.mainTitle">
                  <Grid3>
                    <Checkbox
                      label={t("section4.fbCAPI.enableLabel")}
                      checked={!!cfg.capi_fb.enabled}
                      onChange={(v) => setCAPIFB({ enabled: v })}
                    />
                    <TextField
                      label={t("section4.fbCAPI.pixelIdLabel")}
                      autoComplete="off"
                      value={cfg.capi_fb.pixelId}
                      onChange={(v) => setCAPIFB({ pixelId: v })}
                    />
                    <TextField
                      label={t("section4.fbCAPI.accessTokenLabel")}
                      autoComplete="off"
                      value={cfg.capi_fb.accessToken}
                      onChange={(v) => setCAPIFB({ accessToken: v })}
                    />
                    <TextField
                      label={t("section4.fbCAPI.testEventCodeLabel")}
                      autoComplete="off"
                      value={cfg.capi_fb.testEventCode}
                      onChange={(v) => setCAPIFB({ testEventCode: v })}
                    />
                  </Grid3>
                  <Text tone="subdued" as="p">
                    {t("section4.fbCAPI.helpText")}
                  </Text>
                </GroupCard>

                <GroupCard t={t} title="section4.fbCAPI.eventsTitle">
                  <BlockStack gap="100">
                    <Checkbox
                      label={t("section4.fbCAPI.sendViewContent")}
                      checked={!!cfg.capi_fb.sendViewContent}
                      onChange={(v) => setCAPIFB({ sendViewContent: v })}
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.sendAddToCart")}
                      checked={!!cfg.capi_fb.sendAddToCart}
                      onChange={(v) => setCAPIFB({ sendAddToCart: v })}
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.sendPurchase")}
                      checked={!!cfg.capi_fb.sendPurchase}
                      onChange={(v) => setCAPIFB({ sendPurchase: v })}
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.useEventIdDedup")}
                      checked={!!cfg.capi_fb.useEventIdDedup}
                      onChange={(v) => setCAPIFB({ useEventIdDedup: v })}
                    />
                    <Text tone="subdued" as="p">
                      {t("section4.fbCAPI.eventsHelp")}
                    </Text>
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {view === "tiktok" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.tiktokPixel.mainTitle">
                  <Grid3>
                    <Checkbox
                      label={t("section4.tiktokPixel.enableLabel")}
                      checked={!!cfg.tiktok.enabled}
                      onChange={(v) => setTT({ enabled: v })}
                    />
                    <TextField
                      label={t("section4.tiktokPixel.nameLabel")}
                      autoComplete="off"
                      value={cfg.tiktok.name}
                      onChange={(v) => setTT({ name: v })}
                    />
                    <TextField
                      label={t("section4.tiktokPixel.pixelIdLabel")}
                      autoComplete="off"
                      value={cfg.tiktok.pixelId}
                      onChange={(v) => setTT({ pixelId: v })}
                    />
                  </Grid3>
                  <Text tone="subdued" as="p">
                    {t("section4.tiktokPixel.helpText")}
                  </Text>
                </GroupCard>

                <GroupCard t={t} title="section4.tiktokPixel.eventsTitle">
                  <BlockStack gap="100">
                    <Checkbox
                      label={t("section4.tiktokPixel.pageView")}
                      checked={!!cfg.tiktok.pageView}
                      onChange={(v) => setTT({ pageView: v })}
                    />
                    <Checkbox
                      label={t("section4.tiktokPixel.viewContent")}
                      checked={!!cfg.tiktok.viewContent}
                      onChange={(v) => setTT({ viewContent: v })}
                    />
                    <Checkbox
                      label={t("section4.tiktokPixel.addToCart")}
                      checked={!!cfg.tiktok.addToCart}
                      onChange={(v) => setTT({ addToCart: v })}
                    />
                    <Checkbox
                      label={t("section4.tiktokPixel.purchase")}
                      checked={!!cfg.tiktok.purchase}
                      onChange={(v) => setTT({ purchase: v })}
                    />
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {view === "tiktok_api" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.tiktokAPI.mainTitle">
                  <Grid3>
                    <Checkbox
                      label={t("section4.tiktokAPI.enableLabel")}
                      checked={!!cfg.tiktok_api.enabled}
                      onChange={(v) => setTTAPI({ enabled: v })}
                    />
                    <TextField
                      label={t("section4.tiktokAPI.pixelCodeLabel")}
                      autoComplete="off"
                      value={cfg.tiktok_api.pixelCode}
                      onChange={(v) => setTTAPI({ pixelCode: v })}
                    />
                    <TextField
                      label={t("section4.tiktokAPI.accessTokenLabel")}
                      autoComplete="off"
                      value={cfg.tiktok_api.accessToken}
                      onChange={(v) => setTTAPI({ accessToken: v })}
                    />
                  </Grid3>
                  <Text tone="subdued" as="p">
                    {t("section4.tiktokAPI.helpText")}
                  </Text>
                </GroupCard>

                <GroupCard t={t} title="section4.tiktokAPI.eventsTitle">
                  <BlockStack gap="100">
                    <Checkbox
                      label={t("section4.tiktokAPI.sendPurchase")}
                      checked={!!cfg.tiktok_api.sendPurchase}
                      onChange={(v) => setTTAPI({ sendPurchase: v })}
                    />
                    <Text tone="subdued" as="p">
                      {t("section4.tiktokAPI.eventsHelp")}
                    </Text>
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {view === "tests" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.tests.title">
                  <BlockStack gap="200">
                    <Text as="p">{t("section4.tests.description")}</Text>
                    <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: 13 }}>
                      <li>{t("section4.tests.list.fbPixel")}</li>
                      <li>{t("section4.tests.list.tiktokPixel")}</li>
                      <li>{t("section4.tests.list.fbCAPI")}</li>
                      <li>{t("section4.tests.list.tiktokAPI")}</li>
                    </ul>

                    <InlineStack gap="200" align="start">
                      <Button variant="primary" onClick={handleTestRemote} loading={testLoading}>
                        {t("section4.tests.testButton")}
                      </Button>
                    </InlineStack>

                    {testError && (
                      <Text tone="critical" as="p">
                        {t("section4.tests.error", { error: testError })}
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
                            <Text as="span">{t("section4.tests.result.fbPixel")}</Text>
                            {readyBadge(!!testResult.fbClientReady)}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">{t("section4.tests.result.tiktokPixel")}</Text>
                            {readyBadge(!!testResult.tiktokClientReady)}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">{t("section4.tests.result.fbCAPI")}</Text>
                            {readyBadge(!!testResult.fbCapiReady)}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">{t("section4.tests.result.tiktokAPI")}</Text>
                            {readyBadge(!!testResult.tiktokApiReady)}
                          </InlineStack>

                          <Text tone="subdued" as="p">
                            {t("section4.tests.resultNote")}
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

        {/* ===== Right column (guide) ===== */}
        <div className="tf-side-col">
          <div className="tf-side-card">
            <Text as="h3" variant="headingSm">
              {t("section4.guide.title")}
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}
            >
              <p>{t("section4.guide.step1")}</p>
              <p>{t("section4.guide.step2")}</p>
              <p>{t("section4.guide.step3")}</p>
              <p>{t("section4.guide.step4")}</p>
              <p>{t("section4.guide.step5")}</p>
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
