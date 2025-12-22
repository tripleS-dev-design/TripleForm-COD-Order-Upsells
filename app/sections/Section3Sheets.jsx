// ===== File: app/sections/Section3Sheets.jsx =====
import React, { useEffect, useRef, useState } from "react";
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
  Box,
  Divider,
} from "@shopify/polaris";
import { useI18n } from "../i18n/react";
import PlanUsageWidget from "../components/PlanUsageWidget";

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

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

  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

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
    top:84px;
    max-height:calc(100vh - 100px);
    overflow-y: auto;
    overflow-x: hidden;
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

  .tf-usage-card {
    margin-top:14px;
    background:#ffffff;
    border-radius:10px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.12);
    padding:10px 12px 12px;
  }
  .tf-usage-title {
    font-size:13px;
    font-weight:700;
    margin-bottom:4px;
    color:#0F172A;
  }
  .tf-usage-sub {
    font-size:11px;
    color:#6B7280;
    margin-bottom:8px;
  }
  .tf-usage-row {
    display:flex;
    align-items:center;
    gap:10px;
  }
  .tf-usage-meta {
    font-size:12px;
    color:#111827;
    display:grid;
    gap:4px;
  }
  .tf-usage-pill {
    display:inline-flex;
    align-items:center;
    gap:4px;
    padding:3px 8px;
    border-radius:999px;
    font-size:11px;
    background:rgba(11,59,130,0.06);
    color:#0B3B82;
    border:1px solid rgba(11,59,130,0.18);
  }
  .tf-usage-value-main {
    font-size:18px;
    font-weight:800;
  }
  .tf-usage-value-sub {
    font-size:11px;
    color:#6B7280;
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

  .table-mini {
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    table-layout:fixed;
  }
  .table-mini th, .table-mini td {
    border:1px solid #E5E7EB;
    padding:8px 10px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .table-mini th {
    background:#F9FAFB;
    font-weight:700;
    font-size:12px;
  }

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

  .tf-tabs {
    margin-bottom:20px;
  }

  /* WhatsApp Modern Styles */
  .whatsapp-section {
    margin-top: 24px;
  }

  .whatsapp-status-card {
    background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
    border-radius: 12px;
    padding: 20px;
    color: white;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(37, 211, 102, 0.25);
  }

  .whatsapp-qr-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: #f8fafc;
    border-radius: 12px;
    border: 2px dashed #25D366;
    margin: 20px 0;
  }

  .whatsapp-qr-box {
    width: 250px;
    height: 250px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }

  .whatsapp-qr-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
  }

  .whatsapp-config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .whatsapp-feature-card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .whatsapp-feature-card:hover {
    border-color: #25D366;
    box-shadow: 0 10px 25px rgba(37, 211, 102, 0.1);
  }

  .whatsapp-feature-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .whatsapp-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #25D366, #128C7E);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .whatsapp-advanced-settings {
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
    border: 1px solid #e2e8f0;
  }

  .whatsapp-connection-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
  }

  .status-connected {
    background: rgba(37, 211, 102, 0.1);
    color: #128C7E;
    border: 1px solid rgba(37, 211, 102, 0.3);
  }

  .status-disconnected {
    background: rgba(239, 68, 68, 0.1);
    color: #DC2626;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .whatsapp-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .whatsapp-stat-card {
    background: white;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #E5E7EB;
    text-align: center;
  }

  .whatsapp-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #0F172A;
    margin: 8px 0;
  }

  .whatsapp-stat-label {
    font-size: 12px;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .whatsapp-template-preview {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 16px;
    margin-top: 16px;
  }

  .whatsapp-variables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .whatsapp-variable-tag {
    background: #e0f2fe;
    border: 1px solid #bae6fd;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    font-family: monospace;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .whatsapp-variable-tag:hover {
    background: #bae6fd;
    transform: translateY(-1px);
  }

  .whatsapp-schedule-selector {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .whatsapp-schedule-option {
    padding: 8px 16px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    min-width: 100px;
  }

  .whatsapp-schedule-option:hover {
    border-color: #25D366;
  }

  .whatsapp-schedule-option.active {
    background: #25D366;
    color: white;
    border-color: #25D366;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }
    .whatsapp-config-grid { grid-template-columns: 1fr; }
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
  const s = v.toLowerCase();
  if (s.includes("date")) return "datetime";
  if (s.includes("phone")) return "phone";
  if (s.includes("total") || s.includes("price") || s.includes("amount"))
    return "currency";
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

const defaultCfg = () => ({
  meta: { version: 8 },
  sheet: { spreadsheetId: "", tabName: "Orders", headerRowIndex: 1 },
  abandonedSheet: {
    spreadsheetId: "",
    tabName: "Abandoned",
    headerRowIndex: 1,
  },
  display: {
    mode: "none",
    height: 420,
  },
  formats: {
    dateFormat: "YYYY-MM-DD HH:mm",
    numberFormat: "0.00",
    currency: "MAD",
    timezone: "shop",
  },
  stats: {
    periodDays: 15,
    codOnly: false,
  },
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

const PLAN_MAP = {
  EVERY_30_DAYS: { 0.99: "starter", 4.99: "basic", 9.99: "premium" },
  ANNUAL: { 9.99: "starter", 49: "basic", 99: "premium" },
};
function resolveCurrentPlan(billingPlan) {
  if (!billingPlan) return { currentKey: null, currentTerm: null };
  const interval = billingPlan.interval || "EVERY_30_DAYS";
  const amount = Number(billingPlan.amount || 0);
  const key = PLAN_MAP[interval]?.[amount] || null;
  const term = interval === "ANNUAL" ? "annual" : "monthly";
  return { currentKey: key, currentTerm: key ? term : null };
}

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

function WhatsAppIcon({ size = 20 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#25D366",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: size * 0.6,
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.897 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" fill="currentColor"/>
      </svg>
    </span>
  );
}

/* ====== HEADER avec bouton Save dans la bande colorée ====== */
function PageShell({ children, onSave, saving }) {
  const { t } = useI18n();
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
                {t("section3.header.title")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section3.header.subtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section3.header.pill")}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section3.rail.filters.save")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
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
  loadingTabs
}) {
  const { t } = useI18n();

  return (
    <div className="tf-sheet-config">
      <Text variant="headingMd" fontWeight="bold">{t(title)}</Text>
      <BlockStack gap="300" marginBlockStart="300">
        <Select
          label={t("section3.sheetsConfiguration.selectSpreadsheet")}
          helpText={t("section3.sheetsConfiguration.selectSpreadsheetHelp")}
          options={[
            { label: t("section3.sheetsConfiguration.chooseSpreadsheet"), value: "" },
            ...googleSpreadsheets.map(sheet => ({
              label: sheet.name,
              value: sheet.id
            }))
          ]}
          value={sheetConfig.spreadsheetId || ""}
          onChange={(value) => {
            const newConfig = { ...sheetConfig, spreadsheetId: value };
            onConfigChange(newConfig);
          }}
          disabled={!isConnected || isLoading || loadingSpreadsheets}
        />

        {sheetConfig.spreadsheetId && (
          <Select
            label={t("section3.sheetsConfiguration.selectTab")}
            helpText={t("section3.sheetsConfiguration.selectTabHelp")}
            options={[
              { label: t("section3.sheetsConfiguration.chooseTab"), value: "" },
              ...availableTabs.map(tab => ({
                label: tab.name,
                value: tab.name
              }))
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
          
          <Button
            onClick={onOpen}
            disabled={!isConnected || !sheetConfig.spreadsheetId || isLoading}
          >
            {t("section3.sheetsConfiguration.openSheet")}
          </Button>
        </InlineStack>
      </BlockStack>
    </div>
  );
}

/* ====== WHATSAPP CONFIGURATION SECTION ====== */
function WhatsAppConfigSection() {
  const { t } = useI18n();
  
  const [whatsappStatus, setWhatsappStatus] = useState({
    loading: true,
    connected: false,
    phoneNumber: null,
    sessionStatus: 'disconnected',
    qrCode: null,
    lastConnected: null,
    messagesSent: 0,
    recoveryRate: 0
  });

  const [whatsappConfig, setWhatsappConfig] = useState({
    // Connexion
    autoConnect: true,
    sessionTimeout: 24, // heures
    
    // Messages après commande COD
    enabled: true,
    buttonText: "💬 WhatsApp",
    messageTemplate: "✅ Commande #{orderId} confirmée! Livraison dans 2-3 jours. Merci pour votre confiance!",
    sendAutomatically: true,
    sendDelay: "immediate",
    buttonPosition: "below",
    buttonStyle: "secondary",
    
    // WhatsApp Recovery
    recoveryEnabled: true,
    recoveryMessage: "👋 Vous avez oublié quelque chose! Votre panier vous attend. Profitez de 10% de réduction avec le code: RECOVERY10",
    recoveryDelay: "1h",
    recoveryDiscount: "10%",
    recoveryCode: "RECOVERY10",
    
    // Options avancées
    enableAnalytics: true,
    enableReadReceipts: true,
    enableTypingIndicator: false,
    maxRetries: 3,
    retryInterval: 5, // minutes
    businessHoursOnly: false,
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    
    // Template personnalisation
    enableMediaMessages: false,
    mediaUrl: "",
    enableButtons: false,
    button1Text: "Suivre ma commande",
    button1Url: "{trackingUrl}",
    button2Text: "Contacter le support",
    button2Url: "https://wa.me/{supportNumber}",
  });

  const [qrLoading, setQrLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    successful: 0,
    failed: 0,
    recoveryConverted: 0,
    avgResponseTime: 0
  });

  const availableVariables = [
    { code: "{orderId}", label: t("whatsapp.variables.orderId") },
    { code: "{customerName}", label: t("whatsapp.variables.customerName") },
    { code: "{customerPhone}", label: t("whatsapp.variables.customerPhone") },
    { code: "{productName}", label: t("whatsapp.variables.productName") },
    { code: "{orderTotal}", label: t("whatsapp.variables.orderTotal") },
    { code: "{deliveryDate}", label: t("whatsapp.variables.deliveryDate") },
    { code: "{shopName}", label: t("whatsapp.variables.shopName") },
    { code: "{trackingUrl}", label: t("whatsapp.variables.trackingUrl") },
    { code: "{supportNumber}", label: t("whatsapp.variables.supportNumber") },
    { code: "{recoveryCode}", label: t("whatsapp.variables.recoveryCode") },
  ];

  const delayOptions = [
    { value: "immediate", label: t("whatsapp.delays.immediate") },
    { value: "5min", label: t("whatsapp.delays.5min") },
    { value: "30min", label: t("whatsapp.delays.30min") },
    { value: "1h", label: t("whatsapp.delays.1h") },
    { value: "2h", label: t("whatsapp.delays.2h") },
    { value: "6h", label: t("whatsapp.delays.6h") },
    { value: "24h", label: t("whatsapp.delays.24h") },
  ];

  useEffect(() => {
    loadWhatsAppStatus();
  }, []);

  const loadWhatsAppStatus = async () => {
    setWhatsappStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/whatsapp/status", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        setWhatsappStatus({
          loading: false,
          connected: data.connected,
          phoneNumber: data.phoneNumber,
          sessionStatus: data.sessionStatus,
          qrCode: data.qrCode,
          lastConnected: data.lastConnected,
          messagesSent: data.messagesSent || 0,
          recoveryRate: data.recoveryRate || 0
        });
        setStats(data.stats || stats);
        if (data.config) {
          setWhatsappConfig(prev => ({ ...prev, ...data.config }));
        }
      }
    } catch (error) {
      console.error("Error loading WhatsApp status:", error);
      setWhatsappStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const generateQRCode = async () => {
    setQrLoading(true);
    try {
      const res = await fetch("/api/whatsapp/generate-qr", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok && data.qrCode) {
        setWhatsappStatus(prev => ({ ...prev, qrCode: data.qrCode }));
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert(t("whatsapp.errors.qrGeneration"));
    } finally {
      setQrLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (confirm(t("whatsapp.confirmDisconnect"))) {
      try {
        const res = await fetch("/api/whatsapp/disconnect", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          setWhatsappStatus(prev => ({ ...prev, connected: false, qrCode: null }));
          alert(t("whatsapp.disconnected"));
        }
      } catch (error) {
        console.error("Error disconnecting WhatsApp:", error);
        alert(t("whatsapp.errors.disconnect"));
      }
    }
  };

  const testWhatsAppConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok) {
        alert(t("whatsapp.testSuccess"));
      } else {
        alert(t("whatsapp.testError", { error: data.error }));
      }
    } catch (error) {
      alert(t("whatsapp.testError", { error: error.message }));
    } finally {
      setTestingConnection(false);
    }
  };

  const saveWhatsAppConfig = async () => {
    try {
      const res = await fetch("/api/whatsapp/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ config: whatsappConfig }),
      });
      if (res.ok) {
        alert(t("whatsapp.configSaved"));
      } else {
        alert(t("whatsapp.errors.saveConfig"));
      }
    } catch (error) {
      console.error("Error saving WhatsApp config:", error);
      alert(t("whatsapp.errors.saveConfig"));
    }
  };

  const sendTestMessage = async () => {
    if (confirm(t("whatsapp.confirmTestMessage"))) {
      try {
        const res = await fetch("/api/whatsapp/send-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            message: whatsappConfig.messageTemplate,
            type: "order"
          }),
        });
        const data = await res.json();
        if (data.ok) {
          alert(t("whatsapp.testMessageSent"));
        } else {
          alert(t("whatsapp.errors.testMessage", { error: data.error }));
        }
      } catch (error) {
        alert(t("whatsapp.errors.testMessage", { error: error.message }));
      }
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector('textarea[name="messageTemplate"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      setWhatsappConfig(prev => ({
        ...prev,
        messageTemplate: newText
      }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      }, 0);
    }
  };

  return (
    <div className="whatsapp-section">
      {/* Status Card */}
      <div className="whatsapp-status-card">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <WhatsAppIcon size={32} />
            <div>
              <Text as="h3" variant="headingLg" color="text-inverse">
                {t("whatsapp.title")}
              </Text>
              <Text as="p" color="text-inverse">
                {t("whatsapp.subtitle")}
              </Text>
            </div>
          </InlineStack>
          
          <div className={`whatsapp-connection-status ${whatsappStatus.connected ? 'status-connected' : 'status-disconnected'}`}>
            {whatsappStatus.connected ? (
              <>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366' }} />
                {t("whatsapp.connected")}
              </>
            ) : (
              <>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }} />
                {t("whatsapp.disconnected")}
              </>
            )}
          </div>
        </InlineStack>
      </div>

      {/* Connection QR Code */}
      <Card>
        <BlockStack gap="400">
          <div className="whatsapp-feature-header">
            <div className="whatsapp-icon">
              <WhatsAppIcon size={24} />
            </div>
            <div>
              <Text as="h3" variant="headingMd">{t("whatsapp.connection.title")}</Text>
              <Text as="p" tone="subdued">{t("whatsapp.connection.description")}</Text>
            </div>
          </div>

          {!whatsappStatus.connected ? (
            <div className="whatsapp-qr-container">
              <div className="whatsapp-qr-box">
                {whatsappStatus.qrCode ? (
                  <img 
                    src={whatsappStatus.qrCode} 
                    alt="WhatsApp QR Code" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="whatsapp-qr-placeholder">
                    <WhatsAppIcon size={48} />
                    <Text as="p" tone="subdued">{t("whatsapp.qr.placeholder")}</Text>
                  </div>
                )}
              </div>
              
              <BlockStack gap="200">
                <Text as="p" alignment="center">{t("whatsapp.qr.instructions")}</Text>
                
                <InlineStack gap="200" align="center">
                  <Button
                    variant="primary"
                    onClick={generateQRCode}
                    loading={qrLoading}
                    disabled={whatsappStatus.loading}
                  >
                    {whatsappStatus.qrCode ? t("whatsapp.qr.regenerate") : t("whatsapp.qr.generate")}
                  </Button>
                  
                  <Button
                    onClick={loadWhatsAppStatus}
                    disabled={whatsappStatus.loading}
                  >
                    {t("whatsapp.refreshStatus")}
                  </Button>
                </InlineStack>
              </BlockStack>
            </div>
          ) : (
            <div style={{ padding: 20, background: '#f0f9ff', borderRadius: 12 }}>
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <WhatsAppIcon size={24} />
                  <div>
                    <Text as="h4" variant="headingSm">{t("whatsapp.connectedTo")}</Text>
                    <Text as="p" variant="bodyLg" fontWeight="bold">{whatsappStatus.phoneNumber}</Text>
                    {whatsappStatus.lastConnected && (
                      <Text as="p" tone="subdued" variant="bodySm">
                        {t("whatsapp.lastConnected")}: {new Date(whatsappStatus.lastConnected).toLocaleString()}
                      </Text>
                    )}
                  </div>
                </InlineStack>
                
                <InlineStack gap="100">
                  <Button onClick={testWhatsAppConnection} loading={testingConnection}>
                    {t("whatsapp.testConnection")}
                  </Button>
                  <Button tone="critical" onClick={disconnectWhatsApp}>
                    {t("whatsapp.disconnect")}
                  </Button>
                </InlineStack>
              </InlineStack>
            </div>
          )}
        </BlockStack>
      </Card>

      {/* Statistics */}
      {whatsappStatus.connected && (
        <div className="whatsapp-stats">
          <div className="whatsapp-stat-card">
            <div className="whatsapp-stat-value">{whatsappStatus.messagesSent}</div>
            <div className="whatsapp-stat-label">{t("whatsapp.stats.messagesSent")}</div>
          </div>
          <div className="whatsapp-stat-card">
            <div className="whatsapp-stat-value">{stats.successful}</div>
            <div className="whatsapp-stat-label">{t("whatsapp.stats.successful")}</div>
          </div>
          <div className="whatsapp-stat-card">
            <div className="whatsapp-stat-value">{whatsappStatus.recoveryRate}%</div>
            <div className="whatsapp-stat-label">{t("whatsapp.stats.recoveryRate")}</div>
          </div>
          <div className="whatsapp-stat-card">
            <div className="whatsapp-stat-value">{stats.avgResponseTime}s</div>
            <div className="whatsapp-stat-label">{t("whatsapp.stats.avgResponse")}</div>
          </div>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="whatsapp-config-grid">
        {/* After COD Order */}
        <div className="whatsapp-feature-card">
          <div className="whatsapp-feature-header">
            <div className="whatsapp-icon">✅</div>
            <div>
              <Text as="h3" variant="headingSm">{t("whatsapp.features.afterCOD.title")}</Text>
              <Text as="p" tone="subdued" variant="bodySm">{t("whatsapp.features.afterCOD.description")}</Text>
            </div>
          </div>
          
          <BlockStack gap="200">
            <Checkbox
              label={t("whatsapp.features.afterCOD.enable")}
              checked={whatsappConfig.enabled}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enabled: checked }))}
            />
            
            {whatsappConfig.enabled && (
              <>
                <TextField
                  label={t("whatsapp.features.afterCOD.buttonText")}
                  value={whatsappConfig.buttonText}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, buttonText: value }))}
                />
                
                <Select
                  label={t("whatsapp.features.afterCOD.position")}
                  value={whatsappConfig.buttonPosition}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, buttonPosition: value }))}
                  options={[
                    { label: t("whatsapp.positions.below"), value: "below" },
                    { label: t("whatsapp.positions.right"), value: "right" },
                    { label: t("whatsapp.positions.replace"), value: "replace" },
                  ]}
                />
                
                <Checkbox
                  label={t("whatsapp.features.afterCOD.autoSend")}
                  checked={whatsappConfig.sendAutomatically}
                  onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, sendAutomatically: checked }))}
                />
                
                {whatsappConfig.sendAutomatically && (
                  <Select
                    label={t("whatsapp.features.afterCOD.delay")}
                    value={whatsappConfig.sendDelay}
                    onChange={(value) => setWhatsappConfig(prev => ({ ...prev, sendDelay: value }))}
                    options={delayOptions}
                  />
                )}
              </>
            )}
          </BlockStack>
        </div>

        {/* Cart Recovery */}
        <div className="whatsapp-feature-card">
          <div className="whatsapp-feature-header">
            <div className="whatsapp-icon">🛒</div>
            <div>
              <Text as="h3" variant="headingSm">{t("whatsapp.features.recovery.title")}</Text>
              <Text as="p" tone="subdued" variant="bodySm">{t("whatsapp.features.recovery.description")}</Text>
            </div>
          </div>
          
          <BlockStack gap="200">
            <Checkbox
              label={t("whatsapp.features.recovery.enable")}
              checked={whatsappConfig.recoveryEnabled}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, recoveryEnabled: checked }))}
            />
            
            {whatsappConfig.recoveryEnabled && (
              <>
                <Select
                  label={t("whatsapp.features.recovery.delay")}
                  value={whatsappConfig.recoveryDelay}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, recoveryDelay: value }))}
                  options={delayOptions.slice(2)} // Skip immediate and 5min
                />
                
                <TextField
                  label={t("whatsapp.features.recovery.discount")}
                  value={whatsappConfig.recoveryDiscount}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, recoveryDiscount: value }))}
                />
                
                <TextField
                  label={t("whatsapp.features.recovery.code")}
                  value={whatsappConfig.recoveryCode}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, recoveryCode: value }))}
                />
              </>
            )}
          </BlockStack>
        </div>

        {/* Message Templates */}
        <div className="whatsapp-feature-card">
          <div className="whatsapp-feature-header">
            <div className="whatsapp-icon">💬</div>
            <div>
              <Text as="h3" variant="headingSm">{t("whatsapp.features.templates.title")}</Text>
              <Text as="p" tone="subdued" variant="bodySm">{t("whatsapp.features.templates.description")}</Text>
            </div>
          </div>
          
          <BlockStack gap="200">
            <TextField
              label={t("whatsapp.features.templates.orderMessage")}
              value={whatsappConfig.messageTemplate}
              onChange={(value) => setWhatsappConfig(prev => ({ ...prev, messageTemplate: value }))}
              multiline={3}
              autoComplete="off"
            />
            
            <TextField
              label={t("whatsapp.features.templates.recoveryMessage")}
              value={whatsappConfig.recoveryMessage}
              onChange={(value) => setWhatsappConfig(prev => ({ ...prev, recoveryMessage: value }))}
              multiline={3}
              autoComplete="off"
            />
            
            <div>
              <Text as="p" variant="bodySm" fontWeight="medium">
                {t("whatsapp.variables.available")}
              </Text>
              <div className="whatsapp-variables-grid">
                {availableVariables.map((variable) => (
                  <div
                    key={variable.code}
                    className="whatsapp-variable-tag"
                    onClick={() => insertVariable(variable.code)}
                    title={variable.label}
                  >
                    {variable.code}
                  </div>
                ))}
              </div>
            </div>
          </BlockStack>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="whatsapp-advanced-settings">
        <Text as="h3" variant="headingMd">{t("whatsapp.advanced.title")}</Text>
        <Text as="p" tone="subdued" variant="bodySm">{t("whatsapp.advanced.description")}</Text>
        
        <div className="whatsapp-config-grid" style={{ marginTop: 16 }}>
          <BlockStack gap="200">
            <Checkbox
              label={t("whatsapp.advanced.autoConnect")}
              checked={whatsappConfig.autoConnect}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, autoConnect: checked }))}
            />
            
            <Checkbox
              label={t("whatsapp.advanced.analytics")}
              checked={whatsappConfig.enableAnalytics}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enableAnalytics: checked }))}
            />
            
            <Checkbox
              label={t("whatsapp.advanced.readReceipts")}
              checked={whatsappConfig.enableReadReceipts}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enableReadReceipts: checked }))}
            />
          </BlockStack>
          
          <BlockStack gap="200">
            <Checkbox
              label={t("whatsapp.advanced.businessHours")}
              checked={whatsappConfig.businessHoursOnly}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, businessHoursOnly: checked }))}
            />
            
            {whatsappConfig.businessHoursOnly && (
              <InlineStack gap="200">
                <TextField
                  label={t("whatsapp.advanced.startTime")}
                  value={whatsappConfig.businessHoursStart}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, businessHoursStart: value }))}
                  type="time"
                />
                <TextField
                  label={t("whatsapp.advanced.endTime")}
                  value={whatsappConfig.businessHoursEnd}
                  onChange={(value) => setWhatsappConfig(prev => ({ ...prev, businessHoursEnd: value }))}
                  type="time"
                />
              </InlineStack>
            )}
            
            <RangeSlider
              label={t("whatsapp.advanced.maxRetries")}
              value={whatsappConfig.maxRetries}
              onChange={(value) => setWhatsappConfig(prev => ({ ...prev, maxRetries: value }))}
              min={1}
              max={10}
              output
            />
          </BlockStack>
          
          <BlockStack gap="200">
            <Checkbox
              label={t("whatsapp.advanced.mediaMessages")}
              checked={whatsappConfig.enableMediaMessages}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enableMediaMessages: checked }))}
            />
            
            {whatsappConfig.enableMediaMessages && (
              <TextField
                label={t("whatsapp.advanced.mediaUrl")}
                value={whatsappConfig.mediaUrl}
                onChange={(value) => setWhatsappConfig(prev => ({ ...prev, mediaUrl: value }))}
                placeholder="https://example.com/image.jpg"
              />
            )}
            
            <Checkbox
              label={t("whatsapp.advanced.buttons")}
              checked={whatsappConfig.enableButtons}
              onChange={(checked) => setWhatsappConfig(prev => ({ ...prev, enableButtons: checked }))}
            />
          </BlockStack>
        </div>
      </div>

      {/* Action Buttons */}
      <InlineStack gap="200" align="end" marginBlockStart="400">
        <Button onClick={sendTestMessage} disabled={!whatsappStatus.connected}>
          {t("whatsapp.sendTest")}
        </Button>
        <Button variant="primary" onClick={saveWhatsAppConfig}>
          {t("whatsapp.saveConfig")}
        </Button>
      </InlineStack>

      {/* Preview */}
      <Card marginBlockStart="400">
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">{t("whatsapp.preview.title")}</Text>
          
          <div className="whatsapp-template-preview">
            <Text as="p" variant="bodyMd">
              {whatsappConfig.messageTemplate
                .replace(/{orderId}/g, "1234")
                .replace(/{customerName}/g, "Jean Dupont")
                .replace(/{productName}/g, "iPhone 15 Pro")
                .replace(/{orderTotal}/g, "1 299,00 MAD")
                .replace(/{shopName}/g, "TechStore")
                .replace(/{deliveryDate}/g, "15 Mars 2024")
              }
            </Text>
            
            {whatsappConfig.enableButtons && (
              <InlineStack gap="200" marginBlockStart="200">
                <Button size="slim">{whatsappConfig.button1Text}</Button>
                <Button size="slim" variant="secondary">{whatsappConfig.button2Text}</Button>
              </InlineStack>
            )}
          </div>
          
          <Text as="p" tone="subdued" variant="bodySm">
            {t("whatsapp.preview.description")}
          </Text>
        </BlockStack>
      </Card>
    </div>
  );
}

