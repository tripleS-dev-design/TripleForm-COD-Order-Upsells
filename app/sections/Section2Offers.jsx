// ===== File: app/sections/Section2Offers.jsx =====
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
  Icon,
  Badge,
  Tabs,
  Modal,
  Divider,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= i18n fallback helper ======================= */
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

/* ======================= CSS / layout (PRO) ======================= */
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
    padding:12px 16px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }
  .tf-shell { padding:16px; }

  .tf-topnav{
    margin: 14px 0 16px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:8px 10px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
  }

  /* ✅ Tabs center */
  .tf-topnav-center{
    display:flex;
    justify-content:center;
    align-items:center;
  }
  .tf-topnav-center > div{
    width:fit-content;
  }

  /* ✅ preview column wider */
  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 460px;
    gap:16px;
    align-items:start;
  }

  .tf-main-col{ display:grid; gap:16px; min-width:0; }

  .tf-hero {
    background:#FFFFFF;
    border-radius:12px;
    padding:10px 14px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.06);
  }
  .tf-hero-badge {
    font-size:11px;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:.08em;
    padding:3px 8px;
    border-radius:999px;
    background:#EEF2FF;
    border:1px solid #C7D2FE;
    color:#1E3A8A;
  }

  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:14px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
    min-width:0;
  }

  .tf-preview-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
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
    padding:10px 14px;
    background:linear-gradient(90deg,#1E40AF,#7C2D12);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:900;
    letter-spacing:.02em;
    margin-bottom:12px;
    font-size:13px;
    box-shadow:0 6px 16px rgba(30,64,175,0.15);
  }

  .item-card {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:14px;
    margin-bottom:14px;
    position:relative;
  }
  .item-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:12px;
    padding-bottom:10px;
    border-bottom:1px solid #F3F4F6;
  }
  .item-number {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:28px;
    height:28px;
    border-radius:50%;
    background:#4F46E5;
    color:white;
    font-weight:900;
    font-size:12px;
    margin-right:10px;
  }
  .remove-btn {
    position:absolute;
    top:10px;
    right:10px;
    background:#FEF2F2;
    border:1px solid #FECACA;
    color:#DC2626;
    width:28px;
    height:28px;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:16px;
    transition:all .15s;
  }
  .remove-btn:hover { background:#FEE2E2; transform:scale(1.04); }

  .tf-color-palettes {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(160px, 1fr));
    gap:12px;
    margin-top:10px;
  }
  .tf-color-palette {
    border:1px solid #E5E7EB;
    border-radius:12px;
    overflow:hidden;
    cursor:pointer;
    transition:all 0.2s;
    background:#fff;
  }
  .tf-color-palette:hover { transform:translateY(-2px); box-shadow:0 8px 18px rgba(0,0,0,0.10); }
  .tf-color-palette.active { outline:2px solid #00A7A3; }
  .tf-palette-colors { height:44px; display:grid; grid-template-columns:1fr 1fr; }
  .tf-palette-info {
    padding:8px;
    background:#fff;
    font-size:11px;
    font-weight:800;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
  }
  .tf-palette-accent{ width:14px; height:14px; border-radius:999px; border:1px solid rgba(0,0,0,.12); }

  .preview-offer {
    border-radius:14px;
    border:1px solid #E5E7EB;
    padding:14px;
    box-shadow:0 10px 22px rgba(15,23,42,0.06);
    background:#fff;
    overflow:hidden;
  }

  .preview-row {
    display:flex;
    gap:12px;
    align-items:center;
  }

  .preview-img {
    width:92px;
    height:92px;
    border-radius:16px;
    overflow:hidden;
    border:1px solid rgba(0,0,0,.08);
    background:#F3F4F6;
    flex:none;
  }
  .preview-img img { width:100%; height:100%; object-fit:cover; display:block; }

  .preview-main { min-width:0; flex:1; }
  .preview-title { font-weight:950; font-size:14px; margin-bottom:3px; }
  .preview-desc { font-size:12px; color:#6B7280; line-height:1.35; }
  .preview-sub { font-size:11px; color:#94A3B8; margin-top:7px; }

  .preview-icon {
    width:36px;
    height:36px;
    border-radius:12px;
    display:grid;
    place-items:center;
    border:1px solid rgba(0,0,0,.10);
    flex:none;
    overflow:hidden;
    background:#EEF2FF;
  }
  .preview-icon img { width:100%; height:100%; object-fit:cover; display:block; }

  .offer-btn {
    margin-top:10px;
    border-radius:12px;
    padding:9px 10px;
    font-size:12px;
    font-weight:950;
    cursor:pointer;
    border:1px solid transparent;
    display:inline-flex;
    align-items:center;
    gap:8px;
    transition:all .15s ease;
  }
  .offer-btn:hover { transform: translateY(-1px); opacity:0.95; }

  .preview-style--image-right .preview-row { flex-direction: row-reverse; }
  .preview-style--image-top .preview-row { flex-direction: column; align-items: stretch; }
  .preview-style--image-top .preview-img { width:100%; height:160px; border-radius:16px; }
  .preview-style--image-bottom .preview-row { flex-direction: column-reverse; align-items: stretch; }
  .preview-style--image-bottom .preview-img { width:100%; height:160px; border-radius:16px; }
  .preview-style--image-bottom .preview-desc { font-size:11px; }

  .add-wrap { display:flex; justify-content:center; margin-top:12px; }
  .add-btn {
    width:100%;
    max-width:520px;
    border-radius:14px;
    padding:12px;
    border:2px dashed #D1D5DB;
    background:#F9FAFB;
  }

  /* ===================== THANK YOU (admin preview) ===================== */
  .tf-ty-preview-wrap{
    position:relative;
    border-radius:14px;
    border:1px solid #E5E7EB;
    background:#fff;
    overflow:hidden;
  }
  .tf-ty-simple{
    padding:14px;
    display:grid;
    gap:10px;
  }
  .tf-ty-simple-top{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }
  .tf-ty-chip{
    font-size:11px;
    font-weight:900;
    padding:3px 8px;
    border-radius:999px;
    border:1px solid rgba(0,0,0,.10);
    background:#F8FAFC;
    color:#111827;
  }
  .tf-ty-banner{
    border-radius:12px;
    border:1px solid rgba(0,0,0,.08);
    overflow:hidden;
    background:#F3F4F6;
    height:160px;
  }
  .tf-ty-banner img{ width:100%; height:100%; object-fit:cover; display:block; }
  .tf-ty-title{ font-size:14px; font-weight:950; }
  .tf-ty-text{ font-size:12px; color:#6B7280; line-height:1.4; }
  .tf-ty-actions{ display:flex; gap:10px; flex-wrap:wrap; }
  .tf-ty-btn{
    border-radius:12px;
    padding:10px 12px;
    font-size:12px;
    font-weight:950;
    border:1px solid transparent;
    display:inline-flex;
    align-items:center;
    gap:8px;
    cursor:pointer;
    transition:all .15s ease;
  }
  .tf-ty-btn:hover{ transform:translateY(-1px); opacity:.97; }
  .tf-ty-link{
    font-size:12px;
    font-weight:900;
    color:#2563EB;
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    gap:6px;
  }

  .tf-ty-modal-overlay{
    position:absolute;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:14px;
    background:rgba(2,6,23,.55);
  }
  .tf-ty-modal{
    width:100%;
    max-width:380px;
    border-radius:16px;
    border:1px solid rgba(255,255,255,.12);
    overflow:hidden;
    box-shadow:0 18px 40px rgba(0,0,0,.35);
  }
  .tf-ty-modal-inner{
    padding:14px;
    display:grid;
    gap:10px;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns:1fr; }
    .tf-preview-col { position:static; max-height:none; }
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

/* ============================== UI helpers ============================== */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="300">{children}</BlockStack>
    </Card>
  );
}

/* ✅ 3 per row */
const Grid3 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

function ColorField({ label, value, onChange, placeholder = "#FFFFFF" }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Text as="p" variant="bodySm" fontWeight="bold">
        {label}
      </Text>
      <InlineStack gap="200" blockAlign="center">
        <input
          type="color"
          value={value || placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 42,
            height: 38,
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            background: "transparent",
            padding: 0,
          }}
          aria-label={label}
        />
        <div style={{ flex: 1 }}>
          <TextField
            label={label}
            labelHidden
            value={value || ""}
            placeholder={placeholder}
            onChange={(v) => onChange(v)}
            autoComplete="off"
          />
        </div>
      </InlineStack>
    </div>
  );
}

