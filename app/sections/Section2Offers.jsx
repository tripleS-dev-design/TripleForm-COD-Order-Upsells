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
  Box,
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

  /* ---- Timer display for offers ---- */
  .offer-timer {
    display:flex;
    align-items:center;
    gap:6px;
    font-size:11px;
    font-weight:600;
    margin-top:6px;
    padding:4px 8px;
    border-radius:6px;
  }
  .offer-timer-icon {
    font-size:10px;
  }
  .timer-countdown {
    font-family:monospace;
    font-weight:bold;
    letter-spacing:1px;
    margin-left:auto;
  }

  /* ---- Styles avancés pour les timers ---- */
  .timer-chrono {
    background: linear-gradient(90deg, #1e3a8a, #3b82f6) !important;
    color: #fff !important;
    border: 1px solid #60a5fa !important;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  }

  .timer-black-friday {
    background: linear-gradient(90deg, #000000, #dc2626) !important;
    color: #fff !important;
    border: 2px solid #fbbf24 !important;
    font-weight: 800;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  }

  .timer-new-year {
    background: linear-gradient(135deg, #0f766e, #0ea5e9, #ec4899) !important;
    color: #fff !important;
    border: 1px solid #fde047 !important;
    font-weight: bold;
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
  }

  .timer-flash {
    background: linear-gradient(90deg, #f97316, #fbbf24) !important;
    color: #1f2937 !important;
    border: 1px solid #f59e0b !important;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
  }

  .timer-hot {
    background: linear-gradient(90deg, #7c2d12, #ea580c) !important;
    color: #fff !important;
    border: 1px solid #fdba74 !important;
    animation: pulse 1.5s infinite;
    font-weight: 800;
  }

  .timer-weekend {
    background: linear-gradient(135deg, #7c3aed, #10b981) !important;
    color: #fff !important;
    border: 1px solid #a7f3d0 !important;
    font-weight: bold;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
  }

  .timer-elegant {
    background: linear-gradient(135deg, #8B5CF6, #EC4899) !important;
    color: #fff !important;
    border: 1px solid #DDD6FE !important;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3);
  }

  .timer-minimal {
    background: #F9FAFB !important;
    color: #374151 !important;
    border: 1px solid #E5E7EB !important;
    font-weight: 500;
  }

  .timer-urgent {
    background: linear-gradient(90deg, #991B1B, #DC2626) !important;
    color: #fff !important;
    border: 1px solid #FCA5A5 !important;
    font-weight: 700;
    animation: blink 1s infinite;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  }

  .timer-simple {
    background: #FEF2F2 !important;
    color: #DC2626 !important;
    border: 1px solid #FECACA !important;
    font-weight: 600;
  }

  /* Animation pour le timer "hot" */
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.8; }
    100% { opacity: 1; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* ---- Palette de couleurs ---- */
  .color-palette-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(140px, 1fr));
    gap:12px;
    margin-top:12px;
  }
  .color-palette-item {
    border:1px solid #E5E7EB;
    border-radius:10px;
    overflow:hidden;
    cursor:pointer;
    transition:all 0.2s;
  }
  .color-palette-item:hover {
    transform:translateY(-2px);
    box-shadow:0 6px 16px rgba(0,0,0,0.1);
  }
  .color-palette-item.active {
    outline:2px solid #00A7A3;
  }
  .palette-colors {
    display:flex;
    height:36px;
  }
  .palette-info {
    padding:8px;
    background:#fff;
    font-size:11px;
    font-weight:600;
  }

  /* ---- Custom color picker ---- */
  .custom-color-picker {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));
    gap:16px;
    margin-top:16px;
  }
  .color-field {
    display:grid;
    gap:6px;
  }
  .color-field-label {
    font-size:13px;
    font-weight:600;
    color:#111827;
  }
  .color-input-group {
    display:flex;
    gap:8px;
    align-items:center;
  }
  .color-preview {
    width:40px;
    height:40px;
    border-radius:8px;
    border:1px solid #E5E7EB;
    cursor:pointer;
  }
  .color-input {
    flex:1;
  }

  /* ---- Bouton d'ajout centré ---- */
  .add-button-container {
    display:flex;
    justify-content:center;
    margin-top:20px;
    margin-bottom:10px;
  }
  .add-button {
    padding:12px 24px;
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
    min-width:200px;
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

  /* ---- Bouton d'activation ---- */
  .offer-activate-btn {
    background:#000000;
    color:#FFFFFF;
    border:1px solid #000000;
    border-radius:4px;
    padding:4px 10px;
    font-size:11px;
    font-weight:500;
    cursor:pointer;
    margin-top:6px;
    transition:all 0.2s ease;
    display:inline-flex;
    align-items:center;
    gap:4px;
  }
  .offer-activate-btn:hover {
    background:#374151;
    border-color:#374151;
  }
  .offer-activate-btn.active {
    background:#10B981;
    color:#FFFFFF;
    border-color:#10B981;
  }
  .offer-activate-btn.disabled {
    background:#9CA3AF;
    color:#FFFFFF;
    border-color:#9CA3AF;
    cursor:not-allowed;
  }
  .offer-activate-btn-icon {
    font-size:10px;
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

/* ============================== Palettes de couleurs ============================== */
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
      timerBorder: "#FECACA"
    }
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
      timerBorder: "#FECACA"
    }
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
      timerBorder: "#991B1B"
    }
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
      timerBorder: "#FECACA"
    }
  },
  {
    id: "sunset-orange",
    name: "Orange Couchant",
    colors: ["#F97316", "#9A3412", "#FDBA74", "#FFEDD5", "#FFF7ED"],
    theme: {
      bg: "#FFF7ED",
      text: "#9A3412",
      border: "#FDBA74",
      offerBg: "#FFEDD5",
      offerBorder: "#FDBA74",
      offerTitle: "#9A3412",
      offerText: "#92400E",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA"
    }
  },
  {
    id: "purple-elegant",
    name: "Violet Élégant",
    colors: ["#8B5CF6", "#5B21B6", "#E9D5FF", "#F5F3FF", "#FAF5FF"],
    theme: {
      bg: "#FAF5FF",
      text: "#5B21B6",
      border: "#E9D5FF",
      offerBg: "#F5F3FF",
      offerBorder: "#DDD6FE",
      offerTitle: "#5B21B6",
      offerText: "#6D28D9",
      timerBg: "#FDF4FF",
      timerText: "#C026D3",
      timerBorder: "#F0ABFC"
    }
  },
  {
    id: "luxury-gold",
    name: "Or Luxueux",
    colors: ["#D97706", "#854D0E", "#FDE68A", "#FEF3C7", "#FEFCE8"],
    theme: {
      bg: "#FEFCE8",
      text: "#854D0E",
      border: "#FDE68A",
      offerBg: "#FEF3C7",
      offerBorder: "#FCD34D",
      offerTitle: "#854D0E",
      offerText: "#92400E",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA"
    }
  },
  {
    id: "ocean-deep",
    name: "Océan Profond",
    colors: ["#0891B2", "#0E7490", "#A5F3FC", "#CFFAFE", "#ECFEFF"],
    theme: {
      bg: "#ECFEFF",
      text: "#0E7490",
      border: "#A5F3FC",
      offerBg: "#CFFAFE",
      offerBorder: "#67E8F9",
      offerTitle: "#0E7490",
      offerText: "#0891B2",
      timerBg: "#F0F9FF",
      timerText: "#0369A1",
      timerBorder: "#BAE6FD"
    }
  }
];

/* ============================== Exemples de countdown prédéfinis ============================== */
const COUNTDOWN_EXAMPLES = [
  {
    id: "chrono-urgent",
    name: "Chrono Urgence (1h)",
    minutes: 60,
    template: "chrono",
    message: "⏱️ DERNIÈRE CHANCE ! L'offre expire dans :",
    cssClass: "timer-chrono",
    icon: "⏱️",
    timeFormat: "mm:ss"
  },
  {
    id: "black-friday",
    name: "Mode Black Friday (2h)",
    minutes: 120,
    template: "event",
    message: "🖤 BLACK FRIDAY EXCLUSIF ! Plus que :",
    cssClass: "timer-black-friday",
    icon: "🖤",
    timeFormat: "hh[h] mm[m]"
  },
  {
    id: "new-year-promo",
    name: "Promo Fin d'Année (45min)",
    minutes: 45,
    template: "event",
    message: "🎊 BONNE ANNÉE ! Offre spéciale termine dans :",
    cssClass: "timer-new-year",
    icon: "🎊",
    timeFormat: "mm[m] ss[s]"
  },
  {
    id: "flash-sale",
    name: "Flash Sale (30min)",
    minutes: 30,
    template: "chrono",
    message: "⚡ VENTE ÉCLAIR ! Derniers :",
    cssClass: "timer-flash",
    icon: "⚡",
    timeFormat: "mm:ss"
  },
  {
    id: "clearance-hot",
    name: "Liquidation Chaude (15min)",
    minutes: 15,
    template: "urgent",
    message: "🔥 LIQUIDATION ! Fini dans :",
    cssClass: "timer-hot",
    icon: "🔥",
    timeFormat: "mm:ss"
  },
  {
    id: "weekend-blast",
    name: "Offre Weekend (24h)",
    minutes: 1440,
    template: "event",
    message: "🎉 WEEKEND SPÉCIAL ! Disparaît dans :",
    cssClass: "timer-weekend",
    icon: "🎉",
    timeFormat: "hh[h]"
  },
  {
    id: "elegant-purple",
    name: "Élégant Violet (45min)",
    minutes: 45,
    template: "elegant",
    message: "💜 OFFRE EXCLUSIVE ! Termine dans :",
    cssClass: "timer-elegant",
    icon: "💜",
    timeFormat: "mm[m] ss[s]"
  },
  {
    id: "minimal-clean",
    name: "Minimaliste Propre (30min)",
    minutes: 30,
    template: "minimal",
    message: "⏱️ Dernière chance :",
    cssClass: "timer-minimal",
    icon: "⏱️",
    timeFormat: "mm:ss"
  },
  {
    id: "urgent-red",
    name: "Urgent Rouge (10min)",
    minutes: 10,
    template: "urgent",
    message: "🚨 URGENT ! Presque fini :",
    cssClass: "timer-urgent",
    icon: "🚨",
    timeFormat: "mm:ss"
  },
  {
    id: "simple-red",
    name: "Simple Rouge (20min)",
    minutes: 20,
    template: "simple",
    message: "🔴 Offre spéciale :",
    cssClass: "timer-simple",
    icon: "🔴",
    timeFormat: "mm:ss"
  }
];

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

/* ============================== Sélecteur de palette de couleurs ============================== */
function ColorPaletteSelector({ selectedPalette, onSelect, customTheme, onCustomColorChange }) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text as="p" variant="bodyMd">
          Choisissez une palette prédéfinie ou personnalisez les couleurs manuellement
        </Text>
      </div>
      
      <div className="color-palette-grid">
        {COLOR_PALETTES.map((palette) => (
          <div
            key={palette.id}
            className={`color-palette-item ${selectedPalette === palette.id ? 'active' : ''}`}
            onClick={() => {
              onSelect(palette.id);
              setShowCustom(false);
            }}
          >
            <div className="palette-colors">
              {palette.colors.map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    background: color,
                    height: '100%',
                  }}
                  title={color}
                />
              ))}
            </div>
            <div className="palette-info">
              {palette.name}
            </div>
          </div>
        ))}
        
        <div
          className={`color-palette-item ${showCustom ? 'active' : ''}`}
          onClick={() => setShowCustom(true)}
          style={{ borderStyle: 'dashed' }}
        >
          <div className="palette-colors" style={{ background: '#F9FAFB' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon source={PI.PaintBrushIcon} />
            </div>
          </div>
          <div className="palette-info">
            Personnaliser
          </div>
        </div>
      </div>
      
      {showCustom && (
        <div className="custom-color-picker">
          <div className="color-field">
            <div className="color-field-label">Fond des offres</div>
            <div className="color-input-group">
              <div 
                className="color-preview" 
                style={{ background: customTheme.offerBg || '#FFFFFF' }}
                onClick={() => {
                  const color = prompt("Entrez une couleur hexadécimale (#FFFFFF):", customTheme.offerBg || '#FFFFFF');
                  if (color) onCustomColorChange('offerBg', color);
                }}
              />
              <TextField
                label="Fond des offres"
                labelHidden
                value={customTheme.offerBg || ''}
                onChange={(value) => onCustomColorChange('offerBg', value)}
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          
          <div className="color-field">
            <div className="color-field-label">Titre des offres</div>
            <div className="color-input-group">
              <div 
                className="color-preview" 
                style={{ background: customTheme.offerTitle || '#111827' }}
                onClick={() => {
                  const color = prompt("Entrez une couleur hexadécimale:", customTheme.offerTitle || '#111827');
                  if (color) onCustomColorChange('offerTitle', color);
                }}
              />
              <TextField
                label="Titre des offres"
                labelHidden
                value={customTheme.offerTitle || ''}
                onChange={(value) => onCustomColorChange('offerTitle', value)}
                placeholder="#111827"
              />
            </div>
          </div>
          
          <div className="color-field">
            <div className="color-field-label">Texte des offres</div>
            <div className="color-input-group">
              <div 
                className="color-preview" 
                style={{ background: customTheme.offerText || '#374151' }}
                onClick={() => {
                  const color = prompt("Entrez une couleur hexadécimale:", customTheme.offerText || '#374151');
                  if (color) onCustomColorChange('offerText', color);
                }}
              />
              <TextField
                label="Texte des offres"
                labelHidden
                value={customTheme.offerText || ''}
                onChange={(value) => onCustomColorChange('offerText', value)}
                placeholder="#374151"
              />
            </div>
          </div>
          
          <div className="color-field">
            <div className="color-field-label">Fond du timer</div>
            <div className="color-input-group">
              <div 
                className="color-preview" 
                style={{ background: customTheme.timerBg || '#FEF2F2' }}
                onClick={() => {
                  const color = prompt("Entrez une couleur hexadécimale:", customTheme.timerBg || '#FEF2F2');
                  if (color) onCustomColorChange('timerBg', color);
                }}
              />
              <TextField
                label="Fond du timer"
                labelHidden
                value={customTheme.timerBg || ''}
                onChange={(value) => onCustomColorChange('timerBg', value)}
                placeholder="#FEF2F2"
              />
            </div>
          </div>
          
          <div className="color-field">
            <div className="color-field-label">Texte du timer</div>
            <div className="color-input-group">
              <div 
                className="color-preview" 
                style={{ background: customTheme.timerText || '#DC2626' }}
                onClick={() => {
                  const color = prompt("Entrez une couleur hexadécimale:", customTheme.timerText || '#DC2626');
                  if (color) onCustomColorChange('timerText', color);
                }}
              />
              <TextField
                label="Texte du timer"
                labelHidden
                value={customTheme.timerText || ''}
                onChange={(value) => onCustomColorChange('timerText', value)}
                placeholder="#DC2626"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== Exemples de countdown ============================== */
function CountdownExamples({ onSelect }) {
  return (
    <div style={{ marginTop: 12 }}>
      <Text as="p" variant="bodyMd" fontWeight="medium">
        Modèles de timer prédéfinis:
      </Text>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 8,
        marginTop: 8
      }}>
        {COUNTDOWN_EXAMPLES.map((example) => (
          <div
            key={example.id}
            style={{
              padding: '8px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: '#F9FAFB',
              transition: 'all 0.2s'
            }}
            onClick={() => onSelect(example)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>{example.name}</div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {example.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== Composant Timer pour prévisualisation ============================== */
function TimerDisplay({ minutes, message, theme, cssClass, timeFormat }) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    // Support de différents formats définis dans les exemples
    if (timeFormat === 'hh[h] mm[m]') {
      return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
    }
    if (timeFormat === 'mm[m] ss[s]') {
      return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    if (timeFormat === 'hh[h]') {
      return `${h.toString().padStart(2, '0')}h`;
    }
    // Format par défaut mm:ss
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      className={`offer-timer ${cssClass || ''}`}
      style={{
        background: theme?.timerBg || '#FEF2F2',
        color: theme?.timerText || '#DC2626',
        borderColor: theme?.timerBorder || '#FECACA'
      }}
    >
      <span className="offer-timer-icon">⏱️</span>
      <span>{message}</span>
      <span className="timer-countdown">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

/* ============================== DEFAULTS ============================== */

const DEFAULT_OFFER = {
  enabled: true,
  title: "Remise spéciale -10%",
  description: "Profitez de -10% sur votre première commande",
  showInPreview: true,
  enableTimer: true,
  timerMinutes: 60,
  timerMessage: "⏱️ Offre limitée!",
  timerCssClass: "timer-flash",
  timerTimeFormat: "mm:ss",
  discountType: "percentage",
  discountValue: 10,
  conditions: {
    minAmount: 0,
    maxUses: 100,
    applicableTo: "all"
  },
  buttonText: "Activer",
  imageUrl: "",
  currency: "MAD"
};

const DEFAULT_UPSELL = {
  enabled: true,
  title: "Cadeau gratuit inclus!",
  description: "Recevez un accessoire en cadeau avec votre commande",
  showInPreview: true,
  enableTimer: true,
  timerMinutes: 45,
  timerMessage: "🎁 Cadeau limité!",
  timerCssClass: "timer-hot",
  timerTimeFormat: "hh[h] mm[m]",
  giftProductId: "",
  giftVariantId: "",
  giftTitle: "Accessoire gratuit",
  imageUrl: ""
};

const DEFAULT_CFG = {
  meta: { version: 10 },
  global: { 
    enabled: true, 
    currency: "MAD",
    rounding: "none",
    colorPalette: "blue-gradient",
    customTheme: {
      bg: "#F0F9FF",
      text: "#0C4A6E",
      border: "#E2E8F0",
      offerBg: "#FFFFFF",
      offerBorder: "#CBD5E1",
      offerTitle: "#0C4A6E",
      offerText: "#0C4A6E",
      timerBg: "#FEF2F2",
      timerText: "#DC2626",
      timerBorder: "#FECACA"
    }
  },
  
  // Multiple offers support (max 3)
  offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
  
  // Multiple upsells support (max 3)
  upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
  
  // Display settings
  display: {
    showOrderSummary: true,
    showOffersSection: true,
    showTimerInPreview: true,
    showActivationButtons: true
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

function OffersPreview({ cfg, products, t }) {
  const activeOffers = cfg.offers.filter(offer => offer.enabled && offer.showInPreview);
  
  if (activeOffers.length === 0) return null;
  
  const selectedPalette = COLOR_PALETTES.find(p => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;
  
  return (
    <BlockStack gap="200">
      {activeOffers.map((offer, idx) => {
        const title = offer.title || "Remise spéciale";
        const description = offer.description || "Profitez de cette offre exclusive";
        const img = offer.imageUrl || "";
        const hasTimer = offer.enableTimer && cfg.display.showTimerInPreview;
        const buttonText = offer.buttonText || "Activer";
        const timerCssClass = offer.timerCssClass || "";
        
        return (
          <div 
            key={idx} 
            className="offers-strip"
            style={{
              background: theme.offerBg,
              border: `1px solid ${theme.offerBorder}`,
              color: theme.offerText
            }}
          >
            <div className="offers-strip-thumb">
              {img ? (
                <img src={img} alt={title} />
              ) : (
                <div className="offers-strip-thumb-inner" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="offers-strip-main" style={{ color: theme.offerTitle }}>
                {title}
              </div>
              <div className="offers-strip-desc">
                {description}
              </div>
              
              {cfg.display.showTimerInPreview && offer.enableTimer && (
                <TimerDisplay 
                  minutes={offer.timerMinutes} 
                  message={offer.timerMessage || t("section2.preview.timerDefaultMessage")}
                  theme={theme}
                  cssClass={offer.timerCssClass}
                  timeFormat={offer.timerTimeFormat}
                />
              )}
              
              {cfg.display.showActivationButtons && (
                <button 
                  className="offer-activate-btn"
                  onClick={() => {
                    // Simulation de l'activation
                    alert(`Offre "${title}" activée!`);
                  }}
                >
                  <span className="offer-activate-btn-icon">+</span>
                  {buttonText}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </BlockStack>
  );
}

function UpsellsPreview({ cfg, products, t }) {
  const activeUpsells = cfg.upsells.filter(upsell => upsell.enabled && upsell.showInPreview);
  
  if (activeUpsells.length === 0) return null;
  
  const selectedPalette = COLOR_PALETTES.find(p => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;
  
  return (
    <BlockStack gap="200">
      {activeUpsells.map((upsell, idx) => {
        const title = upsell.title || "Cadeau gratuit";
        const description = upsell.description || "Recevez un cadeau spécial avec votre commande";
        const img = upsell.imageUrl || "";
        const hasTimer = upsell.enableTimer && cfg.display.showTimerInPreview;
        const timerCssClass = upsell.timerCssClass || "";

        return (
          <div 
            key={idx} 
            className="offers-strip"
            style={{
              background: theme.offerBg,
              border: `1px solid ${theme.offerBorder}`,
              color: theme.offerText
            }}
          >
            <div className="offers-strip-thumb">
              {img ? (
                <img src={img} alt={title} />
              ) : (
                <div className="offers-strip-thumb-inner-upsell" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="offers-strip-main" style={{ color: theme.offerTitle }}>
                {title}
              </div>
              <div className="offers-strip-desc">
                {description}
              </div>
              
              {cfg.display.showTimerInPreview && upsell.enableTimer && (
                <TimerDisplay 
                  minutes={upsell.timerMinutes} 
                  message={upsell.timerMessage || t("section2.preview.timerDefaultMessage")}
                  theme={theme}
                  cssClass={upsell.timerCssClass}
                  timeFormat={upsell.timerTimeFormat}
                />
              )}
            </div>
          </div>
        );
      })}
    </BlockStack>
  );
}

function OrderSummaryPreview({ cfg, t }) {
  if (!cfg.display.showOrderSummary) return null;
  
  const selectedPalette = COLOR_PALETTES.find(p => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;
  
  return (
    <div 
      className="order-summary-preview"
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text
      }}
    >
      <div className="order-summary-title">
        {t("section2.preview.orderSummary.title")}
      </div>
      <div className="order-row">
        <span className="order-label">
          {t("section2.preview.orderSummary.subtotal")}
        </span>
        <span>129.99 {cfg.global.currency}</span>
      </div>
      <div className="order-row" style={{ color: '#10B981' }}>
        <span className="order-label">
          Remise
        </span>
        <span>-13.00 {cfg.global.currency}</span>
      </div>
      <div className="order-row">
        <span className="order-label">
          {t("section2.preview.orderSummary.shipping")}
        </span>
        <span>{t("section1.preview.freeShipping")}</span>
      </div>
      <div className="order-row">
        <span className="order-label">
          {t("section2.preview.orderSummary.total")}
        </span>
        <span style={{ fontWeight: 700 }}>116.99 {cfg.global.currency}</span>
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
    const newOffer = { ...offer };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!newOffer[parent]) newOffer[parent] = {};
      newOffer[parent][child] = value;
    } else {
      newOffer[field] = value;
    }
    onChange(newOffer);
  };
  
  const handleCountdownExample = (example) => {
    onChange({
      ...offer,
      enableTimer: true,
      timerMinutes: example.minutes,
      timerMessage: example.message,
      timerCssClass: example.cssClass,
      timerTimeFormat: example.timeFormat
    });
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
            label={t("section2.offer.discountType")}
            value={offer.discountType}
            onChange={(v) => handleChange('discountType', v)}
            options={[
              { label: t("section2.offer.discountType.percentage"), value: "percentage" },
              { label: t("section2.offer.discountType.fixed"), value: "fixed" }
            ]}
          />
          
          {offer.discountType === "percentage" ? (
            <RangeSlider
              label={`${t("section2.offer.percent")}: ${offer.discountValue}%`}
              min={1}
              max={90}
              output
              value={offer.discountValue}
              onChange={(v) => handleChange('discountValue', v)}
            />
          ) : (
            <TextField
              type="number"
              label={t("section2.offer.fixedAmount")}
              value={String(offer.discountValue)}
              onChange={(v) => handleChange('discountValue', parseFloat(v) || 0)}
            />
          )}
          
          <TextField
            label={t("section2.offer.buttonText")}
            value={offer.buttonText}
            onChange={(v) => handleChange('buttonText', v)}
            helpText={t("section2.helpText.buttonText")}
          />
        </Grid3>
        
        <GroupCard title={t("section2.group.conditions.title")}>
          <Grid3>
            <TextField
              type="number"
              label={t("section2.offer.minAmount")}
              value={String(offer.conditions?.minAmount || 0)}
              onChange={(v) => handleChange('conditions.minAmount', parseInt(v) || 0)}
              helpText={t("section2.helpText.minAmount")}
            />
            
            <TextField
              type="number"
              label={t("section2.offer.maxUses")}
              value={String(offer.conditions?.maxUses || 100)}
              onChange={(v) => handleChange('conditions.maxUses', parseInt(v) || 100)}
              helpText={t("section2.helpText.maxUses")}
            />
            
            <Select
              label={t("section2.offer.applicableTo")}
              value={offer.conditions?.applicableTo || "all"}
              onChange={(v) => handleChange('conditions.applicableTo', v)}
              options={[
                { label: t("section2.offer.applicableTo.all"), value: "all" },
                { label: t("section2.offer.applicableTo.specific"), value: "specific" }
              ]}
            />
          </Grid3>
        </GroupCard>
        
        <GroupCard title={t("section2.group.images.title")}>
          <Grid2>
            <TextField
              label={t("section2.offer.imageUrl")}
              value={offer.imageUrl}
              onChange={(v) => handleChange('imageUrl', v)}
              helpText={t("section2.helpText.offerImage")}
            />
          </Grid2>
        </GroupCard>
        
        <GroupCard title={t("section2.group.timer.title")}>
          <Grid2>
            <Checkbox
              label={t("section2.offer.enableTimer")}
              checked={!!offer.enableTimer}
              onChange={(v) => handleChange('enableTimer', v)}
              helpText={t("section2.helpText.timer")}
            />
            
            {offer.enableTimer && (
              <>
                <TextField
                  type="number"
                  label={t("section2.offer.timerMinutes")}
                  value={String(offer.timerMinutes || 60)}
                  onChange={(v) => handleChange('timerMinutes', parseInt(v) || 60)}
                  helpText={t("section2.helpText.timerMinutes")}
                />
                <TextField
                  label={t("section2.offer.timerMessage")}
                  value={offer.timerMessage || ""}
                  onChange={(v) => handleChange('timerMessage', v)}
                  helpText={t("section2.helpText.timerMessage")}
                />
                <Select
                  label={t("section2.offer.timerTimeFormat")}
                  value={offer.timerTimeFormat || "mm:ss"}
                  onChange={(v) => handleChange('timerTimeFormat', v)}
                  options={[
                    { label: "mm:ss", value: "mm:ss" },
                    { label: "hh[h] mm[m]", value: "hh[h] mm[m]" },
                    { label: "mm[m] ss[s]", value: "mm[m] ss[s]" },
                    { label: "hh[h]", value: "hh[h]" }
                  ]}
                />
                <TextField
                  label={t("section2.offer.timerCssClass")}
                  value={offer.timerCssClass || ""}
                  onChange={(v) => handleChange('timerCssClass', v)}
                  helpText={t("section2.helpText.timerCssClass")}
                  placeholder="timer-flash, timer-hot, etc."
                />
              </>
            )}
          </Grid2>
          
          <CountdownExamples onSelect={handleCountdownExample} />
        </GroupCard>
        
        <GroupCard title={t("section2.group.display.title")}>
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
  
  const handleCountdownExample = (example) => {
    onChange({
      ...upsell,
      enableTimer: true,
      timerMinutes: example.minutes,
      timerMessage: example.message,
      timerCssClass: example.cssClass,
      timerTimeFormat: example.timeFormat
    });
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
          <TextField
            label={t("section2.upsell.giftTitle")}
            value={upsell.giftTitle}
            onChange={(v) => handleChange('giftTitle', v)}
            helpText={t("section2.helpText.giftTitle")}
          />
          
          <TextField
            label={t("section2.upsell.giftProductId")}
            value={upsell.giftProductId}
            onChange={(v) => handleChange('giftProductId', v)}
            helpText={t("section2.helpText.giftProductId")}
          />
          
          <TextField
            label={t("section2.upsell.giftVariantId")}
            value={upsell.giftVariantId}
            onChange={(v) => handleChange('giftVariantId', v)}
            helpText={t("section2.helpText.giftVariantId")}
          />
        </Grid3>
        
        <GroupCard title={t("section2.group.images.title")}>
          <Grid2>
            <TextField
              label={t("section2.upsell.imageUrl")}
              value={upsell.imageUrl}
              onChange={(v) => handleChange('imageUrl', v)}
              helpText={t("section2.helpText.offerImage")}
            />
          </Grid2>
        </GroupCard>
        
        <GroupCard title={t("section2.group.timer.title")}>
          <Grid2>
            <Checkbox
              label={t("section2.upsell.enableTimer")}
              checked={!!upsell.enableTimer}
              onChange={(v) => handleChange('enableTimer', v)}
              helpText={t("section2.helpText.timer")}
            />
            
            {upsell.enableTimer && (
              <>
                <TextField
                  type="number"
                  label={t("section2.upsell.timerMinutes")}
                  value={String(upsell.timerMinutes || 60)}
                  onChange={(v) => handleChange('timerMinutes', parseInt(v) || 60)}
                  helpText={t("section2.helpText.timerMinutes")}
                />
                <TextField
                  label={t("section2.upsell.timerMessage")}
                  value={upsell.timerMessage || ""}
                  onChange={(v) => handleChange('timerMessage', v)}
                  helpText={t("section2.helpText.timerMessage")}
                />
                <Select
                  label={t("section2.upsell.timerTimeFormat")}
                  value={upsell.timerTimeFormat || "hh[h] mm[m]"}
                  onChange={(v) => handleChange('timerTimeFormat', v)}
                  options={[
                    { label: "mm:ss", value: "mm:ss" },
                    { label: "hh[h] mm[m]", value: "hh[h] mm[m]" },
                    { label: "mm[m] ss[s]", value: "mm[m] ss[s]" },
                    { label: "hh[h]", value: "hh[h]" }
                  ]}
                />
                <TextField
                  label={t("section2.upsell.timerCssClass")}
                  value={upsell.timerCssClass || ""}
                  onChange={(v) => handleChange('timerCssClass', v)}
                  helpText={t("section2.helpText.timerCssClass")}
                  placeholder="timer-hot, timer-flash, etc."
                />
              </>
            )}
          </Grid2>
          
          <CountdownExamples onSelect={handleCountdownExample} />
        </GroupCard>
        
        <GroupCard title={t("section2.group.display.title")}>
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("global");

  const persistLocal = (next) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_offers_v10",
        JSON.stringify(withDefaults(next))
      );
    } catch {}
  };

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
          const s = window.localStorage.getItem("tripleform_cod_offers_v10");
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

  const setCustomTheme = (field, value) => {
    setCfg((c) => ({
      ...c,
      global: {
        ...c.global,
        customTheme: {
          ...c.global.customTheme,
          [field]: value
        }
      }
    }));
  };

  const applyPalette = (paletteId) => {
    const palette = COLOR_PALETTES.find(p => p.id === paletteId);
    if (palette) {
      setCfg((c) => ({
        ...c,
        global: {
          ...c.global,
          colorPalette: paletteId,
          customTheme: palette.theme
        }
      }));
    }
  };

  const NAV_ITEMS = [
    { key: "global", label: t("section2.rail.global"), icon: "SettingsIcon" },
    { key: "colors", label: t("section2.rail.colors"), icon: "PaintBrushIcon" },
    { key: "offers", label: t("section2.rail.offers"), icon: "DiscountIcon" },
    { key: "upsells", label: t("section2.rail.upsells"), icon: "GiftCardIcon" },
  ];

  const selectedPalette = COLOR_PALETTES.find(p => p.id === cfg.global.colorPalette) || COLOR_PALETTES[0];
  const theme = cfg.global.customTheme || selectedPalette.theme;

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

            {selectedTab === "colors" && (
              <GroupCard title={t("section2.group.colors.title")}>
                <ColorPaletteSelector
                  selectedPalette={cfg.global.colorPalette}
                  onSelect={applyPalette}
                  customTheme={cfg.global.customTheme}
                  onCustomColorChange={setCustomTheme}
                />
              </GroupCard>
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
                  <div className="add-button-container">
                    <div className="add-button" onClick={addOffer}>
                      <Icon source={PI.PlusIcon} />
                      {t("section2.button.addOffer")}
                    </div>
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
                  <div className="add-button-container">
                    <div className="add-button" onClick={addUpsell}>
                      <Icon source={PI.PlusIcon} />
                      {t("section2.button.addUpsell")}
                    </div>
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
              background: theme.bg,
              border: `1px solid ${theme.border}`,
              color: theme.text
            }}
          >
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingSm" style={{ color: theme.text }}>
                  {t("section2.preview.title")}
                </Text>
                <Badge tone={cfg.global.enabled ? "success" : "critical"}>
                  {cfg.global.enabled 
                    ? t("section2.preview.active") 
                    : t("section2.preview.inactive")}
                </Badge>
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                {t("section2.preview.subtitle")}
              </Text>

              {cfg.display.showOffersSection && (
                <>
                  <OffersPreview 
                    cfg={cfg} 
                    products={shopProducts} 
                    t={t}
                  />
                  <UpsellsPreview 
                    cfg={cfg} 
                    products={shopProducts} 
                    t={t}
                  />
                </>
              )}
              
              <OrderSummaryPreview 
                cfg={cfg} 
                t={t}
              />
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default Section2OffersInner;