// ===== File: app/sections/Section6Geo.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Badge,
  Divider,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useI18n } from "../i18n/react";
import CountryFlagsBar from "../components/CountryFlagsBar";

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= i18n wrapper ======================= */
function useT() {
  const { t } = useI18n();

  const tr = (key, fallback, vars) => {
    try {
      const v = t(key, vars);
      if (typeof v === "string" && v.trim() && v !== key) return v;
    } catch {}
    return fallback || key;
  };

  return { t, tr };
}

/* ======================= CSS / layout (NO backticks) ======================= */
const LAYOUT_CSS = [
  "html, body { margin:0; background:#F6F7F9; }",
  ".Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }",
  ".Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }",

  "/* ✅ HEADER (same spirit as other sections) */",
  ".tf-header{ background:linear-gradient(90deg,#0B3B82,#7D0031); padding:6px 10px; position:sticky; top:0; z-index:60; box-shadow:0 10px 28px rgba(11,59,130,0.45); }",
  ".tf-header-row{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; min-height:44px; }",
  ".tf-brand{ display:flex; align-items:center; gap:10px; min-width:0; }",
  ".tf-brand-text{ display:flex; flex-direction:column; min-width:0; line-height:1.05; }",
  ".tf-brand-title{ font-weight:950; color:#F9FAFB; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
  ".tf-brand-sub{ font-size:11px; color:rgba(249,250,251,0.78); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
  ".tf-flags-wrap{ display:flex; justify-content:center; align-items:center; width:100%; min-width:0; }",
  ".tf-header-right{ display:flex; align-items:center; justify-content:flex-end; gap:10px; min-width:0; flex-wrap:wrap; }",

  "/* ✅ Slim SaveBar */",
  ".tf-savebar{ position:sticky; top:56px; z-index:55; padding:8px 10px; background:rgba(255,255,255,0.86); backdrop-filter: blur(10px); border-bottom:1px solid #E5E7EB; }",
  ".tf-savebar-inner{ max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border-radius:14px; border:1px solid #E5E7EB; box-shadow:0 10px 24px rgba(15,23,42,.06); }",
  ".tf-savebar-left{ display:flex; align-items:center; gap:10px; min-width:0; }",
  ".tf-savebadge{ font-size:12px; font-weight:900; padding:6px 10px; border-radius:999px; border:1px solid #E5E7EB; background:#F8FAFC; white-space:nowrap; }",
  ".tf-savebar-text{ display:flex; flex-direction:column; min-width:0; line-height:1.15; }",
  ".tf-savemsg{ font-size:13px; font-weight:800; color:#0F172A; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
  ".tf-savesub{ font-size:12px; color:#64748B; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",

  "@keyframes tfBarBlink { 0%,100%{filter:none} 50%{filter:brightness(1.15)} }",
  "@keyframes tfBarSlide { 0%{transform:translateX(0)} 50%{transform:translateX(10px)} 100%{transform:translateX(0)} }",
  ".tf-attention{ animation: tfBarBlink .9s ease-in-out 2, tfBarSlide .9s ease-in-out 2; border-color:rgba(249,115,22,.70)!important; box-shadow:0 10px 24px rgba(249,115,22,.18); }",

  ".tf-shell{ padding:16px; }",

  "/* ===== Grille: nav gauche | contenu centre | guide droite ===== */",
  ".tf-editor{ display:grid; grid-template-columns: 260px minmax(0,1fr) 320px; gap:16px; align-items:start; }",

  "/* rail gauche */",
  ".tf-rail{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow:auto; }",
  ".tf-rail-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:12px; }",
  ".tf-rail-head{ padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:800; }",
  ".tf-rail-list{ padding:8px; display:grid; gap:8px; }",
  ".tf-rail-item{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:10px 12px; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:space-between; gap:10px; }",
  ".tf-rail-item[data-sel='1']{ outline:2px solid #00A7A3; background:rgba(0,167,163,0.06); }",

  "/* centre */",
  ".tf-main-col{ display:grid; gap:16px; min-width:0; }",
  ".tf-panel{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; min-width:0; box-shadow:0 8px 24px rgba(15,23,42,0.04); }",

  "/* droite */",
  ".tf-side-col{ position:sticky; top:116px; max-height:calc(100vh - 132px); overflow-y:auto; overflow-x:hidden; width:320px; flex:none; }",
  ".tf-side-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; margin-bottom:12px; }",

  "/* TITRES */",
  ".tf-group-title{ padding:10px 12px; background:linear-gradient(90deg,#0B3B82,#7D0031); border:1px solid rgba(0,167,163,0.85); color:#F9FAFB; border-radius:10px; font-weight:900; letter-spacing:.2px; margin-bottom:10px; box-shadow:0 6px 18px rgba(11,59,130,0.35); }",
  ".row-card{ border:1px solid #E5E7EB; border-radius:10px; padding:10px; background:#FFF; }",
  ".tf-guide-text p{ font-size:13px; line-height:1.5; margin:0 0 6px 0; white-space:normal; }",

  "@media (max-width: 980px) {",
  "  .tf-editor { grid-template-columns: 1fr; }",
  "  .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }",
  "  .tf-brand-sub{ display:none; }",
  "  .tf-flags-wrap{ display:none; }",
  "}",
].join("\n");

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-geo-css")) return;
    const s = document.createElement("style");
    s.id = "tf-geo-css";
    s.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(s);
  }, []);
}