/* ============================== Layout style options (4) ============================== */
const LAYOUT_STYLE_OPTIONS = [
  { label: "Image left · Text right", value: "image-left" },
  { label: "Image right · Text left", value: "image-right" },
  { label: "Image big top · Text bottom", value: "image-top" },
  { label: "Image big bottom · Text small", value: "image-bottom" },
];

/* ============================== Discount options ============================== */
const DISCOUNT_TYPE_OPTIONS = [
  { label: "Percentage (%)", value: "percentage" },
  { label: "Fixed amount", value: "fixed" },
];

/* ✅ NEW: Quantity multiplier options (x1/x2/x3) */
const OFFER_QTY_OPTIONS = [
  { label: "x1 (1 product)", value: "1" },
  { label: "x2 (2 products)", value: "2" },
  { label: "x3 (3 products)", value: "3" },
];

/* ============================== Thank You Page options ============================== */
const THANKYOU_MODE_OPTIONS = [
  { label: "Simple (inline message)", value: "simple" },
  { label: "Popup after order", value: "popup" },
];

const THANKYOU_LAYOUT_OPTIONS = [
  { label: "Image top", value: "image-top" },
  { label: "Image left", value: "image-left" },
  { label: "Image right", value: "image-right" },
];

const THANKYOU_SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

/* ============================== Palettes globales ============================== */
const COLOR_PALETTES = [
  {
    id: "clean-pro",
    name: "Clean Pro",
    colors: ["#111827", "#FFFFFF", "#E5E7EB", "#EEF2FF", "#4F46E5"],
    preset: {
      cardBg: "#FFFFFF",
      borderColor: "#E5E7EB",
      iconBg: "#EEF2FF",
      buttonBg: "#111827",
      buttonTextColor: "#FFFFFF",
      buttonBorder: "#111827",
    },
  },
  {
    id: "brand-gradient",
    name: "Brand (Blue/Cherry)",
    colors: ["#0B3B82", "#7D0031", "#00A7A3", "#F8FAFC", "#111827"],
    preset: {
      cardBg: "#FFFFFF",
      borderColor: "#E5E7EB",
      iconBg: "#EEF2FF",
      buttonBg: "#0B3B82",
      buttonTextColor: "#FFFFFF",
      buttonBorder: "#0B3B82",
    },
  },
  {
    id: "dark-modern",
    name: "Dark Modern",
    colors: ["#0B1220", "#2563EB", "#1F2A44", "#101828", "#E5F0FF"],
    preset: {
      cardBg: "#0F172A",
      borderColor: "#1F2A44",
      iconBg: "#101828",
      buttonBg: "#2563EB",
      buttonTextColor: "#FFFFFF",
      buttonBorder: "#1D4ED8",
    },
  },
  {
    id: "green-nature",
    name: "Green Nature",
    colors: ["#10B981", "#065F46", "#D1FAE5", "#ECFDF5", "#064E3B"],
    preset: {
      cardBg: "#FFFFFF",
      borderColor: "#D1FAE5",
      iconBg: "#ECFDF5",
      buttonBg: "#10B981",
      buttonTextColor: "#FFFFFF",
      buttonBorder: "#059669",
    },
  },
];

/* ============================== Product helpers ============================== */
function getProductById(products, id) {
  return products?.find((p) => String(p.id) === String(id));
}

function getProductImages(product) {
  const imgs = [];
  const push = (x) => {
    if (!x) return;
    const src =
      x.src ||
      x.url ||
      x.originalSrc ||
      x.transformedSrc ||
      x.preview?.image?.url ||
      x.previewImage?.url;
    if (src && !imgs.includes(src)) imgs.push(src);
  };

  if (product?.image) push(product.image);
  if (product?.featuredImage) push(product.featuredImage);
  if (Array.isArray(product?.images)) product.images.forEach((im) => push(im));
  if (Array.isArray(product?.media))
    product.media.forEach((m) => push(m?.preview?.image || m?.image));

  return imgs;
}

/* ============================== Defaults ============================== */
const DEFAULT_GLOBAL_COLORS = {
  paletteId: "clean-pro",
  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",
  iconBg: "#EEF2FF",
  buttonBg: "#111827",
  buttonTextColor: "#FFFFFF",
  buttonBorder: "#111827",
};

const DEFAULT_OFFER = {
  enabled: true,
  showInPreview: true,

  title: "Offre spéciale",
  description: "Ajoutez cette offre pour augmenter vos conversions",

  productId: "",

  iconUrl: "",
  imageUrl: "",

  layoutStyle: "image-left",

  useGlobalColors: true,
  colors: {
    cardBg: "#FFFFFF",
    borderColor: "#E5E7EB",
    iconBg: "#EEF2FF",
    buttonBg: "#111827",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "#111827",
  },

  buttonText: "Activer",

  // ✅ NEW: bundle qty multiplier (x1/x2/x3)
  qtyMultiplier: 1,

  // discount settings
  discountEnabled: false,
  discountType: "percentage",
  discountValue: 10,
};

const DEFAULT_UPSELL = {
  enabled: true,
  showInPreview: true,

  title: "Upsell",
  description: "Proposition complémentaire au produit",

  productId: "",

  iconUrl: "",
  imageUrl: "",

  layoutStyle: "image-left",

  useGlobalColors: true,
  colors: {
    cardBg: "#FFFFFF",
    borderColor: "#E5E7EB",
    iconBg: "#ECFDF5",
    buttonBg: "#111827",
    buttonTextColor: "#FFFFFF",
    buttonBorder: "#111827",
  },
};

/* ============================== Thank You Page defaults ============================== */
const DEFAULT_THANKYOU_COLORS = {
  paletteId: "brand-gradient",
  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",
  iconBg: "#EEF2FF",
  buttonBg: "#0B3B82",
  buttonTextColor: "#FFFFFF",
  buttonBorder: "#0B3B82",
};

const DEFAULT_THANKYOU = {
  enabled: true,

  // ✅ mode requested: simple OR popup
  mode: "simple", // "simple" | "popup"
  autoOpenDelayMs: 250, // for popup mode only

  // content
  title: "Thank you!",
  message:
    "Your order has been received. Our team will contact you shortly to confirm.",
  imageUrl: "",
  iconUrl: "",

  // primary action
  primaryEnabled: true,
  primaryText: "Continue shopping",
  primaryUrl: "/",

  // secondary action
  secondaryEnabled: false,
  secondaryText: "Track my order",
  secondaryUrl: "/pages/track-order",

  // layout
  layout: "image-top", // image-top | image-left | image-right
  size: "md", // sm | md | lg

  // design
  useGlobalColors: true, // use offers global colors OR thankyou palette/colors
  colors: { ...DEFAULT_THANKYOU_COLORS },

  // style tweaks (like Canva tools)
  radius: 16,
  imageHeight: 160,
  showChip: true,
  chipText: "Order confirmed",
};

const DEFAULT_CFG = {
  meta: { version: 32 }, // ✅ bumped version
  global: {
    enabled: true,
    colors: { ...DEFAULT_GLOBAL_COLORS },
  },
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],

  // ✅ NEW: Thank You Page section
  thankYou: JSON.parse(JSON.stringify(DEFAULT_THANKYOU)),
};

