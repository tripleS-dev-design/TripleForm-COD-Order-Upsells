// ===== File: app/sections/Section2Offers.jsx =====
import React, { useEffect, useMemo, useState } from "react";
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
  Tabs,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= CSS / layout (UPDATED) ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* HEADER */
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

  /* Menu horizontal en haut (comme autres sections) */
  .tf-topnav{
    margin: 14px 0 16px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:8px 10px;
    box-shadow:0 8px 24px rgba(15,23,42,0.04);
  }

  /* Hero card */
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

  /* NEW: 2 columns only (no left rail) */
  .tf-editor {
    display:grid;
    grid-template-columns: minmax(0,1fr) 320px; /* preview narrower */
    gap:16px;
    align-items:start;
  }

  .tf-main-col{
    display:grid;
    gap:16px;
    min-width:0;
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
    background:#FFFFFF;
    border-radius:12px;
    padding:14px;
    box-shadow:0 12px 32px rgba(15,23,42,0.08);
    border:1px solid #E5E7EB;
  }

  /* group title */
  .tf-group-title {
    padding:10px 14px;
    background:linear-gradient(90deg,#1E40AF,#7C2D12);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:700;
    letter-spacing:.02em;
    margin-bottom:16px;
    font-size:13px;
    box-shadow:0 6px 16px rgba(30,64,175,0.15);
  }

  /* offer/upsell editor card */
  .offer-item-card {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:16px;
    margin-bottom:16px;
    position:relative;
  }
  .offer-item-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:14px;
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
    font-weight:700;
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
    width:26px;
    height:26px;
    border-radius:8px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    font-size:14px;
    transition:all 0.2s;
  }
  .remove-offer-btn:hover { background:#FEE2E2; transform:scale(1.05); }

  /* ===== 4 styles preview card ===== */
  .offer-card {
    border-radius:12px;
    border:1px solid #E5E7EB;
    padding:12px;
    background:#fff;
    box-shadow:0 6px 16px rgba(0,0,0,0.05);
    margin-bottom:10px;
    overflow:hidden;
  }

  /* Shared content */
  .offer-title { font-size:14px; font-weight:700; margin-bottom:2px; }
  .offer-desc { font-size:12px; color:#6B7280; line-height:1.35; }
  .offer-thumb {
    width:64px; height:64px; border-radius:14px; overflow:hidden;
    border:1px solid #E5E7EB; background:#F9FAFB;
    flex:none;
  }
  .offer-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

  /* Style 1: Image LEFT, text RIGHT (default) */
  .offer-style-1 { display:flex; gap:12px; align-items:center; }
  .offer-style-1 .offer-main { min-width:0; flex:1; }

  /* Style 2: Image RIGHT, text LEFT */
  .offer-style-2 { display:flex; gap:12px; align-items:center; }
  .offer-style-2 .offer-thumb { order:2; }
  .offer-style-2 .offer-main { order:1; min-width:0; flex:1; }

  /* Style 3: Text TOP, image bottom big */
  .offer-style-3 { display:grid; gap:10px; }
  .offer-style-3 .offer-thumb {
    width:100%; height:140px; border-radius:14px;
  }

  /* Style 4: Big image LEFT (tall) + text stack */
  .offer-style-4 { display:grid; grid-template-columns: 120px 1fr; gap:12px; align-items:center; }
  .offer-style-4 .offer-thumb { width:120px; height:120px; border-radius:16px; }

  /* timer */
  .offer-timer {
    display:flex;
    align-items:center;
    gap:6px;
    font-size:11px;
    font-weight:700;
    margin-top:8px;
    padding:6px 10px;
    border-radius:10px;
    border:1px solid transparent;
  }
  .timer-countdown {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-weight:800;
    letter-spacing:1px;
    margin-left:auto;
  }

  /* activation btn */
  .offer-activate-btn {
    background:#111827;
    color:#fff;
    border:1px solid #111827;
    border-radius:10px;
    padding:6px 10px;
    font-size:11px;
    font-weight:700;
    cursor:pointer;
    margin-top:10px;
    transition:all 0.15s ease;
    display:inline-flex;
    align-items:center;
    gap:6px;
  }
  .offer-activate-btn:hover { background:#374151; border-color:#374151; }

  /* timer styles */
  .timer-type-chrono {
    background: linear-gradient(90deg, #1e3a8a, #3b82f6);
    color: #fff;
    border: 1px solid rgba(96,165,250,.9);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  }
  .timer-type-elegant {
    background: linear-gradient(135deg, #8B5CF6, #EC4899);
    color: #fff;
    border: 1px solid rgba(221,214,254,.9);
    box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
  }
  .timer-type-flash {
    background: linear-gradient(90deg, #f97316, #fbbf24);
    color: #111827;
    border: 1px solid rgba(245,158,11,.9);
    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
  }
  .timer-type-minimal {
    background: #F9FAFB;
    color: #374151;
    border: 1px solid #E5E7EB;
  }
  .timer-type-hot {
    background: linear-gradient(90deg, #7c2d12, #ea580c);
    color: #fff;
    border: 1px solid rgba(253,186,116,.9);
    animation: pulse 1.5s infinite;
    font-weight: 800;
  }
  .timer-type-urgent {
    background: linear-gradient(90deg, #991B1B, #DC2626);
    color: #fff;
    border: 1px solid rgba(252,165,165,.9);
    font-weight: 800;
    animation: blink 1s infinite;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
  }
  @keyframes pulse { 0%{opacity:1} 50%{opacity:.82} 100%{opacity:1} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.72} }

  /* add button */
  .add-button-container { display:flex; justify-content:center; margin-top:16px; }
  .add-button {
    padding:12px 18px;
    background:#F9FAFB;
    border:2px dashed #D1D5DB;
    border-radius:12px;
    color:#6B7280;
    font-size:13px;
    font-weight:700;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    cursor:pointer;
    transition:all 0.15s;
    min-width:220px;
  }
  .add-button:hover { background:#F3F4F6; border-color:#9CA3AF; color:#4B5563; }

  /* order summary */
  .order-summary-preview {
    background:#F9FAFB;
    border-radius:12px;
    padding:14px;
    margin-top:14px;
    border:1px solid #E5E7EB;
  }
  .order-summary-title { font-size:13px; font-weight:800; color:#111827; margin-bottom:12px; }
  .order-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:8px 0; border-bottom:1px solid #E5E7EB; font-size:13px;
  }
  .order-row:last-child { border-bottom:none; font-weight:800; color:#111827; }
  .order-label { color:#6B7280; }

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

/* ============================== Palettes ============================== */
const COLOR_PALETTES = [
  {
    id: "blue-gradient",
    name: "Gradient Bleu",
    colors: ["#0B3B82", "#7D0031", "#00A7A3", "#F0F9FF", "#0C4A6E"],
    theme: {
      bg: "#F0F9FF",
      text: "#0C4A6E",
      border: "#E2E8F0",
      offerBg: "#FFFFFF",
      offerBorder: "#CBD5E1",
      offerTitle: "#0C4A6E",
      offerText: "#0C4A6E",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA",
    },
  },
  {
    id: "clean-white",
    name: "Blanc Propre",
    colors: ["#FFFFFF", "#111827", "#E5E7EB", "#F9FAFB", "#374151"],
    theme: {
      bg: "#FFFFFF",
      text: "#111827",
      border: "#E5E7EB",
      offerBg: "#F9FAFB",
      offerBorder: "#E5E7EB",
      offerTitle: "#111827",
      offerText: "#374151",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA",
    },
  },
  {
    id: "dark-modern",
    name: "Sombre Moderne",
    colors: ["#0B1220", "#2563EB", "#1F2A44", "#101828", "#E5F0FF"],
    theme: {
      bg: "#0B1220",
      text: "#E5F0FF",
      border: "#1F2A44",
      offerBg: "#101828",
      offerBorder: "#1F2A44",
      offerTitle: "#E5F0FF",
      offerText: "#E5F0FF",
      timerBg: "#450A0A",
      timerText: "#FCA5A5",
      timerBorder: "#991B1B",
    },
  },
  {
    id: "green-nature",
    name: "Nature Verte",
    colors: ["#10B981", "#065F46", "#D1FAE5", "#ECFDF5", "#F0FDF4"],
    theme: {
      bg: "#F0FDF4",
      text: "#065F46",
      border: "#D1FAE5",
      offerBg: "#ECFDF5",
      offerBorder: "#A7F3D0",
      offerTitle: "#065F46",
      offerText: "#047857",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA",
    },
  },
];

/* ============================== TIMER TYPES ============================== */
const TIMER_TYPES = [
  {
    id: "chrono",
    name: "Chrono Professionnel",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3114/3114883.png",
    cssClass: "timer-type-chrono",
    iconEmoji: "⏱️",
    timeFormat: "mm:ss",
    defaultMessage: "⏱️ DERNIÈRE CHANCE ! Expire dans :",
  },
  {
    id: "elegant",
    name: "Élégant Violet",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/7794/7794971.png",
    cssClass: "timer-type-elegant",
    iconEmoji: "💎",
    timeFormat: "mm[m] ss[s]",
    defaultMessage: "💎 OFFRE EXCLUSIVE ! Termine dans :",
  },
  {
    id: "flash",
    name: "Flash Sale Orange",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4392/4392452.png",
    cssClass: "timer-type-flash",
    iconEmoji: "⚡",
    timeFormat: "mm:ss",
    defaultMessage: "⚡ VENTE ÉCLAIR ! Derniers :",
  },
  {
    id: "minimal",
    name: "Minimaliste Propre",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/992/992700.png",
    cssClass: "timer-type-minimal",
    iconEmoji: "⏳",
    timeFormat: "mm:ss",
    defaultMessage: "⏳ Dernière chance :",
  },
  {
    id: "hot",
    name: "Hot Urgent",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828665.png",
    cssClass: "timer-type-hot",
    iconEmoji: "🔥",
    timeFormat: "mm:ss",
    defaultMessage: "🔥 LIQUIDATION ! Fini dans :",
  },
  {
    id: "urgent",
    name: "Urgent Rouge",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/1828/1828649.png",
    cssClass: "timer-type-urgent",
    iconEmoji: "🚨",
    timeFormat: "mm:ss",
    defaultMessage: "🚨 URGENT ! Presque fini :",
  },
];

/* ============================== Countdown examples ============================== */
const COUNTDOWN_EXAMPLES = [
  { id: "chrono-urgent", name: "Chrono Urgence (1h)", minutes: 60, timerType: "chrono", message: "⏱️ DERNIÈRE CHANCE ! L'offre expire dans :", timerIconUrl: TIMER_TYPES[0].iconUrl, timeFormat: "mm:ss" },
  { id: "elegant-purple", name: "Élégant Violet (45min)", minutes: 45, timerType: "elegant", message: "💎 OFFRE EXCLUSIVE ! Termine dans :", timerIconUrl: TIMER_TYPES[1].iconUrl, timeFormat: "mm[m] ss[s]" },
  { id: "flash-sale", name: "Flash Sale (30min)", minutes: 30, timerType: "flash", message: "⚡ VENTE ÉCLAIR ! Derniers :", timerIconUrl: TIMER_TYPES[2].iconUrl, timeFormat: "mm:ss" },
  { id: "minimal-clean", name: "Minimaliste Propre (30min)", minutes: 30, timerType: "minimal", message: "⏳ Dernière chance :", timerIconUrl: TIMER_TYPES[3].iconUrl, timeFormat: "mm:ss" },
  { id: "urgent-red", name: "Urgent Rouge (10min)", minutes: 10, timerType: "urgent", message: "🚨 URGENT ! Presque fini :", timerIconUrl: TIMER_TYPES[5].iconUrl, timeFormat: "mm:ss" },
  { id: "hot-sale", name: "Hot Sale (15min)", minutes: 15, timerType: "hot", message: "🔥 LIQUIDATION ! Fini dans :", timerIconUrl: TIMER_TYPES[4].iconUrl, timeFormat: "mm:ss" },
];

/* ============================== UI helpers ============================== */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

const Grid2 = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, alignItems: "start" }}>
    {children}
  </div>
);

const Grid3 = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "start" }}>
    {children}
  </div>
);

/* ============================== Palette selector ============================== */
function ColorPaletteSelector({ selectedPalette, onSelect, customTheme, onCustomColorChange }) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div>
      <Text as="p" variant="bodyMd">
        Choisissez une palette prédéfinie ou personnalisez les couleurs manuellement
      </Text>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {COLOR_PALETTES.map((palette) => (
          <div
            key={palette.id}
            onClick={() => {
              onSelect(palette.id);
              setShowCustom(false);
            }}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: selectedPalette === palette.id ? "2px solid #4F46E5" : "1px solid #E5E7EB",
              cursor: "pointer",
              boxShadow: selectedPalette === palette.id ? "0 10px 26px rgba(79,70,229,.16)" : "none",
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", height: 34 }}>
              {palette.colors.map((c, idx) => (
                <div key={idx} style={{ flex: 1, background: c }} title={c} />
              ))}
            </div>
            <div style={{ padding: 10, fontSize: 12, fontWeight: 700 }}>{palette.name}</div>
          </div>
        ))}

        <div
          onClick={() => setShowCustom(true)}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: showCustom ? "2px solid #4F46E5" : "2px dashed #D1D5DB",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          <div style={{ height: 34, display: "grid", placeItems: "center", background: "#F9FAFB" }}>
            <SafeIcon name="PaintBrushIcon" fallback="ColorNoneIcon" />
          </div>
          <div style={{ padding: 10, fontSize: 12, fontWeight: 700 }}>Personnaliser</div>
        </div>
      </div>

      {showCustom && (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { k: "offerBg", label: "Fond des offres", def: "#FFFFFF" },
            { k: "offerTitle", label: "Titre des offres", def: "#111827" },
            { k: "offerText", label: "Texte des offres", def: "#374151" },
          ].map((x) => (
            <div key={x.k} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, background: "#fff" }}>
              <Text as="p" fontWeight="bold">{x.label}</Text>
              <div style={{ height: 8 }} />
              <InlineStack gap="200" blockAlign="center">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    background: customTheme?.[x.k] || x.def,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const color = prompt("Entrez une couleur hex (#FFFFFF):", customTheme?.[x.k] || x.def);
                    if (color) onCustomColorChange(x.k, color);
                  }}
                  title="Cliquer pour changer"
                />
                <div style={{ flex: 1 }}>
                  <TextField
                    label={x.label}
                    labelHidden
                    value={customTheme?.[x.k] || ""}
                    onChange={(v) => onCustomColorChange(x.k, v)}
                    placeholder={x.def}
                  />
                </div>
              </InlineStack>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== Timer display ============================== */
function TimerDisplay({ minutes, message, theme, cssClass, timeFormat, timerIconUrl, timerIconEmoji }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    setTimeLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (timeFormat === "hh[h] mm[m]") return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
    if (timeFormat === "mm[m] ss[s]") return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
    if (timeFormat === "hh[h]") return `${h.toString().padStart(2, "0")}h`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const timerType = TIMER_TYPES.find((t) => t.cssClass === cssClass) || TIMER_TYPES[0];

  return (
    <div
      className={`offer-timer ${cssClass || "timer-type-chrono"}`}
      style={{
        background: theme?.timerBg,
        color: theme?.timerText,
        borderColor: theme?.timerBorder,
      }}
    >
      {timerIconUrl ? (
        <img src={timerIconUrl} alt="timer" style={{ width: 14, height: 14 }} />
      ) : timerIconEmoji ? (
        <span>{timerIconEmoji}</span>
      ) : (
        <span>{timerType.iconEmoji}</span>
      )}
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {message || timerType.defaultMessage}
      </span>
      <span className="timer-countdown">{formatTime(timeLeft)}</span>
    </div>
  );
}

/* ============================== 4 styles preview renderer ============================== */
function OfferCardPreview({ item, theme, showTimer, showButton, t, kind = "offer" }) {
  const title = item.title || (kind === "offer" ? "Offre spéciale" : "Upsell");
  const desc = item.description || (kind === "offer" ? "Profitez de cette offre" : "Proposition complémentaire");
  const img = item.imageUrl || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop";

  const styleId = item.displayStyle || "style-1";
  const cls = styleId === "style-1" ? "offer-style-1"
    : styleId === "style-2" ? "offer-style-2"
    : styleId === "style-3" ? "offer-style-3"
    : "offer-style-4";

  return (
    <div
      className="offer-card"
      style={{
        background: theme.offerBg,
        border: `1px solid ${theme.offerBorder}`,
        color: theme.offerText,
      }}
    >
      <div className={cls}>
        <div className="offer-thumb">
          <img
            src={img}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234F46E5'/%3E%3Cpath d='M50 30L70 70H30Z' fill='white'/%3E%3C/svg%3E";
            }}
          />
        </div>

        <div className="offer-main" style={{ minWidth: 0 }}>
          <div className="offer-title" style={{ color: theme.offerTitle }}>
            {title}
          </div>
          <div className="offer-desc">{desc}</div>

          {showTimer && item.enableTimer && (
            <TimerDisplay
              minutes={item.timerMinutes || 30}
              message={item.timerMessage || t("section2.preview.timerDefaultMessage")}
              theme={theme}
              cssClass={item.timerCssClass}
              timeFormat={item.timerTimeFormat}
              timerIconUrl={item.timerIconUrl}
              timerIconEmoji={item.timerIconEmoji}
            />
          )}

          {showButton && kind === "offer" && (
            <button
              className="offer-activate-btn"
              onClick={() => alert(`Offre "${title}" activée!`)}
            >
              <SafeIcon name="PlusIcon" fallback="CirclePlusIcon" />
              <span>{item.buttonText || "Activer"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Defaults ============================== */
const DEFAULT_OFFER = {
  enabled: true,
  title: "Remise spéciale -10%",
  description: "Profitez de -10% sur votre première commande",
  showInPreview: true,
  displayStyle: "style-1", // NEW
  enableTimer: true,
  timerMinutes: 30,
  timerMessage: "⏱️ Offre limitée!",
  timerCssClass: "timer-type-chrono",
  timerTimeFormat: "mm:ss",
  timerIconUrl: "https://cdn-icons-png.flaticon.com/512/3114/3114883.png",
  timerIconEmoji: "⏱️",
  discountType: "percentage",
  discountValue: 10,
  conditions: { minAmount: 0, maxUses: 100, applicableTo: "all" },
  buttonText: "Activer",
  imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop",
  currency: "MAD",
};

const DEFAULT_UPSELL = {
  enabled: true,
  title: "Cadeau gratuit inclus!",
  description: "Recevez un accessoire en cadeau avec votre commande",
  showInPreview: true,
  displayStyle: "style-2", // NEW
  enableTimer: true,
  timerMinutes: 45,
  timerMessage: "🎁 Cadeau limité!",
  timerCssClass: "timer-type-elegant",
  timerTimeFormat: "hh[h] mm[m]",
  timerIconUrl: "https://cdn-icons-png.flaticon.com/512/7794/7794971.png",
  timerIconEmoji: "💎",
  giftProductId: "",
  giftVariantId: "",
  giftTitle: "Accessoire gratuit",
  imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=200&h=200&fit=crop",
};

const DEFAULT_CFG = {
  meta: { version: 11 }, // bumped
  global: {
    enabled: true,
    currency: "MAD",
    rounding: "none",
    colorPalette: "blue-gradient",
    customTheme: COLOR_PALETTES[0].theme,
  },
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
  display: {
    showOrderSummary: true,
    showOffersSection: true,
    showTimerInPreview: true,
    showActivationButtons: true,
  },
};

function withDefaults(raw = {}) {
  const d = DEFAULT_CFG;
  const x = { ...d, ...raw };

  x.global = { ...d.global, ...(raw.global || {}) };
  x.display = { ...d.display, ...(raw.display || {}) };

  x.offers = Array.isArray(raw.offers) ? raw.offers : d.offers;
  x.upsells = Array.isArray(raw.upsells) ? raw.upsells : d.upsells;

  x.offers = x.offers.slice(0, 3).map((o) => ({ ...DEFAULT_OFFER, ...o }));
  x.upsells = x.upsells.slice(0, 3).map((u) => ({ ...DEFAULT_UPSELL, ...u }));

  // ensure new field exists
  x.offers = x.offers.map((o) => ({ displayStyle: o.displayStyle || "style-1", ...o }));
  x.upsells = x.upsells.map((u) => ({ displayStyle: u.displayStyle || "style-2", ...u }));

  return x;
}

/* ============================== Preview components ============================== */
function OffersPreview({ cfg, t }) {
  const activeOffers = cfg.offers.filter((o) => o.enabled && o.showInPreview);
  if (!activeOffers.length) return null;

  const selectedPalette = COLOR_PALETTES.find((p) => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;

  return (
    <BlockStack gap="200">
      {activeOffers.map((offer, idx) => (
        <OfferCardPreview
          key={idx}
          item={offer}
          theme={theme}
          showTimer={cfg.display.showTimerInPreview}
          showButton={cfg.display.showActivationButtons}
          t={t}
          kind="offer"
        />
      ))}
    </BlockStack>
  );
}

function UpsellsPreview({ cfg, t }) {
  const activeUpsells = cfg.upsells.filter((u) => u.enabled && u.showInPreview);
  if (!activeUpsells.length) return null;

  const selectedPalette = COLOR_PALETTES.find((p) => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;

  return (
    <BlockStack gap="200">
      {activeUpsells.map((upsell, idx) => (
        <OfferCardPreview
          key={idx}
          item={upsell}
          theme={theme}
          showTimer={cfg.display.showTimerInPreview}
          showButton={false}
          t={t}
          kind="upsell"
        />
      ))}
    </BlockStack>
  );
}

function OrderSummaryPreview({ cfg, t }) {
  if (!cfg.display.showOrderSummary) return null;

  const selectedPalette = COLOR_PALETTES.find((p) => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;

  return (
    <div
      className="order-summary-preview"
      style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
    >
      <div className="order-summary-title">{t("section2.preview.orderSummary.title")}</div>
      <div className="order-row">
        <span className="order-label">{t("section2.preview.orderSummary.subtotal")}</span>
        <span>129.99 {cfg.global.currency}</span>
      </div>
      <div className="order-row" style={{ color: "#10B981" }}>
        <span className="order-label">Remise</span>
        <span>-13.00 {cfg.global.currency}</span>
      </div>
      <div className="order-row">
        <span className="order-label">{t("section2.preview.orderSummary.shipping")}</span>
        <span>{t("section1.preview.freeShipping")}</span>
      </div>
      <div className="order-row">
        <span className="order-label">{t("section2.preview.orderSummary.total")}</span>
        <span style={{ fontWeight: 800 }}>116.99 {cfg.global.currency}</span>
      </div>
    </div>
  );
}

/* ============================== Timer types preview (kept) ============================== */
function TimerTypesPreview({ selectedType, onSelect }) {
  return (
    <div style={{ marginTop: 8 }}>
      <InlineStack gap="200" blockAlign="center">
        <SafeIcon name="ClockIcon" fallback="ClockFilledIcon" />
        <Text as="p" fontWeight="bold">
          Prévisualisation (styles timer)
        </Text>
      </InlineStack>

      <div style={{ height: 10 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {TIMER_TYPES.slice(0, 4).map((type) => (
          <div
            key={type.id}
            onClick={() => onSelect(type)}
            style={{
              borderRadius: 12,
              border: selectedType === type.id ? "2px solid #4F46E5" : "1px solid #E5E7EB",
              background: selectedType === type.id ? "#EEF2FF" : "#fff",
              padding: 12,
              cursor: "pointer",
              boxShadow: selectedType === type.id ? "0 10px 24px rgba(79,70,229,.12)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
              <span>{type.iconEmoji}</span>
              <span>{type.name}</span>
            </div>

            <div className={`offer-timer ${type.cssClass}`} style={{ marginTop: 0 }}>
              {type.iconUrl ? <img src={type.iconUrl} alt={type.name} style={{ width: 14, height: 14 }} /> : null}
              <span style={{ fontWeight: 800 }}>{type.defaultMessage.split("!")[0]}!</span>
              <span className="timer-countdown">15:00</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
        Cliquez sur un style pour l’appliquer au timer
      </div>
    </div>
  );
}

/* ============================== Editor components (UPDATED: displayStyle select) ============================== */
function OfferItemEditor({ offer, index, onChange, onRemove, t, canRemove }) {
  const handleChange = (field, value) => {
    const newOffer = { ...offer };
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (!newOffer[parent]) newOffer[parent] = {};
      newOffer[parent][child] = value;
    } else {
      newOffer[field] = value;
    }
    onChange(newOffer);
  };

  const handleTimerTypeSelect = (timerType) => {
    onChange({
      ...offer,
      timerCssClass: timerType.cssClass,
      timerIconUrl: timerType.iconUrl,
      timerIconEmoji: timerType.iconEmoji,
      timerMessage: timerType.defaultMessage,
    });
  };

  const handleCountdownExample = (example) => {
    onChange({
      ...offer,
      enableTimer: true,
      timerMinutes: example.minutes,
      timerMessage: example.message,
      timerCssClass: TIMER_TYPES.find((t) => t.id === example.timerType)?.cssClass || "timer-type-chrono",
      timerTimeFormat: example.timeFormat,
      timerIconUrl: example.timerIconUrl,
    });
  };

  return (
    <div className="offer-item-card">
      {canRemove && <div className="remove-offer-btn" onClick={onRemove}>×</div>}

      <div className="offer-item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="offer-item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">{t("section2.offer.title", { number: index + 1 })}</Text>
        </InlineStack>
        <Checkbox
          label={t("section2.offer.enable")}
          checked={offer.enabled}
          onChange={(v) => handleChange("enabled", v)}
        />
      </div>

      <BlockStack gap="300">
        <Grid2>
          <TextField
            label={t("section2.offer.titleField")}
            value={offer.title}
            onChange={(v) => handleChange("title", v)}
            helpText={t("section2.helpText.offerTitle")}
          />
          <TextField
            label={t("section2.offer.description")}
            value={offer.description}
            onChange={(v) => handleChange("description", v)}
            helpText={t("section2.helpText.offerDesc")}
          />
        </Grid2>

        <GroupCard title="Style d’affichage (Preview)">
          <Select
            label="Choisir un style"
            value={offer.displayStyle || "style-1"}
            onChange={(v) => handleChange("displayStyle", v)}
            options={[
              { label: "Style 1 — Image à gauche, texte à droite", value: "style-1" },
              { label: "Style 2 — Texte à gauche, image à droite", value: "style-2" },
              { label: "Style 3 — Texte en haut, grande image en bas", value: "style-3" },
              { label: "Style 4 — Grande image à gauche + texte", value: "style-4" },
            ]}
          />
          <Text variant="bodySm" tone="subdued">
            Chaque offre peut avoir son propre style.
          </Text>
        </GroupCard>

        <Grid3>
          <Select
            label={t("section2.offer.discountType")}
            value={offer.discountType}
            onChange={(v) => handleChange("discountType", v)}
            options={[
              { label: t("section2.offer.discountType.percentage"), value: "percentage" },
              { label: t("section2.offer.discountType.fixed"), value: "fixed" },
            ]}
          />

          {offer.discountType === "percentage" ? (
            <RangeSlider
              label={`${t("section2.offer.percent")}: ${offer.discountValue}%`}
              min={1}
              max={90}
              output
              value={offer.discountValue}
              onChange={(v) => handleChange("discountValue", v)}
            />
          ) : (
            <TextField
              type="number"
              label={t("section2.offer.fixedAmount")}
              value={String(offer.discountValue)}
              onChange={(v) => handleChange("discountValue", parseFloat(v) || 0)}
            />
          )}

          <TextField
            label={t("section2.offer.buttonText")}
            value={offer.buttonText}
            onChange={(v) => handleChange("buttonText", v)}
            helpText={t("section2.helpText.buttonText")}
          />
        </Grid3>

        <GroupCard title={t("section2.group.conditions.title")}>
          <Grid3>
            <TextField
              type="number"
              label={t("section2.offer.minAmount")}
              value={String(offer.conditions?.minAmount || 0)}
              onChange={(v) => handleChange("conditions.minAmount", parseInt(v) || 0)}
              helpText={t("section2.helpText.minAmount")}
            />
            <TextField
              type="number"
              label={t("section2.offer.maxUses")}
              value={String(offer.conditions?.maxUses || 100)}
              onChange={(v) => handleChange("conditions.maxUses", parseInt(v) || 100)}
              helpText={t("section2.helpText.maxUses")}
            />
            <Select
              label={t("section2.offer.applicableTo")}
              value={offer.conditions?.applicableTo || "all"}
              onChange={(v) => handleChange("conditions.applicableTo", v)}
              options={[
                { label: t("section2.offer.applicableTo.all"), value: "all" },
                { label: t("section2.offer.applicableTo.specific"), value: "specific" },
              ]}
            />
          </Grid3>
        </GroupCard>

        <GroupCard title={t("section2.group.images.title")}>
          <TextField
            label={t("section2.offer.imageUrl")}
            value={offer.imageUrl}
            onChange={(v) => handleChange("imageUrl", v)}
            helpText={t("section2.helpText.offerImage")}
            placeholder="https://example.com/image.jpg"
          />
        </GroupCard>

        <GroupCard title={t("section2.group.timer.title")}>
          <TimerTypesPreview
            selectedType={TIMER_TYPES.find((x) => x.cssClass === offer.timerCssClass)?.id}
            onSelect={handleTimerTypeSelect}
          />

          <div style={{ height: 10 }} />

          <Grid2>
            <Checkbox
              label={t("section2.offer.enableTimer")}
              checked={!!offer.enableTimer}
              onChange={(v) => handleChange("enableTimer", v)}
              helpText={t("section2.helpText.timer")}
            />

            {offer.enableTimer && (
              <>
                <TextField
                  type="number"
                  label={t("section2.offer.timerMinutes")}
                  value={String(offer.timerMinutes || 60)}
                  onChange={(v) => handleChange("timerMinutes", parseInt(v) || 60)}
                  helpText={t("section2.helpText.timerMinutes")}
                />
                <TextField
                  label={t("section2.offer.timerMessage")}
                  value={offer.timerMessage || ""}
                  onChange={(v) => handleChange("timerMessage", v)}
                  helpText={t("section2.helpText.timerMessage")}
                />
                <Select
                  label={t("section2.offer.timerTimeFormat")}
                  value={offer.timerTimeFormat || "mm:ss"}
                  onChange={(v) => handleChange("timerTimeFormat", v)}
                  options={[
                    { label: "mm:ss", value: "mm:ss" },
                    { label: "hh[h] mm[m]", value: "hh[h] mm[m]" },
                    { label: "mm[m] ss[s]", value: "mm[m] ss[s]" },
                    { label: "hh[h]", value: "hh[h]" },
                  ]}
                />
                <TextField
                  label={t("section2.offer.timerIconUrl")}
                  value={offer.timerIconUrl || ""}
                  onChange={(v) => handleChange("timerIconUrl", v)}
                  helpText={t("section2.helpText.timerIconUrl")}
                  placeholder="https://cdn-icons-png.flaticon.com/512/..."
                />
              </>
            )}
          </Grid2>

          <div style={{ marginTop: 12 }}>
            <Text as="p" variant="bodyMd" fontWeight="bold">
              Modèles de timer prédéfinis
            </Text>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginTop: 8 }}>
              {COUNTDOWN_EXAMPLES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleCountdownExample(ex)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "#F9FAFB",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                >
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{ex.message}</div>
                </div>
              ))}
            </div>
          </div>
        </GroupCard>

        <GroupCard title={t("section2.group.display.title")}>
          <Checkbox
            label={t("section2.offer.showInPreview")}
            checked={offer.showInPreview}
            onChange={(v) => handleChange("showInPreview", v)}
          />
        </GroupCard>
      </BlockStack>
    </div>
  );
}

function UpsellItemEditor({ upsell, index, onChange, onRemove, t, canRemove }) {
  const handleChange = (field, value) => onChange({ ...upsell, [field]: value });

  const handleTimerTypeSelect = (timerType) => {
    onChange({
      ...upsell,
      timerCssClass: timerType.cssClass,
      timerIconUrl: timerType.iconUrl,
      timerIconEmoji: timerType.iconEmoji,
      timerMessage: timerType.defaultMessage,
    });
  };

  const handleCountdownExample = (example) => {
    onChange({
      ...upsell,
      enableTimer: true,
      timerMinutes: example.minutes,
      timerMessage: example.message,
      timerCssClass: TIMER_TYPES.find((t) => t.id === example.timerType)?.cssClass || "timer-type-chrono",
      timerTimeFormat: example.timeFormat,
      timerIconUrl: example.timerIconUrl,
    });
  };

  return (
    <div className="offer-item-card">
      {canRemove && <div className="remove-offer-btn" onClick={onRemove}>×</div>}

      <div className="offer-item-header">
        <InlineStack align="start" blockAlign="center">
          <span className="offer-item-number">{index + 1}</span>
          <Text as="h3" variant="headingSm">{t("section2.upsell.title", { number: index + 1 })}</Text>
        </InlineStack>
        <Checkbox
          label={t("section2.upsell.enable")}
          checked={upsell.enabled}
          onChange={(v) => handleChange("enabled", v)}
        />
      </div>

      <BlockStack gap="300">
        <Grid2>
          <TextField
            label={t("section2.upsell.titleField")}
            value={upsell.title}
            onChange={(v) => handleChange("title", v)}
            helpText={t("section2.helpText.upsellTitle")}
          />
          <TextField
            label={t("section2.upsell.description")}
            value={upsell.description}
            onChange={(v) => handleChange("description", v)}
            helpText={t("section2.helpText.giftDesc")}
          />
        </Grid2>

        <GroupCard title="Style d’affichage (Preview)">
          <Select
            label="Choisir un style"
            value={upsell.displayStyle || "style-2"}
            onChange={(v) => handleChange("displayStyle", v)}
            options={[
              { label: "Style 1 — Image à gauche, texte à droite", value: "style-1" },
              { label: "Style 2 — Texte à gauche, image à droite", value: "style-2" },
              { label: "Style 3 — Texte en haut, grande image en bas", value: "style-3" },
              { label: "Style 4 — Grande image à gauche + texte", value: "style-4" },
            ]}
          />
          <Text variant="bodySm" tone="subdued">
            Chaque upsell peut avoir son propre style.
          </Text>
        </GroupCard>

        <Grid3>
          <TextField
            label={t("section2.upsell.giftTitle")}
            value={upsell.giftTitle}
            onChange={(v) => handleChange("giftTitle", v)}
            helpText={t("section2.helpText.giftTitle")}
          />
          <TextField
            label={t("section2.upsell.giftProductId")}
            value={upsell.giftProductId}
            onChange={(v) => handleChange("giftProductId", v)}
            helpText={t("section2.helpText.giftProductId")}
          />
          <TextField
            label={t("section2.upsell.giftVariantId")}
            value={upsell.giftVariantId}
            onChange={(v) => handleChange("giftVariantId", v)}
            helpText={t("section2.helpText.giftVariantId")}
          />
        </Grid3>

        <GroupCard title={t("section2.group.images.title")}>
          <TextField
            label={t("section2.upsell.imageUrl")}
            value={upsell.imageUrl}
            onChange={(v) => handleChange("imageUrl", v)}
            helpText={t("section2.helpText.offerImage")}
            placeholder="https://example.com/image.jpg"
          />
        </GroupCard>

        <GroupCard title={t("section2.group.timer.title")}>
          <TimerTypesPreview
            selectedType={TIMER_TYPES.find((x) => x.cssClass === upsell.timerCssClass)?.id}
            onSelect={handleTimerTypeSelect}
          />

          <div style={{ height: 10 }} />

          <Grid2>
            <Checkbox
              label={t("section2.upsell.enableTimer")}
              checked={!!upsell.enableTimer}
              onChange={(v) => handleChange("enableTimer", v)}
              helpText={t("section2.helpText.timer")}
            />

            {upsell.enableTimer && (
              <>
                <TextField
                  type="number"
                  label={t("section2.upsell.timerMinutes")}
                  value={String(upsell.timerMinutes || 60)}
                  onChange={(v) => handleChange("timerMinutes", parseInt(v) || 60)}
                  helpText={t("section2.helpText.timerMinutes")}
                />
                <TextField
                  label={t("section2.upsell.timerMessage")}
                  value={upsell.timerMessage || ""}
                  onChange={(v) => handleChange("timerMessage", v)}
                  helpText={t("section2.helpText.timerMessage")}
                />
                <Select
                  label={t("section2.upsell.timerTimeFormat")}
                  value={upsell.timerTimeFormat || "hh[h] mm[m]"}
                  onChange={(v) => handleChange("timerTimeFormat", v)}
                  options={[
                    { label: "mm:ss", value: "mm:ss" },
                    { label: "hh[h] mm[m]", value: "hh[h] mm[m]" },
                    { label: "mm[m] ss[s]", value: "mm[m] ss[s]" },
                    { label: "hh[h]", value: "hh[h]" },
                  ]}
                />
                <TextField
                  label={t("section2.upsell.timerIconUrl")}
                  value={upsell.timerIconUrl || ""}
                  onChange={(v) => handleChange("timerIconUrl", v)}
                  helpText={t("section2.helpText.timerIconUrl")}
                  placeholder="https://cdn-icons-png.flaticon.com/512/..."
                />
              </>
            )}
          </Grid2>

          <div style={{ marginTop: 12 }}>
            <Text as="p" variant="bodyMd" fontWeight="bold">
              Modèles de timer prédéfinis
            </Text>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginTop: 8 }}>
              {COUNTDOWN_EXAMPLES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleCountdownExample(ex)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: "#F9FAFB",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                >
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{ex.message}</div>
                </div>
              ))}
            </div>
          </div>
        </GroupCard>

        <GroupCard title={t("section2.group.display.title")}>
          <Checkbox
            label={t("section2.upsell.showInPreview")}
            checked={upsell.showInPreview}
            onChange={(v) => handleChange("showInPreview", v)}
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
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#F9FAFB" }}>{t("section2.header.appTitle")}</div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.8)" }}>
                {t("section2.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section2.preview.subtitle")} {loading ? t("section0.usage.loading") : ""}
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

  const tabs = useMemo(
    () => [
      { id: "global", content: t("section2.rail.global"), panelID: "tab-global", icon: "SettingsIcon" },
      { id: "colors", content: t("section2.rail.colors"), panelID: "tab-colors", icon: "PaintBrushIcon" },
      { id: "offers", content: t("section2.rail.offers"), panelID: "tab-offers", icon: "DiscountIcon" },
      { id: "upsells", content: t("section2.rail.upsells"), panelID: "tab-upsells", icon: "GiftCardIcon" },
    ],
    [t]
  );

  const selectedTabIndex = Math.max(0, tabs.findIndex((x) => x.id === tab));

  const persistLocal = (next) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tripleform_cod_offers_v11", JSON.stringify(withDefaults(next)));
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
        console.warn("[Section2Offers] load failed, fallback localStorage", e);
      }

      if (!cancelled && typeof window !== "undefined") {
        try {
          const s = window.localStorage.getItem("tripleform_cod_offers_v11");
          if (s) setCfg(withDefaults(JSON.parse(s)));
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
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      alert("Offres enregistrées ✔️");
    } catch (e) {
      console.error(e);
      alert("Échec de l'enregistrement : " + (e?.message || "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  const setGlobal = (p) => setCfg((c) => ({ ...c, global: { ...c.global, ...p } }));
  const setDisplay = (p) => setCfg((c) => ({ ...c, display: { ...c.display, ...p } }));
  const setCustomTheme = (field, value) =>
    setCfg((c) => ({ ...c, global: { ...c.global, customTheme: { ...c.global.customTheme, [field]: value } } }));

  const applyPalette = (paletteId) => {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (!palette) return;
    setCfg((c) => ({ ...c, global: { ...c.global, colorPalette: paletteId, customTheme: palette.theme } }));
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

  const selectedPalette = COLOR_PALETTES.find((p) => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;

  return (
    <PageShell t={t} loading={loading} onSave={saveOffers} saving={saving}>
      {/* Top Tabs menu */}
      <div className="tf-topnav">
        <Tabs
          tabs={tabs.map((x) => ({ id: x.id, content: x.content, panelID: x.panelID }))}
          selected={selectedTabIndex}
          onSelect={(i) => setTab(tabs[i]?.id || "global")}
        />
      </div>

      <div className="tf-editor">
        {/* MAIN */}
        <div className="tf-main-col">
          <div className="tf-hero">
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <span className="tf-hero-badge">
                  {cfg.offers.filter((o) => o.enabled).length} {t("section2.rail.offers")} •{" "}
                  {cfg.upsells.filter((u) => u.enabled).length} {t("section2.rail.upsells")}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{t("section2.header.appTitle")}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{t("section2.helpText.display")}</div>
                </div>
              </InlineStack>
              <InlineStack gap="200" blockAlign="center">
                <SafeIcon
                  name={tabs[selectedTabIndex]?.icon || "AppsIcon"}
                  fallback="AppsIcon"
                />
                <div style={{ fontSize: 12, opacity: 0.9 }}>{tabs[selectedTabIndex]?.content}</div>
              </InlineStack>
            </InlineStack>
          </div>

          <div className="tf-panel">
            {tab === "global" && (
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
                      options={[
                        { label: "MAD (DH)", value: "MAD" },
                        { label: "EUR (€)", value: "EUR" },
                        { label: "USD ($)", value: "USD" },
                        { label: "GBP (£)", value: "GBP" },
                      ]}
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
                  <Grid3>
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
                    <Checkbox
                      label={t("section2.display.showTimerInPreview")}
                      checked={cfg.display.showTimerInPreview}
                      onChange={(v) => setDisplay({ showTimerInPreview: v })}
                    />
                    <Checkbox
                      label={t("section2.display.showActivationButtons")}
                      checked={cfg.display.showActivationButtons}
                      onChange={(v) => setDisplay({ showActivationButtons: v })}
                    />
                  </Grid3>
                  <Text variant="bodySm" tone="subdued">
                    {t("section2.helpText.display")}
                  </Text>
                </GroupCard>
              </BlockStack>
            )}

            {tab === "colors" && (
              <GroupCard title={t("section2.group.colors.title")}>
                <ColorPaletteSelector
                  selectedPalette={cfg.global.colorPalette}
                  onSelect={applyPalette}
                  customTheme={cfg.global.customTheme}
                  onCustomColorChange={setCustomTheme}
                />
              </GroupCard>
            )}

            {tab === "offers" && (
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("section2.rail.offers")} ({cfg.offers.length}/3)
                  </Text>
                  <Badge tone="subdued">Preview: 4 styles</Badge>
                </InlineStack>

                {cfg.offers.map((offer, index) => (
                  <OfferItemEditor
                    key={index}
                    offer={offer}
                    index={index}
                    onChange={(updated) => updateOffer(index, updated)}
                    onRemove={() => removeOffer(index)}
                    t={t}
                    canRemove={cfg.offers.length > 1}
                  />
                ))}

                {cfg.offers.length < 3 && (
                  <div className="add-button-container">
                    <div className="add-button" onClick={addOffer}>
                      <SafeIcon name="PlusIcon" fallback="CirclePlusIcon" />
                      {t("section2.button.addOffer")}
                    </div>
                  </div>
                )}
              </BlockStack>
            )}

            {tab === "upsells" && (
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("section2.rail.upsells")} ({cfg.upsells.length}/3)
                  </Text>
                  <Badge tone="subdued">Preview: 4 styles</Badge>
                </InlineStack>

                {cfg.upsells.map((upsell, index) => (
                  <UpsellItemEditor
                    key={index}
                    upsell={upsell}
                    index={index}
                    onChange={(updated) => updateUpsell(index, updated)}
                    onRemove={() => removeUpsell(index)}
                    t={t}
                    canRemove={cfg.upsells.length > 1}
                  />
                ))}

                {cfg.upsells.length < 3 && (
                  <div className="add-button-container">
                    <div className="add-button" onClick={addUpsell}>
                      <SafeIcon name="PlusIcon" fallback="CirclePlusIcon" />
                      {t("section2.button.addUpsell")}
                    </div>
                  </div>
                )}
              </BlockStack>
            )}
          </div>
        </div>

        {/* PREVIEW (narrow + organized) */}
        <div className="tf-preview-col">
          <div
            className="tf-preview-card"
            style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text }}
          >
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm" style={{ color: theme.text }}>
                  {t("section2.preview.title")}
                </Text>
                <Badge tone={cfg.global.enabled ? "success" : "critical"}>
                  {cfg.global.enabled ? t("section2.preview.active") : t("section2.preview.inactive")}
                </Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                {t("section2.preview.subtitle")}
              </Text>

              {cfg.display.showOffersSection && (
                <>
                  <OffersPreview cfg={cfg} t={t} />
                  <UpsellsPreview cfg={cfg} t={t} />
                </>
              )}

              <OrderSummaryPreview cfg={cfg} t={t} />
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;
