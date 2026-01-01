/* =========================================================================
   TripleForm COD — OFFERS + UPSELLS (FULL JS v31)
   ✅ Fix 1: Icons in COD fields now always show (strong normalization + fallback)
   ✅ Fix 2: Discount logic correct:
       - Product price = subtotal (unit * qty)
       - Remise computed on subtotal
       - Total = (subtotal - remise) + shipping
   ✅ Fix 3: Offer "Activate" button works in Inline + Popup + Drawer (event delegation)
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

  /* ------------------------------------------------------------------ */
  /* Polaris-like SVG Icons (extended + fallback)                        */
  /* ------------------------------------------------------------------ */
  const ICON_SVGS = {
    AppsIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 9.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 15.5h4v1H5v-1Zm6 0h4v1h-4v-1Z"
        fill="currentColor" opacity=".9"/>
    </svg>`,

    PlusIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
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

    CartIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2.5 3h2l1.1 9.2a2 2 0 0 0 2 1.8h6.8a2 2 0 0 0 2-1.7l1-6.3H5.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.7 17a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Zm9 0a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z" fill="currentColor"/>
    </svg>`,

    PhoneIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6.2 3.6c.4-.5 1.2-.5 1.6 0l1.3 1.6c.3.4.3 1 0 1.4l-.9 1.1a1 1 0 0 0-.1 1.1c.8 1.5 2 2.8 3.5 3.6.4.2.9.1 1.2-.2l1-1c.4-.4 1-.4 1.5-.1l1.6 1.1c.6.4.7 1.2.2 1.8l-.9 1c-.7.8-1.7 1.2-2.8 1-5.8-1.2-10.4-6-11.6-11.9-.2-1 .1-2 .8-2.8l1-.7Z"
        stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    PhoneMobileIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 2.8h6c.9 0 1.6.7 1.6 1.6v11.2c0 .9-.7 1.6-1.6 1.6H7c-.9 0-1.6-.7-1.6-1.6V4.4c0-.9.7-1.6 1.6-1.6Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M8 4.8h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M10 15.8h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>`,

    LocationIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M10 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" stroke="currentColor" stroke-width="1.6"/>
    </svg>`,

    PersonIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 10.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3.8 18c.7-3 3.1-5.1 6.2-5.1s5.5 2.1 6.2 5.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    NoteIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M6.5 6.5h7M6.5 9.5h7M6.5 12.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    EmailIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h13v9h-13v-9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M4 6l6 5 6-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    HomeIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 9.2 10 3l7 6.2V17a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.2Z"
        stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,

    StoreIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 8.5 4.2 3H15.8L17 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 8.5V17a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M8 18v-6h4v6" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,

    ArrowRightIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="m11 5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    SendIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 9.2 17 3l-6.2 14-1.6-5.2L3 9.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M17 3 9.2 11.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,

    PackageIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 7.2 10 4l6 3.2v6.2L10 17l-6-3.6V7.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M4 7.2 10 10.8l6-3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 10.8V17" stroke="currentColor" stroke-width="1.6"/>
    </svg>`,

    XCircleIcon: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7.2 7.2 12.8 12.8M12.8 7.2 7.2 12.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
  };

  function normalizeIconName(name) {
    const raw = String(name || "").trim();
    if (!raw) return "";

    let n = raw.replace(/Major$/i, "").replace(/Minor$/i, "");

    // common aliases (to survive different admin names)
    const alias = {
      phone: "PhoneIcon",
      mobile: "PhoneMobileIcon",
      phonemobile: "PhoneMobileIcon",
      location: "LocationIcon",
      map: "LocationIcon",
      email: "EmailIcon",
      mail: "EmailIcon",
      user: "PersonIcon",
      person: "PersonIcon",
      note: "NoteIcon",
      cart: "CartIcon",
      discount: "DiscountIcon",
      gift: "GiftCardIcon",
      package: "PackageIcon",
    };

    const k = n.toLowerCase().replace(/[^a-z]/g, "");
    if (alias[k]) return alias[k];

    if (!/Icon$/i.test(n)) n = n + "Icon";
    n = n[0].toUpperCase() + n.slice(1);
    return n;
  }

  function getIconHtml(iconName, size = 18, color = "currentColor") {
    const key = normalizeIconName(iconName);
    const svg =
      ICON_SVGS[key] ||
      ICON_SVGS[String(iconName || "").trim()] ||
      ICON_SVGS["AppsIcon"]; // fallback always

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

      .tf-motion-x{animation:tfMoveX 1.2s ease-in-out infinite}
      .tf-motion-y{animation:tfMoveY 1.2s ease-in-out infinite}
      .tf-motion-pulse{animation:tfPulse 1.1s ease-in-out infinite}
      .tf-motion-shake{animation:tfShake 1.4s ease-in-out infinite}
      @keyframes tfMoveX{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
      @keyframes tfMoveY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes tfPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes tfShake{
        0%,100%{transform:translateX(0)}
        10%,30%,50%,70%,90%{transform:translateX(-3px)}
        20%,40%,60%,80%{transform:translateX(3px)}
      }

      .tf-offers-container{display:grid;gap:10px;margin-bottom:16px}

      .tf-offer-card{
        border-radius:14px;
        border:1px solid #E5E7EB;
        padding:14px;
        box-shadow:0 10px 22px rgba(15,23,42,0.06);
        background:#fff;
        overflow:hidden;
      }
      .tf-offer-row{display:flex;gap:12px;align-items:center}
      .tf-offer-icon{
        width:36px;height:36px;border-radius:12px;
        display:grid;place-items:center;flex:none;overflow:hidden;
        border:1px solid rgba(0,0,0,.10);
        background:#EEF2FF;
      }
      .tf-offer-icon img{width:100%;height:100%;object-fit:cover;display:block}
      .tf-offer-img{
        width:92px;height:92px;border-radius:16px;overflow:hidden;flex:none;
        border:1px solid rgba(0,0,0,.08);background:#F3F4F6;
      }
      .tf-offer-img img{width:100%;height:100%;object-fit:cover;display:block}
      .tf-offer-main{min-width:0;flex:1}
      .tf-offer-title{font-weight:900;font-size:14px;margin-bottom:3px;color:#111827}
      .tf-offer-desc{font-size:12px;color:#6B7280;line-height:1.35}
      .tf-offer-sub{font-size:11px;color:#94A3B8;margin-top:7px}

      .tf-offer-btn{
        margin-top:10px;border-radius:12px;padding:9px 10px;
        font-size:12px;font-weight:900;cursor:pointer;
        border:1px solid transparent;
        display:inline-flex;align-items:center;gap:8px;
        transition:all .15s ease;
      }
      .tf-offer-btn:hover{transform:translateY(-1px);opacity:.95}
      .tf-offer-btn.active{filter:saturate(1.1)}
      .tf-offer-btn.disabled{opacity:.6;cursor:not-allowed}

      .tf-layout-image-right .tf-offer-row{flex-direction:row-reverse}
      .tf-layout-image-top .tf-offer-row{flex-direction:column;align-items:stretch}
      .tf-layout-image-top .tf-offer-img{width:100%;height:160px}
      .tf-layout-image-bottom .tf-offer-row{flex-direction:column-reverse;align-items:stretch}
      .tf-layout-image-bottom .tf-offer-img{width:100%;height:160px}
      .tf-layout-image-bottom .tf-offer-desc{font-size:11px}

      [data-tf="discount-row"]{display:none}

      .offer-timer{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;margin-top:8px;padding:6px 10px;border-radius:10px}
      .timer-countdown{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:900;letter-spacing:.6px;margin-left:auto}
      .timer-simple{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
      .timer-elegant{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border:1px solid #DDD6FE}
      .timer-minimal{background:#F9FAFB;color:#374151;border:1px solid #E5E7EB}
      .timer-urgent{background:linear-gradient(90deg,#991B1B,#DC2626);color:#fff;border:1px solid #FCA5A5;animation:tfBlink 1s infinite}
      @keyframes tfBlink{0%,100%{opacity:1}50%{opacity:.7}}
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /* Country defs (trimmed)                                             */
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
        {
          id: "RABAT",
          name: "Rabat-Salé-Kénitra",
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
        {
          id: "TANGER",
          name: "Tanger-Tétouan-Al Hoceïma",
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
        {
          id: "MARRAKECH",
          name: "Marrakech-Safi",
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
      ],
    },
    dz: { label: "Algérie", phonePrefix: "+213", provinces: [] },
    tn: { label: "Tunisie", phonePrefix: "+216", provinces: [] },
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
  /* Overlay / effect shadows / sizes                                    */
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
  function setupSticky(root, cfg, styleType, openHandler, motionClass) {
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

    const iconHtml = getIconHtml(stickyIcon, 16, text);

    if (stickyType === "bottom-bar") {
      el.style.cssText = baseStyle + `left:16px;right:16px;`;
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
          <button type="button" data-tf-sticky-cta class="${motionClass}" style="
            border-radius:999px;
            border:1px solid ${br};
            background:${bg};
            color:${text};
            font-weight:700;
            padding:8px 18px;
            font-size:13px;
            cursor:pointer;
            box-shadow:0 10px 24px rgba(0,0,0,.35);
            display:flex; align-items:center; gap:8px;
          ">
            ${iconHtml}${stickyLabel}
          </button>
        </div>
      `;
    } else {
      const isLeft = stickyType === "bubble-left";
      el.style.cssText = baseStyle + `${isLeft ? "left:16px;" : "right:16px;"}`;
      el.innerHTML = `
        <button type="button" data-tf-sticky-cta class="${motionClass}" style="
          border-radius:999px;
          border:1px solid ${br};
          background:${bg};
          color:${text};
          font-weight:700;
          padding:10px 18px;
          font-size:13px;
          cursor:pointer;
          box-shadow:0 18px 36px rgba(0,0,0,.55);
          max-width:220px;
          white-space:nowrap;
          display:flex; align-items:center; gap:8px;
        ">
          ${iconHtml}${stickyLabel}
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
        provinceName
          ? (cfg.fields?.city?.ph || "Select city")
          : (cfg.fields?.city?.ph || "Select province first")
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
  /* Timers (optional)                                                  */
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
          return `${h.toString().padStart(2, "0")}h ${m
            .toString()
            .padStart(2, "0")}m`;
        case "mm[m] ss[s]":
          return `${m.toString().padStart(2, "0")}m ${s
            .toString()
            .padStart(2, "0")}s`;
        case "hh[h]":
          return `${h.toString().padStart(2, "0")}h`;
        case "mm:ss":
        default:
          return `${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`;
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

    // one offer at a time
    const allButtons = root.querySelectorAll("[data-tf-offer-toggle]");
    allButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
      const baseText = btn.getAttribute("data-tf-btn-label") || "Activer";
      btn.innerHTML = `${getIconHtml("CirclePlusIcon", 16, "currentColor")} ${css(
        baseText
      )}`;
    });

    localStorage.removeItem(storeKey);

    if (!isActive) {
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      button.innerHTML = `${getIconHtml(
        "CheckCircleIcon",
        16,
        "currentColor"
      )} Activée`;

      const offer = offersList[offerIndex] || {};

      // ✅ discount fields
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

  function layoutClass(layoutStyle) {
    const v = String(layoutStyle || "image-left");
    if (v === "image-right") return "tf-layout-image-right";
    if (v === "image-top") return "tf-layout-image-top";
    if (v === "image-bottom") return "tf-layout-image-bottom";
    return "tf-layout-image-left";
  }

  function buildOffersHtml(offersCfg, rootId) {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (global.enabled === false) return "";

    const globalColors = global.colors || {};

    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    const activeOffers = offers.filter(
      (o) => o && o.enabled !== false && o.showInPreview !== false
    );
    const activeUpsells = upsells.filter(
      (u) => u && u.enabled !== false && u.showInPreview !== false
    );

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

      const isActive =
        active && Number(active.index) === idx && active.type === "offer";

      const btnLabel = offer.buttonText || "Activer";

      const hasTimer = !!offer.enableTimer;

      html += `
        <div class="tf-offer-card ${layoutClass(offer.layoutStyle)}"
          style="background:${css(c.cardBg)};border-color:${css(c.borderColor)}">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              ${
                iconUrl
                  ? `<img src="${css(iconUrl)}" alt="" onerror="this.style.display='none'"/>`
                  : `${getIconHtml("DiscountIcon", 18, "#111827")}`
              }
            </div>

            <div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}"
                onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
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
        <div class="tf-offer-card ${layoutClass(upsell.layoutStyle)}"
          style="background:${css(c.cardBg)};border-color:${css(c.borderColor)}">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              ${
                iconUrl
                  ? `<img src="${css(iconUrl)}" alt="" onerror="this.style.display='none'"/>`
                  : `${getIconHtml("GiftCardIcon", 18, "#111827")}`
              }
            </div>

            <div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}"
                onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>
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
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  function render(root, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg) {
    const d = cfg.design || {};
    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    const f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";

    const motion = beh.buttonMotion || "none";
    const motionClass =
      motion === "x"
        ? "tf-motion-x"
        : motion === "y"
        ? "tf-motion-y"
        : motion === "pulse"
        ? "tf-motion-pulse"
        : motion === "shake"
        ? "tf-motion-shake"
        : "";

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

    const rawDirection =
      d.direction || d.textDirection || beh.textDirection || "ltr";
    const textDir =
      String(rawDirection).toLowerCase() === "rtl" ? "rtl" : "ltr";

    const rawTitleAlign =
      d.titleAlign || beh.titleAlign || d.textAlign || beh.textAlign || "left";
    const titleAlignValue = String(rawTitleAlign).toLowerCase();
    const titleAlign =
      titleAlignValue === "center"
        ? "center"
        : titleAlignValue === "right"
        ? "right"
        : "left";

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

    const selectStyle = inputStyle;

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
      font-weight:800;
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

      const iconHtml = field.icon ? getIconHtml(field.icon, 18, "#111827") : "";
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
          ? `<input style="${inputStyle}; text-align:center;" value="${css(
              field.prefix
            )}" readonly />`
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
                <input type="tel" data-tf-field="${key}" style="${inputStyle}" placeholder="${css(
          ph
        )}" ${requiredAttr} />
              </div>
            </div>
          </div>
        `;
      }

      const typeAttr =
        field.type === "number" ? 'type="number"' : 'type="text"';

      return `
        <div style="${fieldContainerStyle}">
          <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
            ${iconHtml}
          </div>
          <div style="flex:1;">
            <label style="${labelStyle}">${css(label)}</label>
            <input ${typeAttr} data-tf-field="${key}" style="${inputStyle}" placeholder="${css(
        ph
      )}" ${requiredAttr} />
          </div>
        </div>
      `;
    }

    function fieldsBlockHTML() {
      return orderedFieldKeys().map((k) => fieldHTML(k)).join("");
    }

    function cartSummaryHTML() {
      const cartIconHtml = t.cartIcon
        ? getIconHtml(t.cartIcon, 18, css(d.cartTitleColor || "#111827"))
        : "";
      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">${cartIconHtml}${css(
        t.top || "Order summary"
      )}</div>
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
              <div style="font-weight:800;" data-tf="shipping">${css(
                t.shippingToCalculate || "Shipping to calculate"
              )}</div>
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

    function formCardHTML(ctaKey, isPopupOrDrawer = false) {
      const orderLabel = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const suffix = css(ui.totalSuffix || "Total:");

      const buttonIconHtml = cfg.form?.buttonIcon
        ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff"))
        : "";

      const honeypotInputHTML = `
        <input type="text" name="tf_hp_token" data-tf-hp="1" autocomplete="off" tabindex="-1"
          style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0;" />
      `;

      const formContainerStyle = isPopupOrDrawer
        ? `padding:0;background:transparent;border:none;box-shadow:none;border-radius:0;`
        : cardStyle;

      return `
        <div style="${formContainerStyle}" data-tf-role="form-card">
          ${
            cfg.form?.title || cfg.form?.subtitle
              ? `
            <div style="text-align:${titleAlign}; margin-bottom:20px;">
              ${
                cfg.form?.title
                  ? `<div style="font-weight:900; font-size:${labelFontSize}; margin-bottom:4px;">${css(
                      cfg.form.title
                    )}</div>`
                  : ""
              }
              ${
                cfg.form?.subtitle
                  ? `<div style="opacity:.85; font-size:${smallFontSize};">${css(
                      cfg.form.subtitle
                    )}</div>`
                  : ""
              }
            </div>`
              : ""
          }

          <div style="position:relative;">
            <input type="text" data-tf-role="honeypot" name="tf_hp_token"
              style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;"
              tabindex="-1" autocomplete="off" />

            ${fieldsBlockHTML()}
            ${honeypotInputHTML}

            ${
              beh?.requireGDPR
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" /> ${css(
                  beh.gdprLabel || "I accept the privacy policy"
                )}
              </label>`
                : ""
            }

            ${
              beh?.whatsappOptIn
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" /> ${css(
                  beh.whatsappLabel || "Receive confirmation on WhatsApp"
                )}
              </label>`
                : ""
            }

            <button type="button" style="${btnStyle}; margin-top:16px;"
              class="${motionClass}"
              data-tf-cta="1" data-tf="${ctaKey}">
              ${buttonIconHtml}${orderLabel} · ${suffix} …
            </button>
          </div>
        </div>
      `;
    }

    const mainStart = `<div style="max-width:560px;margin:0 auto;display:grid;gap:16px;direction:${textDir};box-sizing:border-box;">`;
    const mainEnd = `</div>`;

    let html = "";

    if (styleType === "inline") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        `<div style="height:8px"></div>` +
        formCardHTML("cta-inline", false) +
        mainEnd;
    } else if (styleType === "popup") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        `<div style="height:8px"></div>` +
        `
        <div style="text-align:${titleAlign};">
          <button type="button" style="${btnStyle}"
            class="${motionClass}"
            data-tf-cta="1" data-tf="launcher">
            ${
              cfg.form?.buttonIcon
                ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff"))
                : ""
            }${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(
          ui.totalSuffix || "Total:"
        )} …
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (popup)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div data-tf-role="popup" style="
          position:fixed; inset:0; display:none; align-items:center; justify-content:center;
          z-index:999999; background:${ovBg}; padding:20px; box-sizing:border-box;">
          <div style="
            width:100%; max-width:${popupCfg.maxWidth}; max-height:${popupCfg.maxHeight};
            box-sizing:border-box; position:relative; background:${css(d.bg)};
            border-radius:${+d.radius || 12}px; box-shadow:${cardShadow}; overflow:auto;">
            <div style="text-align:right; margin-bottom:8px; position:absolute; top:12px; right:12px; z-index:10;">
              <button type="button" data-tf="close" style="
                background:${css(d.bg)}; border:1px solid ${css(
          d.border
        )}; color:${css(d.text)};
                font-size:20px; cursor:pointer; width:32px; height:32px; display:flex;
                align-items:center; justify-content:center; border-radius:50%;">&times;</button>
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
        `<div style="height:8px"></div>` +
        `
        <div style="text-align:${titleAlign};">
          <button type="button" style="${btnStyle}"
            class="${motionClass}"
            data-tf-cta="1" data-tf="launcher">
            ${
              cfg.form?.buttonIcon
                ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff"))
                : ""
            }${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(
          ui.totalSuffix || "Total:"
        )} …
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (drawer)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div data-tf-role="drawer-overlay" style="
          position:fixed; inset:0; display:none; z-index:999999;
          background:${ovBg}; overflow:hidden; padding:0;">
          <div data-tf-role="drawer" data-origin="${origin}" style="
            position:absolute; top:0; bottom:0; width:${drawerCfg.sideWidth};
            max-height:100%; background:${css(d.bg)}; box-shadow:0 0 40px rgba(15,23,42,0.65);
            display:flex; flex-direction:column; padding:0; box-sizing:border-box;
            transform:translateX(100%); transition:transform 260ms ease; overflow:hidden;">
            <div style="padding:24px; overflow:auto; flex:1; box-sizing:border-box;">
              <div style="text-align:right; margin-bottom:16px;">
                <button type="button" data-tf="close" style="
                  background:${css(d.bg)}; border:1px solid ${css(
          d.border
        )}; color:${css(d.text)};
                  font-size:20px; cursor:pointer; width:32px; height:32px; display:flex;
                  align-items:center; justify-content:center; border-radius:50%;">&times;</button>
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

    setTimeout(() => initializeTimers(root, offersCfg), 80);
    setupLocationDropdowns(root, cfg, countryDef);

    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');

    /* --------------------- Field helpers --------------------------- */
    function getField(key) {
      const el = root.querySelector(`[data-tf-field="${key}"]`);
      return el || null;
    }

    function getVal(key) {
      const el = getField(key);
      return el ? String(el.value || "").trim() : "";
    }

    function getPhone() {
      const phone = getVal("phone");
      const prefix = f.phone && f.phone.prefix ? String(f.phone.prefix) : "";
      const fullPhone = prefix && phone ? `${prefix}${phone}` : phone || prefix || "";
      return { prefix, number: phone, fullPhone };
    }

    /* --------------------- Product totals --------------------------- */
    function computeProductTotals() {
      const vId = getVariant();
      const qty = getQty();
      const variant =
        product.variants.find((v) => String(v.id) === String(vId)) ||
        product.variants[0];

      let unitPriceCents = 0;
      if (variant && variant.price != null) {
        const rawStr = String(variant.price);
        const rawNum = Number(rawStr);
        if (Number.isFinite(rawNum)) {
          // if price includes decimals => convert to cents
          unitPriceCents = rawStr.includes(".")
            ? Math.round(rawNum * 100)
            : Math.round(rawNum);
        }
      }

      const subtotalCents = unitPriceCents * qty;

      return {
        unitPriceCents,
        subtotalCents,
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
      const baseTotalCents = totals.subtotalCents;

      const province = getVal("province");
      const city = getVal("city");

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
          geoShippingCents = null;
          geoNote = "";
        } else {
          const shippingObj = json.shipping || {};
          let shippingCents = 0;
          let codFeeCents = 0;

          if (shippingObj.amount != null) {
            const amount = Number(shippingObj.amount);
            if (Number.isFinite(amount) && amount > 0)
              shippingCents = Math.round(amount * 100);
          }
          if (shippingObj.codExtraFee != null) {
            const codAmount = Number(shippingObj.codExtraFee);
            if (Number.isFinite(codAmount) && codAmount > 0)
              codFeeCents = Math.round(codAmount * 100);
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

    function validateRequiredFields() {
      const requiredKeys = Object.keys(f || {}).filter(
        (k) => f[k]?.on && f[k]?.required
      );
      if (!requiredKeys.length) return true;

      let firstInvalid = null;
      const missing = [];

      requiredKeys.forEach((k) => {
        const el = getField(k);
        if (!el) return;
        const value = String(el.value || "").trim();
        if (!value) {
          missing.push(f[k]?.label || k);
          if (!firstInvalid) firstInvalid = el;
          el.style.borderColor = "#ef4444";
          el.style.boxShadow = "0 0 0 1px rgba(239,68,68,0.35)";
        } else {
          el.style.borderColor = css(d.inputBorder);
          el.style.boxShadow = "none";
        }
      });

      if (missing.length) {
        alert(
          "Merci de remplir les champs obligatoires :\n- " +
            missing.join("\n- ")
        );
        if (firstInvalid && typeof firstInvalid.focus === "function")
          firstInvalid.focus();
        return false;
      }
      return true;
    }

    function checkAntibotFront() {
      const now = Date.now();
      const timeOnPageMs = now - pageStart;

      const hpInput = root.querySelector('[data-tf-role="honeypot"]');
      const hpValue = hpInput ? String(hpInput.value || "").trim() : "";

      if (hpInput && hpValue) {
        alert("Votre commande n'a pas pu être envoyée. (anti-bot)");
        return { ok: false, reason: "honeypot", timeOnPageMs, hpValue };
      }

      if (timeOnPageMs < 1500) {
        alert("Merci de prendre quelques secondes avant d'envoyer le formulaire.");
        return { ok: false, reason: "too_fast", timeOnPageMs };
      }

      return { ok: true, timeOnPageMs, hpValue };
    }

    /* --------------------- Money + UI (FIXED DISCOUNT) --------------- */
    const offersVisible = Array.isArray(offersCfg?.offers) ? offersCfg.offers : [];
    const activeOffersOnly = offersVisible.filter(
      (o) => o && o.enabled !== false && o.showInPreview !== false
    );

    function computeDiscountCents(subtotalCents, rootId) {
      const { discountEnabled, discountType, discountValue } = getActiveOfferDiscount(
        activeOffersOnly,
        rootId
      );

      if (!discountEnabled) return 0;
      if (!discountType || !(discountValue > 0)) return 0;

      if (discountType === "percentage") {
        return Math.round(subtotalCents * (discountValue / 100));
      }

      if (discountType === "fixed") {
        // fixed value is in "currency units" => convert to cents
        return Math.round(discountValue * 100);
      }

      return 0;
    }

    function updateMoney() {
      const { subtotalCents } = computeProductTotals();

      const discountCents = computeDiscountCents(subtotalCents, root.id);
      const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents);
      const shippingCents = geoShippingCents || 0;

      const grandTotalCents = discountedSubtotalCents + shippingCents;

      // ✅ Product price row shows SUBTOTAL (unit*qty)
      root.querySelectorAll('[data-tf="price"]').forEach((el) => {
        el.textContent = moneyFmt(subtotalCents);
      });

      root.querySelectorAll('[data-tf="total"]').forEach((el) => {
        el.textContent = moneyFmt(grandTotalCents);
      });

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

      const label = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const suffix = css(ui.totalSuffix || "Total:");
      const buttonIconHtml = cfg.form?.buttonIcon
        ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff"))
        : "";

      root.querySelectorAll('[data-tf-cta="1"]').forEach((el) => {
        el.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;
      });

      const mainCta = root.querySelector('[data-tf="launcher"]');
      if (mainCta) {
        mainCta.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;
      }
    }

    // ✅ Offer activation works everywhere (inline + popup + drawer)
    root.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("[data-tf-offer-toggle]") : null;
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const offerIndex = parseInt(btn.getAttribute("data-tf-offer-index") || "0", 10);
      if (!Number.isFinite(offerIndex)) return;

      toggleOfferActivation(btn, offerIndex, activeOffersOnly, root, updateMoney);
    });

    /* --------------------- Submit + reCAPTCHA ------------------------ */
    async function onSubmitClick() {
      const ab = checkAntibotFront();
      if (!ab.ok) return;

      if (!validateRequiredFields()) return;

      const { unitPriceCents, subtotalCents, qty, variantId } = computeProductTotals();

      const discountCents = computeDiscountCents(subtotalCents, root.id);
      const discountedSubtotalCents = Math.max(0, subtotalCents - discountCents);

      const shippingCentsToSend = geoShippingCents || 0;
      const grandTotalCents = discountedSubtotalCents + shippingCentsToSend;

      const phone = getPhone();

      const now = Date.now();
      const hpInput = root.querySelector('input[data-tf-hp="1"]');
      const hpValue = hpInput ? hpInput.value || "" : "";

      let recaptchaToken = null;
      let recaptchaVersion = recaptchaCfg?.version || null;

      if (recaptchaCfg?.enabled && recaptchaCfg.version === "v3" && recaptchaCfg.siteKey) {
        try {
          await ensureRecaptchaScript(recaptchaCfg);
          if (window.grecaptcha && window.grecaptcha.execute) {
            recaptchaToken = await window.grecaptcha.execute(recaptchaCfg.siteKey, {
              action: "submit_cod",
            });
          }
        } catch (e) {
          console.warn("[Tripleform COD] reCAPTCHA v3 error:", e);
        }
      }

      const storeKey = lsKey(root.id, "current_active_offer");
      const activeOfferData = safeJsonParse(localStorage.getItem(storeKey), null);

      const payload = {
        fields: {
          name: getVal("name"),
          phone: phone.number || phone.fullPhone,
          phonePrefix: phone.prefix,
          fullPhone: phone.fullPhone,
          address: getVal("address"),
          city: getVal("city"),
          province: getVal("province"),
          notes: getVal("notes"),
          email: getVal("email"),
        },
        productId: root.getAttribute("data-product-id") || null,
        variantId,
        qty,

        // pricing
        unitPriceCents,
        subtotalCents,
        discountCents,
        shippingCents: shippingCentsToSend,
        totalCents: discountedSubtotalCents,
        grandTotalCents,

        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,

        offer: activeOfferData || null,

        geo: {
          enabled: geoEnabled,
          country: geoCountryAttr,
          province: getVal("province"),
          city: getVal("city"),
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
      const btn = formCard ? formCard.querySelector('[data-tf-cta="1"]') : null;
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
          if (btn) btn.innerHTML = css(cfg.form?.successText || "Thanks! We'll contact you");
        } else {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = original;
          }
          alert("Erreur: " + (json?.error || res.statusText || "Submit failed"));
        }
      } catch {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = original;
        }
        alert("Erreur réseau. Réessaie.");
      }
    }

    /* --------------------- behaviors inline/popup/drawer ------------- */
    let openHandler = null;

    if (styleType === "inline") {
      const btn = root.querySelector('[data-tf="cta-inline"]');
      if (btn) btn.addEventListener("click", onSubmitClick);
      openHandler = () => root.scrollIntoView({ behavior: "smooth", block: "center" });
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

      closeBtns.forEach((b) =>
        b.addEventListener("click", (e) => {
          e.preventDefault();
          if (!popup) return;
          popup.style.display = "none";
          document.body.style.overflow = "";
        })
      );

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
        drawer.style.transform =
          origin === "bottom" || origin === "top" ? "translateY(0)" : "translateX(0)";
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
        openHandler = openDrawer;
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

      closeBtns.forEach((b) =>
        b.addEventListener("click", (e) => {
          e.preventDefault();
          closeDrawer();
        })
      );

      if (drawerCta) drawerCta.addEventListener("click", onSubmitClick);
    }

    setupSticky(root, cfg, styleType, openHandler, motionClass);

    if (provSelect && geoEnabled) provSelect.addEventListener("change", recalcGeo);
    if (citySelect && geoEnabled) citySelect.addEventListener("change", recalcGeo);

    const delay = Number(beh.openDelayMs || 0);
    if (delay > 0 && styleType !== "inline" && typeof openHandler === "function") {
      setTimeout(() => openHandler(), delay);
    }

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
    const holder =
      byId(`tripleform-cod-${sectionId}`) || document.querySelector(".tripleform-cod");
    if (!holder) return;

    injectGlobalCSSOnce();

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
})();