function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  const i = Math.round(x);
  return Math.max(min, Math.min(max, i));
}

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };

  x.global = { ...d.global, ...(raw.global || {}) };
  x.global.colors = {
    ...DEFAULT_GLOBAL_COLORS,
    ...((raw.global || {}).colors || {}),
  };

  x.offers = Array.isArray(raw.offers) ? raw.offers : d.offers;
  x.upsells = Array.isArray(raw.upsells) ? raw.upsells : d.upsells;

  x.offers = x.offers.slice(0, 3).map((o) => ({
    ...DEFAULT_OFFER,
    ...o,
    colors: { ...DEFAULT_OFFER.colors, ...(o?.colors || {}) },

    discountEnabled: o?.discountEnabled ?? false,
    discountType: o?.discountType || "percentage",
    discountValue:
      typeof o?.discountValue === "number"
        ? o.discountValue
        : o?.discountValue != null
        ? Number(o.discountValue) || 0
        : DEFAULT_OFFER.discountValue,

    // ✅ ensure qtyMultiplier exists and is 1..3
    qtyMultiplier: clampInt(
      o?.qtyMultiplier,
      1,
      3,
      DEFAULT_OFFER.qtyMultiplier
    ),
  }));

  x.upsells = x.upsells.slice(0, 3).map((u) => ({
    ...DEFAULT_UPSELL,
    ...u,
    colors: { ...DEFAULT_UPSELL.colors, ...(u?.colors || {}) },
  }));

  // ✅ Thank You defaults/merge
  const tyRaw = raw?.thankYou || {};
  x.thankYou = {
    ...DEFAULT_THANKYOU,
    ...tyRaw,
    colors: { ...DEFAULT_THANKYOU_COLORS, ...(tyRaw?.colors || {}) },
    radius: clampInt(tyRaw?.radius, 10, 28, DEFAULT_THANKYOU.radius),
    imageHeight: clampInt(
      tyRaw?.imageHeight,
      120,
      240,
      DEFAULT_THANKYOU.imageHeight
    ),
    autoOpenDelayMs: clampInt(
      tyRaw?.autoOpenDelayMs,
      0,
      5000,
      DEFAULT_THANKYOU.autoOpenDelayMs
    ),
    size: tyRaw?.size || DEFAULT_THANKYOU.size,
    layout: tyRaw?.layout || DEFAULT_THANKYOU.layout,
    mode: tyRaw?.mode || DEFAULT_THANKYOU.mode,
  };

  return x;
}