export default function Section3Sheets() {
  const { t } = useI18n();
  useInjectCss();

  const [cfg, setCfg] = useState(defaultCfg);
  const [view, setView] = useState("sheets");

  const [dash, setDash] = useState({ points: [], latest: [], totals: null });
  const [dashLoading, setDashLoading] = useState(false);
  const [dashError, setDashError] = useState("");

  const periodDays = cfg.stats?.periodDays ?? 15;
  const codOnly = !!cfg.stats?.codOnly;

  const [billing, setBilling] = useState({
    loading: true,
    active: false,
    plan: null,
  });
  const [currentKey, setCurrentKey] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [planUsage, setPlanUsage] = useState({
    loading: true,
    ordersUsed: 0,
    sinceLabel: null,
  });

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
      id: 'orders',
      content: t('section3.sheetsTabs.orders'),
      accessibilityLabel: t('section3.sheetsTabs.orders'),
      panelID: 'orders-panel',
    },
    {
      id: 'abandoned',
      content: t('section3.sheetsTabs.abandoned'),
      accessibilityLabel: t('section3.sheetsTabs.abandoned'),
      panelID: 'abandoned-panel',
    },
  ];

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("Message reçu de la popup:", event.data);
      
      if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        console.log("Connexion Google réussie pour:", event.data.email);
        
        fetchGoogleStatus();
        loadGoogleSpreadsheets();
      }
      else if (event.data && event.data.type === 'GOOGLE_OAUTH_ERROR') {
        console.error("Erreur Google OAuth:", event.data.error);
        alert(t("section3.connection.testError", { error: event.data.error }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchGoogleStatus = async () => {
    try {
      const r = await fetch("/api/google/status", {
        credentials: "include",
      });
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
      setGoogleStatus(prev => ({ ...prev, loading: false }));
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
          setCfg(prev => ({
            ...prev,
            ...data.config
          }));
          
          if (data.config.sheet?.spreadsheetId) {
            loadSpreadsheetTabs(data.config.sheet.spreadsheetId);
          }
        }
      } else {
        console.error("Erreur /api/load-sheets:", data.error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sheets:", error);
    } finally {
      setLoadingSpreadsheets(false);
    }
  };

  const loadSpreadsheetTabs = async (spreadsheetId) => {
    if (!spreadsheetId) return;
    
    setLoadingTabs(true);
    try {
      const res = await fetch(`/api/google-sheets/tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`, {
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.ok && data.tabs) {
        setAvailableTabs(data.tabs);
        
        if (!cfg.sheet.tabName && data.tabs.length > 0) {
          setCfg(prev => ({
            ...prev,
            sheet: {
              ...prev.sheet,
              tabName: data.tabs[0].name
            }
          }));
        }
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
  }, []);

  async function loadDashboard() {
    setDashLoading(true);
    setDashError("");
    try {
      const res = await fetch(
        `/api/orders/dashboard?days=${periodDays}&codOnly=${codOnly ? "1" : "0"}`,
        { credentials: "include" }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "Erreur de chargement");
      }
      setDash({
        points: json.points || [],
        latest: json.latest || [],
        totals: json.totals || null,
      });
    } catch (e) {
      setDashError(e?.message || "Erreur inconnue");
    } finally {
      setDashLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [periodDays, codOnly]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/billing/guard", {
          credentials: "include",
        });
        const j = await r.json();
        const active = !!j.active;
        const plan = j.plan || null;
        setBilling({ loading: false, active, plan });
        const resolved = resolveCurrentPlan(plan);
        setCurrentKey(resolved.currentKey);
        setCurrentTerm(resolved.currentTerm);
      } catch (e) {
        console.error("billing.guard error", e);
        setBilling({ loading: false, active: false, plan: null });
        setCurrentKey(null);
        setCurrentTerm(null);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/plan-usage", {
          credentials: "include",
        });
        if (!r.ok) throw new Error("bad status");
        const j = await r.json();
        setPlanUsage({
          loading: false,
          ordersUsed: j.ordersUsed ?? 0,
          sinceLabel: j.sinceLabel ?? null,
        });
      } catch (e) {
        console.error("plan-usage error", e);
        setPlanUsage((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

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
      if (!res.ok || j?.ok === false) {
        throw new Error(j?.error || "Save failed");
      }
      alert(t("section3.save.success"));
    } catch (e) {
      alert(
        t("section3.save.error", {
          error: e?.message || t("section3.save.unknownError"),
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const startGoogleConnect = async (target) => {
    try {
      console.log("Début de la connexion Google pour target:", target);
      
      const response = await fetch(
        `/api/google/connect?target=${encodeURIComponent(target || "orders")}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresReauth) {
          alert("Votre session Shopify a expiré. Veuillez rafraîchir la page.");
          window.location.reload();
          return;
        }
        throw new Error(data.error || "Erreur lors de la connexion à Google");
      }

      if (!data.url) {
        throw new Error("URL Google OAuth non reçue");
      }

      console.log("URL Google OAuth reçue:", data.url);
      
      const popup = window.open(
        data.url,
        "Google OAuth",
        "width=600,height=700,menubar=no,toolbar=no,location=yes,status=no,scrollbars=yes,resizable=yes"
      );
      
      if (!popup) {
        alert(t("section3.connection.popupBlocked"));
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
      alert(t("section3.connection.error", { error: error.message }));
    }
  };

  const testSheetConnection = async (sheet, kind) => {
    setTesting(true);
    try {
      await fetchGoogleStatus();
      
      if (!googleStatus.connected) {
        alert(t("section3.connection.notConnected"));
        return;
      }

      const res = await fetch("/api/google-sheets/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sheet, kind }),
      });
      const j = await res.json();
      if (j.ok) {
        alert(t("section3.sheetsConfiguration.testSuccess"));
      } else {
        alert(t("section3.sheetsConfiguration.testError", { error: j.error }));
      }
    } catch (e) {
      alert(t("section3.sheetsConfiguration.testError", { error: e.message }));
    } finally {
      setTesting(false);
    }
  };

  const openSheet = (spreadsheetId) => {
    if (spreadsheetId) {
      window.open(
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        "_blank"
      );
    } else {
      alert(t("section3.sheetsConfiguration.noSpreadsheetId"));
    }
  };

  const disconnectGoogle = async () => {
    if (confirm(t("section3.sheetsConfiguration.disconnectConfirm"))) {
      try {
        await fetch("/api/google/disconnect", {
          method: "POST",
          credentials: "include"
        });
        
        setGoogleStatus({
          loading: false,
          connected: false,
          accountEmail: null,
          mainSheetName: null,
          abandonedSheetName: null
        });
        
        setGoogleSpreadsheets([]);
        setAvailableTabs([]);
        
        alert(t("section3.sheetsConfiguration.disconnected"));
      } catch (error) {
        alert(t("section3.sheetsConfiguration.disconnectError", { error: error.message }));
      }
    }
  };

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

  const scrollLeft = () =>
    getBoard()?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
  const scrollRight = () =>
    getBoard()?.scrollBy({ left: +SCROLL_STEP, behavior: "smooth" });

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
  }, [boardRef.current, cfg.columns.length]);

  const nextIdx = () =>
    Math.max(0, ...cfg.columns.map((c) => c.idx || 0)) + 1;

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
        columns: c.columns.map((col) =>
          col.id === id ? { ...col, ...patch } : col
        ),
      }));
    });
  };

  const removeCol = (id) => {
    keepScroll(() => {
      setCfg((c) => ({
        ...c,
        columns:
          c.columns.length > 1
            ? c.columns.filter((x) => x.id !== id)
            : c.columns,
      }));
    });
  };

  const swapWith = (idxDelta, colId) => {
    keepScroll(() => {
      setCfg((c) => {
        const order = [...c.columns].sort(
          (a, b) => (a.idx || 0) - (b.idx || 0)
        );
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

  const sortedCols = [...cfg.columns].sort(
    (a, b) => (a.idx || 0) - (b.idx || 0)
  );

  const sortedAbandonedCols = [...(cfg.columnsAbandoned || [])].sort(
    (a, b) => (a.idx || 0) - (b.idx || 0)
  );

  const nextIdxAbandoned = (cols) =>
    Math.max(0, ...(cols || []).map((c) => c.idx || 0)) + 1;

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
      columnsAbandoned: (c.columnsAbandoned || []).map((col) =>
        col.id === id ? { ...col, ...patch } : col
      ),
    }));
  };

  const removeAbandonedCol = (id) => {
    setCfg((c) => {
      const cols = c.columnsAbandoned || [];
      return {
        ...c,
        columnsAbandoned:
          cols.length > 1 ? cols.filter((x) => x.id !== id) : cols,
      };
    });
  };

  const swapAbandonedWith = (idxDelta, colId) => {
    setCfg((c) => {
      const cols = [...(c.columnsAbandoned || [])].sort(
        (a, b) => (a.idx || 0) - (b.idx || 0)
      );
      const i = cols.findIndex((x) => x.id === colId);
      const j = i + idxDelta;
      if (i < 0 || j < 0 || j >= cols.length) return c;
      const tmp = cols[i].idx;
      cols[i].idx = cols[j].idx;
      cols[j].idx = tmp;
      return { ...c, columnsAbandoned: cols };
    });
  };

  const panels = [
    {
      key: "sheets",
      label: t("section3.rail.panels.sheets"),
    },
    {
      key: "abandons",
      label: t("section3.rail.panels.abandons"),
    },
    {
      key: "realtime",
      label: t("section3.rail.panels.realtime"),
    },
    {
      key: "whatsapp",
      label: t("section3.rail.panels.whatsapp"),
    },
  ];

  const totalOrders = dash.totals?.count || 0;
  const totalAmountCents = dash.totals?.totalCents || 0;
  const totalCurrency =
    dash.totals?.currency || cfg.formats.currency || "MAD";

  const formatMoney = (cents) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: totalCurrency,
    }).format((cents || 0) / 100);

  const isSubscribed = billing.active;

  return (
    <PageShell onSave={handleSaveRemote} saving={saving}>
      <div className="tf-editor">
        <div className="tf-rail">
          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section3.rail.panelsTitle")}
            </div>
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

          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section3.rail.previewOrders")}
            </div>
            <div style={{ padding: 10, overflowX: "auto" }}>
              <table className="table-mini">
                <thead>
                  <tr>
                    {sortedCols.map((c) => (
                      <th key={c.id} style={{ minWidth: c.width || 160 }}>
                        {t(c.header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {sortedCols.map((c) => (
                      <td key={c.id} style={{ minWidth: c.width || 160 }}>
                        <em style={{ color: "#6B7280" }}>{c.appField}</em>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section3.rail.previewAbandons")}
            </div>
            <div style={{ padding: 10, overflowX: "auto" }}>
              {sortedAbandonedCols.length ? (
                <table className="table-mini">
                  <thead>
                    <tr>
                      {sortedAbandonedCols.map((c) => (
                        <th key={c.id} style={{ minWidth: c.width || 160 }}>
                          {t(c.header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {sortedAbandonedCols.map((c) => (
                        <td key={c.id} style={{ minWidth: c.width || 160 }}>
                          <em style={{ color: "#6B7280" }}>{c.appField}</em>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <Text tone="subdued" as="p">
                  {t("section3.rail.noAbandonedColumns")}
                </Text>
              )}
            </div>
          </div>

          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section3.rail.filtersTitle")}
            </div>
            <div style={{ padding: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  marginBottom: 10,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                }}
              >
                <strong>{t("section3.rail.stats.period")}</strong>{" "}
                {periodDays} {t("section3.rail.stats.days")}{" "}
                {codOnly
                  ? t("section3.rail.stats.codOnly")
                  : t("section3.rail.stats.allOrders")}{" "}
                · <strong>{t("section3.rail.stats.orders")}</strong>{" "}
                {totalOrders} ·{" "}
                <strong>{t("section3.rail.stats.total")}</strong>{" "}
                {formatMoney(totalAmountCents)}
              </div>

              <BlockStack gap="150">
                <Select
                  label={t("section3.rail.filters.period")}
                  value={String(periodDays)}
                  onChange={(v) =>
                    setCfg((c) => ({
                      ...c,
                      stats: {
                        ...c.stats,
                        periodDays: Number(v || 15),
                      },
                    }))
                  }
                  options={[
                    {
                      label: t(
                        "section3.rail.filters.periodOptions.7days"
                      ),
                      value: "7",
                    },
                    {
                      label: t(
                        "section3.rail.filters.periodOptions.15days"
                      ),
                      value: "15",
                    },
                    {
                      label: t(
                        "section3.rail.filters.periodOptions.30days"
                      ),
                      value: "30",
                    },
                    {
                      label: t(
                        "section3.rail.filters.periodOptions.60days"
                      ),
                      value: "60",
                    },
                  ]}
                />
                <Checkbox
                  label={t("section3.rail.filters.codOnly")}
                  checked={codOnly}
                  onChange={(v) =>
                    setCfg((c) => ({
                      ...c,
                      stats: { ...c.stats, codOnly: v },
                    }))
                  }
                />
                <Text tone="subdued" as="p">
                  {t("section3.rail.filters.description")}
                </Text>
              </BlockStack>
            </div>
          </div>
        </div>

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
                              {t("section3.connection.accountConnected")}{" "}
                              <b>{googleStatus.accountEmail}</b>
                            </Text>
                            <Text tone="subdued" as="p">
                              {t("section3.connection.mainSheet")}{" "}
                              <b>
                                {googleStatus.mainSheetName ||
                                  cfg.sheet.tabName ||
                                  t("section3.connection.notDefined")}
                              </b>
                              {cfg.sheet.spreadsheetId
                                ? ` · ${t("section3.connection.id")}: ${cfg.sheet.spreadsheetId}`
                                : ""}
                            </Text>
                            <Text tone="subdued" as="p">
                              {t("section3.connection.revocable")}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text as="p">
                              {t("section3.connection.description")}
                            </Text>
                            <Text tone="subdued" as="p">
                              {t("section3.connection.authorization")}
                            </Text>
                          </>
                        )}

                        <InlineStack gap="200">
                          <Button
                            variant="primary"
                            onClick={() => startGoogleConnect("orders")}
                          >
                            <InlineStack
                              gap="100"
                              blockAlign="center"
                            >
                              <GoogleIcon />
                              <span>
                                {googleStatus.connected
                                  ? t("section3.connection.changeSheet")
                                  : t("section3.connection.connect")}
                              </span>
                            </InlineStack>
                          </Button>

                          {googleStatus.connected && (
                            <>
                              <Button
                                onClick={fetchGoogleStatus}
                                disabled={googleStatus.loading}
                              >
                                {t("section3.connection.refresh")}
                              </Button>
                              <Button
                                tone="critical"
                                onClick={disconnectGoogle}
                              >
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
                  <Tabs
                    tabs={sheetTabs}
                    selected={sheetTab}
                    onSelect={setSheetTab}
                  >
                    {sheetTab === 0 && (
                      <div style={{ marginTop: '16px' }}>
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
                      <div style={{ marginTop: '16px' }}>
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
                      placeholder={t(
                        "section3.mapping.selectPlaceholder"
                      )}
                      options={APP_FIELDS.map((f) => ({
                        label: t(f.label),
                        value: f.value,
                      }))}
                      value=""
                      onChange={(v) => quickAdd(v)}
                    />
                    <Button onClick={() => quickAdd("customer.name")}>
                      {t("section3.mapping.exampleName")}
                    </Button>
                  </InlineStack>
                  <Text tone="subdued" as="p">
                    {t("section3.mapping.description")}
                  </Text>

                  <div
                    className="tf-group-title"
                    style={{ marginTop: 8, marginBottom: 6 }}
                  >
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
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <InlineStack
                              gap="150"
                              blockAlign="center"
                            >
                              <Badge>
                                {t("section3.mapping.column")}{" "}
                                {i + 1}
                              </Badge>
                              <span className="pill">
                                {col.type}
                              </span>
                              <Badge tone="subdued">
                                w: {col.width || 180}px
                              </Badge>
                            </InlineStack>
                            <InlineStack gap="100">
                              <Button
                                size="slim"
                                onClick={() =>
                                  swapWith(-1, col.id)
                                }
                              >
                                ←
                              </Button>
                              <Button
                                size="slim"
                                onClick={() =>
                                  swapWith(+1, col.id)
                                }
                              >
                                →
                              </Button>
                              <Button
                                tone="critical"
                                size="slim"
                                onClick={() =>
                                  removeCol(col.id)
                                }
                              >
                                {t("section3.mapping.delete")}
                              </Button>
                            </InlineStack>
                          </InlineStack>

                          <div style={{ height: 8 }} />

                          <Select
                            label={t(
                              "section3.mapping.fieldForColumn",
                              { number: i + 1 }
                            )}
                            options={APP_FIELDS.map((f) => ({
                              label: t(f.label),
                              value: f.value,
                            }))}
                            value={col.appField}
                            onChange={(v) => {
                              const tType = inferType(v);
                              patchCol(col.id, {
                                appField: v,
                                type: tType,
                                header: labelFromValue(v, t),
                                width:
                                  tType === "datetime"
                                    ? 220
                                    : tType ===
                                      "currency"
                                    ? 160
                                    : 180,
                                asLink:
                                  tType === "link"
                                    ? true
                                    : col.asLink,
                              });
                            }}
                          />

                          {(col.type === "link" || col.asLink) && (
                            <>
                              <Checkbox
                                label={t(
                                  "section3.mapping.asLink"
                                )}
                                checked={!!col.asLink}
                                onChange={(v) =>
                                  patchCol(col.id, {
                                    asLink: v,
                                  })
                                }
                              />
                              <TextField
                                label={t(
                                  "section3.mapping.linkTemplate"
                                )}
                                helpText={t(
                                  "section3.mapping.linkExample"
                                )}
                                value={
                                  col.linkTemplate ||
                                  "{value}"
                                }
                                onChange={(v) =>
                                  patchCol(col.id, {
                                    linkTemplate: v,
                                  })
                                }
                              />
                            </>
                          )}

                          <RangeSlider
                            label={`${t(
                              "section3.mapping.width"
                            )} (${col.width || 180}px)`}
                            min={140}
                            max={420}
                            output
                            value={col.width || 180}
                            onChange={(v) =>
                              patchCol(col.id, {
                                width: v,
                              })
                            }
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
                      onChange={(v) =>
                        setCfg((c) => ({
                          ...c,
                          display: { ...c.display, mode: v },
                        }))
                      }
                      options={[
                        {
                          label: t("section3.display.options.none"),
                          value: "none",
                        },
                        {
                          label: t("section3.display.options.link"),
                          value: "link",
                        },
                        {
                          label: t(
                            "section3.display.options.embedTop"
                          ),
                          value: "embed_top",
                        },
                        {
                          label: t(
                            "section3.display.options.embedBottom"
                          ),
                          value: "embed_bottom",
                        },
                      ]}
                    />
                    <RangeSlider
                      label={`${t(
                        "section3.display.height"
                      )} (${cfg.display.height}px)`}
                      min={260}
                      max={1000}
                      output
                      value={cfg.display.height}
                      onChange={(v) =>
                        setCfg((c) => ({
                          ...c,
                          display: { ...c.display, height: v },
                        }))
                      }
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
                              {t(
                                "section3.connection.accountConnected"
                              )}{" "}
                              <b>{googleStatus.accountEmail}</b>
                            </Text>
                            <Text tone="subdued" as="p">
                              {t(
                                "section3.abandoned.selectedSheet"
                              )}{" "}
                              <b>
                                {googleStatus.abandonedSheetName ||
                                  cfg.abandonedSheet
                                    .tabName ||
                                  t(
                                    "section3.connection.notDefined"
                                  )}
                              </b>
                              {cfg.abandonedSheet
                                .spreadsheetId
                                ? ` · ${t(
                                    "section3.connection.id"
                                  )}: ${cfg.abandonedSheet.spreadsheetId}`
                                : ""}
                            </Text>
                            <Text tone="subdued" as="p">
                              {t("section3.abandoned.description")}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text as="p">
                              {t(
                                "section3.abandoned.useSecondSheet"
                              )}
                            </Text>
                            <Text tone="subdued" as="p">
                              {t(
                                "section3.abandoned.whenAbandoned"
                              )}
                            </Text>
                          </>
                        )}

                        <InlineStack gap="200">
                          <Button
                            variant="primary"
                            onClick={() =>
                              startGoogleConnect("abandons")
                            }
                          >
                            <InlineStack
                              gap="100"
                              blockAlign="center"
                            >
                              <GoogleIcon />
                              <span>
                                {googleStatus.connected
                                  ? t("section3.abandoned.changeSheet")
                                  : t("section3.connection.connect")}
                              </span>
                            </InlineStack>
                          </Button>

                          {googleStatus.connected && (
                            <>
                              <Button
                                onClick={fetchGoogleStatus}
                                disabled={googleStatus.loading}
                              >
                                {t("section3.connection.refresh")}
                              </Button>
                              <Button
                                tone="critical"
                                onClick={disconnectGoogle}
                              >
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
                      placeholder={t(
                        "section3.mapping.selectPlaceholder"
                      )}
                      options={APP_FIELDS.map((f) => ({
                        label: t(f.label),
                        value: f.value,
                      }))}
                      value=""
                      onChange={(v) => quickAddAbandoned(v)}
                    />
                    <Button
                      onClick={() =>
                        quickAddAbandoned("customer.phone")
                      }
                    >
                      {t("section3.abandoned.examplePhone")}
                    </Button>
                  </InlineStack>
                  <Text tone="subdued" as="p">
                    {t("section3.abandoned.mappingDescription")}
                  </Text>

                  <div
                    className="tf-group-title"
                    style={{ marginTop: 8, marginBottom: 6 }}
                  >
                    {t("section3.mapping.configuredColumns")}
                  </div>

                  <div className="col-board-wrap">
                    <div className="edge-left" />
                    <div className="edge-right" />

                    <div className="col-board">
                      {sortedAbandonedCols.map((col, i) => (
                        <div key={col.id} className="col-card">
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <InlineStack
                              gap="150"
                              blockAlign="center"
                            >
                              <Badge>
                                {t("section3.abandoned.abandonedColumn")}{" "}
                                {i + 1}
                              </Badge>
                              <span className="pill">
                                {col.type}
                              </span>
                              <Badge tone="subdued">
                                w: {col.width || 180}px
                              </Badge>
                            </InlineStack>
                            <InlineStack gap="100">
                              <Button
                                size="slim"
                                onClick={() =>
                                  swapAbandonedWith(-1, col.id)
                                }
                              >
                                ←
                              </Button>
                              <Button
                                size="slim"
                                onClick={() =>
                                  swapAbandonedWith(+1, col.id)
                                }
                              >
                                →
                              </Button>
                              <Button
                                tone="critical"
                                size="slim"
                                onClick={() =>
                                  removeAbandonedCol(col.id)
                                }
                              >
                                {t("section3.mapping.delete")}
                              </Button>
                            </InlineStack>
                          </InlineStack>

                          <div style={{ height: 8 }} />

                          <Select
                            label={t(
                              "section3.mapping.fieldForColumn",
                              { number: i + 1 }
                            )}
                            options={APP_FIELDS.map((f) => ({
                              label: t(f.label),
                              value: f.value,
                            }))}
                            value={col.appField}
                            onChange={(v) => {
                              const tType = inferType(v);
                              patchAbandonedCol(col.id, {
                                appField: v,
                                type: tType,
                                header: labelFromValue(v, t),
                                width:
                                  tType === "datetime"
                                    ? 220
                                    : tType === "currency"
                                    ? 160
                                    : 180,
                                asLink:
                                  tType === "link"
                                    ? true
                                    : col.asLink,
                              });
                            }}
                          />

                          {(col.type === "link" || col.asLink) && (
                            <>
                              <Checkbox
                                label={t("section3.mapping.asLink")}
                                checked={!!col.asLink}
                                onChange={(v) =>
                                  patchAbandonedCol(col.id, {
                                    asLink: v,
                                  })
                                }
                              />
                              <TextField
                                label={t("section3.mapping.linkTemplate")}
                                helpText={t("section3.mapping.linkExample")}
                                value={col.linkTemplate || "{value}"}
                                onChange={(v) =>
                                  patchAbandonedCol(col.id, {
                                    linkTemplate: v,
                                  })
                                }
                              />
                            </>
                          )}

                          <RangeSlider
                            label={`${t("section3.mapping.width")} (${col.width || 180}px)`}
                            min={140}
                            max={420}
                            output
                            value={col.width || 180}
                            onChange={(v) =>
                              patchAbandonedCol(col.id, {
                                width: v,
                              })
                            }
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
              <div className="tf-group-title">
                {t("section3.realtime.title")}
              </div>
              <BlockStack gap="200">
                {dashLoading && (
                  <Text>{t("section3.realtime.loading")}</Text>
                )}
                {dashError && (
                  <Text tone="critical">
                    {t("section3.realtime.error", {
                      error:
                        dashError ||
                        t("section3.realtime.unknownError"),
                    })}
                  </Text>
                )}
                {!dashLoading && !dashError && (
                  <>
                    {dash.latest && dash.latest.length ? (
                      <div style={{ overflowX: "auto" }}>
                        <table className="tf-orders-table">
                          <thead>
                            <tr>
                              <th style={{ width: 80 }}>
                                {t("section3.preview.columnHeaders.date")}
                              </th>
                              <th style={{ width: 90 }}>
                                {t("section3.preview.columnHeaders.orderId")}
                              </th>
                              <th style={{ width: 160 }}>
                                {t("section3.preview.columnHeaders.customer")}
                              </th>
                              <th style={{ width: 130 }}>
                                {t("section3.preview.columnHeaders.phone")}
                              </th>
                              <th style={{ width: 130 }}>
                                {t("section3.preview.columnHeaders.city")}
                              </th>
                              <th style={{ width: 220 }}>
                                {t("section3.preview.columnHeaders.product")}
                              </th>
                              <th style={{ width: 110 }}>
                                {t("section3.preview.columnHeaders.total")}
                              </th>
                              <th style={{ width: 70 }}>
                                {t("section3.preview.columnHeaders.country")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {dash.latest.map((o) => (
                              <tr key={o.id}>
                                <td>{o.dateLabel}</td>
                                <td>{o.name || o.shortId}</td>
                                <td>
                                  {o.customerName ||
                                    t("section3.preview.empty")}
                                </td>
                                <td>
                                  {o.customerPhone ||
                                    t("section3.preview.empty")}
                                </td>
                                <td>
                                  {o.city ||
                                    t("section3.preview.empty")}
                                </td>
                                <td>
                                  {o.productTitle ||
                                    t("section3.preview.empty")}
                                </td>
                                <td>
                                  {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency:
                                      o.currency || "MAD",
                                  }).format(
                                    (o.totalCents || 0) / 100
                                  )}
                                </td>
                                <td>
                                  {o.country ||
                                    t("section3.preview.empty")}
                                </td>
                              </tr>
                            ))}

                            {!dash.latest.length && (
                              <tr>
                                <td
                                  colSpan={8}
                                  style={{ textAlign: "center" }}
                                >
                                  <Text tone="subdued" as="span">
                                    {t("section3.realtime.noOrders")}
                                  </Text>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Text tone="subdued">
                        {t("section3.realtime.noOrders")}
                      </Text>
                    )}
                  </>
                )}
              </BlockStack>
            </div>
          )}

          {view === "whatsapp" && (
            <div className="tf-panel">
              <WhatsAppConfigSection />
            </div>
          )}
        </div>

        <div className="tf-side-col">
          <div className="tf-side-card">
            <Text as="h3" variant="headingSm">
              {t("section3.guide.title")}
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}
            >
              <ul
                style={{
                  paddingLeft: "1.2rem",
                  margin: 0,
                }}
              >
                <li>
                  <b>{t("section3.guide.panelSheets")}</b> :{" "}
                  {t("section3.guide.panelSheetsDesc")}
                </li>
                <li>
                  <b>{t("section3.guide.panelAbandons")}</b> :{" "}
                  {t("section3.guide.panelAbandonsDesc")}
                </li>
                <li>
                  <b>{t("section3.guide.panelRealtime")}</b> :{" "}
                  {t("section3.guide.panelRealtimeDesc")}
                </li>
                <li>
                  <b>{t("section3.guide.panelWhatsapp")}</b> :{" "}
                  {t("section3.guide.panelWhatsappDesc")}
                </li>
              </ul>
            </BlockStack>
          </div>

          <PlanUsageWidget
            isSubscribed={isSubscribed}
            planKey={currentKey}
            currentTerm={currentTerm}
            usage={planUsage}
          />
        </div>
      </div>
    </PageShell>
  );
}