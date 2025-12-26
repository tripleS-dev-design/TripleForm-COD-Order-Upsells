// ===== File: app/sections/Section2Offers.jsx =====
import React, { useEffect, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Checkbox,
  RangeSlider,
  Button,
  Icon,
  Badge,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
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

  /* HEADER — même style que Section1FormsLayout */
  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:12px 16px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }

  .tf-shell {
    padding:16px;
  }

  /* Carte info sous le header (Offres & Cadeaux) */
  .tf-hero {
    background:#FFFFFF;
    border-radius:12px;
    padding:12px 16px;
    color:#0F172A;
    margin-bottom:16px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.06);
  }
  .tf-hero-badge {
    font-size:11px;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:.08em;
    padding:3px 8px;
    border-radius:999px;
    background:#EEF2FF;
    border:1px solid #C7D2FE;
    color:#1E3A8A;
  }

  .tf-editor {
    display:grid;
    grid-template-columns: 240px minmax(0,2fr) minmax(0,1.2fr);
    gap:16px;
    align-items:flex-start;
  }

  .tf-rail {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-rail-card {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    box-shadow:0 16px 30px rgba(15,23,42,0.04);
  }
  .tf-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
    font-size:13px;
    background:#F9FAFB;
  }
  .tf-rail-list {
    padding:8px;
    display:grid;
    gap:8px;
  }
  .tf-rail-item {
    display:grid;
    grid-template-columns:26px 1fr;
    align-items:center;
    gap:8px;
    background:#F9FAFB;
    border:1px solid #E5E7EB;
    border-radius:8px;
    padding:8px 10px;
    cursor:pointer;
    font-size:13px;
    transition:all 0.15s ease;
  }
  .tf-rail-item[data-sel="1"] {
    background:#EEF2FF;
    border-color:#4F46E5;
    box-shadow:0 4px 12px rgba(79,70,229,.2);
    transform:translateX(2px);
  }
  .tf-grip {
    opacity:.7;
    user-select:none;
    display:grid;
    place-items:center;
  }

  .tf-right-col {
    display:grid;
    gap:16px;
  }
  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:16px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
  }

  .tf-preview-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-preview-card {
    background:#FFFFFF;
    border-radius:12px;
    padding:16px;
    box-shadow:0 12px 32px rgba(15,23,42,0.08);
    border:1px solid #E5E7EB;
  }

  /* >>> GRANDS TITRES des sections <<< */
  .tf-group-title {
    padding:10px 14px;
    background:linear-gradient(90deg,#1E40AF,#7C2D12);
    color:#F9FAFB;
    border-radius:8px;
    font-weight:700;
    letter-spacing:.02em;
    margin-bottom:16px;
    font-size:13px;
    box-shadow:0 4px 12px rgba(30,64,175,0.15);
  }

  /* ---- Offer item cards ---- */
  .offer-item-card {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:16px;
    margin-bottom:16px;
    position:relative;
  }
  .offer-item-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:16px;
    padding-bottom:12px;
    border-bottom:1px solid #F3F4F6;
  }
  .offer-item-number {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:28px;
    height:28px;
    border-radius:50%;
    background:#4F46E5;
    color:white;
    font-weight:600;
    font-size:12px;
    margin-right:10px;
  }
  .remove-offer-btn {
    position:absolute;
    top:12px;
    right:12px;
    background:#FEF2F2;
    border:1px solid #FECACA;
    color:#DC2626;
    width:24px;
    height:24px;
    border-radius:6px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:12px;
    transition:all 0.2s;
  }
  .remove-offer-btn:hover {
    background:#FEE2E2;
    transform:scale(1.05);
  }

  /* ---- Preview OFFERS / UPSELL ---- */
  .offers-strip {
    display:grid;
    grid-template-columns:60px minmax(0,1fr);
    gap:12px;
    align-items:center;
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:12px;
    margin-bottom:10px;
    box-shadow:0 4px 12px rgba(0,0,0,0.04);
  }
  .offers-strip-thumb {
    width:56px;
    height:56px;
    border-radius:12px;
    overflow:hidden;
    border:1px solid #E5E7EB;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .offers-strip-thumb-inner {
    width:100%;
    height:100%;
    border-radius:12px;
    background:linear-gradient(135deg,#3B82F6 0%,#8B5CF6 100%);
  }
  .offers-strip-thumb-inner-upsell {
    width:100%;
    height:100%;
    border-radius:12px;
    background:linear-gradient(135deg,#EC4899 0%,#F59E0B 100%);
  }
  .offers-strip-thumb img {
    width:100%;
    height:100%;
    object-fit:cover;
    border-radius:12px;
  }
  .offers-strip-title {
    font-size:11px;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:.08em;
    color:#6B7280;
    display:flex;
    align-items:center;
    gap:6px;
    margin-bottom:4px;
  }
  .offers-strip-icon {
    width:20px;
    height:20px;
    border-radius:999px;
    background:#F3F4F6;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:12px;
  }
  .offers-strip-main {
    font-size:14px;
    font-weight:600;
    color:#111827;
    margin-bottom:2px;
  }
  .offers-strip-desc {
    font-size:12px;
    color:#6B7280;
    line-height:1.4;
  }

  /* ---- Icons palette ---- */
  .icons-palette {
    display:grid;
    grid-template-columns:repeat(6, 1fr);
    gap:8px;
    margin-top:8px;
  }
  .icon-item {
    width:32px;
    height:32px;
    border-radius:8px;
    background:#F9FAFB;
    border:1px solid #E5E7EB;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    transition:all 0.2s;
    font-size:16px;
  }
  .icon-item:hover {
    background:#EFF6FF;
    border-color:#3B82F6;
    transform:translateY(-2px);
  }
  .icon-item.selected {
    background:#DBEAFE;
    border-color:#2563EB;
    box-shadow:0 4px 12px rgba(37,99,235,0.15);
  }

  /* ---- Add button ---- */
  .add-button {
    width:100%;
    padding:12px;
    background:#F9FAFB;
    border:2px dashed #D1D5DB;
    border-radius:10px;
    color:#6B7280;
    font-size:13px;
    font-weight:500;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    cursor:pointer;
    transition:all 0.2s;
    margin-top:8px;
  }
  .add-button:hover {
    background:#F3F4F6;
    border-color:#9CA3AF;
    color:#4B5563;
  }

  /* ---- Preview Order summary ---- */
  .order-summary-preview {
    background:#F9FAFB;
    border-radius:10px;
    padding:16px;
    margin-top:16px;
    border:1px solid #E5E7EB;
  }
  .order-summary-title {
    font-size:13px;
    font-weight:600;
    color:#111827;
    margin-bottom:12px;
  }
  .order-row {
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px 0;
    border-bottom:1px solid #E5E7EB;
    font-size:13px;
  }
  .order-row:last-child {
    border-bottom:none;
    font-weight:600;
    color:#111827;
  }
  .order-label {
    color:#6B7280;
  }

  @media (max-width: 1040px) {
    .tf-editor { grid-template-columns:1fr; }
    .tf-rail,
    .tf-preview-col {
      position:static;
      max-height:none;
    }
  }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-layout-css-offers")) return;
    const t = document.createElement("style");
    t.id = "tf-layout-css-offers";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return () => {
      try {
        t.remove();
      } catch {}
    };
  }, []);
}