/* ============================== Palette Selector ============================== */
function PaletteSelector({ value, onChange }) {
  return (
    <div className="tf-color-palettes">
      {COLOR_PALETTES.map((p) => {
        const c = p.colors || [];
        const g1 = `linear-gradient(135deg, ${c[0]} 0%, ${c[1]} 100%)`;
        const g2 = `linear-gradient(135deg, ${c[2]} 0%, ${c[3]} 100%)`;
        const accent = c[4] || c[0];

        return (
          <div
            key={p.id}
            className={`tf-color-palette ${value === p.id ? "active" : ""}`}
            onClick={() => onChange(p.id)}
          >
            <div className="tf-palette-colors">
              <div style={{ background: g1 }} />
              <div style={{ background: g2 }} />
            </div>
            <div className="tf-palette-info">
              <span>{p.name}</span>
              <span
                className="tf-palette-accent"
                style={{ background: accent }}
                title={accent}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function applyPalette(paletteId, baseColors) {
  const p = COLOR_PALETTES.find((x) => x.id === paletteId);
  if (!p?.preset) return baseColors;
  return { ...baseColors, paletteId, ...p.preset };
}

function applyPaletteToGlobal(globalColors, paletteId) {
  return applyPalette(paletteId, globalColors);
}

/* ============================== Preview renderer (Offers/Upsells) ============================== */
function PreviewCard({ item, products, isOffer, globalColors, tr }) {
  const product = item.productId ? getProductById(products, item.productId) : null;
  const images = product ? getProductImages(product) : [];

  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23EEF2FF'/%3E%3Cstop offset='1' stop-color='%23F8FAFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='220' rx='18' fill='url(%23g)'/%3E%3Cpath d='M120 92l40-40 80 80v72H80V92z' fill='%234F46E5' opacity='.9'/%3E%3Ccircle cx='110' cy='78' r='18' fill='%2399A7FF' opacity='.85'/%3E%3C/svg%3E";

  const img = (item.imageUrl || "").trim() || images?.[0] || fallbackImg;

  const useGlobal = item.useGlobalColors !== false;
  const c = useGlobal ? globalColors : item.colors || {};
  const cardBg = c.cardBg || "#fff";
  const borderColor = c.borderColor || "#E5E7EB";
  const iconBg = c.iconBg || "#EEF2FF";

  const btnBg = c.buttonBg || "#111827";
  const btnText = c.buttonTextColor || "#fff";
  const btnBorder = c.buttonBorder || btnBg;

  const layout = item.layoutStyle || "image-left";
  const layoutClass =
    layout === "image-right"
      ? "preview-style--image-right"
      : layout === "image-top"
      ? "preview-style--image-top"
      : layout === "image-bottom"
      ? "preview-style--image-bottom"
      : "preview-style--image-left";

  const discountLabel =
    isOffer && item.discountEnabled
      ? item.discountType === "fixed"
        ? `${Number(item.discountValue || 0) || 0}`
        : `${Number(item.discountValue || 0) || 0}%`
      : null;

  const qty = isOffer ? clampInt(item.qtyMultiplier, 1, 3, 1) : 1;

  return (
    <div
      className={`preview-offer ${layoutClass}`}
      style={{ background: cardBg, borderColor }}
    >
      <div className="preview-row">
        <div className="preview-icon" style={{ background: iconBg }}>
          {item.iconUrl ? (
            <img
              src={item.iconUrl}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <SafeIcon
              name={isOffer ? "DiscountIcon" : "GiftCardIcon"}
              fallback="AppsIcon"
            />
          )}
        </div>

        <div className="preview-img">
          <img
            src={img}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImg;
            }}
          />
        </div>

        <div className="preview-main">
          <InlineStack align="space-between" blockAlign="center">
            <div className="preview-title">
              {item.title ||
                (isOffer
                  ? tr("section2.offers.defaultTitle", "Offer")
                  : tr("section2.upsells.defaultTitle", "Upsell"))}
            </div>

            <InlineStack gap="200" blockAlign="center">
              {isOffer && qty > 1 ? <Badge tone="info">x{qty}</Badge> : null}
              {discountLabel ? (
                <Badge tone="success">
                  {tr("section2.discount.badge", "Discount")} {discountLabel}
                </Badge>
              ) : null}
            </InlineStack>
          </InlineStack>

          <div className="preview-desc">{item.description || ""}</div>

          <div className="preview-sub">
            {tr("section2.preview.productLabel", "Product")}:{" "}
            <b>
              {product?.title
                ? product.title
                : item.productId
                ? tr("section2.preview.productSelected", "Selected")
                : tr("section2.preview.productNone", "None")}
            </b>
            {isOffer ? (
              <>
                {" "}
                • {tr("section2.preview.qty", "Qty")}: <b>x{qty}</b>
              </>
            ) : null}
          </div>

          {isOffer && (
            <button
              className="offer-btn"
              style={{
                background: btnBg,
                color: btnText,
                borderColor: btnBorder,
              }}
              type="button"
              onClick={() => {}}
            >
              <SafeIcon name="CirclePlusIcon" fallback="PlusIcon" />
              {item.buttonText ||
                tr("section2.offers.buttonDefault", "Activate")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Thank You Preview (Admin) ============================== */
function ThankYouPreview({ thankYou, globalColors, tr }) {
  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 520'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23EEF2FF'/%3E%3Cstop offset='1' stop-color='%23F8FAFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='520' rx='28' fill='url(%23g)'/%3E%3Cpath d='M220 210l110-110 220 220v180H170V210z' fill='%234F46E5' opacity='.88'/%3E%3Ccircle cx='240' cy='190' r='46' fill='%2399A7FF' opacity='.85'/%3E%3C/svg%3E";

  const ty = thankYou || DEFAULT_THANKYOU;

  const useGlobal = ty.useGlobalColors !== false;
  const c = useGlobal ? globalColors : ty.colors || {};

  const cardBg = c.cardBg || "#fff";
  const borderColor = c.borderColor || "#E5E7EB";
  const iconBg = c.iconBg || "#EEF2FF";
  const btnBg = c.buttonBg || "#111827";
  const btnText = c.buttonTextColor || "#fff";
  const btnBorder = c.buttonBorder || btnBg;

  const img = (ty.imageUrl || "").trim() || fallbackImg;

  const radius = clampInt(ty.radius, 10, 28, 16);
  const imageHeight = clampInt(ty.imageHeight, 120, 240, 160);
  const layout = ty.layout || "image-top";

  const chip = ty.showChip !== false ? ty.chipText || tr("thankyou.chip", "Order confirmed") : "";

  const cardStyle = {
    background: cardBg,
    border: `1px solid ${borderColor}`,
    borderRadius: radius,
  };

  // layout
  const isTop = layout === "image-top";
  const isLeft = layout === "image-left";
  const isRight = layout === "image-right";

  const contentWrapStyle = {
    display: "grid",
    gap: 12,
    gridTemplateColumns: isTop ? "1fr" : "140px 1fr",
    alignItems: "start",
  };

  const imageWrapStyle = {
    borderRadius: Math.max(10, radius - 4),
    border: "1px solid rgba(0,0,0,.08)",
    background: "#F3F4F6",
    overflow: "hidden",
    height: isTop ? imageHeight : 140,
  };

  const iconStyle = {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(0,0,0,.10)",
    background: iconBg,
    overflow: "hidden",
    flex: "0 0 auto",
  };

  const renderContent = () => (
    <div className="tf-ty-simple" style={cardStyle}>
      <div className="tf-ty-simple-top">
        <InlineStack gap="200" blockAlign="center">
          <div style={iconStyle}>
            {ty.iconUrl ? (
              <img
                src={ty.iconUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <SafeIcon name="CheckCircleIcon" fallback="AppsIcon" />
            )}
          </div>

          <div>
            <div className="tf-ty-title">{ty.title || tr("thankyou.title", "Thank you!")}</div>
            <div className="tf-ty-text">{ty.message || ""}</div>
          </div>
        </InlineStack>

        {chip ? <span className="tf-ty-chip">{chip}</span> : null}
      </div>

      <div style={contentWrapStyle}>
        <div
          className="tf-ty-banner"
          style={{
            ...imageWrapStyle,
            height: isTop ? imageHeight : 140,
            order: isRight ? 2 : 0,
          }}
        >
          <img
            src={img}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImg;
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 10, order: isRight ? 1 : 0 }}>
          <div className="tf-ty-actions">
            {ty.primaryEnabled !== false ? (
              <button
                className="tf-ty-btn"
                type="button"
                style={{
                  background: btnBg,
                  color: btnText,
                  borderColor: btnBorder,
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
              >
                <SafeIcon name="ArrowRightIcon" fallback="AppsIcon" />
                {ty.primaryText || tr("thankyou.primary", "Continue")}
              </button>
            ) : null}

            {ty.secondaryEnabled ? (
              <a className="tf-ty-link" href={ty.secondaryUrl || "#"} onClick={(e) => e.preventDefault()}>
                <SafeIcon name="ExternalIcon" fallback="AppsIcon" />
                {ty.secondaryText || tr("thankyou.secondary", "Track")}
              </a>
            ) : null}
          </div>

          <Text as="p" variant="bodySm" tone="subdued">
            {tr("thankyou.previewHint", "Admin preview only — this shows how it can look on the storefront.")}
          </Text>
        </div>
      </div>
    </div>
  );

  return (
    <div className="tf-ty-preview-wrap">
      {/* SIMPLE preview always visible */}
      {ty.mode === "simple" ? (
        renderContent()
      ) : (
        <>
          {/* show base page */}
          <div style={{ padding: 12 }}>
            <div style={{ ...cardStyle, padding: 12 }}>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm" fontWeight="bold">
                  {tr("thankyou.mode.popupLabel", "Popup mode preview")}
                </Text>
                <Badge tone="info">
                  {tr("thankyou.mode.popup", "Popup")}
                </Badge>
              </InlineStack>
              <Divider />
              <Text as="p" variant="bodySm" tone="subdued">
                {tr("thankyou.preview.popupHint", "After order success, a popup opens automatically.")}
              </Text>
              <div style={{ marginTop: 10 }}>
                <button
                  className="tf-ty-btn"
                  type="button"
                  style={{
                    background: "#111827",
                    color: "#fff",
                    border: "1px solid #111827",
                  }}
                  onClick={() => {}}
                >
                  <SafeIcon name="CirclePlusIcon" fallback="AppsIcon" />
                  {tr("thankyou.preview.fakeButton", "Finish order (demo)")}
                </button>
              </div>
            </div>
          </div>

          {/* overlay popup preview */}
          <div className="tf-ty-modal-overlay">
            <div
              className="tf-ty-modal"
              style={{
                background: cardBg,
                borderRadius: radius,
                border: `1px solid ${borderColor}`,
              }}
            >
              <div className="tf-ty-modal-inner">{renderContent()}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Editors ============================== */
function OfferEditor({ offer, index, products, onChange, onRemove, canRemove, tr }) {
  const productOptions = useMemo(() => {
    const opts = (products || []).map((p) => ({
      label: p.title || tr("section2.product.fallbackLabel", "Product"),
      value: String(p.id),
    }));
    return [{ label: tr("section2.product.placeholder", "— Choose a product —"), value: "" }, ...opts];
  }, [products, tr]);

  const discountEnabled = !!offer.discountEnabled;
  const discountType = offer.discountType || "percentage";
  const discountValue = Number(offer.discountValue || 0);

  const qtyMultiplier = clampInt(offer.qtyMultiplier, 1, 3, 1);

  return (
    <div className="item-card">
      {canRemove && (
        <div className="remove-btn" onClick={onRemove} title={tr("section2.common.remove", "Remove")}>
          ×
        </div>
      )}

      <div className="item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            {tr("section2.offers.itemTitlePrefix", "Offer")} {index + 1}
          </Text>
        </InlineStack>
        <Checkbox label={tr("section2.common.enable", "Enable")} checked={!!offer.enabled} onChange={(v) => onChange({ ...offer, enabled: v })} />
      </div>

      <BlockStack gap="400">
        <GroupCard title={tr("section2.groups.content", "Content")}>
          <Grid3>
            <TextField label={tr("section2.fields.title", "Title")} value={offer.title || ""} onChange={(v) => onChange({ ...offer, title: v })} autoComplete="off" />
            <TextField
              label={tr("section2.fields.description", "Text")}
              value={offer.description || ""}
              onChange={(v) => onChange({ ...offer, description: v })}
              autoComplete="off"
            />
            <Select
              label={tr("section2.fields.layoutStyle", "Layout style")}
              value={offer.layoutStyle || "image-left"}
              options={LAYOUT_STYLE_OPTIONS}
              onChange={(v) => onChange({ ...offer, layoutStyle: v })}
            />
          </Grid3>

          <Grid3>
            <Select
              label={tr("section2.fields.product", "Shopify product")}
              value={offer.productId ? String(offer.productId) : ""}
              options={productOptions}
              onChange={(v) => onChange({ ...offer, productId: v })}
            />
            <TextField
              label={tr("section2.fields.imageUrl", "Image URL")}
              value={offer.imageUrl || ""}
              onChange={(v) => onChange({ ...offer, imageUrl: v })}
              placeholder="https://cdn.shopify.com/..."
              autoComplete="off"
            />
            <TextField
              label={tr("section2.fields.iconUrl", "Icon URL")}
              value={offer.iconUrl || ""}
              onChange={(v) => onChange({ ...offer, iconUrl: v })}
              placeholder="https://cdn.shopify.com/..."
              autoComplete="off"
            />
          </Grid3>

          <Text variant="bodySm" tone="subdued">
            {tr("section2.hints.urlPriority", "If URL is empty, we auto-use the Shopify product image (when available).")}
          </Text>
        </GroupCard>

        {/* ✅ NEW GROUP: Quantity (x2 / x3) */}
        <GroupCard title={tr("section2.groups.quantity", "Quantity (Offer)")}>
          <Grid3>
            <Select
              label={tr("section2.quantity.label", "Number of products")}
              value={String(qtyMultiplier)}
              options={OFFER_QTY_OPTIONS}
              onChange={(v) => onChange({ ...offer, qtyMultiplier: clampInt(v, 1, 3, 1) })}
              helpText={tr("section2.quantity.help", "Used to calculate totals (x2/x3) in the offer logic.")}
            />
            <div />
            <div />
          </Grid3>
        </GroupCard>

        {/* ✅ Discount */}
        <GroupCard title={tr("section2.groups.discount", "Discount (Offer)")}>
          <Grid3>
            <Checkbox
              label={tr("section2.discount.enable", "Enable discount")}
              checked={discountEnabled}
              onChange={(v) => onChange({ ...offer, discountEnabled: v })}
            />

            <Select
              label={tr("section2.discount.type", "Discount type")}
              value={discountType}
              options={DISCOUNT_TYPE_OPTIONS}
              disabled={!discountEnabled}
              onChange={(v) => onChange({ ...offer, discountType: v })}
            />

            <TextField
              type="number"
              label={
                discountType === "fixed"
                  ? tr("section2.discount.valueFixed", "Discount value (amount)")
                  : tr("section2.discount.valuePercent", "Discount value (%)")
              }
              value={String(discountValue)}
              disabled={!discountEnabled}
              onChange={(v) => {
                const n = Number(v);
                const safe = Number.isFinite(n) ? n : 0;
                const finalVal = discountType === "percentage" ? Math.max(0, Math.min(100, safe)) : Math.max(0, safe);
                onChange({ ...offer, discountValue: finalVal });
              }}
              placeholder={discountType === "fixed" ? "20" : "10"}
              autoComplete="off"
              helpText={
                discountEnabled
                  ? discountType === "fixed"
                    ? tr("section2.discount.helpFixed", "Fixed amount in store currency (ex: 20).")
                    : tr("section2.discount.helpPercent", "Percentage between 0 and 100 (ex: 10).")
                  : tr("section2.discount.helpDisabled", "Enable discount to configure it.")
              }
            />
          </Grid3>
        </GroupCard>

        <GroupCard title={tr("section2.groups.design", "Design")}>
          <Grid3>
            <Checkbox label={tr("section2.fields.useGlobalColors", "Use global colors")} checked={offer.useGlobalColors !== false} onChange={(v) => onChange({ ...offer, useGlobalColors: v })} />
            <Checkbox label={tr("section2.fields.showInPreview", "Show in preview")} checked={!!offer.showInPreview} onChange={(v) => onChange({ ...offer, showInPreview: v })} />
            <div />
          </Grid3>

          {offer.useGlobalColors === false && (
            <>
              <Divider />
              <Grid3>
                <ColorField label={tr("section2.colors.cardBg", "Card background")} value={offer.colors?.cardBg || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), cardBg: v } })} placeholder="#FFFFFF" />
                <ColorField label={tr("section2.colors.borderColor", "Border color")} value={offer.colors?.borderColor || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), borderColor: v } })} placeholder="#E5E7EB" />
                <ColorField label={tr("section2.colors.iconBg", "Icon background")} value={offer.colors?.iconBg || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), iconBg: v } })} placeholder="#EEF2FF" />
              </Grid3>

              <Divider />

              <Grid3>
                <TextField label={tr("section2.offers.buttonText", "Button text")} value={offer.buttonText || ""} onChange={(v) => onChange({ ...offer, buttonText: v })} autoComplete="off" />
                <ColorField label={tr("section2.colors.buttonBg", "Button background")} value={offer.colors?.buttonBg || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonBg: v } })} placeholder="#111827" />
                <ColorField label={tr("section2.colors.buttonText", "Button text color")} value={offer.colors?.buttonTextColor || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonTextColor: v } })} placeholder="#FFFFFF" />
              </Grid3>

              <Grid3>
                <ColorField label={tr("section2.colors.buttonBorder", "Button border")} value={offer.colors?.buttonBorder || ""} onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonBorder: v } })} placeholder="#111827" />
                <div />
                <div />
              </Grid3>
            </>
          )}
        </GroupCard>

        <GroupCard title={tr("section2.groups.offerButton", "Button (Offer)")}>
          <Grid3>
            <TextField label={tr("section2.offers.buttonText", "Button text")} value={offer.buttonText || ""} onChange={(v) => onChange({ ...offer, buttonText: v })} autoComplete="off" />
            <div />
            <div />
          </Grid3>
        </GroupCard>
      </BlockStack>
    </div>
  );
}

