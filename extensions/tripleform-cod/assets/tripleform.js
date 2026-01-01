window.TripleformCOD = (function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* reCAPTCHA script loader (v3)                                       */
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
        if (window.grecaptcha && window.grecaptcha.execute) {
          resolve();
        } else {
          reject(new Error("grecaptcha not available"));
        }
      };
      s.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
      document.head.appendChild(s);
    });

    return recaptchaScriptPromise;
  }

  /* ------------------------------------------------------------------ */
  /* Helpers généraux                                                   */
  /* ------------------------------------------------------------------ */

  function byId(id) {
    return document.getElementById(id);
  }

  function parseSettingsAttr(el) {
    const raw = el.getAttribute("data-settings") || "{}";
    try {
      return JSON.parse(raw);
    } catch {
      try {
        return JSON.parse(raw.replace(/=>/g, ":"));
      } catch (e2) {
        console.error("[Tripleform COD] JSON settings invalide:", raw, e2);
        return {};
      }
    }
  }

  function parseOffersAttr(el) {
    const raw = el.getAttribute("data-offers") || "{}";
    try {
      return JSON.parse(raw);
    } catch {
      try {
        return JSON.parse(raw.replace(/=>/g, ":"));
      } catch (e2) {
        console.warn("[Tripleform COD] JSON offers invalide:", raw, e2);
        return {};
      }
    }
  }

  function fmtMoneyFactory(locale, currency) {
    const nf = new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: currency || "USD",
    });
    return (cents) => nf.format(Number(cents || 0) / 100);
  }

  function css(s) {
    return String(s ?? "");
  }

  /* ------------------------------------------------------------------ */
  /* Icon helpers                                                       */
  /* ------------------------------------------------------------------ */

  const ICON_MAPPING = {
    // Cart icons
    CartIcon: "🛒",
    BagIcon: "🛍️",
    ProductsIcon: "📦",
    CheckoutIcon: "💳",
    ReceiptIcon: "🧾",
    NoteIcon: "📝",
    
    // Field icons
    ProfileIcon: "👤",
    PersonIcon: "👤",
    UserIcon: "👤",
    CustomersIcon: "👥",
    PhoneIcon: "📱",
    MobileIcon: "📱",
    CallIcon: "📞",
    ChatIcon: "💬",
    HashtagIcon: "#️⃣",
    NumberIcon: "🔢",
    CirclePlusIcon: "➕",
    LocationIcon: "📍",
    PinIcon: "📍",
    HomeIcon: "🏠",
    StoreIcon: "🏪",
    CityIcon: "🏙️",
    GlobeIcon: "🌍",
    MapIcon: "🗺️",
    RegionIcon: "🗾",
    ClipboardIcon: "📋",
    DocumentIcon: "📄",
    TextIcon: "📝",
    
    // Button icons
    TruckIcon: "🚚",
    CheckCircleIcon: "✅",
    PlayIcon: "▶️",
    ArrowRightIcon: "➡️",
    SendIcon: "📤",
    AppsIcon: "📱"
  };

  function getIconHtml(iconName, size = "18px") {
    if (!iconName || !ICON_MAPPING[iconName]) return "";
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${size};height:${size};margin-right:8px;font-size:calc(${size} - 4px);">${ICON_MAPPING[iconName]}</span>`;
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
  /* Overlay / couleurs / tailles popup & drawer                        */
  /* ------------------------------------------------------------------ */

  function hexToRgba(hex, alpha) {
    try {
      let h = String(hex || "").trim();
      if (!h) return `rgba(0,0,0,${alpha})`;
      if (h[0] === "#") h = h.slice(1);
      if (h.length === 3) {
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      }
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
    let op = beh?.overlayOpacity;
    if (op == null) op = 0;
    if (op > 1) op = op / 100;
    if (op < 0) op = 0;
    if (op > 1) op = 1;
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
        return {
          maxWidth: "95vw",
          maxHeight: "85vh",
        };
      case "lg":
        return {
          maxWidth: "95vw",
          maxHeight: "92vh",
        };
      case "full":
        return {
          maxWidth: "100%",
          maxHeight: "100vh",
        };
      default:
        return {
          maxWidth: "95vw",
          maxHeight: "90vh",
        };
    }
  }

  function drawerSizeConfig(beh) {
    const size = beh?.drawerSize || "md";
    switch (size) {
      case "sm":
        return {
          sideWidth: "min(380px, 95vw)",
        };
      case "lg":
        return {
          sideWidth: "min(500px, 95vw)",
        };
      case "full":
        return {
          sideWidth: "100%",
        };
      default:
        return {
          sideWidth: "min(450px, 95vw)",
        };
    }
  }

  /* ------------------------------------------------------------------ */
  /* Variant & qty helpers                                              */
  /* ------------------------------------------------------------------ */

  function getSelectedVariantId() {
    const sel = document.querySelector(
      'form[action^="/cart/add"] select[name="id"]'
    );
    if (sel && sel.value) return sel.value;

    const radio = document.querySelector(
      'form[action^="/cart/add"] input[name="id"]:checked'
    );
    if (radio && radio.value) return radio.value;

    const holder = document.querySelector(".tripleform-cod[data-variant-id]");
    return holder ? holder.getAttribute("data-variant-id") : null;
  }

  function getQty() {
    const q = document.querySelector(
      'form[action^="/cart/add"] input[name="quantity"]'
    );
    const v = Number(q && q.value ? q.value : 1);
    return v > 0 ? v : 1;
  }

  function watchVariantAndQty(onChange) {
    document.addEventListener("change", (e) => {
      if (e.target && (e.target.name === "id" || e.target.name === "quantity"))
        onChange();
    });
    document.addEventListener("input", (e) => {
      if (e.target && e.target.name === "quantity") onChange();
    });
    document.addEventListener("variant:change", onChange);
  }

  /* ------------------------------------------------------------------ */
  /* Sticky button                                                      */
  /* ------------------------------------------------------------------ */

  function setupSticky(root, cfg, styleType, openHandler) {
    const stickyType = cfg?.behavior?.stickyType || "none";
    const stickyLabel = css(
      cfg?.behavior?.stickyLabel || cfg?.uiTitles?.orderNow || "Order now"
    );
    const stickyIcon = cfg?.behavior?.stickyIcon || "CartIcon";

    const prev = document.querySelector(`[data-tf-sticky-for="${root.id}"]`);
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (stickyType === "none") return;

    const d = cfg.design || {};
    const bg = d.btnBg || "#111827";
    const text = d.btnText || "#FFFFFF";
    const br = d.btnBorder || bg;

    const el = document.createElement("div");
    el.setAttribute("data-tf-sticky-for", root.id);
    el.style.zIndex = "999999";

    const baseStyle = `
      position:fixed;
      z-index:999999;
      bottom:12px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    `;

    if (stickyType === "bottom-bar") {
      el.style.cssText = baseStyle + `
        left:16px;
        right:16px;
      `;
      el.innerHTML = `
        <div style="
          max-width:720px; width:100%;
          background:#0F172A; color:#F9FAFB;
          border-radius:999px;
          padding:8px 14px;
          display:flex; align-items:center; justify-content:space-between;
          box-shadow:0 18px 32px rgba(15,23,42,0.55);
          font-size:12px;
        ">
          <span>Quick COD — ${styleType === "inline" ? "scroll to form" : "open form"}</span>
          <button type="button" data-tf-sticky-cta style="
            border-radius:999px;
            border:1px solid ${br};
            background:${bg};
            color:${text};
            font-weight:600;
            padding:6px 18px;
            font-size:13px;
            cursor:pointer;
            box-shadow:0 10px 24px rgba(0,0,0,.35);
            display:flex; align-items:center; gap:6px;
          ">
            ${getIconHtml(stickyIcon, "16px")}${stickyLabel}
          </button>
        </div>
      `;
    } else {
      const isLeft = stickyType === "bubble-left";
      el.style.cssText = baseStyle + `
        ${isLeft ? "left:16px;" : "right:16px;"}
      `;
      el.innerHTML = `
        <button type="button" data-tf-sticky-cta style="
          border-radius:999px;
          border:1px solid ${br};
          background:${bg};
          color:${text};
          font-weight:600;
          padding:10px 18px;
          font-size:13px;
          cursor:pointer;
          box-shadow:0 18px 36px rgba(0,0,0,.55);
          max-width:220px;
          white-space:nowrap;
          display:flex; align-items:center; gap:6px;
        ">
          ${getIconHtml(stickyIcon, "16px")}${stickyLabel}
        </button>
      `;
    }

    const btn = el.querySelector("[data-tf-sticky-cta]");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof openHandler === "function") openHandler();
      });
    }

    document.body.appendChild(el);
  }

  /* ------------------------------------------------------------------ */
  /* Dropdown wilaya / ville (store)                                    */
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
      resetSelect(
        provSelect,
        cfg.fields?.province?.ph || "Wilaya / Province"
      );
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
        provinceName ? "Select city" : "Select province first"
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

    if (provSelect) {
      provSelect.addEventListener("change", (e) => {
        fillCities(e.target.value || "");
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Injecter le CSS des offres dans la page produit                    */
  /* ------------------------------------------------------------------ */

  function injectOffersCSS() {
    if (document.getElementById('tf-offers-css')) return;
    
    const style = document.createElement('style');
    style.id = 'tf-offers-css';
    style.textContent = `
      /* CSS pour les offres dans la page produit */
      .tf-offers-container {
        display: grid;
        gap: 10px;
        margin-bottom: 16px;
      }
      
      .offers-strip {
        display: grid !important;
        grid-template-columns: 60px minmax(0, 1fr) !important;
        gap: 12px !important;
        align-items: center !important;
        background: #FFFFFF !important;
        border: 1px solid #E5E7EB !important;
        border-radius: 10px !important;
        padding: 12px !important;
        margin-bottom: 10px !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.04) !important;
        box-sizing: border-box !important;
        width: 100% !important;
      }
      
      .offers-strip-thumb {
        width: 56px !important;
        height: 56px !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        border: 1px solid #E5E7EB !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
      }
      
      .offers-strip-thumb-inner {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px !important;
        background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%) !important;
      }
      
      .offers-strip-thumb-inner-upsell {
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px !important;
        background: linear-gradient(135deg, #EC4899 0%, #F59E0B 100%) !important;
      }
      
      .offers-strip-thumb img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: 12px !important;
      }
      
      .offers-strip-main {
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #111827 !important;
        margin-bottom: 2px !important;
        line-height: 1.3 !important;
      }
      
      .offers-strip-desc {
        font-size: 12px !important;
        color: #6B7280 !important;
        line-height: 1.4 !important;
      }
      
      .offer-timer {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        margin-top: 6px !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
      }
      
      .offer-timer-icon {
        font-size: 10px !important;
      }
      
      .timer-countdown {
        font-family: monospace !important;
        font-weight: bold !important;
        letter-spacing: 1px !important;
        margin-left: auto !important;
      }
      
      /* Styles de timer professionnels */
      .timer-chrono {
        background: linear-gradient(90deg, #1e3a8a, #3b82f6) !important;
        color: #fff !important;
        border: 1px solid #60a5fa !important;
        font-family: 'Courier New', monospace !important;
        font-weight: bold !important;
        letter-spacing: 1px !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
      }
      
      .timer-black-friday {
        background: linear-gradient(90deg, #000000, #dc2626) !important;
        color: #fff !important;
        border: 2px solid #fbbf24 !important;
        font-weight: 800 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
        box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4) !important;
      }
      
      .timer-new-year {
        background: linear-gradient(135deg, #0f766e, #0ea5e9, #ec4899) !important;
        color: #fff !important;
        border: 1px solid #fde047 !important;
        font-weight: bold !important;
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3) !important;
      }
      
      .timer-flash {
        background: linear-gradient(90deg, #f97316, #fbbf24) !important;
        color: #1f2937 !important;
        border: 1px solid #f59e0b !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4) !important;
      }
      
      .timer-hot {
        background: linear-gradient(90deg, #7c2d12, #ea580c) !important;
        color: #fff !important;
        border: 1px solid #fdba74 !important;
        animation: pulse 1.5s infinite !important;
        font-weight: 800 !important;
      }
      
      .timer-weekend {
        background: linear-gradient(135deg, #7c3aed, #10b981) !important;
        color: #fff !important;
        border: 1px solid #a7f3d0 !important;
        font-weight: bold !important;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3) !important;
      }
      
      /* Styles complémentaires */
      .timer-simple {
        background: #FEF2F2 !important;
        color: #DC2626 !important;
        border: 1px solid #FECACA !important;
      }
      
      .timer-elegant {
        background: linear-gradient(135deg, #8B5CF6, #EC4899) !important;
        color: #fff !important;
        border: 1px solid #DDD6FE !important;
        font-weight: 600 !important;
      }
      
      .timer-minimal {
        background: #F9FAFB !important;
        color: #374151 !important;
        border: 1px solid #E5E7EB !important;
        font-weight: 500 !important;
      }
      
      .timer-urgent {
        background: linear-gradient(90deg, #991B1B, #DC2626) !important;
        color: #fff !important;
        border: 1px solid #FCA5A5 !important;
        font-weight: 700 !important;
        animation: blink 1s infinite !important;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.8; }
        100% { opacity: 1; }
      }
      
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      /* Bouton simple d'activation d'offre */
      .offer-activate-btn {
        background: #000000 !important;
        color: #FFFFFF !important;
        border: 1px solid #000000 !important;
        border-radius: 4px !important;
        padding: 4px 10px !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        margin-top: 6px !important;
        transition: all 0.2s ease !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
      }
      
      .offer-activate-btn:hover {
        background: #374151 !important;
        border-color: #374151 !important;
      }
      
      .offer-activate-btn.active {
        background: #10B981 !important;
        color: #FFFFFF !important;
        border-color: #10B981 !important;
      }
      
      .offer-activate-btn.disabled {
        background: #9CA3AF !important;
        color: #FFFFFF !important;
        border-color: #9CA3AF !important;
        cursor: not-allowed !important;
      }
      
      .offer-activate-btn-icon {
        font-size: 10px !important;
      }
      
      /* Ligne de remise dans le résumé */
      .discount-row {
        color: #10B981 !important;
        font-weight: 600 !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /* NOUVEAUX TIMERS - Composant pour la prévisualisation               */
  /* ------------------------------------------------------------------ */

  function TimerComponent(minutes, message, cssClass, timeFormat) {
    const container = document.createElement('div');
    container.className = `offer-timer ${cssClass || ''}`;
    
    const timerId = 'timer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    let timeLeft = minutes * 60;
    
    function formatTime(seconds, format) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      switch (format) {
        case 'hh[h] mm[m]':
          return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`;
        case 'mm[m] ss[s]':
          return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        case 'hh[h]':
          return `${h.toString().padStart(2, '0')}h`;
        case 'mm:ss':
        default:
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    }
    
    function updateDisplay() {
      container.innerHTML = `
        <span class="offer-timer-icon">⏱️</span>
        <span>${message || '⏱️ Offre limitée dans le temps!'}</span>
        <span class="timer-countdown">
          ${formatTime(timeLeft, timeFormat)}
        </span>
      `;
    }
    
    updateDisplay();
    
    const interval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        container.innerHTML = `
          <span class="offer-timer-icon">⏱️</span>
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
  /* Gestion de l'activation des offres - Version CORRIGÉE             */
  /* ------------------------------------------------------------------ */

  function toggleOfferActivation(button, offerIndex, offerType, offersList, root, updateMoney) {
    const isActive = button.classList.contains('active');
    const offer = offersList[offerIndex];
    
    if (isActive) {
      // Désactiver l'offre
      button.classList.remove('active');
      button.innerHTML = '<span class="offer-activate-btn-icon">+</span> Activer';
      
      // Retirer de localStorage
      localStorage.removeItem(`tf_active_offer_${offerType}_${offerIndex}`);
      localStorage.removeItem('tf_current_active_offer');
      
      // Désactiver toutes les offres (une seule à la fois)
      const allButtons = root.querySelectorAll('[data-tf-offer-toggle]');
      allButtons.forEach(btn => {
        btn.classList.remove('active');
        const btnIndex = btn.getAttribute('data-tf-offer-index');
        const btnType = btn.getAttribute('data-tf-offer-type');
        btn.innerHTML = '<span class="offer-activate-btn-icon">+</span> Activer';
      });
    } else {
      // Désactiver toutes les autres offres d'abord
      const allButtons = root.querySelectorAll('[data-tf-offer-toggle]');
      allButtons.forEach(btn => {
        btn.classList.remove('active');
        const btnIndex = btn.getAttribute('data-tf-offer-index');
        const btnType = btn.getAttribute('data-tf-offer-type');
        btn.innerHTML = '<span class="offer-activate-btn-icon">+</span> Activer';
        localStorage.removeItem(`tf_active_offer_${btnType}_${btnIndex}`);
      });
      
      // Activer cette offre
      button.classList.add('active');
      button.innerHTML = '<span class="offer-activate-btn-icon">✓</span> Activée';
      
      // Sauvegarder dans localStorage
      localStorage.setItem(`tf_active_offer_${offerType}_${offerIndex}`, 'true');
      
      // Sauvegarder les données complètes de l'offre
      localStorage.setItem('tf_current_active_offer', JSON.stringify({
        index: offerIndex,
        type: offerType,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        title: offer.title,
        currency: offer.currency
      }));
    }
    
    // Mettre à jour les prix
    updateMoney();
  }

  function getActiveOfferDiscount(offersList) {
    let totalDiscount = 0;
    let discountType = null;
    let discountValue = 0;
    let discountMessage = '';
    let activeOfferData = null;
    
    // Vérifier localStorage pour l'offre active complète
    const activeOfferJson = localStorage.getItem('tf_current_active_offer');
    if (activeOfferJson) {
      try {
        activeOfferData = JSON.parse(activeOfferJson);
        discountType = activeOfferData.discountType;
        discountValue = activeOfferData.discountValue;
        
        if (discountType === 'percentage') {
          totalDiscount = discountValue;
          discountMessage = `-${discountValue}%`;
        } else if (discountType === 'fixed') {
          totalDiscount = discountValue * 100; // Convertir en cents
          discountMessage = `-${(discountValue).toFixed(2)} ${activeOfferData.currency || 'MAD'}`;
        }
      } catch (e) {
        console.error('Error parsing active offer:', e);
      }
    }
    
    // Vérifier aussi l'ancienne méthode pour compatibilité
    if (!activeOfferData && offersList && offersList.length) {
      offersList.forEach((offer, index) => {
        if (offer.enabled && localStorage.getItem(`tf_active_offer_offer_${index}`) === 'true') {
          discountType = offer.discountType;
          discountValue = offer.discountValue;
          
          if (discountType === 'percentage') {
            totalDiscount = discountValue;
            discountMessage = `-${discountValue}%`;
          } else if (discountType === 'fixed') {
            totalDiscount = discountValue * 100; // Convertir en cents
            discountMessage = `-${(discountValue).toFixed(2)} ${offer.currency || 'MAD'}`;
          }
        }
      });
    }
    
    return { 
      totalDiscount, 
      discountType, 
      discountValue, 
      discountMessage,
      activeOfferData 
    };
  }

  /* ------------------------------------------------------------------ */
  /* OFFRES / UPSELL – rendu front PROFESSIONNEL                        */
  /* ------------------------------------------------------------------ */

  function buildOffersHtml(offersCfg, rootId) {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (!global.enabled) return "";

    const display = offersCfg.display || {};
    const offers = offersCfg.offers || [];
    const upsells = offersCfg.upsells || [];
    
    // Filtrer les offres et upsells activés
    const activeOffers = offers.filter(offer => offer.enabled && offer.showInPreview);
    const activeUpsells = upsells.filter(upsell => upsell.enabled && upsell.showInPreview);
    
    if (activeOffers.length === 0 && activeUpsells.length === 0) return "";

    let html = '<div class="tf-offers-container">';

    // OFFERS (remises) avec bouton d'activation
    activeOffers.forEach((offer, idx) => {
      const title = offer.title || "Remise spéciale";
      const description = offer.description || "Profitez de cette offre exclusive";
      const img = offer.imageUrl || "";
      const hasTimer = offer.enableTimer && display.showTimerInPreview;
      const buttonText = offer.buttonText || "Activer";
      const timerCssClass = offer.timerCssClass || "";
      
      // Vérifier si cette offre est déjà activée dans localStorage
      const isActive = localStorage.getItem(`tf_active_offer_offer_${idx}`) === 'true' || 
                      (localStorage.getItem('tf_current_active_offer') && 
                       JSON.parse(localStorage.getItem('tf_current_active_offer')).index === idx);
      
      html += `
        <div class="offers-strip" style="
          background:#FFFFFF !important;
          border:1px solid #E5E7EB !important;
          color:#111827 !important;
        ">
          <div class="offers-strip-thumb">
            ${img 
              ? `<img src="${css(img)}" alt="${css(title)}" />` 
              : '<div class="offers-strip-thumb-inner"></div>'}
          </div>
          <div style="flex:1; min-width:0;">
            <div class="offers-strip-main">
              ${css(title)}
            </div>
            <div class="offers-strip-desc">
              ${css(description)}
            </div>
            
            ${hasTimer ? `
              <div data-tf-timer-offer="${idx}"></div>
            ` : ''}
            
            <button 
              class="offer-activate-btn ${isActive ? 'active' : ''}" 
              data-tf-offer-toggle="1"
              data-tf-offer-index="${idx}"
              data-tf-offer-type="offer"
              data-tf-root-id="${rootId}"
            >
              <span class="offer-activate-btn-icon">${isActive ? '✓' : '+'}</span>
              ${isActive ? 'Activée' : css(buttonText)}
            </button>
          </div>
        </div>
      `;
    });

    // UPSELLS (cadeaux) - sans bouton d'activation
    activeUpsells.forEach((upsell, idx) => {
      const title = upsell.title || "Cadeau gratuit";
      const description = upsell.description || "Recevez un cadeau spécial avec votre commande";
      const img = upsell.imageUrl || "";
      const hasTimer = upsell.enableTimer && display.showTimerInPreview;
      const timerCssClass = upsell.timerCssClass || "";

      html += `
        <div class="offers-strip" style="
          background:#FFFFFF !important;
          border:1px solid #E5E7EB !important;
          color:#111827 !important;
        ">
          <div class="offers-strip-thumb">
            ${img 
              ? `<img src="${css(img)}" alt="${css(title)}" />` 
              : '<div class="offers-strip-thumb-inner-upsell"></div>'}
          </div>
          <div style="flex:1; min-width:0;">
            <div class="offers-strip-main">
              ${css(title)}
            </div>
            <div class="offers-strip-desc">
              ${css(description)}
            </div>
            
            ${hasTimer ? `
              <div data-tf-timer-upsell="${idx}"></div>
            ` : ''}
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Initialisation des timers après rendu                              */
  /* ------------------------------------------------------------------ */

  function initializeTimers(root, offersCfg) {
    if (!offersCfg || typeof offersCfg !== "object") return;
    
    const global = offersCfg.global || {};
    const display = offersCfg.display || {};
    const offers = offersCfg.offers || [];
    const upsells = offersCfg.upsells || [];
    
    // Initialiser les timers pour les offres
    offers.forEach((offer, idx) => {
      if (offer.enableTimer && display.showTimerInPreview) {
        const timerContainer = root.querySelector(`[data-tf-timer-offer="${idx}"]`);
        if (timerContainer) {
          const timerElement = TimerComponent(
            offer.timerMinutes || 60,
            offer.timerMessage || "⏱️ Offre limitée dans le temps!",
            offer.timerCssClass || "",
            offer.timerTimeFormat || "mm:ss"
          );
          timerContainer.appendChild(timerElement);
        }
      }
    });
    
    // Initialiser les timers pour les upsells
    upsells.forEach((upsell, idx) => {
      if (upsell.enableTimer && display.showTimerInPreview) {
        const timerContainer = root.querySelector(`[data-tf-timer-upsell="${idx}"]`);
        if (timerContainer) {
          const timerElement = TimerComponent(
            upsell.timerMinutes || 60,
            upsell.timerMessage || "🎁 Cadeau limité dans le temps!",
            upsell.timerCssClass || "",
            upsell.timerTimeFormat || "mm:ss"
          );
          timerContainer.appendChild(timerElement);
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Render principal                                                   */
  /* ------------------------------------------------------------------ */

  function render(
    root,
    cfg,
    offersCfg,
    product,
    getVariant,
    moneyFmt,
    recaptchaCfg
  ) {
    const d = cfg.design || {};
    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    const f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";

    // Honeypot state
    const hpState = {
      startTime: Date.now(),
      mouseMoved: false,
    };

    window.addEventListener(
      "mousemove",
      () => {
        hpState.mouseMoved = true;
      },
      { once: true }
    );

    const countryDef = getCountryDef(beh);
    const pageStart = Date.now();

    // ===== GEO / SHIPPING config (data-* depuis le block liquid) =====
    const geoEndpointAttr = root.getAttribute("data-geo-endpoint") || "";
    const geoEnabledAttr = root.getAttribute("data-geo-enabled") || "";
    const geoCountryAttr =
      root.getAttribute("data-geo-country") || countryDef.code;

    const geoEnabled =
      !!geoEndpointAttr &&
      (geoEnabledAttr === "1" ||
        geoEnabledAttr === "true" ||
        geoEnabledAttr === "yes");

    const geoEndpoint = geoEndpointAttr || "";
    let geoShippingCents = null;
    let geoNote = "";
    let geoRequestId = 0;

    const baseGlow = d.btnBg || "#2563EB";
    const cardShadow = shadowFromEffect(cfg, baseGlow);
    const cartShadow = shadowFromEffect(cfg, baseGlow);
    const rowShadow = shadowFromEffect(cfg, baseGlow);
    const btnShadow = shadowFromEffect(cfg, baseGlow);
    const ovBg = overlayBackground(beh);
    const popupCfg = popupSizeConfig(beh);
    const drawerCfg = drawerSizeConfig(beh);

    // Variables pour gérer les offres
    const offersList = offersCfg.offers || [];

    /* ---------------- Direction / alignement / font size ------------- */

    const rawDirection =
      d.direction ||
      d.textDirection ||
      d.text_direction ||
      beh.textDirection ||
      beh.text_direction ||
      "ltr";

    const rawTitleAlign =
      d.titleAlign ||
      d.title_align ||
      beh.titleAlign ||
      beh.title_align ||
      d.textAlign ||
      d.text_align ||
      beh.textAlign ||
      beh.text_align ||
      "left";

    const rawFieldAlign =
      d.fieldAlign ||
      d.field_align ||
      beh.fieldAlign ||
      beh.field_align ||
      rawTitleAlign;

    const rawInputFont =
      d.fontSize ||
      d.inputFontSize ||
      d.input_font_size ||
      d.textSize ||
      d.text_size ||
      cfg.fontSize ||
      cfg.inputFontSize ||
      cfg.input_font_size ||
      cfg.textSize ||
      cfg.text_size ||
      beh.fontSize ||
      beh.inputFontSize ||
      beh.input_font_size ||
      beh.textSize ||
      beh.text_size ||
      16;

    const inputFontSize = Number(rawInputFont) || 16;

    // normalisation
    const textDir =
      String(rawDirection).toLowerCase() === "rtl" ? "rtl" : "ltr";

    const titleAlignValue = String(rawTitleAlign).toLowerCase();
    const titleAlign =
      titleAlignValue === "center"
        ? "center"
        : titleAlignValue === "right"
        ? "right"
        : "left";

    const fieldAlignValue = String(rawFieldAlign).toLowerCase();
    const fieldAlign = fieldAlignValue === "right" ? "right" : "left";

    const labelFontSize = `${Math.max(inputFontSize - 1, 11)}px`;
    const smallFontSize = `${Math.max(inputFontSize - 2, 10)}px`;
    const tinyFontSize = `${Math.max(inputFontSize - 3, 9)}px`;

    /* ---------------- Styles cartes / inputs / panier ---------------- */

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
    
    const selectStyle = `
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
      border:1px solid ${css(d.btnBorder)};
      color:${css(d.btnText)};
      background:${css(d.btnBg)};
      font-weight:700;
      letter-spacing:.2px;
      box-shadow:${btnShadow};
      font-size:${inputFontSize}px;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:8px;
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
      font-weight:700;
      margin-bottom:10px;
      color:${css(d.cartTitleColor)};
      font-size:${labelFontSize};
      text-align:${titleAlign};
      display:flex;
      align-items:center;
      gap:8px;
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

    /* -------- champs HTML (avec data-tf-field + required) -------- */

    function fieldHTML(key) {
      const field = f[key];
      if (!field || field.on === false) return "";

      const iconHtml = field.icon ? getIconHtml(field.icon, "18px") : "";
      const req = field.required ? " *" : "";
      const label = (field.label || key) + req;
      const ph = field.ph || "";
      const requiredAttr = field.required ? " required" : "";

      // Style commun pour le conteneur de champ
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
        font-weight:500;
      `;

      if (key === "province") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <select data-tf-role="province" data-tf-field="${key}" style="${selectStyle}" ${requiredAttr}>
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
              <select data-tf-role="city" data-tf-field="${key}" style="${selectStyle}" ${requiredAttr}>
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

      if (field.type === "tel") {
        const prefix = field.prefix
          ? `<input style="${inputStyle}; text-align:center;" value="${css(field.prefix)}" readonly />`
          : "";
        const grid = field.prefix ? "minmax(88px,130px) 1fr" : "1fr";

        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <div style="display:grid; grid-template-columns:${grid}; gap:8px;">
                ${prefix}
                <input type="tel" data-tf-field="${key}" style="${inputStyle}" placeholder="${css(ph)}" ${requiredAttr} />
              </div>
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
      return orderedFieldKeys()
        .map((k) => fieldHTML(k))
        .join("");
    }

    function cartSummaryHTML() {
      const cartIconHtml = t.cartIcon ? getIconHtml(t.cartIcon, "20px") : "";
      
      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">${cartIconHtml}${css(t.top || "Order summary")}</div>
          <div style="display:grid; gap:8px;">
            <div style="${rowStyle}">
              <div>${css(t.price || "Product price")}</div>
              <div style="font-weight:700;" data-tf="price">—</div>
            </div>
            <div style="${rowStyle}">
              <div>
                <div>${css(t.shipping || "Shipping price")}</div>
                <div data-tf="shipping-note" style="font-size:${tinyFontSize};opacity:.8;margin-top:2px;"></div>
              </div>
              <div style="font-weight:700;" data-tf="shipping">
                ${css(t.shippingToCalculate || "Shipping to calculate")}
              </div>
            </div>
            <div style="${rowStyle}; display:none;" data-tf="discount-row">
              <div>Remise</div>
              <div style="font-weight:700; color:#10B981;" data-tf="discount">—</div>
            </div>
            <div style="${rowStyle}">
              <div>${css(t.total || "Total")}</div>
              <div style="font-weight:700;" data-tf="total">—</div>
            </div>
          </div>
        </div>
      `;
    }

    function formCardHTML(ctaKey, isPopupOrDrawer = false) {
      const orderLabel = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const buttonIconHtml = cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, "20px") : "";
      const suffix = css(ui.totalSuffix || "Total:");
      
      const honeypotInputHTML = `
        <input
          type="text"
          name="tf_hp_token"
          data-tf-hp="1"
          autocomplete="off"
          tabindex="-1"
          style="
            position:absolute;
            left:-9999px;
            top:auto;
            width:1px;
            height:1px;
            opacity:0;
          "
        />
      `;

      // Pour popup/drawer, on ne met pas de carte autour du formulaire
      const formContainerStyle = isPopupOrDrawer ? `
        padding:0;
        background:transparent;
        border:none;
        box-shadow:none;
        border-radius:0;
      ` : cardStyle;

      return `
        <div style="${formContainerStyle}" data-tf-role="form-card">
          ${
            cfg.form?.title || cfg.form?.subtitle
              ? `
            <div style="text-align:${titleAlign}; margin-bottom:20px;">
              ${
                cfg.form?.title
                  ? `<div style="font-weight:700; font-size:${labelFontSize}; margin-bottom:4px;">${css(cfg.form.title)}</div>`
                  : ""
              }
              ${
                cfg.form?.subtitle
                  ? `<div style="opacity:.8; font-size:${smallFontSize};">${css(cfg.form.subtitle)}</div>`
                  : ""
              }
            </div>`
              : ""
          }

          <div style="position:relative;">
            <!-- Champ honeypot anti-bot -->
            <input
              type="text"
              data-tf-role="honeypot"
              name="tf_hp_token"
              style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;"
              tabindex="-1"
              autocomplete="off"
            />

            ${fieldsBlockHTML()}
            ${honeypotInputHTML}

            ${
              beh?.requireGDPR
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" /> ${css(beh.gdprLabel || "I accept the privacy policy")}
              </label>`
                : ""
            }

            ${
              beh?.whatsappOptIn
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" /> ${css(beh.whatsappLabel || "Receive confirmation on WhatsApp")}
              </label>`
                : ""
            }

            <button
              type="button"
              style="${btnStyle}; margin-top:16px;"
              data-tf-cta="1"
              data-tf="${ctaKey}"
            >
              ${buttonIconHtml}${orderLabel} · ${suffix} …
            </button>
          </div>
        </div>
      `;
    }

    const mainStart = `<div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};box-sizing:border-box;">`;
    const mainEnd = "</div>";

    let html = "";

    if (styleType === "inline") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        '<div style="height:8px"></div>' +
        formCardHTML("cta-inline", false) +
        mainEnd;
    } else if (styleType === "popup") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        '<div style="height:8px"></div>' +
        `
        <div style="text-align:${titleAlign};">
          <button
            type="button"
            style="${btnStyle}"
            data-tf-cta="1"
            data-tf="launcher"
          >
            ${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, "20px") : ""}${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (popup)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div
          data-tf-role="popup"
          style="
            position:fixed;
            inset:0;
            display:none;
            align-items:center;
            justify-content:center;
            z-index:999999;
            background:${ovBg};
            padding:20px;
            box-sizing:border-box;
          "
        >
          <div style="
            width:100%;
            max-width:${popupCfg.maxWidth};
            max-height:${popupCfg.maxHeight};
            box-sizing:border-box;
            position:relative;
            background:${css(d.bg)};
            border-radius:${+d.radius || 12}px;
            box-shadow:${cardShadow};
            overflow:auto;
          ">
            <div style="text-align:right; margin-bottom:8px; position:absolute; top:12px; right:12px; z-index:10;">
              <button
                type="button"
                data-tf="close"
                style="
                  background:${css(d.bg)};
                  border:1px solid ${css(d.border)};
                  color:${css(d.text)};
                  font-size:20px;
                  cursor:pointer;
                  width:32px;
                  height:32px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  border-radius:50%;
                "
              >&times;</button>
            </div>
            <div style="padding:24px; box-sizing:border-box;">
              <div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="height:8px"></div>
                ${formCardHTML("cta-popup", true)}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      const origin = beh.drawerOrigin || beh.drawerDirection || "right";

      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        '<div style="height:8px"></div>' +
        `
        <div style="text-align:${titleAlign};">
          <button
            type="button"
            style="${btnStyle}"
            data-tf-cta="1"
            data-tf="launcher"
          >
            ${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, "20px") : ""}${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (drawer)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div
          data-tf-role="drawer-overlay"
          style="
            position:fixed;
            inset:0;
            display:none;
            z-index:999999;
            background:${ovBg};
            overflow:hidden;
            padding:0;
          "
        >
          <div
            data-tf-role="drawer"
            data-origin="${origin}"
            style="
              position:absolute;
              top:0;
              bottom:0;
              width:${drawerCfg.sideWidth};
              max-height:100%;
              background:${css(d.bg)};
              box-shadow:0 0 40px rgba(15,23,42,0.65);
              display:flex;
              flex-direction:column;
              padding:0;
              box-sizing:border-box;
              transform:translateX(100%);
              transition:transform 260ms ease;
              overflow:hidden;
            "
          >
            <div style="padding:24px; overflow:auto; flex:1; box-sizing:border-box;">
              <div style="text-align:right; margin-bottom:16px;">
                <button
                  type="button"
                  data-tf="close"
                  style="
                    background:${css(d.bg)};
                    border:1px solid ${css(d.border)};
                    color:${css(d.text)};
                    font-size:20px;
                    cursor:pointer;
                    width:32px;
                    height:32px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border-radius:50%;
                  "
                >&times;</button>
              </div>
              <div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="height:8px"></div>
                ${formCardHTML("cta-drawer", true)}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = html;

    // Initialiser les timers après le rendu
    setTimeout(() => {
      initializeTimers(root, offersCfg);
    }, 100);

    // Attacher les événements aux boutons d'activation d'offres
    setTimeout(() => {
      const offerButtons = root.querySelectorAll('[data-tf-offer-toggle]');
      offerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const offerIndex = parseInt(this.getAttribute('data-tf-offer-index'));
          const offerType = this.getAttribute('data-tf-offer-type');
          toggleOfferActivation(this, offerIndex, offerType, offersList, root, function() {
            // Cette fonction va mettre à jour les prix
            updateMoney();
          });
        });
      });
    }, 200);

    // dropdown wilaya/city
    setupLocationDropdowns(root, cfg, countryDef);

    // Si geo activé, recalculer quand province / ville change
    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');

    /* ===================== Helpers champs =========================== */

    function findLabelByText(sub) {
      sub = String(sub || "").toLowerCase();
      const labels = Array.from(root.querySelectorAll("label"));
      return (
        labels.find((lab) =>
          (lab.textContent || "").toLowerCase().includes(sub)
        ) || null
      );
    }

    function getFieldValueByLabel(sub) {
      const lab = findLabelByText(sub);
      if (!lab) return "";
      let el =
        lab.querySelector("input:not([readonly]), textarea, select") ||
        lab.querySelector("input, textarea, select");
      if (!el) return "";
      return (el.value || "").trim();
    }

    function getPhoneFields() {
      const lab = findLabelByText("phone");
      let prefix = "";
      let number = "";

      if (lab) {
        const inputs = Array.from(lab.querySelectorAll("input"));
        if (inputs.length === 1) {
          number = (inputs[0].value || "").trim();
        } else if (inputs.length >= 2) {
          prefix = (inputs[0].value || "").trim();
          number = (inputs[1].value || "").trim();
        }
      }

      const fullPhone =
        prefix && number ? `${prefix}${number}` : number || prefix || "";

      return { prefix, number, fullPhone };
    }

    /* ===================== Geo calc (shipping) ======================= */

    function computeProductTotals() {
      const vId = getVariant();
      const qty = getQty();
      const variant =
        product.variants.find((v) => String(v.id) === String(vId)) ||
        product.variants[0];

      let priceCents = 0;

      if (variant && variant.price != null) {
        const rawStr = String(variant.price);
        const rawNum = Number(rawStr);

        if (Number.isFinite(rawNum)) {
          if (rawStr.includes(".")) {
            priceCents = Math.round(rawNum * 100);
          } else {
            priceCents = Math.round(rawNum);
          }
        }
      }

      const baseTotalCents = priceCents * qty;
      const totalCents = baseTotalCents;

      return {
        priceCents,
        totalCents,
        baseTotalCents,
        qty,
        variantId: vId,
      };
    }

    async function recalcGeo() {
      if (!geoEnabled || !geoEndpoint) {
        geoShippingCents = null;
        geoNote = "";
        updateMoney();
        return;
      }

      const reqId = ++geoRequestId;
      const totals = computeProductTotals();
      const baseTotalCents = totals.totalCents;

      const province =
        getFieldValueByLabel("wilaya") || getFieldValueByLabel("province");
      const city = getFieldValueByLabel("city");

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

        const res = await fetch(url.toString(), {
          method: "GET",
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));

        if (reqId !== geoRequestId) return;

        if (!res.ok || json.ok === false) {
          console.warn(
            "[Tripleform COD] geo calc error:",
            json.error || res.statusText
          );
          geoShippingCents = null;
          geoNote = "";
        } else {
          let shippingCents = 0;
          let codFeeCents = 0;

          const shippingObj = json.shipping || {};

          if (shippingObj && shippingObj.amount != null) {
            const amount = Number(shippingObj.amount);
            if (Number.isFinite(amount) && amount > 0) {
              shippingCents = Math.round(amount * 100);
            }
          }

          if (shippingObj && shippingObj.codExtraFee != null) {
            const codAmount = Number(shippingObj.codExtraFee);
            if (Number.isFinite(codAmount) && codAmount > 0) {
              codFeeCents = Math.round(codAmount * 100);
            }
          }

          geoNote =
            (shippingObj && shippingObj.note) ||
            json.note ||
            json.message ||
            "";

          geoShippingCents = shippingCents + codFeeCents;
        }
      } catch (e) {
        if (reqId !== geoRequestId) return;
        console.warn("[Tripleform COD] geo calc network error:", e);
        geoShippingCents = null;
        geoNote = "";
      }

      updateMoney();
    }

    /* ===================== Validation required ====================== */

    function validateRequiredFields() {
      const requiredFields = Object.keys(f || {}).filter(
        (key) => f[key]?.on && f[key]?.required
      );
      if (!requiredFields.length) return true;

      let firstInvalid = null;
      const missingLabels = [];

      requiredFields.forEach((key) => {
        const cfgField = f[key];
        const el = root.querySelector(`[data-tf-field="${key}"]`);
        if (!el) return;

        const value = (el.value || "").trim();
        if (!value) {
          missingLabels.push(cfgField.label || key);
          if (!firstInvalid) firstInvalid = el;

          el.style.borderColor = "#ef4444";
          el.style.boxShadow = "0 0 0 1px rgba(239,68,68,0.35)";
        } else {
          el.style.borderColor = css(d.inputBorder);
          el.style.boxShadow = "none";
        }
      });

      if (missingLabels.length) {
        alert(
          "Merci de remplir les champs obligatoires :\n- " +
            missingLabels.join("\n- ")
        );
        if (firstInvalid && typeof firstInvalid.focus === "function") {
          firstInvalid.focus();
        }
        return false;
      }

      return true;
    }

    /* ===================== Anti-bot front simple ==================== */

    function checkAntibotFront() {
      const now = Date.now();
      const timeOnPageMs = now - pageStart;

      const hpInput = root.querySelector('[data-tf-role="honeypot"]');
      const hpValue = hpInput ? (hpInput.value || "").trim() : "";

      if (hpInput && hpValue) {
        alert("Votre commande n'a pas pu être envoyée. (anti-bot)");
        return { ok: false, reason: "honeypot", timeOnPageMs, hpValue };
      }

      if (timeOnPageMs < 1500) {
        alert(
          "Merci de prendre quelques secondes avant d'envoyer le formulaire."
        );
        return { ok: false, reason: "too_fast", timeOnPageMs };
      }

      return { ok: true, timeOnPageMs, hpValue };
    }

    /* ===================== Money + UI avec offres =================== */

    function updateMoney() {
      const { priceCents, totalCents } = computeProductTotals();
      
      // Calculer la remise
      let discountCents = 0;
      let discountMessage = "";
      const { 
        totalDiscount, 
        discountType, 
        discountValue,
        discountMessage: msg 
      } = getActiveOfferDiscount(offersList);
      
      if (totalDiscount > 0) {
        if (discountType === 'percentage') {
          discountCents = Math.round(totalCents * totalDiscount / 100);
        } else {
          discountCents = totalDiscount; // Déjà en cents
        }
        discountMessage = msg;
      }
      
      const discountedTotalCents = Math.max(0, totalCents - discountCents);
      const grandTotalCents = discountedTotalCents + (geoShippingCents || 0);

      const prices = root.querySelectorAll('[data-tf="price"]');
      const totals = root.querySelectorAll('[data-tf="total"]');
      const shippingEls = root.querySelectorAll('[data-tf="shipping"]');
      const shippingNoteEls = root.querySelectorAll(
        '[data-tf="shipping-note"]'
      );
      const discountRow = root.querySelector('[data-tf="discount-row"]');
      const discountAmount = root.querySelector('[data-tf="discount"]');
      const ctas = root.querySelectorAll('[data-tf-cta="1"]');

      prices.forEach((el) => (el.textContent = moneyFmt(priceCents)));
      totals.forEach((el) => (el.textContent = moneyFmt(grandTotalCents)));

      // Gérer l'affichage de la ligne de remise
      if (discountRow) {
        if (discountCents > 0) {
          discountRow.style.display = 'grid';
          if (discountAmount) {
            discountAmount.textContent = '-' + moneyFmt(discountCents);
            discountAmount.style.color = '#10B981';
            discountAmount.style.fontWeight = '700';
          }
        } else {
          discountRow.style.display = 'none';
        }
      }

      let shippingText = "";
      if (geoShippingCents === null) {
        shippingText = css(t.shippingToCalculate || "Shipping to calculate");
      } else if (geoShippingCents === 0) {
        shippingText = css(t.freeShipping || "Free");
      } else {
        shippingText = moneyFmt(geoShippingCents);
      }

      shippingEls.forEach((el) => (el.textContent = shippingText));
      shippingNoteEls.forEach((el) => {
        el.textContent = geoNote || "";
      });

      const label = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const buttonIconHtml = cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, "20px") : "";
      const suffix = css(ui.totalSuffix || "Total:");
      ctas.forEach((el) => {
        el.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;
      });
      
      // Mettre à jour également le bouton principal si présent (pour popup/drawer)
      const mainCta = root.querySelector('[data-tf="launcher"]');
      if (mainCta) {
        mainCta.innerHTML = `${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, "20px") : ""}${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} ${moneyFmt(grandTotalCents)}`;
      }
    }

    /* ============== Collect & submit + reCAPTCHA ==================== */

    async function onSubmitClick() {
      const ab = checkAntibotFront();
      if (!ab.ok) return;

      if (!validateRequiredFields()) return;

      const totals = computeProductTotals();
      const {
        priceCents,
        totalCents,
        baseTotalCents,
        qty,
        variantId,
      } = totals;

      // Calculer la remise pour l'envoi
      let discountCents = 0;
      const { 
        totalDiscount, 
        discountType,
        activeOfferData 
      } = getActiveOfferDiscount(offersList);
      
      if (totalDiscount > 0) {
        if (discountType === 'percentage') {
          discountCents = Math.round(totalCents * totalDiscount / 100);
        } else {
          discountCents = totalDiscount;
        }
      }
      
      const discountedTotalCents = Math.max(0, totalCents - discountCents);
      const shippingCentsToSend = geoShippingCents || 0;
      const grandTotalCents = discountedTotalCents + shippingCentsToSend;

      const phone = getPhoneFields();

      const now = Date.now();
      const hpInput = root.querySelector('input[data-tf-hp="1"]');
      const hpValue = hpInput ? hpInput.value || "" : "";

      let recaptchaToken = null;
      let recaptchaVersion = recaptchaCfg?.version || null;

      if (
        recaptchaCfg &&
        recaptchaCfg.enabled &&
        recaptchaCfg.version === "v3" &&
        recaptchaCfg.siteKey
      ) {
        try {
          await ensureRecaptchaScript(recaptchaCfg);
          if (window.grecaptcha && window.grecaptcha.execute) {
            recaptchaToken = await window.grecaptcha.execute(
              recaptchaCfg.siteKey,
              { action: "submit_cod" }
            );
          }
        } catch (e) {
          console.warn("[Tripleform COD] reCAPTCHA v3 error:", e);
        }
      }

      // Préparer les données de l'offre pour l'envoi
      let offerDataForSubmission = null;
      if (activeOfferData) {
        offerDataForSubmission = {
          title: activeOfferData.title,
          discountType: activeOfferData.discountType,
          discountValue: activeOfferData.discountValue,
          discountApplied: discountCents,
          currency: activeOfferData.currency
        };
      }

      const payload = {
        fields: {
          name: getFieldValueByLabel("name"),
          phone: phone.number || phone.fullPhone,
          phonePrefix: phone.prefix,
          fullPhone: phone.fullPhone,
          address: getFieldValueByLabel("address"),
          city: getFieldValueByLabel("city"),
          province:
            getFieldValueByLabel("wilaya") ||
            getFieldValueByLabel("province"),
          notes: getFieldValueByLabel("notes"),
        },
        productId: root.getAttribute("data-product-id") || null,
        variantId,
        qty,
        priceCents,
        baseTotalCents,
        discountCents,
        shippingCents: shippingCentsToSend,
        totalCents: discountedTotalCents,
        grandTotalCents,
        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,

        offer: offerDataForSubmission,

        geo: {
          enabled: geoEnabled,
          country: geoCountryAttr,
          province:
            getFieldValueByLabel("wilaya") ||
            getFieldValueByLabel("province"),
          city: getFieldValueByLabel("city"),
          note: geoNote,
        },

        tracking: {
          eventSourceUrl: window.location.href,
          referrer: document.referrer || null,
        },

        honeypot: {
          fieldValue: hpValue,
          timeOnPageMs: Math.max(0, now - hpState.startTime),
          mouseMoved: !!hpState.mouseMoved,
        },

        recaptchaToken,
        recaptchaVersion,
      };

      const formCard = root.querySelector('[data-tf-role="form-card"]');
      const btn = formCard
        ? formCard.querySelector('[data-tf-cta="1"]')
        : null;
      const original = btn ? btn.innerHTML : "";

      try {
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = "Sending...";
        }

        const res = await fetch("/apps/tripleform-cod/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (res.ok && json?.ok) {
          if (btn) {
            btn.innerHTML = css(cfg.form?.successText || "Thanks! We'll contact you");
          }
        } else {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = original;
          }
          alert("Erreur: " + (json?.error || res.statusText || "Submit failed"));
        }
      } catch (e) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = original;
        }
        alert("Erreur réseau. Réessaie.");
      }
    }

    /* ============== comportements inline / popup / drawer ============ */

    let openHandler = null;

    function handleTotalsChange() {
      updateMoney();
      if (geoEnabled) {
        recalcGeo();
      }
    }

    if (styleType === "inline") {
      const btn = root.querySelector('[data-tf="cta-inline"]');
      if (btn) btn.addEventListener("click", onSubmitClick);

      openHandler = () => {
        root.scrollIntoView({ behavior: "smooth", block: "center" });
      };
    }

    if (styleType === "popup") {
      const popup = root.querySelector('[data-tf-role="popup"]');
      const launcher = root.querySelector('[data-tf="launcher"]');
      const closeBtns = root.querySelectorAll('[data-tf="close"]');
      const popupCta = root.querySelector('[data-tf="cta-popup"]');

      if (popup && launcher) {
        openHandler = () => {
          popup.style.display = "flex";
          document.body.style.overflow = "hidden";
        };
        launcher.addEventListener("click", (e) => {
          e.preventDefault();
          openHandler();
        });
      }

      if (popup && beh.closeOnOutside !== false) {
        popup.addEventListener("click", (e) => {
          if (e.target === popup) {
            popup.style.display = "none";
            document.body.style.overflow = "";
          }
        });
      }

      closeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (popup) {
            popup.style.display = "none";
            document.body.style.overflow = "";
          }
        });
      });

      if (popupCta) popupCta.addEventListener("click", onSubmitClick);
    }

    if (styleType === "drawer") {
      const overlay = root.querySelector('[data-tf-role="drawer-overlay"]');
      const drawer = root.querySelector('[data-tf-role="drawer"]');
      const launcher = root.querySelector('[data-tf="launcher"]');
      const closeBtns = root.querySelectorAll('[data-tf="close"]');
      const drawerCta = root.querySelector('[data-tf="cta-drawer"]');
      const origin = beh.drawerOrigin || beh.drawerDirection || "right";

      let hiddenTransform = "translateX(100%)";
      if (drawer) {
        if (origin === "left") {
          drawer.style.left = "0";
          drawer.style.right = "auto";
          hiddenTransform = "translateX(-100%)";
        } else if (origin === "bottom") {
          drawer.style.left = "0";
          drawer.style.right = "0";
          drawer.style.bottom = "0";
          drawer.style.top = "auto";
          drawer.style.height = "auto";
          drawer.style.maxHeight = "80vh";
          drawer.style.width = "100%";
          hiddenTransform = "translateY(100%)";
        } else if (origin === "top") {
          drawer.style.left = "0";
          drawer.style.right = "0";
          drawer.style.top = "0";
          drawer.style.bottom = "auto";
          drawer.style.height = "auto";
          drawer.style.maxHeight = "80vh";
          drawer.style.width = "100%";
          hiddenTransform = "translateY(-100%)";
        } else {
          drawer.style.right = "0";
          drawer.style.left = "auto";
        }
        drawer.style.transform = hiddenTransform;
      }

      function openDrawer() {
        if (!overlay || !drawer) return;
        overlay.style.display = "block";
        document.body.style.overflow = "hidden";
        drawer.getBoundingClientRect();
        if (origin === "bottom" || origin === "top") {
          drawer.style.transform = "translateY(0)";
        } else {
          drawer.style.transform = "translateX(0)";
        }
      }

      function closeDrawer() {
        if (!overlay || !drawer) return;
        drawer.style.transform = hiddenTransform;
        setTimeout(() => {
          overlay.style.display = "none";
          document.body.style.overflow = "";
        }, 260);
      }

      if (launcher && overlay && drawer) {
        openHandler = () => openDrawer();
        launcher.addEventListener("click", (e) => {
          e.preventDefault();
          openDrawer();
        });
      }

      if (overlay && beh.closeOnOutside !== false) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) closeDrawer();
        });
      }

      closeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          closeDrawer();
        });
      });

      if (drawerCta) drawerCta.addEventListener("click", onSubmitClick);
    }

    // Sticky
    setupSticky(root, cfg, styleType, openHandler);

    // event listeners geo sur province / ville
    if (provSelect && geoEnabled) {
      provSelect.addEventListener("change", () => {
        recalcGeo();
      });
    }
    if (citySelect && geoEnabled) {
      citySelect.addEventListener("change", () => {
        recalcGeo();
      });
    }

    // Auto-open
    const delay = Number(beh.openDelayMs || 0);
    if (
      delay > 0 &&
      styleType !== "inline" &&
      typeof openHandler === "function"
    ) {
      setTimeout(() => {
        openHandler();
      }, delay);
    }

    // première maj
    updateMoney();
    if (geoEnabled) {
      recalcGeo();
    }

    return handleTotalsChange;
  }

  /* ------------------------------------------------------------------ */
  /* Boot par section                                                   */
  /* ------------------------------------------------------------------ */

  function boot(sectionId) {
    const holder =
      byId(`tripleform-cod-${sectionId}`) ||
      document.querySelector(".tripleform-cod");
    if (!holder) return;

    // Injecter le CSS des offres
    injectOffersCSS();

    const cfg = parseSettingsAttr(holder);
    const offersCfg = parseOffersAttr(holder);
    const currency = holder.getAttribute("data-currency") || "USD";
    const locale = holder.getAttribute("data-locale") || "en";
    const moneyFmt = fmtMoneyFactory(locale, currency);

    const recaptchaEnabledAttr = holder.getAttribute("data-recaptcha-enabled");
    const recaptchaEnabled =
      recaptchaEnabledAttr === "true" ||
      recaptchaEnabledAttr === "1" ||
      recaptchaEnabledAttr === "yes";

    const recaptchaVersion =
      holder.getAttribute("data-recaptcha-version") || "";
    const recaptchaSiteKey =
      holder.getAttribute("data-recaptcha-site-key") || "";
    const recaptchaMinScoreAttr =
      holder.getAttribute("data-recaptcha-min-score");
    const recaptchaMinScore = recaptchaMinScoreAttr
      ? Number(recaptchaMinScoreAttr)
      : 0.5;

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
    const product = JSON.parse(prodEl.textContent || "{}");

    const getVariant = () =>
      getSelectedVariantId() || holder.getAttribute("data-variant-id");

    const doUpdate = render(
      holder,
      cfg,
      offersCfg,
      product,
      getVariant,
      moneyFmt,
      recaptchaCfg
    );

    watchVariantAndQty(() => doUpdate());
  }

  return { boot };
})();