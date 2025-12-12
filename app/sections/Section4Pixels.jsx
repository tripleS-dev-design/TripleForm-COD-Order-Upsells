// ===== File: app/sections/Section4Pixels.jsx =====
import React, { useEffect, useState } from "react";
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

/* ======================= CSS / layout (same style as Sheets) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* HEADER — same style as Forms, Offers & Sheets */
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

  /* left rail (menu + stats) */
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

  /* Center column (main content) */
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

  /* Right column (guide) */
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

  /* TITLES — same banner as Sheets section */
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

/* ============================== default config ============================== */
const defaultCfg = () => ({
  meta: { version: 1 },

  google: {
    enabled: false,
    measurementId: "", // G-XXXX
    adsConversionId: "", // AW-XXXX
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
                {t("section4.header.appTitle")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section4.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section4.header.pill")}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section4.buttons.saveStore")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== page ============================== */
export default function Section4Pixels() {
  useInjectCss();

  // On récupère t une seule fois
  const { t: rawT } = useI18n();

  // Wrapper sécurisé pour éviter qu'un bug FR casse toute la page
  const t = (key, vars) => {
    try {
      return rawT(key, vars);
    } catch (e) {
      console.error("i18n error in Section4Pixels for key:", key, e);
      return key; // fallback: on affiche la clé au lieu de crasher
    }
  };

  const [cfg, setCfg] = useState(defaultCfg);
  const [view, setView] = useState("overview"); // overview | google | fb | capi_fb | tiktok | tiktok_api | tests

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const [saving, setSaving] = useState(false);

  // ===== load from localStorage (frontend only) =====
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

    (async () => {
      try {
        const res = await fetch("/api/pixels/load", {
          credentials: "include",
        });
        const j = await res.json().catch(() => null);
        if (j?.ok && j.pixels) {
          setCfg((prev) => ({
            ...prev,
            ...j.pixels,
          }));
        }
      } catch (e) {
        console.error("Error loading pixels (remote):", e);
      }
    })();
  }, []);

  // ===== auto-save to localStorage =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_pixels_v1",
        JSON.stringify(cfg)
      );
    } catch (e) {
      console.error("save pixels localStorage:", e);
    }
  }, [cfg]);

  /* === SAVE to store button (now global in header) === */
  const handleSaveRemote = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/pixels/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pixels: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Save failed");
      }
      alert(t("section4.save.success"));
    } catch (e) {
      alert(
        t("section4.save.error", {
          error: e?.message || t("section4.save.unknownError"),
        })
      );
    } finally {
      setSaving(false);
    }
  };

  /* === TEST backend button (CAPI / Events API / client config) === */
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

      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || "Test failed");
      }

      setTestResult(j);
    } catch (e) {
      setTestError(e?.message || t("section4.tests.unknownError"));
    } finally {
      setTestLoading(false);
    }
  };

  /* ===== simple setters ===== */
  const setGoogle = (p) =>
    setCfg((c) => ({ ...c, google: { ...c.google, ...p } }));
  const setFB = (p) => setCfg((c) => ({ ...c, fb: { ...c.fb, ...p } }));
  const setCAPIFB = (p) =>
    setCfg((c) => ({ ...c, capi_fb: { ...c.capi_fb, ...p } }));
  const setTT = (p) =>
    setCfg((c) => ({ ...c, tiktok: { ...c.tiktok, ...p } }));
  const setTTAPI = (p) =>
    setCfg((c) => ({ ...c, tiktok_api: { ...c.tiktok_api, ...p } }));

  /* ===== rail (main menu) ===== */
  const panels = [
    { key: "overview", label: t("section4.rail.panels.overview") },
    { key: "google", label: t("section4.rail.panels.google") },
    { key: "fb", label: t("section4.rail.panels.fb") },
    { key: "capi_fb", label: t("section4.rail.panels.capi_fb") },
    { key: "tiktok", label: t("section4.rail.panels.tiktok") },
    { key: "tiktok_api", label: t("section4.rail.panels.tiktok_api") },
    { key: "tests", label: t("section4.rail.panels.tests") },
  ];

  /* ===== small status info for rail ===== */
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

  /* ===================== RENDER ===================== */
  return (
    <PageShell t={t} onSave={handleSaveRemote} saving={saving}>
      <div className="tf-editor">
        {/* ===== Left rail ===== */}
        <div className="tf-rail">
          {/* Panel menu */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section4.rail.title")}</div>
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

          {/* Quick status */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section4.rail.statusTitle")}
            </div>
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
                  <Text as="span">
                    {t("section4.platforms.tiktokPixel")}
                  </Text>
                  {statusBadge(cfg.tiktok.enabled)}
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span">
                    {t("section4.platforms.tiktokAPI")}
                  </Text>
                  {statusBadge(cfg.tiktok_api.enabled)}
                </InlineStack>

                <Text tone="subdued" as="p">
                  {t("section4.rail.statusNote")}
                </Text>

                {/* ancien bouton Save ici supprimé : le save global est dans le header */}
              </BlockStack>
            </div>
          </div>
        </div>

        {/* ===== Center column ===== */}
        <div className="tf-main-col">
          {/* --- OVERVIEW --- */}
          {view === "overview" && (
            <div className="tf-panel">
              <GroupCard t={t} title="section4.overview.title">
                <BlockStack gap="200">
                  <Text as="p">{t("section4.overview.description")}</Text>
                  <ul
                    style={{
                      paddingLeft: "1.2rem",
                      margin: 0,
                      fontSize: 13,
                    }}
                  >
                    <li>
                      <b>{t("section4.platforms.google")}</b>:{" "}
                      {t("section4.overview.googleDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.fbPixel")}</b>:{" "}
                      {t("section4.overview.fbPixelDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.fbCAPI")}</b>:{" "}
                      {t("section4.overview.fbCAPIDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.tiktokPixel")}</b>:{" "}
                      {t("section4.overview.tiktokPixelDesc")}
                    </li>
                    <li>
                      <b>{t("section4.platforms.tiktokAPI")}</b>:{" "}
                      {t("section4.overview.tiktokAPIDesc")}
                    </li>
                  </ul>
                </BlockStack>
              </GroupCard>
            </div>
          )}

          {/* --- GOOGLE --- */}
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
                      onChange={(v) =>
                        setGoogle({ adsConversionLabel: v })
                      }
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

          {/* --- FACEBOOK PIXEL --- */}
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
                      onChange={(v) =>
                        setFB({ initiateCheckout: v })
                      }
                    />
                    <Checkbox
                      label={t("section4.fbPixel.purchase")}
                      checked={!!cfg.fb.purchase}
                      onChange={(v) => setFB({ purchase: v })}
                    />
                    <Checkbox
                      label={t("section4.fbPixel.advancedMatching")}
                      checked={!!cfg.fb.advancedMatching}
                      onChange={(v) =>
                        setFB({ advancedMatching: v })
                      }
                    />
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {/* --- FACEBOOK CAPI --- */}
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
                      onChange={(v) =>
                        setCAPIFB({ testEventCode: v })
                      }
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
                      onChange={(v) =>
                        setCAPIFB({ sendViewContent: v })
                      }
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.sendAddToCart")}
                      checked={!!cfg.capi_fb.sendAddToCart}
                      onChange={(v) =>
                        setCAPIFB({ sendAddToCart: v })
                      }
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.sendPurchase")}
                      checked={!!cfg.capi_fb.sendPurchase}
                      onChange={(v) =>
                        setCAPIFB({ sendPurchase: v })
                      }
                    />
                    <Checkbox
                      label={t("section4.fbCAPI.useEventIdDedup")}
                      checked={!!cfg.capi_fb.useEventIdDedup}
                      onChange={(v) =>
                        setCAPIFB({ useEventIdDedup: v })
                      }
                    />
                    <Text tone="subdued" as="p">
                      {t("section4.fbCAPI.eventsHelp")}
                    </Text>
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {/* --- TIKTOK PIXEL --- */}
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

          {/* --- TIKTOK EVENTS API --- */}
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
                      onChange={(v) =>
                        setTTAPI({ accessToken: v })
                      }
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
                      onChange={(v) =>
                        setTTAPI({ sendPurchase: v })
                      }
                    />
                    <Text tone="subdued" as="p">
                      {t("section4.tiktokAPI.eventsHelp")}
                    </Text>
                  </BlockStack>
                </GroupCard>
              </BlockStack>
            </div>
          )}

          {/* --- TESTS & DEBUG --- */}
          {view === "tests" && (
            <div className="tf-panel">
              <BlockStack gap="300">
                <GroupCard t={t} title="section4.tests.title">
                  <BlockStack gap="200">
                    <Text as="p">
                      {t("section4.tests.description")}
                    </Text>
                    <ul
                      style={{
                        paddingLeft: "1.2rem",
                        margin: 0,
                        fontSize: 13,
                      }}
                    >
                      <li>{t("section4.tests.list.fbPixel")}</li>
                      <li>{t("section4.tests.list.tiktokPixel")}</li>
                      <li>{t("section4.tests.list.fbCAPI")}</li>
                      <li>{t("section4.tests.list.tiktokAPI")}</li>
                    </ul>

                    <InlineStack gap="200" align="start">
                      <Button
                        variant="primary"
                        onClick={handleTestRemote}
                        loading={testLoading}
                      >
                        {t("section4.tests.testButton")}
                      </Button>
                    </InlineStack>

                    {testError && (
                      <Text tone="critical" as="p">
                        {t("section4.tests.error", {
                          error: testError,
                        })}
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
                            <Text as="span">
                              {t("section4.tests.result.fbPixel")}
                            </Text>
                            {readyBadge(!!testResult.fbClientReady)}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">
                              {t("section4.tests.result.tiktokPixel")}
                            </Text>
                            {readyBadge(
                              !!testResult.tiktokClientReady
                            )}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">
                              {t("section4.tests.result.fbCAPI")}
                            </Text>
                            {readyBadge(!!testResult.fbCapiReady)}
                          </InlineStack>
                          <InlineStack align="space-between">
                            <Text as="span">
                              {t("section4.tests.result.tiktokAPI")}
                            </Text>
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