/* ======================= Catalogue pays / wilayas / villes ======================= */
/* (نفس data ديالك، خليتها كما هي) */
const COUNTRY_DATA = {
  MA: {
    label: "Maroc",
    provinces: {
      CASABLANCA: {
        label: "Casablanca-Settat",
        cities: [
          "Casablanca",
          "Mohammedia",
          "Settat",
          "Berrechid",
          "El Jadida",
          "Benslimane",
          "Nouaceur",
          "Médiouna",
          "Sidi Bennour",
          "Dar Bouazza",
          "Lahraouyine",
          "Had Soualem",
          "Sidi Rahal",
          "Oulad Abbou",
        ],
      },
      RABAT: {
        label: "Rabat-Salé-Kénitra",
        cities: [
          "Rabat",
          "Salé",
          "Kénitra",
          "Témara",
          "Skhirat",
          "Khémisset",
          "Sidi Slimane",
          "Sidi Kacem",
          "Tiflet",
          "Ain Aouda",
          "Harhoura",
          "Sidi Yahya Zaer",
          "Oulmès",
          "Sidi Allal El Bahraoui",
        ],
      },
      TANGER: {
        label: "Tanger-Tétouan-Al Hoceïma",
        cities: [
          "Tanger",
          "Tétouan",
          "Al Hoceïma",
          "Larache",
          "Chefchaouen",
          "Ouazzane",
          "Fnideq",
          "M'diq",
          "Martil",
          "Ksar El Kebir",
          "Asilah",
          "Bni Bouayach",
          "Imzouren",
          "Bni Hadifa",
        ],
      },
      MARRAKECH: {
        label: "Marrakech-Safi",
        cities: [
          "Marrakech",
          "Safi",
          "El Kelâa des Sraghna",
          "Essaouira",
          "Rehamna",
          "Youssoufia",
          "Chichaoua",
          "Al Haouz",
          "Rhamna",
          "Benguerir",
          "Sidi Bennour",
          "Smimou",
          "Tamanar",
          "Imintanoute",
        ],
      },
      FES: {
        label: "Fès-Meknès",
        cities: [
          "Fès",
          "Meknès",
          "Ifrane",
          "Taza",
          "Sefrou",
          "Boulemane",
          "Taounate",
          "Guercif",
          "Moulay Yacoub",
          "El Hajeb",
          "Moulay Idriss Zerhoun",
          "Ouazzane",
          "Bhalil",
          "Aïn Cheggag",
        ],
      },
      ORIENTAL: {
        label: "Région de l'Oriental",
        cities: [
          "Oujda",
          "Nador",
          "Berkane",
          "Taourirt",
          "Jerada",
          "Figuig",
          "Bouarfa",
          "Ahfir",
          "Driouch",
          "Beni Ensar",
          "Selouane",
          "Bouhdila",
          "Talsint",
          "Debdou",
        ],
      },
      SUSS: {
        label: "Souss-Massa",
        cities: [
          "Agadir",
          "Inezgane",
          "Taroudant",
          "Tiznit",
          "Oulad Teima",
          "Biougra",
          "Ait Melloul",
          "Dcheira",
          "Temsia",
          "Ait Baha",
          "Chtouka Ait Baha",
          "Tafraout",
          "Aoulouz",
          "El Guerdane",
        ],
      },
      DRAATAF: {
        label: "Drâa-Tafilalet",
        cities: [
          "Errachidia",
          "Ouarzazate",
          "Tinghir",
          "Midelt",
          "Zagora",
          "Rissani",
          "Alnif",
          "Boumalne Dades",
          "Kelaat M'Gouna",
          "Tinejdad",
          "Goulmima",
          "Jorf",
          "M'semrir",
          "Aït Benhaddou",
        ],
      },
    },
  },

  DZ: {
    label: "Algérie",
    provinces: {
      ALGER: {
        label: "Alger",
        cities: [
          "Alger Centre",
          "Bab El Oued",
          "El Harrach",
          "Kouba",
          "Hussein Dey",
          "Bordj El Kiffan",
          "Dar El Beïda",
          "Bouzaréah",
          "Birkhadem",
          "Chéraga",
          "Dellys",
          "Zeralda",
          "Staoueli",
          "Birtouta",
          "Ouled Fayet",
          "Draria",
          "Les Eucalyptus",
        ],
      },
      ORAN: {
        label: "Oran",
        cities: [
          "Oran",
          "Es-Sénia",
          "Bir El Djir",
          "Gdyel",
          "Aïn El Turck",
          "Arzew",
          "Mers El Kébir",
          "Boutlelis",
          "Oued Tlelat",
          "Bethioua",
          "El Ançor",
          "Hassi Bounif",
          "Messerghin",
          "Boufatis",
          "Tafraoui",
        ],
      },
      CONSTANTINE: {
        label: "Constantine",
        cities: [
          "Constantine",
          "El Khroub",
          "Hamma Bouziane",
          "Aïn Smara",
          "Zighoud Youcef",
          "Didouche Mourad",
          "Ibn Ziad",
          "Messaoud Boudjeriou",
          "Beni Hamidane",
          "Aïn Abid",
          "Ouled Rahmoun",
          "Ben Badis",
          "El Haria",
        ],
      },
      BLIDA: {
        label: "Blida",
        cities: [
          "Blida",
          "Boufarik",
          "El Affroun",
          "Mouzaïa",
          "Ouled Yaïch",
          "Beni Mered",
          "Bouinan",
          "Soumaa",
          "Chebli",
          "Bougara",
          "Guerrouaou",
          "Hammam Melouane",
          "Beni Tamou",
          "Ben Khlil",
        ],
      },
      SETIF: {
        label: "Sétif",
        cities: [
          "Sétif",
          "El Eulma",
          "Aïn Oulmene",
          "Bougaa",
          "Aïn Azel",
          "Amoucha",
          "Béni Aziz",
          "Guellal",
          "Hammam Soukhna",
          "Bouandas",
          "Taya",
          "Tella",
          "Babor",
          "Maoklane",
        ],
      },
      ANNABA: {
        label: "Annaba",
        cities: [
          "Annaba",
          "El Bouni",
          "Sidi Amar",
          "Berrahal",
          "Treat",
          "Cheurfa",
          "Oued El Aneb",
          "Seraidi",
          "Ain Berda",
          "Chaiba",
          "El Hadjar",
          "Chetaibi",
        ],
      },
      BATNA: {
        label: "Batna",
        cities: [
          "Batna",
          "Barika",
          "Merouana",
          "Arris",
          "N'Gaous",
          "Tazoult",
          "Aïn Touta",
          "Ouled Si Slimane",
          "Fesdis",
          "Timgad",
          "Ras El Aioun",
          "Maafa",
          "Lazrou",
          "Ouled Ammar",
        ],
      },
    },
  },

  TN: {
    label: "Tunisie",
    provinces: {
      TUNIS: {
        label: "Tunis",
        cities: [
          "Tunis",
          "La Marsa",
          "Carthage",
          "Le Bardo",
          "Le Kram",
          "Sidi Bou Said",
          "Menzah",
          "Ariana",
          "El Menzah",
          "Mornaguia",
          "Mégrine",
          "Radès",
          "Djedeida",
          "El Omrane",
          "Ettahrir",
          "El Kabaria",
        ],
      },
      ARIANA: {
        label: "Ariana",
        cities: [
          "Ariana",
          "Raoued",
          "La Soukra",
          "Kalaat El Andalous",
          "Sidi Thabet",
          "Ettadhamen",
          "Mnihla",
          "Borj El Amri",
          "Kalâat el-Andalous",
          "Sidi Amor",
          "El Battan",
          "Oued Ellil",
        ],
      },
      BEN_AROUS: {
        label: "Ben Arous",
        cities: [
          "Ben Arous",
          "Ezzahra",
          "Rades",
          "Mégrine",
          "Hammam Lif",
          "Mornag",
          "Fouchana",
          "Khalidia",
          "Mhamdia",
          "Hammam Chott",
          "Bou Mhel el-Bassatine",
          "El Mida",
          "Mornaguia",
        ],
      },
      SFAX: {
        label: "Sfax",
        cities: [
          "Sfax",
          "El Ain",
          "Agareb",
          "Mahres",
          "Sakiet Eddaïer",
          "Sakiet Ezzit",
          "Ghraiba",
          "Bir Ali Ben Khalifa",
          "Jebeniana",
          "Kerkennah",
          "Skhira",
          "Menzel Chaker",
          "Gremda",
          "Thyna",
        ],
      },
      SOUSSE: {
        label: "Sousse",
        cities: [
          "Sousse",
          "Hammam Sousse",
          "Kalaa Kebira",
          "Kalaa Sghira",
          "Akouda",
          "M'saken",
          "Enfidha",
          "Bouficha",
          "Hergla",
          "Kondar",
          "Zaouiet Sousse",
          "Hammam Jedidi",
          "Sidi Bou Ali",
          "Messaadine",
        ],
      },
      BIZERTE: {
        label: "Bizerte",
        cities: [
          "Bizerte",
          "Menzel Jemil",
          "Mateur",
          "Sejnane",
          "Ghar El Melh",
          "Ras Jebel",
          "Menzel Abderrahmane",
          "El Alia",
          "Tinja",
          "Utique",
          "Menzel Bourguiba",
          "Joumine",
          "Aousja",
          "Metline",
        ],
      },
    },
  },

  EG: {
    label: "Égypte",
    provinces: {
      CAIRO: {
        label: "Le Caire",
        cities: [
          "Le Caire",
          "Nasr City",
          "Heliopolis",
          "Maadi",
          "Zamalek",
          "Dokki",
          "Giza",
          "Shubra",
          "Al Haram",
          "Al Mohandessin",
          "6 Octobre",
          "New Cairo",
          "Madinet Nasr",
          "Helwan",
          "Qalyub",
          "Shubra El Kheima",
          "Badr City",
        ],
      },
      ALEX: {
        label: "Alexandrie",
        cities: [
          "Alexandrie",
          "Borg El Arab",
          "Abu Qir",
          "Al Amriya",
          "Al Agamy",
          "Montaza",
          "Al Mansheya",
          "Al Labban",
          "Kafr Abdo",
          "Sidi Gaber",
          "Smouha",
          "Miami",
          "Stanley",
          "Laurent",
          "Gleem",
          "Camp Caesar",
        ],
      },
      GIZA: {
        label: "Gizeh",
        cities: [
          "Gizeh",
          "Sheikh Zayed City",
          "6th of October",
          "Al Haram",
          "Al Badrasheen",
          "Al Ayat",
          "Al Wahat Al Bahariya",
          "Al Saff",
          "Atfih",
          "Al Ayyat",
          "Awashim",
          "Kerdasa",
          "El Hawamdeya",
          "Osim",
        ],
      },
      SHARQIA: {
        label: "Sharqia",
        cities: [
          "Zagazig",
          "10th of Ramadan City",
          "Belbeis",
          "Minya Al Qamh",
          "Al Ibrahimiyah",
          "Diarb Negm",
          "Husseiniya",
          "Mashtool El Souk",
          "Abu Hammad",
          "Abu Kebir",
          "Faqous",
          "El Salheya El Gedida",
        ],
      },
    },
  },

  FR: {
    label: "France",
    provinces: {
      IDF: {
        label: "Île-de-France",
        cities: [
          "Paris",
          "Boulogne-Billancourt",
          "Saint-Denis",
          "Versailles",
          "Nanterre",
          "Créteil",
          "Bobigny",
          "Montreuil",
          "Argenteuil",
          "Courbevoic",
          "Asnières-sur-Seine",
          "Colombes",
          "Aubervilliers",
          "Saint-Maur-des-Fossés",
          "Issy-les-Moulineaux",
          "Levallois-Perret",
        ],
      },
      PACA: {
        label: "Provence-Alpes-Côte d'Azur",
        cities: [
          "Marseille",
          "Nice",
          "Toulon",
          "Avignon",
          "Aix-en-Provence",
          "Antibes",
          "Cannes",
          "La Seyne-sur-Mer",
          "Hyères",
          "Arles",
          "Martigues",
          "Grasse",
          "Fréjus",
          "Antibes",
          "La Ciotat",
          "Cavaillon",
        ],
      },
      ARA: {
        label: "Auvergne-Rhône-Alpes",
        cities: [
          "Lyon",
          "Grenoble",
          "Saint-Étienne",
          "Annecy",
          "Clermont-Ferrand",
          "Villeurbanne",
          "Valence",
          "Chambéry",
          "Roanne",
          "Bourg-en-Bresse",
          "Vénissieux",
          "Saint-Priest",
          "Caluire-et-Cuire",
          "Vaulx-en-Velin",
          "Meyzieu",
        ],
      },
      OCCITANIE: {
        label: "Occitanie",
        cities: [
          "Toulouse",
          "Montpellier",
          "Nîmes",
          "Perpignan",
          "Béziers",
          "Montauban",
          "Narbonne",
          "Carcassonne",
          "Albi",
          "Sète",
          "Lunel",
          "Agde",
          "Castres",
          "Mende",
          "Millau",
          "Foix",
        ],
      },
    },
  },

  ES: {
    label: "España",
    provinces: {
      MADRID: {
        label: "Comunidad de Madrid",
        cities: [
          "Madrid",
          "Alcalá de Henares",
          "Getafe",
          "Leganés",
          "Móstoles",
          "Fuenlabrada",
          "Alcorcón",
          "Parla",
          "Torrejón de Ardoz",
          "Coslada",
          "Las Rozas",
          "San Sebastián de los Reyes",
          "Alcobendas",
          "Pozuelo de Alarcón",
          "Rivas-Vaciamadrid",
        ],
      },
      CATALUNYA: {
        label: "Cataluña",
        cities: [
          "Barcelona",
          "L'Hospitalet de Llobregat",
          "Badalona",
          "Tarragona",
          "Sabadell",
          "Lleida",
          "Mataró",
          "Santa Coloma de Gramenet",
          "Reus",
          "Girona",
          "Sant Cugat",
          "Cornellà",
          "Sant Boi de Llobregat",
          "Rubí",
          "Manresa",
        ],
      },
      ANDALUCIA: {
        label: "Andalucía",
        cities: [
          "Sevilla",
          "Málaga",
          "Granada",
          "Córdoba",
          "Jerez de la Frontera",
          "Almería",
          "Huelva",
          "Marbella",
          "Dos Hermanas",
          "Algeciras",
          "Cádiz",
          "Jaén",
          "Almería",
          "Mijas",
          "Fuengirola",
          "Chiclana de la Frontera",
        ],
      },
      VALENCIA: {
        label: "Comunidad Valenciana",
        cities: [
          "Valencia",
          "Alicante",
          "Castellón de la Plana",
          "Elche",
          "Torrevieja",
          "Orihuela",
          "Gandia",
          "Benidorm",
          "Paterna",
          "Sagunto",
          "Alcoy",
          "Elda",
          "San Vicente del Raspeig",
          "Vila-real",
          "Burjassot",
        ],
      },
    },
  },

  SA: {
    label: "Arabie Saoudite",
    provinces: {
      RIYADH: {
        label: "Riyadh",
        cities: [
          "Riyadh",
          "Al Kharj",
          "Al Majma'ah",
          "Dhurma",
          "Al Duwadimi",
          "Al Quway'iyah",
          "Al Muzahmiyah",
          "Wadi ad-Dawasir",
          "Al Hariq",
          "Al Sulayyil",
          "Al Aflaj",
          "Hotat Bani Tamim",
          "Al Diriyah",
          "Thadiq",
          "Huraymila",
        ],
      },
      MAKKAH: {
        label: "Makkah",
        cities: [
          "Makkah",
          "Jeddah",
          "Taif",
          "Al Qunfudhah",
          "Al Lith",
          "Al Jumum",
          "Khulais",
          "Rabigh",
          "Turubah",
          "Al Kamel",
          "Bahra",
          "Adham",
          "Al Jumum",
          "Al Khurma",
          "Al Muwayh",
        ],
      },
      MADINAH: {
        label: "Madinah",
        cities: [
          "Madinah",
          "Yanbu",
          "Al Ula",
          "Badr",
          "Mahd adh Dhahab",
          "Al Hinakiyah",
          "Wadi al-Fara'",
          "Al-Mahd",
          "Khaybar",
          "Al Henakiyah",
          "Al Suqiyah",
          "Al-Mahd",
          "Al-Ais",
          "Hegrah",
        ],
      },
      EASTERN: {
        label: "Eastern Province",
        cities: [
          "Dammam",
          "Khobar",
          "Dhahran",
          "Jubail",
          "Qatif",
          "Hafr al-Batin",
          "Al Khafji",
          "Ras Tanura",
          "Abqaiq",
          "Al-'Udayd",
          "Nu'ayriyah",
          "Udhailiyah",
          "Al Qaryah",
          "Al Mubarraz",
          "Al Awamiyah",
        ],
      },
    },
  },

  AE: {
    label: "Émirats Arabes Unis",
    provinces: {
      DUBAI: {
        label: "Dubai",
        cities: [
          "Dubai",
          "Jebel Ali",
          "Hatta",
          "Al Awir",
          "Al Lusayli",
          "Margham",
          "Al Khawaneej",
          "Al Qusais",
          "Al Barsha",
          "Al Warqaa",
          "Mirdif",
          "Nad Al Sheba",
          "Al Quoz",
          "Jumeirah",
          "Business Bay",
          "Dubai Marina",
        ],
      },
      ABU_DHABI: {
        label: "Abu Dhabi",
        cities: [
          "Abu Dhabi",
          "Al Ain",
          "Madinat Zayed",
          "Gharbia",
          "Liwa Oasis",
          "Al Ruwais",
          "Al Mirfa",
          "Al Dhafra",
          "Al Samha",
          "Al Shawamekh",
          "Bani Yas",
          "Khalifa City",
          "Mohammed Bin Zayed City",
          "Shahama",
          "Al Wathba",
        ],
      },
      SHARJAH: {
        label: "Sharjah",
        cities: [
          "Sharjah",
          "Khor Fakkan",
          "Kalba",
          "Dhaid",
          "Al Dhaid",
          "Al Hamriyah",
          "Al Madam",
          "Al Batayeh",
          "Al Sajaa",
          "Al Ghail",
          "Wasit",
          "Mleiha",
          "Al Nahda",
          "Al Qasimia",
          "Al Majaz",
        ],
      },
      AJMAN: {
        label: "Ajman",
        cities: [
          "Ajman",
          "Masfout",
          "Manama",
          "Al Hamidiyah",
          "Al Zorah",
          "Al Mowaihat",
          "Al Jurf",
          "Al Hamidiya",
          "Al Rawda",
          "Al Nuaimiya",
        ],
      },
    },
  },

  US: {
    label: "United States",
    provinces: {
      CALIFORNIA: {
        label: "California",
        cities: [
          "Los Angeles",
          "San Francisco",
          "San Diego",
          "San Jose",
          "Sacramento",
          "Fresno",
          "Long Beach",
          "Oakland",
          "Bakersfield",
          "Anaheim",
          "Santa Ana",
          "Riverside",
          "Stockton",
          "Chula Vista",
          "Irvine",
          "Modesto",
        ],
      },
      NEW_YORK: {
        label: "New York",
        cities: [
          "New York City",
          "Buffalo",
          "Rochester",
          "Yonkers",
          "Syracuse",
          "Albany",
          "New Rochelle",
          "Mount Vernon",
          "Schenectady",
          "Utica",
          "White Plains",
          "Troy",
          "Niagara Falls",
          "Binghamton",
        ],
      },
      TEXAS: {
        label: "Texas",
        cities: [
          "Houston",
          "Dallas",
          "Austin",
          "San Antonio",
          "Fort Worth",
          "El Paso",
          "Arlington",
          "Corpus Christi",
          "Plano",
          "Laredo",
          "Lubbock",
          "Garland",
          "Irving",
          "Amarillo",
          "Grand Prairie",
        ],
      },
      FLORIDA: {
        label: "Florida",
        cities: [
          "Miami",
          "Orlando",
          "Tampa",
          "Jacksonville",
          "Tallahassee",
          "St. Petersburg",
          "Hialeah",
          "Port St. Lucie",
          "Cape Coral",
          "Fort Lauderdale",
          "Pembroke Pines",
          "Hollywood",
          "Miramar",
          "Gainesville",
        ],
      },
    },
  },

  NG: {
    label: "Nigeria",
    provinces: {
      LAGOS: {
        label: "Lagos",
        cities: [
          "Lagos",
          "Ikeja",
          "Surulere",
          "Apapa",
          "Lekki",
          "Victoria Island",
          "Ajah",
          "Badagry",
          "Epe",
          "Ikorodu",
          "Agege",
          "Alimosho",
          "Kosofe",
          "Mushin",
          "Oshodi",
          "Somolu",
        ],
      },
      ABUJA: {
        label: "Abuja",
        cities: [
          "Abuja",
          "Garki",
          "Wuse",
          "Maitama",
          "Asokoro",
          "Gwarinpa",
          "Kubwa",
          "Jahi",
          "Lugbe",
          "Karu",
          "Nyanya",
          "Bwari",
          "Kuje",
          "Gwagwalada",
          "Kwali",
        ],
      },
      KANO: {
        label: "Kano",
        cities: [
          "Kano",
          "Nassarawa",
          "Tarauni",
          "Dala",
          "Fagge",
          "Gwale",
          "Kumbotso",
          "Ungogo",
          "Dawakin Tofa",
          "Tofa",
          "Rimin Gado",
          "Bagwai",
          "Gezawa",
          "Gabasawa",
          "Minjibir",
        ],
      },
      RIVERS: {
        label: "Rivers",
        cities: [
          "Port Harcourt",
          "Obio-Akpor",
          "Ikwerre",
          "Eleme",
          "Oyigbo",
          "Etche",
          "Omuma",
          "Okrika",
          "Ogu–Bolo",
          "Bonny",
          "Degema",
          "Asari-Toru",
          "Akuku-Toru",
          "Abua–Odual",
          "Ahoada",
        ],
      },
    },
  },

  PK: {
    label: "Pakistan",
    provinces: {
      PUNJAB: {
        label: "Punjab",
        cities: [
          "Lahore",
          "Faisalabad",
          "Rawalpindi",
          "Gujranwala",
          "Multan",
          "Sialkot",
          "Bahawalpur",
          "Sargodha",
          "Sheikhupura",
          "Jhelum",
          "Gujrat",
          "Sahiwal",
          "Wah Cantonment",
          "Kasur",
          "Okara",
          "Chiniot",
        ],
      },
      SINDH: {
        label: "Sindh",
        cities: [
          "Karachi",
          "Hyderabad",
          "Sukkur",
          "Larkana",
          "Nawabshah",
          "Mirpur Khas",
          "Jacobabad",
          "Shikarpur",
          "Khairpur",
          "Dadu",
          "Tando Allahyar",
          "Tando Adam",
          "Badin",
          "Thatta",
          "Kotri",
        ],
      },
      KHYBER: {
        label: "Khyber Pakhtunkhwa",
        cities: [
          "Peshawar",
          "Mardan",
          "Abbottabad",
          "Mingora",
          "Kohat",
          "Bannu",
          "Swabi",
          "Dera Ismail Khan",
          "Charsadda",
          "Nowshera",
          "Mansehra",
          "Haripur",
          "Timergara",
          "Tank",
          "Hangu",
        ],
      },
      BALOCHISTAN: {
        label: "Balochistan",
        cities: [
          "Quetta",
          "Turbat",
          "Khuzdar",
          "Chaman",
          "Gwadar",
          "Dera Murad Jamali",
          "Dera Allah Yar",
          "Usta Mohammad",
          "Sibi",
          "Loralai",
          "Zhob",
          "Pasni",
          "Qila Saifullah",
          "Khost",
          "Hub",
        ],
      },
    },
  },

  IN: {
    label: "India",
    provinces: {
      DELHI: {
        label: "Delhi",
        cities: [
          "New Delhi",
          "Delhi",
          "Dwarka",
          "Karol Bagh",
          "Rohini",
          "Pitampura",
          "Janakpuri",
          "Laxmi Nagar",
          "Saket",
          "Hauz Khas",
          "Malviya Nagar",
          "Patel Nagar",
          "Rajouri Garden",
          "Kalkaji",
          "Sarita Vihar",
          "Vasant Kunj",
        ],
      },
      MAHARASHTRA: {
        label: "Maharashtra",
        cities: [
          "Mumbai",
          "Pune",
          "Nagpur",
          "Nashik",
          "Aurangabad",
          "Solapur",
          "Bhiwandi",
          "Amravati",
          "Nanded",
          "Kolhapur",
          "Ulhasnagar",
          "Sangli",
          "Malegaon",
          "Jalgaon",
          "Akola",
          "Latur",
        ],
      },
      KARNATAKA: {
        label: "Karnataka",
        cities: [
          "Bengaluru",
          "Mysuru",
          "Hubballi",
          "Mangaluru",
          "Belagavi",
          "Davanagere",
          "Ballari",
          "Tumakuru",
          "Shivamogga",
          "Raichur",
          "Bidar",
          "Hospet",
          "Udupi",
          "Gadag-Betageri",
          "Robertson Pet",
          "Hassan",
        ],
      },
      TAMIL_NADU: {
        label: "Tamil Nadu",
        cities: [
          "Chennai",
          "Coimbatore",
          "Madurai",
          "Tiruchirappalli",
          "Salem",
          "Tirunelveli",
          "Tiruppur",
          "Vellore",
          "Erode",
          "Thoothukudi",
          "Dindigul",
          "Thanjavur",
          "Hosur",
          "Nagercoil",
          "Kanchipuram",
          "Kumarapalayam",
        ],
      },
    },
  },

  ID: {
    label: "Indonesia",
    provinces: {
      JAKARTA: {
        label: "Jakarta",
        cities: [
          "Jakarta",
          "Central Jakarta",
          "South Jakarta",
          "West Jakarta",
          "East Jakarta",
          "North Jakarta",
          "Thousand Islands",
          "Kebayoran Baru",
          "Tebet",
          "Cilandak",
          "Pasar Minggu",
          "Mampang",
          "Cengkareng",
          "Tanjung Priok",
          "Kelapa Gading",
        ],
      },
      WEST_JAVA: {
        label: "West Java",
        cities: [
          "Bandung",
          "Bekasi",
          "Depok",
          "Bogor",
          "Cimahi",
          "Sukabumi",
          "Cirebon",
          "Tasikmalaya",
          "Karawang",
          "Purwakarta",
          "Subang",
          "Sumedang",
          "Garut",
          "Majalengka",
          "Cianjur",
          "Banjar",
        ],
      },
      CENTRAL_JAVA: {
        label: "Central Java",
        cities: [
          "Semarang",
          "Surakarta",
          "Tegal",
          "Pekalongan",
          "Salatiga",
          "Magelang",
          "Kudus",
          "Jepara",
          "Rembang",
          "Blora",
          "Batang",
          "Pati",
          "Wonosobo",
          "Temanggung",
          "Boyolali",
          "Klaten",
        ],
      },
      EAST_JAVA: {
        label: "East Java",
        cities: [
          "Surabaya",
          "Malang",
          "Kediri",
          "Mojokerto",
          "Jember",
          "Banyuwangi",
          "Madiun",
          "Pasuruan",
          "Probolinggo",
          "Blitar",
          "Lumajang",
          "Bondowoso",
          "Situbondo",
          "Tulungagung",
          "Tuban",
          "Lamongan",
        ],
      },
    },
  },

  TR: {
    label: "Türkiye",
    provinces: {
      ISTANBUL: {
        label: "Istanbul",
        cities: [
          "Istanbul",
          "Kadıköy",
          "Beşiktaş",
          "Şişli",
          "Fatih",
          "Üsküdar",
          "Bakırköy",
          "Esenler",
          "Küçükçekmece",
          "Beyoğlu",
          "Zeytinburnu",
          "Maltepe",
          "Sarıyer",
          "Pendik",
          "Kartal",
          "Beylikdüzü",
        ],
      },
      ANKARA: {
        label: "Ankara",
        cities: [
          "Ankara",
          "Çankaya",
          "Keçiören",
          "Yenimahalle",
          "Mamak",
          "Sincan",
          "Altındağ",
          "Etimesgut",
          "Polatlı",
          "Gölbaşı",
          "Pursaklar",
          "Akyurt",
          "Kahramankazan",
          "Elmadağ",
          "Bala",
          "Ayaş",
        ],
      },
      IZMIR: {
        label: "İzmir",
        cities: [
          "İzmir",
          "Bornova",
          "Karşıyaka",
          "Konak",
          "Buca",
          "Bayraklı",
          "Çiğli",
          "Balçova",
          "Narlıdere",
          "Gaziemir",
          "Güzelbahçe",
          "Urla",
          "Seferihisar",
          "Menderes",
          "Torbalı",
          "Bergama",
        ],
      },
      ANTALYA: {
        label: "Antalya",
        cities: [
          "Antalya",
          "Muratpaşa",
          "Kepez",
          "Konyaaltı",
          "Alanya",
          "Manavgat",
          "Serik",
          "Kumluca",
          "Kaş",
          "Korkuteli",
          "Finike",
          "Gazipaşa",
          "Demre",
          "Akseki",
          "Elmalı",
          "Gündoğmuş",
        ],
      },
    },
  },

  BR: {
    label: "Brazil",
    provinces: {
      SAO_PAULO: {
        label: "São Paulo",
        cities: [
          "São Paulo",
          "Guarulhos",
          "Campinas",
          "São Bernardo do Campo",
          "Santo André",
          "Osasco",
          "Sorocaba",
          "Ribeirão Preto",
          "São José dos Campos",
          "Santos",
          "Mauá",
          "Diadema",
          "Jundiaí",
          "Barueri",
          "São Vicente",
          "Carapicuíba",
        ],
      },
      RIO_JANEIRO: {
        label: "Rio de Janeiro",
        cities: [
          "Rio de Janeiro",
          "São Gonçalo",
          "Duque de Caxias",
          "Nova Iguaçu",
          "Niterói",
          "Belford Roxo",
          "Campos dos Goytacazes",
          "São João de Meriti",
          "Petrópolis",
          "Volta Redonda",
          "Magé",
          "Itaboraí",
          "Macaé",
          "Mesquita",
          "Teresópolis",
          "Nilópolis",
        ],
      },
      MINAS_GERAIS: {
        label: "Minas Gerais",
        cities: [
          "Belo Horizonte",
          "Uberlândia",
          "Contagem",
          "Juiz de Fora",
          "Betim",
          "Montes Claros",
          "Ribeirão das Neves",
          "Uberaba",
          "Governador Valadares",
          "Ipatinga",
          "Sete Lagoas",
          "Divinópolis",
          "Santa Luzia",
          "Ibirité",
          "Poços de Caldas",
          "Patos de Minas",
        ],
      },
      BAHIA: {
        label: "Bahia",
        cities: [
          "Salvador",
          "Feira de Santana",
          "Vitória da Conquista",
          "Camaçari",
          "Itabuna",
          "Juazeiro",
          "Lauro de Freitas",
          "Ilhéus",
          "Jequié",
          "Alagoinhas",
          "Teixeira de Freitas",
          "Barreiras",
          "Porto Seguro",
          "Simões Filho",
          "Paulo Afonso",
          "Eunápolis",
        ],
      },
    },
  },
};

