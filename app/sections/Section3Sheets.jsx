// ===== File: app/sections/Section3Sheets.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";

import TFSectionHeader from "../components/TFSectionHeader";
import UnsavedSaveBar from "../components/UnsavedSaveBar";
import { useUnsavedNavigationGuard } from "../hooks/useUnsavedNavigationGuard";

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
} from "@shopify/polaris";
import * as PolarisIcons from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";

/* ======================= SAFE ICON helper (same as Offers) ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PolarisIcons?.[name] || PolarisIcons?.[fallback];
  if (!src) return null;
  // Polaris Icon supports tone (new) or color (older). tone is safe; ignored if unsupported.
  return <Icon source={src} tone={tone} />;
}

/* ======================= Shopify settings tile (same as Offers) ======================= */
function SettingTileCard({
  iconName = "SettingsIcon",
  title,
  description,
  statusText,
  statusTone = "subdued",
  actionLabel = "Open",
  onOpen,
  active = false,
}) {
  const ChevronRightSrc =
    PolarisIcons.ChevronRightIcon ||
    PolarisIcons.ChevronRightSmallIcon ||
    PolarisIcons.ChevronRightMinor ||
    PolarisIcons.ArrowRightIcon;

  return (
    <div
      className={`tf-setting-tile ${active ? "active" : ""}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.();
      }}
    >
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

      <div className="tf-setting-bottom">
        <Text as="p" variant="bodySm" tone="subdued">
          {/* spacer */}
        </Text>

        <Button
          variant="secondary"
          icon={ChevronRightSrc}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen?.();
          }}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

/* ======================= CSS / layout (PRO) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ HEADER (same wrapper everywhere via TFSectionHeader) */
  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:6px 10px; /* slim */
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

  /* ✅ FLAGS WRAP (CountryFlagsBar inside TFSectionHeader) */
  .tf-flags-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    width:100%;
    min-width:0;
  }
  .tf-flags-wrap > *{
    display:flex;
    align-items:center;
    gap:10px;
    padding:6px 12px;
    max-width:760px;
    overflow-x:auto;
    white-space:nowrap;
    scrollbar-width:none;
    -webkit-overflow-scrolling: touch;
    border-radius:999px;
    background:rgba(255,255,255,0.09);
    border:1px solid rgba(255,255,255,0.18);
  }
  .tf-flags-wrap > *::-webkit-scrollbar{ display:none; }

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

  .tf-shell { padding:16px; }

  /* 2 columns: main + right */
  .tf-editor{
    display:grid;
    grid-template-columns: minmax(0,1fr) 340px;
    gap:16px;
    align-items:start;
  }
  .tf-main-col {
    display:grid;
    gap:16px;
    min-width:0;
  }

  /* ✅ same as OFFERS */
  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
    min-width:0;
  }

  .tf-side-col{
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow-y:auto;
    overflow-x:hidden;
    width:340px;
    flex:none;
  }
  .tf-side-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:14px;
    margin-bottom:12px;
    box-shadow:0 12px 32px rgba(15,23,42,0.08);
  }

  /* ✅ Shopify settings tiles dashboard (same as OFFERS) */
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
    transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    cursor:pointer;
    outline:none;
  }
  .tf-setting-tile:hover{
    transform:translateY(-1px);
    box-shadow:0 14px 34px rgba(15,23,42,0.10);
    border-color:#D1D5DB;
  }
  .tf-setting-tile.active{
    border-color: rgba(11,59,130,0.35);
    box-shadow:0 14px 34px rgba(11,59,130,0.18);
  }
  .tf-setting-tile-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:10px;
  }
  .tf-setting-tile-left{
    display:flex;
    gap:10px;
    min-width:0;
  }
  .tf-setting-ico{
    width:38px;
    height:38px;
    border-radius:12px;
    background:linear-gradient(135deg, rgba(11,59,130,0.12), rgba(125,0,49,0.10));
    border:1px solid rgba(15,23,42,0.06);
    display:flex;
    align-items:center;
    justify-content:center;
    flex:none;
  }
  .tf-setting-title{
    font-weight:800;
    color:#111827;
    font-size:13px;
    line-height:1.2;
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

  .tf-group-title {
    padding:8px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:900;
    letter-spacing:.02em;
    margin-bottom:10px;
    font-size:13px;
    box-shadow:0 6px 16px rgba(11,59,130,0.18);
  }

  /* ✅ Compact grids for settings (2–3 per row) */
  .tf-form-grid{ display:grid; gap:12px; align-items:end; }
  .tf-form-grid-3{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .tf-form-grid-2{ grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .tf-actions-box{
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:10px;
    background:#fff;
    box-shadow:0 8px 22px rgba(15,23,42,0.05);
  }
  .tf-actions-row{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
    justify-content:flex-end;
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
    box-shadow:0 10px 26px rgba(15,23,42,0.06);
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

  /* ✅ Sheets configuration (more compact, no "Header row") */
  .tf-sheet-config {
    background:#F8FAFC;
    border:1px solid #E2E8F0;
    border-radius:12px;
    padding:12px;
    margin-bottom:12px;
  }

  /* WhatsApp Modern Styles - PROFESSIONNEL */
  .whatsapp-section { margin-top: 0; }

  .whatsapp-header-card {
    background: linear-gradient(135deg, #25D366 0%, #075E54 100%);
    border-radius: 16px;
    padding: 24px;
    color: white;
    margin-bottom: 24px;
    box-shadow: 0 12px 32px rgba(37, 211, 102, 0.25);
    border: none;
  }

  .whatsapp-qr-section {
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    margin: 24px 0;
    border: 1px solid #E5E7EB;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .whatsapp-qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .whatsapp-qr-box {
    width: 280px;
    height: 280px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    border: 2px solid #25D366;
    position: relative;
  }

  .whatsapp-qr-instructions {
    background: #F8FAFC;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #E5E7EB;
    max-width: 500px;
    margin: 0 auto;
  }

  .whatsapp-card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #F3F4F6;
  }

  .whatsapp-icon-circle {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #25D366, #128C7E);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .whatsapp-loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    z-index: 10;
  }

  .whatsapp-step-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 20px 0;
    text-align: left;
  }

  .whatsapp-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: #F8FAFC;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
  }

  .whatsapp-step-number {
    width: 32px;
    height: 32px;
    background: #25D366;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-side-col { position:static; max-height:none; width:auto; }

    .tf-flags-wrap > *{ max-width:240px; gap:8px; padding:6px 10px; }
    .tf-pill{ display:none; }
    .tf-brand-sub{ display:none; }

    .whatsapp-qr-box { width: 240px; height: 240px; }

    .tf-form-grid-3{ grid-template-columns: 1fr; }
    .tf-form-grid-2{ grid-template-columns: 1fr; }
    .tf-actions-row{ justify-content:flex-start; }
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
  const s = String(v || "").toLowerCase();
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
    : v
        .split(".")
        .slice(-1)[0]
        .replace(/_/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
};

/* ✅ defaultCfg with stable IDs (no random) */
const defaultCfg = () => ({
  meta: { version: 9 }, // bumped (UI compact + removed Header Row + removed Display in App)
  sheet: { spreadsheetId: "", tabName: "Orders", headerRowIndex: 1 },
  abandonedSheet: { spreadsheetId: "", tabName: "Abandoned", headerRowIndex: 1 },
  display: { mode: "none", height: 420 }, // kept in config (UI removed per request)
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

/* ✅ Compact sheet config (Spreadsheet + Tab + Buttons on same row) */
/* ✅ Header Row removed from UI, forced to 1 internally */
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
  const normalize = (next) => ({ ...(next || {}), headerRowIndex: 1 });

  const showTab = !!sheetConfig.spreadsheetId;

  return (
    <div className="tf-sheet-config">
      <Text variant="headingMd" fontWeight="bold">
        {t(title)}
      </Text>

      <div style={{ height: 10 }} />

      <div className="tf-form-grid tf-form-grid-3">
        <Select
          label={t("section3.sheetsConfiguration.selectSpreadsheet")}
          helpText={t("section3.sheetsConfiguration.selectSpreadsheetHelp")}
          options={[
            { label: t("section3.sheetsConfiguration.chooseSpreadsheet"), value: "" },
            ...(googleSpreadsheets || []).map((sheet) => ({ label: sheet.name, value: sheet.id })),
          ]}
          value={sheetConfig.spreadsheetId || ""}
          onChange={(value) => onConfigChange(normalize({ ...sheetConfig, spreadsheetId: value }))}
          disabled={!isConnected || isLoading || loadingSpreadsheets}
        />

        {showTab ? (
          <Select
            label={t("section3.sheetsConfiguration.selectTab")}
            helpText={t("section3.sheetsConfiguration.selectTabHelp")}
            options={[
              { label: t("section3.sheetsConfiguration.chooseTab"), value: "" },
              ...(availableTabs || []).map((tab) => ({ label: tab.name, value: tab.name })),
            ]}
            value={sheetConfig.tabName || ""}
            onChange={(value) => onConfigChange(normalize({ ...sheetConfig, tabName: value }))}
            disabled={!isConnected || isLoading || loadingTabs}
          />
        ) : (
          <div />
        )}

        <div className="tf-actions-box">
          <Text as="p" variant="bodySm" tone="subdued" style={{ marginBottom: 8 }}>
            {t("section3.sheetsConfiguration.actions")}
          </Text>

          <div className="tf-actions-row">
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
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====== WHATSAPP (layout compact requested) ====== */
function SimpleWhatsAppConfig() {
  const { t } = useI18n();

  const [whatsappStatus, setWhatsappStatus] = useState({
    loading: true,
    connected: false,
    phoneNumber: null,
    qrCode: null,
    lastConnected: null,
    messagesSent: 0,
  });

  const [whatsappConfig, setWhatsappConfig] = useState(() => ({
    phoneNumber: "",
    businessName: "",
    orderMessage: t("whatsapp.defaults.orderMessage"),
    sendAutomatically: true,
    useToken: false,
    permanentToken: "",
  }));

  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    loadWhatsAppStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWhatsAppStatus = async () => {
    setWhatsappStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/whatsapp/status", { credentials: "include" });
      const data = await res.json();

      if (data.ok) {
        setWhatsappStatus({
          loading: false,
          connected: !!(data.config && data.config.phoneNumber),
          phoneNumber: data.config?.phoneNumber || data.phoneNumber,
          qrCode: data.qrCode,
          lastConnected: data.lastConnected,
          messagesSent: data.messagesSent || 0,
        });

        if (data.config) {
          setWhatsappConfig((prev) => ({ ...prev, ...data.config }));
        }
      }
    } catch (error) {
      console.error("Error loading WhatsApp status:", error);
      setWhatsappStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const showToast = (message, tone = "success") => {
    setActiveToast({ message, tone });
    setTimeout(() => setActiveToast(null), 3000);
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const res = await fetch("/api/whatsapp/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: whatsappConfig.phoneNumber,
          useToken: whatsappConfig.useToken,
        }),
      });

      const data = await res.json();

      if (data.ok && data.qrCode) {
        setWhatsappStatus((prev) => ({ ...prev, qrCode: data.qrCode }));
        showToast(t("whatsapp.qr.generated"), "success");
      } else {
        throw new Error(data.error || "QR generation failed");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      showToast(t("whatsapp.errors.qrGeneration"), "critical");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const saveWhatsAppConfig = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/whatsapp/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ config: whatsappConfig, mode: "simple" }),
      });

      const data = await res.json();
      if (data.ok) showToast(t("whatsapp.configSaved"), "success");
      else showToast(t("whatsapp.errors.saveConfig"), "critical");
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
      showToast(t("whatsapp.errors.saveConfig"), "critical");
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (confirm(t("whatsapp.confirmDisconnect"))) {
      try {
        const res = await fetch("/api/whatsapp/disconnect", { method: "POST", credentials: "include" });
        if (res.ok) {
          setWhatsappStatus((prev) => ({ ...prev, connected: false, qrCode: null, phoneNumber: null }));
          showToast(t("whatsapp.disconnected"), "success");
        }
      } catch (error) {
        console.error("Error disconnecting WhatsApp:", error);
      }
    }
  };

  const RefreshSrc = PolarisIcons.RefreshIcon || PolarisIcons.ReplayIcon || PolarisIcons.ArrowRotateLeftIcon;
  const CloseSrc = PolarisIcons.XIcon || PolarisIcons.CancelSmallIcon || PolarisIcons.CancelIcon;
  const CheckSrc = PolarisIcons.CheckCircleIcon || PolarisIcons.CircleTickIcon || PolarisIcons.TickIcon;
  const ChatSrc = PolarisIcons.ChatIcon || PolarisIcons.ChatBubbleIcon || PolarisIcons.ConversationIcon;
  const StoreSrc = PolarisIcons.StoreIcon || PolarisIcons.ShopIcon || PolarisIcons.BuildingStorefrontIcon;
  const RocketSrc = PolarisIcons.RocketIcon || PolarisIcons.PlaneIcon || PolarisIcons.StarFilledIcon;
  const KeySrc = PolarisIcons.KeyIcon || PolarisIcons.LockIcon || PolarisIcons.PasswordIcon;
  const PhoneSrc = PolarisIcons.PhoneIcon || PolarisIcons.MobileIcon || PolarisIcons.PhoneInIcon;
  const AlertSrc = PolarisIcons.AlertTriangleIcon || PolarisIcons.AlertCircleIcon;

  return (
    <div className="whatsapp-section">
      {activeToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            background: activeToast.tone === "success" ? "#DCFCE7" : "#FEE2E2",
            border: "2px solid",
            borderColor: activeToast.tone === "success" ? "#22C55E" : "#EF4444",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            minWidth: "300px",
          }}
        >
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" fontWeight="medium">
              {activeToast.message}
            </Text>
            <Button variant="plain" onClick={() => setActiveToast(null)} accessibilityLabel={t("common.close")}>
              <InlineStack gap="100" blockAlign="center">
                {CloseSrc ? <Icon source={CloseSrc} /> : <span>×</span>}
              </InlineStack>
            </Button>
          </InlineStack>
        </div>
      )}

      <div className="whatsapp-header-card">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {ChatSrc ? <Icon source={ChatSrc} color="base" /> : <span style={{ fontSize: 18 }}>💬</span>}
            </div>
            <div>
              <Text as="h3" variant="headingLg" color="text-inverse" fontWeight="bold">
                {t("whatsapp.header.title")}
              </Text>
              <Text as="p" color="text-inverse">
                {t("whatsapp.header.subtitle")}
              </Text>
            </div>
          </InlineStack>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: "600",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
            }}
          >
            {whatsappStatus.connected ? (
              <>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
                <span>{t("whatsapp.status.connectedTo", { phone: whatsappStatus.phoneNumber || "" })}</span>
              </>
            ) : (
              <>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
                <span>{t("whatsapp.status.notConnected")}</span>
              </>
            )}
          </div>
        </InlineStack>
      </div>

      <Card>
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd" fontWeight="bold">
            {t("whatsapp.mode.title")}
          </Text>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                padding: "24px",
                border: `2px solid ${!whatsappConfig.useToken ? "#25D366" : "#E5E7EB"}`,
                borderRadius: "16px",
                background: !whatsappConfig.useToken ? "#F0F9FF" : "white",
                cursor: "pointer",
              }}
              onClick={() => setWhatsappConfig((prev) => ({ ...prev, useToken: false }))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {StoreSrc ? <Icon source={StoreSrc} color="base" /> : <span>🏪</span>}
                </div>
                <div>
                  <Text as="h4" variant="headingSm" fontWeight="bold">
                    {t("whatsapp.mode.simple.title")}
                  </Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t("whatsapp.mode.simple.subtitle")}
                  </Text>
                </div>
              </div>

              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.simple.b1")}
                  </Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.simple.b2")}
                  </Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.simple.b3")}
                  </Text>
                </li>
                <li>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.simple.b4")}
                  </Text>
                </li>
              </ul>
            </div>

            <div
              style={{
                padding: "24px",
                border: `2px solid ${whatsappConfig.useToken ? "#25D366" : "#E5E7EB"}`,
                borderRadius: "16px",
                background: whatsappConfig.useToken ? "#F0F9FF" : "white",
                cursor: "pointer",
              }}
              onClick={() => setWhatsappConfig((prev) => ({ ...prev, useToken: true }))}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {RocketSrc ? <Icon source={RocketSrc} color="base" /> : <span>🚀</span>}
                </div>
                <div>
                  <Text as="h4" variant="headingSm" fontWeight="bold">
                    {t("whatsapp.mode.advanced.title")}
                  </Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t("whatsapp.mode.advanced.subtitle")}
                  </Text>
                </div>
              </div>

              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.advanced.b1")}
                  </Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.advanced.b2")}
                  </Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.advanced.b3")}
                  </Text>
                </li>
                <li>
                  <Text as="span" variant="bodySm">
                    {t("whatsapp.mode.advanced.b4")}
                  </Text>
                </li>
              </ul>
            </div>
          </div>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          {!whatsappConfig.useToken ? (
            <>
              <div className="whatsapp-card-header">
                <div className="whatsapp-icon-circle">
                  {PhoneSrc ? <Icon source={PhoneSrc} color="base" /> : <span>📱</span>}
                </div>
                <div>
                  <Text as="h3" variant="headingMd" fontWeight="bold">
                    {t("whatsapp.simple.title")}
                  </Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t("whatsapp.simple.subtitle")}
                  </Text>
                </div>
              </div>

              {/* ✅ Compact: Phone + Business on the same row */}
              <div className="tf-form-grid tf-form-grid-2">
                <TextField
                  label={t("whatsapp.fields.phone.label")}
                  type="tel"
                  placeholder={t("whatsapp.fields.phone.placeholder")}
                  helpText={t("whatsapp.fields.phone.help")}
                  value={whatsappConfig.phoneNumber || ""}
                  onChange={(value) => setWhatsappConfig((prev) => ({ ...prev, phoneNumber: value }))}
                />

                <TextField
                  label={t("whatsapp.fields.businessName.label")}
                  placeholder={t("whatsapp.fields.businessName.placeholder")}
                  helpText={t("whatsapp.fields.businessName.help")}
                  value={whatsappConfig.businessName || ""}
                  onChange={(value) => setWhatsappConfig((prev) => ({ ...prev, businessName: value }))}
                />
              </div>

              <div
                style={{
                  background: "#FFFBEB",
                  border: "2px solid #F59E0B",
                  borderRadius: "12px",
                  padding: "20px",
                  marginTop: "16px",
                }}
              >
                <InlineStack gap="100" blockAlign="center" marginBlockEnd="200">
                  {AlertSrc ? <Icon source={AlertSrc} color="warning" /> : null}
                  <Text as="h4" variant="headingSm" fontWeight="bold">
                    {t("whatsapp.warning.title")}
                  </Text>
                </InlineStack>

                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "8px" }}>
                    <Text as="span" fontWeight="medium">
                      {t("whatsapp.warning.b1")}
                    </Text>
                  </li>
                  <li style={{ marginBottom: "8px" }}>
                    <Text as="span" fontWeight="medium">
                      {t("whatsapp.warning.b2")}
                    </Text>
                  </li>
                  <li style={{ marginBottom: "8px" }}>
                    <Text as="span" fontWeight="medium">
                      {t("whatsapp.warning.b3")}
                    </Text>
                  </li>
                  <li>
                    <Text as="span" fontWeight="medium">
                      {t("whatsapp.warning.b4")}
                    </Text>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="whatsapp-card-header">
                <div className="whatsapp-icon-circle">
                  {KeySrc ? <Icon source={KeySrc} color="base" /> : <span>🔑</span>}
                </div>
                <div>
                  <Text as="h3" variant="headingMd" fontWeight="bold">
                    {t("whatsapp.advanced.title")}
                  </Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    {t("whatsapp.advanced.subtitle")}
                  </Text>
                </div>
              </div>

              <TextField
                label={t("whatsapp.fields.token.label")}
                type="password"
                placeholder={t("whatsapp.fields.token.placeholder")}
                helpText={t("whatsapp.fields.token.help")}
                value={whatsappConfig.permanentToken || ""}
                onChange={(value) => setWhatsappConfig((prev) => ({ ...prev, permanentToken: value }))}
              />

              <div
                style={{
                  background: "#F0F9FF",
                  border: "2px solid #0EA5E9",
                  borderRadius: "12px",
                  padding: "20px",
                  marginTop: "16px",
                }}
              >
                <Text as="p" variant="bodySm">
                  {t("whatsapp.noteApi")}
                </Text>
              </div>
            </>
          )}

          <TextField
            label={t("whatsapp.fields.message.label")}
            multiline={4}
            placeholder={t("whatsapp.fields.message.placeholder")}
            helpText={t("whatsapp.fields.message.help")}
            value={whatsappConfig.orderMessage || ""}
            onChange={(value) => setWhatsappConfig((prev) => ({ ...prev, orderMessage: value }))}
          />

          <Checkbox
            label={t("whatsapp.fields.autoSend.label")}
            checked={!!whatsappConfig.sendAutomatically}
            onChange={(checked) => setWhatsappConfig((prev) => ({ ...prev, sendAutomatically: checked }))}
          />

          <InlineStack gap="200" align="end">
            <Button onClick={saveWhatsAppConfig} loading={isSaving}>
              {t("common.save")}
            </Button>

            {whatsappStatus.connected && (
              <Button tone="critical" onClick={disconnectWhatsApp}>
                {t("common.disconnect")}
              </Button>
            )}
          </InlineStack>
        </BlockStack>
      </Card>

      {!whatsappStatus.connected && (
        <Card>
          <BlockStack gap="400">
            <div className="whatsapp-card-header">
              <div className="whatsapp-icon-circle">
                {ChatSrc ? <Icon source={ChatSrc} color="base" /> : <span>💬</span>}
              </div>
              <div>
                <Text as="h3" variant="headingMd" fontWeight="bold">
                  {t("whatsapp.qr.title")}
                </Text>
                <Text as="p" tone="subdued" variant="bodySm">
                  {t("whatsapp.qr.subtitle")}
                </Text>
              </div>
            </div>

            <div className="whatsapp-qr-section">
              <div className="whatsapp-qr-container">
                <div className="whatsapp-qr-box">
                  {isGeneratingQR ? (
                    <div className="whatsapp-loading-overlay">
                      <Spinner size="large" />
                    </div>
                  ) : whatsappStatus.qrCode ? (
                    <img
                      src={whatsappStatus.qrCode}
                      alt="WhatsApp QR Code"
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "12px",
                          background: "#25D366",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        {ChatSrc ? <Icon source={ChatSrc} color="base" /> : <span style={{ fontSize: 26 }}>💬</span>}
                      </div>
                      <Text as="p" tone="subdued" alignment="center">
                        {t("whatsapp.qr.empty")}
                      </Text>
                    </div>
                  )}
                </div>

                <div className="whatsapp-qr-instructions">
                  <Text as="h4" variant="headingSm" fontWeight="bold" marginBlockEnd="200">
                    {t("whatsapp.qr.howTo")}
                  </Text>

                  <div className="whatsapp-step-list">
                    <div className="whatsapp-step">
                      <div className="whatsapp-step-number">1</div>
                      <Text as="p">{t("whatsapp.qr.step1")}</Text>
                    </div>
                    <div className="whatsapp-step">
                      <div className="whatsapp-step-number">2</div>
                      <Text as="p">{t("whatsapp.qr.step2")}</Text>
                    </div>
                    <div className="whatsapp-step">
                      <div className="whatsapp-step-number">3</div>
                      <Text as="p">{t("whatsapp.qr.step3")}</Text>
                    </div>
                  </div>

                  <InlineStack gap="200" align="center">
                    <Button
                      variant="primary"
                      onClick={generateQRCode}
                      loading={isGeneratingQR}
                      disabled={whatsappStatus.loading}
                    >
                      {whatsappStatus.qrCode ? t("whatsapp.qr.regenerate") : t("whatsapp.qr.generate")}
                    </Button>

                    <Button onClick={loadWhatsAppStatus} disabled={whatsappStatus.loading}>
                      <InlineStack gap="100" blockAlign="center">
                        {RefreshSrc ? <Icon source={RefreshSrc} /> : <span>↻</span>}
                        <span>{t("whatsapp.qr.refresh")}</span>
                      </InlineStack>
                    </Button>
                  </InlineStack>
                </div>
              </div>
            </div>
          </BlockStack>
        </Card>
      )}

      {whatsappStatus.connected && (
        <Card>
          <BlockStack gap="300">
            <div
              style={{
                background: "linear-gradient(135deg, #DCFCE7, #BBF7D0)",
                border: "2px solid #22C55E",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#22C55E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {CheckSrc ? <Icon source={CheckSrc} color="base" /> : <span>✓</span>}
                  </div>

                  <div>
                    <Text as="h4" variant="headingSm" fontWeight="bold">
                      {t("whatsapp.connected.title")}
                    </Text>
                    <Text as="p" variant="bodyLg" fontWeight="bold">
                      {whatsappStatus.phoneNumber}
                    </Text>

                    {whatsappStatus.lastConnected && (
                      <Text as="p" tone="subdued" variant="bodySm">
                        {t("whatsapp.connected.last", {
                          date: new Date(whatsappStatus.lastConnected).toLocaleString(),
                        })}
                      </Text>
                    )}
                  </div>
                </InlineStack>

                <Badge tone="success">{t("whatsapp.connected.sent", { count: whatsappStatus.messagesSent })}</Badge>
              </InlineStack>
            </div>

            <Text as="p" tone="subdued">
              {t("whatsapp.connected.ready")}
            </Text>
          </BlockStack>
        </Card>
      )}
    </div>
  );
}

export default function Section3Sheets() {
  const { t } = useI18n();
  const navigate = useNavigate();
  useInjectCss();

  const stableStringify = (obj) => {
    try {
      return JSON.stringify(obj);
    } catch {
      return String(obj);
    }
  };

  const [cfg, setCfg] = useState(() => defaultCfg());
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
  const sheetTabs = [
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
  ];

  /* ===================== DIRTY SNAPSHOT (NO SPAM UI) ===================== */
  const savedSnapshotRef = useRef(stableStringify(defaultCfg()));

  const isDirty = useMemo(() => {
    const cur = stableStringify(cfg);
    return cur !== savedSnapshotRef.current;
  }, [cfg]);

  const markSaved = (newCfg) => {
    savedSnapshotRef.current = stableStringify(newCfg || cfg);
  };

  /* ===================== SAVE REMOTE ===================== */
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

      markSaved(cfg);
      return true;
    } catch (e) {
      console.error("save-sheets error", e);
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* ===================== GUARD (same style as OFFERS) ===================== */
  const navGuard = useUnsavedNavigationGuard({
    dirty: isDirty,
    onSave: handleSaveRemote,
    navigate: (href) => navigate(href),
    // keep internal-only rule (safe)
    isInternalHref: (href) => {
      if (!href) return false;
      if (href.startsWith("#")) return false;
      if (/^https?:\/\//i.test(href)) return false;
      if (/^(mailto|tel):/i.test(href)) return false;
      return true;
    },
  });

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "GOOGLE_OAUTH_SUCCESS") {
        fetchGoogleStatus();
        loadGoogleSpreadsheets();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          if (prev.sheet.tabName) return prev;
          if (!data.tabs.length) return prev;
          const next = { ...prev, sheet: { ...prev.sheet, tabName: data.tabs[0].name, headerRowIndex: 1 } };
          return next;
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des onglets:", error);
      setAvailableTabs([]);
    } finally {
      setLoadingTabs(false);
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
            // ✅ normalize: force headerRowIndex=1 (UI removed)
            const normalized = {
              ...prev,
              ...data.config,
              sheet: { ...(data.config.sheet || prev.sheet), headerRowIndex: 1 },
              abandonedSheet: { ...(data.config.abandonedSheet || prev.abandonedSheet), headerRowIndex: 1 },
            };
            markSaved(normalized); // ✅ snapshot = loaded config
            return normalized;
          });

          const nextId = data.config?.sheet?.spreadsheetId;
          if (nextId) loadSpreadsheetTabs(nextId);
        } else {
          markSaved(cfg);
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

  const startGoogleConnect = async (target) => {
    try {
      const response = await fetch(`/api/google/connect?target=${encodeURIComponent(target || "orders")}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.requiresReauth) window.location.reload();
        throw new Error(data.error || "Google connect error");
      }

      if (!data.url) throw new Error("Missing Google OAuth URL");

      const popup = window.open(
        data.url,
        "Google OAuth",
        "width=600,height=700,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes"
      );

      if (!popup) return;

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
    }
  };

  const testSheetConnection = async (sheet, kind) => {
    setTesting(true);
    try {
      await fetchGoogleStatus();
      if (!googleStatus.connected) return;

      await fetch("/api/google-sheets/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sheet, kind }),
      }).then((r) => r.json().catch(() => null));
    } catch (e) {
      console.error("test sheet error", e);
    } finally {
      setTesting(false);
    }
  };

  const openSheet = (spreadsheetId) => {
    if (spreadsheetId) window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, "_blank");
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
      } catch (error) {
        console.error("disconnect google error", error);
      }
    }
  };

  /* Mapping board */
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

  const topTabs = [
    { id: "sheets", content: t("section3.rail.panels.sheets"), panelID: "p-sheets" },
    { id: "abandons", content: t("section3.rail.panels.abandons"), panelID: "p-abandons" },
    { id: "realtime", content: t("section3.rail.panels.realtime"), panelID: "p-realtime" },
    { id: "whatsapp", content: t("section3.rail.panels.whatsapp"), panelID: "p-whatsapp" },
  ];
  const topSelected = ["sheets", "abandons", "realtime", "whatsapp"].indexOf(view);

  const totalOrders = dash.totals?.count || 0;
  const totalAmountCents = dash.totals?.totalCents || 0;
  const totalCurrency = dash.totals?.currency || cfg.formats.currency || "MAD";

  const formatMoney = (cents) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: totalCurrency }).format((cents || 0) / 100);

  // ✅ dashboard statuses (shopify-like)
  const googleBadge = googleStatus.connected ? t("common.connected") : t("common.notConnected");
  const googleTone = googleStatus.connected ? "success" : "warning";

  const ordersConfigured = !!cfg.sheet?.spreadsheetId;
  const abandonedConfigured = !!cfg.abandonedSheet?.spreadsheetId;

  const sheetStatusText = ordersConfigured ? t("common.configured") : t("common.notConfigured");
  const sheetStatusTone = ordersConfigured ? "success" : "warning";

  const abandonedStatusText = abandonedConfigured ? t("common.configured") : t("common.notConfigured");
  const abandonedStatusTone = abandonedConfigured ? "success" : "warning";

  const realtimeStatusText = totalOrders ? `${totalOrders} ${t("section3.rail.stats.orders")}` : t("common.ready");
  const realtimeStatusTone = totalOrders ? "info" : "subdued";

  return (
    <>
      {/* ✅ Header commun: rightSlot = SAVE (same as OFFERS) */}
      <TFSectionHeader
        title={t("section3.header.title")}
        subtitle={t("section3.header.subtitle")}
        rightSlot={
          <Button
            variant="primary"
            onClick={navGuard.manualSave}
            disabled={!isDirty || navGuard.saving}
            loading={navGuard.saving}
          >
            {t("common.save")}
          </Button>
        }
      />

      {/* ✅ UnsavedSaveBar */}
      <UnsavedSaveBar
        open={navGuard.open}
        dirty={navGuard.dirty}
        saving={navGuard.saving}
        mode={navGuard.mode}
        onSave={navGuard.onSave}
        onDiscard={navGuard.onDiscard}
        onCancel={navGuard.onCancel}
        t={t}
      />

      <div className="tf-shell">
        {/* ✅ Shopify settings overview tiles (same style as OFFERS) */}
        <div className="tf-panel" style={{ marginBottom: 16 }}>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="h2" variant="headingMd">
                  {t("section3.dashboard.title")}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {t("section3.dashboard.subtitle")}
                </Text>
              </BlockStack>

              <InlineStack gap="200" blockAlign="center">
                {isDirty ? (
                  <Badge tone="attention">{t("common.unsavedChanges")}</Badge>
                ) : (
                  <Badge tone="success">{t("common.saved")}</Badge>
                )}
              </InlineStack>
            </InlineStack>

            <div className="tf-dashboard-grid">
              <SettingTileCard
                iconName="LogoGoogleIcon"
                title={t("section3.dashboard.tiles.google.title")}
                description={t("section3.dashboard.tiles.google.desc")}
                statusText={googleBadge}
                statusTone={googleTone}
                actionLabel={t("common.open")}
                onOpen={() => setView("sheets")}
                active={view === "sheets"}
              />

              <SettingTileCard
                iconName="DataPresentationIcon"
                title={t("section3.dashboard.tiles.sheets.title")}
                description={t("section3.dashboard.tiles.sheets.desc")}
                statusText={sheetStatusText}
                statusTone={sheetStatusTone}
                actionLabel={t("common.open")}
                onOpen={() => setView("sheets")}
                active={view === "sheets"}
              />

              <SettingTileCard
                iconName="ClockIcon"
                title={t("section3.dashboard.tiles.abandoned.title")}
                description={t("section3.dashboard.tiles.abandoned.desc")}
                statusText={abandonedStatusText}
                statusTone={abandonedStatusTone}
                actionLabel={t("common.open")}
                onOpen={() => setView("abandons")}
                active={view === "abandons"}
              />

              <SettingTileCard
                iconName="ChartHistogramIcon"
                title={t("section3.dashboard.tiles.realtime.title")}
                description={t("section3.dashboard.tiles.realtime.desc")}
                statusText={realtimeStatusText}
                statusTone={realtimeStatusTone}
                actionLabel={t("common.open")}
                onOpen={() => setView("realtime")}
                active={view === "realtime"}
              />

              <SettingTileCard
                iconName="ChatIcon"
                title={t("section3.dashboard.tiles.whatsapp.title")}
                description={t("section3.dashboard.tiles.whatsapp.desc")}
                statusText={t("common.setup")}
                statusTone="subdued"
                actionLabel={t("common.open")}
                onOpen={() => setView("whatsapp")}
                active={view === "whatsapp"}
              />
            </div>
          </BlockStack>
        </div>

        <div className="tf-editor">
          <div className="tf-main-col">
            {/* ===== VIEW: SHEETS ===== */}
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

                  <GroupCard title="section3.sheetsConfiguration.title">
                    <Tabs tabs={sheetTabs} selected={sheetTab} onSelect={setSheetTab}>
                      {sheetTab === 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <SheetConfigSection
                            title="section3.sheetsConfiguration.ordersSheet"
                            sheetConfig={cfg.sheet}
                            onConfigChange={(newSheetConfig) => {
                              const normalized = { ...newSheetConfig, headerRowIndex: 1 }; // ✅ force 1
                              setCfg((c) => ({ ...c, sheet: normalized }));
                              if (normalized.spreadsheetId && normalized.spreadsheetId !== cfg.sheet.spreadsheetId) {
                                loadSpreadsheetTabs(normalized.spreadsheetId);
                              }
                            }}
                            onTest={() => testSheetConnection({ ...cfg.sheet, headerRowIndex: 1 }, "orders")}
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
                              const normalized = { ...newSheetConfig, headerRowIndex: 1 }; // ✅ force 1
                              setCfg((c) => ({ ...c, abandonedSheet: normalized }));
                              if (
                                normalized.spreadsheetId &&
                                normalized.spreadsheetId !== cfg.abandonedSheet.spreadsheetId
                              ) {
                                loadSpreadsheetTabs(normalized.spreadsheetId);
                              }
                            }}
                            onTest={() => testSheetConnection({ ...cfg.abandonedSheet, headerRowIndex: 1 }, "abandons")}
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

                  {/* ✅ Display in App removed from UI (per request) */}
                </BlockStack>
              </div>
            )}

            {/* ===== VIEW: ABANDONS ===== */}
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

            {/* ===== VIEW: REALTIME ===== */}
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
                                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: o.currency || "MAD" }).format(
                                      (o.totalCents || 0) / 100
                                    )}
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

            {/* ===== VIEW: WHATSAPP ===== */}
            {view === "whatsapp" && (
              <div className="tf-panel">
                <SimpleWhatsAppConfig />
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="tf-side-col">
            <div className="tf-side-card">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {t("section3.guide.title")}
                </Text>
              </InlineStack>

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

                {isDirty ? (
                  <div style={{ marginTop: 10 }}>
                    <Badge tone="attention">{t("common.unsavedChanges")}</Badge>
                  </div>
                ) : null}
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
                  <b>{t("section3.rail.stats.total")}</b> {formatMoney(totalAmountCents)}
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
