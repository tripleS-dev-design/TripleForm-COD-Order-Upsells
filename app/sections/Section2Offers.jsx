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

  // t(key) with fallback (no hard-coded "UI text" blocking you)
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

  /* ✅ preview column a bit wider, settings more compact */
  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 380px;
    gap:16px;
    align-items:start;
  }

  .tf-main-col{ display:grid; gap:16px; min-width:0; }

  .tf-hero {
    background:#FFFFFF;
    border-radius:12px;
    padding:10px 14px; /* smaller */
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
    padding:14px; /* tighter */
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

  /* ====== Palette selector (like pro) ====== */
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

  /* ====== Preview cards (bigger product) ====== */
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

  /* Layout styles */
  .preview-style--image-right .preview-row { flex-direction: row-reverse; }
  .preview-style--image-top .preview-row { flex-direction: column; align-items: stretch; }
  .preview-style--image-top .preview-img { width:100%; height:160px; border-radius:16px; }
  .preview-style--image-bottom .preview-row { flex-direction: column-reverse; align-items: stretch; }
  .preview-style--image-bottom .preview-img { width:100%; height:160px; border-radius:16px; }
  .preview-style--image-bottom .preview-desc { font-size:11px; } /* smaller text bottom */

  .add-wrap { display:flex; justify-content:center; margin-top:12px; }
  .add-btn {
    width:100%;
    max-width:520px;
    border-radius:14px;
    padding:12px;
    border:2px dashed #D1D5DB;
    background:#F9FAFB;
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
  if (Array.isArray(product?.media)) product.media.forEach((m) => push(m?.preview?.image || m?.image));

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

  // ✅ URL only for icon + image
  iconUrl: "",
  imageUrl: "",

  // ✅ 4 layouts
  layoutStyle: "image-left",

  // ✅ use global colors by default
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

  // ✅ NEW: discount settings (used by storefront JS)
  discountEnabled: false,
  discountType: "percentage", // "percentage" | "fixed"
  discountValue: 10, // % or fixed amount (currency units)
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

const DEFAULT_CFG = {
  meta: { version: 30 },
  global: {
    enabled: true,
    colors: { ...DEFAULT_GLOBAL_COLORS },
  },
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
};

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };

  x.global = { ...d.global, ...(raw.global || {}) };
  x.global.colors = { ...DEFAULT_GLOBAL_COLORS, ...((raw.global || {}).colors || {}) };

  x.offers = Array.isArray(raw.offers) ? raw.offers : d.offers;
  x.upsells = Array.isArray(raw.upsells) ? raw.upsells : d.upsells;

  x.offers = x.offers.slice(0, 3).map((o) => ({
    ...DEFAULT_OFFER,
    ...o,
    colors: { ...DEFAULT_OFFER.colors, ...(o?.colors || {}) },
    // ✅ ensure discount fields exist even for old saved configs
    discountEnabled: o?.discountEnabled ?? false,
    discountType: o?.discountType || "percentage",
    discountValue:
      typeof o?.discountValue === "number"
        ? o.discountValue
        : o?.discountValue != null
        ? Number(o.discountValue) || 0
        : DEFAULT_OFFER.discountValue,
  }));

  x.upsells = x.upsells.slice(0, 3).map((u) => ({
    ...DEFAULT_UPSELL,
    ...u,
    colors: { ...DEFAULT_UPSELL.colors, ...(u?.colors || {}) },
  }));

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
              <span className="tf-palette-accent" style={{ background: accent }} title={accent} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function applyPaletteToGlobal(globalColors, paletteId) {
  const p = COLOR_PALETTES.find((x) => x.id === paletteId);
  if (!p?.preset) return globalColors;
  return { ...globalColors, paletteId, ...p.preset };
}

/* ============================== Preview renderer ============================== */
function PreviewCard({ item, products, isOffer, globalColors, tr }) {
  const product = item.productId ? getProductById(products, item.productId) : null;
  const images = product ? getProductImages(product) : [];

  // ✅ fixed "shopify product mock" fallback (clean)
  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23EEF2FF'/%3E%3Cstop offset='1' stop-color='%23F8FAFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='220' rx='18' fill='url(%23g)'/%3E%3Cpath d='M120 92l40-40 80 80v72H80V92z' fill='%234F46E5' opacity='.9'/%3E%3Ccircle cx='110' cy='78' r='18' fill='%2399A7FF' opacity='.85'/%3E%3C/svg%3E";

  const img = (item.imageUrl || "").trim() || images?.[0] || fallbackImg;

  const useGlobal = item.useGlobalColors !== false;
  const c = useGlobal ? globalColors : (item.colors || {});
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

  return (
    <div
      className={`preview-offer ${layoutClass}`}
      style={{
        background: cardBg,
        borderColor,
      }}
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
            <SafeIcon name={isOffer ? "DiscountIcon" : "GiftCardIcon"} fallback="AppsIcon" />
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
              {item.title || (isOffer ? tr("section2.offers.defaultTitle", "Offer") : tr("section2.upsells.defaultTitle", "Upsell"))}
            </div>

            {discountLabel ? (
              <Badge tone="success">
                {tr("section2.discount.badge", "Discount")} {discountLabel}
              </Badge>
            ) : null}
          </InlineStack>

          <div className="preview-desc">{item.description || ""}</div>

          <div className="preview-sub">
            {tr("section2.preview.productLabel", "Product")}:{" "}
            <b>{product?.title ? product.title : item.productId ? tr("section2.preview.productSelected", "Selected") : tr("section2.preview.productNone", "None")}</b>
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
              {item.buttonText || tr("section2.offers.buttonDefault", "Activate")}
            </button>
          )}
        </div>
      </div>
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
        <Checkbox
          label={tr("section2.common.enable", "Enable")}
          checked={!!offer.enabled}
          onChange={(v) => onChange({ ...offer, enabled: v })}
        />
      </div>

      <BlockStack gap="400">
        <GroupCard title={tr("section2.groups.content", "Content")}>
          <Grid3>
            <TextField
              label={tr("section2.fields.title", "Title")}
              value={offer.title || ""}
              onChange={(v) => onChange({ ...offer, title: v })}
              autoComplete="off"
            />
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

        {/* ✅ NEW GROUP: Discount */}
        <GroupCard title={tr("section2.groups.discount", "Discount (Offer)")}>
          <Grid3>
            <Checkbox
              label={tr("section2.discount.enable", "Enable discount")}
              checked={discountEnabled}
              onChange={(v) =>
                onChange({
                  ...offer,
                  discountEnabled: v,
                  // if disabled, keep values but storefront JS will ignore if you want
                  // (we'll also set discountValue to 0 if you want strict disabling)
                })
              }
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

                // percentage clamp 0-100
                const finalVal =
                  discountType === "percentage" ? Math.max(0, Math.min(100, safe)) : Math.max(0, safe);

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
            <Checkbox
              label={tr("section2.fields.useGlobalColors", "Use global colors")}
              checked={offer.useGlobalColors !== false}
              onChange={(v) => onChange({ ...offer, useGlobalColors: v })}
            />
            <Checkbox
              label={tr("section2.fields.showInPreview", "Show in preview")}
              checked={!!offer.showInPreview}
              onChange={(v) => onChange({ ...offer, showInPreview: v })}
            />
            <div />
          </Grid3>

          {offer.useGlobalColors === false && (
            <>
              <Divider />
              <Grid3>
                <ColorField
                  label={tr("section2.colors.cardBg", "Card background")}
                  value={offer.colors?.cardBg || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), cardBg: v } })}
                  placeholder="#FFFFFF"
                />
                <ColorField
                  label={tr("section2.colors.borderColor", "Border color")}
                  value={offer.colors?.borderColor || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), borderColor: v } })}
                  placeholder="#E5E7EB"
                />
                <ColorField
                  label={tr("section2.colors.iconBg", "Icon background")}
                  value={offer.colors?.iconBg || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), iconBg: v } })}
                  placeholder="#EEF2FF"
                />
              </Grid3>

              <Divider />

              <Grid3>
                <TextField
                  label={tr("section2.offers.buttonText", "Button text")}
                  value={offer.buttonText || ""}
                  onChange={(v) => onChange({ ...offer, buttonText: v })}
                  autoComplete="off"
                />
                <ColorField
                  label={tr("section2.colors.buttonBg", "Button background")}
                  value={offer.colors?.buttonBg || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonBg: v } })}
                  placeholder="#111827"
                />
                <ColorField
                  label={tr("section2.colors.buttonText", "Button text color")}
                  value={offer.colors?.buttonTextColor || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonTextColor: v } })}
                  placeholder="#FFFFFF"
                />
              </Grid3>

              <Grid3>
                <ColorField
                  label={tr("section2.colors.buttonBorder", "Button border")}
                  value={offer.colors?.buttonBorder || ""}
                  onChange={(v) => onChange({ ...offer, colors: { ...(offer.colors || {}), buttonBorder: v } })}
                  placeholder="#111827"
                />
                <div />
                <div />
              </Grid3>
            </>
          )}
        </GroupCard>

        {/* button group always visible (text) */}
        <GroupCard title={tr("section2.groups.offerButton", "Button (Offer)")}>
          <Grid3>
            <TextField
              label={tr("section2.offers.buttonText", "Button text")}
              value={offer.buttonText || ""}
              onChange={(v) => onChange({ ...offer, buttonText: v })}
              autoComplete="off"
            />
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
        <Checkbox
          label={tr("section2.common.enable", "Enable")}
          checked={!!upsell.enabled}
          onChange={(v) => onChange({ ...upsell, enabled: v })}
        />
      </div>

      <BlockStack gap="400">
        <GroupCard title={tr("section2.groups.content", "Content")}>
          <Grid3>
            <TextField
              label={tr("section2.fields.title", "Title")}
              value={upsell.title || ""}
              onChange={(v) => onChange({ ...upsell, title: v })}
              autoComplete="off"
            />
            <TextField
              label={tr("section2.fields.description", "Text")}
              value={upsell.description || ""}
              onChange={(v) => onChange({ ...upsell, description: v })}
              autoComplete="off"
            />
            <Select
              label={tr("section2.fields.layoutStyle", "Layout style")}
              value={upsell.layoutStyle || "image-left"}
              options={LAYOUT_STYLE_OPTIONS}
              onChange={(v) => onChange({ ...upsell, layoutStyle: v })}
            />
          </Grid3>

          <Grid3>
            <Select
              label={tr("section2.fields.product", "Shopify product")}
              value={upsell.productId ? String(upsell.productId) : ""}
              options={productOptions}
              onChange={(v) => onChange({ ...upsell, productId: v })}
            />
            <TextField
              label={tr("section2.fields.imageUrl", "Image URL")}
              value={upsell.imageUrl || ""}
              onChange={(v) => onChange({ ...upsell, imageUrl: v })}
              placeholder="https://cdn.shopify.com/..."
              autoComplete="off"
            />
            <TextField
              label={tr("section2.fields.iconUrl", "Icon URL")}
              value={upsell.iconUrl || ""}
              onChange={(v) => onChange({ ...upsell, iconUrl: v })}
              placeholder="https://cdn.shopify.com/..."
              autoComplete="off"
            />
          </Grid3>
        </GroupCard>

        <GroupCard title={tr("section2.groups.design", "Design")}>
          <Grid3>
            <Checkbox
              label={tr("section2.fields.useGlobalColors", "Use global colors")}
              checked={upsell.useGlobalColors !== false}
              onChange={(v) => onChange({ ...upsell, useGlobalColors: v })}
            />
            <Checkbox
              label={tr("section2.fields.showInPreview", "Show in preview")}
              checked={!!upsell.showInPreview}
              onChange={(v) => onChange({ ...upsell, showInPreview: v })}
            />
            <div />
          </Grid3>

          {upsell.useGlobalColors === false && (
            <>
              <Divider />
              <Grid3>
                <ColorField
                  label={tr("section2.colors.cardBg", "Card background")}
                  value={upsell.colors?.cardBg || ""}
                  onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), cardBg: v } })}
                  placeholder="#FFFFFF"
                />
                <ColorField
                  label={tr("section2.colors.borderColor", "Border color")}
                  value={upsell.colors?.borderColor || ""}
                  onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), borderColor: v } })}
                  placeholder="#E5E7EB"
                />
                <ColorField
                  label={tr("section2.colors.iconBg", "Icon background")}
                  value={upsell.colors?.iconBg || ""}
                  onChange={(v) => onChange({ ...upsell, colors: { ...(upsell.colors || {}), iconBg: v } })}
                  placeholder="#EEF2FF"
                />
              </Grid3>
            </>
          )}
        </GroupCard>
      </BlockStack>
    </div>
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
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>

            <div>
              <div style={{ fontWeight: 950, color: "#F9FAFB" }}>{tr("section2.header.appTitle", "TripleForm COD")}</div>
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
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>{loading ? tr("section2.common.loading", "Loading...") : ""}</div>
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

  // Unsaved changes logic
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

  // Modal when changing tab with unsaved changes
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingTabRef = useRef(null);

  const tabs = useMemo(
    () => [
      { id: "global", content: tr("section2.tabs.global", "Global"), panelID: "tab-global", icon: "SettingsIcon" },
      { id: "offers", content: tr("section2.tabs.offers", "Offers"), panelID: "tab-offers", icon: "DiscountIcon" },
      { id: "upsells", content: tr("section2.tabs.upsells", "Upsells"), panelID: "tab-upsells", icon: "GiftCardIcon" },
    ],
    [tr]
  );
  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === tab));

  const persistLocal = (next) => {
    try {
      window.localStorage.setItem("tripleform_cod_offers_v30", JSON.stringify(withDefaults(next)));
    } catch {}
  };

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
          const s = window.localStorage.getItem("tripleform_cod_offers_v30");
          if (s) {
            const parsed = withDefaults(JSON.parse(s));
            setCfg(parsed);
            lastSavedKeyRef.current = JSON.stringify(parsed);
          } else {
            lastSavedKeyRef.current = JSON.stringify(DEFAULT_CFG);
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
      alert(tr("section2.save.failed", "Save failed: ") + (e?.message || tr("section2.save.unknown", "Unknown error")));
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

  // ✅ global colors
  const globalColors = cfg.global?.colors || DEFAULT_GLOBAL_COLORS;

  const activeOffers = cfg.offers.filter((o) => o.enabled && o.showInPreview);
  const activeUpsells = cfg.upsells.filter((u) => u.enabled && u.showInPreview);

  return (
    <PageShell tr={tr} loading={loading} onSave={saveOffers} saving={saving} dirty={dirty}>
      {/* Confirm modal for unsaved changes */}
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

      {/* Top Tabs menu */}
      <div className="tf-topnav">
        <Tabs
          tabs={tabs.map((x) => ({ id: x.id, content: x.content, panelID: x.panelID }))}
          selected={selectedTabIndex}
          onSelect={(i) => requestTabChange(tabs[i]?.id || "global")}
        />
      </div>

      <div className="tf-editor">
        {/* MAIN */}
        <div className="tf-main-col">
          <div className="tf-hero">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <span className="tf-hero-badge">
                  {cfg.offers.filter((o) => o.enabled).length} {tr("section2.badge.offers", "Offers")} •{" "}
                  {cfg.upsells.filter((u) => u.enabled).length} {tr("section2.badge.upsells", "Upsells")}
                </span>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 14 }}>{tr("section2.hero.title", "Offers & Upsells")}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{tr("section2.hero.subtitle", "Clean settings + professional preview")}</div>
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
                        global: { ...c.global, colors: applyPaletteToGlobal(c.global?.colors || DEFAULT_GLOBAL_COLORS, paletteId) },
                      }))
                    }
                  />

                  <Divider />

                  <Text as="p" variant="bodySm" fontWeight="bold">
                    {tr("section2.global.manualColorsTitle", "Global colors")}
                  </Text>

                  <Grid3>
                    <ColorField
                      label={tr("section2.colors.cardBg", "Card background")}
                      value={globalColors.cardBg}
                      onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, cardBg: v } } }))}
                      placeholder="#FFFFFF"
                    />
                    <ColorField
                      label={tr("section2.colors.borderColor", "Border color")}
                      value={globalColors.borderColor}
                      onChange={(v) =>
                        setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, borderColor: v } } }))
                      }
                      placeholder="#E5E7EB"
                    />
                    <ColorField
                      label={tr("section2.colors.iconBg", "Icon background")}
                      value={globalColors.iconBg}
                      onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, iconBg: v } } }))}
                      placeholder="#EEF2FF"
                    />
                  </Grid3>

                  <Grid3>
                    <ColorField
                      label={tr("section2.colors.buttonBg", "Button background")}
                      value={globalColors.buttonBg}
                      onChange={(v) =>
                        setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonBg: v } } }))
                      }
                      placeholder="#111827"
                    />
                    <ColorField
                      label={tr("section2.colors.buttonText", "Button text color")}
                      value={globalColors.buttonTextColor}
                      onChange={(v) =>
                        setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonTextColor: v } } }))
                      }
                      placeholder="#FFFFFF"
                    />
                    <ColorField
                      label={tr("section2.colors.buttonBorder", "Button border")}
                      value={globalColors.buttonBorder}
                      onChange={(v) =>
                        setCfg((c) => ({ ...c, global: { ...c.global, colors: { ...globalColors, buttonBorder: v } } }))
                      }
                      placeholder="#111827"
                    />
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
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;