/* Convert COUNTRY_DATA to GEO_COUNTRIES format */
const GEO_COUNTRIES = Object.keys(COUNTRY_DATA).reduce((acc, countryCode) => {
  const country = COUNTRY_DATA[countryCode];
  acc[countryCode] = {
    label: country.label,
    provinces: Object.entries(country.provinces).map(([key, province]) => ({
      id: key.toLowerCase().replace(/_/g, "-"),
      name: province.label,
      cities: province.cities,
    })),
  };
  return acc;
}, {});

function getCountryDef(code) {
  const c = (code || "MA").toUpperCase();
  return GEO_COUNTRIES[c] || GEO_COUNTRIES.MA;
}

function getProvinceOptions(countryCode, tr) {
  const def = getCountryDef(countryCode);
  return [{ label: tr("section6.select.provincePlaceholder", "Select province"), value: "" }].concat(
    (def.provinces || []).map((p) => ({
      label: p.name,
      value: p.name,
    }))
  );
}

function getCityOptions(countryCode, provinceNameOrId, tr) {
  if (!provinceNameOrId) return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];
  const def = getCountryDef(countryCode);
  const prov =
    (def.provinces || []).find(
      (p) => p.name === provinceNameOrId || p.id === provinceNameOrId
    ) || null;

  if (!prov) return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }];

  return [{ label: tr("section6.select.cityPlaceholder", "Select city"), value: "" }].concat(
    (prov.cities || []).map((city) => ({
      label: city,
      value: city,
    }))
  );
}