/* ============================== Fonction pour obtenir la devise selon le pays ============================== */
const getCurrencyByCountry = (countryCode) => {
  const map = {
    'MA': 'MAD',
    'DZ': 'DZD',
    'TN': 'TND',
    'EG': 'EGP',
    'FR': 'EUR',
    'ES': 'EUR',
    'SA': 'SAR',
    'AE': 'AED',
    'US': 'USD',
    'NG': 'NGN',
    'PK': 'PKR',
    'IN': 'INR',
    'ID': 'IDR',
    'TR': 'TRY',
    'BR': 'BRL',
  };
  return map[countryCode] || 'MAD';
};

/* ============================== Fonction pour obtenir les paramètres de design depuis Section1Forms ============================== */
const loadFormsConfig = () => {
  if (typeof window === "undefined") return null;
  
  try {
    // Essayer de charger depuis localStorage
    const formsConfigStr = localStorage.getItem("tripleform_cod_config");
    if (formsConfigStr) {
      const formsConfig = JSON.parse(formsConfigStr);
      return formsConfig;
    }
    
    // Essayer de charger via API
    // Note: Nous allons charger via API dans useEffect
    return null;
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration des forms:", error);
    return null;
  }
};

/* ============================== Small UI helpers ============================== */

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
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

/* ============================== Icons Palette ============================== */

const ICONS_PALETTE = [
  "🔥", "🎁", "✨", "⭐", "💎", "👑",
  "🏆", "💝", "💯", "✅", "🛒", "💰",
  "📦", "🚚", "⚡", "❤️", "👍", "👌",
  "🏷️", "🎯", "🆓", "🔝", "🥇", "🎊"
];