function UpsellEditor({ upsell, index, products, onChange, onRemove, canRemove, tr }) {
  const productOptions = useMemo(() => {
    const opts = (products || []).map((p) => ({
      label: p.title || tr("section2.product.fallbackLabel", "Product"),
      value: String(p.id),
    }));
    return [{ label: tr("section2.product.placeholder", "— Choose a product —"), value: "" }, ...opts];
  }, [products, tr]);

  return (
    <div className="item-card">
      {canRemove && (
        <div className="remove-btn" onClick={onRemove} title={tr("section2.common.remove", "Remove")}>
          ×
        </div>
      )}

      <div className="item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            {tr("section2.upsells.itemTitlePrefix", "Upsell")} {index + 1}
          </Text>
        </InlineStack>
        <Checkbox label={tr("section2.common.enable", "Enable")} checked={!!upsell.enabled} onChange={(v) => onChange({ ...upsell, enabled: v })} />
      </div>

      <BlockStack gap="400">
        <GroupCard title={tr("section2.groups.content", "Content")}>
          <Grid3>
            <TextField label={tr("section2.fields.title", "Title")} value={upsell.title || ""} onChange={(v) => onChange({ ...upsell, title: v })} autoComplete="off" />
            <TextField label={tr("section2.fields.description", "Text")} value={upsell.description || ""} onChange={(v) => onChange({ ...upsell, description: v })} autoComplete="off" />
            <Select label={tr("section2.fields.layoutStyle", "Layout style")} value={upsell.layoutStyle || "image-left"} options={LAYOUT_STYLE_OPTIONS} onChange={(v) => onChange({ ...upsell, layoutStyle: v })} />
          </Grid3>

          <Grid3>
            <Select label={tr("section2.fields.product", "Shopify product")} value={upsell.productId ? String(upsell.productId) : ""} options={productOptions} onChange={(v) => onChange({ ...upsell, productId: v })} />
            <TextField label={tr("section2.fields.imageUrl", "Image URL")} value={upsell.imageUrl || ""} onChange={(v) => onChange({ ...upsell, imageUrl: v })} placeholder="https://cdn.shopify.com/..." autoComplete="off" />
            <TextField label={tr("section2.fields.iconUrl", "Icon URL")} value={upsell.iconUrl || ""} onChange={(v) => onChange({ ...upsell, iconUrl: v })} placeholder="https://cdn.shopify.com/..." autoComplete="off" />
          </Grid3>
        </GroupCard>

        <GroupCard title={tr("section2.groups.design", "Design")}>
          <Grid3>
            <Checkbox label={tr("section2.fields.useGlobalColors", "Use global colors")} checked={upsell.useGlobalColors !== false} onChange={(v) => onChange({ ...upsell, useGlobalColors: v })} />
            <Checkbox label={tr("section2.fields.showInPreview", "Show in preview")} checked={!!upsell.showInPreview} onChange={(v) => onChange({ ...upsell, showInPreview: v })} />
            <div />
          </Grid3>

          {upsell.useGlobalColors === false && (
            <>
              <Divider />
              <Grid3>
                <ColorField label={tr("section2.colors.cardBg", "Card background")} value={upsell.colors?.cardBg || ""} onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), cardBg: v } })} placeholder="#FFFFFF" />
                <ColorField label={tr("section2.colors.borderColor", "Border color")} value={upsell.colors?.borderColor || ""} onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), borderColor: v } })} placeholder="#E5E7EB" />
                <ColorField label={tr("section2.colors.iconBg", "Icon background")} value={upsell.colors?.iconBg || ""} onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), iconBg: v } })} placeholder="#EEF2FF" />
              </Grid3>
            </>
          )}
        </GroupCard>
      </BlockStack>
    </div>
  );
}

