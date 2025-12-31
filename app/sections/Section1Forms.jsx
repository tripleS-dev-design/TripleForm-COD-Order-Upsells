// ===== File: app/sections/Section1FormsLayout.jsx =====

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  Tabs,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useRouteLoaderData } from "@remix-run/react";
import { useI18n } from "../i18n/react";

import {
  getCountries,
  getProvinces,
  getCities,
  getPhonePrefixByCountry,
  getCurrencyByCountry,
  getShippingExample,
} from "../data/countryData";

/* ============================== Fonction utilitaire CORRIGÉE pour les icônes Polaris ============================== */
const iconCache = new Map();

function getIconSource(iconName, fallbackIcon = "AppsIcon") {
  if (!iconName || typeof iconName !== "string") {
    const fallback = PI[fallbackIcon] || PI.AppsIcon;
    return fallback;
  }

  if (iconCache.has(iconName)) return iconCache.get(iconName);

  if (typeof iconName === "function" || React.isValidElement(iconName)) {
    iconCache.set(iconName, iconName);
    return iconName;
  }

  if (PI[iconName]) {
    iconCache.set(iconName, PI[iconName]);
    return PI[iconName];
  }

  const suffixPattern = /(Major|Minor|Filled|Outline)$/i;
  if (suffixPattern.test(iconName)) {
    const baseName = iconName.replace(suffixPattern, "");
    const iconNameWithIcon = baseName + "Icon";
    if (PI[iconNameWithIcon]) {
      iconCache.set(iconName, PI[iconNameWithIcon]);
      return PI[iconNameWithIcon];
    }
  }

  if (!iconName.endsWith("Icon")) {
    const withIcon = iconName + "Icon";
    if (PI[withIcon]) {
      iconCache.set(iconName, PI[withIcon]);
      return PI[withIcon];
    }
  }

  const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (PI[capitalized]) {
    iconCache.set(iconName, PI[capitalized]);
    return PI[capitalized];
  }

  const lowerIconName = iconName.toLowerCase();
  const commonMappings = {
    cart: "CartIcon",
    shoppingcart: "CartIcon",
    bag: "BagIcon",
    profile: "ProfileIcon",
    person: "PersonIcon",
    user: "PersonIcon",
    phone: "PhoneIcon",
    mobile: "MobileIcon",
    call: "PhoneIcon",
    chat: "ChatIcon",
    email: "EmailIcon",
    mail: "EmailIcon",
    location: "LocationIcon",
    pin: "PinIcon",
    mappin: "MapPinIcon",
    map: "MapIcon",
    globe: "GlobeIcon",
    home: "HomeIcon",
    store: "StoreIcon",
    building: "BuildingIcon",
    business: "BusinessIcon",
    calendar: "CalendarIcon",
    clock: "ClockIcon",
    gift: "GiftIcon",
    note: "NoteIcon",
    document: "DocumentIcon",
    clipboard: "ClipboardIcon",
    text: "TextIcon",
    hashtag: "HashtagIcon",
    number: "NumberIcon",
    add: "AddIcon",
    plus: "AddIcon",
    delete: "DeleteIcon",
    remove: "DeleteIcon",
    trash: "DeleteIcon",
    edit: "EditIcon",
    settings: "SettingsIcon",
    view: "ViewIcon",
    show: "ViewIcon",
    eye: "ViewIcon",
    hide: "HideIcon",
    check: "CheckCircleIcon",
    tick: "CheckCircleIcon",
    success: "CheckCircleIcon",
    arrowright: "ArrowRightIcon",
    arrowleft: "ArrowLeftIcon",
    arrowup: "ArrowUpIcon",
    arrowdown: "ArrowDownIcon",
    chevronup: "ChevronUpIcon",
    chevrondown: "ChevronDownIcon",
    chevronleft: "ChevronLeftIcon",
    chevronright: "ChevronRightIcon",
    truck: "TruckIcon",
    shipping: "TruckIcon",
    delivery: "TruckIcon",
    checkout: "CheckoutIcon",
    receipt: "ReceiptIcon",
    payment: "CreditCardIcon",
    colors: "ColorsIcon",
    palette: "ColorsIcon",
    city: "CityIcon",
    info: "CircleInformationIcon",
    information: "CircleInformationIcon",
    help: "CircleInformationIcon",
    play: "PlayIcon",
  };

  const cleanName = lowerIconName.replace(/[^a-z0-9]/g, "");
  if (commonMappings[cleanName] && PI[commonMappings[cleanName]]) {
    iconCache.set(iconName, PI[commonMappings[cleanName]]);
    return PI[commonMappings[cleanName]];
  }

  const iconKeys = Object.keys(PI);
  const cleanIconName = iconName
    .replace(/Major$|Minor$|Icon$|Filled$|Outline$/i, "")
    .toLowerCase();

  for (const key of iconKeys) {
    const cleanKey = key.replace(/Icon$|Filled$|Outline$/i, "").toLowerCase();
    if (cleanKey === cleanIconName) {
      iconCache.set(iconName, PI[key]);
      return PI[key];
    }
  }

  const fallback = PI[fallbackIcon] || PI.AppsIcon;
  iconCache.set(iconName, fallback);
  return fallback;
}

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
    )}&addAppBlockId=${encodeURIComponent(apiKey)}/${encodeURIComponent(
      blockHandle
    )}&target=main`;
  }

  const shop = decoded.replace(/^https?:\/\//i, "").replace(/\/admin.*$/i, "");
  return `https://${shop}/admin/themes/current/editor?template=${encodeURIComponent(
    template
  )}&addAppBlockId=${encodeURIComponent(apiKey)}/${encodeURIComponent(
    blockHandle
  )}&target=main`;
}

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  .tf-header { background:linear-gradient(90deg,#0B3B82,#7D0031); border-bottom:none; padding:12px 16px; position:sticky; top:0; z-index:40; box-shadow:0 10px 28px rgba(11,59,130,0.45); }
  .tf-shell { padding:16px; }

  .tf-editor {
    display:grid;
    grid-template-columns: 420px minmax(0, 3fr) minmax(320px, 1.4fr);
    gap:16px;
    align-items:start;
  }

  .tf-rail { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tf-rail-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; }
  .tf-rail-head { padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:700; }
  .tf-rail-list { padding:8px; display:grid; gap:8px; }

  .tf-rail-item {
    display:grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    align-items:center;
    gap:10px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:10px 12px;
    cursor:pointer;
  }
  .tf-rail-item[data-sel="1"] { outline:2px solid #00A7A3; background:rgba(0,167,163,0.07); }
  .tf-rail-item:active { transform:scale(.998); }
  .tf-rail-item .tf-grip { opacity:.75; user-select:none; display:flex; align-items:center; justify-content:center; }

  .tf-rail-label{
    min-width:0;
    font-weight:600;
    font-size:13px;
    line-height:1.15;
    color:#111827;
    word-break:break-word;
  }

  .tf-rail-actions {
    display:flex;
    gap:6px;
    align-items:center;
    justify-content:flex-end;
    flex:0 0 auto;
  }

  .tf-icon-btn{
    width:32px;
    height:32px;
    border:1px solid #E5E7EB;
    background:#fff;
    border-radius:10px;
    padding:0;
    cursor:pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    line-height:0;
    flex:0 0 auto;
    overflow:visible;
  }
  .tf-icon-btn:hover { border-color:#CBD5E1; background:#F8FAFC; }
  .tf-icon-btn:active { transform:scale(.98); }

  .tf-right-col { display:grid; gap:16px; }
  .tf-panel   { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  .tf-preview-col { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tf-preview-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

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

  .tf-color-palettes { display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:12px; margin-top:12px; }
  .tf-color-palette { border:1px solid #E5E7EB; border-radius:10px; overflow:hidden; cursor:pointer; transition:all 0.2s; }
  .tf-color-palette:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.1); }
  .tf-color-palette.active { outline:2px solid #00A7A3; }
  .tf-palette-colors { display:flex; height:36px; }
  .tf-palette-info { padding:8px; background:#fff; font-size:11px; font-weight:600; }

  .tf-icon-selector { display:grid; grid-template-columns:repeat(auto-fill, minmax(44px, 1fr)); gap:8px; margin-top:8px; max-height:200px; overflow-y:auto; padding:8px; border:1px solid #E5E7EB; border-radius:8px; }
  .tf-icon-option { width:44px; height:44px; display:flex; align-items:center; justify-content:center; border:2px solid #E5E7EB; border-radius:10px; cursor:pointer; background:#fff; transition:all 0.2s; color:#4B5563; line-height:0; overflow:visible; }
  .tf-icon-option:hover { border-color:#00A7A3; background:#f8fafc; }
  .tf-icon-option.selected { border-color:#00A7A3; background:#ecfeff; }

  .tf-field-with-icon { display:grid; grid-template-columns:auto 1fr; gap:10px; align-items:center; }
  .tf-field-icon { width:18px; height:18px; display:flex; align-items:center; justify-content:center; color:#6B7280; line-height:0; overflow:visible; }
  .tf-btn-icon { display:flex; align-items:center; line-height:0; overflow:visible; }
  .tf-cart-icon { display:flex; align-items:center; justify-content:center; width:22px; height:22px; line-height:0; overflow:visible; }
  .tf-rail-icon { width:18px; height:18px; display:flex; align-items:center; justify-content:center; line-height:0; overflow:visible; }

  /* ✅ Fix clipping icons Polaris */
  .Polaris-Icon { display:inline-flex !important; align-items:center !important; justify-content:center !important; overflow:visible !important; }
  .Polaris-Icon svg { display:block !important; overflow:visible !important; }

  /* ✅ manquants (cart + button align) */
  .tf-cart-with-icon{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .tf-btn-with-icon{ display:flex; align-items:center; gap:8px; line-height:0; }
  .tf-btn-with-icon span{ line-height:1.2; }

  /* ✅ Popular fields block */
  .tf-rail-subhead{
    margin-top:10px;
    padding:8px 10px 4px;
    font-size:12px;
    font-weight:800;
    color:#475569;
    text-transform:uppercase;
    letter-spacing:.06em;
  }
  .tf-rail-popular{
    padding:0 8px 10px;
    display:grid;
    gap:8px;
  }
  .tf-rail-popular-item{
    display:grid;
    grid-template-columns: 28px 1fr auto;
    align-items:center;
    gap:10px;
    padding:10px 12px;
    border:1px solid #E5E7EB;
    border-radius:12px;
    background:linear-gradient(180deg,#fff,#fbfdff);
    cursor:pointer;
  }
  .tf-rail-popular-item:hover { border-color:#CBD5E1; background:#F8FAFC; }
  .tf-rail-popular-btn{
    height:30px;
    border-radius:10px;
    border:1px solid #E5E7EB;
    background:#fff;
    padding:0 10px;
    font-weight:700;
    font-size:12px;
    cursor:pointer;
  }
  .tf-rail-popular-btn:hover{ background:#F8FAFC; border-color:#CBD5E1; }

  @media (max-width: 1200px) {
    .tf-editor { grid-template-columns: 360px minmax(0, 2.2fr) minmax(320px, 1.4fr); }
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
    cartRowBorder: "#E2E7EB",
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

/* ============================== Bibliothèque d'icônes Polaris ============================== */
const ICON_LIBRARY = {
  cartTitle: [
    { value: "CartIcon", label: "Panier" },
    { value: "BagIcon", label: "Sac" },
    { value: "ProductsIcon", label: "Produits" },
    { value: "CheckoutIcon", label: "Checkout" },
    { value: "ReceiptIcon", label: "Reçu" },
    { value: "NoteIcon", label: "Note" },
  ],
  name: [
    { value: "ProfileIcon", label: "Profil" },
    { value: "PersonIcon", label: "Personne" },
    { value: "CustomersIcon", label: "Clients" },
    { value: "PersonIcon", label: "Utilisateur" },
  ],
  phone: [
    { value: "PhoneIcon", label: "Téléphone" },
    { value: "MobileIcon", label: "Mobile" },
    { value: "PhoneIcon", label: "Appel" },
    { value: "ChatIcon", label: "Chat" },
  ],
  quantity: [
    { value: "HashtagIcon", label: "Hashtag" },
    { value: "AddIcon", label: "Plus" },
    { value: "CartIcon", label: "Panier" },
    { value: "NumberIcon", label: "Nombre" },
  ],
  pincode: [
    { value: "LocationIcon", label: "Localisation" },
    { value: "PinIcon", label: "Épingle" },
    { value: "MapPinIcon", label: "Épingle de carte" },
    { value: "HomeIcon", label: "Maison" },
  ],
  email: [
    { value: "EmailIcon", label: "Email" },
    { value: "SendIcon", label: "Envoyer" },
    { value: "EmailIcon", label: "Courrier" },
    { value: "EmailIcon", label: "Enveloppe" },
  ],
  company: [
    { value: "StoreIcon", label: "Magasin" },
    { value: "BuildingIcon", label: "Bâtiment" },
    { value: "BusinessIcon", label: "Business" },
    { value: "BagIcon", label: "Sac" },
  ],
  birthday: [
    { value: "CalendarIcon", label: "Calendrier" },
    { value: "GiftIcon", label: "Cadeau" },
    { value: "CalendarIcon", label: "Date" },
    { value: "GiftIcon", label: "Célébration" },
  ],
  address: [
    { value: "LocationIcon", label: "Localisation" },
    { value: "PinIcon", label: "Épingle" },
    { value: "HomeIcon", label: "Maison" },
    { value: "StoreIcon", label: "Magasin" },
  ],
  city: [
    { value: "GlobeIcon", label: "Globe" },
    { value: "LocationIcon", label: "Localisation" },
    { value: "MapIcon", label: "Carte" },
    { value: "CityIcon", label: "Ville" },
  ],
  province: [
    { value: "GlobeIcon", label: "Globe" },
    { value: "MapIcon", label: "Carte" },
    { value: "LocationIcon", label: "Localisation" },
    { value: "GlobeIcon", label: "Région" },
  ],
  notes: [
    { value: "NoteIcon", label: "Note" },
    { value: "ClipboardIcon", label: "Presse-papier" },
    { value: "DocumentIcon", label: "Document" },
    { value: "TextIcon", label: "Texte" },
  ],
  button: [
    { value: "CartIcon", label: "Panier" },
    { value: "CheckoutIcon", label: "Checkout" },
    { value: "BagIcon", label: "Sac" },
    { value: "TruckIcon", label: "Camion" },
    { value: "CheckCircleIcon", label: "Coche" },
    { value: "ArrowRightIcon", label: "Flèche droite" },
    { value: "SendIcon", label: "Envoyer" },
    { value: "PlayIcon", label: "Play" },
  ],
};

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

/* ============================== Defaults (fields + merge) ============================== */
const DEFAULT_FIELDS = {
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

  // ✅ champs populaires
  email: {
    on: false,
    required: false,
    type: "text",
    label: "Email",
    ph: "your.email@example.com",
    icon: "EmailIcon",
  },
  pincode: {
    on: false,
    required: false,
    type: "text",
    label: "Pincode",
    ph: "Enter pincode",
    icon: "LocationIcon",
  },
  company: {
    on: false,
    required: false,
    type: "text",
    label: "Company",
    ph: "Your company name",
    icon: "StoreIcon",
  },
  birthday: {
    on: false,
    required: false,
    type: "text",
    label: "Birthday",
    ph: "DD/MM/YYYY",
    icon: "CalendarIcon",
  },

  province: {
    on: true,
    required: false,
    type: "text",
    label: "Wilaya / Province",
    ph: "Select province",
    icon: "GlobeIcon",
  },
  city: {
    on: true,
    required: false,
    type: "text",
    label: "City",
    ph: "Select city",
    icon: "LocationIcon",
  },
  address: {
    on: true,
    required: false,
    type: "text",
    label: "Address",
    ph: "Full address",
    icon: "HomeIcon",
  },
  notes: {
    on: true,
    required: false,
    type: "textarea",
    label: "Notes",
    ph: "(optional)",
    icon: "NoteIcon",
  },
};

const DEFAULT_FIELDS_ORDER = Object.keys(DEFAULT_FIELDS);

function mergeFieldsOrder(savedOrder, fieldsObj) {
  const keys = Object.keys(fieldsObj || {});
  const base = Array.isArray(savedOrder) ? savedOrder : [];
  return [
    ...base.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !base.includes(k)),
  ];
}

/* ============================== Contexte ============================== */
const FormsCtx = createContext(null);
const useForms = () => useContext(FormsCtx);

/* ============================== Composant Icon Polaris (FIX: pas d'icône coupée) ============================== */
function isPolarisIconObject(src) {
  return (
    !!src &&
    typeof src === "object" &&
    typeof src.body === "string" &&
    typeof src.viewBox === "string"
  );
}

function PolarisIcon({ iconName, size = 20, color = "currentColor", accessibilityLabel }) {
  const source = getIconSource(iconName);

  if (!source) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #E5E7EB",
          borderRadius: 6,
          color: "#9CA3AF",
          fontSize: Math.max(10, Math.round(size * 0.55)),
          lineHeight: 0,
        }}
        title={`Icon: ${iconName}`}
      >
        ?
      </span>
    );
  }

  // ✅ Render SVG direct pour éviter “moitié / crop”
  if (isPolarisIconObject(source)) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flex: "0 0 auto",
          lineHeight: 0,
        }}
        aria-label={accessibilityLabel || iconName}
        title={accessibilityLabel || iconName}
      >
        <svg
          width={size}
          height={size}
          viewBox={source.viewBox}
          style={{ display: "block", width: "100%", height: "100%" }}
          fill="currentColor"
          dangerouslySetInnerHTML={{ __html: source.body }}
        />
      </span>
    );
  }

  // fallback
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flex: "0 0 auto",
        lineHeight: 0,
      }}
    >
      <Icon source={source} accessibilityLabel={accessibilityLabel || iconName} />
    </span>
  );
}

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
            <Button onClick={onOpenPreview}>{t("section1.header.btnPreview")}</Button>
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

  const locale = rootData?.locale || rootData?.language || rootData?.shopLocale || "en";
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
      fieldsOrder: DEFAULT_FIELDS_ORDER,
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
    fields: { ...DEFAULT_FIELDS },
    cartTitles: {
      top: "Order summary",
      price: "Product price",
      shipping: "Shipping price",
      total: "Total",
      cartIcon: "CartIcon",
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
      const applyMerged = (cleanSettings) => {
        const clean = sanitizeDeep(cleanSettings || {});
        const mergedFields = { ...DEFAULT_FIELDS, ...(clean.fields || {}) };
        const mergedOrder = mergeFieldsOrder(clean?.meta?.fieldsOrder, mergedFields);

        setConfig((prev) => ({
          ...prev,
          ...clean,
          meta: {
            ...(prev.meta || {}),
            ...(clean.meta || {}),
            fieldsOrder: mergedOrder,
          },
          fields: mergedFields,
          behavior: { ...prev.behavior, ...(clean.behavior || {}) },
          form: { ...prev.form, ...(clean.form || {}) },
          design: { ...prev.design, ...(clean.design || {}) },
          cartTitles: { ...prev.cartTitles, ...(clean.cartTitles || {}) },
          uiTitles: { ...prev.uiTitles, ...(clean.uiTitles || {}) },
        }));

        try {
          localStorage.setItem("tripleform_cod_config", JSON.stringify(clean));
        } catch {}
      };

      try {
        const res = await fetch("/api/load-settings");
        if (res.ok) {
          const j = await res.json();
          if (j?.ok && j.settings) {
            if (!cancelled) applyMerged(j.settings);
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
          const parsed = JSON.parse(s);
          applyMerged(parsed);
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

  const setDesign = (p) => setConfig((c) => ({ ...c, design: { ...c.design, ...p } }));
  const setForm = (p) => setConfig((c) => ({ ...c, form: { ...c.form, ...p } }));
  const setBehav = (p) => setConfig((c) => ({ ...c, behavior: { ...c.behavior, ...p } }));
  const setField = (k, p) =>
    setConfig((c) => ({
      ...c,
      fields: { ...c.fields, [k]: { ...(c.fields?.[k] || {}), ...p } },
    }));
  const setCartT = (p) => setConfig((c) => ({ ...c, cartTitles: { ...c.cartTitles, ...p } }));
  const setUiT = (p) => setConfig((c) => ({ ...c, uiTitles: { ...c.uiTitles, ...p } }));
  const setFieldsOrder = (order) =>
    setConfig((c) => ({ ...c, meta: { ...(c.meta || {}), fieldsOrder: order } }));

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
  const fieldAlign = ["left", "center", "right"].includes(fieldAlignRaw) ? fieldAlignRaw : "left";

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
        const msg = j?.errors?.[0]?.message || j?.error || t("section1.save.errorGeneric");
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
            <div style={{ height: 16, background: "#E5E7EB", borderRadius: 999 }} />
            <div style={{ height: 16, background: "#E5E7EB", borderRadius: 999, width: "60%" }} />
            <div style={{ height: 220, background: "#E5E7EB", borderRadius: 16 }} />
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
  const { config, setDesign, setConfig } = useForms();

  const applyPalette = (paletteId) => {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
    if (palette && DESIGN_PRESETS[palette.preset]) {
      setDesign(DESIGN_PRESETS[palette.preset]);
      setConfig((c) => ({ ...c, meta: { ...(c.meta || {}), preset: palette.preset } }));
    }
  };

  return (
    <div className="tf-color-palettes">
      {COLOR_PALETTES.map((palette) => (
        <div
          key={palette.id}
          className={`tf-color-palette ${config.meta?.preset === palette.preset ? "active" : ""}`}
          onClick={() => {
            applyPalette(palette.id);
            onSelect?.(palette.id);
          }}
        >
          <div className="tf-palette-colors">
            {palette.colors.map((color, idx) => (
              <div key={idx} style={{ flex: 1, background: color, height: "100%" }} title={color} />
            ))}
          </div>
          <div className="tf-palette-info">{palette.name}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================== Sélecteur d'icônes Polaris ============================== */
function IconSelector({ fieldKey, type = "field", onSelect, selectedIcon }) {
  const { t } = useForms();

  const icons =
    type === "field"
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
        {icons.map((icon) => (
          <div
            key={icon.value}
            className={`tf-icon-option ${selectedIcon === icon.value ? "selected" : ""}`}
            onClick={() => onSelect(icon.value)}
            title={icon.label}
          >
            <PolarisIcon iconName={icon.value} size={20} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== Éditeur (rail | réglages | preview) ============================== */
function OutletEditor() {
  const { config, setCartT, setForm, setUiT, setField, setDesign, setBehav, setFieldsOrder, t } =
    useForms();
  const [sel, setSel] = useState("cart");

  const keys = Object.keys(config.fields || {});
  const order = useMemo(() => {
    const existing = config.meta?.fieldsOrder || [];
    return [...existing.filter((k) => keys.includes(k)), ...keys.filter((k) => !existing.includes(k))];
  }, [config.meta?.fieldsOrder, keys]);

  useEffect(() => {
    if (JSON.stringify(order) !== JSON.stringify(config.meta?.fieldsOrder || [])) {
      setFieldsOrder(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const tabKeys = ["cart", "titles", "buttons", "colors", "options"];
  const tabs = useMemo(
    () => [
      { id: "tab-cart", content: t("section1.rail.cart"), panelID: "panel-cart" },
      { id: "tab-titles", content: t("section1.rail.titles"), panelID: "panel-titles" },
      { id: "tab-buttons", content: t("section1.rail.buttons"), panelID: "panel-buttons" },
      { id: "tab-colors", content: t("section1.rail.colors"), panelID: "panel-colors" },
      { id: "tab-options", content: t("section1.rail.options"), panelID: "panel-options" },
    ],
    [t]
  );

  const selectedTab = useMemo(() => {
    if (sel === "cart") return 0;
    if (sel === "titles" || sel.startsWith("field:")) return 1;
    if (sel === "buttons") return 2;
    if (sel === "colors") return 3;
    if (sel === "options") return 4;
    return 0;
  }, [sel]);

  // ✅ Countries options (dynamic)
  const countryOptions = useMemo(() => {
    const base = [{ label: t("section1.options.countries.selectPlaceholder"), value: "" }];
    const list = (getCountries?.() || []).map((c) => ({
      label: c.label,
      value: c.code,
    }));
    return [...base, ...list];
  }, [t]);

  const fieldItems = Object.keys(config.fields || {}).map((k) => {
    const field = config.fields[k];
    return {
      key: `field:${k}`,
      label: field?.label || k,
      on: field?.on !== false,
      iconName: field?.icon || "AppsIcon",
    };
  });

  const sortedFieldItems = [...fieldItems].sort((a, b) => {
    const orderA = order.indexOf(a.key.replace("field:", ""));
    const orderB = order.indexOf(b.key.replace("field:", ""));
    return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
  });

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
    const currentOn = st.on !== false;
    setField(k, { on: !currentOn });
  };

  const removeField = (key) => {
    const k = key.replace(/^field:/, "");
    setSel(`field:${k}`);
    if (window.confirm(t("section1.confirmRemoveField"))) {
      setField(k, { on: false });
    }
  };

  const RailIconBtn = ({ iconName, title, onClick, active, danger }) => (
    <button
      className="tf-icon-btn"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        ...(active ? { background: "rgba(16,185,129,0.12)", borderColor: "#10B981" } : {}),
        ...(danger ? { background: "rgba(239,68,68,0.10)", borderColor: "#EF4444" } : {}),
      }}
    >
      <PolarisIcon iconName={iconName} size={14} />
    </button>
  );

  // ✅ 5 champs populaires (rail gauche)
  const POPULAR_FIELDS = [
    { key: "email", label: "Email", icon: "EmailIcon", tpl: DEFAULT_FIELDS.email },
    { key: "pincode", label: "Pincode", icon: "LocationIcon", tpl: DEFAULT_FIELDS.pincode },
    { key: "company", label: "Company", icon: "StoreIcon", tpl: DEFAULT_FIELDS.company },
    { key: "birthday", label: "Birthday", icon: "CalendarIcon", tpl: DEFAULT_FIELDS.birthday },
    { key: "notes", label: "Notes", icon: "NoteIcon", tpl: DEFAULT_FIELDS.notes },
  ];

  const ensurePopularField = (k, tpl) => {
    const exists = !!config.fields?.[k];
    if (!exists) {
      setField(k, { ...tpl, on: true });
      setFieldsOrder([...order, k]);
      setSel(`field:${k}`);
      return;
    }
    setField(k, { on: true });
    if (!order.includes(k)) setFieldsOrder([...order, k]);
    setSel(`field:${k}`);
  };

  return (
    <>
      {/* RAIL GAUCHE */}
      <div className="tf-rail">
        <div className="tf-rail-card">
          <div className="tf-rail-head">{t("section1.rail.fieldsTitle")}</div>
          <div className="tf-rail-list">
            {sortedFieldItems.map((it) => (
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
                <div className="tf-grip tf-rail-icon">
                  <PolarisIcon iconName={it.iconName} size={16} />
                </div>

                <div className="tf-rail-label">{it.label}</div>

                <div className="tf-rail-actions">
                  <RailIconBtn iconName="SettingsIcon" title="Settings" onClick={() => setSel(it.key)} />
                  <RailIconBtn
                    iconName={it.on ? "ViewIcon" : "HideIcon"}
                    title={it.on ? "Hide" : "Show"}
                    active={!!it.on}
                    onClick={() => toggleField(it.key)}
                  />
                  <RailIconBtn iconName="DeleteIcon" title="Remove" danger onClick={() => removeField(it.key)} />
                  <RailIconBtn iconName="ChevronUpIcon" title="Move up" onClick={() => moveField(it.key, -1)} />
                  <RailIconBtn iconName="ChevronDownIcon" title="Move down" onClick={() => moveField(it.key, 1)} />
                </div>
              </div>
            ))}

            {/* Ajouter un champ custom */}
            <div
              className="tf-rail-item"
              style={{
                background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                border: "2px dashed #0ea5e9",
                cursor: "pointer",
              }}
              onClick={() => {
                const newFieldKey = `custom_${Date.now()}`;
                setField(newFieldKey, {
                  on: true,
                  required: false,
                  type: "text",
                  label: t("section1.newFieldLabel"),
                  ph: t("section1.newFieldPlaceholder"),
                  icon: "AddIcon",
                });
                setFieldsOrder([...order, newFieldKey]);
                setSel(`field:${newFieldKey}`);
              }}
            >
              <div className="tf-grip tf-rail-icon">
                <PolarisIcon iconName="AddIcon" size={16} color="#0ea5e9" />
              </div>
              <div className="tf-rail-label" style={{ color: "#0ea5e9" }}>
                {t("section1.addNewField")}
              </div>
              <div className="tf-rail-actions">
                <div style={{ width: 44 }} />
              </div>
            </div>

            {/* ✅ Champs populaires */}
            <div className="tf-rail-subhead">Champs populaires</div>
            <div className="tf-rail-popular">
              {POPULAR_FIELDS.map((f) => {
                const exists = !!config.fields?.[f.key];
                const isOn = exists ? config.fields[f.key]?.on !== false : false;

                return (
                  <div
                    key={f.key}
                    className="tf-rail-popular-item"
                    onClick={() => ensurePopularField(f.key, f.tpl)}
                    title="Cliquer pour ajouter/activer"
                  >
                    <div className="tf-rail-icon">
                      <PolarisIcon iconName={f.icon} size={16} />
                    </div>
                    <div className="tf-rail-label">{f.label}</div>
                    <button
                      className="tf-rail-popular-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        ensurePopularField(f.key, f.tpl);
                      }}
                    >
                      {isOn ? "Réglages" : exists ? "Activer" : "Ajouter"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COLONNE MIDDLE */}
      <div className="tf-right-col">
        <div className="tf-panel">
          <div style={{ marginBottom: 12 }}>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={(idx) => setSel(tabKeys[idx])} fitted />
          </div>

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

          {sel === "colors" && (
            <GroupCard title={t("section1.group.colors.title")}>
              <BlueSection title={t("section1.colors.presets")} defaultOpen>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                  {t("section1.presets.description")}
                </p>
                <ColorPaletteSelector />
              </BlueSection>

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
                      value={config.design.glowPx ?? config.behavior.glowPx ?? 18}
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

          {sel === "options" && (
            <GroupCard title={t("section1.group.options.title")}>
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

              <BlueSection title={t("section1.options.stickyButton")}>
                <Grid3>
                  <Select
                    label={t("section1.options.stickyType")}
                    options={[
                      { label: t("section1.options.sticky.none"), value: "none" },
                      { label: t("section1.options.sticky.bottomBar"), value: "bottom-bar" },
                      { label: t("section1.options.sticky.bubbleRight"), value: "bubble-right" },
                      { label: t("section1.options.sticky.bubbleLeft"), value: "bubble-left" },
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

              {/* ✅ Countries (dynamic) */}
              <BlueSection title={t("section1.options.countries")}>
                <Select
                  label={t("section1.options.countries.storeCountryLabel")}
                  options={countryOptions}
                  value={config.behavior.country || ""}
                  onChange={(v) => {
                    setBehav({ country: v, provinceKey: "", cityKey: "" });
                    const prefix = getPhonePrefixByCountry(v) || "";
                    if (prefix) setField("phone", { prefix });
                  }}
                />
                <p style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
                  {t("section1.options.countries.note")}
                </p>
              </BlueSection>

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

          {sel.startsWith("field:") && <FieldEditor fieldKey={sel.replace(/^field:/, "")} />}
        </div>
      </div>

      {/* PREVIEW RIGHT */}
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

  const titleText = st.label || fieldKey;

  return (
    <GroupCard title={titleText}>
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Checkbox
            label={t("section1.fieldEditor.activeLabel")}
            checked={st.on !== false}
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
            { label: t("section1.fieldEditor.type.text"), value: "text" },
            { label: t("section1.fieldEditor.type.phone"), value: "tel" },
            { label: t("section1.fieldEditor.type.textarea"), value: "textarea" },
            { label: t("section1.fieldEditor.type.number"), value: "number" },
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
              onChange={(v) => setField(fieldKey, { min: Number(v || 0) })}
            />
            <TextField
              type="number"
              label={t("section1.fieldEditor.maxLabel")}
              value={st.max !== undefined && st.max !== null ? String(st.max) : ""}
              onChange={(v) => setField(fieldKey, { max: v === "" ? null : Number(v) })}
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
      <div className="tf-accordion__body" style={{ display: open ? "block" : "none" }}>
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
      <span style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{label}</span>
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
        <TextField label={t("section1.colors.hexLabel")} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

/* ============================== Preview ============================== */
function PreviewPanel() {
  const { config, cardCSS, cartBoxCSS, cartRowCSS, inputBase, btnCSS, setBehav, t } = useForms();

  const [shippingPrice, setShippingPrice] = useState(null);
  const [shippingNote, setShippingNote] = useState("");

  const countryKey = config.behavior.country || "";
  const selectedProvinceKey = config.behavior.provinceKey || "";

  // ✅ Provinces + Cities from dynamic dataset
  const provinces = useMemo(() => getProvinces(countryKey) || [], [countryKey]);
  const cities = useMemo(
    () => getCities(countryKey, selectedProvinceKey) || [],
    [countryKey, selectedProvinceKey]
  );

  const titleAlign = config.design.titleAlign || "left";

  const fieldKeys = Object.keys(config.fields || {});
  const orderedFields = useMemo(() => {
    const existing = config.meta?.fieldsOrder || [];
    return [...existing.filter((k) => fieldKeys.includes(k)), ...fieldKeys.filter((k) => !existing.includes(k))];
  }, [config.meta?.fieldsOrder, fieldKeys]);

  const productPrice = 99.99;
  const currency = getCurrencyByCountry(countryKey);

  const fieldAlignRaw = config.design?.fieldAlign || "left";
  const fieldAlign = ["left", "center", "right"].includes(fieldAlignRaw) ? fieldAlignRaw : "left";

  useEffect(() => {
    setShippingPrice(null);
    setShippingNote("");
  }, [selectedProvinceKey]);

  const handleCityChange = (city) => {
    if (!city) {
      setShippingPrice(null);
      setShippingNote("");
      return;
    }
    const shippingData = getShippingExample(city, countryKey);
    setShippingPrice(shippingData.amount);
    setShippingNote(`${t("section1.preview.shippingTo")} ${city} - ${shippingData.note}`);
  };

  const renderFieldWithIcon = (f, key) => {
    if (!f || f.on === false) return null;
    const isTextarea = f.type === "textarea";

    return (
      <div key={key} className="tf-field-with-icon">
        <div className="tf-field-icon">
          <PolarisIcon iconName={f.icon} size={16} />
        </div>
        <label style={{ display: "grid", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 13, color: "#475569", textAlign: fieldAlign }}>
            {sStr(f.label)}
            {f.required ? " *" : ""}
          </span>

          {isTextarea ? (
            <textarea
              style={{ ...inputBase, padding: "10px 12px", minHeight: 80 }}
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
                  style={{ ...inputBase, textAlign: "center", padding: "10px 12px" }}
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
    const shippingDisplay =
      shippingPrice === null
        ? countryKey
          ? t("section1.preview.shippingToCalculate")
          : "Gratuit"
        : `${shippingPrice.toFixed(2)} ${currency}`;

    const total = productPrice + (shippingPrice || 0);

    return (
      <div style={cartBoxCSS} dir={config.design.direction || "ltr"}>
        <div className="tf-cart-with-icon">
          <div className="tf-cart-icon">
            <PolarisIcon iconName={config.cartTitles.cartIcon} size={18} />
          </div>
          <div style={{ fontWeight: 700, color: config.design.cartTitleColor }}>
            {sStr(config.cartTitles.top)}
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={cartRowCSS}>
            <div>{sStr(config.cartTitles.price)}</div>
            <div style={{ fontWeight: 700 }}>
              {productPrice.toFixed(2)} {currency}
            </div>
          </div>

          <div style={cartRowCSS}>
            <div>
              <div>{sStr(config.cartTitles.shipping)}</div>
              {shippingNote && (
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{shippingNote}</div>
              )}
            </div>
            <div style={{ fontWeight: 700 }}>{shippingDisplay}</div>
          </div>

          <div style={cartRowCSS}>
            <div>{sStr(config.cartTitles.total)}</div>
            <div style={{ fontWeight: 700 }}>
              {total.toFixed(2)} {currency}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProvinceField = (f) => {
    if (!f || f.on === false) return null;

    return (
      <div key="province" className="tf-field-with-icon">
        <div className="tf-field-icon">
          <PolarisIcon iconName={f.icon} size={16} />
        </div>
        <label style={{ display: "grid", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 13, color: "#475569", textAlign: fieldAlign }}>
            {sStr(f.label)}
            {f.required ? " *" : ""}
          </span>
          <select
            style={{ ...inputBase, padding: "10px 12px", background: config.design.inputBg }}
            value={selectedProvinceKey}
            onChange={(e) => setBehav({ provinceKey: e.target.value, cityKey: "" })}
          >
            <option value="">{f.ph || t("section1.preview.provincePlaceholder")}</option>
            {(provinces || []).map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  const renderCityField = (f) => {
    if (!f || f.on === false) return null;

    return (
      <div key="city" className="tf-field-with-icon">
        <div className="tf-field-icon">
          <PolarisIcon iconName={f.icon} size={16} />
        </div>
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
            {(cities || []).map((c) => (
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

    return (
      <div style={cardCSS} dir={config.design.direction || "ltr"}>
        {(config.form.title || config.form.subtitle) && (
          <div style={{ marginBottom: 10, textAlign: titleAlign }}>
            {config.form.title && <div style={{ fontWeight: 700 }}>{sStr(config.form.title)}</div>}
            {config.form.subtitle && <div style={{ opacity: 0.8 }}>{sStr(config.form.subtitle)}</div>}
          </div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {orderedFields.map((key) => {
            const f = config.fields[key];
            if (!f || f.on === false) return null;
            if (key === "province") return renderProvinceField(f);
            if (key === "city") return renderCityField(f);
            return renderFieldWithIcon(f, key);
          })}

          {config.behavior.requireGDPR && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#374151" }}>
              <input type="checkbox" /> {sStr(config.behavior.gdprLabel)}
            </label>
          )}
          {config.behavior.whatsappOptIn && (
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#374151" }}>
              <input type="checkbox" /> {sStr(config.behavior.whatsappLabel)}
            </label>
          )}

          <button type="button" style={btnCSS} className="tf-btn-with-icon">
            <span className="tf-btn-icon">
              <PolarisIcon iconName={config.form.buttonIcon} size={18} color={config.design.btnText} />
            </span>
            <span style={{ flex: 1, textAlign: "center" }}>
              {orderLabel} · {suffix} {total.toFixed(2)} {currency}
            </span>
          </button>
        </div>
      </div>
    );
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
      </BlockStack>
    </Card>
  );
}

// ============================== Export ==============================
export default Section1FormsLayoutInner;
