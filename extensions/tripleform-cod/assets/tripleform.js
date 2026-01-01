/* =========================================================================
   TripleForm COD — OFFERS + UPSELLS (FULL JS v33)
   ✅ Fix 1: Offers layout clean (image right, spacing, 1-line text, organized)
   ✅ Fix 2: Discount calc robust:
       - subtotal = unit * qty
       - percentage discount ok
       - fixed discount supports "value in currency" OR "value already in cents"
       - total = (subtotal - discount) + shipping
   ✅ Fix 3: Keep icons real (SVG) + fallback
   ========================================================================= */

window.TripleformCOD = (function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* reCAPTCHA script loader (v3)                                        */
  /* ------------------------------------------------------------------ */
  let recaptchaScriptPromise = null;

  function ensureRecaptchaScript(cfg) {
    if (!cfg || !cfg.enabled || !cfg.siteKey) return Promise.resolve();
    if (recaptchaScriptPromise) return recaptchaScriptPromise;

    recaptchaScriptPromise = new Promise((resolve, reject) => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src =
        "https://www.google.com/recaptcha/api.js?render=" +
        encodeURIComponent(cfg.siteKey);
      s.async = true;
      s.defer = true;
      s.onload = () => {
        if (window.grecaptcha && window.grecaptcha.execute) resolve();
        else reject(new Error("grecaptcha not available"));
      };
      s.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
      document.head.appendChild(s);
    });

    return recaptchaScriptPromise;
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  function byId(id) {
    return document.getElementById(id);
  }

  function css(s) {
    return String(s ?? "");
  }

  function safeJsonParse(raw, fallback = {}) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      try {
        return JSON.parse(String(raw).replace(/=>/g, ":"));
      } catch {
        return fallback;
      }
    }
  }

  function parseSettingsAttr(el) {
    const raw = el.getAttribute("data-settings") || "{}";
    const obj = safeJsonParse(raw, {});
    return obj && typeof obj === "object" ? obj : {};
  }

  function parseOffersAttr(el) {
    const raw = el.getAttribute("data-offers") || "{}";
    const obj = safeJsonParse(raw, {});
    return obj && typeof obj === "object" ? obj : {};
  }

  function fmtMoneyFactory(locale, currency) {
    const nf = new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: currency || "USD",
    });
    return (cents) => nf.format(Number(cents || 0) / 100);
  }

  function clamp01(x) {
    let v = Number(x);
    if (!Number.isFinite(v)) v = 0;
    if (v > 1) v = v / 100;
    if (v < 0) v = 0;
    if (v > 1) v = 1;
    return v;
  }

  function isFiniteNumber(n) {
    return typeof n === "number" && Number.isFinite(n);
  }

  /* ------------------------------------------------------------------ */
  /* Polaris-like SVG Icons (extended + fallback)                        */
  /* ------------------------------------------------------------------ */
  const ICON_SVGS = {
    AppsIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 9.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 15.5h4v1H5v-1Zm6 0h4v1h-4v-1Z"
        fill="currentColor" opacity=".9"/>
    </svg>`,

    CirclePlusIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,

    CheckCircleIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="m6.5 10.2 2.2 2.2 4.8-5.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    DiscountIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.2 10.2 4h5.8v5.8L9.8 16 4 10.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M13.5 6.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <path d="M6.2 14.2l8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    GiftCardIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 8h13V17a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M3.5 8V6.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M10 5.5V18" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7.2 5.2c0-1.2 1-2.2 2.2-2.2.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6 1.2 0 2.2 1 2.2 2.2 0 1-1 1.8-2.2 1.8H9.4c-1.2 0-2.2-.8-2.2-1.8Z"
        stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`,

    GlobeIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M2.5 10h15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M10 2c2.2 2.1 3.5 5 3.5 8s-1.3 5.9-3.5 8c-2.2-2.1-3.5-5-3.5-8S7.8 4.1 10 2Z"
        stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,
  };

  function normalizeIconName(name) {
    const raw = String(name || "").trim();
    if (!raw) return "";
    let n = raw.replace(/Major$/i, "").replace(/Minor$/i, "");

    const alias = {
      discount: "DiscountIcon",
      gift: "GiftCardIcon",
      globe: "GlobeIcon",
      country: "GlobeIcon",
      world: "GlobeIcon",
      earth: "GlobeIcon",
    };

    const k = n.toLowerCase().replace(/[^a-z]/g, "");
    if (alias[k]) return alias[k];
    if (!/Icon$/i.test(n)) n = n + "Icon";
    n = n[0].toUpperCase() + n.slice(1);
    return n;
  }

  function getIconHtml(iconName, size = 18, color = "currentColor") {
    const key = normalizeIconName(iconName);
    const svg = ICON_SVGS[key] || ICON_SVGS[String(iconName || "").trim()] || ICON_SVGS["AppsIcon"];
    const px = typeof size === "number" ? `${size}px` : css(size);
    return `
      <span class="tf-ic" style="width:${px};height:${px};color:${css(color)}">
        ${svg || ""}
      </span>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* CSS Injection                                                      */
  /* ------------------------------------------------------------------ */
  function injectGlobalCSSOnce() {
    if (document.getElementById("tf-global-css")) return;

    const style = document.createElement("style");
    style.id = "tf-global-css";
    style.textContent = `
      .tf-ic{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
      .tf-ic svg{width:100%;height:100%}

      /* OFFERS — cleaner layout */
      .tf-offers-container{display:grid;gap:12px;margin-bottom:16px}

      .tf-offer-card{
        border-radius:14px;
        border:1px solid #E5E7EB;
        padding:12px 12px;
        box-shadow:0 10px 22px rgba(15,23,42,0.06);
        background:#fff;
        overflow:hidden;
      }

      /* 3 columns: left icon, center text, right image */
      .tf-offer-row{
        display:grid;
        grid-template-columns:40px 1fr 92px;
        gap:12px;
        align-items:center;
      }

      .tf-offer-icon{
        width:36px;height:36px;border-radius:12px;
        display:grid;place-items:center;overflow:hidden;
        border:1px solid rgba(0,0,0,.10);
        background:#EEF2FF;
      }
      .tf-offer-icon img{width:100%;height:100%;object-fit:cover;display:block}

      .tf-offer-img{
        width:92px;height:92px;border-radius:16px;overflow:hidden;
        border:1px solid rgba(0,0,0,.08);background:#F3F4F6;
        justify-self:end;
      }
      .tf-offer-img img{width:100%;height:100%;object-fit:cover;display:block}

      .tf-offer-main{min-width:0}
      .tf-offer-title{
        font-weight:900;font-size:13px;color:#111827;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        line-height:1.25;
        margin-bottom:2px;
      }
      .tf-offer-desc{
        font-size:12px;color:#64748B;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        line-height:1.25;
      }

      .tf-offer-sub{font-size:11px;color:#94A3B8;margin-top:8px}

      .tf-offer-btn{
        margin-top:10px;border-radius:12px;padding:9px 10px;
        font-size:12px;font-weight:900;cursor:pointer;
        border:1px solid transparent;
        display:inline-flex;align-items:center;gap:8px;
        transition:all .15s ease;
        width:max-content;
        max-width:100%;
      }
      .tf-offer-btn:hover{transform:translateY(-1px);opacity:.95}

      [data-tf="discount-row"]{display:none}

      .offer-timer{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;margin-top:8px;padding:6px 10px;border-radius:10px}
      .timer-countdown{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:900;letter-spacing:.6px;margin-left:auto}
      .timer-minimal{background:#F9FAFB;color:#374151;border:1px solid #E5E7EB}
      .timer-urgent{background:linear-gradient(90deg,#991B1B,#DC2626);color:#fff;border:1px solid #FCA5A5;animation:tfBlink 1s infinite}
      @keyframes tfBlink{0%,100%{opacity:1}50%{opacity:.7}}

      /* Mobile: keep image right but smaller */
      @media (max-width:420px){
        .tf-offer-row{grid-template-columns:40px 1fr 78px}
        .tf-offer-img{width:78px;height:78px}
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /* Pays / wilayas / villes COMPLET                                    */
  /* ------------------------------------------------------------------ */

  const COUNTRY_DATA = {
    ma: {
      label: "Maroc",
      phonePrefix: "+212",
      provinces: [
        {
          id: "CASABLANCA",
          name: "Casablanca-Settat",
          cities: [
            "Casablanca", "Mohammedia", "Settat", "Berrechid", "El Jadida",
            "Benslimane", "Nouaceur", "Médiouna", "Sidi Bennour", "Dar Bouazza",
            "Lahraouyine", "Had Soualem", "Sidi Rahal", "Oulad Abbou"
          ]
        },
        {
          id: "RABAT",
          name: "Rabat-Salé-Kénitra",
          cities: [
            "Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Khémisset",
            "Sidi Slimane", "Sidi Kacem", "Tiflet", "Ain Aouda", "Harhoura",
            "Sidi Yahya Zaer", "Oulmès", "Sidi Allal El Bahraoui"
          ]
        },
        {
          id: "TANGER",
          name: "Tanger-Tétouan-Al Hoceïma",
          cities: [
            "Tanger", "Tétouan", "Al Hoceïma", "Larache", "Chefchaouen",
            "Ouazzane", "Fnideq", "M'diq", "Martil", "Ksar El Kebir", "Asilah",
            "Bni Bouayach", "Imzouren", "Bni Hadifa"
          ]
        },
        {
          id: "MARRAKECH",
          name: "Marrakech-Safi",
          cities: [
            "Marrakech", "Safi", "El Kelâa des Sraghna", "Essaouira", "Rehamna",
            "Youssoufia", "Chichaoua", "Al Haouz", "Rhamna", "Benguerir",
            "Sidi Bennour", "Smimou", "Tamanar", "Imintanoute"
          ]
        },
        {
          id: "FES",
          name: "Fès-Meknès",
          cities: [
            "Fès", "Meknès", "Ifrane", "Taza", "Sefrou", "Boulemane", "Taounate",
            "Guercif", "Moulay Yacoub", "El Hajeb", "Moulay Idriss Zerhoun",
            "Ouazzane", "Bhalil", "Aïn Cheggag"
          ]
        },
        {
          id: "ORIENTAL",
          name: "Région de l'Oriental",
          cities: [
            "Oujda", "Nador", "Berkane", "Taourirt", "Jerada", "Figuig",
            "Bouarfa", "Ahfir", "Driouch", "Beni Ensar", "Selouane",
            "Bouhdila", "Talsint", "Debdou"
          ]
        },
        {
          id: "SUSS",
          name: "Souss-Massa",
          cities: [
            "Agadir", "Inezgane", "Taroudant", "Tiznit", "Oulad Teima",
            "Biougra", "Ait Melloul", "Dcheira", "Temsia", "Ait Baha",
            "Chtouka Ait Baha", "Tafraout", "Aoulouz", "El Guerdane"
          ]
        },
        {
          id: "DRAATAF",
          name: "Drâa-Tafilalet",
          cities: [
            "Errachidia", "Ouarzazate", "Tinghir", "Midelt", "Zagora",
            "Rissani", "Alnif", "Boumalne Dades", "Kelaat M'Gouna", "Tinejdad",
            "Goulmima", "Jorf", "M'semrir", "Aït Benhaddou"
          ]
        }
      ]
    },

    dz: {
      label: "Algérie",
      phonePrefix: "+213",
      provinces: [
        {
          id: "ALGER",
          name: "Alger",
          cities: [
            "Alger Centre", "Bab El Oued", "El Harrach", "Kouba", "Hussein Dey",
            "Bordj El Kiffan", "Dar El Beïda", "Bouzaréah", "Birkhadem", "Chéraga",
            "Dellys", "Zeralda", "Staoueli", "Birtouta", "Ouled Fayet", "Draria", "Les Eucalyptus"
          ]
        },
        {
          id: "ORAN",
          name: "Oran",
          cities: [
            "Oran", "Es-Sénia", "Bir El Djir", "Gdyel", "Aïn El Turck", "Arzew",
            "Mers El Kébir", "Boutlelis", "Oued Tlelat", "Bethioua", "El Ançor",
            "Hassi Bounif", "Messerghin", "Boufatis", "Tafraoui"
          ]
        },
        {
          id: "CONSTANTINE",
          name: "Constantine",
          cities: [
            "Constantine", "El Khroub", "Hamma Bouziane", "Aïn Smara",
            "Zighoud Youcef", "Didouche Mourad", "Ibn Ziad", "Messaoud Boudjeriou",
            "Beni Hamidane", "Aïn Abid", "Ouled Rahmoun", "Ben Badis", "El Haria"
          ]
        },
        {
          id: "BLIDA",
          name: "Blida",
          cities: [
            "Blida", "Boufarik", "El Affroun", "Mouzaïa", "Ouled Yaïch",
            "Beni Mered", "Bouinan", "Soumaa", "Chebli", "Bougara",
            "Guerrouaou", "Hammam Melouane", "Beni Tamou", "Ben Khlil"
          ]
        },
        {
          id: "SETIF",
          name: "Sétif",
          cities: [
            "Sétif", "El Eulma", "Aïn Oulmene", "Bougaa", "Aïn Azel", "Amoucha",
            "Béni Aziz", "Guellal", "Hammam Soukhna", "Bouandas", "Taya", "Tella",
            "Babor", "Maoklane"
          ]
        },
        {
          id: "ANNABA",
          name: "Annaba",
          cities: [
            "Annaba", "El Bouni", "Sidi Amar", "Berrahal", "Treat", "Cheurfa",
            "Oued El Aneb", "Seraidi", "Ain Berda", "Chaiba", "El Hadjar", "Chetaibi"
          ]
        },
        {
          id: "BATNA",
          name: "Batna",
          cities: [
            "Batna", "Barika", "Merouana", "Arris", "N'Gaous", "Tazoult",
            "Aïn Touta", "Ouled Si Slimane", "Fesdis", "Timgad", "Ras El Aioun",
            "Maafa", "Lazrou", "Ouled Ammar"
          ]
        }
      ]
    },

    tn: {
      label: "Tunisie",
      phonePrefix: "+216",
      provinces: [
        {
          id: "TUNIS",
          name: "Tunis",
          cities: [
            "Tunis", "La Marsa", "Carthage", "Le Bardo", "Le Kram", "Sidi Bou Said",
            "Menzah", "Ariana", "El Menzah", "Mornaguia", "Mégrine", "Radès",
            "Djedeida", "El Omrane", "Ettahrir", "El Kabaria"
          ]
        },
        {
          id: "ARIANA",
          name: "Ariana",
          cities: [
            "Ariana", "Raoued", "La Soukra", "Kalaat El Andalous", "Sidi Thabet",
            "Ettadhamen", "Mnihla", "Borj El Amri", "Kalâat el-Andalous",
            "Sidi Amor", "El Battan", "Oued Ellil"
          ]
        },
        {
          id: "BEN_AROUS",
          name: "Ben Arous",
          cities: [
            "Ben Arous", "Ezzahra", "Rades", "Mégrine", "Hammam Lif", "Mornag",
            "Fouchana", "Khalidia", "Mhamdia", "Hammam Chott", "Bou Mhel el-Bassatine",
            "El Mida", "Mornaguia"
          ]
        },
        {
          id: "SFAX",
          name: "Sfax",
          cities: [
            "Sfax", "El Ain", "Agareb", "Mahres", "Sakiet Eddaïer", "Sakiet Ezzit",
            "Ghraiba", "Bir Ali Ben Khalifa", "Jebeniana", "Kerkennah", "Skhira",
            "Menzel Chaker", "Gremda", "Thyna"
          ]
        },
        {
          id: "SOUSSE",
          name: "Sousse",
          cities: [
            "Sousse", "Hammam Sousse", "Kalaa Kebira", "Kalaa Sghira", "Akouda",
            "M'saken", "Enfidha", "Bouficha", "Hergla", "Kondar", "Zaouiet Sousse",
            "Hammam Jedidi", "Sidi Bou Ali", "Messaadine"
          ]
        },
        {
          id: "BIZERTE",
          name: "Bizerte",
          cities: [
            "Bizerte", "Menzel Jemil", "Mateur", "Sejnane", "Ghar El Melh",
            "Ras Jebel", "Menzel Abderrahmane", "El Alia", "Tinja", "Utique",
            "Menzel Bourguiba", "Joumine", "Aousja", "Metline"
          ]
        }
      ]
    },

    eg: {
      label: "Égypte",
      phonePrefix: "+20",
      provinces: [
        {
          id: "CAIRO",
          name: "Le Caire",
          cities: [
            "Le Caire", "Nasr City", "Heliopolis", "Maadi", "Zamalek", "Dokki",
            "Giza", "Shubra", "Al Haram", "Al Mohandessin", "6 Octobre", "New Cairo",
            "Madinet Nasr", "Helwan", "Qalyub", "Shubra El Kheima", "Badr City"
          ]
        },
        {
          id: "ALEX",
          name: "Alexandrie",
          cities: [
            "Alexandrie", "Borg El Arab", "Abu Qir", "Al Amriya", "Al Agamy",
            "Montaza", "Al Mansheya", "Al Labban", "Kafr Abdo", "Sidi Gaber",
            "Smouha", "Miami", "Stanley", "Laurent", "Gleem", "Camp Caesar"
          ]
        },
        {
          id: "GIZA",
          name: "Gizeh",
          cities: [
            "Gizeh", "Sheikh Zayed City", "6th of October", "Al Haram",
            "Al Badrasheen", "Al Ayat", "Al Wahat Al Bahariya", "Al Saff",
            "Atfih", "Al Ayyat", "Awashim", "Kerdasa", "El Hawamdeya", "Osim"
          ]
        },
        {
          id: "SHARQIA",
          name: "Sharqia",
          cities: [
            "Zagazig", "10th of Ramadan City", "Belbeis", "Minya Al Qamh",
            "Al Ibrahimiyah", "Diarb Negm", "Husseiniya", "Mashtool El Souk",
            "Abu Hammad", "Abu Kebir", "Faqous", "El Salheya El Gedida"
          ]
        }
      ]
    },

    fr: {
      label: "France",
      phonePrefix: "+33",
      provinces: [
        {
          id: "IDF",
          name: "Île-de-France",
          cities: [
            "Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles", "Nanterre",
            "Créteil", "Bobigny", "Montreuil", "Argenteuil", "Courbevoic",
            "Asnières-sur-Seine", "Colombes", "Aubervilliers", "Saint-Maur-des-Fossés",
            "Issy-les-Moulineaux", "Levallois-Perret"
          ]
        },
        {
          id: "PACA",
          name: "Provence-Alpes-Côte d'Azur",
          cities: [
            "Marseille", "Nice", "Toulon", "Avignon", "Aix-en-Provence", "Antibes",
            "Cannes", "La Seyne-sur-Mer", "Hyères", "Arles", "Martigues", "Grasse",
            "Fréjus", "Antibes", "La Ciotat", "Cavaillon"
          ]
        },
        {
          id: "ARA",
          name: "Auvergne-Rhône-Alpes",
          cities: [
            "Lyon", "Grenoble", "Saint-Étienne", "Annecy", "Clermont-Ferrand",
            "Villeurbanne", "Valence", "Chambéry", "Roanne", "Bourg-en-Bresse",
            "Vénissieux", "Saint-Priest", "Caluire-et-Cuire", "Vaulx-en-Velin", "Meyzieu"
          ]
        },
        {
          id: "OCCITANIE",
          name: "Occitanie",
          cities: [
            "Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban",
            "Narbonne", "Carcassonne", "Albi", "Sète", "Lunel", "Agde", "Castres",
            "Mende", "Millau", "Foix"
          ]
        }
      ]
    },

    es: {
      label: "España",
      phonePrefix: "+34",
      provinces: [
        {
          id: "MADRID",
          name: "Comunidad de Madrid",
          cities: [
            "Madrid", "Alcalá de Henares", "Getafe", "Leganés", "Móstoles",
            "Fuenlabrada", "Alcorcón", "Parla", "Torrejón de Ardoz", "Coslada",
            "Las Rozas", "San Sebastián de los Reyes", "Alcobendas", "Pozuelo de Alarcón",
            "Rivas-Vaciamadrid"
          ]
        },
        {
          id: "CATALUNYA",
          name: "Cataluña",
          cities: [
            "Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Tarragona",
            "Sabadell", "Lleida", "Mataró", "Santa Coloma de Gramenet", "Reus",
            "Girona", "Sant Cugat", "Cornellà", "Sant Boi de Llobregat", "Rubí", "Manresa"
          ]
        },
        {
          id: "ANDALUCIA",
          name: "Andalucía",
          cities: [
            "Sevilla", "Málaga", "Granada", "Córdoba", "Jerez de la Frontera",
            "Almería", "Huelva", "Marbella", "Dos Hermanas", "Algeciras",
            "Cádiz", "Jaén", "Almería", "Mijas", "Fuengirola", "Chiclana de la Frontera"
          ]
        },
        {
          id: "VALENCIA",
          name: "Comunidad Valenciana",
          cities: [
            "Valencia", "Alicante", "Castellón de la Plana", "Elche", "Torrevieja",
            "Orihuela", "Gandia", "Benidorm", "Paterna", "Sagunto", "Alcoy",
            "Elda", "San Vicente del Raspeig", "Vila-real", "Burjassot"
          ]
        }
      ]
    },

    sa: {
      label: "Arabie Saoudite",
      phonePrefix: "+966",
      provinces: [
        {
          id: "RIYADH",
          name: "Riyadh",
          cities: [
            "Riyadh", "Al Kharj", "Al Majma'ah", "Dhurma", "Al Duwadimi",
            "Al Quway'iyah", "Al Muzahmiyah", "Wadi ad-Dawasir", "Al Hariq",
            "Al Sulayyil", "Al Aflaj", "Hotat Bani Tamim", "Al Diriyah", "Thadiq", "Huraymila"
          ]
        },
        {
          id: "MAKKAH",
          name: "Makkah",
          cities: [
            "Makkah", "Jeddah", "Taif", "Al Qunfudhah", "Al Lith", "Al Jumum",
            "Khulais", "Rabigh", "Turubah", "Al Kamel", "Bahra", "Adham",
            "Al Jumum", "Al Khurma", "Al Muwayh"
          ]
        },
        {
          id: "MADINAH",
          name: "Madinah",
          cities: [
            "Madinah", "Yanbu", "Al Ula", "Badr", "Mahd adh Dhahab", "Al Hinakiyah",
            "Wadi al-Fara'", "Al-Mahd", "Khaybar", "Al Henakiyah", "Al Suqiyah",
            "Al-Mahd", "Al-Ais", "Hegrah"
          ]
        },
        {
          id: "EASTERN",
          name: "Eastern Province",
          cities: [
            "Dammam", "Khobar", "Dhahran", "Jubail", "Qatif", "Hafr al-Batin",
            "Al Khafji", "Ras Tanura", "Abqaiq", "Al-'Udayd", "Nu'ayriyah",
            "Udhailiyah", "Al Qaryah", "Al Mubarraz", "Al Awamiyah"
          ]
        }
      ]
    },

    ae: {
      label: "Émirats Arabes Unis",
      phonePrefix: "+971",
      provinces: [
        {
          id: "DUBAI",
          name: "Dubai",
          cities: [
            "Dubai", "Jebel Ali", "Hatta", "Al Awir", "Al Lusayli", "Margham",
            "Al Khawaneej", "Al Qusais", "Al Barsha", "Al Warqaa", "Mirdif",
            "Nad Al Sheba", "Al Quoz", "Jumeirah", "Business Bay", "Dubai Marina"
          ]
        },
        {
          id: "ABU_DHABI",
          name: "Abu Dhabi",
          cities: [
            "Abu Dhabi", "Al Ain", "Madinat Zayed", "Gharbia", "Liwa Oasis",
            "Al Ruwais", "Al Mirfa", "Al Dhafra", "Al Samha", "Al Shawamekh",
            "Bani Yas", "Khalifa City", "Mohammed Bin Zayed City", "Shahama", "Al Wathba"
          ]
        },
        {
          id: "SHARJAH",
          name: "Sharjah",
          cities: [
            "Sharjah", "Khor Fakkan", "Kalba", "Dhaid", "Al Dhaid", "Al Hamriyah",
            "Al Madam", "Al Batayeh", "Al Sajaa", "Al Ghail", "Wasit", "Mleiha",
            "Al Nahda", "Al Qasimia", "Al Majaz"
          ]
        },
        {
          id: "AJMAN",
          name: "Ajman",
          cities: [
            "Ajman", "Masfout", "Manama", "Al Hamidiyah", "Al Zorah", "Al Mowaihat",
            "Al Jurf", "Al Hamidiya", "Al Rawda", "Al Nuaimiya"
          ]
        }
      ]
    },

    us: {
      label: "United States",
      phonePrefix: "+1",
      provinces: [
        {
          id: "CALIFORNIA",
          name: "California",
          cities: [
            "Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento",
            "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim",
            "Santa Ana", "Riverside", "Stockton", "Chula Vista", "Irvine", "Modesto"
          ]
        },
        {
          id: "NEW_YORK",
          name: "New York",
          cities: [
            "New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse",
            "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica",
            "White Plains", "Troy", "Niagara Falls", "Binghamton"
          ]
        },
        {
          id: "TEXAS",
          name: "Texas",
          cities: [
            "Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso",
            "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland",
            "Irving", "Amarillo", "Grand Prairie"
          ]
        },
        {
          id: "FLORIDA",
          name: "Florida",
          cities: [
            "Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "St. Petersburg",
            "Hialeah", "Port St. Lucie", "Cape Coral", "Fort Lauderdale",
            "Pembroke Pines", "Hollywood", "Miramar", "Gainesville"
          ]
        }
      ]
    },

    ng: {
      label: "Nigeria",
      phonePrefix: "+234",
      provinces: [
        {
          id: "LAGOS",
          name: "Lagos",
          cities: [
            "Lagos", "Ikeja", "Surulere", "Apapa", "Lekki", "Victoria Island",
            "Ajah", "Badagry", "Epe", "Ikorodu", "Agege", "Alimosho", "Kosofe",
            "Mushin", "Oshodi", "Somolu"
          ]
        },
        {
          id: "ABUJA",
          name: "Abuja",
          cities: [
            "Abuja", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa",
            "Jahi", "Lugbe", "Karu", "Nyanya", "Bwari", "Kuje", "Gwagwalada", "Kwali"
          ]
        },
        {
          id: "KANO",
          name: "Kano",
          cities: [
            "Kano", "Nassarawa", "Tarauni", "Dala", "Fagge", "Gwale", "Kumbotso",
            "Ungogo", "Dawakin Tofa", "Tofa", "Rimin Gado", "Bagwai", "Gezawa",
            "Gabasawa", "Minjibir"
          ]
        },
        {
          id: "RIVERS",
          name: "Rivers",
          cities: [
            "Port Harcourt", "Obio-Akpor", "Ikwerre", "Eleme", "Oyigbo", "Etche",
            "Omuma", "Okrika", "Ogu–Bolo", "Bonny", "Degema", "Asari-Toru",
            "Akuku-Toru", "Abua–Odual", "Ahoada"
          ]
        }
      ]
    },

    pk: {
      label: "Pakistan",
      phonePrefix: "+92",
      provinces: [
        {
          id: "PUNJAB",
          name: "Punjab",
          cities: [
            "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan",
            "Sialkot", "Bahawalpur", "Sargodha", "Sheikhupura", "Jhelum",
            "Gujrat", "Sahiwal", "Wah Cantonment", "Kasur", "Okara", "Chiniot"
          ]
        },
        {
          id: "SINDH",
          name: "Sindh",
          cities: [
            "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
            "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Tando Allahyar",
            "Tando Adam", "Badin", "Thatta", "Kotri"
          ]
        },
        {
          id: "KHYBER",
          name: "Khyber Pakhtunkhwa",
          cities: [
            "Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Bannu",
            "Swabi", "Dera Ismail Khan", "Charsadda", "Nowshera", "Mansehra",
            "Haripur", "Timergara", "Tank", "Hangu"
          ]
        },
        {
          id: "BALOCHISTAN",
          name: "Balochistan",
          cities: [
            "Quetta", "Turbat", "Khuzdar", "Chaman", "Gwadar", "Dera Murad Jamali",
            "Dera Allah Yar", "Usta Mohammad", "Sibi", "Loralai", "Zhob", "Pasni",
            "Qila Saifullah", "Khost", "Hub"
          ]
        }
      ]
    },

    in: {
      label: "India",
      phonePrefix: "+91",
      provinces: [
        {
          id: "DELHI",
          name: "Delhi",
          cities: [
            "New Delhi", "Delhi", "Dwarka", "Karol Bagh", "Rohini", "Pitampura",
            "Janakpuri", "Laxmi Nagar", "Saket", "Hauz Khas", "Malviya Nagar",
            "Patel Nagar", "Rajouri Garden", "Kalkaji", "Sarita Vihar", "Vasant Kunj"
          ]
        },
        {
          id: "MAHARASHTRA",
          name: "Maharashtra",
          cities: [
            "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
            "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Ulhasnagar", "Sangli",
            "Malegaon", "Jalgaon", "Akola", "Latur"
          ]
        },
        {
          id: "KARNATAKA",
          name: "Karnataka",
          cities: [
            "Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere",
            "Ballari", "Tumakuru", "Shivamogga", "Raichur", "Bidar", "Hospet",
            "Udupi", "Gadag-Betageri", "Robertson Pet", "Hassan"
          ]
        },
        {
          id: "TAMIL_NADU",
          name: "Tamil Nadu",
          cities: [
            "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
            "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi",
            "Dindigul", "Thanjavur", "Hosur", "Nagercoil", "Kanchipuram", "Kumarapalayam"
          ]
        }
      ]
    },

    id: {
      label: "Indonesia",
      phonePrefix: "+62",
      provinces: [
        {
          id: "JAKARTA",
          name: "Jakarta",
          cities: [
            "Jakarta", "Central Jakarta", "South Jakarta", "West Jakarta",
            "East Jakarta", "North Jakarta", "Thousand Islands", "Kebayoran Baru",
            "Tebet", "Cilandak", "Pasar Minggu", "Mampang", "Cengkareng",
            "Tanjung Priok", "Kelapa Gading"
          ]
        },
        {
          id: "WEST_JAVA",
          name: "West Java",
          cities: [
            "Bandung", "Bekasi", "Depok", "Bogor", "Cimahi", "Sukabumi",
            "Cirebon", "Tasikmalaya", "Karawang", "Purwakarta", "Subang",
            "Sumedang", "Garut", "Majalengka", "Cianjur", "Banjar"
          ]
        },
        {
          id: "CENTRAL_JAVA",
          name: "Central Java",
          cities: [
            "Semarang", "Surakarta", "Tegal", "Pekalongan", "Salatiga",
            "Magelang", "Kudus", "Jepara", "Rembang", "Blora", "Batang", "Pati",
            "Wonosobo", "Temanggung", "Boyolali", "Klaten"
          ]
        },
        {
          id: "EAST_JAVA",
          name: "East Java",
          cities: [
            "Surabaya", "Malang", "Kediri", "Mojokerto", "Jember", "Banyuwangi",
            "Madiun", "Pasuruan", "Probolinggo", "Blitar", "Lumajang", "Bondowoso",
            "Situbondo", "Tulungagung", "Tuban", "Lamongan"
          ]
        }
      ]
    },

    tr: {
      label: "Türkiye",
      phonePrefix: "+90",
      provinces: [
        {
          id: "ISTANBUL",
          name: "Istanbul",
          cities: [
            "Istanbul", "Kadıköy", "Beşiktaş", "Şişli", "Fatih", "Üsküdar",
            "Bakırköy", "Esenler", "Küçükçekmece", "Beyoğlu", "Zeytinburnu",
            "Maltepe", "Sarıyer", "Pendik", "Kartal", "Beylikdüzü"
          ]
        },
        {
          id: "ANKARA",
          name: "Ankara",
          cities: [
            "Ankara", "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan",
            "Altındağ", "Etimesgut", "Polatlı", "Gölbaşı", "Pursaklar", "Akyurt",
            "Kahramankazan", "Elmadağ", "Bala", "Ayaş"
          ]
        },
        {
          id: "IZMIR",
          name: "İzmir",
          cities: [
            "İzmir", "Bornova", "Karşıyaka", "Konak", "Buca", "Bayraklı",
            "Çiğli", "Balçova", "Narlıdere", "Gaziemir", "Güzelbahçe", "Urla",
            "Seferihisar", "Menderes", "Torbalı", "Bergama"
          ]
        },
        {
          id: "ANTALYA",
          name: "Antalya",
          cities: [
            "Antalya", "Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat",
            "Serik", "Kumluca", "Kaş", "Korkuteli", "Finike", "Gazipaşa",
            "Demre", "Akseki", "Elmalı", "Gündoğmuş"
          ]
        }
      ]
    },

    br: {
      label: "Brazil",
      phonePrefix: "+55",
      provinces: [
        {
          id: "SAO_PAULO",
          name: "São Paulo",
          cities: [
            "São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo",
            "Santo André", "Osasco", "Sorocaba", "Ribeirão Preto", "São José dos Campos",
            "Santos", "Mauá", "Diadema", "Jundiaí", "Barueri", "São Vicente", "Carapicuíba"
          ]
        },
        {
          id: "RIO_JANEIRO",
          name: "Rio de Janeiro",
          cities: [
            "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu",
            "Niterói", "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti",
            "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Mesquita",
            "Teresópolis", "Nilópolis"
          ]
        },
        {
          id: "MINAS_GERAIS",
          name: "Minas Gerais",
          cities: [
            "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim",
            "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares",
            "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité",
            "Poços de Caldas", "Patos de Minas"
          ]
        },
        {
          id: "BAHIA",
          name: "Bahia",
          cities: [
            "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari",
            "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié",
            "Alagoinhas", "Teixeira de Freitas", "Barreiras", "Porto Seguro",
            "Simões Filho", "Paulo Afonso", "Eunápolis"
          ]
        }
      ]
    }
  };

  function getCountryDef(beh) {
    const raw =
      beh && (beh.country || beh.codCountry)
        ? beh.country || beh.codCountry
        : "MA";

    const code = String(raw).toLowerCase();
    const def = COUNTRY_DATA[code] || COUNTRY_DATA.ma;

    return { ...def, code: (code || "ma").toUpperCase() };
  }


  /* ------------------------------------------------------------------ */
  /* Overlay helpers                                                    */
  /* ------------------------------------------------------------------ */
  function hexToRgba(hex, alpha) {
    try {
      let h = String(hex || "").trim();
      if (!h) return `rgba(0,0,0,${alpha})`;
      if (h[0] === "#") h = h.slice(1);
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      const num = parseInt(h, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    } catch {
      return `rgba(0,0,0,${alpha})`;
    }
  }

  function overlayBackground(beh) {
    const hex = beh?.overlayColor || "#020617";
    const op = clamp01(beh?.overlayOpacity ?? 0);
    return hexToRgba(hex, op);
  }

  function shadowFromEffect(cfg, baseColor) {
    const effect = cfg?.behavior?.effect || "none";
    const glowPx = cfg?.design?.glowPx || 18;
    if (effect === "glow") return `0 0 ${glowPx}px ${baseColor}`;
    if (effect === "light") return "0 10px 24px rgba(0,0,0,.12)";
    if (cfg?.design?.shadow) return "0 10px 24px rgba(0,0,0,.10)";
    return "none";
  }

  function popupSizeConfig(beh) {
    const size = beh?.popupSize || beh?.drawerSize || "md";
    switch (size) {
      case "sm":
        return { maxWidth: "95vw", maxHeight: "85vh" };
      case "lg":
        return { maxWidth: "95vw", maxHeight: "92vh" };
      case "full":
        return { maxWidth: "100%", maxHeight: "100vh" };
      default:
        return { maxWidth: "95vw", maxHeight: "90vh" };
    }
  }

  function drawerSizeConfig(beh) {
    const size = beh?.drawerSize || "md";
    switch (size) {
      case "sm":
        return { sideWidth: "min(380px, 95vw)" };
      case "lg":
        return { sideWidth: "min(500px, 95vw)" };
      case "full":
        return { sideWidth: "100%" };
      default:
        return { sideWidth: "min(450px, 95vw)" };
    }
  }

  /* ------------------------------------------------------------------ */
  /* Variant & qty helpers                                              */
  /* ------------------------------------------------------------------ */
  function getSelectedVariantId() {
    const sel = document.querySelector('form[action^="/cart/add"] select[name="id"]');
    if (sel && sel.value) return sel.value;

    const radio = document.querySelector('form[action^="/cart/add"] input[name="id"]:checked');
    if (radio && radio.value) return radio.value;

    const holder = document.querySelector(".tripleform-cod[data-variant-id]");
    return holder ? holder.getAttribute("data-variant-id") : null;
  }

  function getQty() {
    const q = document.querySelector('form[action^="/cart/add"] input[name="quantity"]');
    const v = Number(q && q.value ? q.value : 1);
    return v > 0 ? v : 1;
  }

  function watchVariantAndQty(onChange) {
    document.addEventListener("change", (e) => {
      if (e.target && (e.target.name === "id" || e.target.name === "quantity")) onChange();
    });
    document.addEventListener("input", (e) => {
      if (e.target && e.target.name === "quantity") onChange();
    });
    document.addEventListener("variant:change", onChange);
  }

  /* ------------------------------------------------------------------ */
  /* Timers                                                             */
  /* ------------------------------------------------------------------ */
  function TimerComponent(minutes, message, cssClass, timeFormat) {
    const container = document.createElement("div");
    container.className = `offer-timer ${cssClass || "timer-minimal"}`;
    let timeLeft = Math.max(0, Number(minutes || 0) * 60);

    function formatTime(seconds, format) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      switch (format) {
        case "hh[h] mm[m]":
          return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
        case "mm[m] ss[s]":
          return `${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
        case "hh[h]":
          return `${h.toString().padStart(2, "0")}h`;
        case "mm:ss":
        default:
          return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      }
    }

    function updateDisplay() {
      container.innerHTML = `
        <span>⏱️</span>
        <span>${css(message || "Offre limitée dans le temps!")}</span>
        <span class="timer-countdown">${formatTime(timeLeft, timeFormat)}</span>
      `;
    }

    updateDisplay();

    const interval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        container.innerHTML = `
          <span>⏱️</span>
          <span>Offre expirée</span>
          <span class="timer-countdown">00:00</span>
        `;
        return;
      }
      timeLeft--;
      updateDisplay();
    }, 1000);

    return container;
  }

  /* ------------------------------------------------------------------ */
  /* Offers activation + discount (SCOPED PER ROOT)                      */
  /* ------------------------------------------------------------------ */
  function lsKey(rootId, name) {
    return `tf_${name}_${rootId}`;
  }

  function toggleOfferActivation(button, offerIndex, offersList, root, updateMoney) {
    const rootId = root.id || "root";
    const storeKey = lsKey(rootId, "current_active_offer");
    const isActive = button.classList.contains("active");

    const allButtons = root.querySelectorAll("[data-tf-offer-toggle]");
    allButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
      const baseText = btn.getAttribute("data-tf-btn-label") || "Activer";
      btn.innerHTML = `${getIconHtml("CirclePlusIcon", 16, "currentColor")} ${css(baseText)}`;
    });

    localStorage.removeItem(storeKey);

    if (!isActive) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      button.innerHTML = `${getIconHtml("CheckCircleIcon", 16, "currentColor")} Activée`;

      const offer = offersList[offerIndex] || {};
      const discountEnabled = !!offer.discountEnabled;
      const discountType = offer.discountType || null; // "percentage" | "fixed"
      const discountValue = Number(offer.discountValue || 0);

      localStorage.setItem(
        storeKey,
        JSON.stringify({
          index: offerIndex,
          type: "offer",
          title: offer.title || "",
          discountEnabled,
          discountType,
          discountValue,
        })
      );
    }

    updateMoney();
  }

  function getActiveOfferDiscount(offersList, rootId) {
    const storeKey = lsKey(rootId, "current_active_offer");
    const raw = localStorage.getItem(storeKey);

    let active = null;
    if (raw) active = safeJsonParse(raw, null);

    let discountEnabled = false;
    let discountType = null;
    let discountValue = 0;

    if (active && typeof active === "object") {
      discountEnabled = !!active.discountEnabled;
      discountType = active.discountType || null;
      discountValue = Number(active.discountValue || 0);
    }

    return { discountEnabled, discountType, discountValue, activeOfferData: active };
  }

  /* ------------------------------------------------------------------ */
  /* OFFRES / UPSELL – HTML                                              */
  /* ------------------------------------------------------------------ */
  function fallbackImgSvg() {
    return (
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23EEF2FF'/%3E%3Cstop offset='1' stop-color='%23F8FAFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='220' rx='18' fill='url(%23g)'/%3E%3Cpath d='M120 92l40-40 80 80v72H80V92z' fill='%234F46E5' opacity='.9'/%3E%3Ccircle cx='110' cy='78' r='18' fill='%2399A7FF' opacity='.85'/%3E%3C/svg%3E"
    );
  }

  function pickColors(item, globalColors) {
    const useGlobal = item?.useGlobalColors !== false;
    const c = useGlobal ? (globalColors || {}) : (item?.colors || {});
    return {
      cardBg: c.cardBg || "#FFFFFF",
      borderColor: c.borderColor || "#E5E7EB",
      iconBg: c.iconBg || "#EEF2FF",
      buttonBg: c.buttonBg || "#111827",
      buttonTextColor: c.buttonTextColor || "#FFFFFF",
      buttonBorder: c.buttonBorder || (c.buttonBg || "#111827"),
    };
  }

  function buildOffersHtml(offersCfg, rootId) {
    if (!offersCfg || typeof offersCfg !== "object") return "";
    const global = offersCfg.global || {};
    if (global.enabled === false) return "";

    const globalColors = global.colors || {};
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    // ✅ keep original order, only hide disabled
    const activeOffers = offers.filter((o) => o && o.enabled !== false && o.showInPreview !== false);
    const activeUpsells = upsells.filter((u) => u && u.enabled !== false && u.showInPreview !== false);
    if (!activeOffers.length && !activeUpsells.length) return "";

    const storeKey = lsKey(rootId, "current_active_offer");
    const active = safeJsonParse(localStorage.getItem(storeKey), null);

    let html = `<div class="tf-offers-container">`;

    activeOffers.forEach((offer, idx) => {
      const title = offer.title || "Offre spéciale";
      const description = offer.description || "";
      const img = (offer.imageUrl || "").trim() || fallbackImgSvg();
      const iconUrl = (offer.iconUrl || "").trim();
      const c = pickColors(offer, globalColors);

      const isActive = active && Number(active.index) === idx && active.type === "offer";
      const btnLabel = offer.buttonText || "Activer";
      const hasTimer = !!offer.enableTimer;

      html += `
        <div class="tf-offer-card" style="background:${css(c.cardBg)};border-color:${css(c.borderColor)}">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              ${
                iconUrl
                  ? `<img src="${css(iconUrl)}" alt="" onerror="this.style.display='none'"/>`
                  : `${getIconHtml("DiscountIcon", 18, "#111827")}`
              }
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>

              ${hasTimer ? `<div data-tf-timer-offer="${idx}"></div>` : ""}

              <button
                type="button"
                class="tf-offer-btn ${isActive ? "active" : ""}"
                data-tf-offer-toggle="1"
                data-tf-offer-index="${idx}"
                data-tf-root-id="${css(rootId)}"
                data-tf-btn-label="${css(btnLabel)}"
                style="
                  background:${css(c.buttonBg)};
                  color:${css(c.buttonTextColor)};
                  border:1px solid ${css(c.buttonBorder)};
                "
                aria-pressed="${isActive ? "true" : "false"}"
              >
                ${
                  isActive
                    ? getIconHtml("CheckCircleIcon", 16, "currentColor")
                    : getIconHtml("CirclePlusIcon", 16, "currentColor")
                }
                ${isActive ? "Activée" : css(btnLabel)}
              </button>
            </div>

            <div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}"
                onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
            </div>
          </div>
        </div>
      `;
    });

    activeUpsells.forEach((upsell) => {
      const title = upsell.title || "Upsell";
      const description = upsell.description || "";
      const img = (upsell.imageUrl || "").trim() || fallbackImgSvg();
      const iconUrl = (upsell.iconUrl || "").trim();
      const c = pickColors(upsell, globalColors);

      html += `
        <div class="tf-offer-card" style="background:${css(c.cardBg)};border-color:${css(c.borderColor)}">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              ${
                iconUrl
                  ? `<img src="${css(iconUrl)}" alt="" onerror="this.style.display='none'"/>`
                  : `${getIconHtml("GiftCardIcon", 18, "#111827")}`
              }
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>
            </div>

            <div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}"
                onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  function initializeTimers(root, offersCfg) {
    if (!offersCfg || typeof offersCfg !== "object") return;
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    offers
      .filter((o) => o && o.enabled !== false && o.showInPreview !== false)
      .forEach((offer, idx) => {
        if (offer.enableTimer) {
          const holder = root.querySelector(`[data-tf-timer-offer="${idx}"]`);
          if (holder) {
            holder.appendChild(
              TimerComponent(
                offer.timerMinutes || 60,
                offer.timerMessage || "Offre limitée dans le temps!",
                offer.timerCssClass || "timer-minimal",
                offer.timerTimeFormat || "mm:ss"
              )
            );
          }
        }
      });
  }

  /* ------------------------------------------------------------------ */
  /* Dropdown wilaya / ville                                            */
  /* ------------------------------------------------------------------ */
  function setupLocationDropdowns(root, cfg, countryDef) {
    const beh = cfg.behavior || {};
    const def = countryDef || getCountryDef(beh);
    const provinces = def.provinces || [];

    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');
    if (!provSelect && !citySelect) return;

    function resetSelect(el, placeholder) {
      if (!el) return;
      el.innerHTML = "";
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = placeholder;
      el.appendChild(opt);
    }

    function fillProvinces() {
      if (!provSelect) return;
      resetSelect(provSelect, cfg.fields?.province?.ph || "Wilaya / Province");
      provinces.forEach((p) => {
        const o = document.createElement("option");
        o.value = p.name;
        o.textContent = p.name;
        provSelect.appendChild(o);
      });
    }

    function fillCities(provinceName) {
      if (!citySelect) return;
      resetSelect(
        citySelect,
        provinceName ? (cfg.fields?.city?.ph || "Select city") : (cfg.fields?.city?.ph || "Select province first")
      );
      if (!provinceName) return;
      const prov = provinces.find((p) => p.name === provinceName);
      if (!prov) return;
      (prov.cities || []).forEach((city) => {
        const o = document.createElement("option");
        o.value = city;
        o.textContent = city;
        citySelect.appendChild(o);
      });
    }

    fillProvinces();
    fillCities("");

    if (provSelect) provSelect.addEventListener("change", (e) => fillCities(e.target.value || ""));
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  function render(root, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg) {
    const d = cfg.design || {};
    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    const f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";

    const hpState = { startTime: Date.now(), mouseMoved: false };
    window.addEventListener(
      "mousemove",
      () => {
        hpState.mouseMoved = true;
      },
      { once: true }
    );

    const countryDef = getCountryDef(beh);
    const pageStart = Date.now();

    const geoEndpointAttr = root.getAttribute("data-geo-endpoint") || "";
    const geoEnabledAttr = root.getAttribute("data-geo-enabled") || "";
    const geoCountryAttr = root.getAttribute("data-geo-country") || countryDef.code;

    const geoEnabled =
      !!geoEndpointAttr && (geoEnabledAttr === "1" || geoEnabledAttr === "true" || geoEnabledAttr === "yes");

    const geoEndpoint = geoEndpointAttr || "";
    let geoShippingCents = null;
    let geoNote = "";
    let geoRequestId = 0;

    const baseGlow = (d.btnBg && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(d.btnBg) ? d.btnBg : "#0B3B82");
    const cardShadow = shadowFromEffect(cfg, baseGlow);
    const cartShadow = shadowFromEffect(cfg, baseGlow);
    const rowShadow = shadowFromEffect(cfg, baseGlow);
    const btnShadow = shadowFromEffect(cfg, baseGlow);
    const ovBg = overlayBackground(beh);
    const popupCfg = popupSizeConfig(beh);
    const drawerCfg = drawerSizeConfig(beh);

    const rawDirection = d.direction || d.textDirection || beh.textDirection || "ltr";
    const textDir = String(rawDirection).toLowerCase() === "rtl" ? "rtl" : "ltr";

    const rawTitleAlign = d.titleAlign || beh.titleAlign || d.textAlign || beh.textAlign || "left";
    const titleAlignValue = String(rawTitleAlign).toLowerCase();
    const titleAlign = titleAlignValue === "center" ? "center" : titleAlignValue === "right" ? "right" : "left";

    const rawFieldAlign = d.fieldAlign || beh.fieldAlign || titleAlign;
    const fieldAlignValue = String(rawFieldAlign).toLowerCase();
    const fieldAlign = fieldAlignValue === "right" ? "right" : "left";

    const rawInputFont = d.fontSize || d.inputFontSize || beh.fontSize || 16;
    const inputFontSize = Number(rawInputFont) || 16;

    const labelFontSize = `${Math.max(inputFontSize - 1, 11)}px`;
    const smallFontSize = `${Math.max(inputFontSize - 2, 10)}px`;
    const tinyFontSize = `${Math.max(inputFontSize - 3, 9)}px`;

    const cardStyle = `
      background:${css(d.bg)}; color:${css(d.text)};
      border:1px solid ${css(d.border)};
      border-radius:${+d.radius || 12}px;
      padding:${+d.padding || 16}px;
      box-shadow:${cardShadow};
      direction:${textDir};
      font-size:${inputFontSize}px;
      max-width:100%;
      box-sizing:border-box;
    `;

    const inputHeight = `${+d.btnHeight || 46}px`;
    const inputStyle = `
      width:100%;
      height:${inputHeight};
      padding:0 12px;
      border-radius:${+d.btnRadius || 10}px;
      border:1px solid ${css(d.inputBorder)};
      background:${css(d.inputBg)};
      color:${css(d.text)};
      outline:none;
      text-align:${fieldAlign};
      font-size:${inputFontSize}px;
      box-sizing:border-box;
      line-height:normal;
    `;

    const textareaStyle = `
      width:100%;
      padding:12px;
      border-radius:${+d.btnRadius || 10}px;
      border:1px solid ${css(d.inputBorder)};
      background:${css(d.inputBg)};
      color:${css(d.text)};
      outline:none;
      text-align:${fieldAlign};
      font-size:${inputFontSize}px;
      box-sizing:border-box;
      min-height:100px;
      resize:vertical;
    `;

    const btnStyle = `
      width:100%;
      height:${inputHeight};
      border-radius:${+d.btnRadius || 10}px;
      border:1px solid ${css(d.btnBorder || d.btnBg || "#0B3B82")};
      color:${css(d.btnText || "#fff")};
      background:${css(d.btnBg || "#0B3B82")};
      font-weight:900;
      letter-spacing:.2px;
      box-shadow:${btnShadow};
      font-size:${inputFontSize}px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:10px;
      cursor:pointer;
      box-sizing:border-box;
    `;

    const cartBoxStyle = `
      background:${css(d.cartBg)};
      border:1px solid ${css(d.cartBorder)};
      border-radius:12px;
      padding:14px;
      box-shadow:${cartShadow};
      font-size:${labelFontSize};
      direction:${textDir};
      box-sizing:border-box;
    `;

    const cartTitleStyle = `
      font-weight:800;
      margin-bottom:10px;
      color:${css(d.cartTitleColor)};
      font-size:${labelFontSize};
      text-align:${titleAlign};
      display:flex;
      align-items:center;
      gap:10px;
    `;

    const rowStyle = `
      display:grid; grid-template-columns:1fr auto;
      gap:8px; align-items:center;
      padding:8px 10px;
      border:1px solid ${css(d.cartRowBorder)};
      border-radius:10px;
      background:${css(d.cartRowBg)};
      color:${css(d.cartTextColor)};
      box-shadow:${rowShadow};
      font-size:${labelFontSize};
      box-sizing:border-box;
    `;

    const offersHtml = buildOffersHtml(offersCfg || {}, root.id);

    function orderedFieldKeys() {
      const metaOrder = (cfg.meta && cfg.meta.fieldsOrder) || [];
      const allKeys = Object.keys(f || {});
      if (!metaOrder.length) return allKeys;
      const first = metaOrder.filter((k) => allKeys.includes(k));
      const rest = allKeys.filter((k) => !metaOrder.includes(k));
      return [...first, ...rest];
    }

    function fieldHTML(key) {
      const field = f[key];
      if (!field || field.on === false) return "";

      const iconName = field.icon || (key === "country" ? "GlobeIcon" : "");
      const iconHtml = iconName ? getIconHtml(iconName, 18, "#111827") : "";

      const req = field.required ? " *" : "";
      const label = (field.label || key) + req;
      const ph = field.ph || "";
      const requiredAttr = field.required ? " required" : "";

      const fieldContainerStyle = `
        display:grid;
        grid-template-columns:auto 1fr;
        gap:10px;
        align-items:center;
        margin-bottom:12px;
      `;

      const labelStyle = `
        display:block;
        font-size:${labelFontSize};
        color:#475569;
        text-align:${fieldAlign};
        margin-bottom:4px;
        font-weight:600;
      `;

      if (key === "province") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <select data-tf-role="province" data-tf-field="${key}" style="${inputStyle}" ${requiredAttr}>
                <option value="">${css(ph || "Wilaya / Province")}</option>
              </select>
            </div>
          </div>
        `;
      }

      if (key === "city") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <select data-tf-role="city" data-tf-field="${key}" style="${inputStyle}" ${requiredAttr}>
                <option value="">${css(ph || "Select province first")}</option>
              </select>
            </div>
          </div>
        `;
      }

      if (field.type === "textarea") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:100px; display:flex; align-items:flex-start; justify-content:center; padding-top:12px;">
              ${iconHtml}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <textarea data-tf-field="${key}" style="${textareaStyle}" rows="3" placeholder="${css(ph)}" ${requiredAttr}></textarea>
            </div>
          </div>
        `;
      }

      const typeAttr = field.type === "number" ? 'type="number"' : 'type="text"';

      return `
        <div style="${fieldContainerStyle}">
          <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
            ${iconHtml}
          </div>
          <div style="flex:1;">
            <label style="${labelStyle}">${css(label)}</label>
            <input ${typeAttr} data-tf-field="${key}" style="${inputStyle}" placeholder="${css(ph)}" ${requiredAttr} />
          </div>
        </div>
      `;
    }

    function fieldsBlockHTML() {
      return orderedFieldKeys().map((k) => fieldHTML(k)).join("");
    }

    function cartSummaryHTML() {
      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">
            ${css(t.top || "Order summary")}
          </div>
          <div style="display:grid; gap:8px;">
            <div style="${rowStyle}">
              <div>${css(t.price || "Product price")}</div>
              <div style="font-weight:800;" data-tf="price">—</div>
            </div>

            <div style="${rowStyle}">
              <div>
                <div>${css(t.shipping || "Shipping price")}</div>
                <div data-tf="shipping-note" style="font-size:${tinyFontSize};opacity:.8;margin-top:2px;"></div>
              </div>
              <div style="font-weight:800;" data-tf="shipping">${css(t.shippingToCalculate || "Shipping to calculate")}</div>
            </div>

            <div style="${rowStyle}" data-tf="discount-row">
              <div>${css(t.discountLabel || "Remise")}</div>
              <div style="font-weight:900; color:#10B981;" data-tf="discount">—</div>
            </div>

            <div style="${rowStyle}">
              <div>${css(t.total || "Total")}</div>
              <div style="font-weight:900;" data-tf="total">—</div>
            </div>
          </div>
        </div>
      `;
    }

    const mainStart = `<div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};box-sizing:border-box;">`;
    const mainEnd = `</div>`;

    let html = "";
    if (styleType === "inline") {
      html = mainStart + offersHtml + cartSummaryHTML() + `<div style="height:8px"></div>` + `<div style="${cardStyle}" data-tf-role="form-card">${fieldsBlockHTML()}</div>` + mainEnd;
    } else if (styleType === "popup") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        mainEnd +
        `
        <div data-tf-role="popup" style="
          position:fixed; inset:0; display:none; align-items:center; justify-content:center;
          z-index:999999; background:${ovBg}; padding:20px; box-sizing:border-box;">
          <div style="
            width:100%; max-width:${popupCfg.maxWidth}; max-height:${popupCfg.maxHeight};
            box-sizing:border-box; position:relative; background:${css(d.bg)};
            border-radius:${+d.radius || 12}px; box-shadow:${cardShadow}; overflow:auto;">
            <div style="padding:24px; box-sizing:border-box;">
              <div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="${cardStyle}" data-tf-role="form-card">${fieldsBlockHTML()}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        mainEnd +
        `
        <div data-tf-role="drawer-overlay" style="
          position:fixed; inset:0; display:none; z-index:999999;
          background:${ovBg}; overflow:hidden; padding:0;">
          <div data-tf-role="drawer" style="
            position:absolute; top:0; bottom:0; right:0; width:${drawerCfg.sideWidth};
            max-height:100%; background:${css(d.bg)}; box-shadow:0 0 40px rgba(15,23,42,0.65);
            display:flex; flex-direction:column; padding:0; box-sizing:border-box;
            transform:translateX(100%); transition:transform 260ms ease; overflow:hidden;">
            <div style="padding:24px; overflow:auto; flex:1; box-sizing:border-box;">
              <div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="${cardStyle}" data-tf-role="form-card">${fieldsBlockHTML()}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = html;
    setTimeout(() => initializeTimers(root, offersCfg), 80);
    setupLocationDropdowns(root, cfg, countryDef);

    /* --------------------- Product totals (robust) -------------------- */
    function parseVariantPriceToCents(priceAny) {
      if (priceAny == null) return 0;

      let rawStr = String(priceAny).trim();
      if (!rawStr) return 0;

      // normalize commas
      rawStr = rawStr.replace(",", ".");

      const rawNum = Number(rawStr);
      if (!Number.isFinite(rawNum)) return 0;

      // if contains ".", treat as currency units
      if (rawStr.includes(".")) return Math.round(rawNum * 100);

      // integer => could be cents (Shopify product json)
      return Math.round(rawNum);
    }

    function computeProductTotals() {
      const vId = getVariant();
      const qty = getQty();

      const variants = Array.isArray(product?.variants) ? product.variants : [];
      const variant = variants.find((v) => String(v.id) === String(vId)) || variants[0] || null;

      const unitPriceCents = parseVariantPriceToCents(variant && variant.price != null ? variant.price : 0);
      const safeQty = isFiniteNumber(qty) && qty > 0 ? qty : 1;

      const subtotalCents = (isFiniteNumber(unitPriceCents) ? unitPriceCents : 0) * safeQty;

      return {
        unitPriceCents: isFiniteNumber(unitPriceCents) ? unitPriceCents : 0,
        subtotalCents: isFiniteNumber(subtotalCents) ? subtotalCents : 0,
        qty: safeQty,
        variantId: vId,
      };
    }

    /* --------------------- Discount (FIXED robust) -------------------- */
    const offersVisible = Array.isArray(offersCfg?.offers) ? offersCfg.offers : [];
    const activeOffersOnly = offersVisible.filter((o) => o && o.enabled !== false && o.showInPreview !== false);

    function fixedDiscountToCents(discountValue, subtotalCents) {
      const v = Number(discountValue || 0);
      if (!Number.isFinite(v) || v <= 0) return 0;

      // ✅ Heuristic:
      // If v*100 <= subtotalCents => v is currency units (MAD) -> convert to cents
      // Else => v is already cents
      const asCurrencyCents = Math.round(v * 100);
      if (asCurrencyCents <= subtotalCents) return asCurrencyCents;
      return Math.round(v);
    }

    function computeDiscountCents(subtotalCents, rootId) {
      const { discountEnabled, discountType, discountValue } = getActiveOfferDiscount(activeOffersOnly, rootId);
      if (!discountEnabled) return 0;
      if (!discountType || !(discountValue > 0)) return 0;

      if (discountType === "percentage") {
        return Math.round(subtotalCents * (Number(discountValue) / 100));
      }

      if (discountType === "fixed") {
        return fixedDiscountToCents(discountValue, subtotalCents);
      }

      return 0;
    }

    /* --------------------- Geo shipping (unchanged) ------------------- */
    async function recalcGeo() {
      if (!geoEnabled || !geoEndpoint) {
        geoShippingCents = null;
        geoNote = "";
        updateMoney();
        return;
      }

      const reqId = ++geoRequestId;
      const totals = computeProductTotals();
      const baseTotalCents = totals.subtotalCents;

      const province = (root.querySelector('[data-tf-field="province"]')?.value || "").trim();
      const city = (root.querySelector('[data-tf-field="city"]')?.value || "").trim();

      if (!province || !city) {
        if (reqId !== geoRequestId) return;
        geoShippingCents = null;
        geoNote = "";
        updateMoney();
        return;
      }

      try {
        const url = new URL(geoEndpoint, window.location.origin);
        url.searchParams.set("country", geoCountryAttr || "");
        url.searchParams.set("province", province || "");
        url.searchParams.set("city", city || "");
        url.searchParams.set("subtotalCents", String(baseTotalCents || 0));

        const res = await fetch(url.toString(), { method: "GET", credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (reqId !== geoRequestId) return;

        if (!res.ok || json.ok === false) {
          geoShippingCents = null;
          geoNote = "";
        } else {
          const shippingObj = json.shipping || {};
          let shippingCents = 0;
          let codFeeCents = 0;

          if (shippingObj.amount != null) {
            const amount = Number(shippingObj.amount);
            if (Number.isFinite(amount) && amount > 0) shippingCents = Math.round(amount * 100);
          }
          if (shippingObj.codExtraFee != null) {
            const codAmount = Number(shippingObj.codExtraFee);
            if (Number.isFinite(codAmount) && codAmount > 0) codFeeCents = Math.round(codAmount * 100);
          }

          geoNote = shippingObj.note || json.note || json.message || "";
          geoShippingCents = shippingCents + codFeeCents;
        }
      } catch {
        if (reqId !== geoRequestId) return;
        geoShippingCents = null;
        geoNote = "";
      }

      updateMoney();
    }

    /* --------------------- UI money update (correct) ------------------ */
    function updateMoney() {
      const totals = computeProductTotals();
      const subtotalCents = isFiniteNumber(totals.subtotalCents) ? totals.subtotalCents : 0;

      const discountCents = computeDiscountCents(subtotalCents, root.id);
      const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents);

      const shippingCents = geoShippingCents == null ? 0 : geoShippingCents;
      const grandTotalCents = discountedSubtotalCents + shippingCents;

      root.querySelectorAll('[data-tf="price"]').forEach((el) => (el.textContent = moneyFmt(subtotalCents)));
      root.querySelectorAll('[data-tf="total"]').forEach((el) => (el.textContent = moneyFmt(grandTotalCents)));

      const discountRow = root.querySelector('[data-tf="discount-row"]');
      const discountAmount = root.querySelector('[data-tf="discount"]');
      if (discountRow) {
        if (discountCents > 0) {
          discountRow.style.display = "grid";
          if (discountAmount) discountAmount.textContent = "-" + moneyFmt(discountCents);
        } else {
          discountRow.style.display = "none";
        }
      }

      let shippingText = "";
      if (geoShippingCents === null) shippingText = css(t.shippingToCalculate || "Shipping to calculate");
      else if (geoShippingCents === 0) shippingText = css(t.freeShipping || "Free");
      else shippingText = moneyFmt(geoShippingCents);

      root.querySelectorAll('[data-tf="shipping"]').forEach((el) => (el.textContent = shippingText));
      root.querySelectorAll('[data-tf="shipping-note"]').forEach((el) => (el.textContent = geoNote || ""));
    }

    /* --------------------- Offer activation click --------------------- */
    root.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("[data-tf-offer-toggle]") : null;
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const offerIndex = parseInt(btn.getAttribute("data-tf-offer-index") || "0", 10);
      if (!Number.isFinite(offerIndex)) return;

      toggleOfferActivation(btn, offerIndex, activeOffersOnly, root, updateMoney);
    });

    // initial
    updateMoney();
    if (geoEnabled) recalcGeo();

    return function handleTotalsChange() {
      updateMoney();
      if (geoEnabled) recalcGeo();
    };
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                              */
  /* ------------------------------------------------------------------ */
  function boot(sectionId) {
    const holder = byId(`tripleform-cod-${sectionId}`) || document.querySelector(".tripleform-cod");
    if (!holder) return;

    injectGlobalCSSOnce();

    const cfg = parseSettingsAttr(holder);
    const offersCfg = parseOffersAttr(holder);

    const currency = holder.getAttribute("data-currency") || "USD";
    const locale = holder.getAttribute("data-locale") || "en";
    const moneyFmt = fmtMoneyFactory(locale, currency);

    const recaptchaEnabledAttr = holder.getAttribute("data-recaptcha-enabled");
    const recaptchaEnabled =
      recaptchaEnabledAttr === "true" || recaptchaEnabledAttr === "1" || recaptchaEnabledAttr === "yes";

    const recaptchaVersion = holder.getAttribute("data-recaptcha-version") || "";
    const recaptchaSiteKey = holder.getAttribute("data-recaptcha-site-key") || "";
    const recaptchaMinScoreAttr = holder.getAttribute("data-recaptcha-min-score");
    const recaptchaMinScore = recaptchaMinScoreAttr ? Number(recaptchaMinScoreAttr) : 0.5;

    const recaptchaCfg = {
      enabled: recaptchaEnabled && !!recaptchaSiteKey,
      version: recaptchaVersion || "v3",
      siteKey: recaptchaSiteKey,
      minScore: isNaN(recaptchaMinScore) ? 0.5 : recaptchaMinScore,
    };

    const prodEl = byId(`tf-product-json-${sectionId}`);
    if (!prodEl) {
      console.error("[Tripleform COD] product JSON introuvable");
      return;
    }
    const product = safeJsonParse(prodEl.textContent || "{}", { variants: [] });

    const getVariant = () => getSelectedVariantId() || holder.getAttribute("data-variant-id");

    const doUpdate = render(holder, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg);
    watchVariantAndQty(() => doUpdate());
  }

  return { boot };
})()