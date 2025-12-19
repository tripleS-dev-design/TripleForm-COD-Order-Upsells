// ===== File: app/sections/Section6Geo.jsx =====
import React, { useEffect, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Badge,
} from "@shopify/polaris";
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

  /* HEADER — gradient comme Sheets */
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

  /* ===== Grille: nav gauche | contenu centre | guide droite ===== */
  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

  /* rail gauche */
  .tf-rail {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-rail-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    margin-bottom:12px;
  }
  .tf-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
  }
  .tf-rail-list {
    padding:8px;
    display:grid;
    gap:8px;
  }
  .tf-rail-item {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:8px 10px;
    cursor:pointer;
    font-size:13px;
  }
  .tf-rail-item[data-sel="1"] {
    outline:2px solid #2563EB;
    box-shadow:0 12px 26px rgba(37,99,235,.25);
  }

  /* Colonne centrale (contenu principal) */
  .tf-main-col {
    display:grid;
    gap:16px;
    min-width:0;
  }
  .tf-panel {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    min-width:0;
  }

  /* Colonne droite (guide) */
  .tf-side-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow-y:auto;
    overflow-x:hidden;
    width:320px;
    flex:none;
  }
  .tf-side-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    margin-bottom:12px;
  }

  /* TITRES — même bande que Sheets */
  .tf-group-title {
    padding:10px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:1px solid rgba(0,167,163,0.85);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:800;
    letter-spacing:.2px;
    margin-bottom:10px;
    box-shadow:0 6px 18px rgba(11,59,130,0.35);
  }

  .row-card {
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:10px;
    background:#FFF;
  }

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }
  }
