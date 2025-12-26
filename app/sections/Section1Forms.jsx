// ===== File: app/sections/Section1FormsLayout.jsx =====
import {
  Card,
  BlockStack,
  InlineStack,
  Select,
  Button,
  TextField,
  Checkbox,
  RangeSlider,
  Modal,
  Icon,
  Box,
  InlineGrid,
  Badge,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouteLoaderData } from "@remix-run/react";
import { I18nProvider, useI18n } from "../i18n/react";

/* -------------------- deep link vers l'éditeur de thème -------------------- */
function b64urlToB64(s) {
  return (
    s?.replace(/-/g, "+").replace(/_/g, "/") +
    ("===".slice(((s?.length || 0) + 3) % 4) || "")
  );
}
function decodeHost(h) {
  try {
    return atob(b64urlToB64(h || ""));
  } catch {
    return "";
  }
}
function buildThemeEditorUrl({
  hostB64,
  apiKey,
  blockHandle = "order-form",
  template = "product",
}) {
  const decoded = decodeHost(hostB64);
  if (!decoded) return "";
  if (decoded.includes("admin.shopify.com")) {
    const m = decoded.match(/admin\.shopify\.com\/store\/([^/]+)/);
    const store = m?.[1] || "";
    if (!store) return "";
    return `https://admin.shopify.com/store/${store}/themes/current/editor?template=${encodeURIComponent(
      template
    )}&addAppBlockId=${encodeURIComponent(
      apiKey
    )}/${encodeURIComponent(blockHandle)}&target=main`;
  }
  const shop = decoded
    .replace(/^https?:\/\//i, "")
    .replace(/\/admin.*$/i, "");
  return `https://${shop}/admin/themes/current/editor?template=${encodeURIComponent(
    template
  )}&addAppBlockId=${encodeURIComponent(
    apiKey
  )}/${encodeURIComponent(blockHandle)}&target=main`;
}

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  .tf-header { background:linear-gradient(90deg,#0B3B82,#7D0031); border-bottom:none; padding:12px 16px; position:sticky; top:0; z-index:40; box-shadow:0 10px 28px rgba(11,59,130,0.45); }
  .tf-shell { padding:16px; }

  .tf-editor { display:grid; grid-template-columns: 340px 3fr 1.4fr; gap:16px; align-items:start; }

  .tf-rail { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tf-rail-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; }
  .tf-rail-head { padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:700; }
  .tf-rail-list { padding:8px; display:grid; gap:8px; }
  .tf-rail-item { display:grid; grid-template-columns:24px 1fr auto; align-items:center; gap:8px; background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:8px 10px; cursor:grab; }
  .tf-rail-item:active { cursor:grabbing; }
  .tf-rail-item[data-sel="1"] { outline:2px solid #00A7A3; background:rgba(0,167,163,0.07); }
  .tf-rail-item .tf-grip { opacity:.5; user-select:none; }
  .tf-rail-actions { display:flex; gap:6px; }
  .tf-icon-btn { border:1px solid #E5E7EB; background:#fff; border-radius:8px; padding:4px 6px; cursor:pointer; font-size:11px; }

  .tf-right-col { display:grid; gap:16px; }
  .tf-panel   { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  .tf-preview-col { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tf-preview-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  /* >>> GRAND TITRES — même style que Offres & Sheets <<< */
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

  .tf-accordion { border:1px solid #E5E7EB; border-radius:10px; background:#FFFFFF; margin-bottom:10px; }
  .tf-accordion__btn { width:100%; text-align:left; padding:10px 12px; background:#F8FAFC; color:#111827; border:none; cursor:pointer; font-weight:700; border-radius:10px; border-bottom:1px solid #E5E7EB; }
  .tf-accordion__body { padding:12px; background:#FFFFFF; }

  /* Palettes de couleurs */
  .tf-color-palettes { display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px; margin-top:12px; }
  .tf-color-palette { border:1px solid #E5E7EB; border-radius:10px; overflow:hidden; cursor:pointer; transition:all 0.2s; }
  .tf-color-palette:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.1); }
  .tf-color-palette.active { outline:2px solid #00A7A3; }
  .tf-palette-colors { display:flex; height:36px; }
  .tf-palette-info { padding:8px; background:#fff; font-size:11px; font-weight:600; }

  /* Icônes pour les champs */
  .tf-icon-selector { display:grid; grid-template-columns:repeat(auto-fill, minmax(44px, 1fr)); gap:8px; margin-top:8px; max-height:200px; overflow-y:auto; padding:8px; border:1px solid #E5E7EB; border-radius:8px; }
  .tf-icon-option { width:44px; height:44px; display:flex; align-items:center; justify-content:center; border:2px solid #E5E7EB; border-radius:8px; cursor:pointer; background:#fff; transition:all 0.2s; }
  .tf-icon-option:hover { border-color:#00A7A3; background:#f8fafc; }
  .tf-icon-option.selected { border-color:#00A7A3; background:#ecfeff; }

  /* Aperçu avec icônes - CORRIGÉ pour centrage du texte */
  .tf-field-with-icon { display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center; }
  .tf-field-icon { width:20px; height:20px; display:flex; align-items:center; justify-content:center; color:#6B7280; }
  .tf-btn-with-icon { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; text-align:center; }

  /* Cart avec icône */
  .tf-cart-with-icon { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .tf-cart-icon { display:flex; align-items:center; justify-content:center; width:24px; height:24px; }

  @media (max-width: 1200px) {
    .tf-editor { grid-template-columns: 300px 2.2fr 1.4fr; }
  }
  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-preview-col { position:static; max-height:none; }
  }
`;
function useInjectCss() {
  useEffect(() => {
    const t = document.createElement("style");
    t.id = "tf-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return () => t.remove();
  }, []);
}

/* ============================== Presets de design ============================== */
const DESIGN_PRESETS = {
  SkyBlueUI: {
    bg: "#F0F9FF",
    text: "#0C4A6E",
    border: "#E2E8F0",
    radius: 12,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#CBD5E1",
    placeholder: "#94A3B8",
    btnBg: "#0EA5E9",
    btnText: "#FFFFFF",
    btnBorder: "#0284C7",
    btnHeight: 46,
    btnRadius: 12,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#E2E8F0",
    cartRowBg: "#FFFFFF",
    cartRowBorder: "#E2E8F0",
    cartTitleColor: "#0F172A",
    cartTextColor: "#0F172A",
  },
  CleanWhite: {
    bg: "#FFFFFF",
    text: "#0F172A",
    border: "#E5E7EB",
    radius: 12,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#E5E7EB",
    placeholder: "#94A3B8",
    btnBg: "#111827",
    btnText: "#FFFFFF",
    btnBorder: "#111827",
    btnHeight: 46,
    btnRadius: 10,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#E5E7EB",
    cartRowBg: "#FFFFFF",
    cartRowBorder: "#E5E7EB",
    cartTitleColor: "#0F172A",
    cartTextColor: "#0F172A",
  },
  BoldDark: {
    bg: "#0B1220",
    text: "#E5F0FF",
    border: "#1F2A44",
    radius: 12,
    padding: 16,
    inputBg: "#101828",
    inputBorder: "#334155",
    placeholder: "#A3AEC2",
    btnBg: "#2563EB",
    btnText: "#FFFFFF",
    btnBorder: "#1D4ed8",
    btnHeight: 46,
    btnRadius: 12,
    shadow: true,
    glow: true,
    glowPx: 22,
    cartBg: "#0F172A",
    cartBorder: "#1F2A44",
    cartRowBg: "#101828",
    cartRowBorder: "#1F2A44",
    cartTitleColor: "#E5F0FF",
    cartTextColor: "#E5F0FF",
  },
  GreenNature: {
    bg: "#F0FDF4",
    text: "#065F46",
    border: "#D1FAE5",
    radius: 12,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#A7F3D0",
    placeholder: "#6EE7B7",
    btnBg: "#10B981",
    btnText: "#FFFFFF",
    btnBorder: "#059669",
    btnHeight: 46,
    btnRadius: 12,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#D1FAE5",
    cartRowBg: "#ECFDF5",
    cartRowBorder: "#A7F3D0",
    cartTitleColor: "#065F46",
    cartTextColor: "#065F46",
  },
  SunsetOrange: {
    bg: "#FFF7ED",
    text: "#9A3412",
    border: "#FDBA74",
    radius: 12,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#FDBA74",
    placeholder: "#FB923C",
    btnBg: "#F97316",
    btnText: "#FFFFFF",
    btnBorder: "#EA580C",
    btnHeight: 46,
    btnRadius: 12,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#FDBA74",
    cartRowBg: "#FFEDD5",
    cartRowBorder: "#FDBA74",
    cartTitleColor: "#9A3412",
    cartTextColor: "#9A3412",
  },
  PurpleElegant: {
    bg: "#FAF5FF",
    text: "#5B21B6",
    border: "#E9D5FF",
    radius: 16,
    padding: 20,
    inputBg: "#FFFFFF",
    inputBorder: "#D8B4FE",
    placeholder: "#C084FC",
    btnBg: "#8B5CF6",
    btnText: "#FFFFFF",
    btnBorder: "#7C3AED",
    btnHeight: 48,
    btnRadius: 16,
    shadow: true,
    glow: true,
    glowPx: 20,
    cartBg: "#FFFFFF",
    cartBorder: "#E9D5FF",
    cartRowBg: "#F5F3FF",
    cartRowBorder: "#DDD6FE",
    cartTitleColor: "#5B21B6",
    cartTextColor: "#5B21B6",
  },
  LuxuryGold: {
    bg: "#FEFCE8",
    text: "#854D0E",
    border: "#FDE68A",
    radius: 12,
    padding: 18,
    inputBg: "#FFFFFF",
    inputBorder: "#FCD34D",
    placeholder: "#FBBF24",
    btnBg: "#D97706",
    btnText: "#FFFFFF",
    btnBorder: "#B45309",
    btnHeight: 50,
    btnRadius: 12,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#FDE68A",
    cartRowBg: "#FEF3C7",
    cartRowBorder: "#FCD34D",
    cartTitleColor: "#854D0E",
    cartTextColor: "#854D0E",
  },
  OceanDeep: {
    bg: "#ECFEFF",
    text: "#0E7490",
    border: "#A5F3FC",
    radius: 12,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#67E8F9",
    placeholder: "#22D3EE",
    btnBg: "#0891B2",
    btnText: "#FFFFFF",
    btnBorder: "#0E7490",
    btnHeight: 46,
    btnRadius: 12,
    shadow: true,
    glow: false,
    glowPx: 18,
    cartBg: "#FFFFFF",
    cartBorder: "#A5F3FC",
    cartRowBg: "#CFFAFE",
    cartRowBorder: "#67E8F9",
    cartTitleColor: "#0E7490",
    cartTextColor: "#0E7490",
  },
  MinimalGray: {
    bg: "#F9FAFB",
    text: "#374151",
    border: "#D1D5DB",
    radius: 8,
    padding: 16,
    inputBg: "#FFFFFF",
    inputBorder: "#D1D5DB",
    placeholder: "#9CA3AF",
    btnBg: "#4B5563",
    btnText: "#FFFFFF",
    btnBorder: "#374151",
    btnHeight: 44,
    btnRadius: 8,
    shadow: false,
    glow: false,
    glowPx: 0,
    cartBg: "#FFFFFF",
    cartBorder: "#D1D5DB",
    cartRowBg: "#F9FAFB",
    cartRowBorder: "#D1D5DB",
    cartTitleColor: "#374151",
    cartTextColor: "#374151",
  },
};

/* ============================== Bibliothèque d'icônes ============================== */
const ICON_LIBRARY = {
  // Icônes pour le cart
  cartTitle: [
    { value: "CartIcon", label: "Panier", icon: "CartIcon" },
    { value: "BagIcon", label: "Sac", icon: "BagIcon" },
    { value: "ProductsIcon", label: "Produits", icon: "ProductsIcon" },
    { value: "CheckoutIcon", label: "Checkout", icon: "CheckoutIcon" },
    { value: "ReceiptIcon", label: "Reçu", icon: "ReceiptIcon" },
    { value: "NoteIcon", label: "Note", icon: "NoteIcon" },
  ],
  // Icônes pour les champs
  name: [
    { value: "ProfileIcon", label: "Profil", icon: "ProfileIcon" },
    { value: "PersonIcon", label: "Personne", icon: "PersonIcon" },
    { value: "UserIcon", label: "Utilisateur", icon: "UserIcon" },
    { value: "CustomersIcon", label: "Clients", icon: "CustomersIcon" },
  ],
  phone: [
    { value: "PhoneIcon", label: "Téléphone", icon: "PhoneIcon" },
    { value: "MobileIcon", label: "Mobile", icon: "MobileIcon" },
    { value: "CallIcon", label: "Appel", icon: "CallIcon" },
    { value: "ChatIcon", label: "Chat", icon: "ChatIcon" },
  ],
  quantity: [
    { value: "HashtagIcon", label: "Hashtag", icon: "HashtagIcon" },
    { value: "NumberIcon", label: "Nombre", icon: "NumberIcon" },
    { value: "CirclePlusIcon", label: "Plus", icon: "CirclePlusIcon" },
    { value: "CartIcon", label: "Panier", icon: "CartIcon" },
  ],
  address: [
    { value: "LocationIcon", label: "Localisation", icon: "LocationIcon" },
    { value: "PinIcon", label: "Épingle", icon: "PinIcon" },
    { value: "HomeIcon", label: "Maison", icon: "HomeIcon" },
    { value: "StoreIcon", label: "Magasin", icon: "StoreIcon" },
  ],
  city: [
    { value: "CityIcon", label: "Ville", icon: "CityIcon" },
    { value: "GlobeIcon", label: "Globe", icon: "GlobeIcon" },
    { value: "LocationIcon", label: "Localisation", icon: "LocationIcon" },
    { value: "MapIcon", label: "Carte", icon: "MapIcon" },
  ],
  province: [
    { value: "RegionIcon", label: "Région", icon: "RegionIcon" },
    { value: "GlobeIcon", label: "Globe", icon: "GlobeIcon" },
    { value: "MapIcon", label: "Carte", icon: "MapIcon" },
    { value: "LocationIcon", label: "Localisation", icon: "LocationIcon" },
  ],
  notes: [
    { value: "NoteIcon", label: "Note", icon: "NoteIcon" },
    { value: "ClipboardIcon", label: "Presse-papier", icon: "ClipboardIcon" },
    { value: "DocumentIcon", label: "Document", icon: "DocumentIcon" },
    { value: "TextIcon", label: "Texte", icon: "TextIcon" },
  ],
  // Icônes pour les boutons
  button: [
    { value: "CartIcon", label: "Panier", icon: "CartIcon" },
    { value: "CheckoutIcon", label: "Checkout", icon: "CheckoutIcon" },
    { value: "BagIcon", label: "Sac", icon: "BagIcon" },
    { value: "TruckIcon", label: "Camion", icon: "TruckIcon" },
    { value: "CheckCircleIcon", label: "Coche", icon: "CheckCircleIcon" },
    { value: "PlayIcon", label: "Play", icon: "PlayIcon" },
    { value: "ArrowRightIcon", label: "Flèche droite", icon: "ArrowRightIcon" },
    { value: "SendIcon", label: "Envoyer", icon: "SendIcon" },
  ],
};

/* ============================== Palette de couleurs ============================== */
const COLOR_PALETTES = [
  {
    id: "blue-gradient",
    name: "Gradient Bleu",
    colors: ["#0B3B82", "#7D0031", "#00A7A3", "#F0F9FF", "#0C4A6E"],
    preset: "SkyBlueUI",
  },
  {
    id: "clean-white",
    name: "Blanc Propre",
    colors: ["#FFFFFF", "#111827", "#E5E7EB", "#F9FAFB", "#374151"],
    preset: "CleanWhite",
  },
  {
    id: "dark-modern",
    name: "Sombre Moderne",
    colors: ["#0B1220", "#2563EB", "#1F2A44", "#101828", "#E5F0FF"],
    preset: "BoldDark",
  },
  {
    id: "green-nature",
    name: "Nature Verte",
    colors: ["#10B981", "#065F46", "#D1FAE5", "#ECFDF5", "#F0FDF4"],
    preset: "GreenNature",
  },
  {
    id: "sunset-orange",
    name: "Orange Couchant",
    colors: ["#F97316", "#9A3412", "#FDBA74", "#FFEDD5", "#FFF7ED"],
    preset: "SunsetOrange",
  },
  {
    id: "purple-elegant",
    name: "Violet Élégant",
    colors: ["#8B5CF6", "#5B21B6", "#E9D5FF", "#F5F3FF", "#FAF5FF"],
    preset: "PurpleElegant",
  },
  {
    id: "luxury-gold",
    name: "Or Luxueux",
    colors: ["#D97706", "#854D0E", "#FDE68A", "#FEF3C7", "#FEFCE8"],
    preset: "LuxuryGold",
  },
  {
    id: "ocean-deep",
    name: "Océan Profond",
    colors: ["#0891B2", "#0E7490", "#A5F3FC", "#CFFAFE", "#ECFEFF"],
    preset: "OceanDeep",
  },
  {
    id: "minimal-gray",
    name: "Gris Minimal",
    colors: ["#4B5563", "#374151", "#D1D5DB", "#F9FAFB", "#FFFFFF"],
    preset: "MinimalGray",
  },
];

/* ============================== Sanitizer ============================== */
const REPLACERS = [
  [/â€™|'/g, "'"],
  [/â€œ|â€\u009D|â€|"|"/g, '"'],
  [/â€"|â€"|–|—/g, "-"],
  [/\u00A0/g, " "],
  [/Â/g, ""],
  [/ØŸ/g, ""],
];
const sStr = (s) =>
  typeof s === "string"
    ? REPLACERS.reduce((x, [r, v]) => x.replace(r, v), s)
    : s;
function sanitizeDeep(o) {
  if (o == null) return o;
  if (typeof o === "string") return sStr(o);
  if (Array.isArray(o)) return o.map(sanitizeDeep);
  if (typeof o === "object") {
    const n = {};
    for (const k in o) n[k] = sanitizeDeep(o[k]);
    return n;
  }
  return o;
}

/* ============================== Helpers ============================== */
function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ====== DATA Pays / Wilayas / Villes ====== */
const COUNTRY_DATA = {
  // ========== MAROC (MA) ==========
  MA: {
    label: "Maroc",
    provinces: {
      CASABLANCA: { 
        label: "Casablanca-Settat", 
        cities: ["Casablanca", "Mohammedia", "Settat", "Berrechid", "El Jadida", "Benslimane", "Nouaceur", "Médiouna", "Sidi Bennour", "Dar Bouazza", "Lahraouyine", "Had Soualem", "Sidi Rahal", "Oulad Abbou"] 
      },
      RABAT: { 
        label: "Rabat-Salé-Kénitra", 
        cities: ["Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Khémisset", "Sidi Slimane", "Sidi Kacem", "Tiflet", "Ain Aouda", "Harhoura", "Sidi Yahya Zaer", "Oulmès", "Sidi Allal El Bahraoui"] 
      },
      TANGER: { 
        label: "Tanger-Tétouan-Al Hoceïma", 
        cities: ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Chefchaouen", "Ouazzane", "Fnideq", "M'diq", "Martil", "Ksar El Kebir", "Asilah", "Bni Bouayach", "Imzouren", "Bni Hadifa"] 
      },
      MARRAKECH: { 
        label: "Marrakech-Safi", 
        cities: ["Marrakech", "Safi", "El Kelâa des Sraghna", "Essaouira", "Rehamna", "Youssoufia", "Chichaoua", "Al Haouz", "Rhamna", "Benguerir", "Sidi Bennour", "Smimou", "Tamanar", "Imintanoute"] 
      },
      FES: { 
        label: "Fès-Meknès", 
        cities: ["Fès", "Meknès", "Ifrane", "Taza", "Sefrou", "Boulemane", "Taounate", "Guercif", "Moulay Yacoub", "El Hajeb", "Moulay Idriss Zerhoun", "Ouazzane", "Bhalil", "Aïn Cheggag"] 
      },
      ORIENTAL: { 
        label: "Région de l'Oriental", 
        cities: ["Oujda", "Nador", "Berkane", "Taourirt", "Jerada", "Figuig", "Bouarfa", "Ahfir", "Driouch", "Beni Ensar", "Selouane", "Bouhdila", "Talsint", "Debdou"] 
      },
      SUSS: { 
        label: "Souss-Massa", 
        cities: ["Agadir", "Inezgane", "Taroudant", "Tiznit", "Oulad Teima", "Biougra", "Ait Melloul", "Dcheira", "Temsia", "Ait Baha", "Chtouka Ait Baha", "Tafraout", "Aoulouz", "El Guerdane"] 
      },
      DRAATAF: { 
        label: "Drâa-Tafilalet", 
        cities: ["Errachidia", "Ouarzazate", "Tinghir", "Midelt", "Zagora", "Rissani", "Alnif", "Boumalne Dades", "Kelaat M'Gouna", "Tinejdad", "Goulmima", "Jorf", "M'semrir", "Aït Benhaddou"] 
      }
    }
  },

  // ========== ALGÉRIE (DZ) ==========
  DZ: {
    label: "Algérie",
    provinces: {
      ALGER: { 
        label: "Alger", 
        cities: ["Alger Centre", "Bab El Oued", "El Harrach", "Kouba", "Hussein Dey", "Bordj El Kiffan", "Dar El Beïda", "Bouzaréah", "Birkhadem", "Chéraga", "Dellys", "Zeralda", "Staoueli", "Birtouta", "Ouled Fayet", "Draria", "Les Eucalyptus"] 
      },
      ORAN: { 
        label: "Oran", 
        cities: ["Oran", "Es-Sénia", "Bir El Djir", "Gdyel", "Aïn El Turck", "Arzew", "Mers El Kébir", "Boutlelis", "Oued Tlelat", "Bethioua", "El Ançor", "Hassi Bounif", "Messerghin", "Boufatis", "Tafraoui"] 
      },
      CONSTANTINE: { 
        label: "Constantine", 
        cities: ["Constantine", "El Khroub", "Hamma Bouziane", "Aïn Smara", "Zighoud Youcef", "Didouche Mourad", "Ibn Ziad", "Messaoud Boudjeriou", "Beni Hamidane", "Aïn Abid", "Ouled Rahmoun", "Ben Badis", "El Haria"] 
      },
      BLIDA: { 
        label: "Blida", 
        cities: ["Blida", "Boufarik", "El Affroun", "Mouzaïa", "Ouled Yaïch", "Beni Mered", "Bouinan", "Soumaa", "Chebli", "Bougara", "Guerrouaou", "Hammam Melouane", "Beni Tamou", "Ben Khlil"] 
      },
      SETIF: { 
        label: "Sétif", 
        cities: ["Sétif", "El Eulma", "Aïn Oulmene", "Bougaa", "Aïn Azel", "Amoucha", "Béni Aziz", "Guellal", "Hammam Soukhna", "Bouandas", "Taya", "Tella", "Babor", "Maoklane"] 
      },
      ANNABA: { 
        label: "Annaba", 
        cities: ["Annaba", "El Bouni", "Sidi Amar", "Berrahal", "Treat", "Cheurfa", "Oued El Aneb", "Seraidi", "Ain Berda", "Chaiba", "El Hadjar", "Chetaibi"] 
      },
      BATNA: { 
        label: "Batna", 
        cities: ["Batna", "Barika", "Merouana", "Arris", "N'Gaous", "Tazoult", "Aïn Touta", "Ouled Si Slimane", "Fesdis", "Timgad", "Ras El Aioun", "Maafa", "Lazrou", "Ouled Ammar"] 
      }
    }
  },

  // ========== TUNISIE (TN) ==========
  TN: {
    label: "Tunisie",
    provinces: {
      TUNIS: { 
        label: "Tunis", 
        cities: ["Tunis", "La Marsa", "Carthage", "Le Bardo", "Le Kram", "Sidi Bou Said", "Menzah", "Ariana", "El Menzah", "Mornaguia", "Mégrine", "Radès", "Djedeida", "El Omrane", "Ettahrir", "El Kabaria"] 
      },
      ARIANA: { 
        label: "Ariana", 
        cities: ["Ariana", "Raoued", "La Soukra", "Kalaat El Andalous", "Sidi Thabet", "Ettadhamen", "Mnihla", "Borj El Amri", "Kalâat el-Andalous", "Sidi Amor", "El Battan", "Oued Ellil"] 
      },
      BEN_AROUS: { 
        label: "Ben Arous", 
        cities: ["Ben Arous", "Ezzahra", "Rades", "Mégrine", "Hammam Lif", "Mornag", "Fouchana", "Khalidia", "Mhamdia", "Hammam Chott", "Bou Mhel el-Bassatine", "El Mida", "Mornaguia"] 
      },
      SFAX: { 
        label: "Sfax", 
        cities: ["Sfax", "El Ain", "Agareb", "Mahres", "Sakiet Eddaïer", "Sakiet Ezzit", "Ghraiba", "Bir Ali Ben Khalifa", "Jebeniana", "Kerkennah", "Skhira", "Menzel Chaker", "Gremda", "Thyna"] 
      },
      SOUSSE: { 
        label: "Sousse", 
        cities: ["Sousse", "Hammam Sousse", "Kalaa Kebira", "Kalaa Sghira", "Akouda", "M'saken", "Enfidha", "Bouficha", "Hergla", "Kondar", "Zaouiet Sousse", "Hammam Jedidi", "Sidi Bou Ali", "Messaadine"] 
      },
      BIZERTE: { 
        label: "Bizerte", 
        cities: ["Bizerte", "Menzel Jemil", "Mateur", "Sejnane", "Ghar El Melh", "Ras Jebel", "Menzel Abderrahmane", "El Alia", "Tinja", "Utique", "Menzel Bourguiba", "Joumine", "Aousja", "Metline"] 
      }
    }
  },

  // ========== ÉGYPTE (EG) ==========
  EG: {
    label: "Égypte",
    provinces: {
      CAIRO: { 
        label: "Le Caire", 
        cities: ["Le Caire", "Nasr City", "Heliopolis", "Maadi", "Zamalek", "Dokki", "Giza", "Shubra", "Al Haram", "Al Mohandessin", "6 Octobre", "New Cairo", "Madinet Nasr", "Helwan", "Qalyub", "Shubra El Kheima", "Badr City"] 
      },
      ALEX: { 
        label: "Alexandrie", 
        cities: ["Alexandrie", "Borg El Arab", "Abu Qir", "Al Amriya", "Al Agamy", "Montaza", "Al Mansheya", "Al Labban", "Kafr Abdo", "Sidi Gaber", "Smouha", "Miami", "Stanley", "Laurent", "Gleem", "Camp Caesar"] 
      },
      GIZA: { 
        label: "Gizeh", 
        cities: ["Gizeh", "Sheikh Zayed City", "6th of October", "Al Haram", "Al Badrasheen", "Al Ayat", "Al Wahat Al Bahariya", "Al Saff", "Atfih", "Al Ayyat", "Awashim", "Kerdasa", "El Hawamdeya", "Osim"] 
      },
      SHARQIA: { 
        label: "Sharqia", 
        cities: ["Zagazig", "10th of Ramadan City", "Belbeis", "Minya Al Qamh", "Al Ibrahimiyah", "Diarb Negm", "Husseiniya", "Mashtool El Souk", "Abu Hammad", "Abu Kebir", "Faqous", "El Salheya El Gedida"] 
      }
    }
  },

  // ========== FRANCE (FR) ==========
  FR: {
    label: "France",
    provinces: {
      IDF: { 
        label: "Île-de-France", 
        cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre", "Créteil", "Bobigny", "Montreuil", "Argenteuil", "Courbevoic", "Asnières-sur-Seine", "Colombes", "Aubervilliers", "Saint-Maur-des-Fossés", "Issy-les-Moulineaux", "Levallois-Perret"] 
      },
      PACA: { 
        label: "Provence-Alpes-Côte d'Azur", 
        cities: ["Marseille", "Nice", "Toulon", "Avignon", "Aix-en-Provence", "Antibes", "Cannes", "La Seyne-sur-Mer", "Hyères", "Arles", "Martigues", "Grasse", "Fréjus", "Antibes", "La Ciotat", "Cavaillon"] 
      },
      ARA: { 
        label: "Auvergne-Rhône-Alpes", 
        cities: ["Lyon", "Grenoble", "Saint-Étienne", "Annecy", "Clermont-Ferrand", "Villeurbanne", "Valence", "Chambéry", "Roanne", "Bourg-en-Bresse", "Vénissieux", "Saint-Priest", "Caluire-et-Cuire", "Vaulx-en-Velin", "Meyzieu"] 
      },
      OCCITANIE: { 
        label: "Occitanie", 
        cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban", "Narbonne", "Carcassonne", "Albi", "Sète", "Lunel", "Agde", "Castres", "Mende", "Millau", "Foix"] 
      }
    }
  },

  // ========== ESPAGNE (ES) ==========
  ES: {
    label: "España",
    provinces: {
      MADRID: { 
        label: "Comunidad de Madrid", 
        cities: ["Madrid", "Alcalá de Henares", "Getafe", "Leganés", "Móstoles", "Fuenlabrada", "Alcorcón", "Parla", "Torrejón de Ardoz", "Coslada", "Las Rozas", "San Sebastián de los Reyes", "Alcobendas", "Pozuelo de Alarcón", "Rivas-Vaciamadrid"] 
      },
      CATALUNYA: { 
        label: "Cataluña", 
        cities: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Tarragona", "Sabadell", "Lleida", "Mataró", "Santa Coloma de Gramenet", "Reus", "Girona", "Sant Cugat", "Cornellà", "Sant Boi de Llobregat", "Rubí", "Manresa"] 
      },
      ANDALUCIA: { 
        label: "Andalucía", 
        cities: ["Sevilla", "Málaga", "Granada", "Córdoba", "Jerez de la Frontera", "Almería", "Huelva", "Marbella", "Dos Hermanas", "Algeciras", "Cádiz", "Jaén", "Almería", "Mijas", "Fuengirola", "Chiclana de la Frontera"] 
      },
      VALENCIA: { 
        label: "Comunidad Valenciana", 
        cities: ["Valencia", "Alicante", "Castellón de la Plana", "Elche", "Torrevieja", "Orihuela", "Gandia", "Benidorm", "Paterna", "Sagunto", "Alcoy", "Elda", "San Vicente del Raspeig", "Vila-real", "Burjassot"] 
      }
    }
  },

  // ========== ARABIE SAOUDITE (SA) ==========
  SA: {
    label: "Arabie Saoudite",
    provinces: {
      RIYADH: { 
        label: "Riyadh", 
        cities: ["Riyadh", "Al Kharj", "Al Majma'ah", "Dhurma", "Al Duwadimi", "Al Quway'iyah", "Al Muzahmiyah", "Wadi ad-Dawasir", "Al Hariq", "Al Sulayyil", "Al Aflaj", "Hotat Bani Tamim", "Al Diriyah", "Thadiq", "Huraymila"] 
      },
      MAKKAH: { 
        label: "Makkah", 
        cities: ["Makkah", "Jeddah", "Taif", "Al Qunfudhah", "Al Lith", "Al Jumum", "Khulais", "Rabigh", "Turubah", "Al Kamel", "Bahra", "Adham", "Al Jumum", "Al Khurma", "Al Muwayh"] 
      },
      MADINAH: { 
        label: "Madinah", 
        cities: ["Madinah", "Yanbu", "Al Ula", "Badr", "Mahd adh Dhahab", "Al Hinakiyah", "Wadi al-Fara'", "Al-Mahd", "Khaybar", "Al Henakiyah", "Al Suqiyah", "Al-Mahd", "Al-Ais", "Hegrah"] 
      },
      EASTERN: { 
        label: "Eastern Province", 
        cities: ["Dammam", "Khobar", "Dhahran", "Jubail", "Qatif", "Hafr al-Batin", "Al Khafji", "Ras Tanura", "Abqaiq", "Al-'Udayd", "Nu'ayriyah", "Udhailiyah", "Al Qaryah", "Al Mubarraz", "Al Awamiyah"] 
      }
    }
  },

  // ========== ÉMIRATS ARABES UNIS (AE) ==========
  AE: {
    label: "Émirats Arabes Unis",
    provinces: {
      DUBAI: { 
        label: "Dubai", 
        cities: ["Dubai", "Jebel Ali", "Hatta", "Al Awir", "Al Lusayli", "Margham", "Al Khawaneej", "Al Qusais", "Al Barsha", "Al Warqaa", "Mirdif", "Nad Al Sheba", "Al Quoz", "Jumeirah", "Business Bay", "Dubai Marina"] 
      },
      ABU_DHABI: { 
        label: "Abu Dhabi", 
        cities: ["Abu Dhabi", "Al Ain", "Madinat Zayed", "Gharbia", "Liwa Oasis", "Al Ruwais", "Al Mirfa", "Al Dhafra", "Al Samha", "Al Shawamekh", "Bani Yas", "Khalifa City", "Mohammed Bin Zayed City", "Shahama", "Al Wathba"] 
      },
      SHARJAH: { 
        label: "Sharjah", 
        cities: ["Sharjah", "Khor Fakkan", "Kalba", "Dhaid", "Al Dhaid", "Al Hamriyah", "Al Madam", "Al Batayeh", "Al Sajaa", "Al Ghail", "Wasit", "Mleiha", "Al Nahda", "Al Qasimia", "Al Majaz"] 
      },
      AJMAN: { 
        label: "Ajman", 
        cities: ["Ajman", "Masfout", "Manama", "Al Hamidiyah", "Al Zorah", "Al Mowaihat", "Al Jurf", "Al Hamidiya", "Al Rawda", "Al Nuaimiya"] 
      }
    }
  },

  // ========== ÉTATS-UNIS (US) ==========
  US: {
    label: "United States",
    provinces: {
      CALIFORNIA: { 
        label: "California", 
        cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton", "Chula Vista", "Irvine", "Modesto"] 
      },
      NEW_YORK: { 
        label: "New York", 
        cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "White Plains", "Troy", "Niagara Falls", "Binghamton"] 
      },
      TEXAS: { 
        label: "Texas", 
        cities: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie"] 
      },
      FLORIDA: { 
        label: "Florida", 
        cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "St. Petersburg", "Hialeah", "Port St. Lucie", "Cape Coral", "Fort Lauderdale", "Pembroke Pines", "Hollywood", "Miramar", "Gainesville"] 
      }
    }
  },

  // ========== NIGERIA (NG) ==========
  NG: {
    label: "Nigeria",
    provinces: {
      LAGOS: { 
        label: "Lagos", 
        cities: ["Lagos", "Ikeja", "Surulere", "Apapa", "Lekki", "Victoria Island", "Ajah", "Badagry", "Epe", "Ikorodu", "Agege", "Alimosho", "Kosofe", "Mushin", "Oshodi", "Somolu"] 
      },
      ABUJA: { 
        label: "Abuja", 
        cities: ["Abuja", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Jahi", "Lugbe", "Karu", "Nyanya", "Bwari", "Kuje", "Gwagwalada", "Kwali"] 
      },
      KANO: { 
        label: "Kano", 
        cities: ["Kano", "Nassarawa", "Tarauni", "Dala", "Fagge", "Gwale", "Kumbotso", "Ungogo", "Dawakin Tofa", "Tofa", "Rimin Gado", "Bagwai", "Gezawa", "Gabasawa", "Minjibir"] 
      },
      RIVERS: { 
        label: "Rivers", 
        cities: ["Port Harcourt", "Obio-Akpor", "Ikwerre", "Eleme", "Oyigbo", "Etche", "Omuma", "Okrika", "Ogu–Bolo", "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", "Abua–Odual", "Ahoada"] 
      }
    }
  },

  // ========== PAKISTAN (PK) ==========
  PK: {
    label: "Pakistan",
    provinces: {
      PUNJAB: { 
        label: "Punjab", 
        cities: ["Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhelum", "Gujrat", "Sahiwal", "Wah Cantonment", "Kasur", "Okara", "Chiniot"] 
      },
      SINDH: { 
        label: "Sindh", 
        cities: ["Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Tando Allahyar", "Tando Adam", "Badin", "Thatta", "Kotri"] 
      },
      KHYBER: { 
        label: "Khyber Pakhtunkhwa", 
        cities: ["Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Bannu", "Swabi", "Dera Ismail Khan", "Charsadda", "Nowshera", "Mansehra", "Haripur", "Timergara", "Tank", "Hangu"] 
      },
      BALOCHISTAN: { 
        label: "Balochistan", 
        cities: ["Quetta", "Turbat", "Khuzdar", "Chaman", "Gwadar", "Dera Murad Jamali", "Dera Allah Yar", "Usta Mohammad", "Sibi", "Loralai", "Zhob", "Pasni", "Qila Saifullah", "Khost", "Hub"] 
      }
    }
  },

  // ========== INDE (IN) ==========
  IN: {
    label: "India",
    provinces: {
      DELHI: { 
        label: "Delhi", 
        cities: ["New Delhi", "Delhi", "Dwarka", "Karol Bagh", "Rohini", "Pitampura", "Janakpuri", "Laxmi Nagar", "Saket", "Hauz Khas", "Malviya Nagar", "Patel Nagar", "Rajouri Garden", "Kalkaji", "Sarita Vihar", "Vasant Kunj"] 
      },
      MAHARASHTRA: { 
        label: "Maharashtra", 
        cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Ulhasnagar", "Sangli", "Malegaon", "Jalgaon", "Akola", "Latur"] 
      },
      KARNATAKA: { 
        label: "Karnataka", 
        cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Tumakuru", "Shivamogga", "Raichur", "Bidar", "Hospet", "Udupi", "Gadag-Betageri", "Robertson Pet", "Hassan"] 
      },
      TAMIL_NADU: { 
        label: "Tamil Nadu", 
        cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Hosur", "Nagercoil", "Kanchipuram", "Kumarapalayam"] 
      }
    }
  },

  // ========== INDONÉSIE (ID) ==========
  ID: {
    label: "Indonesia",
    provinces: {
      JAKARTA: { 
        label: "Jakarta", 
        cities: ["Jakarta", "Central Jakarta", "South Jakarta", "West Jakarta", "East Jakarta", "North Jakarta", "Thousand Islands", "Kebayoran Baru", "Tebet", "Cilandak", "Pasar Minggu", "Mampang", "Cengkareng", "Tanjung Priok", "Kelapa Gading"] 
      },
      WEST_JAVA: { 
        label: "West Java", 
        cities: ["Bandung", "Bekasi", "Depok", "Bogor", "Cimahi", "Sukabumi", "Cirebon", "Tasikmalaya", "Karawang", "Purwakarta", "Subang", "Sumedang", "Garut", "Majalengka", "Cianjur", "Banjar"] 
      },
      CENTRAL_JAVA: { 
        label: "Central Java", 
        cities: ["Semarang", "Surakarta", "Tegal", "Pekalongan", "Salatiga", "Magelang", "Kudus", "Jepara", "Rembang", "Blora", "Batang", "Pati", "Wonosobo", "Temanggung", "Boyolali", "Klaten"] 
      },
      EAST_JAVA: { 
        label: "East Java", 
        cities: ["Surabaya", "Malang", "Kediri", "Mojokerto", "Jember", "Banyuwangi", "Madiun", "Pasuruan", "Probolinggo", "Blitar", "Lumajang", "Bondowoso", "Situbondo", "Tulungagung", "Tuban", "Lamongan"] 
      }
    }
  },

  // ========== TURQUIE (TR) ==========
  TR: {
    label: "Türkiye",
    provinces: {
      ISTANBUL: { 
        label: "Istanbul", 
        cities: ["Istanbul", "Kadıköy", "Beşiktaş", "Şişli", "Fatih", "Üsküdar", "Bakırköy", "Esenler", "Küçükçekmece", "Beyoğlu", "Zeytinburnu", "Maltepe", "Sarıyer", "Pendik", "Kartal", "Beylikdüzü"] 
      },
      ANKARA: { 
        label: "Ankara", 
        cities: ["Ankara", "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan", "Altındağ", "Etimesgut", "Polatlı", "Gölbaşı", "Pursaklar", "Akyurt", "Kahramankazan", "Elmadağ", "Bala", "Ayaş"] 
      },
      IZMIR: { 
        label: "İzmir", 
        cities: ["İzmir", "Bornova", "Karşıyaka", "Konak", "Buca", "Bayraklı", "Çiğli", "Balçova", "Narlıdere", "Gaziemir", "Güzelbahçe", "Urla", "Seferihisar", "Menderes", "Torbalı", "Bergama"] 
      },
      ANTALYA: { 
        label: "Antalya", 
        cities: ["Antalya", "Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Serik", "Kumluca", "Kaş", "Korkuteli", "Finike", "Gazipaşa", "Demre", "Akseki", "Elmalı", "Gündoğmuş"] 
      }
    }
  },

  // ========== BRÉSIL (BR) ==========
  BR: {
    label: "Brazil",
    provinces: {
      SAO_PAULO: { 
        label: "São Paulo", 
        cities: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Sorocaba", "Ribeirão Preto", "São José dos Campos", "Santos", "Mauá", "Diadema", "Jundiaí", "Barueri", "São Vicente", "Carapicuíba"] 
      },
      RIO_JANEIRO: { 
        label: "Rio de Janeiro", 
        cities: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti", "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Mesquita", "Teresópolis", "Nilópolis"] 
      },
      MINAS_GERAIS: { 
        label: "Minas Gerais", 
        cities: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas", "Patos de Minas"] 
      },
      BAHIA: { 
        label: "Bahia", 
        cities: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Alagoinhas", "Teixeira de Freitas", "Barreiras", "Porto Seguro", "Simões Filho", "Paulo Afonso", "Eunápolis"] 
      }
    }
  }
};

const PHONE_PREFIX_BY_COUNTRY = {
  MA: "+212", DZ: "+213", TN: "+216", EG: "+20", FR: "+33", ES: "+34", 
  SA: "+966", AE: "+971", US: "+1", NG: "+234", PK: "+92", IN: "+91", 
  ID: "+62", TR: "+90", BR: "+55"
};

// Fonction pour obtenir la devise en fonction du pays
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

// Fonction pour obtenir des exemples de prix de livraison par ville
const getShippingExample = (city, countryCode) => {
  const shippingExamples = {
    "MA": {
      "Casablanca": { amount: 29, note: "Livraison standard" },
      "Rabat": { amount: 25, note: "Livraison standard" },
      "Marrakech": { amount: 35, note: "Livraison express" },
      "Fès": { amount: 30, note: "Livraison standard" },
      "Tanger": { amount: 40, note: "Livraison express" },
      "Agadir": { amount: 45, note: "Livraison express" },
      "Oujda": { amount: 50, note: "Livraison express" }
    },
    "DZ": {
      "Alger": { amount: 45, note: "Livraison standard" },
      "Oran": { amount: 40, note: "Livraison standard" },
      "Constantine": { amount: 50, note: "Livraison express" },
      "Annaba": { amount: 55, note: "Livraison express" }
    },
    "FR": {
      "Paris": { amount: 8.5, note: "Livraison standard" },
      "Lyon": { amount: 7.5, note: "Livraison standard" },
      "Marseille": { amount: 8, note: "Livraison standard" },
      "Toulouse": { amount: 9, note: "Livraison standard" }
    },
    "ES": {
      "Madrid": { amount: 6.5, note: "Livraison standard" },
      "Barcelona": { amount: 7, note: "Livraison standard" },
      "Valencia": { amount: 7.5, note: "Livraison standard" }
    }
  };
  
  const countryData = shippingExamples[countryCode] || shippingExamples["MA"];
  const cityData = countryData[city];
  
  if (cityData) {
    return cityData;
  }
  
  // Valeur par défaut
  return {
    amount: countryCode === "MA" ? 30 : countryCode === "FR" ? 8 : 10,
    note: "Livraison standard"
  };
};

/* ============================== Contexte ============================== */
const FormsCtx = createContext(null);
const useForms = () => useContext(FormsCtx);

/* ============================== Shell ============================== */
function PageShell({ themeLink, onOpenPreview, onSave, saving, t }) {
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
                {t("section1.header.appTitle")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.8)" }}>
                {t("section1.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>
          <InlineStack gap="200">
            <Button url={themeLink} external target="_blank">
              {t("section1.header.btnAddToTheme")}
            </Button>
            <Button onClick={onOpenPreview}>
              {t("section1.header.btnPreview")}
            </Button>
            <Button variant="primary" onClick={onSave} loading={saving}>
              {t("section1.header.btnSave")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>
      <div className="tf-shell">
        <div className="tf-editor">
          <OutletEditor />
        </div>
      </div>
    </>
  );
}

/* ============================== Page ============================== */
function Section1FormsLayoutInner() {
  useInjectCss();

  const { t } = useI18n();
  const rootData = useRouteLoaderData("root");
  const apiKey = rootData?.apiKey;
  const hostB64 = rootData?.host;

  const locale =
    rootData?.locale ||
    rootData?.language ||
    rootData?.shopLocale ||
    "en";
  const isRTL = /^ar\b/i.test(locale);

  const themeDeepLink = useMemo(
    () =>
      buildThemeEditorUrl({
        hostB64,
        apiKey,
        blockHandle: "order-form",
        template: "product",
      }),
    [hostB64, apiKey]
  );

  const [config, setConfig] = useState(() => ({
    meta: {
      version: 2,
      preset: "CleanWhite",
      fieldsOrder: ["name", "phone", "quantity", "address", "city", "province", "notes"],
    },
    form: {
      style: "inline",
      title: "Order form",
      subtitle: "Please enter your contact information",
      buttonText: "Order now",
      successText: "Thanks! We'll contact you",
      buttonIcon: "CartIcon",
    },
    design: {
      ...DESIGN_PRESETS.CleanWhite,
      direction: isRTL ? "rtl" : "ltr",
      fontSize: 14,
      titleAlign: isRTL ? "right" : "left",
      fieldAlign: isRTL ? "right" : "left",
    },
    behavior: {
      requireGDPR: false,
      gdprLabel: "I accept the privacy policy",
      whatsappOptIn: false,
      whatsappLabel: "Receive confirmation on WhatsApp",
      openDelayMs: 0,
      closeOnOutside: true,
      effect: "none",
      glowPx: 18,
      stickyType: "none",
      stickyLabel: "Order now",
      stickyIcon: "CartIcon",
      drawerDirection: "right",
      drawerSize: "md",
      overlayColor: "#020617",
      overlayOpacity: 70,
      country: "MA",
      provinceKey: "",
      cityKey: "",
    },
    fields: {
      name: {
        on: true,
        required: true,
        type: "text",
        label: "Full name",
        ph: "Your full name",
        icon: "ProfileIcon",
      },
      phone: {
        on: true,
        required: true,
        type: "tel",
        label: "Phone (WhatsApp)",
        ph: "Phone number",
        prefix: "+212",
        icon: "PhoneIcon",
      },
      quantity: {
        on: true,
        required: true,
        type: "number",
        label: "Quantity",
        ph: "1",
        min: 1,
        max: 10,
        icon: "HashtagIcon",
      },
      province: {
        on: true,
        required: false,
        type: "text",
        label: "Wilaya / Province",
        ph: "Select province",
        icon: "RegionIcon",
      },
      city: {
        on: true,
        required: false,
        type: "text",
        label: "City",
        ph: "Select city",
        icon: "CityIcon",
      },
      address: {
        on: false,
        required: false,
        type: "text",
        label: "Address",
        ph: "Full address",
        icon: "LocationIcon",
      },
      notes: {
        on: false,
        required: false,
        type: "textarea",
        label: "Notes",
        ph: "(optional)",
        icon: "NoteIcon",
      },
    },
    cartTitles: {
      top: "Order summary",
      price: "Product price",
      shipping: "Shipping price",
      total: "Total",
      cartIcon: "CartIcon", // Nouveau champ pour l'icône du cart
    },
    uiTitles: {
      applyCoupon: "Apply",
      orderNow: "Order now",
      totalSuffix: "Total:",
    },
  }));

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const res = await fetch("/api/load-settings");
        if (res.ok) {
          const j = await res.json();
          if (j?.ok && j.settings) {
            const clean = sanitizeDeep(j.settings);
            if (!cancelled) {
              setConfig((prev) => ({
                ...prev,
                ...clean,
                behavior: {
                  ...prev.behavior,
                  ...(clean.behavior || {}),
                },
                form: {
                  ...prev.form,
                  ...(clean.form || {}),
                },
                design: {
                  ...prev.design,
                  ...(clean.design || {}),
                },
              }));
              try {
                localStorage.setItem("tripleform_cod_config", JSON.stringify(clean));
              } catch {}
            }
            setLoadingInitial(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load settings from Shopify", e);
      }

      try {
        const s =
          typeof window !== "undefined"
            ? window.localStorage.getItem("tripleform_cod_config")
            : null;
        if (s && !cancelled) {
          const parsed = sanitizeDeep(JSON.parse(s));
          setConfig((prev) => ({
            ...prev,
            ...parsed,
            behavior: {
              ...prev.behavior,
              ...(parsed.behavior || {}),
            },
            form: {
              ...prev.form,
              ...(parsed.form || {}),
            },
            design: {
              ...prev.design,
              ...(parsed.design || {}),
            },
          }));
        }
      } catch (e) {
        console.error("Failed to load settings from localStorage", e);
      }

      if (!cancelled) setLoadingInitial(false);
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = () => {
    try {
      localStorage.setItem("tripleform_cod_config", JSON.stringify(config));
    } catch {}
  };

  const setDesign = (p) =>
    setConfig((c) => ({
      ...c,
      design: { ...c.design, ...p },
    }));
  const setForm = (p) =>
    setConfig((c) => ({
      ...c,
      form: { ...c.form, ...p },
    }));
  const setBehav = (p) =>
    setConfig((c) => ({
      ...c,
      behavior: { ...c.behavior, ...p },
    }));
  const setField = (k, p) =>
    setConfig((c) => ({
      ...c,
      fields: { ...c.fields, [k]: { ...c.fields[k], ...p } },
    }));
  const setCartT = (p) =>
    setConfig((c) => ({
      ...c,
      cartTitles: { ...c.cartTitles, ...p },
    }));
  const setUiT = (p) =>
    setConfig((c) => ({
      ...c,
      uiTitles: { ...c.uiTitles, ...p },
    }));
  const setFieldsOrder = (order) =>
    setConfig((c) => ({
      ...c,
      meta: { ...(c.meta || {}), fieldsOrder: order },
    }));

  function computeShadow(effect, glowPx, glowColor, hasShadow) {
    if (effect === "glow") return `0 0 ${glowPx}px ${glowColor}`;
    if (effect === "light") return "0 12px 28px rgba(0,0,0,.12)";
    if (hasShadow) return "0 10px 24px rgba(15,23,42,.16)";
    return "none";
  }

  const eff = config.behavior?.effect || "none";
  const glowPx = config.design?.glowPx ?? config.behavior?.glowPx ?? 18;
  const glowCol = config.design?.btnBg || "#2563EB";
  const direction = config.design?.direction || "ltr";
  const baseFontSize = config.design?.fontSize || 14;

  const fieldAlignRaw = config.design?.fieldAlign || "left";
  const fieldAlign = ["left", "center", "right"].includes(fieldAlignRaw)
    ? fieldAlignRaw
    : "left";

  const cardCSS = useMemo(
    () => ({
      background: config.design.bg,
      color: config.design.text,
      border: `1px solid ${config.design.border}`,
      borderRadius: config.design.radius,
      padding: config.design.padding,
      width: "100%",
      boxSizing: "border-box",
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
      direction,
      fontSize: baseFontSize,
    }),
    [config.design, eff, glowPx, glowCol, direction, baseFontSize]
  );

  const inputBase = useMemo(
    () => ({
      width: "100%",
      padding: "10px 12px 10px 40px",
      borderRadius: config.design.btnRadius,
      border: `1px solid ${config.design.inputBorder}`,
      background: config.design.inputBg,
      color: config.design.text,
      outline: "none",
      fontSize: baseFontSize,
      textAlign: fieldAlign,
    }),
    [config.design, baseFontSize, fieldAlign]
  );

  const btnCSS = useMemo(
    () => ({
      width: "100%",
      height: config.design.btnHeight,
      borderRadius: config.design.btnRadius,
      border: `1px solid ${config.design.btnBorder}`,
      color: config.design.btnText,
      background: config.design.btnBg,
      fontWeight: 700,
      letterSpacing: 0.2,
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
      fontSize: baseFontSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      cursor: "pointer",
    }),
    [config.design, eff, glowPx, glowCol, baseFontSize]
  );

  const cartBoxCSS = useMemo(
    () => ({
      background: config.design.cartBg,
      border: `1px solid ${config.design.cartBorder}`,
      borderRadius: 12,
      padding: 14,
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
      direction,
      fontSize: baseFontSize,
    }),
    [config.design, eff, glowPx, glowCol, direction, baseFontSize]
  );

  const cartRowCSS = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 8,
      alignItems: "center",
      padding: "8px 10px",
      border: `1px solid ${config.design.cartRowBorder}`,
      borderRadius: 10,
      background: config.design.cartRowBg,
      color: config.design.cartTextColor,
      boxShadow: computeShadow(
        eff,
        Math.max(8, Math.round(glowPx * 0.6)),
        glowCol,
        !!config.design.shadow
      ),
      fontSize: baseFontSize,
    }),
    [config.design, eff, glowPx, glowCol, baseFontSize]
  );

  const saveToShop = async () => {
    setSaving(true);
    try {
      persistLocal();
      const res = await fetch("/api/save-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: config }),
      });
      let j = {};
      try {
        j = await res.json();
      } catch {}
      if (!res.ok || !j.ok) {
        const msg =
          j?.errors?.[0]?.message ||
          j?.error ||
          t("section1.save.errorGeneric");
        throw new Error(msg);
      }
      alert(t("section1.save.success"));
    } catch (e) {
      console.error(e);
      const fallbackMessage = t("section1.save.unknownError");
      alert(t("section1.save.failedPrefix") + (e?.message || fallbackMessage));
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ padding: 32 }}>
        <Card>
          <BlockStack gap="300">
            <div
              style={{
                height: 16,
                background: "#E5E7EB",
                borderRadius: 999,
              }}
            />
            <div
              style={{
                height: 16,
                background: "#E5E7EB",
                borderRadius: 999,
                width: "60%",
              }}
            />
            <div
              style={{
                height: 220,
                background: "#E5E7EB",
                borderRadius: 16,
              }}
            />
          </BlockStack>
        </Card>
      </div>
    );
  }

  return (
    <FormsCtx.Provider
      value={{
        config,
        setConfig,
        setDesign,
        setForm,
        setBehav,
        setField,
        setCartT,
        setUiT,
        setFieldsOrder,
        inputBase,
        btnCSS,
        cardCSS,
        cartBoxCSS,
        cartRowCSS,
        showPreview,
        setShowPreview,
        t,
      }}
    >
      <PageShell
        themeLink={themeDeepLink}
        onOpenPreview={() => setShowPreview(true)}
        onSave={saveToShop}
        saving={saving}
        t={t}
      />

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={t("section1.modal.previewTitle")}
        primaryAction={{
          content: t("section1.modal.previewClose"),
          onAction: () => setShowPreview(false),
        }}
        large
      >
        <Modal.Section>
          <PreviewPanel />
        </Modal.Section>
      </Modal>
    </FormsCtx.Provider>
  );
}

/* ============================== Composant pour les palettes de couleurs ============================== */
function ColorPaletteSelector({ onSelect }) {
  const { config, setDesign } = useForms();
  
  const applyPalette = (paletteId) => {
    const palette = COLOR_PALETTES.find(p => p.id === paletteId);
    if (palette && DESIGN_PRESETS[palette.preset]) {
      setDesign(DESIGN_PRESETS[palette.preset]);
    }
  };

  return (
    <div className="tf-color-palettes">
      {COLOR_PALETTES.map((palette) => (
        <div
          key={palette.id}
          className={`tf-color-palette ${config.meta?.preset === palette.preset ? 'active' : ''}`}
          onClick={() => {
            applyPalette(palette.id);
            if (onSelect) onSelect(palette.id);
          }}
        >
          <div className="tf-palette-colors">
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
          <div className="tf-palette-info">
            {palette.name}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== Sélecteur d'icônes ============================== */
function IconSelector({ fieldKey, type = "field", onSelect, selectedIcon }) {
  const { t } = useForms();
  
  const icons = type === "field" 
    ? ICON_LIBRARY[fieldKey] || ICON_LIBRARY.name
    : type === "cartTitle"
    ? ICON_LIBRARY.cartTitle
    : ICON_LIBRARY.button;
  
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        {t("section1.iconSelector.title")}
      </div>
      <div className="tf-icon-selector">
        {icons.map((icon) => {
          const IconComponent = icon.icon && PI[icon.icon] ? PI[icon.icon] : null;
          return (
            <div
              key={icon.value}
              className={`tf-icon-option ${selectedIcon === icon.value ? 'selected' : ''}`}
              onClick={() => onSelect(icon.value)}
              title={icon.label}
            >
              {IconComponent ? <Icon source={IconComponent} /> : icon.value}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== Éditeur (rail | réglages | preview) ============================== */
function OutletEditor() {
  const {
    config,
    setCartT,
    setForm,
    setUiT,
    setField,
    setDesign,
    setBehav,
    setFieldsOrder,
    t,
  } = useForms();

  const [sel, setSel] = useState("cart");

  const keys = Object.keys(config.fields || {});
  const order = useMemo(() => {
    const existing = config.meta?.fieldsOrder || [];
    return [
      ...existing.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !existing.includes(k)),
    ];
  }, [config.meta?.fieldsOrder, keys]);

  useEffect(() => {
    if (JSON.stringify(order) !== JSON.stringify(config.meta?.fieldsOrder || [])) {
      setFieldsOrder(order);
    }
  }, [order]);

  const baseItems = [
    { key: "cart", label: t("section1.rail.cart"), icon: "ProductsIcon" },
    { key: "titles", label: t("section1.rail.titles"), icon: "TextBlockIcon" },
    {
      key: "buttons",
      label: t("section1.rail.buttons"),
      icon: "CircleInformationIcon",
    },
    { key: "sep", label: t("section1.rail.fieldsSeparator"), separator: true },
  ];

  const fieldItems = order.map((k) => ({
    key: `field:${k}`,
    label: config.fields[k]?.label || k,
    movable: true,
    toggle: true,
    on: !!config.fields[k]?.on,
    icon: "AppsIcon",
  }));

  const tailItems = [
    {
      key: "sep2",
      label: t("section1.rail.appearanceSeparator"),
      separator: true,
    },
    { key: "colors", label: t("section1.rail.colors"), icon: "ColorIcon" },
    { key: "options", label: t("section1.rail.options"), icon: "SettingsIcon" },
  ];

  const items = [...baseItems, ...fieldItems, ...tailItems];

  const moveField = (key, dir) => {
    const k = key.replace(/^field:/, "");
    const idx = order.indexOf(k);
    const ni = idx + dir;
    if (idx < 0 || ni < 0 || ni >= order.length) return;
    const next = [...order];
    next.splice(idx, 1);
    next.splice(ni, 0, k);
    setFieldsOrder(next);
    setSel(`field:${k}`);
  };

  const [dragKey, setDragKey] = useState(null);
  const onDragStart = (k) => setDragKey(k);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (targetKey) => {
    if (!dragKey || dragKey === targetKey) return;
    const a = dragKey.replace(/^field:/, "");
    const b = targetKey.replace(/^field:/, "");
    const next = [...order].filter((x) => x !== a);
    const tIdx = next.indexOf(b);
    next.splice(tIdx, 0, a);
    setFieldsOrder(next);
    setDragKey(null);
    setSel(`field:${a}`);
  };

  const toggleField = (key) => {
    const k = key.replace(/^field:/, "");
    const st = config.fields[k] || {};
    setField(k, { on: !st.on });
  };

  return (
    <>
      {/* Rail gauche */}
      <div className="tf-rail">
        <div className="tf-rail-card">
          <div className="tf-rail-head">{t("section1.rail.title")}</div>
          <div className="tf-rail-list">
            {items.map((it) =>
              it.separator ? (
                <div
                  key={it.key}
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    padding: "4px 6px",
                  }}
                >
                  {it.label}
                </div>
              ) : (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={sel === it.key ? 1 : 0}
                  onClick={() => setSel(it.key)}
                  draggable={/^field:/.test(it.key)}
                  onDragStart={() => onDragStart(it.key)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(it.key)}
                >
                  <div className="tf-grip">
                    <Icon source={PI[it.icon] || PI.AppsIcon} />
                  </div>
                  <div>{it.label}</div>
                  <div
                    className="tf-rail-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {it.toggle && (
                      <button
                        className="tf-icon-btn"
                        onClick={() => toggleField(it.key)}
                        style={{
                          background: it.on ? "#10B981" : "#EF4444",
                          color: "#FFFFFF",
                          border: "none",
                        }}
                      >
                        {it.on ? "ON" : "OFF"}
                      </button>
                    )}
                    {it.movable && (
                      <>
                        <button
                          className="tf-icon-btn"
                          onClick={() => moveField(it.key, -1)}
                        >
                          ↑
                        </button>
                        <button
                          className="tf-icon-btn"
                          onClick={() => moveField(it.key, 1)}
                        >
                          ↓
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Colonne réglages (centre) */}
      <div className="tf-right-col">
        <div className="tf-panel">
          {/* 1) Cart / résumé commande */}
          {sel === "cart" && (
            <GroupCard title={t("section1.group.cart.title")}>
              <Grid2>
                <TextField
                  label={t("section1.cart.labelTop")}
                  value={config.cartTitles.top}
                  onChange={(v) => setCartT({ top: v })}
                />
                <TextField
                  label={t("section1.cart.labelPrice")}
                  value={config.cartTitles.price}
                  onChange={(v) => setCartT({ price: v })}
                />
                <TextField
                  label={t("section1.cart.labelShipping")}
                  value={config.cartTitles.shipping}
                  onChange={(v) => setCartT({ shipping: v })}
                />
                <TextField
                  label={t("section1.cart.labelTotal")}
                  value={config.cartTitles.total}
                  onChange={(v) => setCartT({ total: v })}
                />
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {t("section1.cart.cartIcon")}
                  </div>
                  <IconSelector
                    type="cartTitle"
                    selectedIcon={config.cartTitles.cartIcon}
                    onSelect={(icon) => setCartT({ cartIcon: icon })}
                  />
                </div>
              </Grid2>
            </GroupCard>
          )}

          {/* 2) Titres + champs */}
          {sel === "titles" && (
            <GroupCard title={t("section1.group.formTexts.title")}>
              <Grid2>
                <TextField
                  label={t("section1.form.titleLabel")}
                  value={config.form.title}
                  onChange={(v) => setForm({ title: v })}
                />
                <TextField
                  label={t("section1.form.subtitleLabel")}
                  value={config.form.subtitle}
                  onChange={(v) => setForm({ subtitle: v })}
                />
              </Grid2>

              <div style={{ marginTop: 16 }}>
                <BlueSection title={t("section1.group.fields.title")} defaultOpen>
                  {order.map((k) => (
                    <FieldEditor key={k} fieldKey={k} />
                  ))}
                </BlueSection>
              </div>
            </GroupCard>
          )}

          {/* 3) Boutons & textes d'action */}
          {sel === "buttons" && (
            <GroupCard title={t("section1.group.buttons.title")}>
              <Grid2>
                <TextField
                  label={t("section1.buttons.mainCtaLabel")}
                  value={config.uiTitles.orderNow}
                  onChange={(v) => setUiT({ orderNow: v })}
                />
                <TextField
                  label={t("section1.buttons.totalSuffixLabel")}
                  value={config.uiTitles.totalSuffix}
                  onChange={(v) => setUiT({ totalSuffix: v })}
                />
                <TextField
                  label={t("section1.buttons.successTextLabel")}
                  value={config.form.successText}
                  onChange={(v) => setForm({ successText: v })}
                />
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {t("section1.buttons.buttonIcon")}
                  </div>
                  <IconSelector
                    type="button"
                    selectedIcon={config.form.buttonIcon}
                    onSelect={(icon) => setForm({ buttonIcon: icon })}
                  />
                </div>
              </Grid2>
            </GroupCard>
          )}

          {/* 4) Couleurs & layout */}
          {sel === "colors" && (
            <GroupCard title={t("section1.group.colors.title")}>
              {/* PALETTES DE COULEURS EN HAUT */}
              <BlueSection title={t("section1.colors.presets")} defaultOpen>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                  {t("section1.presets.description")}
                </p>
                <ColorPaletteSelector />
              </BlueSection>

              {/* COULEURS DU FORMULAIRE */}
              <BlueSection title={t("section1.colors.formSection")}>
                <Grid3>
                  <ColorField
                    label={t("section1.colors.bg")}
                    value={config.design.bg}
                    onChange={(v) => setDesign({ bg: v })}
                  />
                  <ColorField
                    label={t("section1.colors.text")}
                    value={config.design.text}
                    onChange={(v) => setDesign({ text: v })}
                  />
                  <ColorField
                    label={t("section1.colors.border")}
                    value={config.design.border}
                    onChange={(v) => setDesign({ border: v })}
                  />
                  <ColorField
                    label={t("section1.colors.inputBg")}
                    value={config.design.inputBg}
                    onChange={(v) => setDesign({ inputBg: v })}
                  />
                  <ColorField
                    label={t("section1.colors.inputBorder")}
                    value={config.design.inputBorder}
                    onChange={(v) => setDesign({ inputBorder: v })}
                  />
                  <ColorField
                    label={t("section1.colors.placeholder")}
                    value={config.design.placeholder}
                    onChange={(v) => setDesign({ placeholder: v })}
                  />
                </Grid3>
              </BlueSection>

              {/* COULEURS DU BOUTON */}
              <BlueSection title={t("section1.colors.buttonSection")}>
                <Grid3>
                  <ColorField
                    label={t("section1.colors.btnBg")}
                    value={config.design.btnBg}
                    onChange={(v) => setDesign({ btnBg: v })}
                  />
                  <ColorField
                    label={t("section1.colors.btnText")}
                    value={config.design.btnText}
                    onChange={(v) => setDesign({ btnText: v })}
                  />
                  <ColorField
                    label={t("section1.colors.btnBorder")}
                    value={config.design.btnBorder}
                    onChange={(v) => setDesign({ btnBorder: v })}
                  />
                </Grid3>
                <div style={{ marginTop: 12 }}>
                  <RangeSlider
                    label={t("section1.colors.btnHeight")}
                    value={config.design.btnHeight || 46}
                    min={32}
                    max={72}
                    step={2}
                    onChange={(v) => setDesign({ btnHeight: v })}
                  />
                </div>
              </BlueSection>

              {/* COULEURS DU PANIER */}
              <BlueSection title={t("section1.colors.cartSection")}>
                <Grid3>
                  <ColorField
                    label={t("section1.colors.cartBg")}
                    value={config.design.cartBg}
                    onChange={(v) => setDesign({ cartBg: v })}
                  />
                  <ColorField
                    label={t("section1.colors.cartBorder")}
                    value={config.design.cartBorder}
                    onChange={(v) => setDesign({ cartBorder: v })}
                  />
                  <ColorField
                    label={t("section1.colors.cartRowBg")}
                    value={config.design.cartRowBg}
                    onChange={(v) => setDesign({ cartRowBg: v })}
                  />
                  <ColorField
                    label={t("section1.colors.cartRowBorder")}
                    value={config.design.cartRowBorder}
                    onChange={(v) => setDesign({ cartRowBorder: v })}
                  />
                  <ColorField
                    label={t("section1.colors.cartTitle")}
                    value={config.design.cartTitleColor}
                    onChange={(v) => setDesign({ cartTitleColor: v })}
                  />
                  <ColorField
                    label={t("section1.colors.cartText")}
                    value={config.design.cartTextColor}
                    onChange={(v) => setDesign({ cartTextColor: v })}
                  />
                </Grid3>
              </BlueSection>

              {/* LAYOUT */}
              <BlueSection title={t("section1.colors.layoutSection")}>
                <Grid3>
                  <RangeSlider
                    label={t("section1.colors.radius")}
                    value={config.design.radius || 12}
                    min={0}
                    max={24}
                    step={1}
                    onChange={(v) => setDesign({ radius: v })}
                  />
                  <RangeSlider
                    label={t("section1.colors.padding")}
                    value={config.design.padding || 16}
                    min={8}
                    max={32}
                    step={1}
                    onChange={(v) => setDesign({ padding: v })}
                  />
                  <RangeSlider
                    label={t("section1.colors.fontSize")}
                    value={config.design.fontSize || 14}
                    min={12}
                    max={18}
                    step={1}
                    onChange={(v) => setDesign({ fontSize: v })}
                  />
                </Grid3>
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  <Select
                    label={t("section1.colors.direction")}
                    options={[
                      { label: "LTR", value: "ltr" },
                      { label: "RTL", value: "rtl" },
                    ]}
                    value={config.design.direction || "ltr"}
                    onChange={(v) => setDesign({ direction: v })}
                  />
                  <Select
                    label={t("section1.colors.titleAlign")}
                    options={[
                      { label: t("section1.align.left"), value: "left" },
                      { label: t("section1.align.center"), value: "center" },
                      { label: t("section1.align.right"), value: "right" },
                    ]}
                    value={config.design.titleAlign || "left"}
                    onChange={(v) => setDesign({ titleAlign: v })}
                  />
                  <Select
                    label={t("section1.colors.fieldAlign")}
                    options={[
                      { label: t("section1.align.left"), value: "left" },
                      { label: t("section1.align.center"), value: "center" },
                      { label: t("section1.align.right"), value: "right" },
                    ]}
                    value={config.design.fieldAlign || "left"}
                    onChange={(v) => setDesign({ fieldAlign: v })}
                  />
                  <InlineStack gap="200" blockAlign="center">
                    <Checkbox
                      label={t("section1.colors.shadow")}
                      checked={!!config.design.shadow}
                      onChange={(v) => setDesign({ shadow: v })}
                    />
                    <Checkbox
                      label={t("section1.colors.glow")}
                      checked={!!config.design.glow}
                      onChange={(v) => setDesign({ glow: v })}
                    />
                    <RangeSlider
                      label={t("section1.colors.glowPx")}
                      value={
                        config.design.glowPx ?? config.behavior.glowPx ?? 18
                      }
                      min={4}
                      max={40}
                      step={1}
                      onChange={(v) => setDesign({ glowPx: v })}
                    />
                  </InlineStack>
                </div>
              </BlueSection>
            </GroupCard>
          )}

          {/* 5) Options : effets, sticky, pays, consentements */}
          {sel === "options" && (
            <GroupCard title={t("section1.group.options.title")}>
              {/* OPTIONS D'AFFICHAGE & COMPORTEMENT */}
              <BlueSection title={t("section1.options.behavior")} defaultOpen>
                <Grid3>
                  <Select
                    label={t("section1.buttons.displayStyleLabel")}
                    options={[
                      { label: t("section1.buttons.style.inline"), value: "inline" },
                      { label: t("section1.buttons.style.popup"), value: "popup" },
                      { label: t("section1.buttons.style.drawer"), value: "drawer" },
                    ]}
                    value={config.form.style || "inline"}
                    onChange={(v) => setForm({ style: v })}
                  />
                  <Select
                    label={t("section1.options.effect")}
                    options={[
                      { label: t("section1.options.effect.none"), value: "none" },
                      { label: t("section1.options.effect.light"), value: "light" },
                      { label: t("section1.options.effect.glow"), value: "glow" },
                    ]}
                    value={config.behavior.effect || "none"}
                    onChange={(v) => setBehav({ effect: v })}
                  />
                  <Checkbox
                    label={t("section1.options.closeOnOutside")}
                    checked={!!config.behavior.closeOnOutside}
                    onChange={(v) => setBehav({ closeOnOutside: v })}
                  />
                </Grid3>
              </BlueSection>

              {/* BOUTON STICKY */}
              <BlueSection title={t("section1.options.stickyButton")}>
                <Grid3>
                  <Select
                    label={t("section1.options.stickyType")}
                    options={[
                      { label: t("section1.options.sticky.none"), value: "none" },
                      {
                        label: t("section1.options.sticky.bottomBar"),
                        value: "bottom-bar",
                      },
                      {
                        label: t("section1.options.sticky.bubbleRight"),
                        value: "bubble-right",
                      },
                      {
                        label: t("section1.options.sticky.bubbleLeft"),
                        value: "bubble-left",
                      },
                    ]}
                    value={config.behavior.stickyType || "none"}
                    onChange={(v) => setBehav({ stickyType: v })}
                  />
                  <TextField
                    label={t("section1.options.stickyLabel")}
                    value={config.behavior.stickyLabel || ""}
                    onChange={(v) => setBehav({ stickyLabel: v })}
                  />
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {t("section1.options.stickyIcon")}
                    </div>
                    <IconSelector
                      type="button"
                      selectedIcon={config.behavior.stickyIcon}
                      onSelect={(icon) => setBehav({ stickyIcon: icon })}
                    />
                  </div>
                </Grid3>
              </BlueSection>

              {/* === Pays COD === */}
              <BlueSection title={t("section1.options.countries")}>
                <Select
                  label={t("section1.options.countries.storeCountryLabel")}
                  options={[
                    {
                      label: t("section1.options.countries.selectPlaceholder"),
                      value: "",
                    },
                    { label: "Maroc", value: "MA" },
                    { label: "Algérie", value: "DZ" },
                    { label: "Tunisie", value: "TN" },
                    { label: "Égypte", value: "EG" },
                    { label: "France", value: "FR" },
                    { label: "Espagne", value: "ES" },
                    { label: "Arabie Saoudite", value: "SA" },
                    { label: "Émirats Arabes Unis", value: "AE" },
                    { label: "États-Unis", value: "US" },
                    { label: "Nigeria", value: "NG" },
                    { label: "Pakistan", value: "PK" },
                    { label: "Inde", value: "IN" },
                    { label: "Indonésie", value: "ID" },
                    { label: "Turquie", value: "TR" },
                    { label: "Brésil", value: "BR" }
                  ]}
                  value={config.behavior.country || ""}
                  onChange={(v) => {
                    setBehav({
                      country: v,
                      provinceKey: "",
                      cityKey: "",
                    });
                    const prefix = PHONE_PREFIX_BY_COUNTRY[v] || "";
                    if (prefix) {
                      setField("phone", { prefix });
                    }
                  }}
                />
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#6B7280",
                  }}
                >
                  {t("section1.options.countries.note")}
                </p>
              </BlueSection>

              {/* Consentements */}
              <BlueSection title={t("section1.options.consents")}>
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox
                    label={t("section1.options.requireGdpr")}
                    checked={!!config.behavior.requireGDPR}
                    onChange={(v) => setBehav({ requireGDPR: v })}
                  />
                  <TextField
                    label={t("section1.options.gdprLabel")}
                    value={config.behavior.gdprLabel || ""}
                    onChange={(v) => setBehav({ gdprLabel: v })}
                  />
                </InlineStack>
                <div style={{ height: 12 }} />
                <InlineStack gap="200" blockAlign="center">
                  <Checkbox
                    label={t("section1.options.whatsappOptIn")}
                    checked={!!config.behavior.whatsappOptIn}
                    onChange={(v) => setBehav({ whatsappOptIn: v })}
                  />
                  <TextField
                    label={t("section1.options.whatsappLabel")}
                    value={config.behavior.whatsappLabel || ""}
                    onChange={(v) => setBehav({ whatsappLabel: v })}
                  />
                </InlineStack>
              </BlueSection>
            </GroupCard>
          )}

          {/* Si on clique sur un champ dans le rail, on affiche son éditeur */}
          {sel.startsWith("field:") && (
            <FieldEditor fieldKey={sel.replace(/^field:/, "")} />
          )}
        </div>
      </div>

      {/* Colonne preview (droite) */}
      <div className="tf-preview-col">
        <div className="tf-preview-card">
          <PreviewPanel />
        </div>
      </div>
    </>
  );
}

/* ============================== Éditeur de champ ============================== */
function FieldEditor({ fieldKey }) {
  const { config, setField, t } = useForms();
  const st = config.fields[fieldKey] || {};
  const type = st.type || "text";

  const titleKeyMap = {
    name: "section1.fieldEditor.titlePrefix.fullName",
    phone: "section1.fieldEditor.titlePrefix.phone",
    quantity: "section1.fieldEditor.titlePrefix.quantity",
    province: "section1.fieldEditor.titlePrefix.province",
    city: "section1.fieldEditor.titlePrefix.city",
    address: "section1.fieldEditor.titlePrefix.address",
    notes: "section1.fieldEditor.titlePrefix.notes",
  };

  const titleKey = titleKeyMap[fieldKey];
  const titleText = titleKey ? t(titleKey) : (st.label || fieldKey);

  return (
    <GroupCard
      title={titleText}
    >
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Checkbox
            label={t("section1.fieldEditor.activeLabel")}
            checked={!!st.on}
            onChange={(v) => setField(fieldKey, { on: v })}
          />
          <Checkbox
            label={t("section1.fieldEditor.requiredLabel")}
            checked={!!st.required}
            onChange={(v) => setField(fieldKey, { required: v })}
          />
        </InlineStack>
        <Select
          label={t("section1.fieldEditor.typeLabel")}
          options={[
            {
              label: t("section1.fieldEditor.type.text"),
              value: "text",
            },
            {
              label: t("section1.fieldEditor.type.phone"),
              value: "tel",
            },
            {
              label: t("section1.fieldEditor.type.textarea"),
              value: "textarea",
            },
            {
              label: t("section1.fieldEditor.type.number"),
              value: "number",
            },
          ]}
          value={type}
          onChange={(v) => setField(fieldKey, { type: v })}
        />
      </InlineStack>
      <div style={{ height: 8 }} />
      <Grid2>
        <TextField
          label={t("section1.fieldEditor.labelLabel")}
          value={st.label || ""}
          onChange={(v) => setField(fieldKey, { label: v })}
        />
        <TextField
          label={t("section1.fieldEditor.placeholderLabel")}
          value={st.ph || ""}
          onChange={(v) => setField(fieldKey, { ph: v })}
        />
        {type === "tel" && (
          <TextField
            label={t("section1.fieldEditor.phonePrefixLabel")}
            value={st.prefix || ""}
            onChange={(v) => setField(fieldKey, { prefix: v })}
          />
        )}
        {type === "number" && (
          <>
            <TextField
              type="number"
              label={t("section1.fieldEditor.minLabel")}
              value={String(st.min ?? 1)}
              onChange={(v) =>
                setField(fieldKey, { min: Number(v || 0) })
              }
            />
            <TextField
              type="number"
              label={t("section1.fieldEditor.maxLabel")}
              value={
                st.max !== undefined && st.max !== null
                  ? String(st.max)
                  : ""
              }
              onChange={(v) =>
                setField(fieldKey, {
                  max: v === "" ? null : Number(v),
                })
              }
            />
          </>
        )}
      </Grid2>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          {t("section1.fieldEditor.iconLabel")}
        </div>
        <IconSelector
          fieldKey={fieldKey}
          selectedIcon={st.icon}
          onSelect={(icon) => setField(fieldKey, { icon })}
        />
      </div>
    </GroupCard>
  );
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}
function BlueSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="tf-accordion">
      <button
        type="button"
        className="tf-accordion__btn"
        onClick={() => setOpen((o) => !o)}
        style={{
          borderBottom: open ? "1px solid #E5E7EB" : "none",
          borderRadius: open ? "10px 10px 0 0" : "10px",
        }}
      >
        {open ? "▾" : "▸"} {title}
      </button>
      <div
        className="tf-accordion__body"
        style={{ display: open ? "block" : "none" }}
      >
        {children}
      </div>
    </div>
  );
}
const Grid2 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 12,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);
function ColorField({ label, value, onChange }) {
  const { t } = useForms();
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 44,
            height: 32,
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            background: "#fff",
          }}
        />
        <TextField
          label={t("section1.colors.hexLabel")}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

/* ============================== Preview ============================== */
function PreviewPanel() {
  const {
    config,
    cardCSS,
    cartBoxCSS,
    cartRowCSS,
    inputBase,
    btnCSS,
    setBehav,
    t,
  } = useForms();

  // États pour le prix de livraison dans la prévisualisation
  const [shippingPrice, setShippingPrice] = useState(null);
  const [shippingNote, setShippingNote] = useState("");

  const countryKey = config.behavior.country || "";
  const country = COUNTRY_DATA[countryKey];
  const provincesEntries = country ? Object.entries(country.provinces || {}) : [];

  const selectedProvinceKey = config.behavior.provinceKey || "";
  const selectedProvince =
    country && selectedProvinceKey ? country.provinces[selectedProvinceKey] : null;

  const cities = selectedProvince?.cities || [];
  const titleAlign = config.design.titleAlign || "left";

  const fieldKeys = Object.keys(config.fields || {});
  const orderedFields = useMemo(() => {
    const existing = config.meta?.fieldsOrder || [];
    return [
      ...existing.filter((k) => fieldKeys.includes(k)),
      ...fieldKeys.filter((k) => !existing.includes(k)),
    ];
  }, [config.meta?.fieldsOrder, fieldKeys]);

  // Prix fixe pour la prévisualisation
  const productPrice = 99.99;
  const currency = getCurrencyByCountry(countryKey);

  const fieldAlignRaw = config.design?.fieldAlign || "left";
  const fieldAlign = ["left", "center", "right"].includes(fieldAlignRaw)
    ? fieldAlignRaw
    : "left";

  // Réinitialiser le prix de livraison quand la province change
  useEffect(() => {
    setShippingPrice(null);
    setShippingNote("");
  }, [selectedProvinceKey]);

  // Fonction pour simuler le prix de livraison quand la ville change
  const handleCityChange = (city) => {
    if (!city) {
      setShippingPrice(null);
      setShippingNote("");
      return;
    }

    // Simulation du prix de livraison
    const shippingData = getShippingExample(city, countryKey);
    setShippingPrice(shippingData.amount);
    setShippingNote(`${t("section1.preview.shippingTo")} ${city} - ${shippingData.note}`);
  };

  const renderFieldWithIcon = (f, key) => {
    if (!f?.on) return null;
    
    const IconComponent = f.icon && PI[f.icon] ? PI[f.icon] : null;
    const isTextarea = f.type === "textarea";
    
    return (
      <div key={key} className="tf-field-with-icon">
        {IconComponent && (
          <div className="tf-field-icon">
            <Icon source={IconComponent} />
          </div>
        )}
        <label style={{ display: "grid", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 13, color: "#475569", textAlign: fieldAlign }}>
            {sStr(f.label)}
            {f.required ? " *" : ""}
          </span>
          {isTextarea ? (
            <textarea
              style={{
                ...inputBase,
                padding: "10px 12px",
                minHeight: 80,
              }}
              placeholder={sStr(f.ph)}
              rows={3}
            />
          ) : f.type === "tel" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: f.prefix ? "minmax(88px,130px) 1fr" : "1fr",
                gap: 8,
              }}
            >
              {f.prefix && (
                <input
                  style={{
                    ...inputBase,
                    textAlign: "center",
                    padding: "10px 12px",
                  }}
                  value={f.prefix}
                  readOnly
                />
              )}
              <input type="tel" style={inputBase} placeholder={sStr(f.ph)} />
            </div>
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"}
              style={inputBase}
              placeholder={sStr(f.ph)}
              min={f.type === "number" && f.min != null ? f.min : undefined}
              max={f.type === "number" && f.max != null ? f.max : undefined}
            />
          )}
        </label>
      </div>
    );
  };

  const renderCartBox = () => {
    const shippingDisplay = shippingPrice === null 
      ? (countryKey ? t("section1.preview.shippingToCalculate") : "Gratuit")
      : `${shippingPrice.toFixed(2)} ${currency}`;
    
    const total = productPrice + (shippingPrice || 0);
    const CartIcon = config.cartTitles.cartIcon && PI[config.cartTitles.cartIcon] ? PI[config.cartTitles.cartIcon] : null;

    return (
      <div style={cartBoxCSS} dir={config.design.direction || "ltr"}>
        <div className="tf-cart-with-icon">
          {CartIcon && (
            <div className="tf-cart-icon">
              <Icon source={CartIcon} />
            </div>
          )}
          <div
            style={{
              fontWeight: 700,
              color: config.design.cartTitleColor,
            }}
          >
            {sStr(config.cartTitles.top)}
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={cartRowCSS}>
            <div>{sStr(config.cartTitles.price)}</div>
            <div style={{ fontWeight: 700 }}>{productPrice.toFixed(2)} {currency}</div>
          </div>
          <div style={cartRowCSS}>
            <div>
              <div>{sStr(config.cartTitles.shipping)}</div>
              {shippingNote && (
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {shippingNote}
                </div>
              )}
            </div>
            <div style={{ fontWeight: 700 }}>{shippingDisplay}</div>
          </div>
          <div style={cartRowCSS}>
            <div>{sStr(config.cartTitles.total)}</div>
            <div style={{ fontWeight: 700 }}>{total.toFixed(2)} {currency}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderProvinceField = (f) => {
    if (!f?.on) return null;
    
    const IconComponent = f.icon && PI[f.icon] ? PI[f.icon] : null;
    
    return (
      <div key="province" className="tf-field-with-icon">
        {IconComponent && (
          <div className="tf-field-icon">
            <Icon source={IconComponent} />
          </div>
        )}
        <label style={{ display: "grid", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 13, color: "#475569", textAlign: fieldAlign }}>
            {sStr(f.label)}
            {f.required ? " *" : ""}
          </span>
          <select
            style={{
              ...inputBase,
              padding: "10px 12px",
              background: config.design.inputBg,
            }}
            value={selectedProvinceKey}
            onChange={(e) => {
              const v = e.target.value;
              setBehav({ provinceKey: v, cityKey: "" });
            }}
          >
            <option value="">{f.ph || t("section1.preview.provincePlaceholder")}</option>
            {provincesEntries.map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  const renderCityField = (f) => {
    if (!f?.on) return null;
    
    const IconComponent = f.icon && PI[f.icon] ? PI[f.icon] : null;
    
    return (
      <div key="city" className="tf-field-with-icon">
        {IconComponent && (
          <div className="tf-field-icon">
            <Icon source={IconComponent} />
          </div>
        )}
        <label style={{ display: "grid", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 13, color: "#475569", textAlign: fieldAlign }}>
            {sStr(f.label)}
            {f.required ? " *" : ""}
          </span>
          <select
            style={{
              ...inputBase,
              padding: "10px 12px",
              backgroundColor: selectedProvinceKey ? inputBase.background : "#F3F4F6",
            }}
            value={config.behavior.cityKey || ""}
            onChange={(e) => {
              const city = e.target.value;
              setBehav({ cityKey: city });
              handleCityChange(city);
            }}
            disabled={!selectedProvinceKey}
          >
            <option value="">
              {!selectedProvinceKey
                ? t("section1.preview.cityPlaceholderNoProvince")
                : f.ph || t("section1.preview.cityPlaceholder")}
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  const renderFormCard = () => {
    const total = productPrice + (shippingPrice || 0);
    const orderLabel = sStr(config.uiTitles.orderNow || config.form?.buttonText || "Order now");
    const suffix = sStr(config.uiTitles.totalSuffix || "Total:");
    const ButtonIcon = config.form.buttonIcon && PI[config.form.buttonIcon] ? PI[config.form.buttonIcon] : null;

    return (
      <div style={cardCSS} dir={config.design.direction || "ltr"}>
        {(config.form.title || config.form.subtitle) && (
          <div style={{ marginBottom: 10, textAlign: titleAlign }}>
            {config.form.title && (
              <div style={{ fontWeight: 700 }}>
                {sStr(config.form.title)}
              </div>
            )}
            {config.form.subtitle && (
              <div style={{ opacity: 0.8 }}>
                {sStr(config.form.subtitle)}
              </div>
            )}
          </div>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          {orderedFields.map((key) => {
            const f = config.fields[key];
            if (!f?.on) return null;
            if (key === "province") return renderProvinceField(f);
            if (key === "city") return renderCityField(f);
            return renderFieldWithIcon(f, key);
          })}

          {config.behavior.requireGDPR && (
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: 13,
                color: "#374151",
              }}
            >
              <input type="checkbox" /> {sStr(config.behavior.gdprLabel)}
            </label>
          )}
          {config.behavior.whatsappOptIn && (
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: 13,
                color: "#374151",
              }}
            >
              <input type="checkbox" /> {sStr(config.behavior.whatsappLabel)}
            </label>
          )}

          <button type="button" style={btnCSS} className="tf-btn-with-icon">
            {ButtonIcon && <Icon source={ButtonIcon} />}
            <span style={{ flex: 1, textAlign: 'center' }}>
              {orderLabel} · {suffix} {total.toFixed(2)} {currency}
            </span>
          </button>
        </div>
      </div>
    );
  };

  const StickyPreview = () => {
    const type = config.behavior?.stickyType || "none";
    if (type === "none") return null;

    const styleType = config.form?.style || "inline";

    let styleText;
    if (styleType === "inline") {
      styleText = t("section1.preview.style.inline");
    } else if (styleType === "popup") {
      styleText = t("section1.preview.style.popup");
    } else if (styleType === "drawer") {
      styleText = t("section1.preview.style.drawer");
    } else {
      styleText = styleType;
    }

    const label = sStr(
      config.behavior?.stickyLabel || config.uiTitles?.orderNow || "Order now"
    );
    const StickyIcon = config.behavior.stickyIcon && PI[config.behavior.stickyIcon] ? PI[config.behavior.stickyIcon] : null;

    const miniBtnStyle = {
      ...btnCSS,
      width: "auto",
      minWidth: 140,
      height: 36,
      fontSize: 13,
      padding: "0 16px",
    };

    if (type === "bottom-bar") {
      return (
        <div
          style={{
            marginTop: 4,
            position: "relative",
            borderRadius: 999,
            background: "#0F172A",
            color: "#F9FAFB",
            padding: "8px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <span>
            {t("section1.preview.stickyBarLabel")} · {styleText}
          </span>
          <button type="button" style={miniBtnStyle} className="tf-btn-with-icon">
            {StickyIcon && <Icon source={StickyIcon} />}
            <span style={{ flex: 1, textAlign: 'center' }}>{label}</span>
          </button>
        </div>
      );
    }

    if (type === "bubble-right" || type === "bubble-left") {
      const isLeft = type === "bubble-left";
      return (
        <div style={{ marginTop: 8, position: "relative", height: 72 }}>
          <div
            style={{
              position: "absolute",
              bottom: 4,
              [isLeft ? "left" : "right"]: 4,
            }}
          >
            <button
              type="button"
              style={{
                ...miniBtnStyle,
                borderRadius: 999,
                boxShadow: "0 8px 18px rgba(15,23,42,0.28)",
              }}
              className="tf-btn-with-icon"
            >
              {StickyIcon && <Icon source={StickyIcon} />}
              <span style={{ flex: 1, textAlign: 'center' }}>{label}</span>
            </button>
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                color: "#6B7280",
                textAlign: isLeft ? "left" : "right",
              }}
            >
              {t("section1.preview.stickyBubbleLabel")} · {styleText}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <BlockStack gap="250">
        <div style={{ width: "100%" }}>
          <div
            style={{
              borderRadius: 16,
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "grid", gap: 12 }}>
              {renderCartBox()}
              {renderFormCard()}
            </div>
          </div>
        </div>
        <StickyPreview />
      </BlockStack>
    </Card>
  );
}

// ============================== Export ==============================
export default Section1FormsLayoutInner;