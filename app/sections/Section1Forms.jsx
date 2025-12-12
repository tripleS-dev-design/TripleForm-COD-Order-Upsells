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

/* ============================== Presets ============================== */
const PRESETS = {
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
};

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
  DZ: {
    label: "Algérie",
    provinces: {
      ALGER: { label: "Alger", cities: ["Alger Centre", "Bab El Oued", "El Harrach", "Kouba", "Hussein Dey", "Bordj El Kiffan", "Dar El Beïda", "Bouzaréah", "Birkhadem", "Chéraga"] },
      ORAN: { label: "Oran", cities: ["Oran", "Es-Sénia", "Bir El Djir", "Gdyel", "Aïn El Turck", "Arzew", "Mers El Kébir", "Boutlelis", "Oued Tlelat"] },
      CONSTANTINE: { label: "Constantine", cities: ["Constantine", "El Khroub", "Hamma Bouziane", "Aïn Smara", "Zighoud Youcef", "Didouche Mourad", "Ibn Ziad"] },
      TIZI_OUZOU: { label: "Tizi Ouzou", cities: ["Tizi Ouzou", "Azazga", "Draâ Ben Khedda", "Ouaguenoun", "Larbaâ Nath Irathen", "Mekla", "Boghni", "Freha"] },
      BLIDA: { label: "Blida", cities: ["Blida", "Boufarik", "El Affroun", "Mouzaïa", "Ouled Yaïch", "Beni Mered", "Bouinan", "Soumaa"] },
      SETIF: { label: "Sétif", cities: ["Sétif", "El Eulma", "Aïn Oulmene", "Bougaa", "Aïn Azel", "Amoucha", "Béni Aziz", "Guellal"] },
    }
  },
  MA: {
    label: "Maroc",
    provinces: {
      CASABLANCA: { label: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia", "Settat", "Berrechid", "Médiouna", "El Jadida", "Benslimane", "Sidi Bennour", "Nouaceur", "Loulad"] },
      RABAT: { label: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Sidi Slimane", "Sidi Kacem", "Khémisset", "Tiflet"] },
      TANGER: { label: "Tanger-Tétouan-Al Hoceïma", cities: ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Martil", "Fnideq", "M'diq", "Chefchaouen", "Ouazzane"] },
      MARRAKECH: { label: "Marrakech-Safi", cities: ["Marrakech", "Safi", "Chichaoua", "El Jadida", "Essaouira", "Youssoufia", "Rehamna", "El Kelâa des Sraghna", "Sidi Bennour"] },
      FES: { label: "Fès-Meknès", cities: ["Fès", "Meknès", "Ifrane", "Taza", "Sefrou", "Boulemane", "Taounate", "Guelmim"] },
      ORIENTAL: { label: "Région de l'Oriental", cities: ["Oujda", "Nador", "Berkane", "Taourirt", "Jerada", "Figuig", "Bouarfa", "Ahfir"] },
    }
  },
  TN: {
    label: "Tunisie",
    provinces: {
      TUNIS: { label: "Tunis", cities: ["Tunis", "La Marsa", "Carthage", "Le Bardo", "Le Kram", "Sidi Bou Said", "Menzah", "Ariana", "El Menzah"] },
      ARIANA: { label: "Ariana", cities: ["Ariana", "Raoued", "La Soukra", "Kalaat El Andalous", "Sidi Thabet", "Ettadhamen", "Mnihla"] },
      BEN_AROUS: { label: "Ben Arous", cities: ["Ben Arous", "Ezzahra", "Rades", "Mégrine", "Hammam Lif", "Mornag", "Fouchana", "Khalidia"] },
      SFAX: { label: "Sfax", cities: ["Sfax", "El Ain", "Agareb", "Mahres", "Sakiet Eddaïer", "Sakiet Ezzit", "Ghraiba", "Bir Ali Ben Khalifa"] },
      SOUSSE: { label: "Sousse", cities: ["Sousse", "Hammam Sousse", "Kalaa Kebira", "Kalaa Sghira", "Akouda", "M'saken", "Enfidha", "Bouficha"] },
      BIZERTE: { label: "Bizerte", cities: ["Bizerte", "Menzel Jemil", "Mateur", "Sejnane", "Ghar El Melh", "Ras Jebel", "Menzel Abderrahmane", "El Alia"] },
    }
  },
  FR: {
    label: "France",
    provinces: {
      IDF: { label: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre", "Créteil", "Bobigny", "Montreuil", "Argenteuil", "Courbevoic"] },
      PACA: { label: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Avignon", "Aix-en-Provence", "Antibes", "Cannes", "La Seyne-sur-Mer", "Hyères", "Arles"] },
      ARA: { label: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Annecy", "Clermont-Ferrand", "Villeurbanne", "Valence", "Chambéry", "Roanne", "Bourg-en-Bresse"] },
      OCCITANIE: { label: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban", "Narbonne", "Carcassonne", "Albi", "Sète"] },
      HDF: { label: "Hauts-de-France", cities: ["Lille", "Amiens", "Roubaix", "Dunkerque", "Tourcoing", "Calais", "Villeneuve-d'Ascq", "Valenciennes", "Boulogne-sur-Mer", "Arras"] },
    }
  },
  ES: {
    label: "España",
    provinces: {
      MADRID: { label: "Comunidad de Madrid", cities: ["Madrid", "Alcalá de Henares", "Getafe", "Leganés", "Móstoles", "Fuenlabrada", "Alcorcón", "Parla", "Torrejón de Ardoz", "Coslada"] },
      CATALUNYA: { label: "Cataluña", cities: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Tarragona", "Sabadell", "Lleida", "Mataró", "Santa Coloma de Gramenet", "Reus", "Girona"] },
      ANDALUCIA: { label: "Andalucía", cities: ["Sevilla", "Málaga", "Granada", "Córdoba", "Jerez de la Frontera", "Almería", "Huelva", "Marbella", "Dos Hermanas", "Algeciras"] },
      VALENCIA: { label: "Comunidad Valenciana", cities: ["Valencia", "Alicante", "Castellón de la Plana", "Elche", "Torrevieja", "Orihuela", "Gandia", "Benidorm", "Paterna", "Sagunto"] },
    }
  },
  SA: {
    label: "Arabie Saoudite",
    provinces: {
      RIYADH: { label: "Riyadh", cities: ["Riyadh", "Al Kharj", "Al Majma'ah", "Dhurma", "Al Duwadimi", "Al Quway'iyah", "Al Muzahmiyah", "Wadi ad-Dawasir", "Al Hariq", "Al Sulayyil"] },
      MAKKAH: { label: "Makkah", cities: ["Makkah", "Jeddah", "Taif", "Al Qunfudhah", "Al Lith", "Al Jumum", "Khulais", "Rabigh", "Turubah", "Al Kamel"] },
      MADINAH: { label: "Madinah", cities: ["Madinah", "Yanbu", "Al Ula", "Badr", "Mahd adh Dhahab", "Al Hinakiyah", "Wadi al-Fara'", "Al-Mahd"] },
      EASTERN: { label: "Eastern Province", cities: ["Dammam", "Khobar", "Dhahran", "Jubail", "Qatif", "Hafr al-Batin", "Al Khafji", "Ras Tanura", "Abqaiq", "Al-'Udayd"] },
    }
  },
  AE: {
    label: "Émirats Arabes Unis",
    provinces: {
      DUBAI: { label: "Dubai", cities: ["Dubai", "Jebel Ali", "Hatta", "Al Awir", "Al Lusayli", "Margham", "Al Khawaneej", "Al Qusais", "Al Barsha", "Al Warqaa"] },
      ABU_DHABI: { label: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain", "Madinat Zayed", "Gharbia", "Liwa Oasis", "Al Ruwais", "Al Mirfa", "Al Dhafra", "Al Samha", "Al Shawamekh"] },
      SHARJAH: { label: "Sharjah", cities: ["Sharjah", "Khor Fakkan", "Kalba", "Dhaid", "Al Dhaid", "Al Hamriyah", "Al Madam", "Al Batayeh", "Al Sajaa", "Al Ghail"] },
    }
  },
  EG: {
    label: "Égypte",
    provinces: {
      CAIRO: { label: "Le Caire", cities: ["Le Caire", "Nasr City", "Heliopolis", "Maadi", "Zamalek", "Dokki", "Giza", "Shubra", "Al Haram", "Al Mohandessin"] },
      ALEX: { label: "Alexandrie", cities: ["Alexandrie", "Borg El Arab", "Abu Qir", "Al Amriya", "Al Agamy", "Montaza", "Al Mansheya", "Al Labban", "Kafr Abdo", "Sidi Gaber"] },
      GIZA: { label: "Gizeh", cities: ["Gizeh", "Sheikh Zayed City", "6th of October", "Al Haram", "Al Badrasheen", "Al Ayat", "Al Wahat Al Bahariya", "Al Saff", "Atfih", "Al Ayyat"] },
    }
  },
  AR: {
    label: "Argentina",
    provinces: {
      BUENOS_AIRES: { label: "Buenos Aires", cities: ["Buenos Aires", "La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Lanús", "Morón", "San Isidro", "Lomas de Zamora", "Temperley"] },
      CORDOBA: { label: "Córdoba", cities: ["Córdoba", "Villa María", "Río Cuarto", "Alta Gracia", "San Francisco", "Villa Carlos Paz", "Río Tercero", "Jesús María", "Bell Ville", "La Falda"] },
      SANTA_FE: { label: "Santa Fe", cities: ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto", "San Lorenzo", "Villa Gobernador Gálvez", "Reconquista", "Santo Tomé", "Esperanza", "Granadero Baigorria"] },
    }
  },
  AU: {
    label: "Australia",
    provinces: {
      NSW: { label: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Wagga Wagga", "Albury", "Tamworth", "Orange", "Dubbo", "Nowra"] },
      VIC: { label: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Mildura", "Warrnambool", "Sunbury", "Traralgon", "Wangaratta"] },
      QLD: { label: "Queensland", cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Cairns", "Townsville", "Toowoomba", "Mackay", "Rockhampton", "Bundaberg", "Hervey Bay"] },
    }
  },
  BH: {
    label: "Bahrain",
    provinces: {
      CAPITAL: { label: "Capital", cities: ["Manama", "Juffair", "Seef", "Adliya", "Muharraq", "Hidd", "Amwaj Islands", "Diplomatic Area", "Bu Ghazal", "Jid Ali"] },
      MUHARRAQ: { label: "Muharraq", cities: ["Muharraq", "Arad", "Busayteen", "Hidd", "Halat Bu Maher", "Samaheej", "Galali", "Al Dair", "Al Qalali", "Al Sayh"] },
    }
  },
  BD: {
    label: "Bangladesh",
    provinces: {
      DHAKA: { label: "Dhaka Division", cities: ["Dhaka", "Narayanganj", "Gazipur", "Savar", "Tangail", "Narsingdi", "Kishoreganj", "Manikganj", "Munshiganj", "Rajbari"] },
      CHITTAGONG: { label: "Chittagong Division", cities: ["Chittagong", "Cox's Bazar", "Comilla", "Brahmanbaria", "Noakhali", "Feni", "Khagrachhari", "Rangamati", "Bandarban", "Lakshmipur"] },
    }
  },
  BE: {
    label: "Belgium",
    provinces: {
      BRUSSELS: { label: "Brussels-Capital", cities: ["Brussels", "Schaerbeek", "Anderlecht", "Molenbeek-Saint-Jean", "Ixelles", "Uccle", "Woluwe-Saint-Lambert", "Forest", "Saint-Gilles", "Jette"] },
      FLANDERS: { label: "Flanders", cities: ["Antwerp", "Ghent", "Bruges", "Leuven", "Mechelen", "Aalst", "Kortrijk", "Hasselt", "Ostend", "Genk"] },
    }
  },
  BO: {
    label: "Bolivia",
    provinces: {
      LA_PAZ: { label: "La Paz", cities: ["La Paz", "El Alto", "Viacha", "Caranavi", "Achacachi", "Patacamaya", "Coroico", "Sorata", "Copacabana", "Guanay"] },
      SANTA_CRUZ: { label: "Santa Cruz", cities: ["Santa Cruz de la Sierra", "Montero", "Warnes", "La Guardia", "San Ignacio de Velasco", "Cotoca", "Camiri", "Puerto Suárez", "Yapacaní", "Portachuelo"] },
    }
  },
  // ... (continuer avec les autres 51 pays)
};

const PHONE_PREFIX_BY_COUNTRY = {
  DZ: "+213", MA: "+212", TN: "+216", FR: "+33", ES: "+34", SA: "+966", AE: "+971", EG: "+20",
  AR: "+54", AU: "+61", BH: "+973", BD: "+880", BE: "+32", BO: "+591",
  // ... (ajouter les autres préfixes)
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
      version: 1,
      preset: "CleanWhite",
      fieldsOrder: ["name", "phone", "quantity", "address", "city", "province", "notes"],
    },
    form: {
      style: "inline",
      title: "Order form",
      subtitle: "Please enter your contact information",
      buttonText: "Order now",
      successText: "Thanks! We'll contact you",
    },
    design: {
      ...PRESETS.CleanWhite,
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
      },
      phone: {
        on: true,
        required: true,
        type: "tel",
        label: "Phone (WhatsApp)",
        ph: "Phone number",
        prefix: "+212",
      },
      quantity: {
        on: true,
        required: true,
        type: "number",
        label: "Quantity",
        ph: "1",
        min: 1,
        max: 10,
      },
      province: {
        on: true,
        required: false,
        type: "text",
        label: "Wilaya / Province",
        ph: "Select province",
      },
      city: {
        on: true,
        required: false,
        type: "text",
        label: "City",
        ph: "Select city",
      },
      address: {
        on: false,
        required: false,
        type: "text",
        label: "Address",
        ph: "Full address",
      },
      notes: {
        on: false,
        required: false,
        type: "textarea",
        label: "Notes",
        ph: "(optional)",
      },
    },
    cartTitles: {
      top: "Order summary",
      price: "Product price",
      shipping: "Shipping price",
      total: "Total",
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
      padding: "10px 12px",
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
    { key: "colors", label: t("section1.rail.colors"), icon: "WandIcon" },
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
              </Grid2>
            </GroupCard>
          )}

          {/* 4) Couleurs & layout */}
          {sel === "colors" && (
            <GroupCard title={t("section1.group.colors.title")}>
              <BlueSection title={t("section1.colors.formSection")} defaultOpen>
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
              <BlueSection title={t("section1.options.behavior")}>
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
                  <TextField
                    type="number"
                    label={t("section1.options.openDelayMs")}
                    value={String(config.behavior.openDelayMs ?? 0)}
                    onChange={(v) =>
                      setBehav({ openDelayMs: Number(v || 0) })
                    }
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

              <BlueSection title={t("section1.options.drawer")}>
                <Grid3>
                  <Select
                    label={t("section1.options.drawerDirection")}
                    options={[
                      {
                        label: t("section1.options.drawerDirection.right"),
                        value: "right",
                      },
                      {
                        label: t("section1.options.drawerDirection.left"),
                        value: "left",
                      },
                    ]}
                    value={config.behavior.drawerDirection || "right"}
                    onChange={(v) => setBehav({ drawerDirection: v })}
                  />
                  <Select
                    label={t("section1.options.drawerSize")}
                    options={[
                      { label: "Small", value: "sm" },
                      { label: "Medium", value: "md" },
                      { label: "Large", value: "lg" },
                    ]}
                    value={config.behavior.drawerSize || "md"}
                    onChange={(v) => setBehav({ drawerSize: v })}
                  />
                  <ColorField
                    label={t("section1.options.overlayColor")}
                    value={config.behavior.overlayColor || "#020617"}
                    onChange={(v) => setBehav({ overlayColor: v })}
                  />
                  <RangeSlider
                    label={t("section1.options.overlayOpacity")}
                    value={config.behavior.overlayOpacity ?? 70}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(v) => setBehav({ overlayOpacity: v })}
                  />
                </Grid3>
              </BlueSection>

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
                </Grid3>
              </BlueSection>

              {/* === Pays COD === */}
              <BlueSection
                title={t("section1.options.countries")}
                defaultOpen
              >
                <Select
                  label={t("section1.options.countries.storeCountryLabel")}
                  options={[
                    {
                      label: t("section1.options.countries.selectPlaceholder"),
                      value: "",
                    },
                    { label: "Algérie", value: "DZ" },
                    { label: "Maroc", value: "MA" },
                    { label: "Tunisie", value: "TN" },
                    { label: "France", value: "FR" },
                    { label: "España", value: "ES" },
                    { label: "Arabie Saoudite", value: "SA" },
                    { label: "Émirats Arabes Unis", value: "AE" },
                    { label: "Égypte", value: "EG" },
                    { label: "Argentina", value: "AR" },
                    { label: "Australia", value: "AU" },
                    { label: "Bahrain", value: "BH" },
                    { label: "Bangladesh", value: "BD" },
                    { label: "Belgium", value: "BE" },
                    { label: "Bolivia", value: "BO" },
                    { label: "Cameroon", value: "CM" },
                    { label: "Canada", value: "CA" },
                    { label: "Chile", value: "CL" },
                    { label: "Colombia", value: "CO" },
                    { label: "Costa Rica", value: "CR" },
                    { label: "Cuba", value: "CU" },
                    { label: "Côte d'Ivoire", value: "CI" },
                    { label: "Democratic Republic of the Congo", value: "CD" },
                    { label: "Dominican Republic", value: "DO" },
                    { label: "Ecuador", value: "EC" },
                    { label: "El Salvador", value: "SV" },
                    { label: "Ghana", value: "GH" },
                    { label: "Guatemala", value: "GT" },
                    { label: "Haiti", value: "HT" },
                    { label: "Honduras", value: "HN" },
                    { label: "India", value: "IN" },
                    { label: "Iraq", value: "IQ" },
                    { label: "Ireland", value: "IE" },
                    { label: "Jordan", value: "JO" },
                    { label: "Kuwait", value: "KW" },
                    { label: "Lebanon", value: "LB" },
                    { label: "Libya", value: "LY" },
                    { label: "Luxembourg", value: "LU" },
                    { label: "Malaysia", value: "MY" },
                    { label: "Mexico", value: "MX" },
                    { label: "New Zealand", value: "NZ" },
                    { label: "Nicaragua", value: "NI" },
                    { label: "Nigeria", value: "NG" },
                    { label: "Oman", value: "OM" },
                    { label: "Pakistan", value: "PK" },
                    { label: "Palestine", value: "PS" },
                    { label: "Panama", value: "PA" },
                    { label: "Paraguay", value: "PY" },
                    { label: "Peru", value: "PE" },
                    { label: "Philippines", value: "PH" },
                    { label: "Qatar", value: "QA" },
                    { label: "Saudi Arabia", value: "SA" },
                    { label: "Senegal", value: "SN" },
                    { label: "Singapore", value: "SG" },
                    { label: "South Africa", value: "ZA" },
                    { label: "Spain", value: "ES" },
                    { label: "Switzerland", value: "CH" },
                    { label: "Tunisia", value: "TN" },
                    { label: "United Arab Emirates", value: "AE" },
                    { label: "United Kingdom", value: "GB" },
                    { label: "United States", value: "US" },
                    { label: "Uruguay", value: "UY" },
                    { label: "Venezuela", value: "VE" },
                    { label: "Yemen", value: "YE" },
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

  const examplePrice = t("section1.preview.priceExample");
  const freeShipping = t("section1.preview.freeShipping");

  const fieldAlignRaw = config.design?.fieldAlign || "left";
  const fieldAlign = ["left", "center", "right"].includes(fieldAlignRaw)
    ? fieldAlignRaw
    : "left";

  const renderCartBox = () => (
    <div style={cartBoxCSS} dir={config.design.direction || "ltr"}>
      <div
        style={{
          textAlign: titleAlign,
          fontWeight: 700,
          marginBottom: 10,
          color: config.design.cartTitleColor,
        }}
      >
        {sStr(config.cartTitles.top)}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.price)}</div>
          <div style={{ fontWeight: 700 }}>{examplePrice}</div>
        </div>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.shipping)}</div>
          <div style={{ fontWeight: 700 }}>{freeShipping}</div>
        </div>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.total)}</div>
          <div style={{ fontWeight: 700 }}>{examplePrice}</div>
        </div>
      </div>
    </div>
  );

  const renderProvinceField = (f) => {
    if (!f?.on) return null;
    const labelEl = (
      <span
        style={{
          fontSize: 13,
          color: "#475569",
          textAlign: fieldAlign,
          display: "block",
        }}
      >
        {sStr(f.label)}
        {f.required ? " *" : ""}
      </span>
    );

    const placeholder = f.ph || t("section1.preview.provincePlaceholder");

    return (
      <label key="province" style={{ display: "grid", gap: 6 }}>
        {labelEl}
        <select
          style={inputBase}
          value={selectedProvinceKey}
          onChange={(e) => {
            const v = e.target.value;
            setBehav({ provinceKey: v, cityKey: "" });
          }}
        >
          <option value="">{placeholder}</option>
          {provincesEntries.map(([key, p]) => (
            <option key={key} value={key}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
    );
  };

  const renderCityField = (f) => {
    if (!f?.on) return null;
    const labelEl = (
      <span
        style={{
          fontSize: 13,
          color: "#475569",
          textAlign: fieldAlign,
          display: "block",
        }}
      >
        {sStr(f.label)}
        {f.required ? " *" : ""}
      </span>
    );

    const placeholder = !selectedProvinceKey
      ? t("section1.preview.cityPlaceholderNoProvince")
      : f.ph || t("section1.preview.cityPlaceholder");

    const hasProvince = !!selectedProvinceKey;

    return (
      <label key="city" style={{ display: "grid", gap: 6 }}>
        {labelEl}
        <select
          style={{
            ...inputBase,
            backgroundColor: hasProvince ? inputBase.background : "#F3F4F6",
          }}
          value={config.behavior.cityKey || ""}
          onChange={(e) => setBehav({ cityKey: e.target.value })}
          disabled={!hasProvince}
        >
          <option value="">{placeholder}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    );
  };

  const renderFormCard = () => (
    <div style={cardCSS} dir={config.design.direction || "ltr"}>
      {(config.form.title || config.form.subtitle) && (
        <div style={{ marginBottom: 10 }}>
          {config.form.title && (
            <div
              style={{
                fontWeight: 700,
                textAlign: titleAlign,
              }}
            >
              {sStr(config.form.title)}
            </div>
          )}
          {config.form.subtitle && (
            <div
              style={{
                opacity: 0.8,
                textAlign: titleAlign,
              }}
            >
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
          return renderField(f, inputBase, key);
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

        <button type="button" style={btnCSS}>
          {sStr(config.uiTitles.orderNow)} · {sStr(config.uiTitles.totalSuffix)}{" "}
          {examplePrice}
        </button>
      </div>
    </div>
  );

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

function StickyPreview() {
  const { config, btnCSS, t } = useForms();
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
        <button type="button" style={miniBtnStyle}>
          {label}
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
          >
            {label}
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
}

function renderField(f, inputBase, key) {
  if (!f?.on) return null;
  const labelEl = (
    <span
      style={{
        fontSize: 13,
        color: "#475569",
        textAlign: inputBase.textAlign || "left",
        display: "block",
      }}
    >
      {sStr(f.label)}
      {f.required ? " *" : ""}
    </span>
  );
  const common = { style: inputBase, placeholder: sStr(f.ph) };
  return (
    <label key={key} style={{ display: "grid", gap: 6 }}>
      {labelEl}
      {f.type === "textarea" ? (
        <textarea {...common} rows={3} />
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
              }}
              value={f.prefix}
              readOnly
            />
          )}
          <input type="tel" {...common} />
        </div>
      ) : (
        <input
          type={f.type === "number" ? "number" : "text"}
          {...common}
          min={f.type === "number" && f.min != null ? f.min : undefined}
          max={f.type === "number" && f.max != null ? f.max : undefined}
        />
      )}
    </label>
  );
}

// ============================== Export ==============================
export default Section1FormsLayoutInner;