/* ============================== Thank You Editor ============================== */
function ThankYouEditor({ thankYou, globalColors, onChange, tr }) {
  const ty = thankYou || DEFAULT_THANKYOU;

  // internal sub-tabs (like Canva tools)
  const [subTab, setSubTab] = useState("mode");
  const subTabs = useMemo(
    () => [
      { id: "mode", content: tr("thankyou.subtabs.mode", "Mode") },
      { id: "content", content: tr("thankyou.subtabs.content", "Content") },
      { id: "actions", content: tr("thankyou.subtabs.actions", "Buttons") },
      { id: "design", content: tr("thankyou.subtabs.design", "Design") },
    ],
    [tr]
  );
  const subSelected = Math.max(0, subTabs.findIndex((x) => x.id === subTab));

  const update = (patch) => onChange({ ...ty, ...patch });

  const useGlobal = ty.useGlobalColors !== false;
  const colors = useGlobal ? globalColors : ty.colors || DEFAULT_THANKYOU_COLORS;

  return (
    <BlockStack gap="400">
      <GroupCard title={tr("thankyou.titleGroup", "Thank You Page")}>
        <Grid3>
          <Checkbox
            label={tr("thankyou.enable", "Enable Thank You Page experience")}
            checked={ty.enabled !== false}
            onChange={(v) => update({ enabled: v })}
          />
          <div />
          <div />
        </Grid3>

        <Divider />

        <Tabs
          tabs={subTabs.map((x) => ({ id: x.id, content: x.content, panelID: `ty-${x.id}` }))}
          selected={subSelected}
          onSelect={(i) => setSubTab(subTabs[i]?.id || "mode")}
        />

        <Divider />

        {/* MODE */}
        {subTab === "mode" && (
          <BlockStack gap="400">
            <Grid3>
              <Select
                label={tr("thankyou.mode.label", "Thank you mode")}
                value={ty.mode || "simple"}
                options={THANKYOU_MODE_OPTIONS}
                onChange={(v) => update({ mode: v })}
                helpText={tr(
                  "thankyou.mode.help",
                  "Simple shows a message area. Popup opens after successful order."
                )}
              />

              <Select
                label={tr("thankyou.size.label", "Popup size")}
                value={ty.size || "md"}
                options={THANKYOU_SIZE_OPTIONS}
                onChange={(v) => update({ size: v })}
                disabled={ty.mode !== "popup"}
              />

              <TextField
                type="number"
                label={tr("thankyou.delay.label", "Auto open delay (ms)")}
                value={String(clampInt(ty.autoOpenDelayMs, 0, 5000, 250))}
                onChange={(v) => update({ autoOpenDelayMs: clampInt(v, 0, 5000, 250) })}
                disabled={ty.mode !== "popup"}
                helpText={tr("thankyou.delay.help", "0 = open instantly. Example: 250ms.")}
              />
            </Grid3>

            <Divider />

            <Text as="p" variant="bodySm" tone="subdued">
              {tr(
                "thankyou.mode.note",
                "Storefront behavior needs the frontend script to show this popup after submit success."
              )}
            </Text>
          </BlockStack>
        )}

        {/* CONTENT */}
        {subTab === "content" && (
          <BlockStack gap="400">
            <Grid3>
              <TextField
                label={tr("thankyou.fields.title", "Title")}
                value={ty.title || ""}
                onChange={(v) => update({ title: v })}
                autoComplete="off"
              />
              <TextField
                label={tr("thankyou.fields.chipText", "Status chip text")}
                value={ty.chipText || ""}
                onChange={(v) => update({ chipText: v })}
                autoComplete="off"
                helpText={tr("thankyou.fields.chipHelp", "Small label like: Order confirmed")}
              />
              <Checkbox
                label={tr("thankyou.fields.showChip", "Show chip")}
                checked={ty.showChip !== false}
                onChange={(v) => update({ showChip: v })}
              />
            </Grid3>

            <TextField
              label={tr("thankyou.fields.message", "Message")}
              value={ty.message || ""}
              onChange={(v) => update({ message: v })}
              autoComplete="off"
              multiline={4}
            />

            <Divider />

            {/* "Canva like" media tools: URL + button to pick Shopify image (placeholder) */}
            <GroupCard title={tr("thankyou.media.title", "Media (Image & Icon)")}>
              <Grid3>
                <TextField
                  label={tr("thankyou.media.imageUrl", "Image URL")}
                  value={ty.imageUrl || ""}
                  onChange={(v) => update({ imageUrl: v })}
                  placeholder="https://cdn.shopify.com/..."
                  autoComplete="off"
                  helpText={tr(
                    "thankyou.media.imageHelp",
                    "Paste a URL or use the button to pick a Shopify image (if connected)."
                  )}
                />
                <TextField
                  label={tr("thankyou.media.iconUrl", "Icon URL")}
                  value={ty.iconUrl || ""}
                  onChange={(v) => update({ iconUrl: v })}
                  placeholder="https://cdn.shopify.com/..."
                  autoComplete="off"
                />
                <div style={{ display: "grid", gap: 10 }}>
                  <Button
                    onClick={() => alert(tr("thankyou.media.pickNotConnected", "Shopify image picker is not connected here. Paste an URL for now."))}
                    icon={PI.ImageIcon}
                  >
                    {tr("thankyou.media.pickImage", "Pick Shopify image")}
                  </Button>

                  <Button
                    onClick={() => update({ imageUrl: "", iconUrl: "" })}
                    icon={PI.DeleteIcon}
                    variant="secondary"
                  >
                    {tr("thankyou.media.clear", "Clear media")}
                  </Button>
                </div>
              </Grid3>

              <Divider />

              <Grid3>
                <Select
                  label={tr("thankyou.layout.label", "Layout")}
                  value={ty.layout || "image-top"}
                  options={THANKYOU_LAYOUT_OPTIONS}
                  onChange={(v) => update({ layout: v })}
                />
                <TextField
                  type="number"
                  label={tr("thankyou.layout.imageHeight", "Image height (px)")}
                  value={String(clampInt(ty.imageHeight, 120, 240, 160))}
                  onChange={(v) => update({ imageHeight: clampInt(v, 120, 240, 160) })}
                />
                <TextField
                  type="number"
                  label={tr("thankyou.layout.radius", "Border radius")}
                  value={String(clampInt(ty.radius, 10, 28, 16))}
                  onChange={(v) => update({ radius: clampInt(v, 10, 28, 16) })}
                />
              </Grid3>
            </GroupCard>
          </BlockStack>
        )}

        {/* ACTIONS */}
        {subTab === "actions" && (
          <BlockStack gap="400">
            <GroupCard title={tr("thankyou.actions.primary", "Primary button")}>
              <Grid3>
                <Checkbox
                  label={tr("thankyou.actions.primaryEnabled", "Enable primary button")}
                  checked={ty.primaryEnabled !== false}
                  onChange={(v) => update({ primaryEnabled: v })}
                />
                <TextField
                  label={tr("thankyou.actions.primaryText", "Button text")}
                  value={ty.primaryText || ""}
                  onChange={(v) => update({ primaryText: v })}
                  autoComplete="off"
                />
                <TextField
                  label={tr("thankyou.actions.primaryUrl", "Button URL")}
                  value={ty.primaryUrl || ""}
                  onChange={(v) => update({ primaryUrl: v })}
                  placeholder="/"
                  autoComplete="off"
                />
              </Grid3>
            </GroupCard>

            <GroupCard title={tr("thankyou.actions.secondary", "Secondary link")}>
              <Grid3>
                <Checkbox
                  label={tr("thankyou.actions.secondaryEnabled", "Enable secondary link")}
                  checked={!!ty.secondaryEnabled}
                  onChange={(v) => update({ secondaryEnabled: v })}
                />
                <TextField
                  label={tr("thankyou.actions.secondaryText", "Link text")}
                  value={ty.secondaryText || ""}
                  onChange={(v) => update({ secondaryText: v })}
                  autoComplete="off"
                  disabled={!ty.secondaryEnabled}
                />
                <TextField
                  label={tr("thankyou.actions.secondaryUrl", "Link URL")}
                  value={ty.secondaryUrl || ""}
                  onChange={(v) => update({ secondaryUrl: v })}
                  placeholder="/pages/track-order"
                  autoComplete="off"
                  disabled={!ty.secondaryEnabled}
                />
              </Grid3>
            </GroupCard>
          </BlockStack>
        )}

        {/* DESIGN */}
        {subTab === "design" && (
          <BlockStack gap="400">
            <Grid3>
              <Checkbox
                label={tr("thankyou.design.useGlobal", "Use global (Offers) colors")}
                checked={ty.useGlobalColors !== false}
                onChange={(v) => update({ useGlobalColors: v })}
                helpText={tr(
                  "thankyou.design.useGlobalHelp",
                  "If enabled, Thank You colors follow the Offers global palette."
                )}
              />
              <div />
              <div />
            </Grid3>

            {ty.useGlobalColors === false && (
              <>
                <Text as="p" variant="bodySm" tone="subdued">
                  {tr(
                    "thankyou.design.paletteHint",
                    "Pick a palette for the Thank You popup/page."
                  )}
                </Text>

                <PaletteSelector
                  value={(ty.colors?.paletteId || DEFAULT_THANKYOU_COLORS.paletteId) || "brand-gradient"}
                  onChange={(paletteId) =>
                    update({
                      colors: applyPalette(paletteId, ty.colors || DEFAULT_THANKYOU_COLORS),
                    })
                  }
                />

                <Divider />

                <Text as="p" variant="bodySm" fontWeight="bold">
                  {tr("thankyou.design.manual", "Manual colors")}
                </Text>

                <Grid3>
                  <ColorField
                    label={tr("thankyou.colors.cardBg", "Card background")}
                    value={ty.colors?.cardBg || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), cardBg: v } })}
                    placeholder="#FFFFFF"
                  />
                  <ColorField
                    label={tr("thankyou.colors.borderColor", "Border color")}
                    value={ty.colors?.borderColor || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), borderColor: v } })}
                    placeholder="#E5E7EB"
                  />
                  <ColorField
                    label={tr("thankyou.colors.iconBg", "Icon background")}
                    value={ty.colors?.iconBg || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), iconBg: v } })}
                    placeholder="#EEF2FF"
                  />
                </Grid3>

                <Grid3>
                  <ColorField
                    label={tr("thankyou.colors.buttonBg", "Button background")}
                    value={ty.colors?.buttonBg || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), buttonBg: v } })}
                    placeholder="#0B3B82"
                  />
                  <ColorField
                    label={tr("thankyou.colors.buttonText", "Button text color")}
                    value={ty.colors?.buttonTextColor || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), buttonTextColor: v } })}
                    placeholder="#FFFFFF"
                  />
                  <ColorField
                    label={tr("thankyou.colors.buttonBorder", "Button border")}
                    value={ty.colors?.buttonBorder || ""}
                    onChange={(v) => update({ colors: { ...(ty.colors || {}), buttonBorder: v } })}
                    placeholder="#0B3B82"
                  />
                </Grid3>
              </>
            )}

            {ty.useGlobalColors !== false && (
              <Text as="p" variant="bodySm" tone="subdued">
                {tr(
                  "thankyou.design.usingGlobalNote",
                  "Using global palette from Offers. To customize separately, disable 'Use global colors'."
                )}
              </Text>
            )}
          </BlockStack>
        )}
      </GroupCard>
    </BlockStack>
  );
}