`;

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

// Convert COUNTRY_DATA to GEO_COUNTRIES format
const GEO_COUNTRIES = Object.keys(COUNTRY_DATA).reduce((acc, countryCode) => {
  const country = COUNTRY_DATA[countryCode];
  acc[countryCode] = {
    label: country.label,
    provinces: Object.entries(country.provinces).map(([key, province]) => ({
      id: key.toLowerCase().replace(/_/g, '-'),
      name: province.label,
      cities: province.cities
    }))
  };
  return acc;
}, {});

function getCountryDef(code) {
  const c = (code || "MA").toUpperCase();
  return GEO_COUNTRIES[c] || GEO_COUNTRIES.MA;
}

function getProvinceOptions(countryCode) {
  const def = getCountryDef(countryCode);
  return (def.provinces || []).map((p) => ({
    label: p.name,
    value: p.name,
  }));
}

function getCityOptions(countryCode, provinceNameOrId) {
  if (!provinceNameOrId) return [];
  const def = getCountryDef(countryCode);
  const prov =
    (def.provinces || []).find(
      (p) => p.name === provinceNameOrId || p.id === provinceNameOrId
    ) || null;
  if (!prov) return [];
  return (prov.cities || []).map((city) => ({
    label: city,
    value: city,
  }));
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

const Grid2 = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

    // Livraison globale
    isFree: true,
    mode: "province", // price | province | city

    // Tarifs "par prix"
    priceBrackets: [
      { id: newId(), min: 0, max: 299, rate: 29 },
      { id: newId(), min: 299, max: null, rate: 0 },
    ],

    // Tarifs par province / wilaya - initialiser pour tous les pays
    provinceRates: Object.fromEntries(allCountries.map(c => [c, []])),

    // Tarifs par ville / baladiya - initialiser pour tous les pays
    cityRates: Object.fromEntries(allCountries.map(c => [c, []])),

    // Options avancées
    advanced: {
      defaultRate: 0,
      freeThreshold: null,
      minOrderAmount: 0,
      codExtraFee: 0,
      note: "",
    },
  };
}

/* ============================== HEADER SHELL ============================== */
function PageShell({ children, t, onSave, saving }) {
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
                {t("section6.header.appTitle")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section6.header.appSubtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
              {t("section6.header.pill")}
            </div>
            <Button
              variant="primary"
              size="slim"
              onClick={onSave}
              loading={saving}
            >
              {t("section6.buttons.saveStore")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ============================== Page ============================== */
export default function Section6Geo() {
  useInjectCss();
  const { t: rawT } = useI18n();

  // Wrapper sécurisé pour éviter les erreurs
  const t = (key, vars) => {
    try {
      return rawT(key, vars);
    } catch (e) {
      console.error("i18n error in Section6Geo for key:", key, e);
      return key;
    }
  };

  const [cfg, setCfg] = useState(() => defaultCfg());
  const [view, setView] = useState("province"); // price | province | city | advanced
  const [saving, setSaving] = useState(false);

  const countryDef = getCountryDef(cfg.country);
  const provinceOptions = getProvinceOptions(cfg.country);
  const provinceOptionsWithPlaceholder = [
    { label: t("section6.select.provincePlaceholder"), value: "" },
    ...provinceOptions,
  ];

  // ---------- LOAD: localStorage + server ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) localStorage (rapide)
    try {
      const s = window.localStorage.getItem("tripleform_cod_geo_min_v2");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === "object") {
          // S'assurer que tous les pays ont des tableaux dans provinceRates et cityRates
          const allCountries = Object.keys(GEO_COUNTRIES);
          const updated = { ...parsed };
          
          if (!updated.provinceRates) updated.provinceRates = {};
          if (!updated.cityRates) updated.cityRates = {};
          
          // Ajouter les pays manquants
          allCountries.forEach(country => {
            if (!updated.provinceRates[country]) {
              updated.provinceRates[country] = [];
            }
            if (!updated.cityRates[country]) {
              updated.cityRates[country] = [];
            }
          });
          
          setCfg((old) => ({ ...old, ...updated }));
        }
      }
    } catch {
      /* ignore */
    }

    // 2) serveur (metafield shop)
    let cancelled = false;
    async function loadFromServer() {
      try {
        const res = await fetch("/api/geo/load", {
          credentials: "include",
        });
        const json = await res.json().catch(() => ({}));
        if (!json?.ok || !json.geo || cancelled) return;
        
        // S'assurer que tous les pays ont des tableaux dans provinceRates et cityRates
        const allCountries = Object.keys(GEO_COUNTRIES);
        const updatedGeo = { ...json.geo };
        
        if (!updatedGeo.provinceRates) updatedGeo.provinceRates = {};
        if (!updatedGeo.cityRates) updatedGeo.cityRates = {};
        
        allCountries.forEach(country => {
          if (!updatedGeo.provinceRates[country]) {
            updatedGeo.provinceRates[country] = [];
          }
          if (!updatedGeo.cityRates[country]) {
            updatedGeo.cityRates[country] = [];
          }
        });
        
        setCfg((old) => ({ ...old, ...updatedGeo }));

        // sync localStorage
        try {
          window.localStorage.setItem(
            "tripleform_cod_geo",
            JSON.stringify(updatedGeo)
          );
        } catch {
          /* ignore */
        }
      } catch (e) {
        console.warn("[Section6Geo] load server failed:", e);
      }
    }

    loadFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- SAVE vers localStorage à chaque changement ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "tripleform_cod_geo",
        JSON.stringify(cfg)
      );
    } catch {
      /* ignore */
    }
  }, [cfg]);

  const saveGeo = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/geo/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ geo: cfg }),
      });
      const j = await res.json().catch(() => ({ ok: true }));
      if (!res.ok || j?.ok === false)
        throw new Error(j?.error || "Save failed");
      alert(t("section6.save.success"));
    } catch (e) {
      alert(
        t("section6.save.error", {
          error: e?.message || t("section6.save.unknownError"),
        })
      );
    } finally {
      setSaving(false);
    }
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
      priceBrackets: [
        ...c.priceBrackets,
        { id: newId(), min: 0, max: null, rate: 0 },
      ],
    }));
  const updBracket = (id, patch) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    }));
  const delBracket = (id) =>
    setCfg((c) => ({
      ...c,
      priceBrackets: c.priceBrackets.filter((b) => b.id !== id),
    }));

  // provinces for current country
  const curProv = cfg.provinceRates[cfg.country] || [];
  const setProv = (arr) =>
    setCfg((c) => ({
      ...c,
      provinceRates: { ...c.provinceRates, [c.country]: arr },
    }));
  const addProv = () =>
    setProv([...curProv, { id: newId(), code: "", name: "", rate: 0 }]);
  const updProv = (id, patch) =>
    setProv(curProv.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const delProv = (id) => setProv(curProv.filter((p) => p.id !== id));

  // cities for current country
  const curCity = cfg.cityRates[cfg.country] || [];
  const setCity = (arr) =>
    setCfg((c) => ({
      ...c,
      cityRates: { ...c.cityRates, [c.country]: arr },
    }));
  const addCity = () =>
    setCity([...curCity, { id: newId(), province: "", name: "", rate: 0 }]);
  const updCity = (id, patch) =>
    setCity(curCity.map((ci) => (ci.id === id ? { ...ci, ...patch } : ci)));
  const delCity = (id) => setCity(curCity.filter((ci) => ci.id !== id));

  /* ====== rail (panneaux) ====== */
  const panels = [
    { key: "province", label: t("section6.rail.panels.province") },
    { key: "city", label: t("section6.rail.panels.city") },
    { key: "price", label: t("section6.rail.panels.price") },
    { key: "advanced", label: t("section6.rail.panels.advanced") },
  ];

  const countBrackets = cfg.priceBrackets?.length || 0;
  const countProv = curProv.length;
  const countCity = curCity.length;

  const modeLabel = () => {
    if (cfg.mode === "price") return t("section6.mode.price");
    if (cfg.mode === "city") return t("section6.mode.city");
    return t("section6.mode.province");
  };

  const statusBadge = (enabled) => (
    <Badge tone={enabled ? "success" : "critical"}>
      {enabled ? t("section6.status.enabled") : t("section6.status.disabled")}
    </Badge>
  );

  // Obtenir la liste des pays pour le sélecteur
  const countryOptions = Object.entries(GEO_COUNTRIES).map(([code, data]) => ({
    label: data.label,
    value: code,
  }));

  /* ===================== RENDER ===================== */
  return (
    <PageShell t={t} onSave={saveGeo} saving={saving}>
      <div className="tf-editor">
        {/* ===== Rail gauche ===== */}
        <div className="tf-rail">
          {/* Menu panneaux */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">{t("section6.rail.title")}</div>
            <div className="tf-rail-list">
              {panels.map((it) => (
                <div
                  key={it.key}
                  className="tf-rail-item"
                  data-sel={view === it.key ? 1 : 0}
                  onClick={() => setView(it.key)}
                >
                  {it.label}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé livraison */}
          <div className="tf-rail-card">
            <div className="tf-rail-head">
              {t("section6.rail.summaryTitle")}
            </div>
            <div style={{ padding: 10 }}>
              <BlockStack gap="100">
                <InlineStack align="space-between">
                  <Text as="span">{t("section6.rail.type")}</Text>
                  <Badge>
                    {cfg.isFree
                      ? t("section6.rail.free")
                      : t("section6.rail.paid")}
                  </Badge>
                </InlineStack>
                {!cfg.isFree && (
                  <InlineStack align="space-between">
                    <Text as="span">{t("section6.rail.mode")}</Text>
                    <Badge>{modeLabel()}</Badge>
                  </InlineStack>
                )}
                {!cfg.isFree && (
                  <>
                    <InlineStack align="space-between">
                      <Text as="span">
                        {t("section6.rail.priceBrackets")}
                      </Text>
                      <Badge tone="info">{countBrackets}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span">{t("section6.rail.provinces")}</Text>
                      <Badge tone="info">{countProv}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span">{t("section6.rail.cities")}</Text>
                      <Badge tone="info">{countCity}</Badge>
                    </InlineStack>
                  </>
                )}
                <Text tone="subdued" as="p">
                  {t("section6.rail.countryCurrency", {
                    country: cfg.country || "—",
                    currency: cfg.currency || "—",
                  })}
                </Text>

                <InlineStack gap="200">
                  <Button
                    size="slim"
                    variant="primary"
                    onClick={saveGeo}
                    loading={saving}
                  >
                    {t("section6.buttons.saveStore")}
                  </Button>
                </InlineStack>
              </BlockStack>
            </div>
          </div>
        </div>

        {/* ===== Colonne centrale ===== */}
        <div className="tf-main-col">
          <div className="tf-panel">
            {/* Basique en haut : pays + gratuit/payant */}
            <GroupCard title={t("section6.general.title")}>
              <Grid3>
                <Select
                  label={t("section6.general.shippingType")}
                  value={cfg.isFree ? "free" : "paid"}
                  onChange={(v) => setRoot({ isFree: v === "free" })}
                  options={[
                    {
                      label: t("section6.general.freeOption"),
                      value: "free",
                    },
                    {
                      label: t("section6.general.paidOption"),
                      value: "paid",
                    },
                  ]}
                />
                <Select
                  label={t("section6.general.mainCountry")}
                  value={cfg.country}
                  onChange={setCountry}
                  options={[
                    {
                      label: t("section6.general.countries.selectPlaceholder"),
                      value: "",
                    },
                    ...countryOptions
                  ]}
                  helpText={t("section6.general.countryHelp")}
                />
                <TextField
                  label={t("section6.general.currency")}
                  value={cfg.currency}
                  onChange={(v) => setRoot({ currency: v })}
                  autoComplete="off"
                  helpText={t("section6.general.currencyHelp")}
                />
              </Grid3>

              {!cfg.isFree && (
                <Grid3>
                  <Select
                    label={t("section6.general.pricingMode")}
                    value={cfg.mode}
                    onChange={(v) => {
                      setRoot({ mode: v });
                      if (v === "price" || v === "province" || v === "city") {
                        setView(v);
                      }
                    }}
                    options={[
                      {
                        label: t("section6.general.modeProvince"),
                        value: "province",
                      },
                      {
                        label: t("section6.general.modeCity"),
                        value: "city",
                      },
                      {
                        label: t("section6.general.modePrice"),
                        value: "price",
                      },
                    ]}
                  />
                </Grid3>
              )}

              {cfg.isFree && (
                <Text tone="subdued" as="p">
                  {t("section6.general.freeShippingInfo")}
                </Text>
              )}
            </GroupCard>

            {/* Si gratuit → info simple */}
            {cfg.isFree && view !== "advanced" && (
              <GroupCard title={t("section6.general.info")}>
                <Text tone="subdued" as="p">
                  {t("section6.general.freeShippingDetails")}
                </Text>
              </GroupCard>
            )}

            {/* ===== Vue par province ===== */}
            {!cfg.isFree && view === "province" && (
              <GroupCard
                title={t("section6.province.title", {
                  country: countryDef.label,
                })}
              >
                <Text tone="subdued" as="p">
                  {t("section6.province.description")}
                </Text>
                <BlockStack gap="200">
                  {curProv.map((p) => (
                    <div className="row-card" key={p.id}>
                      <Grid3>
                        <Select
                          label={t("section6.province.provinceLabel")}
                          value={p.name || ""}
                          options={provinceOptionsWithPlaceholder}
                          onChange={(v) => updProv(p.id, { name: v })}
                          helpText={t("section6.province.provinceHelp")}
                        />
                        <TextField
                          label={t("section6.province.codeLabel")}
                          value={p.code}
                          onChange={(v) => updProv(p.id, { code: v })}
                          autoComplete="off"
                          helpText={t("section6.province.codeHelp")}
                        />
                        <TextField
                          type="number"
                          label={t("section6.province.rateLabel", {
                            currency: cfg.currency,
                          })}
                          value={String(p.rate)}
                          onChange={(v) =>
                            updProv(p.id, { rate: Number(v || 0) })
                          }
                          autoComplete="off"
                          helpText={t("section6.province.rateHelp")}
                        />
                      </Grid3>
                      <InlineStack align="end">
                        <Button
                          tone="critical"
                          onClick={() => delProv(p.id)}
                        >
                          {t("section6.buttons.deleteProvince")}
                        </Button>
                      </InlineStack>
                    </div>
                  ))}
                  <Button onClick={addProv}>
                    {t("section6.buttons.addProvince")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Vue par ville ===== */}
            {!cfg.isFree && view === "city" && (
              <GroupCard
                title={t("section6.city.title", {
                  country: countryDef.label,
                })}
              >
                <Text tone="subdued" as="p">
                  {t("section6.city.description")}
                </Text>
                <BlockStack gap="200">
                  {curCity.map((ci) => {
                    const cityOptions = getCityOptions(
                      cfg.country,
                      ci.province
                    );
                    const cityOptionsWithPlaceholder = [
                      { label: t("section6.select.cityPlaceholder"), value: "" },
                      ...cityOptions,
                    ];
                    return (
                      <div className="row-card" key={ci.id}>
                        <Grid3>
                          <Select
                            label={t("section6.city.provinceLabel")}
                            value={ci.province || ""}
                            options={provinceOptionsWithPlaceholder}
                            onChange={(v) =>
                              updCity(ci.id, {
                                province: v,
                                name: "",
                              })
                            }
                            helpText={t("section6.city.provinceHelp")}
                          />
                          <Select
                            label={t("section6.city.cityLabel")}
                            value={ci.name || ""}
                            options={cityOptionsWithPlaceholder}
                            onChange={(v) => updCity(ci.id, { name: v })}
                            disabled={!ci.province}
                            helpText={
                              ci.province
                                ? t("section6.city.cityHelpEnabled")
                                : t("section6.city.cityHelpDisabled")
                            }
                          />
                          <TextField
                            type="number"
                            label={t("section6.city.rateLabel", {
                              currency: cfg.currency,
                            })}
                            value={String(ci.rate)}
                            onChange={(v) =>
                              updCity(ci.id, { rate: Number(v || 0) })
                            }
                            autoComplete="off"
                            helpText={t("section6.city.rateHelp")}
                          />
                        </Grid3>
                        <InlineStack align="end">
                          <Button
                            tone="critical"
                            onClick={() => delCity(ci.id)}
                          >
                            {t("section6.buttons.deleteCity")}
                          </Button>
                        </InlineStack>
                      </div>
                    );
                  })}
                  <Button onClick={addCity}>
                    {t("section6.buttons.addCity")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Vue par prix ===== */}
            {!cfg.isFree && view === "price" && (
              <GroupCard title={t("section6.price.title")}>
                <Text tone="subdued" as="p">
                  {t("section6.price.description", {
                    currency: cfg.currency,
                  })}
                </Text>
                <BlockStack gap="200">
                  {(cfg.priceBrackets || []).map((b) => (
                    <div className="row-card" key={b.id}>
                      <Grid3>
                        <TextField
                          type="number"
                          label={t("section6.price.minAmount")}
                          value={b.min == null ? "" : String(b.min)}
                          onChange={(v) =>
                            updBracket(b.id, {
                              min: v === "" ? null : Number(v),
                            })
                          }
                          autoComplete="off"
                        />
                        <TextField
                          type="number"
                          label={t("section6.price.maxAmount")}
                          value={b.max == null ? "" : String(b.max)}
                          onChange={(v) =>
                            updBracket(b.id, {
                              max: v === "" ? null : Number(v),
                            })
                          }
                          autoComplete="off"
                          helpText={t("section6.price.maxHelp")}
                        />
                        <TextField
                          type="number"
                          label={t("section6.price.rateLabel", {
                            currency: cfg.currency,
                          })}
                          value={String(b.rate)}
                          onChange={(v) =>
                            updBracket(b.id, { rate: Number(v || 0) })
                          }
                          autoComplete="off"
                        />
                      </Grid3>
                      <InlineStack align="end">
                        <Button
                          tone="critical"
                          onClick={() => delBracket(b.id)}
                        >
                          {t("section6.buttons.deleteBracket")}
                        </Button>
                      </InlineStack>
                    </div>
                  ))}
                  <Button onClick={addBracket}>
                    {t("section6.buttons.addBracket")}
                  </Button>
                </BlockStack>
              </GroupCard>
            )}

            {/* ===== Options avancées ===== */}
            {view === "advanced" && (
              <GroupCard title={t("section6.advanced.title")}>
                <Grid3>
                  <TextField
                    type="number"
                    label={t("section6.advanced.defaultRate", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.defaultRate)}
                    onChange={(v) =>
                      setAdvanced({ defaultRate: Number(v || 0) })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.defaultRateHelp")}
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.freeThreshold", {
                      currency: cfg.currency,
                    })}
                    value={
                      cfg.advanced.freeThreshold == null
                        ? ""
                        : String(cfg.advanced.freeThreshold)
                    }
                    onChange={(v) =>
                      setAdvanced({
                        freeThreshold: v === "" ? null : Number(v),
                      })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.freeThresholdHelp")}
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.minOrderAmount", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.minOrderAmount)}
                    onChange={(v) =>
                      setAdvanced({ minOrderAmount: Number(v || 0) })
                    }
                    autoComplete="off"
                  />
                  <TextField
                    type="number"
                    label={t("section6.advanced.codExtraFee", {
                      currency: cfg.currency,
                    })}
                    value={String(cfg.advanced.codExtraFee)}
                    onChange={(v) =>
                      setAdvanced({ codExtraFee: Number(v || 0) })
                    }
                    autoComplete="off"
                    helpText={t("section6.advanced.codExtraFeeHelp")}
                  />
                </Grid3>
                <TextField
                  label={t("section6.advanced.note")}
                  value={cfg.advanced.note}
                  onChange={(v) => setAdvanced({ note: v })}
                  autoComplete="off"
                  multiline={3}
                  helpText={t("section6.advanced.noteHelp")}
                />

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    onClick={saveGeo}
                    loading={saving}
                  >
                    {t("section6.buttons.save")}
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
              {t("section6.guide.title")}
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}
            >
              <p>{t("section6.guide.step1")}</p>
              <p>{t("section6.guide.step2")}</p>
              <p>{t("section6.guide.step3")}</p>
              <p>{t("section6.guide.step4")}</p>
              <p>{t("section6.guide.step5")}</p>
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}