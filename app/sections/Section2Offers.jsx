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

  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 340px;
    gap:16px;
    align-items:start;
  }

  .tf-main-col{ display:grid; gap:16px; min-width:0; }

  .tf-hero {
    background:#FFFFFF;
    border-radius:12px;
    padding:12px 16px;
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

  .tf-panel {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:16px;
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
    font-weight:800;
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
    font-weight:800;
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

  .preview-offer {
    border-radius:14px;
    border:1px solid #E5E7EB;
    padding:12px;
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
    width:64px;
    height:64px;
    border-radius:14px;
    overflow:hidden;
    border:1px solid rgba(0,0,0,.08);
    background:#F3F4F6;
    flex:none;
  }
  .preview-img img { width:100%; height:100%; object-fit:cover; display:block; }
  .preview-main { min-width:0; flex:1; }
  .preview-title { font-weight:900; font-size:14px; margin-bottom:2px; }
  .preview-desc { font-size:12px; color:#6B7280; line-height:1.35; }
  .preview-sub { font-size:11px; color:#94A3B8; margin-top:6px; }

  .preview-icon {
    width:34px;
    height:34px;
    border-radius:12px;
    display:grid;
    place-items:center;
    border:1px solid rgba(0,0,0,.10);
    flex:none;
  }

  .offer-btn {
    margin-top:10px;
    border-radius:12px;
    padding:8px 10px;
    font-size:12px;
    font-weight:900;
    cursor:pointer;
    border:1px solid transparent;
    display:inline-flex;
    align-items:center;
    gap:8px;
    transition:all .15s ease;
  }
  .offer-btn:hover { transform: translateY(-1px); opacity:0.95; }

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

const Grid2 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

/* ============================== Color Field ============================== */
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

/* ============================== Icon Picker (Shopify-like) ============================== */
const ICON_OPTIONS = [
  { label: "Aucun", value: "" },
  { label: "Discount", value: "DiscountIcon" },
  { label: "Gift", value: "GiftCardIcon" },
  { label: "Star", value: "StarFilledIcon" },
  { label: "Lightning", value: "LightningBoltIcon" },
  { label: "Cart", value: "CartIcon" },
  { label: "Check", value: "CheckCircleIcon" },
  { label: "Info", value: "InfoIcon" },
  { label: "Megaphone", value: "MegaphoneIcon" },
  { label: "Target", value: "TargetIcon" },
];

/* ============================== Product helpers ============================== */
function getProductById(products, id) {
  return products?.find((p) => String(p.id) === String(id));
}

function getProductImages(product) {
  // Support multiple shapes:
  // - product.images = [{src,url,originalSrc}, ...]
  // - product.image = {src}
  // - product.featuredImage
  const imgs = [];
  const push = (x) => {
    if (!x) return;
    const src =
      x.src || x.url || x.originalSrc || x.transformedSrc || x.preview?.image?.url || x.previewImage?.url;
    if (src && !imgs.includes(src)) imgs.push(src);
  };

  if (product?.image) push(product.image);
  if (product?.featuredImage) push(product.featuredImage);
  if (Array.isArray(product?.images)) product.images.forEach((im) => push(im));
  if (Array.isArray(product?.media)) product.media.forEach((m) => push(m?.preview?.image || m?.image));

  return imgs;
}

/* ============================== Defaults ============================== */
const DEFAULT_OFFER = {
  enabled: true,
  showInPreview: true,

  title: "Offre spéciale",
  description: "Ajoutez cette offre pour augmenter vos conversions",

  productId: "",

  iconName: "DiscountIcon",
  iconBg: "#EEF2FF",
  iconColorTone: "base", // Polaris tone (optional)

  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",

  imageMode: "product", // product | custom
  imageUrl: "", // if custom

  buttonText: "Activer",
  buttonBg: "#111827",
  buttonTextColor: "#FFFFFF",
  buttonBorder: "#111827",
};

const DEFAULT_UPSELL = {
  enabled: true,
  showInPreview: true,

  title: "Upsell",
  description: "Proposition complémentaire au produit",

  productId: "",

  iconName: "GiftCardIcon",
  iconBg: "#ECFDF5",
  iconColorTone: "base",

  cardBg: "#FFFFFF",
  borderColor: "#E5E7EB",

  imageMode: "product",
  imageUrl: "",
};

const DEFAULT_CFG = {
  meta: { version: 20 },
  global: {
    enabled: true,
    currency: "MAD",
  },
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
};

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };
  x.global = { ...d.global, ...(raw.global || {}) };

  x.offers = Array.isArray(raw.offers) ? raw.offers : d.offers;
  x.upsells = Array.isArray(raw.upsells) ? raw.upsells : d.upsells;

  x.offers = x.offers.slice(0, 3).map((o) => ({ ...DEFAULT_OFFER, ...o }));
  x.upsells = x.upsells.slice(0, 3).map((u) => ({ ...DEFAULT_UPSELL, ...u }));

  return x;
}

/* ============================== Preview renderer ============================== */
function PreviewCard({ item, products, isOffer }) {
  const product = item.productId ? getProductById(products, item.productId) : null;
  const images = product ? getProductImages(product) : [];
  const img =
    item.imageMode === "custom"
      ? item.imageUrl
      : images?.[0] ||
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23EEF2FF'/%3E%3Cpath d='M70 85l30-30 50 50v55H50V85z' fill='%234F46E5'/%3E%3C/svg%3E";

  return (
    <div
      className="preview-offer"
      style={{
        background: item.cardBg || "#fff",
        borderColor: item.borderColor || "#E5E7EB",
      }}
    >
      <div className="preview-row">
        <div className="preview-icon" style={{ background: item.iconBg || "#EEF2FF" }}>
          {item.iconName ? <SafeIcon name={item.iconName} fallback="AppsIcon" /> : <SafeIcon name="AppsIcon" />}
        </div>

        <div className="preview-img">
          <img
            src={img}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234F46E5'/%3E%3Cpath d='M50 30L70 70H30Z' fill='white'/%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className="preview-main">
          <div className="preview-title">{item.title || (isOffer ? "Offre" : "Upsell")}</div>
          <div className="preview-desc">{item.description || ""}</div>

          <div className="preview-sub">
            Produit:{" "}
            <b>{product?.title ? product.title : item.productId ? "Produit sélectionné" : "Aucun"}</b>
          </div>

          {isOffer && (
            <button
              className="offer-btn"
              style={{
                background: item.buttonBg || "#111827",
                color: item.buttonTextColor || "#fff",
                borderColor: item.buttonBorder || item.buttonBg || "#111827",
              }}
              type="button"
              onClick={() => {}}
            >
              <SafeIcon name="CirclePlusIcon" fallback="PlusIcon" />
              {item.buttonText || "Activer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Editors ============================== */
function OfferEditor({ offer, index, products, onChange, onRemove, canRemove, t }) {
  const productOptions = useMemo(() => {
    const opts = (products || []).map((p) => ({
      label: p.title || "Produit",
      value: String(p.id),
    }));
    return [{ label: "— Choisir un produit —", value: "" }, ...opts];
  }, [products]);

  const product = offer.productId ? getProductById(products, offer.productId) : null;
  const productImages = useMemo(() => (product ? getProductImages(product) : []), [product]);

  const imageSelectOptions = useMemo(() => {
    const base = [{ label: "Image du produit (auto)", value: "product" }, { label: "Image personnalisée (URL)", value: "custom" }];
    return base;
  }, []);

  return (
    <div className="item-card">
      {canRemove && (
        <div className="remove-btn" onClick={onRemove} title="Supprimer">
          ×
        </div>
      )}

      <div className="item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            Offre {index + 1}
          </Text>
        </InlineStack>
        <Checkbox label="Activer" checked={!!offer.enabled} onChange={(v) => onChange({ ...offer, enabled: v })} />
      </div>

      <BlockStack gap="400">
        <GroupCard title="Contenu">
          <Grid2>
            <TextField
              label="Titre"
              value={offer.title || ""}
              onChange={(v) => onChange({ ...offer, title: v })}
              autoComplete="off"
            />
            <TextField
              label="Texte"
              value={offer.description || ""}
              onChange={(v) => onChange({ ...offer, description: v })}
              autoComplete="off"
            />
          </Grid2>

          <Grid2>
            <Select
              label="Produit Shopify"
              value={offer.productId ? String(offer.productId) : ""}
              options={productOptions}
              onChange={(v) => onChange({ ...offer, productId: v })}
            />

            <Select
              label="Image"
              value={offer.imageMode || "product"}
              options={imageSelectOptions}
              onChange={(v) => onChange({ ...offer, imageMode: v })}
            />
          </Grid2>

          {offer.imageMode === "custom" && (
            <TextField
              label="URL image"
              value={offer.imageUrl || ""}
              onChange={(v) => onChange({ ...offer, imageUrl: v })}
              placeholder="https://example.com/image.jpg"
              autoComplete="off"
            />
          )}

          {offer.imageMode !== "custom" && offer.productId && productImages.length === 0 && (
            <Text variant="bodySm" tone="subdued">
              Ce produit n’a pas d’images détectées (selon le format retourné).
            </Text>
          )}
        </GroupCard>

        <GroupCard title="Icon & Design">
          <Grid2>
            <Select
              label="Icône"
              value={offer.iconName || ""}
              options={ICON_OPTIONS}
              onChange={(v) => onChange({ ...offer, iconName: v })}
            />

            <ColorField
              label="Fond de l’icône"
              value={offer.iconBg || ""}
              onChange={(v) => onChange({ ...offer, iconBg: v })}
              placeholder="#EEF2FF"
            />
          </Grid2>

          <Divider />

          <Grid2>
            <ColorField
              label="Background"
              value={offer.cardBg || ""}
              onChange={(v) => onChange({ ...offer, cardBg: v })}
              placeholder="#FFFFFF"
            />
            <ColorField
              label="Border"
              value={offer.borderColor || ""}
              onChange={(v) => onChange({ ...offer, borderColor: v })}
              placeholder="#E5E7EB"
            />
          </Grid2>
        </GroupCard>

        <GroupCard title="Bouton (Offre)">
          <Grid2>
            <TextField
              label="Texte du bouton"
              value={offer.buttonText || ""}
              onChange={(v) => onChange({ ...offer, buttonText: v })}
              autoComplete="off"
            />
            <ColorField
              label="Bouton background"
              value={offer.buttonBg || ""}
              onChange={(v) => onChange({ ...offer, buttonBg: v })}
              placeholder="#111827"
            />
          </Grid2>

          <Grid2>
            <ColorField
              label="Bouton texte"
              value={offer.buttonTextColor || ""}
              onChange={(v) => onChange({ ...offer, buttonTextColor: v })}
              placeholder="#FFFFFF"
            />
            <ColorField
              label="Bouton border"
              value={offer.buttonBorder || ""}
              onChange={(v) => onChange({ ...offer, buttonBorder: v })}
              placeholder="#111827"
            />
          </Grid2>
        </GroupCard>

        <GroupCard title="Prévisualisation">
          <Checkbox
            label="Afficher dans preview"
            checked={!!offer.showInPreview}
            onChange={(v) => onChange({ ...offer, showInPreview: v })}
          />
        </GroupCard>
      </BlockStack>
    </div>
  );
}

function UpsellEditor({ upsell, index, products, onChange, onRemove, canRemove }) {
  const productOptions = useMemo(() => {
    const opts = (products || []).map((p) => ({
      label: p.title || "Produit",
      value: String(p.id),
    }));
    return [{ label: "— Choisir un produit —", value: "" }, ...opts];
  }, [products]);

  const imageSelectOptions = useMemo(() => {
    return [
      { label: "Image du produit (auto)", value: "product" },
      { label: "Image personnalisée (URL)", value: "custom" },
    ];
  }, []);

  return (
    <div className="item-card">
      {canRemove && (
        <div className="remove-btn" onClick={onRemove} title="Supprimer">
          ×
        </div>
      )}

      <div className="item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">
            Upsell {index + 1}
          </Text>
        </InlineStack>
        <Checkbox label="Activer" checked={!!upsell.enabled} onChange={(v) => onChange({ ...upsell, enabled: v })} />
      </div>

      <BlockStack gap="400">
        <GroupCard title="Contenu">
          <Grid2>
            <TextField
              label="Titre"
              value={upsell.title || ""}
              onChange={(v) => onChange({ ...upsell, title: v })}
              autoComplete="off"
            />
            <TextField
              label="Texte"
              value={upsell.description || ""}
              onChange={(v) => onChange({ ...upsell, description: v })}
              autoComplete="off"
            />
          </Grid2>

          <Grid2>
            <Select
              label="Produit Shopify"
              value={upsell.productId ? String(upsell.productId) : ""}
              options={productOptions}
              onChange={(v) => onChange({ ...upsell, productId: v })}
            />

            <Select
              label="Image"
              value={upsell.imageMode || "product"}
              options={imageSelectOptions}
              onChange={(v) => onChange({ ...upsell, imageMode: v })}
            />
          </Grid2>

          {upsell.imageMode === "custom" && (
            <TextField
              label="URL image"
              value={upsell.imageUrl || ""}
              onChange={(v) => onChange({ ...upsell, imageUrl: v })}
              placeholder="https://example.com/image.jpg"
              autoComplete="off"
            />
          )}
        </GroupCard>

        <GroupCard title="Icon & Design">
          <Grid2>
            <Select
              label="Icône"
              value={upsell.iconName || ""}
              options={ICON_OPTIONS}
              onChange={(v) => onChange({ ...upsell, iconName: v })}
            />
            <ColorField
              label="Fond de l’icône"
              value={upsell.iconBg || ""}
              onChange={(v) => onChange({ ...upsell, iconBg: v })}
              placeholder="#ECFDF5"
            />
          </Grid2>

          <Divider />

          <Grid2>
            <ColorField
              label="Background"
              value={upsell.cardBg || ""}
              onChange={(v) => onChange({ ...upsell, cardBg: v })}
              placeholder="#FFFFFF"
            />
            <ColorField
              label="Border"
              value={upsell.borderColor || ""}
              onChange={(v) => onChange({ ...upsell, borderColor: v })}
              placeholder="#E5E7EB"
            />
          </Grid2>
        </GroupCard>

        <GroupCard title="Prévisualisation">
          <Checkbox
            label="Afficher dans preview"
            checked={!!upsell.showInPreview}
            onChange={(v) => onChange({ ...upsell, showInPreview: v })}
          />
        </GroupCard>
      </BlockStack>
    </div>
  );
}

/* ============================== HEADER / SHELL ============================== */
function PageShell({ children, t, loading, onSave, saving, dirty }) {
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
              <div style={{ fontWeight: 900, color: "#F9FAFB" }}>{t("section2.header.appTitle")}</div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.85)" }}>
                Offres & Upsells — Settings pro
              </div>
            </div>

            {dirty ? (
              <Badge tone="warning">Modifications non enregistrées</Badge>
            ) : (
              <Badge tone="success">Enregistré</Badge>
            )}
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {loading ? "Chargement..." : ""}
            </div>
            <Button variant="primary" size="slim" onClick={onSave} loading={saving}>
              {t("section2.button.save")}
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
  const { t } = useI18n();
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

  // beforeunload warning
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
      { id: "global", content: "Global", panelID: "tab-global", icon: "SettingsIcon" },
      { id: "offers", content: "Offres", panelID: "tab-offers", icon: "DiscountIcon" },
      { id: "upsells", content: "Upsells", panelID: "tab-upsells", icon: "GiftCardIcon" },
    ],
    []
  );
  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === tab));

  const persistLocal = (next) => {
    try {
      window.localStorage.setItem("tripleform_cod_offers_v20", JSON.stringify(withDefaults(next)));
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
          const s = window.localStorage.getItem("tripleform_cod_offers_v20");
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
      alert("Échec de l'enregistrement : " + (e?.message || "Erreur inconnue"));
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

  const activeOffers = cfg.offers.filter((o) => o.enabled && o.showInPreview);
  const activeUpsells = cfg.upsells.filter((u) => u.enabled && u.showInPreview);

  return (
    <PageShell t={t} loading={loading} onSave={saveOffers} saving={saving} dirty={dirty}>
      {/* Confirm modal for unsaved changes */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Modifications non enregistrées"
        primaryAction={{
          content: saving ? "Enregistrement..." : "Sauvegarder & continuer",
          onAction: async () => {
            await saveOffers();
            setConfirmOpen(false);
            applyPendingTab();
          },
          loading: saving,
        }}
        secondaryActions={[
          { content: "Annuler", onAction: () => setConfirmOpen(false) },
          { content: "Ignorer", onAction: discardChanges, destructive: true },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Tu as des modifications non enregistrées. Tu veux <b>save</b> ou <b>ignorer</b> avant de changer de section ?
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
                  {cfg.offers.filter((o) => o.enabled).length} Offres • {cfg.upsells.filter((u) => u.enabled).length} Upsells
                </span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>Offres & Upsells</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    Settings clairs (pas au hasard) + preview propre
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
                <GroupCard title="Global">
                  <Grid2>
                    <Checkbox
                      label="Activer Offres & Upsells"
                      checked={!!cfg.global.enabled}
                      onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, enabled: v } }))}
                    />
                    <Select
                      label="Devise"
                      value={cfg.global.currency}
                      onChange={(v) => setCfg((c) => ({ ...c, global: { ...c.global, currency: v } }))}
                      options={[
                        { label: "MAD (DH)", value: "MAD" },
                        { label: "EUR (€)", value: "EUR" },
                        { label: "USD ($)", value: "USD" },
                        { label: "GBP (£)", value: "GBP" },
                      ]}
                    />
                  </Grid2>
                  <Text variant="bodySm" tone="subdued">
                    Ici seulement l’essentiel. Les styles se font dans chaque Offre / Upsell.
                  </Text>
                </GroupCard>
              </BlockStack>
            )}

            {tab === "offers" && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Offres ({cfg.offers.length}/3)
                  </Text>
                  <Badge tone="subdued">Pro settings</Badge>
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
                    t={t}
                  />
                ))}

                <div className="add-wrap">
                  <div className="add-btn">
                    <Button
                      fullWidth
                      onClick={addOffer}
                      disabled={cfg.offers.length >= 3}
                      icon={PI.CirclePlusIcon}
                    >
                      Ajouter une offre
                    </Button>
                  </div>
                </div>
              </BlockStack>
            )}

            {tab === "upsells" && (
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Upsells ({cfg.upsells.length}/3)
                  </Text>
                  <Badge tone="subdued">Sans bouton</Badge>
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
                  />
                ))}

                <div className="add-wrap">
                  <div className="add-btn">
                    <Button
                      fullWidth
                      onClick={addUpsell}
                      disabled={cfg.upsells.length >= 3}
                      icon={PI.CirclePlusIcon}
                    >
                      Ajouter un upsell
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
                  Preview
                </Text>
                <Badge tone={cfg.global.enabled ? "success" : "critical"}>
                  {cfg.global.enabled ? "Actif" : "Inactif"}
                </Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                Preview rapide (ce que le client va voir).
              </Text>

              <Divider />

              <Text as="p" variant="bodySm" fontWeight="bold">
                Offres
              </Text>
              {activeOffers.length ? (
                <BlockStack gap="200">
                  {activeOffers.map((o, idx) => (
                    <PreviewCard key={`o-${idx}`} item={o} products={products} isOffer />
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodySm" tone="subdued">
                  Aucune offre active dans la preview.
                </Text>
              )}

              <Divider />

              <Text as="p" variant="bodySm" fontWeight="bold">
                Upsells
              </Text>
              {activeUpsells.length ? (
                <BlockStack gap="200">
                  {activeUpsells.map((u, idx) => (
                    <PreviewCard key={`u-${idx}`} item={u} products={products} isOffer={false} />
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodySm" tone="subdued">
                  Aucun upsell actif dans la preview.
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
