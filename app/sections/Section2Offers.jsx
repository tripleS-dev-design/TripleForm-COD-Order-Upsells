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
    grid-template-columns: 280px minmax(0,2.3fr) minmax(0,1.5fr);
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
    border-radius:999px;
    padding:7px 10px;
    cursor:pointer;
    font-size:13px;
    transition:background 0.15s, box-shadow 0.15s, transform 0.12s;
  }
  .tf-rail-item[data-sel="1"] {
    background:#EEF2FF;
    border-color:#4F46E5;
    box-shadow:0 8px 18px rgba(79,70,229,.35);
    transform:translateY(-1px);
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
    padding:12px;
    box-shadow:0 18px 36px rgba(15,23,42,0.06);
  }

  .tf-preview-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-preview-card {
    background:#FFFFFF;
    border-radius:18px;
    padding:14px;
    box-shadow:0 24px 50px rgba(15,23,42,0.16);
    border:1px solid #E5E7EB;
  }

  /* >>> GRANDS TITRES — même design que la bande du header <<< */
  .tf-group-title {
    padding:10px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:1px solid rgba(0,167,163,0.85);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:800;
    letter-spacing:.02em;
    margin-bottom:10px;
    font-size:13px;
    box-shadow:0 6px 18px rgba(11,59,130,0.35);
  }

  /* ---- Preview OFFERS / UPSELL (cartes en haut) ---- */
  .offers-status-bar {
    border-radius:10px;
    padding:8px 10px;
    margin-bottom:10px;
  }

  .offers-strip {
    display:grid;
    grid-template-columns:68px minmax(0,1fr);
    gap:12px;
    align-items:center;
    border-radius:16px;
  }
  .offers-strip + .offers-strip {
    margin-top:10px;
  }
  .offers-strip-thumb {
    width:64px;
    height:64px;
    border-radius:18px;
    overflow:hidden;
    border:1px solid rgba(248,250,252,0.4);
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .offers-strip-thumb-inner {
    width:100%;
    height:100%;
    border-radius:16px;
    background:linear-gradient(135deg,#3B82F6 0%,#A855F7 40%,#F97316 100%);
  }
  .offers-strip-thumb-inner-upsell {
    width:100%;
    height:100%;
    border-radius:16px;
    background:linear-gradient(135deg,#EC4899 0%,#F97316 40%,#22C55E 100%);
  }
  .offers-strip-thumb img {
    width:100%;
    height:100%;
    object-fit:cover;
    border-radius:16px;
  }
  .offers-strip-title {
    font-size:11px;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:.08em;
    opacity:.9;
    display:flex;
    align-items:center;
    gap:6px;
  }
  .offers-strip-icon {
    width:22px;
    height:22px;
    border-radius:999px;
    display:grid;
    place-items:center;
    font-size:13px;
    flex-shrink:0;
    overflow:hidden;
  }
  .offers-strip-main {
    font-size:13px;
    font-weight:600;
    margin-top:2px;
  }
  .offers-strip-desc {
    font-size:12px;
    margin-top:1px;
  }

  /* ---- Preview Order summary + form (copie de Forms COD style) ---- */
  .cod-preview-grid {
    margin-top:14px;
    display:grid;
    gap:12px;
  }
  .cod-card {
    background:#F9FAFB;
    border-radius:14px;
    padding:12px;
    border:1px solid #E5E7EB;
  }
  .cod-card-title {
    font-size:13px;
    font-weight:600;
    margin-bottom:8px;
  }
  .cod-row {
    display:flex;
    align-items:center;
    justify-content:space-between;
    font-size:13px;
    padding:6px 8px;
    border-radius:8px;
    background:#FFFFFF;
    border:1px solid #E5E7EB;
  }
  .cod-row + .cod-row { margin-top:6px; }
  .cod-row-label {
    color:#4B5563;
  }
  .cod-row-value {
    font-weight:600;
  }
  .cod-form-field {
    margin-top:8px;
  }
  .cod-form-label {
    font-size:12px;
    margin-bottom:4px;
    color:#4B5563;
  }
  .cod-form-input {
    width:100%;
    border-radius:9px;
    border:1px solid #E5E7EB;
    padding:7px 10px;
    font-size:13px;
    background:#FFFFFF;
    color:#111827;
  }
  .cod-form-input::placeholder {
    color:#9CA3AF;
  }
  .cod-cta {
    margin-top:10px;
    border-radius:12px;
    padding:10px 12px;
    text-align:center;
    font-weight:700;
    font-size:13px;
  }

  @media (max-width: 1040px) {
    .tf-editor { grid-template-columns:1fr; }
    .tf-rail,
    .tf-preview-col {
      position:static;
      max-height:none;
    }
    .tf-preview-card { margin-top:8px; }
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

/* ============================== Small UI helpers ============================== */

function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

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

/** Champ couleur : picker visuel + champ texte Polaris */
function ColorSwatchField({ label, value, onChange, helpText }) {
  const safe =
    typeof value === "string" && value.startsWith("#") && value.length >= 4
      ? value
      : "#111827";

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 34,
            height: 30,
            borderRadius: 8,
            border: "1px solid #E5E7EB",
            padding: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <div style={{ flex: 1 }}>
          <TextField
            label={label}
            labelHidden
            value={value}
            onChange={onChange}
            helpText={helpText}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================== DEFAULTS ============================== */
const THEME_PRESETS = {
  light: {
    statusBarBg: "#020617",
    statusBarText: "#E5E7EB",
    offerBg: "#FFFFFF",
    upsellBg: "#FFFFFF",
    ctaBg: "#111827",
    ctaText: "#F9FAFB",
    ctaBorder: "#000000",
  },
  dark: {
    statusBarBg: "#020617",
    statusBarText: "#F9FAFB",
    offerBg: "#020617",
    upsellBg: "#020617",
    ctaBg: "#F97316",
    ctaText: "#111827",
    ctaBorder: "#F97316",
  },
  purple: {
    statusBarBg: "#4C1D95",
    statusBarText: "#F9FAFB",
    offerBg: "#EEF2FF",
    upsellBg: "#F5F3FF",
    ctaBg: "#7C3AED",
    ctaText: "#F9FAFB",
    ctaBorder: "#4C1D95",
  },
};

const DEFAULT_CFG = {
  meta: { version: 7 },
  global: { enabled: false, currency: "dh", rounding: "none" },

  themePreset: "light",
  theme: THEME_PRESETS.light,

  display: {
    style: "style4",
    showDiscountLine: true,
    showUpsellLine: true,
  },

  discount: {
    enabled: false,
    type: "percent",
    percent: 10,
    fixedAmount: 5,
    conditions: {
      minQty: 2,
      minSubtotal: 0,
      requiresCode: false,
      code: "",
    },
    caps: {
      maxDiscount: 0,
    },

    shopifyProductId: "",
    productRef: "",
    previewTitle: "",
    previewDescription: "Discount -10% from 2 items.",
    imageUrl: "",
    iconEmoji: "🔥",
    iconUrl: "",
  },

  upsell: {
    enabled: false,
    trigger: {
      type: "subtotal",
      productHandle: "",
      minSubtotal: 30,
    },
    gift: {
      title: "Winning gift",
      note: "Free gift",
      priceBefore: 9.99,
      isFree: true,
    },

    shopifyProductId: "",
    productRef: "",
    previewTitle: "",
    previewDescription: "Free gift automatically.",
    imageUrl: "",
    iconEmoji: "🎁",
    iconUrl: "",
  },
};

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };

  x.global = { ...d.global, ...(raw.global || {}) };
  x.themePreset = raw.themePreset || d.themePreset;
  x.theme = { ...d.theme, ...(raw.theme || {}) };
  x.display = { ...d.display, ...(raw.display || {}) };

  x.discount = {
    ...d.discount,
    ...(raw.discount || {}),
    conditions: {
      ...d.discount.conditions,
      ...((raw.discount || {}).conditions || {}),
    },
    caps: {
      ...d.discount.caps,
      ...((raw.discount || {}).caps || {}),
    },
  };

  x.upsell = {
    ...d.upsell,
    ...(raw.upsell || {}),
    trigger: {
      ...d.upsell.trigger,
      ...((raw.upsell || {}).trigger || {}),
    },
    gift: {
      ...d.upsell.gift,
      ...((raw.upsell || {}).gift || {}),
    },
  };

  return x;
}

/* ============================== Preview helpers ============================== */

function findProductLabel(products, id) {
  if (!id) return "";
  const p = products.find((prod) => String(prod.id) === String(id));
  return p?.title || "";
}

function getStripStyle(kind, cfg) {
  const styleKey = cfg.display?.style || "style1";
  const t = cfg.theme || {};
  const baseBg =
    kind === "offer" ? t.offerBg || "#FFFFFF" : t.upsellBg || "#FFFFFF";

  let out = {
    background: baseBg,
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
    padding: "10px 12px",
  };

  switch (styleKey) {
    case "style2":
      out.boxShadow = "0 18px 40px rgba(79,70,229,0.35)";
      out.border = "1px solid rgba(79,70,229,0.4)";
      break;
    case "style3":
      out.boxShadow = "none";
      out.padding = "8px 10px";
      break;
    case "style4":
      out.padding = "6px 10px";
      break;
    case "style5":
      out.boxShadow = "none";
      out.border = "1px dashed rgba(148,163,184,0.9)";
      break;
    default:
      break;
  }

  return out;
}

function OffersStatusBar({ cfg, t }) {
  const offersOn = !!cfg.global?.enabled && !!cfg.discount?.enabled;
  const upsellOn = !!cfg.global?.enabled && !!cfg.upsell?.enabled;
  const theme = cfg.theme || DEFAULT_CFG.theme;

  return (
    <div
      className="offers-status-bar"
      style={{
        background: theme.statusBarBg,
        color: theme.statusBarText,
      }}
    >
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Badge tone={offersOn ? "success" : "critical"}>
            {offersOn
              ? t("section2.preview.offersStatus.active")
              : t("section2.preview.offersStatus.inactive")}
          </Badge>
          <Badge tone={upsellOn ? "success" : "attention"}>
            {upsellOn
              ? t("section2.preview.offersStatus.giftActive")
              : t("section2.preview.offersStatus.giftPending")}
          </Badge>
        </InlineStack>
        <Text as="span" variant="bodySm" tone="subdued">
          {t("section2.preview.offersStatus.displayAbove")}
        </Text>
      </InlineStack>
    </div>
  );
}

function OffersCardsPreview({ cfg, products, t }) {
  const offersOn = !!cfg.global?.enabled && !!cfg.discount?.enabled;
  const upsellOn = !!cfg.global?.enabled && !!cfg.upsell?.enabled;

  const offerName =
    cfg.discount.previewTitle ||
    findProductLabel(products, cfg.discount.shopifyProductId) ||
    t("section2.discount.product.placeholder");

  const offerDesc =
    cfg.discount.previewDescription || t("section2.helpText.offerDesc");

  const upsellName =
    cfg.upsell.previewTitle ||
    findProductLabel(products, cfg.upsell.shopifyProductId) ||
    t("section2.upsell.product.placeholder");

  const upsellDesc =
    cfg.upsell.previewDescription || t("section2.helpText.giftDesc");

  const discountIconEmoji = cfg.discount.iconEmoji || cfg.discount.icon || "";
  const discountIconUrl = cfg.discount.iconUrl || "";
  const upsellIconEmoji = cfg.upsell.iconEmoji || cfg.upsell.icon || "";
  const upsellIconUrl = cfg.upsell.iconUrl || "";

  return (
    <BlockStack gap="200">
      {offersOn && cfg.display.showDiscountLine !== false && (
        <div className="offers-strip" style={getStripStyle("offer", cfg)}>
          <div className="offers-strip-thumb">
            {cfg.discount.imageUrl ? (
              <img src={cfg.discount.imageUrl} alt="Produit offre" />
            ) : (
              <div className="offers-strip-thumb-inner" />
            )}
          </div>
          <div>
            <div className="offers-strip-title">
              {discountIconUrl ? (
                <span className="offers-strip-icon">
                  <img
                    src={discountIconUrl}
                    alt="Icône offre"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "999px",
                    }}
                  />
                </span>
              ) : discountIconEmoji ? (
                <span className="offers-strip-icon">
                  {discountIconEmoji}
                </span>
              ) : null}
              <span>{t("section2.preview.offerStrip.offer")}</span>
            </div>
            <div className="offers-strip-main">{offerName}</div>
            <div className="offers-strip-desc">{offerDesc}</div>
          </div>
        </div>
      )}

      {upsellOn && cfg.display.showUpsellLine !== false && (
        <div className="offers-strip" style={getStripStyle("upsell", cfg)}>
          <div className="offers-strip-thumb">
            {cfg.upsell.imageUrl ? (
              <img src={cfg.upsell.imageUrl} alt="Produit cadeau" />
            ) : (
              <div className="offers-strip-thumb-inner-upsell" />
            )}
          </div>
          <div>
            <div className="offers-strip-title">
              {upsellIconUrl ? (
                <span className="offers-strip-icon">
                  <img
                    src={upsellIconUrl}
                    alt="Icône cadeau"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "999px",
                    }}
                  />
                </span>
              ) : upsellIconEmoji ? (
                <span className="offers-strip-icon">
                  {upsellIconEmoji}
                </span>
              ) : null}
              <span>{t("section2.preview.offerStrip.gift")}</span>
            </div>
            <div className="offers-strip-main">{upsellName}</div>
            <div className="offers-strip-desc">{upsellDesc}</div>
          </div>
        </div>
      )}
    </BlockStack>
  );
}