/* ============================== HEADER / SHELL ============================== */
function PageShell({ children, tr, loading, onSave, saving, dirty }) {
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
              <div style={{ fontWeight: 950, color: "#F9FAFB" }}>
                {tr("section2.header.appTitle", "TripleForm COD")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.85)" }}>
                {tr("section2.header.subtitle", "Offers & Upsells — Pro settings")}
              </div>
            </div>

            {dirty ? (
              <Badge tone="warning">{tr("section2.badge.unsaved", "Unsaved changes")}</Badge>
            ) : (
              <Badge tone="success">{tr("section2.badge.saved", "Saved")}</Badge>
            )}
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {loading ? tr("section2.common.loading", "Loading...") : ""}
            </div>
            <Button variant="primary" size="slim" onClick={onSave} loading={saving}>
              {tr("section2.button.save", "Save")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== MAIN ============================== */
function Section2OffersInner({ products = [] }) {
  const { tr } = useT();
  useInjectCss();

  const [cfg, setCfg] = useState(() => DEFAULT_CFG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("global");

  const lastSavedKeyRef = useRef("");
  const currentKey = useMemo(() => {
    try {
      return JSON.stringify(cfg);
    } catch {
      return String(Date.now());
    }
  }, [cfg]);

  const dirty = useMemo(() => currentKey !== lastSavedKeyRef.current, [currentKey]);

  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingTabRef = useRef(null);

  const tabs = useMemo(
    () => [
      { id: "global", content: tr("section2.tabs.global", "Global"), panelID: "tab-global", icon: "SettingsIcon" },
      { id: "offers", content: tr("section2.tabs.offers", "Offers"), panelID: "tab-offers", icon: "DiscountIcon" },
      { id: "upsells", content: tr("section2.tabs.upsells", "Upsells"), panelID: "tab-upsells", icon: "GiftCardIcon" },
      // ✅ NEW TAB
      { id: "thankyou", content: tr("section2.tabs.thankyou", "Thank you page"), panelID: "tab-thankyou", icon: "ImageIcon" },
    ],
    [tr]
  );
  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === tab));

  const persistLocal = (next) => {
    try {
      window.localStorage.setItem("tripleform_cod_offers_v32", JSON.stringify(withDefaults(next)));
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      try {
        // keep compatibility: if backend still stores in "offers", merge our new keys
        const res = await fetch("/api/offers/load");
        if (res.ok) {
          const j = await res.json().catch(() => null);
          if (!cancelled && j?.ok && j.offers) {
            const merged = withDefaults(j.offers);
            setCfg(merged);
            persistLocal(merged);
            lastSavedKeyRef.current = JSON.stringify(merged);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("[Section2Offers] load failed, fallback localStorage", e);
      }

      if (!cancelled) {
        try {
          const s = window.localStorage.getItem("tripleform_cod_offers_v32");
          if (s) {
            const parsed = withDefaults(JSON.parse(s));
            setCfg(parsed);
            lastSavedKeyRef.current = JSON.stringify(parsed);
          } else {
            // fallback old key
            const old = window.localStorage.getItem("tripleform_cod_offers_v31");
            if (old) {
              const parsedOld = withDefaults(JSON.parse(old));
              setCfg(parsedOld);
              lastSavedKeyRef.current = JSON.stringify(parsedOld);
            } else {
              lastSavedKeyRef.current = JSON.stringify(DEFAULT_CFG);
            }
          }
        } catch {
          lastSavedKeyRef.current = JSON.stringify(DEFAULT_CFG);
        }
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
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      lastSavedKeyRef.current = JSON.stringify(toSave);
    } catch (e) {
      console.error(e);
      alert(
        tr("section2.save.failed", "Save failed: ") +
          (e?.message || tr("section2.save.unknown", "Unknown error"))
      );
    } finally {
      setSaving(false);
    }
  };

  const requestTabChange = (nextTab) => {
    if (nextTab === tab) return;
    if (!dirty) {
      setTab(nextTab);
      return;
    }
    pendingTabRef.current = nextTab;
    setConfirmOpen(true);
  };

  const applyPendingTab = () => {
    const nextTab = pendingTabRef.current;
    pendingTabRef.current = null;
    if (nextTab) setTab(nextTab);
  };

  const discardChanges = () => {
    try {
      const saved = JSON.parse(lastSavedKeyRef.current || "{}");
      const restored = withDefaults(saved);
      setCfg(restored);
    } catch {}
    setConfirmOpen(false);
    applyPendingTab();
  };

  const addOffer = () => {
    if (cfg.offers.length >= 3) return;
    setCfg((prev) => ({ ...prev, offers: [...prev.offers, JSON.parse(JSON.stringify(DEFAULT_OFFER))] }));
  };
  const updateOffer = (index, updatedOffer) => {
    setCfg((prev) => ({ ...prev, offers: prev.offers.map((o, i) => (i === index ? updatedOffer : o)) }));
  };
  const removeOffer = (index) => {
    if (cfg.offers.length <= 1) return;
    setCfg((prev) => ({ ...prev, offers: prev.offers.filter((_, i) => i !== index) }));
  };

  const addUpsell = () => {
    if (cfg.upsells.length >= 3) return;
    setCfg((prev) => ({ ...prev, upsells: [...prev.upsells, JSON.parse(JSON.stringify(DEFAULT_UPSELL))] }));
  };
  const updateUpsell = (index, updatedUpsell) => {
    setCfg((prev) => ({ ...prev, upsells: prev.upsells.map((u, i) => (i === index ? updatedUpsell : u)) }));
  };
  const removeUpsell = (index) => {
    if (cfg.upsells.length <= 1) return;
    setCfg((prev) => ({ ...prev, upsells: prev.upsells.filter((_, i) => i !== index) }));
  };

  const globalColors = cfg.global?.colors || DEFAULT_GLOBAL_COLORS;

  const activeOffers = cfg.offers.filter((o) => o.enabled && o.showInPreview);
  const activeUpsells = cfg.upsells.filter((u) => u.enabled && u.showInPreview);

  const thankYou = cfg.thankYou || DEFAULT_THANKYOU;

  return (
    <PageShell tr={tr} loading={loading} onSave={saveOffers} saving={saving} dirty={dirty}>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={tr("section2.modal.unsavedTitle", "Unsaved changes")}
        primaryAction={{
          content: saving ? tr("section2.modal.saving", "Saving...") : tr("section2.modal.saveContinue", "Save & continue"),
          onAction: async () => {
            await saveOffers();
            setConfirmOpen(false);
            applyPendingTab();
          },
          loading: saving,
        }}
        secondaryActions={[
          { content: tr("section2.modal.cancel", "Cancel"), onAction: () => setConfirmOpen(false) },
          { content: tr("section2.modal.discard", "Discard"), onAction: discardChanges, destructive: true },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            {tr("section2.modal.unsavedBody", "You have unsaved changes. Save or discard before switching sections.")}
          </Text>
        </Modal.Section>
      </Modal>

      {/* ✅ Top Tabs centered */}
      <div className="tf-topnav">
        <div className="tf-topnav-center">
          <div>
            <Tabs
              tabs={tabs.map((x) => ({ id: x.id, content: x.content, panelID: x.panelID }))}
              selected={selectedTabIndex}
              onSelect={(i) => requestTabChange(tabs[i]?.id || "global")}
            />
          </div>
        </div>
      </div>

      <div className="tf-editor">
        <div className="tf-main-col">
          <div className="tf-hero">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <span className="tf-hero-badge">
                  {cfg.offers.filter((o) => o.enabled).length} {tr("section2.badge.offers", "Offers")} •{" "}
                  {cfg.upsells.filter((u) => u.enabled).length} {tr("section2.badge.upsells", "Upsells")}
                  {" • "}
                  {thankYou?.enabled !== false ? tr("thankyou.badge.on", "ThankYou ON") : tr("thankyou.badge.off", "ThankYou OFF")}
                </span>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 14 }}>
                    {tr("section2.hero.title", "Offers & Upsells")}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    {tr("section2.hero.subtitle", "Clean settings + professional preview")}
                  </div>
                </div>
              </InlineStack>
              <InlineStack gap="200" blockAlign="center">
                <SafeIcon name={tabs[selectedTabIndex]?.icon || "AppsIcon"} fallback="AppsIcon" />
                <div style={{ fontSize: 12, opacity: 0.9 }}>{tabs[selectedTabIndex]?.content}</div>
              </InlineStack>
            </InlineStack>
          </div>

          <div className="tf-panel">
            {tab === "global" && (
              <BlockStack gap="400">
                <GroupCard title={tr("section2.global.title", "Global")}>
                  <Grid3>
                    <Checkbox
                      label={tr("section2.global.enable", "Enable Offers & Upsells")}
                      checked={!!cfg.global.enabled}
                      onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, enabled: v } }))}
                    />
                    <div />
                    <div />
                  </Grid3>

                  <Divider />

                  <Text as="p" variant="bodySm" tone="subdued">
                    {tr("section2.global.paletteHint", "Choose a global palette (applied to all items by default).")}
                  </Text>

                  <PaletteSelector
                    value={globalColors.paletteId || "clean-pro"}
                    onChange={(paletteId) =>
                      setCfg((c) => ({
                        ...c,
                        global: {
                          ...c.global,
                          colors: applyPaletteToGlobal(c.global?.colors || DEFAULT_GLOBAL_COLORS, paletteId),
                        },
                      }))
                    }
                  />

                  <Divider />

                  <Text as="p" variant="bodySm" fontWeight="bold">
                    {tr("section2.global.manualColorsTitle", "Global colors")}
                  </Text>

                  <Grid3>
                    <ColorField label={tr("section2.colors.cardBg", "Card background")} value={globalColors.cardBg} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, cardBg: v } } }))} placeholder="#FFFFFF" />
                    <ColorField label={tr("section2.colors.borderColor", "Border color")} value={globalColors.borderColor} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, borderColor: v } } }))} placeholder="#E5E7EB" />
                    <ColorField label={tr("section2.colors.iconBg", "Icon background")} value={globalColors.iconBg} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, iconBg: v } } }))} placeholder="#EEF2FF" />
                  </Grid3>

                  <Grid3>
                    <ColorField label={tr("section2.colors.buttonBg", "Button background")} value={globalColors.buttonBg} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonBg: v } } }))} placeholder="#111827" />
                    <ColorField label={tr("section2.colors.buttonText", "Button text color")} value={globalColors.buttonTextColor} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonTextColor: v } } }))} placeholder="#FFFFFF" />
                    <ColorField label={tr("section2.colors.buttonBorder", "Button border")} value={globalColors.buttonBorder} onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonBorder: v } } }))} placeholder="#111827" />
                  </Grid3>
                </GroupCard>
              </BlockStack>
            )}

            {tab === "offers" && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {tr("section2.offers.title", "Offers")} ({cfg.offers.length}/3)
                  </Text>
                  <Badge tone="subdued">{tr("section2.badge.proSettings", "Pro settings")}</Badge>
                </InlineStack>

                {cfg.offers.map((offer, index) => (
                  <OfferEditor
                    key={index}
                    offer={offer}
                    index={index}
                    products={products}
                    onChange={(updated) => updateOffer(index, updated)}
                    onRemove={() => removeOffer(index)}
                    canRemove={cfg.offers.length > 1}
                    tr={tr}
                  />
                ))}

                <div className="add-wrap">
                  <div className="add-btn">
                    <Button fullWidth onClick={addOffer} disabled={cfg.offers.length >= 3} icon={PI.CirclePlusIcon}>
                      {tr("section2.offers.add", "Add an offer")}
                    </Button>
                  </div>
                </div>
              </BlockStack>
            )}

            {tab === "upsells" && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {tr("section2.upsells.title", "Upsells")} ({cfg.upsells.length}/3)
                  </Text>
                  <Badge tone="subdued">{tr("section2.badge.noButton", "No button")}</Badge>
                </InlineStack>

                {cfg.upsells.map((upsell, index) => (
                  <UpsellEditor
                    key={index}
                    upsell={upsell}
                    index={index}
                    products={products}
                    onChange={(updated) => updateUpsell(index, updated)}
                    onRemove={() => removeUpsell(index)}
                    canRemove={cfg.upsells.length > 1}
                    tr={tr}
                  />
                ))}

                <div className="add-wrap">
                  <div className="add-btn">
                    <Button fullWidth onClick={addUpsell} disabled={cfg.upsells.length >= 3} icon={PI.CirclePlusIcon}>
                      {tr("section2.upsells.add", "Add an upsell")}
                    </Button>
                  </div>
                </div>
              </BlockStack>
            )}

            {/* ✅ NEW: THANK YOU PAGE TAB */}
            {tab === "thankyou" && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {tr("thankyou.tabTitle", "Thank you page")}
                  </Text>
                  <Badge tone="subdued">{tr("thankyou.badge.pro", "Pro tools")}</Badge>
                </InlineStack>

                <ThankYouEditor
                  thankYou={thankYou}
                  globalColors={globalColors}
                  onChange={(nextTy) => setCfg((c) => ({ ...c, thankYou: nextTy }))}
                  tr={tr}
                />
              </BlockStack>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="tf-preview-col">
          <div className="tf-preview-card">
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {tr("section2.preview.title", "Preview")}
                </Text>
                <Badge tone={cfg.global.enabled ? "success" : "critical"}>
                  {cfg.global.enabled ? tr("section2.preview.active", "Active") : tr("section2.preview.inactive", "Inactive")}
                </Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                {tr("section2.preview.subtitle", "Fast preview (what the customer sees).")}
              </Text>

              <Divider />

              <Text as="p" variant="bodySm" fontWeight="bold">
                {tr("section2.preview.offersTitle", "Offers")}
              </Text>
              {activeOffers.length ? (
                <BlockStack gap="200">
                  {activeOffers.map((o, idx) => (
                    <PreviewCard key={`o-${idx}`} item={o} products={products} isOffer globalColors={globalColors} tr={tr} />
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodySm" tone="subdued">
                  {tr("section2.preview.noOffer", "No active offer in preview.")}
                </Text>
              )}

              <Divider />

              <Text as="p" variant="bodySm" fontWeight="bold">
                {tr("section2.preview.upsellsTitle", "Upsells")}
              </Text>
              {activeUpsells.length ? (
                <BlockStack gap="200">
                  {activeUpsells.map((u, idx) => (
                    <PreviewCard key={`u-${idx}`} item={u} products={products} isOffer={false} globalColors={globalColors} tr={tr} />
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodySm" tone="subdued">
                  {tr("section2.preview.noUpsell", "No active upsell in preview.")}
                </Text>
              )}

              <Divider />

              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodySm" fontWeight="bold">
                  {tr("thankyou.preview.title", "Thank you page")}
                </Text>
                <Badge tone={thankYou?.enabled !== false ? "success" : "critical"}>
                  {thankYou?.enabled !== false ? tr("thankyou.preview.on", "Enabled") : tr("thankyou.preview.off", "Disabled")}
                </Badge>
              </InlineStack>

              {thankYou?.enabled !== false ? (
                <ThankYouPreview thankYou={thankYou} globalColors={globalColors} tr={tr} />
              ) : (
                <Text variant="bodySm" tone="subdued">
                  {tr("thankyou.preview.disabled", "Thank you page is disabled.")}
                </Text>
              )}
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;