/* ============================== UI helpers ============================== */
function GroupCard({ title, children, tr }) {
  return (
    <Card>
      <div className="tf-group-title">{tr(title, title)}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

const Grid3 = ({ children }) => (
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

const newId = () => Math.random().toString(36).slice(2, 8);

/* ============================== config par défaut ============================== */
function defaultCfg() {
  const allCountries = Object.keys(GEO_COUNTRIES);
  return {
    meta: { version: 2 },
    country: "MA",
    currency: "MAD",

    isFree: false,
    mode: "province", // price | province | city

    priceBrackets: [
      { id: newId(), min: 0, max: 299, rate: 29 },
      { id: newId(), min: 299, max: null, rate: 0 },
    ],

    provinceRates: Object.fromEntries(allCountries.map((c) => [c, []])),
    cityRates: Object.fromEntries(allCountries.map((c) => [c, []])),

    advanced: {
      defaultRate: 0,
      freeThreshold: null,
      minOrderAmount: 0,
      codExtraFee: 0,
      note: "",
    },
  };
}

function stableStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
}

function normalizeGeoCfg(cfg) {
  const x = cfg || defaultCfg();
  const allCountries = Object.keys(GEO_COUNTRIES);

  const next = { ...defaultCfg(), ...x };
  if (!next.provinceRates) next.provinceRates = {};
  if (!next.cityRates) next.cityRates = {};

  allCountries.forEach((cc) => {
    if (!Array.isArray(next.provinceRates[cc])) next.provinceRates[cc] = [];
    if (!Array.isArray(next.cityRates[cc])) next.cityRates[cc] = [];
  });

  return next;
}

/* ============================== SaveBarSlim ============================== */
function SaveBarSlim({ dirty, saving, notice, attention, onSave, tr }) {
  if (!dirty && !notice) return null;

  const isError = notice?.type === "error";
  const isSuccess = notice?.type === "success";

  const badgeText = isError
    ? tr("common.savebar.badgeError", "Error")
    : isSuccess
    ? tr("common.savebar.badgeSaved", "Saved")
    : dirty
    ? tr("common.savebar.badgeUnsaved", "Unsaved")
    : tr("common.savebar.badgeInfo", "Info");

  const badgeStyle = isError
    ? { background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }
    : isSuccess
    ? { background: "#ECFDF5", borderColor: "#86EFAC", color: "#065F46" }
    : dirty
    ? { background: "#FFF7ED", borderColor: "#FDBA74", color: "#9A3412" }
    : {};

  const mainMsg =
    notice?.msg ||
    (dirty
      ? tr("common.savebar.unsaved", "You have unsaved changes.")
      : tr("common.savebar.info", "Info"));

  const subMsg = dirty
    ? tr(
        "common.savebar.sub",
        "Save before leaving this section to avoid losing changes."
      )
    : "";

  return (
    <div className="tf-savebar">
      <div className={`tf-savebar-inner ${attention ? "tf-attention" : ""}`}>
        <div className="tf-savebar-left">
          <span className="tf-savebadge" style={badgeStyle}>
            {badgeText}
          </span>

          <div className="tf-savebar-text">
            <div className="tf-savemsg">{mainMsg}</div>
            {subMsg ? <div className="tf-savesub">{subMsg}</div> : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dirty ? (
            <Button variant="primary" onClick={onSave} loading={saving}>
              {tr("common.save", "Save")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============================== Page ============================== */
export default function Section6Geo() {
  useInjectCss();
  const { tr } = useT();

  const [cfg, setCfg] = useState(() => normalizeGeoCfg(defaultCfg()));
  const [view, setView] = useState("province"); // price | province | city | advanced
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState(null); // {type:'success'|'error'|'info', msg}
  const [attention, setAttention] = useState(false);

  const lastSavedRef = useRef(stableStringify(normalizeGeoCfg(defaultCfg())));

  const normalizedCfg = useMemo(() => normalizeGeoCfg(cfg), [cfg]);

  const dirty = useMemo(() => {
    const now = stableStringify(normalizedCfg);
    return now !== (lastSavedRef.current || "");
  }, [normalizedCfg]);

  const blinkAttention = () => {
    setAttention(true);
    setTimeout(() => setAttention(false), 950);
  };

  /* ---------- LOAD: localStorage + server ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) localStorage
    try {
      const s = window.localStorage.getItem("tripleform_cod_geo");
      if (s) {
        const parsed = JSON.parse(s);
        const fixed = normalizeGeoCfg({ ...defaultCfg(), ...parsed });
        setCfg(fixed);
        lastSavedRef.current = stableStringify(fixed);
      } else {
        const init = normalizeGeoCfg(defaultCfg());
        lastSavedRef.current = stableStringify(init);
      }
    } catch {
      const init = normalizeGeoCfg(defaultCfg());
      lastSavedRef.current = stableStringify(init);
    }

    // 2) server
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo/load", { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!json?.ok || !json.geo || cancelled) return;

        const fixed = normalizeGeoCfg({ ...defaultCfg(), ...json.geo });
        setCfg(fixed);
        lastSavedRef.current = stableStringify(fixed);
        setNotice(null);

        // sync localStorage
        try {
          window.localStorage.setItem("tripleform_cod_geo", JSON.stringify(fixed));
        } catch {}
      } catch (e) {
        console.warn("[Section6Geo] load server failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- persist local (silent) ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("tripleform_cod_geo", JSON.stringify(normalizedCfg));
    } catch {}
  }, [normalizedCfg]);

  /* ---------- SAVE remote (no alert) ---------- */
  const saveGeo = async () => {
    try {
      setSaving(true);
      setNotice(null);

      const payload = normalizeGeoCfg(cfg);

      const res = await fetch("/api/geo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ geo: payload }),
      });

      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false) throw new Error(j?.error || "Save failed");

      lastSavedRef.current = stableStringify(payload);

      setNotice({
        type: "success",
        msg: tr("section6.save.success", "Saved successfully."),
      });
      setTimeout(() => setNotice(null), 2200);
    } catch (e) {
      setNotice({
        type: "error",
        msg: tr("section6.save.error", "Save failed: {{error}}", {
          error: e?.message || "Unknown",
        }),
      });
      blinkAttention();
    } finally {
      setSaving(false);
    }
  };

  /* ---------- “leave panel” logic (warn only on navigation) ---------- */
  const goPanel = (next) => {
    if (next === view) return;

    if (dirty) {
      setNotice({
        type: "info",
        msg: tr(
          "common.savebar.leaveWarn",
          "You have unsaved changes. Please save before leaving."
        ),
      });
      blinkAttention();
    }

    setView(next);
  };

  /* ====== helpers ====== */
  const setRoot = (p) => setCfg((c) => ({ ...c, ...p }));
  const setAdvanced = (p) =>
    setCfg((c) => ({ ...c, advanced: { ...c.advanced, ...p } }));

  const setCountry = (iso2) => {
    const code = (iso2 || "").toUpperCase().slice(0, 2) || "MA";
    setCfg((c) => {
      const next = { ...c, country: code };
      if (!next.provinceRates[code]) next.provinceRates[code] = [];
      if (!next.cityRates[code]) next.cityRates[code] = [];
      return next;
    });
  };

  // price brackets
  const addBracket = () =>
    setCfg((c) => ({
      ...c,
      priceBrackets: [...c.priceBrackets, { id: newId(), min: 0, max: null, rate: 0 }],
    }));
  const updBracket = (id, patch) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  const delBracket = (id) =>
    setCfg((c) => ({ ...c, priceBrackets: c.priceBrackets.filter((b) => b.id !== id) }));

  // provinces for current country
  const curProv = cfg.provinceRates[cfg.country] || [];
  const setProv = (arr) =>
    setCfg((c) => ({ ...c, provinceRates: { ...c.provinceRates, [c.country]: arr } }));
  const addProv = () => setProv([...curProv, { id: newId(), code: "", name: "", rate: 0 }]);
  const updProv = (id, patch) =>
    setProv(curProv.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delProv = (id) => setProv(curProv.filter((p) => p.id !== id));

  // cities for current country
  const curCity = cfg.cityRates[cfg.country] || [];
  const setCity = (arr) =>
    setCfg((c) => ({ ...c, cityRates: { ...c.cityRates, [c.country]: arr } }));
  const addCity = () => setCity([...curCity, { id: newId(), province: "", name: "", rate: 0 }]);
  const updCity = (id, patch) =>
    setCity(curCity.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci)));
  const delCity = (id) => setCity(curCity.filter((ci) => ci.id !== id));

  /* ===== rail (panneaux) ===== */
  const panels = [
    { key: "province", label: tr("section6.rail.panels.province", "Province rates") },
    { key: "city", label: tr("section6.rail.panels.city", "City rates") },
    { key: "price", label: tr("section6.rail.panels.price", "Price brackets") },
    { key: "advanced", label: tr("section6.rail.panels.advanced", "Advanced") },
  ];

  const countBrackets = cfg.priceBrackets?.length || 0;
  const countProv = curProv.length;
  const countCity = curCity.length;

  const modeLabel = () => {
    if (cfg.mode === "price") return tr("section6.mode.price", "Price");
    if (cfg.mode === "city") return tr("section6.mode.city", "City");
    return tr("section6.mode.province", "Province");
  };

  const countryDef = getCountryDef(cfg.country);
  const countryOptions = Object.entries(GEO_COUNTRIES).map(([code, data]) => ({
    label: data.label,
    value: code,
  }));

  const provinceOptionsWithPlaceholder = useMemo(
    () => getProvinceOptions(cfg.country, tr),
    [cfg.country, tr]
  );

  return (
    <>
      {/* ✅ HEADER */}
      <div className="tf-header">
        <div className="tf-header-row">
          <div className="tf-brand">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(11,59,130,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
                flex: "0 0 auto",
              }}
            >
              <img
                src="/tripleform-cod-icon.png"
                alt="TripleForm COD"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>

            <div className="tf-brand-text">
              <div className="tf-brand-title">
                {tr("section6.header.appTitle", "TripleForm — GEO")}
              </div>
              <div className="tf-brand-sub">
                {tr("section6.header.appSubtitle", "Shipping rates by province, city, or cart amount")}
              </div>
            </div>
          </div>

          {/* ✅ FLAGS center */}
          <div className="tf-flags-wrap">
            <CountryFlagsBar />
          </div>

          <div className="tf-header-right">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)", fontWeight: 800 }}>
              {tr("section6.header.pill", "Geo settings")}
            </div>

            <Button variant="primary" size="slim" onClick={saveGeo} loading={saving}>
              {tr("section6.buttons.saveStore", "Save")}
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Slim SaveBar */}
      <SaveBarSlim
        dirty={dirty}
        saving={saving}
        notice={notice}
        attention={attention}
        onSave={saveGeo}
        tr={tr}
      />

      <div className="tf-shell">
        <div className="tf-editor">
          {/* ===== Rail gauche ===== */}
          <div className="tf-rail">
            <div className="tf-rail-card">
              <div className="tf-rail-head">{tr("section6.rail.title", "Panels")}</div>
              <div className="tf-rail-list">
                {panels.map((it) => (
                  <div
                    key={it.key}
                    className="tf-rail-item"
                    data-sel={view === it.key ? 1 : 0}
                    onClick={() => goPanel(it.key)}
                  >
                    <span style={{ fontWeight: 800 }}>{it.label}</span>
                    <span style={{ opacity: 0.75 }}>
                      <SafeIcon name="ChevronRightIcon" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="tf-rail-card">
              <div className="tf-rail-head">{tr("section6.rail.summaryTitle", "Summary")}</div>
              <div style={{ padding: 10 }}>
                <BlockStack gap="100">
                  <InlineStack align="space-between">
                    <Text as="span">{tr("section6.rail.type", "Shipping")}</Text>
                    <Badge>
                      {cfg.isFree
                        ? tr("section6.rail.free", "Free")
                        : tr("section6.rail.paid", "Paid")}
                    </Badge>
                  </InlineStack>

                  {!cfg.isFree ? (
                    <>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.mode", "Mode")}</Text>
                        <Badge>{modeLabel()}</Badge>
                      </InlineStack>

                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.priceBrackets", "Brackets")}</Text>
                        <Badge tone="info">{countBrackets}</Badge>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.provinces", "Provinces")}</Text>
                        <Badge tone="info">{countProv}</Badge>
                      </InlineStack>
                      <InlineStack align="space-between">
                        <Text as="span">{tr("section6.rail.cities", "Cities")}</Text>
                        <Badge tone="info">{countCity}</Badge>
                      </InlineStack>
                    </>
                  ) : null}

                  <Text tone="subdued" as="p">
                    {tr("section6.rail.countryCurrency", "Country: {{country}} • Currency: {{currency}}", {
                      country: cfg.country || "—",
                      currency: cfg.currency || "—",
                    })}
                  </Text>

                  <Button size="slim" variant="primary" onClick={saveGeo} loading={saving}>
                    {tr("section6.buttons.saveStore", "Save")}
                  </Button>
                </BlockStack>
              </div>
            </div>
          </div>

          {/* ===== Colonne centrale ===== */}
          <div className="tf-main-col">
            <div className="tf-panel">
              {/* General */}
              <GroupCard title="section6.general.title" tr={tr}>
                <Grid3>
                  <Select
                    label={tr("section6.general.shippingType", "Shipping type")}
                    value={cfg.isFree ? "free" : "paid"}
                    onChange={(v) => setRoot({ isFree: v === "free" })}
                    options={[
                      { label: tr("section6.general.freeOption", "Free shipping"), value: "free" },
                      { label: tr("section6.general.paidOption", "Paid shipping"), value: "paid" },
                    ]}
                  />

                  <Select
                    label={tr("section6.general.mainCountry", "Main country")}
                    value={cfg.country}
                    onChange={setCountry}
                    options={[
                      { label: tr("section6.general.countries.selectPlaceholder", "Select country"), value: "" },
                      ...countryOptions,
                    ]}
                    helpText={tr("section6.general.countryHelp", "This will be the default geo for rates.")}
                  />

                  <TextField
                    label={tr("section6.general.currency", "Currency")}
                    value={cfg.currency}
                    onChange={(v) => setRoot({ currency: v })}
                    autoComplete="off"
                    helpText={tr("section6.general.currencyHelp", "Example: MAD, DZD, EUR...")}
                  />
                </Grid3>

                {!cfg.isFree ? (
                  <Grid3>
                    <Select
                      label={tr("section6.general.pricingMode", "Pricing mode")}
                      value={cfg.mode}
                      onChange={(v) => {
                        setRoot({ mode: v });
                        if (v === "price" || v === "province" || v === "city") {
                          setView(v);
                        }
                      }}
                      options={[
                        { label: tr("section6.general.modeProvince", "By province"), value: "province" },
                        { label: tr("section6.general.modeCity", "By city"), value: "city" },
                        { label: tr("section6.general.modePrice", "By cart amount"), value: "price" },
                      ]}
                    />
                  </Grid3>
                ) : (
                  <Text tone="subdued" as="p">
                    {tr("section6.general.freeShippingInfo", "Free shipping enabled: rates are ignored.")}
                  </Text>
                )}
              </GroupCard>

              {/* Province view */}
              {!cfg.isFree && view === "province" && (
                <GroupCard
                  title={tr("section6.province.title", "Province rates — {{country}}", { country: countryDef.label })}
                  tr={tr}
                >
                  <Text tone="subdued" as="p">
                    {tr("section6.province.description", "Define shipping rate per province.")}
                  </Text>

                  <BlockStack gap="200">
                    {curProv.map((p) => (
                      <div className="row-card" key={p.id}>
                        <Grid3>
                          <Select
                            label={tr("section6.province.provinceLabel", "Province")}
                            value={p.name || ""}
                            options={provinceOptionsWithPlaceholder}
                            onChange={(v) => updProv(p.id, { name: v })}
                          />
                          <TextField
                            label={tr("section6.province.codeLabel", "Code")}
                            value={p.code}
                            onChange={(v) => updProv(p.id, { code: v })}
                            autoComplete="off"
                          />
                          <TextField
                            type="number"
                            label={tr("section6.province.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                            value={String(p.rate)}
                            onChange={(v) => updProv(p.id, { rate: Number(v || 0) })}
                            autoComplete="off"
                          />
                        </Grid3>

                        <InlineStack align="end">
                          <Button tone="critical" onClick={() => delProv(p.id)}>
                            {tr("section6.buttons.deleteProvince", "Delete")}
                          </Button>
                        </InlineStack>
                      </div>
                    ))}

                    <Button onClick={addProv}>{tr("section6.buttons.addProvince", "Add province")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* City view */}
              {!cfg.isFree && view === "city" && (
                <GroupCard
                  title={tr("section6.city.title", "City rates — {{country}}", { country: countryDef.label })}
                  tr={tr}
                >
                  <Text tone="subdued" as="p">
                    {tr("section6.city.description", "Define shipping rate per city inside a province.")}
                  </Text>

                  <BlockStack gap="200">
                    {curCity.map((ci) => {
                      const cityOptionsWithPlaceholder = getCityOptions(cfg.country, ci.province, tr);
                      return (
                        <div className="row-card" key={ci.id}>
                          <Grid3>
                            <Select
                              label={tr("section6.city.provinceLabel", "Province")}
                              value={ci.province || ""}
                              options={provinceOptionsWithPlaceholder}
                              onChange={(v) => updCity(ci.id, { province: v, name: "" })}
                            />
                            <Select
                              label={tr("section6.city.cityLabel", "City")}
                              value={ci.name || ""}
                              options={cityOptionsWithPlaceholder}
                              onChange={(v) => updCity(ci.id, { name: v })}
                              disabled={!ci.province}
                            />
                            <TextField
                              type="number"
                              label={tr("section6.city.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                              value={String(ci.rate)}
                              onChange={(v) => updCity(ci.id, { rate: Number(v || 0) })}
                              autoComplete="off"
                            />
                          </Grid3>

                          <InlineStack align="end">
                            <Button tone="critical" onClick={() => delCity(ci.id)}>
                              {tr("section6.buttons.deleteCity", "Delete")}
                            </Button>
                          </InlineStack>
                        </div>
                      );
                    })}

                    <Button onClick={addCity}>{tr("section6.buttons.addCity", "Add city")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* Price view */}
              {!cfg.isFree && view === "price" && (
                <GroupCard title="section6.price.title" tr={tr}>
                  <Text tone="subdued" as="p">
                    {tr("section6.price.description", "Define rate by cart amount ({{currency}}).", {
                      currency: cfg.currency,
                    })}
                  </Text>

                  <BlockStack gap="200">
                    {(cfg.priceBrackets || []).map((b) => (
                      <div className="row-card" key={b.id}>
                        <Grid3>
                          <TextField
                            type="number"
                            label={tr("section6.price.minAmount", "Min")}
                            value={b.min == null ? "" : String(b.min)}
                            onChange={(v) => updBracket(b.id, { min: v === "" ? null : Number(v) })}
                            autoComplete="off"
                          />
                          <TextField
                            type="number"
                            label={tr("section6.price.maxAmount", "Max")}
                            value={b.max == null ? "" : String(b.max)}
                            onChange={(v) => updBracket(b.id, { max: v === "" ? null : Number(v) })}
                            autoComplete="off"
                            helpText={tr("section6.price.maxHelp", "Leave empty for no limit")}
                          />
                          <TextField
                            type="number"
                            label={tr("section6.price.rateLabel", "Rate ({{currency}})", { currency: cfg.currency })}
                            value={String(b.rate)}
                            onChange={(v) => updBracket(b.id, { rate: Number(v || 0) })}
                            autoComplete="off"
                          />
                        </Grid3>

                        <InlineStack align="end">
                          <Button tone="critical" onClick={() => delBracket(b.id)}>
                            {tr("section6.buttons.deleteBracket", "Delete")}
                          </Button>
                        </InlineStack>
                      </div>
                    ))}

                    <Button onClick={addBracket}>{tr("section6.buttons.addBracket", "Add bracket")}</Button>
                  </BlockStack>
                </GroupCard>
              )}

              {/* Advanced */}
              {view === "advanced" && (
                <GroupCard title="section6.advanced.title" tr={tr}>
                  <Grid3>
                    <TextField
                      type="number"
                      label={tr("section6.advanced.defaultRate", "Default rate ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.defaultRate)}
                      onChange={(v) => setAdvanced({ defaultRate: Number(v || 0) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.freeThreshold", "Free threshold ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={cfg.advanced.freeThreshold == null ? "" : String(cfg.advanced.freeThreshold)}
                      onChange={(v) => setAdvanced({ freeThreshold: v === "" ? null : Number(v) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.minOrderAmount", "Min order ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.minOrderAmount)}
                      onChange={(v) => setAdvanced({ minOrderAmount: Number(v || 0) })}
                      autoComplete="off"
                    />
                    <TextField
                      type="number"
                      label={tr("section6.advanced.codExtraFee", "COD extra fee ({{currency}})", {
                        currency: cfg.currency,
                      })}
                      value={String(cfg.advanced.codExtraFee)}
                      onChange={(v) => setAdvanced({ codExtraFee: Number(v || 0) })}
                      autoComplete="off"
                    />
                  </Grid3>

                  <TextField
                    label={tr("section6.advanced.note", "Note")}
                    value={cfg.advanced.note}
                    onChange={(v) => setAdvanced({ note: v })}
                    autoComplete="off"
                    multiline={3}
                  />

                  <Divider />

                  <InlineStack align="end">
                    <Button variant="primary" onClick={saveGeo} loading={saving}>
                      {tr("section6.buttons.save", "Save")}
                    </Button>
                  </InlineStack>
                </GroupCard>
              )}
            </div>
          </div>

          {/* ===== Colonne droite — guide ===== */}
          <div className="tf-side-col">
            <div className="tf-side-card">
              <Text as="h3" variant="headingSm">
                {tr("section6.guide.title", "Guide")}
              </Text>

              <BlockStack gap="150" className="tf-guide-text" style={{ marginTop: 8 }}>
                <p>{tr("section6.guide.step1", "Choose your shipping type (free/paid).")}</p>
                <p>{tr("section6.guide.step2", "Pick a pricing mode: province, city, or cart amount.")}</p>
                <p>{tr("section6.guide.step3", "Add rates and keep entries clean.")}</p>
                <p>{tr("section6.guide.step4", "Use Advanced only if you need global rules.")}</p>
                <p>{tr("section6.guide.step5", "Save before leaving panels to avoid losing changes.")}</p>
              </BlockStack>
            </div>

            {dirty ? (
              <div className="tf-side-card">
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="warning">{tr("common.savebar.badgeUnsaved", "Unsaved")}</Badge>
                  <Text as="span" fontWeight="bold">
                    {tr("common.savebar.unsaved", "You have unsaved changes.")}
                  </Text>
                </InlineStack>
                <div style={{ marginTop: 10 }}>
                  <Button variant="primary" fullWidth onClick={saveGeo} loading={saving}>
                    {tr("common.save", "Save")}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