function CodFormPreview({ currency, theme, t }) {
  return (
    <div className="cod-preview-grid">
      <div className="cod-card">
        <div className="cod-card-title">
          {t("section2.preview.orderSummary.title")}
        </div>
        <div className="cod-row">
          <div className="cod-row-label">
            {t("section2.preview.orderSummary.productPrice")}
          </div>
          <div className="cod-row-value">19.99 {currency}</div>
        </div>
        <div className="cod-row">
          <div className="cod-row-label">
            {t("section2.preview.orderSummary.shipping")}
          </div>
          <div className="cod-row-value">
            {t("section1.preview.freeShipping")}
          </div>
        </div>
        <div className="cod-row">
          <div className="cod-row-label">
            {t("section2.preview.orderSummary.total")}
          </div>
          <div className="cod-row-value">19.99 {currency}</div>
        </div>
      </div>

      <div className="cod-card">
        <div className="cod-card-title">
          {t("section2.preview.form.title")}
        </div>
        <div className="cod-form-field">
          <div className="cod-form-label">
            {t("section2.preview.form.fullName")}
          </div>
          <input
            className="cod-form-input"
            placeholder={t("section1.fieldEditor.titlePrefix.fullName")}
            readOnly
          />
        </div>
        <div className="cod-form-field">
          <div className="cod-form-label">
            {t("section2.preview.form.phone")}
          </div>
          <input className="cod-form-input" placeholder="+212 ..." readOnly />
        </div>
        <div className="cod-form-field">
          <div className="cod-form-label">
            {t("section2.preview.form.city")}
          </div>
          <input
            className="cod-form-input"
            placeholder={t("section1.fieldEditor.titlePrefix.city")}
            readOnly
          />
        </div>
        <div
          className="cod-cta"
          style={{
            background: theme.ctaBg,
            color: theme.ctaText,
            border: `1px solid ${theme.ctaBorder}`,
            boxShadow: "0 18px 36px rgba(15,23,42,0.55)",
          }}
        >
          {t("section2.preview.form.submit", { price: "19.99", currency })}
        </div>
      </div>
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

          {/* === Sous-titre + bouton Save dans la bande colorée === */}
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
    { label: t("section2.discount.product.placeholder"), value: "" },
    ...shopProducts.map((p) => ({
      label: p.title || `Produit #${p.id}`,
      value: String(p.id),
    })),
  ];

  const [cfg, setCfg] = useState(() => DEFAULT_CFG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const persistLocal = (next) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_offers_v4",
        JSON.stringify(withDefaults(next))
      );
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
          const s = window.localStorage.getItem("tripleform_cod_offers_v4");
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

  const setGlobal = (p) =>
    setCfg((c) => ({ ...c, global: { ...c.global, ...p } }));

  const setTheme = (p) =>
    setCfg((c) => ({ ...c, theme: { ...(c.theme || {}), ...p } }));

  const applyThemePreset = (presetKey) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;
    setCfg((c) => ({
      ...c,
      themePreset: presetKey,
      theme: { ...(c.theme || {}), ...preset },
    }));
  };

  const setDisplay = (p) =>
    setCfg((c) => ({ ...c, display: { ...c.display, ...p } }));

  const setDiscount = (p) =>
    setCfg((c) => ({ ...c, discount: { ...c.discount, ...p } }));

  const setDiscCond = (p) =>
    setCfg((c) => ({
      ...c,
      discount: {
        ...c.discount,
        conditions: { ...c.discount.conditions, ...p },
      },
    }));

  const setDiscCaps = (p) =>
    setCfg((c) => ({
      ...c,
      discount: {
        ...c.discount,
        caps: { ...c.discount.caps, ...p },
      },
    }));

  const setUpsell = (p) =>
    setCfg((c) => ({ ...c, upsell: { ...c.upsell, ...p } }));

  const setUpTrig = (p) =>
    setCfg((c) => ({
      ...c,
      upsell: {
        ...c.upsell,
        trigger: { ...c.upsell.trigger, ...p },
      },
    }));

  const setUpGift = (p) =>
    setCfg((c) => ({
      ...c,
      upsell: {
        ...c.upsell,
        gift: { ...c.upsell.gift, ...p },
      },
    }));

  const currency = cfg.global.currency || "dh";
  const theme = cfg.theme || DEFAULT_CFG.theme;

  const RAIL = [
    { key: "global", label: t("section2.rail.global"), icon: "SettingsIcon" },
    {
      key: "discount",
      label: t("section2.rail.discount"),
      icon: "DiscountIcon",
    },
    { key: "upsell", label: t("section2.rail.upsell"), icon: "GiftCardIcon" },
  ];
  const [sel, setSel] = useState("global");

  const OFFER_STYLES = [
    { label: t("section2.display.style.style1"), value: "style1" },
    { label: t("section2.display.style.style2"), value: "style2" },
    { label: t("section2.display.style.style3"), value: "style3" },
    { label: t("section2.display.style.style4"), value: "style4" },
    { label: t("section2.display.style.style5"), value: "style5" },
  ];

  const THEME_PRESET_OPTIONS = [
    {
      label: t("section2.theme.preset.light"),
      value: "light",
    },
    {
      label: t("section2.theme.preset.dark"),
      value: "dark",
    },
    {
      label: t("section2.theme.preset.purple"),
      value: "purple",
    },
  ];

  return (
    <PageShell
      t={t}
      loading={loading}
      onSave={saveOffers}
      saving={saving}
    >
      <div className="tf-editor">
        {/* ===== Rail ===== */}
        <div className="tf-rail">
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section2.rail.title")}</div>
            <div className="tf-rail-list">
              {RAIL.map((it) => (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={sel === it.key ? 1 : 0}
                  onClick={() => setSel(it.key)}
                >
                  <div className="tf-grip">
                    <Icon source={PI[it.icon] || PI.AppsIcon} />
                  </div>
                  <div>{it.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Colonne réglages ===== */}
        <div className="tf-right-col">
          <div className="tf-hero">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <span className="tf-hero-badge">
                  {t("section2.preview.offerStrip.offer")} &{" "}
                  {t("section2.preview.offerStrip.gift")}
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
                {t("section2.preview.subtitle")}{" "}
                {loading ? t("section0.usage.loading") : ""}
              </div>
            </InlineStack>
          </div>

          <div className="tf-panel">
            <BlockStack gap="300">
              {sel === "global" && (
                <>
                  <GroupCard title={t("section2.group.global.title")}>
                    <Grid3>
                      <Checkbox
                        label={t("section2.global.enable")}
                        checked={!!cfg.global.enabled}
                        onChange={(v) => setGlobal({ enabled: v })}
                      />
                      <Select
                        label={t("section2.global.rounding")}
                        value={cfg.global.rounding}
                        onChange={(v) => setGlobal({ rounding: v })}
                        options={[
                          {
                            label: t("section2.global.rounding.none"),
                            value: "none",
                          },
                          {
                            label: t("section2.global.rounding.unit"),
                            value: "unit",
                          },
                          {
                            label: t("section2.global.rounding.99"),
                            value: ".99",
                          },
                        ]}
                      />
                      <TextField
                        label={t("section2.global.currency")}
                        value={cfg.global.currency}
                        onChange={(v) => setGlobal({ currency: v })}
                      />
                    </Grid3>
                  </GroupCard>

                  <GroupCard title={t("section2.group.theme.title")}>
                    <BlockStack gap="200">
                      <Grid3>
                        <Select
                          label={t("section2.theme.preset")}
                          value={cfg.themePreset}
                          onChange={applyThemePreset}
                          options={THEME_PRESET_OPTIONS}
                        />
                      </Grid3>

                      <Text variant="bodySm" tone="subdued">
                        {t("section2.helpText.display")}
                      </Text>

                      <Grid3>
                        <ColorSwatchField
                          label={t("section2.theme.statusBarBg")}
                          value={theme.statusBarBg}
                          onChange={(v) => setTheme({ statusBarBg: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.statusBarText")}
                          value={theme.statusBarText}
                          onChange={(v) => setTheme({ statusBarText: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.offerBg")}
                          value={theme.offerBg}
                          onChange={(v) => setTheme({ offerBg: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.upsellBg")}
                          value={theme.upsellBg}
                          onChange={(v) => setTheme({ upsellBg: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.ctaBg")}
                          value={theme.ctaBg}
                          onChange={(v) => setTheme({ ctaBg: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.ctaText")}
                          value={theme.ctaText}
                          onChange={(v) => setTheme({ ctaText: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                        <ColorSwatchField
                          label={t("section2.theme.ctaBorder")}
                          value={theme.ctaBorder}
                          onChange={(v) => setTheme({ ctaBorder: v })}
                          helpText={t("section2.helpText.offerIconUrl")}
                        />
                      </Grid3>
                    </BlockStack>
                  </GroupCard>
                </>
              )}

              {sel === "discount" && (
                <>
                  <GroupCard title={t("section2.group.discount.title")}>
                    <Grid3>
                      <Checkbox
                        label={t("section2.discount.enable")}
                        checked={!!cfg.discount.enabled}
                        onChange={(v) => setDiscount({ enabled: v })}
                      />

                      <Select
                        label={t("section2.discount.product")}
                        value={cfg.discount.shopifyProductId}
                        onChange={(v) =>
                          setDiscount({ shopifyProductId: v })
                        }
                        options={productOptions}
                        helpText={t("section2.helpText.product")}
                      />

                      <TextField
                        label={t("section2.discount.previewTitle")}
                        value={cfg.discount.previewTitle}
                        onChange={(v) =>
                          setDiscount({ previewTitle: v })
                        }
                      />

                      <TextField
                        label={t("section2.discount.previewDescription")}
                        value={cfg.discount.previewDescription}
                        onChange={(v) =>
                          setDiscount({ previewDescription: v })
                        }
                        helpText={t("section2.helpText.offerDesc")}
                      />

                      <TextField
                        label={t("section2.discount.productRef")}
                        value={cfg.discount.productRef}
                        onChange={(v) => setDiscount({ productRef: v })}
                      />

                      <TextField
                        label={t("section2.discount.imageUrl")}
                        value={cfg.discount.imageUrl}
                        onChange={(v) => setDiscount({ imageUrl: v })}
                        helpText={t("section2.helpText.offerImage")}
                      />

                      <TextField
                        label={t("section2.discount.iconEmoji")}
                        value={cfg.discount.iconEmoji || ""}
                        onChange={(v) =>
                          setDiscount({ iconEmoji: v })
                        }
                        helpText={t("section2.helpText.offerIconEmoji")}
                      />

                      <TextField
                        label={t("section2.discount.iconUrl")}
                        value={cfg.discount.iconUrl || ""}
                        onChange={(v) => setDiscount({ iconUrl: v })}
                        helpText={t("section2.helpText.offerIconUrl")}
                      />

                      <Select
                        label={t("section2.discount.type")}
                        value={cfg.discount.type}
                        onChange={(v) => setDiscount({ type: v })}
                        options={[
                          {
                            label: t("section2.discount.type.percent"),
                            value: "percent",
                          },
                          {
                            label: t("section2.discount.type.fixed"),
                            value: "fixed",
                          },
                        ]}
                      />
                      {cfg.discount.type === "percent" && (
                        <RangeSlider
                          label={`${t("section2.discount.percent")} (${cfg.discount.percent}%)`}
                          min={1}
                          max={90}
                          output
                          value={cfg.discount.percent}
                          onChange={(v) => setDiscount({ percent: v })}
                        />
                      )}
                      {cfg.discount.type === "fixed" && (
                        <TextField
                          type="number"
                          label={t("section2.discount.fixedAmount")}
                          value={String(cfg.discount.fixedAmount)}
                          onChange={(v) =>
                            setDiscount({
                              fixedAmount: Number(v || 0),
                            })
                          }
                        />
                      )}

                      <TextField
                        type="number"
                        label={t("section2.discount.conditions.minQty")}
                        value={String(cfg.discount.conditions.minQty || 0)}
                        onChange={(v) =>
                          setDiscCond({ minQty: Number(v || 0) })
                        }
                      />
                      <TextField
                        type="number"
                        label={t("section2.discount.conditions.minSubtotal")}
                        value={String(
                          cfg.discount.conditions.minSubtotal || 0
                        )}
                        onChange={(v) =>
                          setDiscCond({ minSubtotal: Number(v || 0) })
                        }
                      />
                      <Checkbox
                        label={t("section2.discount.conditions.requiresCode")}
                        checked={!!cfg.discount.conditions.requiresCode}
                        onChange={(v) =>
                          setDiscCond({ requiresCode: v })
                        }
                      />
                      {cfg.discount.conditions.requiresCode && (
                        <TextField
                          label={t("section2.discount.conditions.code")}
                          value={cfg.discount.conditions.code || ""}
                          onChange={(v) =>
                            setDiscCond({ code: v.toUpperCase() })
                          }
                        />
                      )}
                      <TextField
                        type="number"
                        label={t("section2.discount.caps.maxDiscount")}
                        value={String(cfg.discount.caps.maxDiscount || 0)}
                        onChange={(v) =>
                          setDiscCaps({ maxDiscount: Number(v || 0) })
                        }
                      />
                    </Grid3>
                  </GroupCard>

                  <GroupCard title={t("section2.group.display.title")}>
                    <Grid3>
                      <Select
                        label={t("section2.display.style")}
                        value={cfg.display.style}
                        onChange={(v) => setDisplay({ style: v })}
                        options={OFFER_STYLES}
                      />
                      <Checkbox
                        label={t("section2.display.showDiscountLine")}
                        checked={cfg.display.showDiscountLine !== false}
                        onChange={(v) =>
                          setDisplay({ showDiscountLine: v })
                        }
                      />
                      <Checkbox
                        label={t("section2.display.showUpsellLine")}
                        checked={cfg.display.showUpsellLine !== false}
                        onChange={(v) =>
                          setDisplay({ showUpsellLine: v })
                        }
                      />
                    </Grid3>
                    <Text variant="bodySm" tone="subdued">
                      {t("section2.helpText.display")}
                    </Text>
                  </GroupCard>
                </>
              )}

              {sel === "upsell" && (
                <GroupCard title={t("section2.group.upsell.title")}>
                  <Grid3>
                    <Checkbox
                      label={t("section2.upsell.enable")}
                      checked={!!cfg.upsell.enabled}
                      onChange={(v) => setUpsell({ enabled: v })}
                    />

                    <Select
                      label={t("section2.upsell.product")}
                      value={cfg.upsell.shopifyProductId}
                      onChange={(v) =>
                        setUpsell({ shopifyProductId: v })
                      }
                      options={productOptions}
                      helpText={t("section2.helpText.product")}
                    />

                    <TextField
                      label={t("section2.upsell.previewTitle")}
                      value={cfg.upsell.previewTitle}
                      onChange={(v) =>
                        setUpsell({ previewTitle: v })
                      }
                    />

                    <TextField
                      label={t("section2.upsell.previewDescription")}
                      value={cfg.upsell.previewDescription}
                      onChange={(v) =>
                        setUpsell({ previewDescription: v })
                      }
                    />

                    <TextField
                      label={t("section2.upsell.productRef")}
                      value={cfg.upsell.productRef}
                      onChange={(v) => setUpsell({ productRef: v })}
                    />

                    <TextField
                      label={t("section2.upsell.imageUrl")}
                      value={cfg.upsell.imageUrl}
                      onChange={(v) => setUpsell({ imageUrl: v })}
                      helpText={t("section2.helpText.offerImage")}
                    />

                    <TextField
                      label={t("section2.upsell.iconEmoji")}
                      value={cfg.upsell.iconEmoji || ""}
                      onChange={(v) =>
                        setUpsell({ iconEmoji: v })
                      }
                      helpText={t("section2.helpText.giftIconEmoji")}
                    />

                    <TextField
                      label={t("section2.upsell.iconUrl")}
                      value={cfg.upsell.iconUrl || ""}
                      onChange={(v) => setUpsell({ iconUrl: v })}
                      helpText={t("section2.helpText.offerIconUrl")}
                    />

                    <Select
                      label={t("section2.upsell.trigger.type")}
                      value={cfg.upsell.trigger.type}
                      onChange={(v) => setUpTrig({ type: v })}
                      options={[
                        {
                          label: t("section2.upsell.trigger.type.subtotal"),
                          value: "subtotal",
                        },
                        {
                          label: t("section2.upsell.trigger.type.product"),
                          value: "product",
                        },
                      ]}
                    />
                    {cfg.upsell.trigger.type === "subtotal" && (
                      <TextField
                        type="number"
                        label={t("section2.upsell.trigger.minSubtotal")}
                        value={String(
                          cfg.upsell.trigger.minSubtotal || 0
                        )}
                        onChange={(v) =>
                          setUpTrig({ minSubtotal: Number(v || 0) })
                        }
                      />
                    )}
                    {cfg.upsell.trigger.type === "product" && (
                      <TextField
                        label={t("section2.upsell.trigger.productHandle")}
                        value={cfg.upsell.trigger.productHandle || ""}
                        onChange={(v) =>
                          setUpTrig({ productHandle: v })
                        }
                      />
                    )}
                  </Grid3>

                  <GroupCard title={t("section2.group.gift.title")}>
                    <Grid3>
                      <TextField
                        label={t("section2.gift.title")}
                        value={cfg.upsell.gift.title}
                        onChange={(v) => setUpGift({ title: v })}
                      />
                      <TextField
                        label={t("section2.gift.note")}
                        value={cfg.upsell.gift.note}
                        onChange={(v) => setUpGift({ note: v })}
                      />
                      <TextField
                        type="number"
                        label={t("section2.gift.priceBefore")}
                        value={String(cfg.upsell.gift.priceBefore || 0)}
                        onChange={(v) =>
                          setUpGift({
                            priceBefore: Number(v || 0),
                          })
                        }
                      />
                      <Checkbox
                        label={t("section2.gift.isFree")}
                        checked={!!cfg.upsell.gift.isFree}
                        onChange={(v) => setUpGift({ isFree: v })}
                      />
                    </Grid3>
                  </GroupCard>
                </GroupCard>
              )}
            </BlockStack>
          </div>
        </div>

        {/* ===== Colonne droite — Preview ===== */}
        <div className="tf-preview-col">
          <div className="tf-preview-card">
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {t("section2.preview.title")}
                </Text>
                <Text as="span" tone="subdued" variant="bodySm">
                  {t("section2.preview.subtitle")}
                </Text>
              </InlineStack>

              <OffersStatusBar cfg={cfg} t={t} />
              <OffersCardsPreview
                cfg={cfg}
                products={shopProducts}
                t={t}
              />
              <CodFormPreview currency={currency} theme={theme} t={t} />
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;
