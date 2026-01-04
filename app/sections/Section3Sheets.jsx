// ===== File: app/sections/Section3Sheets.jsx =====
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Checkbox,
  Button,
  RangeSlider,
  Badge,
  Tabs,
  Icon,
  Spinner,
  Modal,
} from "@shopify/polaris";
import * as PolarisIcons from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";
import { useNavigate } from "@remix-run/react";
import CountryFlagsBar from "../components/CountryFlagsBar";

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ HEADER SLIM (same family as Section0/Section1) */
  .tf-header{
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:6px 10px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.35);
  }
  .tf-header-row{
    display:grid;
    grid-template-columns:auto 1fr auto;
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

  /* ✅ FLAGS BAR (center) */
  .tf-flags-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    width:100%;
    min-width:0;
  }
  .tf-flags{
    display:flex;
    align-items:center;
    gap:10px;
    padding:6px 12px;
    max-width:760px;
    overflow-x:auto;
    white-space:nowrap;
    scrollbar-width:none;
    -webkit-overflow-scrolling:touch;
    border-radius:999px;
    background:rgba(255,255,255,0.09);
    border:1px solid rgba(255,255,255,0.18);
  }
  .tf-flags::-webkit-scrollbar{ display:none; }

  .tf-header-right{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:10px;
    min-width:0;
  }
  .tf-pill{
    font-size:12px;
    padding:5px 10px;
    border-radius:999px;
    border:1px solid rgba(248,250,252,0.40);
    color:rgba(248,250,251,0.92);
    background:linear-gradient(90deg,rgba(15,23,42,0.30),rgba(15,23,42,0.08));
    white-space:nowrap;
    line-height:1;
  }

  /* ✅ SAVE BAR SLIM (under header) */
  .tf-savebar{
    position:sticky;
    top:56px;
    z-index:39;
    background:#fff;
    border-bottom:1px solid #E5E7EB;
  }
  .tf-savebar-inner{
    max-width:none!important;
    padding:8px 16px;
    display:grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap:10px;
    align-items:center;
  }
  .tf-saveline{
    display:flex;
    flex-direction:column;
    min-width:0;
    line-height:1.15;
  }
  .tf-savetitle{
    font-weight:900;
    font-size:13px;
    color:#0F172A;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
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
    border-bottom:2px solid #F97316 !important;
    box-shadow:0 10px 24px rgba(249,115,22,0.18);
  }

  .tf-shell { padding:16px; }

  .tf-topnav{
    margin-bottom:16px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:8px 10px;
  }

  /* 2 columns: main + right */
  .tf-editor{
    display:grid;
    grid-template-columns: minmax(0,1fr) 340px;
    gap:16px;
    align-items:start;
  }
  .tf-main-col { display:grid; gap:16px; min-width:0; }
  .tf-panel { background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; min-width:0; }

  .tf-side-col{
    position:sticky;
    top:132px;
    max-height:calc(100vh - 150px);
    overflow-y:auto;
    overflow-x:hidden;
    width:340px;
    flex:none;
  }
  .tf-side-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    margin-bottom:12px;
  }

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

  .col-board-wrap { position:relative; }
  .col-board {
    display:flex;
    gap:12px;
    overflow-x:auto;
    padding:6px;
    scroll-behavior:smooth;
    overflow-anchor:none;
    white-space:nowrap;
    contain:layout paint;
    scrollbar-gutter:stable both-edges;
  }
  .col-board::-webkit-scrollbar{ height:10px; }
  .col-board::-webkit-scrollbar-track{ background:#F3F4F6; border-radius:10px; }
  .col-board::-webkit-scrollbar-thumb{ background:#D1D5DB; border-radius:10px; }

  .col-card  {
    min-width:260px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    flex:0 0 auto;
    overflow-anchor:none;
    contain:layout paint;
  }

  .pill {
    font-size:11px;
    font-weight:700;
    color:#0C4A6E;
    background:#E0F2FE;
    border:1px solid #BAE6FD;
    padding:3px 6px;
    border-radius:999px;
  }

  .board-nav-btn {
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    background:#111827;
    color:#fff;
    border:none;
    width:32px;
    height:32px;
    border-radius:999px;
    display:grid;
    place-items:center;
    cursor:pointer;
    opacity:.9;
    box-shadow:0 6px 18px rgba(0,0,0,.15);
  }
  .board-nav-btn[disabled] { opacity:.35; cursor:not-allowed; }
  .board-nav-left { left:-6px; }
  .board-nav-right{ right:-6px; }

  .edge-left, .edge-right {
    position:absolute;
    top:0;
    bottom:0;
    width:28px;
    pointer-events:none;
  }
  .edge-left  { left:0;  background:linear-gradient(90deg,#fff,rgba(255,255,255,0)); }
  .edge-right { right:0; background:linear-gradient(-90deg,#fff,rgba(255,255,255,0)); }

  .tf-orders-table {
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    table-layout:fixed;
  }
  .tf-orders-table th, .tf-orders-table td {
    border-bottom:1px solid #E5E7EB;
    padding:6px 8px;
    font-size:12px;
  }
  .tf-orders-table th { background:#F9FAFB; text-align:left; }

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }

  .tf-sheet-config {
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:8px;
    padding:16px;
    margin-bottom:16px;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-side-col { position:static; max-height:none; width:auto; top:auto; }
  }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-sheets-css")) return;
    const s = document.createElement("style");
    s.id = "tf-sheets-css";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
  }, []);
}

/* ======================= small helpers ======================= */
function stableStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function SaveBarSlim({ dirty, saving, notice, attention, onSave, t }) {
  const title = notice
    ? notice.type === "success"
      ? t("common.saved") || "Saved"
      : t("common.error") || "Error"
    : dirty
    ? t("common.unsavedTitle") || "Unsaved changes"
    : t("common.allSavedTitle") || "All changes saved";

  const sub = notice
    ? notice.msg
    : dirty
    ? t("common.unsavedSubtitle") || "Don’t forget to save before leaving this section."
    : t("common.allSavedSubtitle") || "Your settings are up to date.";

  return (
    <div className={`tf-savebar ${attention ? "tf-attention" : ""}`}>
      <div className="tf-savebar-inner">
        <div className="tf-saveline">
          <div className="tf-savetitle">{title}</div>
          <div className="tf-savesub">{sub}</div>
        </div>

        <InlineStack gap="200" blockAlign="center">
          {dirty && (
            <Button variant="primary" size="slim" onClick={onSave} loading={saving}>
              {t("common.save") || "Save"}
            </Button>
          )}
          {!dirty && saving ? <Spinner size="small" /> : null}
        </InlineStack>
      </div>
    </div>
  );
}

/* ======================= UI blocks ======================= */
function GroupCard({ title, children }) {
  const { t } = useI18n();
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

const APP_FIELDS = [
  { label: "section3.fields.customer.name", value: "customer.name" },
  { label: "section3.fields.customer.phone", value: "customer.phone" },
  { label: "section3.fields.customer.city", value: "customer.city" },
  { label: "section3.fields.customer.province", value: "customer.province" },
  { label: "section3.fields.customer.country", value: "customer.country" },
  { label: "section3.fields.customer.address", value: "customer.address" },
  { label: "section3.fields.customer.notes", value: "customer.notes" },
  { label: "section3.fields.cart.productTitle", value: "cart.productTitle" },
  { label: "section3.fields.cart.variantTitle", value: "cart.variantTitle" },
  { label: "section3.fields.cart.offerName", value: "cart.offerName" },
  { label: "section3.fields.cart.upsellName", value: "cart.upsellName" },
  { label: "section3.fields.cart.quantity", value: "cart.quantity" },
  { label: "section3.fields.cart.subtotal", value: "cart.subtotal" },
  { label: "section3.fields.cart.shipping", value: "cart.shipping" },
  { label: "section3.fields.cart.totalWithShipping", value: "cart.totalWithShipping" },
  { label: "section3.fields.cart.currency", value: "cart.currency" },
  { label: "section3.fields.order.id", value: "order.id" },
  { label: "section3.fields.order.date", value: "order.date" },
];

function inferType(v = "") {
  const s = String(v).toLowerCase();
  if (s.includes("date")) return "datetime";
  if (s.includes("phone")) return "phone";
  if (s.includes("total") || s.includes("price") || s.includes("amount")) return "currency";
  if (s.includes("quantity") || s.includes("qty")) return "number";
  return "string";
}

const labelFromValue = (v, t) => {
  const f = APP_FIELDS.find((x) => x.value === v);
  return f
    ? t(f.label)
    : String(v)
        .split(".")
        .slice(-1)[0]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
};

const defaultCfg = () => ({
  meta: { version: 8 },
  sheet: { spreadsheetId: "", tabName: "Orders", headerRowIndex: 1 },
  abandonedSheet: { spreadsheetId: "", tabName: "Abandoned", headerRowIndex: 1 },
  display: { mode: "none", height: 420 },
  formats: {
    dateFormat: "YYYY-MM-DD HH:mm",
    numberFormat: "0.00",
    currency: "MAD",
    timezone: "shop",
  },
  stats: { periodDays: 15, codOnly: false },
  columns: [
    {
      id: "c1",
      idx: 1,
      header: "section3.preview.columnHeaders.date",
      type: "datetime",
      appField: "order.date",
      width: 220,
      asLink: false,
      linkTemplate: "{value}",
    },
    {
      id: "c2",
      idx: 2,
      header: "section3.preview.columnHeaders.orderId",
      type: "string",
      appField: "order.id",
      width: 160,
      asLink: false,
      linkTemplate: "{value}",
    },
    {
      id: "c3",
      idx: 3,
      header: "section3.preview.columnHeaders.customer",
      type: "string",
      appField: "customer.name",
      width: 200,
      asLink: false,
      linkTemplate: "{value}",
    },
  ],
  columnsAbandoned: [
    {
      id: "a1",
      idx: 1,
      header: "section3.preview.columnHeaders.customerName",
      type: "string",
      appField: "customer.name",
      width: 200,
      asLink: false,
      linkTemplate: "{value}",
    },
    {
      id: "a2",
      idx: 2,
      header: "section3.preview.columnHeaders.phone",
      type: "phone",
      appField: "customer.phone",
      width: 180,
      asLink: false,
      linkTemplate: "{value}",
    },
    {
      id: "a3",
      idx: 3,
      header: "section3.preview.columnHeaders.product",
      type: "string",
      appField: "cart.productTitle",
      width: 220,
      asLink: false,
      linkTemplate: "{value}",
    },
  ],
});

function GoogleIcon() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#ffffff",
        color: "#4285F4",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      G
    </span>
  );
}

/* ======================= Header (slim) ======================= */
function HeaderSlim({ t, onSave, saving }) {
  return (
    <div className="tf-header">
      <div className="tf-header-row">
        {/* LEFT */}
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
            <div className="tf-brand-title">{t("section3.header.title")}</div>
            <div className="tf-brand-sub">{t("section3.header.subtitle")}</div>
          </div>
        </div>

        {/* CENTER */}
        <div className="tf-flags-wrap">
          <div className="tf-flags">
            <CountryFlagsBar />
          </div>
        </div>

        {/* RIGHT */}
        <div className="tf-header-right">
          <span className="tf-pill">{t("section3.header.pill")}</span>
          <Button variant="primary" size="slim" onClick={onSave} loading={saving}>
            {t("common.save") || "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SheetConfigSection({
  title,
  sheetConfig,
  onConfigChange,
  onTest,
  onOpen,
  isConnected,
  isLoading,
  googleSpreadsheets,
  availableTabs,
  loadingSpreadsheets,
  loadingTabs,
}) {
  const { t } = useI18n();

  return (
    <div className="tf-sheet-config">
      <Text variant="headingMd" fontWeight="bold">
        {t(title)}
      </Text>
      <BlockStack gap="300" marginBlockStart="300">
        <Select
          label={t("section3.sheetsConfiguration.selectSpreadsheet")}
          helpText={t("section3.sheetsConfiguration.selectSpreadsheetHelp")}
          options={[
            { label: t("section3.sheetsConfiguration.chooseSpreadsheet"), value: "" },
            ...googleSpreadsheets.map((sheet) => ({ label: sheet.name, value: sheet.id })),
          ]}
          value={sheetConfig.spreadsheetId || ""}
          onChange={(value) => onConfigChange({ ...sheetConfig, spreadsheetId: value })}
          disabled={!isConnected || isLoading || loadingSpreadsheets}
        />

        {sheetConfig.spreadsheetId && (
          <Select
            label={t("section3.sheetsConfiguration.selectTab")}
            helpText={t("section3.sheetsConfiguration.selectTabHelp")}
            options={[
              { label: t("section3.sheetsConfiguration.chooseTab"), value: "" },
              ...availableTabs.map((tab) => ({ label: tab.name, value: tab.name })),
            ]}
            value={sheetConfig.tabName || ""}
            onChange={(value) => onConfigChange({ ...sheetConfig, tabName: value })}
            disabled={!isConnected || isLoading || loadingTabs}
          />
        )}

        <RangeSlider
          label={`${t("section3.sheetsConfiguration.headerRow")} (${sheetConfig.headerRowIndex || 1})`}
          helpText={t("section3.sheetsConfiguration.headerRowHelp")}
          min={1}
          max={10}
          output
          value={sheetConfig.headerRowIndex || 1}
          onChange={(value) => onConfigChange({ ...sheetConfig, headerRowIndex: value })}
          disabled={!isConnected || isLoading}
        />

        <InlineStack gap="200">
          <Button
            variant="primary"
            onClick={onTest}
            disabled={!isConnected || !sheetConfig.spreadsheetId || isLoading}
            loading={isLoading}
          >
            {t("section3.sheetsConfiguration.testConnection")}
          </Button>

          <Button onClick={onOpen} disabled={!isConnected || !sheetConfig.spreadsheetId || isLoading}>
            {t("section3.sheetsConfiguration.openSheet")}
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}

/* ======================= MAIN ======================= */
export default function Section3Sheets() {
  const { t } = useI18n();
  const navigate = useNavigate();
  useInjectCss();

  const [cfg, setCfg] = useState(defaultCfg);
  const [view, setView] = useState("sheets");

  const [dash, setDash] = useState({ points: [], latest: [], totals: null });
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState("");

  const periodDays = cfg.stats?.periodDays ?? 15;
  const codOnly = !!cfg.stats?.codOnly;

  const [googleStatus, setGoogleStatus] = useState({
    loading: true,
    connected: false,
    accountEmail: null,
    mainSheetName: null,
    abandonedSheetName: null,
  });

  const [googleSpreadsheets, setGoogleSpreadsheets] = useState([]);
  const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
  const [availableTabs, setAvailableTabs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [sheetTab, setSheetTab] = useState(0);
  const sheetTabs = useMemo(
    () => [
      {
        id: "orders",
        content: t("section3.sheetsTabs.orders"),
        accessibilityLabel: t("section3.sheetsTabs.orders"),
        panelID: "orders-panel",
      },
      {
        id: "abandoned",
        content: t("section3.sheetsTabs.abandoned"),
        accessibilityLabel: t("section3.sheetsTabs.abandoned"),
        panelID: "abandoned-panel",
      },
    ],
    [t]
  );

  /* ✅ Dirty guard + save bar state (same spirit as Section1Forms) */
  const [dirty, setDirty] = useState(false);
  const lastSavedRef = useRef("");
  const [navGuardOpen, setNavGuardOpen] = useState(false);
  const pendingHrefRef = useRef(null);

  const [saveNotice, setSaveNotice] = useState(null); // {type,msg}
  const [saveAttention, setSaveAttention] = useState(false);
  const attentionTimerRef = useRef(null);
  const noticeTimerRef = useRef(null);

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

  /* ✅ mark dirty on cfg change (NO ALERT spam) */
  useEffect(() => {
    const s = stableStringify(cfg);
    const was = lastSavedRef.current || "";
    setDirty(was ? s !== was : false);
  }, [cfg]);

  /* ✅ block leaving the section only (click on another route / link) */
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const isSameOrigin = (href) => {
      try {
        const url = new URL(href, window.location.href);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    };

    const clickHandler = (e) => {
      if (!dirty) return;
      if (e.defaultPrevented) return;

      const a = e.target?.closest?.("a[href]");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;

      // ignore anchors / new tabs
      if (href.startsWith("#")) return;
      if (a.getAttribute("target") === "_blank") return;

      // only intercept internal navigation
      if (!isSameOrigin(href) && !href.startsWith("/")) return;

      // if link is the same page, ignore
      try {
        const url = new URL(href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {}

      e.preventDefault();
      pendingHrefRef.current = href;
      bumpAttention();
      setNavGuardOpen(true);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", clickHandler, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", clickHandler, true);
    };
  }, [dirty]);

  const confirmLeave = () => {
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    setNavGuardOpen(false);
    if (!href) return;
    // Remix navigate internal
    if (href.startsWith("http")) window.location.href = href;
    else navigate(href);
  };

  const cancelLeave = () => {
    pendingHrefRef.current = null;
    setNavGuardOpen(false);
  };

  /* ===== Google OAuth popup postMessage ===== */
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "GOOGLE_OAUTH_SUCCESS") {
        fetchGoogleStatus();
        loadGoogleSpreadsheets();
      } else if (event.data && event.data.type === "GOOGLE_OAUTH_ERROR") {
        pushNotice("error", t("section3.connection.testError", { error: event.data.error }));
        bumpAttention();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const fetchGoogleStatus = async () => {
    try {
      const r = await fetch("/api/google/status", { credentials: "include" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j) throw new Error("bad status");
      setGoogleStatus({
        loading: false,
        connected: !!j.connected,
        accountEmail: j.accountEmail || null,
        mainSheetName: j.mainSheetName || j.sheetName || null,
        abandonedSheetName: j.abandonedSheetName || null,
      });
    } catch (e) {
      console.error("google/status error", e);
      setGoogleStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const loadGoogleSpreadsheets = async () => {
    setLoadingSpreadsheets(true);
    try {
      const res = await fetch("/api/load-sheets", { credentials: "include" });
      const data = await res.json();

      if (data.ok) {
        setGoogleSpreadsheets(data.spreadsheets || []);

        if (data.config) {
          setCfg((prev) => {
            const merged = { ...prev, ...data.config };
            // ✅ IMPORTANT: treat loaded config as saved baseline
            lastSavedRef.current = stableStringify(merged);
            setDirty(false);
            return merged;
          });

          if (data.config.sheet?.spreadsheetId) {
            loadSpreadsheetTabs(data.config.sheet.spreadsheetId);
          }
        } else {
          // if no config returned, still establish baseline
          lastSavedRef.current = stableStringify(cfg);
          setDirty(false);
        }
      } else {
        console.error("Erreur /api/load-sheets:", data.error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sheets:", error);
    } finally {
      setLoadingSpreadsheets(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const loadSpreadsheetTabs = async (spreadsheetId) => {
    if (!spreadsheetId) return;
    setLoadingTabs(true);
    try {
      const res = await fetch(`/api/google-sheets/tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.ok && data.tabs) {
        setAvailableTabs(data.tabs);

        setCfg((prev) => {
          if (!prev.sheet?.tabName && data.tabs.length > 0) {
            return { ...prev, sheet: { ...prev.sheet, tabName: data.tabs[0].name } };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des onglets:", error);
      setAvailableTabs([]);
    } finally {
      setLoadingTabs(false);
    }
  };

  useEffect(() => {
    loadGoogleSpreadsheets();
    fetchGoogleStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    setDashLoading(true);
    setDashError("");
    try {
      const res = await fetch(`/api/orders/dashboard?days=${periodDays}&codOnly=${codOnly ? "1" : "0"}`, {
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) throw new Error(json?.error || "Erreur de chargement");
      setDash({ points: json.points || [], latest: json.latest || [], totals: json.totals || null });
    } catch (e) {
      setDashError(e?.message || "Erreur inconnue");
    } finally {
      setDashLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodDays, codOnly]);

  /* ✅ SAVE remote (NO alert) => saveNotice + baseline update */
  const handleSaveRemote = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/save-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sheets: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      lastSavedRef.current = stableStringify(cfg);
      setDirty(false);
      pushNotice("success", t("section3.save.success"));
    } catch (e) {
      pushNotice(
        "error",
        t("section3.save.error", {
          error: e?.message || t("section3.save.unknownError"),
        })
      );
      bumpAttention();
    } finally {
      setSaving(false);
    }
  };

  const startGoogleConnect = async (target) => {
    try {
      const response = await fetch(`/api/google/connect?target=${encodeURIComponent(target || "orders")}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.requiresReauth) {
          pushNotice("error", t("section3.errors.sessionExpired"));
          window.location.reload();
          return;
        }
        throw new Error(data.error || "Google connect error");
      }

      if (!data.url) throw new Error("Missing Google OAuth URL");

      const popup = window.open(
        data.url,
        "Google OAuth",
        "width=600,height=700,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        pushNotice("error", t("section3.connection.popupBlocked"));
        bumpAttention();
        return;
      }

      const popupCheck = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheck);
          setTimeout(() => {
            fetchGoogleStatus();
            loadGoogleSpreadsheets();
          }, 1000);
        }
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      pushNotice("error", t("section3.connection.error", { error: error.message }));
      bumpAttention();
    }
  };

  const testSheetConnection = async (sheet, kind) => {
    setTesting(true);
    try {
      await fetchGoogleStatus();
      if (!googleStatus.connected) {
        pushNotice("error", t("section3.connection.notConnected"));
        bumpAttention();
        return;
      }

      const res = await fetch("/api/google-sheets/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sheet, kind }),
      });
      const j = await res.json();
      if (j.ok) pushNotice("success", t("section3.sheetsConfiguration.testSuccess"));
      else pushNotice("error", t("section3.sheetsConfiguration.testError", { error: j.error }));
    } catch (e) {
      pushNotice("error", t("section3.sheetsConfiguration.testError", { error: e.message }));
    } finally {
      setTesting(false);
    }
  };

  const openSheet = (spreadsheetId) => {
    if (spreadsheetId) window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, "_blank");
    else {
      pushNotice("error", t("section3.sheetsConfiguration.noSpreadsheetId"));
      bumpAttention();
    }
  };

  const disconnectGoogle = async () => {
    if (confirm(t("section3.sheetsConfiguration.disconnectConfirm"))) {
      try {
        await fetch("/api/google/disconnect", { method: "POST", credentials: "include" });

        setGoogleStatus({
          loading: false,
          connected: false,
          accountEmail: null,
          mainSheetName: null,
          abandonedSheetName: null,
        });

        setGoogleSpreadsheets([]);
        setAvailableTabs([]);
        pushNotice("success", t("section3.sheetsConfiguration.disconnected"));
      } catch (error) {
        pushNotice("error", t("section3.sheetsConfiguration.disconnectError", { error: error.message }));
        bumpAttention();
      }
    }
  };

  /* ======================= Mapping board logic ======================= */
  const boardRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const SCROLL_STEP = 420;

  const getBoard = () => boardRef.current;

  const keepScroll = (fn) => {
    const el = getBoard();
    const left = el ? el.scrollLeft : 0;
    try {
      document.activeElement?.blur?.();
    } catch {}
    fn();
    requestAnimationFrame(() => {
      if (el) el.scrollTo({ left, behavior: "auto" });
      updateScrollEdges();
    });
  };

  const scrollLeft = () => getBoard()?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  const scrollRight = () => getBoard()?.scrollBy({ left: +SCROLL_STEP, behavior: "smooth" });

  const updateScrollEdges = () => {
    const el = getBoard();
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setAtStart(start);
    setAtEnd(end);
  };

  useEffect(() => {
    const el = getBoard();
    if (!el) return;
    updateScrollEdges();
    const onScroll = () => updateScrollEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => updateScrollEdges();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardRef.current, cfg.columns.length]);

  const nextIdx = () => Math.max(0, ...cfg.columns.map((c) => c.idx || 0)) + 1;

  const quickAdd = (fieldValue) => {
    if (!fieldValue) return;
    keepScroll(() => {
      const id = "c" + Math.random().toString(36).slice(2, 7);
      const tType = inferType(fieldValue);
      const header = labelFromValue(fieldValue, t);
      setCfg((c) => ({
        ...c,
        columns: [
          ...c.columns,
          {
            id,
            idx: nextIdx(),
            header,
            type: tType,
            appField: fieldValue,
            width: tType === "datetime" ? 220 : tType === "currency" ? 160 : 180,
            asLink: tType === "link",
            linkTemplate: "{value}",
          },
        ],
      }));
    });
  };

  const patchCol = (id, patch) => {
    keepScroll(() => {
      setCfg((c) => ({
        ...c,
        columns: c.columns.map((col) => (col.id === id ? { ...col, ...patch } : col)),
      }));
    });
  };

  const removeCol = (id) => {
    keepScroll(() => {
      setCfg((c) => ({
        ...c,
        columns: c.columns.length > 1 ? c.columns.filter((x) => x.id !== id) : c.columns,
      }));
    });
  };

  const swapWith = (idxDelta, colId) => {
    keepScroll(() => {
      setCfg((c) => {
        const order = [...c.columns].sort((a, b) => (a.idx || 0) - (b.idx || 0));
        const i = order.findIndex((x) => x.id === colId);
        const j = i + idxDelta;
        if (i < 0 || j < 0 || j >= order.length) return c;
        const tmp = order[i].idx;
        order[i].idx = order[j].idx;
        order[j].idx = tmp;
        return { ...c, columns: order };
      });
    });
  };

  const sortedCols = [...cfg.columns].sort((a, b) => (a.idx || 0) - (b.idx || 0));
  const sortedAbandonedCols = [...(cfg.columnsAbandoned || [])].sort((a, b) => (a.idx || 0) - (b.idx || 0));

  const nextIdxAbandoned = (cols) => Math.max(0, ...(cols || []).map((c) => c.idx || 0)) + 1;

  const quickAddAbandoned = (fieldValue) => {
    if (!fieldValue) return;
    const tType = inferType(fieldValue);
    const header = labelFromValue(fieldValue, t);
    setCfg((c) => {
      const cols = c.columnsAbandoned || [];
      const id = "a" + Math.random().toString(36).slice(2, 7);
      return {
        ...c,
        columnsAbandoned: [
          ...cols,
          {
            id,
            idx: nextIdxAbandoned(cols),
            header,
            type: tType,
            appField: fieldValue,
            width: tType === "datetime" ? 220 : tType === "currency" ? 160 : 180,
            asLink: tType === "link",
            linkTemplate: "{value}",
          },
        ],
      };
    });
  };

  const patchAbandonedCol = (id, patch) => {
    setCfg((c) => ({
      ...c,
      columnsAbandoned: (c.columnsAbandoned || []).map((col) => (col.id === id ? { ...col, ...patch } : col)),
    }));
  };

  const removeAbandonedCol = (id) => {
    setCfg((c) => {
      const cols = c.columnsAbandoned || [];
      return { ...c, columnsAbandoned: cols.length > 1 ? cols.filter((x) => x.id !== id) : cols };
    });
  };

  const swapAbandonedWith = (idxDelta, colId) => {
    setCfg((c) => {
      const cols = [...(c.columnsAbandoned || [])].sort((a, b) => (a.idx || 0) - (b.idx || 0));
      const i = cols.findIndex((x) => x.id === colId);
      const j = i + idxDelta;
      if (i < 0 || j < 0 || j >= cols.length) return c;
      const tmp = cols[i].idx;
      cols[i].idx = cols[j].idx;
      cols[j].idx = tmp;
      return { ...c, columnsAbandoned: cols };
    });
  };

  const totalOrders = dash.totals?.count || 0;
  const totalAmountCents = dash.totals?.totalCents || 0;
  const totalCurrency = dash.totals?.currency || cfg.formats.currency || "MAD";

  const formatMoney = (cents) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: totalCurrency }).format((cents || 0) / 100);

  const topTabs = [
    { id: "sheets", content: t("section3.rail.panels.sheets"), panelID: "p-sheets" },
    { id: "abandons", content: t("section3.rail.panels.abandons"), panelID: "p-abandons" },
    { id: "realtime", content: t("section3.rail.panels.realtime"), panelID: "p-realtime" },
    { id: "whatsapp", content: t("section3.rail.panels.whatsapp"), panelID: "p-whatsapp" },
  ];
  const topSelected = ["sheets", "abandons", "realtime", "whatsapp"].indexOf(view);

  // icons safe
  const RefreshSrc = PolarisIcons.RefreshIcon || PolarisIcons.ReplayIcon || PolarisIcons.ArrowRotateLeftIcon;

  return (
    <>
      <HeaderSlim t={t} onSave={handleSaveRemote} saving={saving} />

      <SaveBarSlim
        dirty={dirty}
        saving={saving}
        notice={saveNotice}
        attention={saveAttention}
        onSave={handleSaveRemote}
        t={t}
      />

      {/* ✅ leave guard modal */}
      <Modal
        open={navGuardOpen}
        onClose={cancelLeave}
        title={t("common.unsavedLeaveTitle") || "Unsaved changes"}
        primaryAction={{
          content: t("common.leaveAnyway") || "Leave without saving",
          onAction: confirmLeave,
          destructive: true,
        }}
        secondaryActions={[
          {
            content: t("common.stay") || "Stay here",
            onAction: cancelLeave,
          },
          {
            content: t("common.saveNow") || "Save now",
            onAction: async () => {
              await handleSaveRemote();
              // if saved successfully, allow leaving
              if (!dirty && pendingHrefRef.current) confirmLeave();
            },
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" tone="subdued">
            {t("common.unsavedLeaveBody") ||
              "You changed some settings in this section. Save before leaving so you don’t lose your changes."}
          </Text>
        </Modal.Section>
      </Modal>

      <div className="tf-shell">
        {/* NAV TOP (internal tabs) */}
        <div className="tf-topnav">
          <Tabs
            tabs={topTabs}
            selected={topSelected < 0 ? 0 : topSelected}
            onSelect={(idx) => {
              const map = ["sheets", "abandons", "realtime", "whatsapp"];
              setView(map[idx] || "sheets");
            }}
          />
        </div>

        <div className="tf-editor">
          {/* MAIN */}
          <div className="tf-main-col">
            {view === "sheets" && (
              <div className="tf-panel">
                <BlockStack gap="400">
                  <GroupCard title="section3.connection.title">
                    <BlockStack gap="150">
                      {googleStatus.loading ? (
                        <Text tone="subdued" as="p">
                          {t("section3.connection.loading")}
                        </Text>
                      ) : (
                        <>
                          {googleStatus.connected ? (
                            <>
                              <Text as="p">
                                {t("section3.connection.accountConnected")} <b>{googleStatus.accountEmail}</b>
                              </Text>
                              <Text tone="subdued" as="p">
                                {t("section3.connection.mainSheet")}{" "}
                                <b>{googleStatus.mainSheetName || cfg.sheet.tabName || t("section3.connection.notDefined")}</b>
                                {cfg.sheet.spreadsheetId ? ` · ${t("section3.connection.id")}: ${cfg.sheet.spreadsheetId}` : ""}
                              </Text>
                              <Text tone="subdued" as="p">
                                {t("section3.connection.revocable")}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text as="p">{t("section3.connection.description")}</Text>
                              <Text tone="subdued" as="p">
                                {t("section3.connection.authorization")}
                              </Text>
                            </>
                          )}

                          <InlineStack gap="200">
                            <Button variant="primary" onClick={() => startGoogleConnect("orders")}>
                              <InlineStack gap="100" blockAlign="center">
                                <GoogleIcon />
                                <span>
                                  {googleStatus.connected ? t("section3.connection.changeSheet") : t("section3.connection.connect")}
                                </span>
                              </InlineStack>
                            </Button>

                            {googleStatus.connected && (
                              <>
                                <Button onClick={fetchGoogleStatus} disabled={googleStatus.loading}>
                                  <InlineStack gap="100" blockAlign="center">
                                    {RefreshSrc ? <Icon source={RefreshSrc} /> : null}
                                    <span>{t("section3.connection.refresh")}</span>
                                  </InlineStack>
                                </Button>
                                <Button tone="critical" onClick={disconnectGoogle}>
                                  {t("section3.sheetsConfiguration.disconnect")}
                                </Button>
                              </>
                            )}
                          </InlineStack>
                        </>
                      )}
                    </BlockStack>
                  </GroupCard>

                  <GroupCard title="section3.sheetsConfiguration.title">
                    <Tabs tabs={sheetTabs} selected={sheetTab} onSelect={setSheetTab}>
                      {sheetTab === 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <SheetConfigSection
                            title="section3.sheetsConfiguration.ordersSheet"
                            sheetConfig={cfg.sheet}
                            onConfigChange={(newSheetConfig) => {
                              setCfg((c) => ({ ...c, sheet: newSheetConfig }));
                              if (newSheetConfig.spreadsheetId && newSheetConfig.spreadsheetId !== cfg.sheet.spreadsheetId) {
                                loadSpreadsheetTabs(newSheetConfig.spreadsheetId);
                              }
                            }}
                            onTest={() => testSheetConnection(cfg.sheet, "orders")}
                            onOpen={() => openSheet(cfg.sheet.spreadsheetId)}
                            isConnected={googleStatus.connected}
                            isLoading={testing}
                            googleSpreadsheets={googleSpreadsheets}
                            availableTabs={availableTabs}
                            loadingSpreadsheets={loadingSpreadsheets}
                            loadingTabs={loadingTabs}
                          />
                        </div>
                      )}

                      {sheetTab === 1 && (
                        <div style={{ marginTop: "16px" }}>
                          <SheetConfigSection
                            title="section3.sheetsConfiguration.abandonedSheet"
                            sheetConfig={cfg.abandonedSheet}
                            onConfigChange={(newSheetConfig) => {
                              setCfg((c) => ({ ...c, abandonedSheet: newSheetConfig }));
                              if (newSheetConfig.spreadsheetId && newSheetConfig.spreadsheetId !== cfg.abandonedSheet.spreadsheetId) {
                                loadSpreadsheetTabs(newSheetConfig.spreadsheetId);
                              }
                            }}
                            onTest={() => testSheetConnection(cfg.abandonedSheet, "abandons")}
                            onOpen={() => openSheet(cfg.abandonedSheet.spreadsheetId)}
                            isConnected={googleStatus.connected}
                            isLoading={testing}
                            googleSpreadsheets={googleSpreadsheets}
                            availableTabs={availableTabs}
                            loadingSpreadsheets={loadingSpreadsheets}
                            loadingTabs={loadingTabs}
                          />
                        </div>
                      )}
                    </Tabs>
                  </GroupCard>

                  <GroupCard title="section3.mapping.title">
                    <InlineStack gap="200" wrap={false}>
                      <Select
                        label={t("section3.mapping.selectField")}
                        placeholder={t("section3.mapping.selectPlaceholder")}
                        options={APP_FIELDS.map((f) => ({ label: t(f.label), value: f.value }))}
                        value=""
                        onChange={(v) => quickAdd(v)}
                      />
                      <Button onClick={() => quickAdd("customer.name")}>{t("section3.mapping.exampleName")}</Button>
                    </InlineStack>

                    <Text tone="subdued" as="p">
                      {t("section3.mapping.description")}
                    </Text>

                    <div className="tf-group-title" style={{ marginTop: 8, marginBottom: 6 }}>
                      {t("section3.mapping.configuredColumns")}
                    </div>

                    <div className="col-board-wrap">
                      <div className="edge-left" />
                      <div className="edge-right" />

                      <button
                        className="board-nav-btn board-nav-left"
                        onClick={scrollLeft}
                        disabled={atStart}
                        aria-label={t("section3.mapping.previous")}
                      >
                        ‹
                      </button>
                      <button
                        className="board-nav-btn board-nav-right"
                        onClick={scrollRight}
                        disabled={atEnd}
                        aria-label={t("section3.mapping.next")}
                      >
                        ›
                      </button>

                      <div ref={boardRef} className="col-board">
                        {sortedCols.map((col, i) => (
                          <div key={col.id} className="col-card">
                            <InlineStack align="space-between" blockAlign="center">
                              <InlineStack gap="150" blockAlign="center">
                                <Badge>
                                  {t("section3.mapping.column")} {i + 1}
                                </Badge>
                                <span className="pill">{col.type}</span>
                                <Badge tone="subdued">w: {col.width || 180}px</Badge>
                              </InlineStack>
                              <InlineStack gap="100">
                                <Button size="slim" onClick={() => swapWith(-1, col.id)}>
                                  ←
                                </Button>
                                <Button size="slim" onClick={() => swapWith(+1, col.id)}>
                                  →
                                </Button>
                                <Button tone="critical" size="slim" onClick={() => removeCol(col.id)}>
                                  {t("section3.mapping.delete")}
                                </Button>
                              </InlineStack>
                            </InlineStack>

                            <div style={{ height: 8 }} />

                            <Select
                              label={t("section3.mapping.fieldForColumn", { number: i + 1 })}
                              options={APP_FIELDS.map((f) => ({ label: t(f.label), value: f.value }))}
                              value={col.appField}
                              onChange={(v) => {
                                const tType = inferType(v);
                                patchCol(col.id, {
                                  appField: v,
                                  type: tType,
                                  header: labelFromValue(v, t),
                                  width: tType === "datetime" ? 220 : tType === "currency" ? 160 : 180,
                                  asLink: tType === "link" ? true : col.asLink,
                                });
                              }}
                            />

                            {(col.type === "link" || col.asLink) && (
                              <>
                                <Checkbox
                                  label={t("section3.mapping.asLink")}
                                  checked={!!col.asLink}
                                  onChange={(v) => patchCol(col.id, { asLink: v })}
                                />
                                <TextField
                                  label={t("section3.mapping.linkTemplate")}
                                  helpText={t("section3.mapping.linkExample")}
                                  value={col.linkTemplate || "{value}"}
                                  onChange={(v) => patchCol(col.id, { linkTemplate: v })}
                                />
                              </>
                            )}

                            <RangeSlider
                              label={`${t("section3.mapping.width")} (${col.width || 180}px)`}
                              min={140}
                              max={420}
                              output
                              value={col.width || 180}
                              onChange={(v) => patchCol(col.id, { width: v })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </GroupCard>

                  <GroupCard title="section3.display.title">
                    <Grid3>
                      <Select
                        label={t("section3.display.mode")}
                        value={cfg.display.mode}
                        onChange={(v) => setCfg((c) => ({ ...c, display: { ...c.display, mode: v } }))}
                        options={[
                          { label: t("section3.display.options.none"), value: "none" },
                          { label: t("section3.display.options.link"), value: "link" },
                          { label: t("section3.display.options.embedTop"), value: "embed_top" },
                          { label: t("section3.display.options.embedBottom"), value: "embed_bottom" },
                        ]}
                      />
                      <RangeSlider
                        label={`${t("section3.display.height")} (${cfg.display.height}px)`}
                        min={260}
                        max={1000}
                        output
                        value={cfg.display.height}
                        onChange={(v) => setCfg((c) => ({ ...c, display: { ...c.display, height: v } }))}
                      />
                    </Grid3>
                    <Text tone="subdued" as="p">
                      {t("section3.display.description")}
                    </Text>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {view === "abandons" && (
              <div className="tf-panel">
                <BlockStack gap="300">
                  <GroupCard title="section3.abandoned.title">
                    <BlockStack gap="150">
                      {googleStatus.loading ? (
                        <Text tone="subdued" as="p">
                          {t("section3.connection.loading")}
                        </Text>
                      ) : (
                        <>
                          {googleStatus.connected ? (
                            <>
                              <Text as="p">
                                {t("section3.connection.accountConnected")} <b>{googleStatus.accountEmail}</b>
                              </Text>
                              <Text tone="subdued" as="p">
                                {t("section3.abandoned.selectedSheet")}{" "}
                                <b>{googleStatus.abandonedSheetName || cfg.abandonedSheet.tabName || t("section3.connection.notDefined")}</b>
                                {cfg.abandonedSheet.spreadsheetId ? ` · ${t("section3.connection.id")}: ${cfg.abandonedSheet.spreadsheetId}` : ""}
                              </Text>
                              <Text tone="subdued" as="p">
                                {t("section3.abandoned.description")}
                              </Text>
                            </>
                          ) : (
                            <>
                              <Text as="p">{t("section3.abandoned.useSecondSheet")}</Text>
                              <Text tone="subdued" as="p">
                                {t("section3.abandoned.whenAbandoned")}
                              </Text>
                            </>
                          )}

                          <InlineStack gap="200">
                            <Button variant="primary" onClick={() => startGoogleConnect("abandons")}>
                              <InlineStack gap="100" blockAlign="center">
                                <GoogleIcon />
                                <span>
                                  {googleStatus.connected ? t("section3.abandoned.changeSheet") : t("section3.connection.connect")}
                                </span>
                              </InlineStack>
                            </Button>

                            {googleStatus.connected && (
                              <>
                                <Button onClick={fetchGoogleStatus} disabled={googleStatus.loading}>
                                  {t("section3.connection.refresh")}
                                </Button>
                                <Button tone="critical" onClick={disconnectGoogle}>
                                  {t("section3.sheetsConfiguration.disconnect")}
                                </Button>
                              </>
                            )}
                          </InlineStack>
                        </>
                      )}
                    </BlockStack>
                  </GroupCard>

                  <GroupCard title="section3.abandoned.mappingTitle">
                    <InlineStack gap="200" wrap={false}>
                      <Select
                        label={t("section3.mapping.selectField")}
                        placeholder={t("section3.mapping.selectPlaceholder")}
                        options={APP_FIELDS.map((f) => ({ label: t(f.label), value: f.value }))}
                        value=""
                        onChange={(v) => quickAddAbandoned(v)}
                      />
                      <Button onClick={() => quickAddAbandoned("customer.phone")}>{t("section3.abandoned.examplePhone")}</Button>
                    </InlineStack>

                    <Text tone="subdued" as="p">
                      {t("section3.abandoned.mappingDescription")}
                    </Text>

                    <div className="tf-group-title" style={{ marginTop: 8, marginBottom: 6 }}>
                      {t("section3.mapping.configuredColumns")}
                    </div>

                    <div className="col-board-wrap">
                      <div className="edge-left" />
                      <div className="edge-right" />

                      <div className="col-board">
                        {sortedAbandonedCols.map((col, i) => (
                          <div key={col.id} className="col-card">
                            <InlineStack align="space-between" blockAlign="center">
                              <InlineStack gap="150" blockAlign="center">
                                <Badge>
                                  {t("section3.abandoned.abandonedColumn")} {i + 1}
                                </Badge>
                                <span className="pill">{col.type}</span>
                                <Badge tone="subdued">w: {col.width || 180}px</Badge>
                              </InlineStack>
                              <InlineStack gap="100">
                                <Button size="slim" onClick={() => swapAbandonedWith(-1, col.id)}>
                                  ←
                                </Button>
                                <Button size="slim" onClick={() => swapAbandonedWith(+1, col.id)}>
                                  →
                                </Button>
                                <Button tone="critical" size="slim" onClick={() => removeAbandonedCol(col.id)}>
                                  {t("section3.mapping.delete")}
                                </Button>
                              </InlineStack>
                            </InlineStack>

                            <div style={{ height: 8 }} />

                            <Select
                              label={t("section3.mapping.fieldForColumn", { number: i + 1 })}
                              options={APP_FIELDS.map((f) => ({ label: t(f.label), value: f.value }))}
                              value={col.appField}
                              onChange={(v) => {
                                const tType = inferType(v);
                                patchAbandonedCol(col.id, {
                                  appField: v,
                                  type: tType,
                                  header: labelFromValue(v, t),
                                  width: tType === "datetime" ? 220 : tType === "currency" ? 160 : 180,
                                  asLink: tType === "link" ? true : col.asLink,
                                });
                              }}
                            />

                            {(col.type === "link" || col.asLink) && (
                              <>
                                <Checkbox
                                  label={t("section3.mapping.asLink")}
                                  checked={!!col.asLink}
                                  onChange={(v) => patchAbandonedCol(col.id, { asLink: v })}
                                />
                                <TextField
                                  label={t("section3.mapping.linkTemplate")}
                                  helpText={t("section3.mapping.linkExample")}
                                  value={col.linkTemplate || "{value}"}
                                  onChange={(v) => patchAbandonedCol(col.id, { linkTemplate: v })}
                                />
                              </>
                            )}

                            <RangeSlider
                              label={`${t("section3.mapping.width")} (${col.width || 180}px)`}
                              min={140}
                              max={420}
                              output
                              value={col.width || 180}
                              onChange={(v) => patchAbandonedCol(col.id, { width: v })}
                            />
                          </div>
                        ))}

                        {!sortedAbandonedCols.length && (
                          <Text tone="subdued" as="p">
                            {t("section3.abandoned.noColumns")}
                          </Text>
                        )}
                      </div>
                    </div>
                  </GroupCard>
                </BlockStack>
              </div>
            )}

            {view === "realtime" && (
              <div className="tf-panel">
                <div className="tf-group-title">{t("section3.realtime.title")}</div>

                <BlockStack gap="200">
                  {dashLoading && <Text>{t("section3.realtime.loading")}</Text>}

                  {dashError && (
                    <Text tone="critical">
                      {t("section3.realtime.error", { error: dashError || t("section3.realtime.unknownError") })}
                    </Text>
                  )}

                  {!dashLoading && !dashError && (
                    <>
                      {dash.latest && dash.latest.length ? (
                        <div style={{ overflowX: "auto" }}>
                          <table className="tf-orders-table">
                            <thead>
                              <tr>
                                <th style={{ width: 80 }}>{t("section3.preview.columnHeaders.date")}</th>
                                <th style={{ width: 90 }}>{t("section3.preview.columnHeaders.orderId")}</th>
                                <th style={{ width: 160 }}>{t("section3.preview.columnHeaders.customer")}</th>
                                <th style={{ width: 130 }}>{t("section3.preview.columnHeaders.phone")}</th>
                                <th style={{ width: 130 }}>{t("section3.preview.columnHeaders.city")}</th>
                                <th style={{ width: 220 }}>{t("section3.preview.columnHeaders.product")}</th>
                                <th style={{ width: 110 }}>{t("section3.preview.columnHeaders.total")}</th>
                                <th style={{ width: 70 }}>{t("section3.preview.columnHeaders.country")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dash.latest.map((o) => (
                                <tr key={o.id}>
                                  <td>{o.dateLabel}</td>
                                  <td>{o.name || o.shortId}</td>
                                  <td>{o.customerName || t("section3.preview.empty")}</td>
                                  <td>{o.customerPhone || t("section3.preview.empty")}</td>
                                  <td>{o.city || t("section3.preview.empty")}</td>
                                  <td>{o.productTitle || t("section3.preview.empty")}</td>
                                  <td>
                                    {new Intl.NumberFormat("fr-FR", {
                                      style: "currency",
                                      currency: o.currency || "MAD",
                                    }).format((o.totalCents || 0) / 100)}
                                  </td>
                                  <td>{o.country || t("section3.preview.empty")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <Text tone="subdued">{t("section3.realtime.noOrders")}</Text>
                      )}
                    </>
                  )}
                </BlockStack>
              </div>
            )}

            {view === "whatsapp" && (
              <div className="tf-panel">
                {/* ✅ keep your WhatsApp component as-is (you can paste your full SimpleWhatsAppConfig here) */}
                <Text as="p" tone="subdued">
                  WhatsApp panel (your existing component stays here)
                </Text>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="tf-side-col">
            <div className="tf-side-card">
              <Text as="h3" variant="headingSm">
                {t("section3.guide.title")}
              </Text>
              <BlockStack gap="150" className="tf-guide-text" style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                  <li>
                    <b>{t("section3.guide.panelSheets")}</b> : {t("section3.guide.panelSheetsDesc")}
                  </li>
                  <li>
                    <b>{t("section3.guide.panelAbandons")}</b> : {t("section3.guide.panelAbandonsDesc")}
                  </li>
                  <li>
                    <b>{t("section3.guide.panelRealtime")}</b> : {t("section3.guide.panelRealtimeDesc")}
                  </li>
                  <li>
                    <b>{t("section3.guide.panelWhatsapp")}</b> : {t("section3.guide.panelWhatsappDesc")}
                  </li>
                </ul>
              </BlockStack>
            </div>

            <div className="tf-side-card">
              <Text as="h3" variant="headingSm">
                {t("section3.statsCard.title")}
              </Text>

              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  fontSize: 13,
                }}
              >
                <div>
                  <b>{t("section3.rail.stats.period")}</b> {periodDays} {t("section3.rail.stats.days")}{" "}
                  {codOnly ? t("section3.rail.stats.codOnly") : t("section3.rail.stats.allOrders")}
                </div>
                <div style={{ marginTop: 6 }}>
                  <b>{t("section3.rail.stats.orders")}</b> {totalOrders} {" · "}
                  <b>{t("section3.rail.stats.total")}</b>{" "}
                  {formatMoney(totalAmountCents)}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <BlockStack gap="200">
                  <Select
                    label={t("section3.rail.filters.period")}
                    value={String(periodDays)}
                    onChange={(v) =>
                      setCfg((c) => ({
                        ...c,
                        stats: { ...c.stats, periodDays: Number(v || 15) },
                      }))
                    }
                    options={[
                      { label: t("section3.rail.filters.periodOptions.7days"), value: "7" },
                      { label: t("section3.rail.filters.periodOptions.15days"), value: "15" },
                      { label: t("section3.rail.filters.periodOptions.30days"), value: "30" },
                      { label: t("section3.rail.filters.periodOptions.60days"), value: "60" },
                    ]}
                  />

                  <Checkbox
                    label={t("section3.rail.filters.codOnly")}
                    checked={codOnly}
                    onChange={(v) => setCfg((c) => ({ ...c, stats: { ...c.stats, codOnly: v } }))}
                  />

                  <Text tone="subdued" as="p">
                    {t("section3.rail.filters.description")}
                  </Text>
                </BlockStack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