function IconsPalette({ selected, onSelect }) {
  return (
    <div className="icons-palette">
      {ICONS_PALETTE.map((icon, idx) => (
        <div
          key={idx}
          className={`icon-item ${selected === icon ? 'selected' : ''}`}
          onClick={() => onSelect(icon)}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

/* ============================== DEFAULTS ============================== */

const DEFAULT_OFFER = {
  enabled: true,
  type: "percent", // "percent" or "fixed"
  value: 10, // percent or fixed amount
  title: "",
  description: "",
  
  // Conditions
  minQuantity: 2,
  minSubtotal: 0,
  requiresCode: false,
  code: "",
  maxDiscount: 0, // 0 = unlimited
  
  // Product selection
  shopifyProductId: "",
  productRef: "",
  imageUrl: "",
  icon: "🔥",
  
  // Display
  showInPreview: true
};

const DEFAULT_UPSELL = {
  enabled: true,
  title: "",
  description: "",
  
  // Trigger conditions
  triggerType: "subtotal", // "subtotal" or "product"
  minSubtotal: 30,
  productHandle: "",
  
  // Gift details
  giftTitle: "Free Gift",
  giftNote: "Special offer",
  originalPrice: 9.99,
  isFree: true,
  
  // Product selection
  shopifyProductId: "",
  productRef: "",
  imageUrl: "",
  icon: "🎁",
  
  // Display
  showInPreview: true
};

const DEFAULT_CFG = {
  meta: { version: 8 },
  global: { 
    enabled: true, 
    currency: "", // Vide par défaut, sera rempli avec la devise du pays
    rounding: "none" 
  },
  
  // Multiple offers support (max 3)
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  
  // Multiple upsells support (max 3)
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
  
  // Display settings
  display: {
    showOrderSummary: true,
    showOffersSection: true
  }
};

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };
  
  // Ensure arrays exist
  x.offers = Array.isArray(x.offers) ? x.offers : [DEFAULT_OFFER];
  x.upsells = Array.isArray(x.upsells) ? x.upsells : [DEFAULT_UPSELL];
  
  // Limit to 3 items each
  x.offers = x.offers.slice(0, 3);
  x.upsells = x.upsells.slice(0, 3);
  
  // Merge with defaults for each item
  x.offers = x.offers.map(offer => ({ ...DEFAULT_OFFER, ...offer }));
  x.upsells = x.upsells.map(upsell => ({ ...DEFAULT_UPSELL, ...upsell }));
  
  return x;
}

/* ============================== Preview Components ============================== */

function findProductLabel(products, id) {
  if (!id) return "";
  const p = products.find(prod => String(prod.id) === String(id));
  return p?.title || "";
}

function OffersPreview({ cfg, products, t, formsDesign }) {
  const activeOffers = cfg.offers.filter(offer => offer.enabled && offer.showInPreview);
  
  if (activeOffers.length === 0) return null;
  
  return (
    <BlockStack gap="200">
      {activeOffers.map((offer, idx) => {
        const productName = offer.title || findProductLabel(products, offer.shopifyProductId) || 
                          t("section2.preview.defaultOfferTitle");
        const description = offer.description || 
                          (offer.type === "percent" 
                            ? t("section2.preview.discountPercent", { percent: offer.value })
                            : t("section2.preview.discountFixed", { amount: offer.value, currency: cfg.global.currency }));
        
        return (
          <div 
            key={idx} 
            className="offers-strip"
            style={{
              background: formsDesign?.bg || "#FFFFFF",
              border: `1px solid ${formsDesign?.border || "#E5E7EB"}`,
              color: formsDesign?.text || "#111827"
            }}
          >
            <div className="offers-strip-thumb">
              {offer.imageUrl ? (
                <img src={offer.imageUrl} alt={productName} />
              ) : (
                <div className="offers-strip-thumb-inner" />
              )}
            </div>
            <div>
              <div 
                className="offers-strip-title"
                style={{ color: formsDesign?.placeholder || "#6B7280" }}
              >
                <span 
                  className="offers-strip-icon"
                  style={{ 
                    background: formsDesign?.cartRowBg || "#F3F4F6",
                    border: `1px solid ${formsDesign?.cartRowBorder || "#E5E7EB"}`
                  }}
                >
                  {offer.icon}
                </span>
                <span>{t("section2.preview.offerStrip.offer")}</span>
              </div>
              <div 
                className="offers-strip-main"
                style={{ color: formsDesign?.cartTitleColor || "#111827" }}
              >
                {productName}
              </div>
              <div 
                className="offers-strip-desc"
                style={{ color: formsDesign?.cartTextColor || "#6B7280" }}
              >
                {description}
              </div>
            </div>
          </div>
        );
      })}
    </BlockStack>
  );
}

function UpsellsPreview({ cfg, products, t, formsDesign }) {
  const activeUpsells = cfg.upsells.filter(upsell => upsell.enabled && upsell.showInPreview);
  
  if (activeUpsells.length === 0) return null;
  
  return (
    <BlockStack gap="200">
      {activeUpsells.map((upsell, idx) => {
        const productName = upsell.title || findProductLabel(products, upsell.shopifyProductId) || 
                          t("section2.preview.defaultUpsellTitle");
        const description = upsell.description || t("section2.preview.giftDescription");
        
        return (
          <div 
            key={idx} 
            className="offers-strip"
            style={{
              background: formsDesign?.bg || "#FFFFFF",
              border: `1px solid ${formsDesign?.border || "#E5E7EB"}`,
              color: formsDesign?.text || "#111827"
            }}
          >
            <div className="offers-strip-thumb">
              {upsell.imageUrl ? (
                <img src={upsell.imageUrl} alt={productName} />
              ) : (
                <div className="offers-strip-thumb-inner-upsell" />
              )}
            </div>
            <div>
              <div 
                className="offers-strip-title"
                style={{ color: formsDesign?.placeholder || "#6B7280" }}
              >
                <span 
                  className="offers-strip-icon"
                  style={{ 
                    background: formsDesign?.cartRowBg || "#F3F4F6",
                    border: `1px solid ${formsDesign?.cartRowBorder || "#E5E7EB"}`
                  }}
                >
                  {upsell.icon}
                </span>
                <span>{t("section2.preview.offerStrip.gift")}</span>
              </div>
              <div 
                className="offers-strip-main"
                style={{ color: formsDesign?.cartTitleColor || "#111827" }}
              >
                {productName}
              </div>
              <div 
                className="offers-strip-desc"
                style={{ color: formsDesign?.cartTextColor || "#6B7280" }}
              >
                {description}
              </div>
            </div>
          </div>
        );
      })}
    </BlockStack>
  );
}

function OrderSummaryPreview({ cfg, t, formsDesign }) {
  if (!cfg.display.showOrderSummary) return null;
  
  return (
    <div 
      className="order-summary-preview"
      style={{
        background: formsDesign?.cartBg || "#F9FAFB",
        border: `1px solid ${formsDesign?.cartBorder || "#E5E7EB"}`,
        color: formsDesign?.cartTextColor || "#111827"
      }}
    >
      <div 
        className="order-summary-title"
        style={{ color: formsDesign?.cartTitleColor || "#111827" }}
      >
        {t("section2.preview.orderSummary.title")}
      </div>
      <div className="order-row">
        <span className="order-label" style={{ color: formsDesign?.placeholder || "#6B7280" }}>
          {t("section2.preview.orderSummary.subtotal")}
        </span>
        <span>129.99 {cfg.global.currency}</span>
      </div>
      <div className="order-row">
        <span className="order-label" style={{ color: formsDesign?.placeholder || "#6B7280" }}>
          {t("section2.preview.orderSummary.shipping")}
        </span>
        <span>{t("section1.preview.freeShipping")}</span>
      </div>
      <div 
        className="order-row"
        style={{ 
          borderTop: `1px solid ${formsDesign?.cartRowBorder || "#E5E7EB"}`,
          color: formsDesign?.cartTitleColor || "#111827"
        }}
      >
        <span className="order-label" style={{ color: formsDesign?.cartTitleColor || "#111827" }}>
          {t("section2.preview.orderSummary.total")}
        </span>
        <span style={{ fontWeight: 700 }}>129.99 {cfg.global.currency}</span>
      </div>
    </div>
  );
}

/* ============================== Editor Components ============================== */

function OfferItemEditor({ 
  offer, 
  index, 
  onChange, 
  onRemove, 
  productOptions, 
  t,
  canRemove 
}) {
  const handleChange = (field, value) => {
    onChange({ ...offer, [field]: value });
  };
  
  return (
    <div className="offer-item-card">
      {canRemove && (
        <div className="remove-offer-btn" onClick={onRemove}>
          ×
        </div>
      )}
      
      <div className="offer-item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="offer-item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            {t("section2.offer.title", { number: index + 1 })}
          </Text>
        </InlineStack>
        <Checkbox
          label={t("section2.offer.enable")}
          checked={offer.enabled}
          onChange={(v) => handleChange('enabled', v)}
        />
      </div>
      
      <BlockStack gap="300">
        <Grid2>
          <TextField
            label={t("section2.offer.titleField")}
            value={offer.title}
            onChange={(v) => handleChange('title', v)}
            helpText={t("section2.helpText.offerTitle")}
          />
          <TextField
            label={t("section2.offer.description")}
            value={offer.description}
            onChange={(v) => handleChange('description', v)}
            helpText={t("section2.helpText.offerDesc")}
          />
        </Grid2>
        
        <Grid3>
          <Select
            label={t("section2.offer.type")}
            value={offer.type}
            onChange={(v) => handleChange('type', v)}
            options={[
              { label: t("section2.offer.type.percent"), value: "percent" },
              { label: t("section2.offer.type.fixed"), value: "fixed" }
            ]}
          />
          
          {offer.type === "percent" ? (
            <RangeSlider
              label={`${t("section2.offer.percent")}: ${offer.value}%`}
              min={1}
              max={90}
              output
              value={offer.value}
              onChange={(v) => handleChange('value', v)}
            />
          ) : (
            <TextField
              type="number"
              label={t("section2.offer.fixedAmount")}
              value={String(offer.value)}
              onChange={(v) => handleChange('value', parseFloat(v) || 0)}
            />
          )}
          
          <Select
            label={t("section2.offer.product")}
            value={offer.shopifyProductId}
            onChange={(v) => handleChange('shopifyProductId', v)}
            options={productOptions}
            helpText={t("section2.helpText.product")}
          />
        </Grid3>
        
        <GroupCard title={t("section2.group.conditions.title")}>
          <Grid3>
            <TextField
              type="number"
              label={t("section2.offer.minQuantity")}
              value={String(offer.minQuantity)}
              onChange={(v) => handleChange('minQuantity', parseInt(v) || 0)}
              helpText={t("section2.helpText.minQuantity")}
            />
            
            <TextField
              type="number"
              label={t("section2.offer.minSubtotal")}
              value={String(offer.minSubtotal)}
              onChange={(v) => handleChange('minSubtotal', parseFloat(v) || 0)}
              helpText={t("section2.helpText.minSubtotal")}
            />
            
            <TextField
              type="number"
              label={t("section2.offer.maxDiscount")}
              value={String(offer.maxDiscount)}
              onChange={(v) => handleChange('maxDiscount', parseFloat(v) || 0)}
              helpText={t("section2.helpText.maxDiscount")}
            />
          </Grid3>
          
          <Checkbox
            label={t("section2.offer.requiresCode")}
            checked={offer.requiresCode}
            onChange={(v) => handleChange('requiresCode', v)}
          />
          
          {offer.requiresCode && (
            <TextField
              label={t("section2.offer.code")}
              value={offer.code}
              onChange={(v) => handleChange('code', v.toUpperCase())}
              helpText={t("section2.helpText.code")}
            />
          )}
        </GroupCard>
        
        <GroupCard title={t("section2.group.display.title")}>
          <Grid2>
            <TextField
              label={t("section2.offer.imageUrl")}
              value={offer.imageUrl}
              onChange={(v) => handleChange('imageUrl', v)}
              helpText={t("section2.helpText.offerImage")}
            />
            
            <div>
              <Text as="p" variant="bodySm">
                {t("section2.offer.icon")}
              </Text>
              <TextField
                label={t("section2.offer.icon")}
                labelHidden
                value={offer.icon}
                onChange={(v) => handleChange('icon', v)}
                helpText={t("section2.helpText.offerIconEmoji")}
              />
              <IconsPalette
                selected={offer.icon}
                onSelect={(icon) => handleChange('icon', icon)}
              />
            </div>
          </Grid2>
          
          <Checkbox
            label={t("section2.offer.showInPreview")}
            checked={offer.showInPreview}
            onChange={(v) => handleChange('showInPreview', v)}
          />
        </GroupCard>
      </BlockStack>
    </div>
  );
}

function UpsellItemEditor({ 
  upsell, 
  index, 
  onChange, 
  onRemove, 
  productOptions, 
  t,
  canRemove 
}) {
  const handleChange = (field, value) => {
    onChange({ ...upsell, [field]: value });
  };
  
  return (
    <div className="offer-item-card">
      {canRemove && (
        <div className="remove-offer-btn" onClick={onRemove}>
          ×
        </div>
      )}
      
      <div className="offer-item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="offer-item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            {t("section2.upsell.title", { number: index + 1 })}
          </Text>
        </InlineStack>
        <Checkbox
          label={t("section2.upsell.enable")}
          checked={upsell.enabled}
          onChange={(v) => handleChange('enabled', v)}
        />
      </div>
      
      <BlockStack gap="300">
        <Grid2>
          <TextField
            label={t("section2.upsell.titleField")}
            value={upsell.title}
            onChange={(v) => handleChange('title', v)}
            helpText={t("section2.helpText.upsellTitle")}
          />
          <TextField
            label={t("section2.upsell.description")}
            value={upsell.description}
            onChange={(v) => handleChange('description', v)}
            helpText={t("section2.helpText.giftDesc")}
          />
        </Grid2>
        
        <Grid3>
          <Select
            label={t("section2.upsell.product")}
            value={upsell.shopifyProductId}
            onChange={(v) => handleChange('shopifyProductId', v)}
            options={productOptions}
            helpText={t("section2.helpText.product")}
          />
          
          <Select
            label={t("section2.upsell.triggerType")}
            value={upsell.triggerType}
            onChange={(v) => handleChange('triggerType', v)}
            options={[
              { label: t("section2.upsell.trigger.subtotal"), value: "subtotal" },
              { label: t("section2.upsell.trigger.product"), value: "product" }
            ]}
          />
          
          {upsell.triggerType === "subtotal" ? (
            <TextField
              type="number"
              label={t("section2.upsell.minSubtotal")}
              value={String(upsell.minSubtotal)}
              onChange={(v) => handleChange('minSubtotal', parseFloat(v) || 0)}
              helpText={t("section2.helpText.minSubtotal")}
            />
          ) : (
            <TextField
              label={t("section2.upsell.productHandle")}
              value={upsell.productHandle}
              onChange={(v) => handleChange('productHandle', v)}
              helpText={t("section2.helpText.productHandle")}
            />
          )}
        </Grid3>
        
        <GroupCard title={t("section2.group.gift.title")}>
          <Grid3>
            <TextField
              label={t("section2.gift.title")}
              value={upsell.giftTitle}
              onChange={(v) => handleChange('giftTitle', v)}
            />
            
            <TextField
              label={t("section2.gift.note")}
              value={upsell.giftNote}
              onChange={(v) => handleChange('giftNote', v)}
            />
            
            <TextField
              type="number"
              label={t("section2.gift.originalPrice")}
              value={String(upsell.originalPrice)}
              onChange={(v) => handleChange('originalPrice', parseFloat(v) || 0)}
              helpText={t("section2.helpText.originalPrice")}
            />
          </Grid3>
          
          <Checkbox
            label={t("section2.gift.isFree")}
            checked={upsell.isFree}
            onChange={(v) => handleChange('isFree', v)}
          />
        </GroupCard>
        
        <GroupCard title={t("section2.group.display.title")}>
          <Grid2>
            <TextField
              label={t("section2.upsell.imageUrl")}
              value={upsell.imageUrl}
              onChange={(v) => handleChange('imageUrl', v)}
              helpText={t("section2.helpText.offerImage")}
            />
            
            <div>
              <Text as="p" variant="bodySm">
                {t("section2.upsell.icon")}
              </Text>
              <TextField
                label={t("section2.upsell.icon")}
                labelHidden
                value={upsell.icon}
                onChange={(v) => handleChange('icon', v)}
                helpText={t("section2.helpText.giftIconEmoji")}
              />
              <IconsPalette
                selected={upsell.icon}
                onSelect={(icon) => handleChange('icon', icon)}
              />
            </div>
          </Grid2>
          
          <Checkbox
            label={t("section2.upsell.showInPreview")}
            checked={upsell.showInPreview}
            onChange={(v) => handleChange('showInPreview', v)}
          />
        </GroupCard>
      </BlockStack>
    </div>
  );
}

/* ============================== HEADER / SHELL ============================== */

function PageShell({ children, t, loading, onSave, saving }) {
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
                {t("section2.header.appTitle")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section2.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div
              style={{
                fontSize: 12,
                color: "rgba(249,250,251,0.9)",
              }}
            >
              {t("section2.preview.subtitle")}{" "}
              {loading ? t("section0.usage.loading") : ""}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section2.button.save")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== Composant principal ============================== */

function Section2OffersInner({ products = [] }) {
  const { t } = useI18n();
  useInjectCss();

  const shopProducts = products || [];

  const productOptions = [
    { label: t("section2.offer.selectProduct"), value: "" },
    ...shopProducts.map((p) => ({
      label: p.title || `Produit #${p.id}`,
      value: String(p.id),
    })),
  ];

  const [cfg, setCfg] = useState(() => DEFAULT_CFG);
  const [formsConfig, setFormsConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("offers");

  const persistLocal = (next) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_offers_v5",
        JSON.stringify(withDefaults(next))
      );
    } catch {}
  };

  // Charger la configuration de Section1FormsLayout
  useEffect(() => {
    const loadFormsSettings = async () => {
      try {
        // Essayer de charger via API d'abord
        const res = await fetch("/api/load-settings");
        if (res.ok) {
          const j = await res.json();
          if (j?.ok && j.settings) {
            setFormsConfig(j.settings);
            
            // Mettre à jour la devise si elle n'est pas déjà définie
            const countryCode = j.settings.behavior?.country || "MA";
            const currency = getCurrencyByCountry(countryCode);
            
            setCfg(prev => ({
              ...prev,
              global: {
                ...prev.global,
                currency: prev.global.currency || currency
              }
            }));
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load forms settings from API:", e);
      }
      
      // Fallback: charger depuis localStorage
      try {
        const formsConfigStr = localStorage.getItem("tripleform_cod_config");
        if (formsConfigStr) {
          const config = JSON.parse(formsConfigStr);
          setFormsConfig(config);
          
          const countryCode = config.behavior?.country || "MA";
          const currency = getCurrencyByCountry(countryCode);
          
          setCfg(prev => ({
            ...prev,
            global: {
              ...prev.global,
              currency: prev.global.currency || currency
            }
          }));
        }
      } catch (e) {
        console.error("Failed to load forms settings from localStorage:", e);
      }
    };
    
    loadFormsSettings();
  }, []);

  // Charger la configuration des offres
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/offers/load");
        if (res.ok) {
          const j = await res.json().catch(() => null);
          if (!cancelled && j?.ok && j.offers) {
            const merged = withDefaults(j.offers);
            setCfg(merged);
            persistLocal(merged);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn(
          "[Section2Offers] Échec du chargement depuis /api/offers/load, fallback localStorage",
          e
        );
      }

      if (!cancelled && typeof window !== "undefined") {
        try {
          const s = window.localStorage.getItem("tripleform_cod_offers_v5");
          if (s) {
            setCfg(withDefaults(JSON.parse(s)));
          }
        } catch {}
      }

      if (!cancelled) setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveOffers = async () => {
    const toSave = withDefaults(cfg);
    try {
      setSaving(true);
      persistLocal(toSave);

      const res = await fetch("/api/save-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers: toSave }),
      });

      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false)
        throw new Error(j?.error || "Save failed");

      alert("Offres enregistrées ✔️");
    } catch (e) {
      console.error(e);
      alert(
        "Échec de l'enregistrement des offres : " +
          (e?.message || "Erreur inconnue")
      );
    } finally {
      setSaving(false);
    }
  };

  // Offers management
  const addOffer = () => {
    if (cfg.offers.length >= 3) return;
    setCfg(prev => ({
      ...prev,
      offers: [...prev.offers, JSON.parse(JSON.stringify(DEFAULT_OFFER))]
    }));
  };

  const updateOffer = (index, updatedOffer) => {
    setCfg(prev => ({
      ...prev,
      offers: prev.offers.map((offer, i) => 
        i === index ? updatedOffer : offer
      )
    }));
  };

  const removeOffer = (index) => {
    if (cfg.offers.length <= 1) return;
    setCfg(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));
  };

  // Upsells management
  const addUpsell = () => {
    if (cfg.upsells.length >= 3) return;
    setCfg(prev => ({
      ...prev,
      upsells: [...prev.upsells, JSON.parse(JSON.stringify(DEFAULT_UPSELL))]
    }));
  };

  const updateUpsell = (index, updatedUpsell) => {
    setCfg(prev => ({
      ...prev,
      upsells: prev.upsells.map((upsell, i) => 
        i === index ? updatedUpsell : upsell
      )
    }));
  };

  const removeUpsell = (index) => {
    if (cfg.upsells.length <= 1) return;
    setCfg(prev => ({
      ...prev,
      upsells: prev.upsells.filter((_, i) => i !== index)
    }));
  };

  // Global settings
  const setGlobal = (p) =>
    setCfg((c) => ({ ...c, global: { ...c.global, ...p } }));

  const setDisplay = (p) =>
    setCfg((c) => ({ ...c, display: { ...c.display, ...p } }));

  const NAV_ITEMS = [
    { key: "global", label: t("section2.rail.global"), icon: "SettingsIcon" },
    { key: "offers", label: t("section2.rail.offers"), icon: "DiscountIcon" },
    { key: "upsells", label: t("section2.rail.upsells"), icon: "GiftCardIcon" },
  ];

  // Récupérer les paramètres de design depuis formsConfig
  const formsDesign = formsConfig?.design || {};
  
  // Options de devise basées sur le pays
  const currencyOptions = formsConfig?.behavior?.country ? [
    { label: `${getCurrencyByCountry(formsConfig.behavior.country)} (Auto)`, value: "" },
    { label: "MAD (DH)", value: "MAD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "USD ($)", value: "USD" },
    { label: "GBP (£)", value: "GBP" },
  ] : [
    { label: "MAD (DH)", value: "MAD" },
    { label: "EUR (€)", value: "EUR" },
    { label: "USD ($)", value: "USD" },
    { label: "GBP (£)", value: "GBP" },
  ];

  return (
    <PageShell t={t} loading={loading} onSave={saveOffers} saving={saving}>
      <div className="tf-editor">
        {/* ===== Rail de navigation ===== */}
        <div className="tf-rail">
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section2.rail.title")}</div>
            <div className="tf-rail-list">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="tf-rail-item"
                  data-sel={selectedTab === item.key ? 1 : 0}
                  onClick={() => setSelectedTab(item.key)}
                >
                  <div className="tf-grip">
                    <Icon source={PI[item.icon] || PI.AppsIcon} />
                  </div>
                  <div>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Colonne principale ===== */}
        <div className="tf-right-col">
          <div className="tf-hero">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <span className="tf-hero-badge">
                  {cfg.offers.filter(o => o.enabled).length} {t("section2.rail.offers")} • {cfg.upsells.filter(u => u.enabled).length} {t("section2.rail.upsells")}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {t("section2.header.appTitle")}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    {t("section2.helpText.display")}
                  </div>
                </div>
              </InlineStack>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {t("section2.preview.subtitle")}
              </div>
            </InlineStack>
          </div>

          <div className="tf-panel">
            {selectedTab === "global" && (
              <BlockStack gap="300">
                <GroupCard title={t("section2.group.global.title")}>
                  <Grid3>
                    <Checkbox
                      label={t("section2.global.enable")}
                      checked={!!cfg.global.enabled}
                      onChange={(v) => setGlobal({ enabled: v })}
                    />
                    <Select
                      label={t("section2.global.currency")}
                      value={cfg.global.currency}
                      onChange={(v) => setGlobal({ currency: v })}
                      options={currencyOptions}
                      helpText={formsConfig?.behavior?.country 
                        ? `${t("section2.global.currencyBasedOnCountry")}: ${formsConfig.behavior.country}`
                        : t("section2.global.selectCurrency")
                      }
                    />
                    <Select
                      label={t("section2.global.rounding")}
                      value={cfg.global.rounding}
                      onChange={(v) => setGlobal({ rounding: v })}
                      options={[
                        { label: t("section2.global.rounding.none"), value: "none" },
                        { label: t("section2.global.rounding.unit"), value: "unit" },
                        { label: t("section2.global.rounding.99"), value: ".99" },
                      ]}
                    />
                  </Grid3>
                </GroupCard>

                <GroupCard title={t("section2.group.display.title")}>
                  <Grid2>
                    <Checkbox
                      label={t("section2.display.showOrderSummary")}
                      checked={cfg.display.showOrderSummary}
                      onChange={(v) => setDisplay({ showOrderSummary: v })}
                    />
                    <Checkbox
                      label={t("section2.display.showOffersSection")}
                      checked={cfg.display.showOffersSection}
                      onChange={(v) => setDisplay({ showOffersSection: v })}
                    />
                  </Grid2>
                  <Text variant="bodySm" tone="subdued">
                    {t("section2.helpText.display")}
                  </Text>
                </GroupCard>
              </BlockStack>
            )}

            {selectedTab === "offers" && (
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  {t("section2.rail.offers")} ({cfg.offers.length}/3)
                </Text>
                
                {cfg.offers.map((offer, index) => (
                  <OfferItemEditor
                    key={index}
                    offer={offer}
                    index={index}
                    onChange={(updated) => updateOffer(index, updated)}
                    onRemove={() => removeOffer(index)}
                    productOptions={productOptions}
                    t={t}
                    canRemove={cfg.offers.length > 1}
                  />
                ))}
                
                {cfg.offers.length < 3 && (
                  <div className="add-button" onClick={addOffer}>
                    <Icon source={PI.PlusIcon} />
                    {t("section2.button.addOffer")}
                  </div>
                )}
              </BlockStack>
            )}

            {selectedTab === "upsells" && (
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  {t("section2.rail.upsells")} ({cfg.upsells.length}/3)
                </Text>
                
                {cfg.upsells.map((upsell, index) => (
                  <UpsellItemEditor
                    key={index}
                    upsell={upsell}
                    index={index}
                    onChange={(updated) => updateUpsell(index, updated)}
                    onRemove={() => removeUpsell(index)}
                    productOptions={productOptions}
                    t={t}
                    canRemove={cfg.upsells.length > 1}
                  />
                ))}
                
                {cfg.upsells.length < 3 && (
                  <div className="add-button" onClick={addUpsell}>
                    <Icon source={PI.PlusIcon} />
                    {t("section2.button.addUpsell")}
                  </div>
                )}
              </BlockStack>
            )}
          </div>
        </div>

        {/* ===== Colonne preview avec adaptation des couleurs ===== */}
        <div className="tf-preview-col">
          <div 
            className="tf-preview-card"
            style={{
              background: formsDesign?.bg || "#FFFFFF",
              border: `1px solid ${formsDesign?.border || "#E5E7EB"}`,
              color: formsDesign?.text || "#111827"
            }}
          >
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm" style={{ color: formsDesign?.text || "#111827" }}>
                  {t("section2.preview.title")}
                </Text>
                <Badge tone={cfg.global.enabled ? "success" : "critical"}>
                  {cfg.global.enabled 
                    ? t("section2.preview.active") 
                    : t("section2.preview.inactive")}
                </Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued" style={{ color: formsDesign?.placeholder || "#6B7280" }}>
                {t("section2.preview.subtitle")}
              </Text>

              {cfg.display.showOffersSection && (
                <>
                  <OffersPreview 
                    cfg={cfg} 
                    products={shopProducts} 
                    t={t} 
                    formsDesign={formsDesign}
                  />
                  <UpsellsPreview 
                    cfg={cfg} 
                    products={shopProducts} 
                    t={t} 
                    formsDesign={formsDesign}
                  />
                </>
              )}
              
              <OrderSummaryPreview 
                cfg={cfg} 
                t={t} 
                formsDesign={formsDesign}
              />
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;