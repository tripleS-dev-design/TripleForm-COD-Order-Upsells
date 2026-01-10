/* =========================================================================
   TripleForm COD — OFFERS + UPSELLS (SYNC OFFERS + FIX THANKYOU + ICONS)
   ✅ NO COUNTRY_DATA (paste manually)
   ✅ Icons: real/simple SVG icons + always visible fallback
   ✅ Colors unified via CSS variables (offers + form)
   ✅ Offers sync: qty packs + discount + total update
   ✅ Discount logic: % or fixed (once OR per item) + capped
   ✅ Offer can override total price (bundleTotal) OR force qty
   ✅ Thank you: popup/redirect WITHOUT keeping "Thanks..." on CTA
   ✅ Anti-bot: honeypot + minimum time on page (configurable)
   ✅ reCAPTCHA v2: checkbox loader (explicit render)
   ========================================================================= */

window.TripleformCOD = (function () {
  "use strict";
  // TF GEO build marker (for debugging cache issues)
  window.__TF_GEO_BUILD__ = "geo-v5-2026-01-10";

  /* ------------------------------------------------------------------ */
/* reCAPTCHA script loader (v2 checkbox)                               */
/*  - Loads: https://www.google.com/recaptcha/api.js?render=explicit    */
/*  - Renders widget via grecaptcha.render(container, { sitekey })      */
/*  - Token via grecaptcha.getResponse(widgetId)                        */
/* ------------------------------------------------------------------ */
  let recaptchaScriptPromise = null;
  const recaptchaV2WidgetIds = new WeakMap(); // root -> widgetId

  function waitForGrecaptcha({ timeoutMs = 10000, intervalMs = 80 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const g = window.grecaptcha;
        if (g && typeof g.render === "function" && typeof g.getResponse === "function") {
          clearInterval(timer);
          resolve(g);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          clearInterval(timer);
          reject(new Error("grecaptcha not available (timeout)"));
        }
      }, intervalMs);
    });
  }

  function ensureRecaptchaScript(cfg) {
    if (!cfg || !cfg.enabled || !cfg.siteKey) return Promise.resolve(null);

    // already available
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      return Promise.resolve(window.grecaptcha);
    }

    // already in-flight
    if (recaptchaScriptPromise) return recaptchaScriptPromise;

    recaptchaScriptPromise = new Promise((resolve, reject) => {
      // already injected?
      const existing = document.querySelector('script[data-tf-recaptcha="1"]');
      if (existing) {
        waitForGrecaptcha().then(resolve).catch(reject);
        return;
      }

      const s = document.createElement("script");
      // v2 checkbox uses explicit rendering
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-tf-recaptcha", "1");

      s.onload = () => {
        waitForGrecaptcha().then(resolve).catch(reject);
      };
      s.onerror = () => reject(new Error("Failed to load reCAPTCHA script"));
      document.head.appendChild(s);
    });

    return recaptchaScriptPromise;
  }

  async function ensureRecaptchaV2Widget(root, cfg) {
    if (!cfg || !cfg.enabled || !cfg.siteKey) return null;

    try {
      const g = await ensureRecaptchaScript(cfg);
      if (!g) return null;

      const existing = recaptchaV2WidgetIds.get(root);
      if (typeof existing === "number") return existing;

      const sel = cfg.v2Container || '[data-tf-recaptcha-v2="1"]';
      let container =
        (sel && root && root.querySelector ? root.querySelector(sel) : null) ||
        (sel ? document.querySelector(sel) : null) ||
        null;

      if (!container) {
        // fallback: create container near the CTA if missing
        container = document.createElement("div");
        container.className = "tf-recaptcha-v2";
        container.style.marginTop = "12px";
        root.appendChild(container);
      }

      const widgetId = g.render(container, {
        sitekey: cfg.siteKey,
        theme: cfg.v2Theme || "light",
        size: cfg.v2Size || "normal",
      });

      recaptchaV2WidgetIds.set(root, widgetId);
      return widgetId;
    } catch (e) {
      console.warn("[Tripleform COD] reCAPTCHA v2 render error:", e);
      return null;
    }
  }

  function resetRecaptchaV2(root) {
    try {
      const g = window.grecaptcha;
      const id = recaptchaV2WidgetIds.get(root);
      if (g && typeof g.reset === "function" && typeof id === "number") g.reset(id);
    } catch {}
  }

  async function getRecaptchaToken(cfg, root) {
    if (!cfg || !cfg.enabled || !cfg.siteKey) return null;
    try {
      const g = await ensureRecaptchaScript(cfg);
      if (!g) return null;

      const widgetId = await ensureRecaptchaV2Widget(root || document.body, cfg);
      if (typeof widgetId !== "number") return null;

      const token = g.getResponse(widgetId);
      return token || null;
    } catch (e) {
      console.warn("[Tripleform COD] reCAPTCHA token error:", e);
      return null;
    }
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

  function hexToRgba(hex, alpha) {
    const h = String(hex || "").trim();
    let a = Number(alpha);
    if (!Number.isFinite(a)) a = 1;
    a = Math.max(0, Math.min(1, a));

    let x = h.replace("#", "");
    if (x.length === 3) x = x.split("").map((ch) => ch + ch).join("");
    if (x.length !== 6) return `rgba(2,6,23,${a})`;

    const r = parseInt(x.slice(0, 2), 16);
    const g = parseInt(x.slice(2, 4), 16);
    const b = parseInt(x.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function shadowFromEffect(cfg, baseGlow) {
    const d = (cfg && cfg.design) || {};
    const shadowOn = d.shadow !== false;
    if (!shadowOn) return "none";

    const base = "0 18px 40px rgba(15,23,42,0.10)";
    const glowOn = d.glow === true;
    if (!glowOn) return base;

    const px = Math.max(0, Number(d.glowPx || 18));
    const glowColor = hexToRgba(baseGlow || d.btnBg || "#2563EB", 0.3);
    return `${base}, 0 0 ${px}px ${glowColor}`;
  }

  function overlayBackground(beh) {
    const b = beh || {};
    const col = String(b.overlayColor || "#020617");
    let op = Number(b.overlayOpacity);
    if (!Number.isFinite(op)) op = 70;
    op = Math.max(0, Math.min(100, op));
    return hexToRgba(col, op / 100);
  }

  function popupSizeConfig(beh) {
    const size = String((beh && (beh.popupSize || beh.size)) || "md").toLowerCase();
    if (size === "sm") return { maxWidth: "520px", maxHeight: "92vh" };
    if (size === "lg") return { maxWidth: "760px", maxHeight: "92vh" };
    return { maxWidth: "640px", maxHeight: "92vh" };
  }

  function drawerSizeConfig(beh) {
    const size = String((beh && (beh.drawerSize || beh.size)) || "md").toLowerCase();
    if (size === "sm") return { sideWidth: "360px" };
    if (size === "lg") return { sideWidth: "520px" };
    return { sideWidth: "420px" };
  }

  function resolveButtonBackground(design) {
    const d = design || {};
    const mode = String(d.btnBgMode || "").toLowerCase();
    const c1 = String(d.btnBg || "").trim();
    const c2 = String(d.btnBg2 || "").trim();
    if (mode === "gradient" && c1 && c2) return `linear-gradient(90deg, ${c1}, ${c2})`;
    return c1 || "#111827";
  }

  function resolveButtonBorder(design, resolvedBg) {
    const d = design || {};
    const mode = String(d.btnBgMode || "").toLowerCase();
    if (d.btnBorder) return String(d.btnBorder);
    if (mode === "gradient" && d.btnBg) return String(d.btnBg);
    return resolvedBg || "#111827";
  }

  function safeJsonParse(raw, fallback = {}) {
    if (!raw) return fallback;

    function tryParse(v) {
      try {
        return JSON.parse(v);
      } catch {
        return undefined;
      }
    }

    let out = tryParse(raw);
    if (out === undefined) {
      out = tryParse(String(raw).replace(/=>/g, ":"));
    }

    // handle double-encoded JSON
    if (typeof out === "string") {
      const trimmed = out.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        const out2 = tryParse(trimmed);
        if (out2 !== undefined) out = out2;
      }
    }

    return out === undefined ? fallback : out;
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

  function fmtMoneyFactory(locale, currency, currencySymbol) {
  const safeLocale = (locale && String(locale)) || "en";
  const safeCurrency = (currency && String(currency).trim().toUpperCase()) || "";
  const isIsoCurrency = /^[A-Z]{3}$/.test(safeCurrency);

  let nf = null;
  if (isIsoCurrency && typeof Intl !== "undefined" && Intl.NumberFormat) {
    try {
      nf = new Intl.NumberFormat(safeLocale, { style: "currency", currency: safeCurrency });
    } catch (e) {
      nf = null;
    }
  }

  const sym = (currencySymbol && String(currencySymbol).trim()) || (isIsoCurrency ? safeCurrency : "");

  return (cents) => {
    const n = Number(cents || 0) / 100;
    if (nf) {
      try {
        return nf.format(n);
      } catch (e) {
        // fall through
      }
    }
    const s = Number.isFinite(n) ? n.toFixed(2) : "0.00";
    return sym ? `${s} ${sym}` : s;
  };
}


  /* ------------------------------------------------------------------ */
  /* ✅ Real / Simple SVG Icons (always visible)                         */
  /* ------------------------------------------------------------------ */
  const ICON_SVGS = {
    CityIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V8l8-4 8 4v12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 20v-6h6v6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 10h.01M12 10h.01M16 10h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    RegionIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18 18l2 2 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    HashtagIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3L7 21M17 3l-2 18M4 8h18M3 16h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    AppsIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 9.5h4v4H5v-4Zm6 0h4v4h-4v-4ZM5 15.5h4v1H5v-1Zm6 0h4v1h-4v-1Z"
        fill="currentColor" opacity=".95"/>
    </svg>`,
    CirclePlusIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6"/>
      <path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    CheckCircleIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.6"/>
      <path d="m6.5 10.2 2.2 2.2 4.8-5.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    DiscountIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.2 10.2 4h5.8v5.8L9.8 16 4 10.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M13.6 6.6h.01" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M6.2 14.2l8-8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,
    GiftCardIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 8h13V17a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M3.5 8V6.5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M10 5.5V18" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7.2 5.2c0-1.2 1-2.2 2.2-2.2.6 0 1.2.2 1.6.6.4-.4 1-.6 1.6-.6 1.2 0 2.2 1 2.2 2.2 0 1-1 1.8-2.2 1.8H9.4c-1.2 0-2.2-.8-2.2-1.8Z"
        stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`,
    UserIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 10.2c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z" stroke="currentColor" stroke-width="1.7"/>
      <path d="M3.5 18c.9-3 3.4-5 6.5-5s5.6 2 6.5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`,
    PhoneIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6.2 3.6 4.9 5c-.7.7-.9 1.7-.5 2.6 1.4 3.2 4 5.8 7.2 7.2.9.4 2 .2 2.6-.5l1.4-1.3c.5-.5.6-1.3.1-1.9l-1.4-1.7c-.5-.6-1.3-.7-1.9-.3l-1 .6c-.6.3-1.3.2-1.8-.2l-2.5-2.5c-.5-.5-.6-1.2-.2-1.8l.6-1c.4-.6.3-1.4-.3-1.9L8.1 3.5c-.6-.5-1.4-.4-1.9.1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,
    PhoneOffIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M6.2 3.6 4.9 5c-.7.7-.9 1.7-.5 2.6 1.4 3.2 4 5.8 7.2 7.2.9.4 2 .2 2.6-.5l1.4-1.3c.5-.5.6-1.3.1-1.9l-1.4-1.7c-.5-.6-1.3-.7-1.9-.3l-1 .6c-.6.3-1.3.2-1.8-.2l-2.5-2.5c-.5-.5-.6-1.2-.2-1.8l.6-1c.4-.6.3-1.4-.3-1.9L8.1 3.5c-.6-.5-1.4-.4-1.9.1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,
    HomeIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 9.2 10 3.8l6.5 5.4V17a1 1 0 0 1-1 1h-3.5v-5H8v5H4.5a1 1 0 0 1-1-1V9.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`,
    MapPinIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 18s5-4.7 5-9a5 5 0 1 0-10 0c0 4.3 5 9 5 9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="10" cy="9" r="1.7" stroke="currentColor" stroke-width="1.6"/>
    </svg>`,
    NoteIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 3.5h8.5a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M7.2 7h5.6M7.2 10h5.6M7.2 13h4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    GlobeIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M2.7 10h14.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M10 2.5c2.2 2.3 2.2 12.7 0 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M10 2.5c-2.2 2.3-2.2 12.7 0 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`,
    EmailIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 5.5h13a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 15V7A1.5 1.5 0 0 1 3.5 5.5Z"
        stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M3 7l7 5 7-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    CartIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4h2l1.3 8.2a1.5 1.5 0 0 0 1.5 1.3h7.1a1.5 1.5 0 0 0 1.5-1.2l1-5.3H6.2"
        stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8" cy="16.2" r="1.1" fill="currentColor"/>
      <circle cx="14.5" cy="16.2" r="1.1" fill="currentColor"/>
    </svg>`,
  };

  const ICON_ALIASES = {
    PanierIcon: "CartIcon",
    Panier: "CartIcon",
    Cart: "CartIcon",
    BasketIcon: "CartIcon",
    Basket: "CartIcon",
    ShoppingBagIcon: "CartIcon",
    ShoppingBag: "CartIcon",
    Email: "EmailIcon",
    Mail: "EmailIcon",
    Envelope: "EmailIcon",
    LettreIcon: "EmailIcon",
    TelephoneIcon: "PhoneIcon",
    TelIcon: "PhoneIcon",
    WhatsAppIcon: "PhoneIcon",
    PersonIcon: "UserIcon",
    ProfileIcon: "UserIcon",
    CustomerIcon: "UserIcon",
    CustomersIcon: "UserIcon",
    Person: "UserIcon",
    PersonMajor: "UserIcon",
    PersonMinor: "UserIcon",
    MobileIcon: "PhoneIcon",
    PhoneIcon: "PhoneIcon",
    PhoneMajor: "PhoneIcon",
    PhoneMinor: "PhoneIcon",
    PhoneOffIcon: "PhoneOffIcon",
    PhoneOffMajor: "PhoneOffIcon",
    PhoneOffMinor: "PhoneOffIcon",
    LocationIcon: "MapPinIcon",
    LocationMajor: "MapPinIcon",
    LocationMinor: "MapPinIcon",
    PinIcon: "MapPinIcon",
    MapPinIcon: "MapPinIcon",
    ClipboardIcon: "NoteIcon",
    ClipboardMajor: "NoteIcon",
    ClipboardMinor: "NoteIcon",
    NoteIcon: "NoteIcon",
    NoteMajor: "NoteIcon",
    NoteMinor: "NoteIcon",
    OrdersIcon: "NoteIcon",
    WorldIcon: "GlobeIcon",
    GlobeIcon: "GlobeIcon",
    CartIcon: "CartIcon",
    CartMajor: "CartIcon",
    CartMinor: "CartIcon",
    BagIcon: "CartIcon",
    BagMajor: "CartIcon",
    BagMinor: "CartIcon",
    ShoppingCartIcon: "CartIcon",
    EmailIcon: "EmailIcon",
    EmailMajor: "EmailIcon",
    EmailMinor: "EmailIcon",
    MailIcon: "EmailIcon",
    MailMajor: "EmailIcon",
    MailMinor: "EmailIcon",
    EnvelopeIcon: "EmailIcon",
    EnvelopeMajor: "EmailIcon",
    EnvelopeMinor: "EmailIcon",
    iconpanier: "CartIcon",
    Iconpanier: "CartIcon",
    panier: "CartIcon",
    email: "EmailIcon",
    mail: "EmailIcon",
    gmail: "EmailIcon",
    telephone: "PhoneIcon",
    tel: "PhoneIcon",
    phone: "PhoneIcon",
  };

  function normalizeIconName(name) {
    const raw0 = String(name || "").trim();
    if (!raw0) return "AppsIcon";

    let raw = raw0
      .replace(/^icon[\s_-]*/i, "")
      .replace(/[\s_-]+/g, "")
      .trim();

    const lower = raw.toLowerCase();

    const quick = {
      panier: "CartIcon",
      cart: "CartIcon",
      basket: "CartIcon",
      bag: "CartIcon",
      shoppingcart: "CartIcon",
      mail: "EmailIcon",
      email: "EmailIcon",
      envelope: "EmailIcon",
      telephone: "PhoneIcon",
      tel: "PhoneIcon",
      phone: "PhoneIcon",
      whatsapp: "PhoneIcon",
      location: "MapPinIcon",
      map: "MapPinIcon",
      pin: "MapPinIcon",
      note: "NoteIcon",
      clipboard: "NoteIcon",
      world: "GlobeIcon",
      globe: "GlobeIcon",
      user: "UserIcon",
      person: "UserIcon",
      profile: "UserIcon",
      discount: "DiscountIcon",
      gift: "GiftCardIcon",
      plus: "CirclePlusIcon",
      check: "CheckCircleIcon",
      apps: "AppsIcon",
    };
    if (quick[lower]) return quick[lower];

    let n = raw0.trim();
    n = n.replace(/Major$/i, "").replace(/Minor$/i, "");
    if (!/Icon$/i.test(n)) n = n + "Icon";
    n = n.replace(/[\s_-]+/g, "");
    n = n[0].toUpperCase() + n.slice(1);

    const aliased =
      ICON_ALIASES[n] ||
      ICON_ALIASES[raw0] ||
      ICON_ALIASES[n.replace(/Icon$/i, "")] ||
      ICON_ALIASES[raw0.replace(/Icon$/i, "")] ||
      "";

    return aliased || n;
  }

  function getIconHtml(iconName, size = 18, color = "currentColor") {
    const key = normalizeIconName(iconName);
    const svg = ICON_SVGS[key] || ICON_SVGS[iconName] || ICON_SVGS.AppsIcon;
    const px = typeof size === "number" ? `${size}px` : css(size);
    return `
      <span class="tf-ic" style="width:${px};height:${px};color:${css(color)}">
        ${svg}
      </span>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* CSS Injection                                                      */
  /* ------------------------------------------------------------------ */

function parseGeoAttr(holder) {
  const raw = holder.getAttribute("data-geo");
  return safeJsonParse(raw, {});
}

  function injectGlobalCSSOnce() {
    if (document.getElementById("tf-global-css")) return;

    const style = document.createElement("style");
    style.id = "tf-global-css";
    style.textContent = `
      .tripleform-cod{width:100%;margin:0;padding:0;}
      .tripleform-cod *{box-sizing:border-box;}
      .tf-ic{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;line-height:0}
      .tf-ic svg{width:100%;height:100%;display:block}
      .tf-shell{width:100%;max-width:none;margin:0;padding:0;border:0;background:transparent;box-shadow:none}

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

      .tf-offers-container{display:grid;gap:10px;margin-bottom:14px}
      .tf-offer-card{
        border-radius:14px;
        border:1px solid var(--tf-offer-border,#E5E7EB);
        padding:12px 12px;
        box-shadow:0 10px 22px rgba(15,23,42,0.06);
        background:var(--tf-offer-bg,#fff);
        overflow:hidden;
      }
      .tf-offer-row{display:flex;gap:12px;align-items:center}
      .tf-circle-icon{width:30px;height:30px;border-radius:999px;display:inline-grid;place-items:center;flex:none;margin-right:8px;line-height:0;border:1px solid rgba(0,0,0,.10);background:rgba(15,23,42,0.05)}
      .tf-offer-icon{
        width:34px;height:34px;border-radius:999px;
        display:grid;place-items:center;flex:none;overflow:hidden;
        border:1px solid rgba(0,0,0,.10);
        background:var(--tf-offer-iconbg,#EEF2FF);
        position:relative;
      }
      .tf-offer-icon img{width:100%;height:100%;object-fit:cover;display:block;position:relative;z-index:2}
      .tf-offer-icon .tf-offer-icon-fallback{
        position:absolute; inset:0; display:grid; place-items:center; z-index:1;
        color:var(--tf-icon-color,#111827);
      }
      .tf-offer-main{min-width:0;flex:1;display:flex;flex-direction:column;gap:4px}
      .tf-offer-title{font-weight:900;font-size:13px;color:var(--tf-title,#0F172A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;}
      .tf-offer-desc{font-size:12px;color:var(--tf-muted,#64748B);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;}
      .tf-offer-sub{font-size:11px;color:var(--tf-muted2,#94A3B8);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .tf-offer-img{
        width:86px;height:86px;border-radius:16px;overflow:hidden;flex:none;
        border:1px solid rgba(0,0,0,.08);background:#F3F4F6;
      }
      .tf-offer-img img{width:100%;height:100%;object-fit:cover;display:block}
      .tf-offer-btn{
        margin-top:8px;border-radius:12px;padding:9px 10px;
        font-size:12px;font-weight:900;cursor:pointer;border:1px solid transparent;
        display:inline-flex;align-items:center;justify-content:center;gap:8px;
        transition:all .15s ease;width:fit-content;max-width:100%;white-space:nowrap;
      }
      .tf-offer-btn:hover{transform:translateY(-1px);opacity:.96}
      .tf-offer-btn.active{filter:saturate(1.1)}
      .tf-offer-btn.disabled{opacity:.55;cursor:not-allowed;transform:none}

      .tf-pack-row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
      .tf-pack-pill{
        border-radius:999px;
        padding:6px 10px;
        font-size:11px;
        font-weight:900;
        cursor:pointer;
        border:1px solid rgba(2,6,23,.15);
        background:rgba(255,255,255,.7);
        color:var(--tf-title,#0F172A);
      }
      .tf-pack-pill.active{
        background:var(--tf-btn-bg,#111827);
        border-color:var(--tf-btn-solid,var(--tf-btn-bg,#111827));
        color:var(--tf-btn-text,#fff);
      }

      [data-tf="discount-row"]{display:none}

      .offer-timer{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;margin-top:8px;padding:6px 10px;border-radius:10px}
      .timer-countdown{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-weight:900;letter-spacing:.6px;margin-left:auto}
      .timer-minimal{background:#F9FAFB;color:#374151;border:1px solid #E5E7EB}
      .timer-urgent{background:linear-gradient(90deg,#991B1B,#DC2626);color:#fff;border:1px solid #FCA5A5;animation:tfBlink 1s infinite}
      @keyframes tfBlink{0%,100%{opacity:1}50%{opacity:.7}}

      /* THANK YOU POPUP */
      .tf-ty-overlay{
        position:fixed; inset:0; display:none;
        align-items:center; justify-content:center;
        z-index:1000000; padding:18px; box-sizing:border-box;
      }
      .tf-ty-card{
        width:100%; max-width:520px; max-height:90vh;
        overflow:auto; box-sizing:border-box;
        border-radius:18px;
      }
      .tf-ty-img{
        width:100%; height:auto; display:block;
        border-radius:14px;
        border:1px solid rgba(0,0,0,.08);
        background:#F3F4F6;
      }
      .tf-ty-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
      .tf-ty-btn{
        border-radius:12px;
        padding:10px 14px;
        font-weight:900;
        border:1px solid transparent;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /* ✅ NO COUNTRY_DATA HERE (left empty on purpose)                     */
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
            "Lahraouyine", "Had Soualem", "Sidi Rahal", "Oulad Abbou", "El Borouj",
            "Sidi Smail", "Oulad M'rah", "Sidi Hajjaj"
          ]
        },
        {
          id: "RABAT",
          name: "Rabat-Salé-Kénitra",
          cities: [
            "Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Khémisset",
            "Sidi Slimane", "Sidi Kacem", "Tiflet", "Ain Aouda", "Harhoura",
            "Sidi Yahya Zaer", "Oulmès", "Sidi Allal El Bahraoui", "Souk El Arbaa",
            "Mechra Bel Ksiri", "Sidi Taibi", "Moulay Bousselham"
          ]
        },
        {
          id: "TANGER",
          name: "Tanger-Tétouan-Al Hoceïma",
          cities: [
            "Tanger", "Tétouan", "Al Hoceïma", "Larache", "Chefchaouen",
            "Ouazzane", "Fnideq", "M'diq", "Martil", "Ksar El Kebir", "Asilah",
            "Bni Bouayach", "Imzouren", "Bni Hadifa", "Bni Darkoul", "Al Aaroui",
            "Brikcha", "Zoumi"
          ]
        },
        {
          id: "MARRAKECH",
          name: "Marrakech-Safi",
          cities: [
            "Marrakech", "Safi", "El Kelâa des Sraghna", "Essaouira", "Rehamna",
            "Youssoufia", "Chichaoua", "Al Haouz", "Rhamna", "Benguerir",
            "Sidi Bennour", "Smimou", "Tamanar", "Imintanoute", "Sidi Bou Othmane",
            "Tahannaout", "Oulad Hassoune", "Sebt Gzoula"
          ]
        },
        {
          id: "FES",
          name: "Fès-Meknès",
          cities: [
            "Fès", "Meknès", "Ifrane", "Taza", "Sefrou", "Boulemane", "Taounate",
            "Guercif", "Moulay Yacoub", "El Hajeb", "Moulay Idriss Zerhoun",
            "Ouazzane", "Bhalil", "Aïn Cheggag", "Missour", "Aïn Taoujdate",
            "Boudinar", "Matmata"
          ]
        },
        {
          id: "ORIENTAL",
          name: "Région de l'Oriental",
          cities: [
            "Oujda", "Nador", "Berkane", "Taourirt", "Jerada", "Figuig",
            "Bouarfa", "Ahfir", "Driouch", "Beni Ensar", "Selouane",
            "Bouhdila", "Talsint", "Debdou", "Zaio", "Tendrara", "Bni Chiker",
            "Tafersit"
          ]
        },
        {
          id: "SUSS",
          name: "Souss-Massa",
          cities: [
            "Agadir", "Inezgane", "Taroudant", "Tiznit", "Oulad Teima",
            "Biougra", "Ait Melloul", "Dcheira", "Temsia", "Ait Baha",
            "Chtouka Ait Baha", "Tafraout", "Aoulouz", "El Guerdane", "Ait Iaaza",
            "Lqliaa", "Sidi Bibi", "Sidi Moussa"
          ]
        },
        {
          id: "DRAATAF",
          name: "Drâa-Tafilalet",
          cities: [
            "Errachidia", "Ouarzazate", "Tinghir", "Midelt", "Zagora",
            "Rissani", "Alnif", "Boumalne Dades", "Kelaat M'Gouna", "Tinejdad",
            "Goulmima", "Jorf", "M'semrir", "Aït Benhaddou", "Tazzarine",
            "N'Kob", "Aoufous", "M'hayd"
          ]
        },
        {
          id: "LAAYOUNE",
          name: "Laâyoune-Sakia El Hamra",
          cities: [
            "Laâyoune", "Boujdour", "Tarfaya", "El Marsa", "Dakhla", "Smara",
            "Guelta Zemmur", "Bir Anzarane", "Aousserd", "Labouirat", "Mahbès",
            "Jdiriya", "Foum El Oued", "Boucraa"
          ]
        },
        {
          id: "GUELMIM",
          name: "Guelmim-Oued Noun",
          cities: [
            "Guelmim", "Sidi Ifni", "Tan-Tan", "Assa", "Foum Zguid", "Bouizakarne",
            "Taghjijt", "Tata", "Akka", "Tizounine", "Lamsabih", "Sidi Ahmed",
            "Tighirt", "Aït Herbil"
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
            "Dellys", "Zeralda", "Staoueli", "Birtouta", "Ouled Fayet", "Draria",
            "Les Eucalyptus", "Baraki", "Rouïba", "Reghaïa", "Aïn Taya", "Bordj El Bahri"
          ]
        },
        {
          id: "ORAN",
          name: "Oran",
          cities: [
            "Oran", "Es-Sénia", "Bir El Djir", "Gdyel", "Aïn El Turck", "Arzew",
            "Mers El Kébir", "Boutlelis", "Oued Tlelat", "Bethioua", "El Ançor",
            "Hassi Bounif", "Messerghin", "Boufatis", "Tafraoui", "Aïn El Kerma",
            "El Braya", "Hassi Ben Okba", "Sidi Chami", "Bousfer"
          ]
        },
        {
          id: "CONSTANTINE",
          name: "Constantine",
          cities: [
            "Constantine", "El Khroub", "Hamma Bouziane", "Aïn Smara",
            "Zighoud Youcef", "Didouche Mourad", "Ibn Ziad", "Messaoud Boudjeriou",
            "Beni Hamidane", "Aïn Abid", "Ouled Rahmoun", "Ben Badis", "El Haria",
            "Aïn Fakroun", "Oum El Bouaghi", "Sigus", "Meskiana", "Aïn Beida"
          ]
        },
        {
          id: "BLIDA",
          name: "Blida",
          cities: [
            "Blida", "Boufarik", "El Affroun", "Mouzaïa", "Ouled Yaïch",
            "Beni Mered", "Bouinan", "Soumaa", "Chebli", "Bougara",
            "Guerrouaou", "Hammam Melouane", "Beni Tamou", "Ben Khlil",
            "Oued El Alleug", "Chiffa", "Meftah", "Larbaa"
          ]
        },
        {
          id: "SETIF",
          name: "Sétif",
          cities: [
            "Sétif", "El Eulma", "Aïn Oulmene", "Bougaa", "Aïn Azel", "Amoucha",
            "Béni Aziz", "Guellal", "Hammam Soukhna", "Bouandas", "Taya", "Tella",
            "Babor", "Maoklane", "Hammam Guergour", "Aïn Arnat", "Aïn Lahdjar", "Aïn Roua"
          ]
        },
        {
          id: "ANNABA",
          name: "Annaba",
          cities: [
            "Annaba", "El Bouni", "Sidi Amar", "Berrahal", "Treat", "Cheurfa",
            "Oued El Aneb", "Seraidi", "Ain Berda", "Chaiba", "El Hadjar", "Chetaibi",
            "Aïn Charchar", "Bouchetata", "Sidi Salem", "El Tarf", "Bouhadjar", "Besbes"
          ]
        },
        {
          id: "BATNA",
          name: "Batna",
          cities: [
            "Batna", "Barika", "Merouana", "Arris", "N'Gaous", "Tazoult",
            "Aïn Touta", "Ouled Si Slimane", "Fesdis", "Timgad", "Ras El Aioun",
            "Maafa", "Lazrou", "Ouled Ammar", "Seriana", "Menaa", "Bouzina", "Ichmoul"
          ]
        },
        {
          id: "TLEMCEN",
          name: "Tlemcen",
          cities: [
            "Tlemcen", "Maghnia", "Hennaya", "Remchi", "Sabra", "Ghazaouet",
            "Souahlia", "Msirda", "Aïn Tallout", "Bensekrane", "Chetouane",
            "Hammam Boughrara", "Ouled Mimoun", "Sidi Abdelli"
          ]
        },
        {
          id: "BEJAIA",
          name: "Béjaïa",
          cities: [
            "Béjaïa", "Akbou", "Sidi Aïch", "El Kseur", "Tichy", "Amizour",
            "Barbacha", "Darguina", "Aokas", "Timezrit", "Seddouk", "Tazmalt",
            "Kherrata", "Boudjellil"
          ]
        },
        {
          id: "MOSTAGANEM",
          name: "Mostaganem",
          cities: [
            "Mostaganem", "Mascara", "Relizane", "Aïn Tedeles", "Sidi Ali",
            "Hassi Mameche", "Aïn Nouïssy", "Sour", "Stidia", "Kheireddine",
            "Fornaka", "Sidi Lakhdar", "Aïn Boudinar", "Oued El Kheir"
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
            "Djedeida", "El Omrane", "Ettahrir", "El Kabaria", "El Manar",
            "El Ouardia", "Jebel Jelloud", "Sidi Hassine"
          ]
        },
        {
          id: "ARIANA",
          name: "Ariana",
          cities: [
            "Ariana", "Raoued", "La Soukra", "Kalaat El Andalous", "Sidi Thabet",
            "Ettadhamen", "Mnihla", "Borj El Amri", "Kalâat el-Andalous",
            "Sidi Amor", "El Battan", "Oued Ellil", "Bir El Bey", "Sidi Daoud",
            "Tebourba", "Grombalia"
          ]
        },
        {
          id: "BEN_AROUS",
          name: "Ben Arous",
          cities: [
            "Ben Arous", "Ezzahra", "Rades", "Mégrine", "Hammam Lif", "Mornag",
            "Fouchana", "Khalidia", "Mhamdia", "Hammam Chott", "Bou Mhel el-Bassatine",
            "El Mida", "Mornaguia", "Hammam Jedidi", "Sidi Rezig", "El Mourouj"
          ]
        },
        {
          id: "SFAX",
          name: "Sfax",
          cities: [
            "Sfax", "El Ain", "Agareb", "Mahres", "Sakiet Eddaïer", "Sakiet Ezzit",
            "Ghraiba", "Bir Ali Ben Khalifa", "Jebeniana", "Kerkennah", "Skhira",
            "Menzel Chaker", "Gremda", "Thyna", "Sakiet Sidi Youssef", "Menzel Chaker",
            "Sidi Mansour", "El Hencha"
          ]
        },
        {
          id: "SOUSSE",
          name: "Sousse",
          cities: [
            "Sousse", "Hammam Sousse", "Kalaa Kebira", "Kalaa Sghira", "Akouda",
            "M'saken", "Enfidha", "Bouficha", "Hergla", "Kondar", "Zaouiet Sousse",
            "Hammam Jedidi", "Sidi Bou Ali", "Messaadine", "Chott Meriem",
            "Kalâa Seghira", "Sidi El Hani", "Sousse Jawhara"
          ]
        },
        {
          id: "BIZERTE",
          name: "Bizerte",
          cities: [
            "Bizerte", "Menzel Jemil", "Mateur", "Sejnane", "Ghar El Melh",
            "Ras Jebel", "Menzel Abderrahmane", "El Alia", "Tinja", "Utique",
            "Menzel Bourguiba", "Joumine", "Aousja", "Metline", "Raf Raf",
            "El Alya", "Ghar El Melh", "Menzel Salem"
          ]
        },
        {
          id: "GABES",
          name: "Gabès",
          cities: [
            "Gabès", "Mareth", "Matmata", "Menzel Habib", "Ghannouch", "El Hamma",
            "Métouia", "Oudhref", "Chenini Nahal", "Bou Chemma", "Zarat",
            "Nouvelle Matmata", "Tataouine", "Remada"
          ]
        },
        {
          id: "MONASTIR",
          name: "Monastir",
          cities: [
            "Monastir", "Moknine", "Jemmal", "Ksar Hellal", "Sahline", "Teboulba",
            "Bekalta", "Bembla", "Menzel Kamel", "Zéramdine", "Sayada",
            "Ksibet El Médiouni", "Beni Hassen", "Menzel Ennour"
          ]
        },
        {
          id: "KAIROUAN",
          name: "Kairouan",
          cities: [
            "Kairouan", "Haffouz", "Sbikha", "Chebika", "Oueslatia", "Aïn Djeloula",
            "Hajeb El Ayoun", "Nasrallah", "Bou Hajla", "El Alâa", "Cebbala",
            "Menzel Mhiri", "Sidi Amor Bou Hajla", "Echrarda"
          ]
        },
        {
          id: "JENDOUBA",
          name: "Jendouba",
          cities: [
            "Jendouba", "Bousalem", "Tabarka", "Aïn Draham", "Fernana", "Ghardimaou",
            "Oued Meliz", "Bou Salem", "Balta Bou Aouane", "Jendouba Sud",
            "Jendouba Nord", "Oued Zarga", "Ras Rajel", "Sidi Marzouk"
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
            "Madinet Nasr", "Helwan", "Qalyub", "Shubra El Kheima", "Badr City",
            "Obour City", "Katameya", "Rehab City", "Sheikh Zayed", "October Gardens"
          ]
        },
        {
          id: "ALEX",
          name: "Alexandrie",
          cities: [
            "Alexandrie", "Borg El Arab", "Abu Qir", "Al Amriya", "Al Agamy",
            "Montaza", "Al Mansheya", "Al Labban", "Kafr Abdo", "Sidi Gaber",
            "Smouha", "Miami", "Stanley", "Laurent", "Gleem", "Camp Caesar",
            "Mandra", "El Max", "El Qabary", "El Saraya", "El Soyof", "Fleming"
          ]
        },
        {
          id: "GIZA",
          name: "Gizeh",
          cities: [
            "Gizeh", "Sheikh Zayed City", "6th of October", "Al Haram",
            "Al Badrasheen", "Al Ayat", "Al Wahat Al Bahariya", "Al Saff",
            "Atfih", "Al Ayyat", "Awashim", "Kerdasa", "El Hawamdeya", "Osim",
            "El Warraq", "Imbaba", "Boulak", "Kit Kat", "Moneeb", "Faisal"
          ]
        },
        {
          id: "SHARQIA",
          name: "Sharqia",
          cities: [
            "Zagazig", "10th of Ramadan City", "Belbeis", "Minya Al Qamh",
            "Al Ibrahimiyah", "Diarb Negm", "Husseiniya", "Mashtool El Souk",
            "Abu Hammad", "Abu Kebir", "Faqous", "El Salheya El Gedida",
            "Hehya", "Kafr Saqr", "Al Qurein", "Al Qanayat", "Awlad Saqr", "Bilbeis"
          ]
        },
        {
          id: "ASWAN",
          name: "Aswan",
          cities: [
            "Aswan", "Kom Ombo", "Edfu", "Daraw", "Nasr Al Nuba", "Kalabsha",
            "Abu Simbel", "Al Shallal", "Al Sad Al Ali", "Al Basiliya",
            "Al Ridisiya", "Al Mahasna", "Al Khattan", "Al Khazan"
          ]
        },
        {
          id: "LUXOR",
          name: "Luxor",
          cities: [
            "Luxor", "Armant", "Esna", "Tiba", "Al Qarna", "Al Bayadiya",
            "Al Zayniya", "Al Madamud", "Al Tod", "Al Karnak", "Al Ramady",
            "Al Shallal", "Al Dababiya", "Al Qusair"
          ]
        },
        {
          id: "ASYUT",
          name: "Asyut",
          cities: [
            "Asyut", "Abnoub", "Abu Tig", "El Badari", "El Ghanayem", "Sahel Selim",
            "El Qusiya", "Manfalut", "Dayrout", "Dairut", "Al Fath", "Al Rashda",
            "Al Sanabawayn", "Al Shuhada"
          ]
        },
        {
          id: "MINYA",
          name: "Minya",
          cities: [
            "Minya", "Beni Mazar", "Maghagha", "Mallawi", "Matay", "Samalut",
            "Abu Qurqas", "Dir Mawas", "Al Idwa", "Al Madinah Al Fikriyah",
            "Al Munira", "Al Shurafa", "Bani Mazar Al Jadidah", "Taha Al Amdid"
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
            "Issy-les-Moulineaux", "Levallois-Perret", "Clichy", "Neuilly-sur-Seine",
            "Suresnes", "Vincennes", "Fontenay-sous-Bois", "Champigny-sur-Marne"
          ]
        },
        {
          id: "PACA",
          name: "Provence-Alpes-Côte d'Azur",
          cities: [
            "Marseille", "Nice", "Toulon", "Avignon", "Aix-en-Provence", "Antibes",
            "Cannes", "La Seyne-sur-Mer", "Hyères", "Arles", "Martigues", "Grasse",
            "Fréjus", "Antibes", "La Ciotat", "Cavaillon", "Draguignan", "Carros",
            "Vence", "Mandelieu-la-Napoule", "Roquebrune-Cap-Martin", "Saint-Laurent-du-Var"
          ]
        },
        {
          id: "ARA",
          name: "Auvergne-Rhône-Alpes",
          cities: [
            "Lyon", "Grenoble", "Saint-Étienne", "Annecy", "Clermont-Ferrand",
            "Villeurbanne", "Valence", "Chambéry", "Roanne", "Bourg-en-Bresse",
            "Vénissieux", "Saint-Priest", "Caluire-et-Cuire", "Vaulx-en-Velin", "Meyzieu",
            "Bron", "Saint-Chamond", "Montélimar", "Annemasse", "Oullins",
            "Tassin-la-Demi-Lune", "Rillieux-la-Pape"
          ]
        },
        {
          id: "OCCITANIE",
          name: "Occitanie",
          cities: [
            "Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban",
            "Narbonne", "Carcassonne", "Albi", "Sète", "Lunel", "Agde", "Castres",
            "Mende", "Millau", "Foix", "Auch", "Tarbes", "Lourdes", "Rodez",
            "Pamiers", "Limoux"
          ]
        },
        {
          id: "NOUVELLE_AQUITAINE",
          name: "Nouvelle-Aquitaine",
          cities: [
            "Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle", "Bayonne",
            "Angoulême", "Bergerac", "Périgueux", "Agen", "Brive-la-Gaillarde",
            "Mont-de-Marsan", "Dax", "Villeneuve-sur-Lot"
          ]
        },
        {
          id: "HAUTS_DE_FRANCE",
          name: "Hauts-de-France",
          cities: [
            "Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque", "Calais",
            "Boulogne-sur-Mer", "Arras", "Valenciennes", "Bethune", "Lens",
            "Douai", "Maubeuge", "Compiègne"
          ]
        },
        {
          id: "NORMANDIE",
          name: "Normandie",
          cities: [
            "Rouen", "Le Havre", "Caen", "Cherbourg", "Évreux", "Dieppe",
            "Saint-Étienne-du-Rouvray", "Sotteville-lès-Rouen", "Vernon", "Lisieux",
            "Fécamp", "Alençon", "Argentan", "Flers"
          ]
        },
        {
          id: "BRETAGNE",
          name: "Bretagne",
          cities: [
            "Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo",
            "Saint-Brieuc", "Lanester", "Fougères", "Concarneau", "Morlaix",
            "Vitré", "Douarnenez", "Plœmeur"
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
            "Rivas-Vaciamadrid", "Collado Villalba", "Aranjuez", "Majadahonda",
            "Boadilla del Monte", "San Fernando de Henares", "Tres Cantos", "Colmenar Viejo"
          ]
        },
        {
          id: "CATALUNYA",
          name: "Cataluña",
          cities: [
            "Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Tarragona",
            "Sabadell", "Lleida", "Mataró", "Santa Coloma de Gramenet", "Reus",
            "Girona", "Sant Cugat", "Cornellà", "Sant Boi de Llobregat", "Rubí", "Manresa",
            "Vilanova i la Geltrú", "Castelldefels", "Viladecans", "El Prat de Llobregat",
            "Granollers", "Sitges", "Igualada"
          ]
        },
        {
          id: "ANDALUCIA",
          name: "Andalucía",
          cities: [
            "Sevilla", "Málaga", "Granada", "Córdoba", "Jerez de la Frontera",
            "Almería", "Huelva", "Marbella", "Dos Hermanas", "Algeciras",
            "Cádiz", "Jaén", "Almería", "Mijas", "Fuengirola", "Chiclana de la Frontera",
            "Écija", "Roquetas de Mar", "Sanlúcar de Barrameda", "Linares",
            "Motril", "El Ejido"
          ]
        },
        {
          id: "VALENCIA",
          name: "Comunidad Valenciana",
          cities: [
            "Valencia", "Alicante", "Castellón de la Plana", "Elche", "Torrevieja",
            "Orihuela", "Gandia", "Benidorm", "Paterna", "Sagunto", "Alcoy",
            "Elda", "San Vicente del Raspeig", "Vila-real", "Burjassot", "Ontinyent",
            "Xàtiva", "Alzira", "Dénia", "La Vall d'Uixó", "Xirivella", "Cullera"
          ]
        },
        {
          id: "GALICIA",
          name: "Galicia",
          cities: [
            "A Coruña", "Vigo", "Santiago de Compostela", "Lugo", "Ourense",
            "Ferrol", "Pontevedra", "Oleiros", "Arteixo", "Ribeira", "Carballo",
            "Narón", "Sanxenxo", "Cangas"
          ]
        },
        {
          id: "PAIS_VASCO",
          name: "País Vasco",
          cities: [
            "Bilbao", "Donostia-San Sebastián", "Vitoria-Gasteiz", "Barakaldo",
            "Getxo", "Irun", "Portugalete", "Santurtzi", "Basauri", "Errenteria",
            "Leioa", "Galdakao", "Durango", "Eibar"
          ]
        },
        {
          id: "CANARIAS",
          name: "Canarias",
          cities: [
            "Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "San Cristóbal de La Laguna",
            "Telde", "Arona", "Santa Lucía de Tirajana", "Arrecife", "San Bartolomé de Tirajana",
            "La Orotava", "Puerto del Rosario", "Los Llanos de Aridane", "Santa Cruz de La Palma",
            "Tacoronte", "Guía de Isora"
          ]
        },
        {
          id: "BALEARES",
          name: "Islas Baleares",
          cities: [
            "Palma de Mallorca", "Ibiza", "Mahón", "Ciutadella de Menorca", "Llucmajor",
            "Inca", "Manacor", "Felanitx", "Pollensa", "Alcúdia", "Santanyí",
            "Santa Eulalia del Río", "San José", "San Antonio Abad"
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
            "Al Sulayyil", "Al Aflaj", "Hotat Bani Tamim", "Al Diriyah", "Thadiq", "Huraymila",
            "Al Hariq", "Al Ghat", "Zulfi", "Hawtat Bani Tamim", "Al Majma'ah",
            "Al Muwayh", "Al Sulayyil"
          ]
        },
        {
          id: "MAKKAH",
          name: "Makkah",
          cities: [
            "Makkah", "Jeddah", "Taif", "Al Qunfudhah", "Al Lith", "Al Jumum",
            "Khulais", "Rabigh", "Turubah", "Al Kamel", "Bahra", "Adham",
            "Al Jumum", "Al Khurma", "Al Muwayh", "Al Khurmah", "Al Jumum",
            "Al Khulais", "Al Qunfudhah", "Al Lith", "Taif", "Jeddah"
          ]
        },
        {
          id: "MADINAH",
          name: "Madinah",
          cities: [
            "Madinah", "Yanbu", "Al Ula", "Badr", "Mahd adh Dhahab", "Al Hinakiyah",
            "Wadi al-Fara'", "Al-Mahd", "Khaybar", "Al Henakiyah", "Al Suqiyah",
            "Al-Mahd", "Al-Ais", "Hegrah", "Al Henakiyah", "Badr", "Khaybar",
            "Yanbu", "Al Ula", "Mahd adh Dhahab", "Al Hinakiyah", "Wadi al-Fara'"
          ]
        },
        {
          id: "EASTERN",
          name: "Eastern Province",
          cities: [
            "Dammam", "Khobar", "Dhahran", "Jubail", "Qatif", "Hafr al-Batin",
            "Al Khafji", "Ras Tanura", "Abqaiq", "Al-'Udayd", "Nu'ayriyah",
            "Udhailiyah", "Al Qaryah", "Al Mubarraz", "Al Awamiyah", "Al Khobar",
            "Dhahran", "Jubail", "Qatif", "Hafr al-Batin", "Al Khafji", "Ras Tanura"
          ]
        },
        {
          id: "ASIR",
          name: "Asir",
          cities: [
            "Abha", "Khamis Mushait", "Bisha", "Najran", "Jizan", "Sabya",
            "Al Bahah", "Baljurashi", "Muhayil", "Tathlith", "Rijal Alma'",
            "Al Namas", "Dhahran Al Janub", "Al Makhwah"
          ]
        },
        {
          id: "QASSIM",
          name: "Al-Qassim",
          cities: [
            "Buraidah", "Unaizah", "Ar Rass", "Al Mithnab", "Al Bukayriyah",
            "Al Badayi", "Al Asyah", "Uyun Al Jawa", "Riyadh Al Khabra",
            "Al Shamas", "Dariyah", "Al Farah", "Al Mithnab", "Al Nabhaniyah"
          ]
        },
        {
          id: "HAIL",
          name: "Hail",
          cities: [
            "Hail", "Al Ghazalah", "Al Sulaimi", "Baqaa", "Al Samira", "Al Shinan",
            "Al Khutta", "Al Ama", "Al Muthalath", "Al Qalib", "Al Wasit",
            "Al Far'", "Al Kharma", "Al Qarn"
          ]
        },
        {
          id: "JOUF",
          name: "Al-Jawf",
          cities: [
            "Sakaka", "Qurayyat", "Dawmat Al Jandal", "Al Isawiyah", "Tabarjal",
            "Al Qurayyat", "Al Haditha", "Al Nabhaniyah", "Al Qaryah", "Al Khutta",
            "Al Wasit", "Al Far'", "Al Kharma", "Al Qarn"
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
            "Nad Al Sheba", "Al Quoz", "Jumeirah", "Business Bay", "Dubai Marina",
            "Downtown Dubai", "Al Satwa", "Al Nahda", "Al Twar", "International City",
            "Dubai Silicon Oasis"
          ]
        },
        {
          id: "ABU_DHABI",
          name: "Abu Dhabi",
          cities: [
            "Abu Dhabi", "Al Ain", "Madinat Zayed", "Gharbia", "Liwa Oasis",
            "Al Ruwais", "Al Mirfa", "Al Dhafra", "Al Samha", "Al Shawamekh",
            "Bani Yas", "Khalifa City", "Mohammed Bin Zayed City", "Shahama", "Al Wathba",
            "Yas Island", "Saadiyat Island", "Al Maryah Island", "Al Reem Island",
            "Al Rahba", "Al Falah", "Al Shamkha"
          ]
        },
        {
          id: "SHARJAH",
          name: "Sharjah",
          cities: [
            "Sharjah", "Khor Fakkan", "Kalba", "Dhaid", "Al Dhaid", "Al Hamriyah",
            "Al Madam", "Al Batayeh", "Al Sajaa", "Al Ghail", "Wasit", "Mleiha",
            "Al Nahda", "Al Qasimia", "Al Majaz", "Al Qasba", "Al Taawun",
            "Al Khan", "Al Mamzar", "Abu Shagara", "Al Rolla", "University City"
          ]
        },
        {
          id: "AJMAN",
          name: "Ajman",
          cities: [
            "Ajman", "Masfout", "Manama", "Al Hamidiyah", "Al Zorah", "Al Mowaihat",
            "Al Jurf", "Al Hamidiya", "Al Rawda", "Al Nuaimiya", "Al Rashidiya",
            "Al Jurf Industrial", "Al Mwaihat", "Al Hamidiya", "Al Zahra", "Al Rumailah"
          ]
        },
        {
          id: "RAS_AL_KHAIMAH",
          name: "Ras Al Khaimah",
          cities: [
            "Ras Al Khaimah", "Al Jazirah Al Hamra", "Al Rams", "Al Dhait",
            "Al Huwaylat", "Al Marjan Island", "Al Hamra", "Al Mamourah",
            "Al Mairid", "Al Nakheel", "Al Qusaidat", "Al Sall", "Al Shimal",
            "Al Turfa"
          ]
        },
        {
          id: "FUJAIRAH",
          name: "Fujairah",
          cities: [
            "Fujairah", "Dibba", "Dhadna", "Al Bithnah", "Al Faseel", "Al Hayl",
            "Al Hala", "Al Gurfa", "Al Qurayyah", "Al Siji", "Al Tuwiyan",
            "Mirbah", "Qidfa", "Sakamkam"
          ]
        },
        {
          id: "UMM_AL_QUWAIN",
          name: "Umm Al Quwain",
          cities: [
            "Umm Al Quwain", "Al Sinniyah", "Al Raas", "Al Haditha", "Al Khor",
            "Al Roudha", "Al Salamah", "Al Soor", "Al Humrah", "Al Dar Al Baidah",
            "Falaj Al Mualla", "Al Riqqah", "Al Shabiyat", "Al Zorah"
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
            "Santa Ana", "Riverside", "Stockton", "Chula Vista", "Irvine", "Modesto",
            "Santa Clarita", "Oxnard", "Fontana", "Moreno Valley", "Glendale",
            "Huntington Beach"
          ]
        },
        {
          id: "NEW_YORK",
          name: "New York",
          cities: [
            "New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse",
            "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica",
            "White Plains", "Troy", "Niagara Falls", "Binghamton", "Rome",
            "Ithaca", "Jamestown", "Poughkeepsie", "Plattsburgh", "Watertown",
            "Auburn", "Elmira"
          ]
        },
        {
          id: "TEXAS",
          name: "Texas",
          cities: [
            "Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso",
            "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland",
            "Irving", "Amarillo", "Grand Prairie", "Brownsville", "McKinney",
            "Frisco", "Pasadena", "Mesquite", "Killeen", "McAllen"
          ]
        },
        {
          id: "FLORIDA",
          name: "Florida",
          cities: [
            "Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "St. Petersburg",
            "Hialeah", "Port St. Lucie", "Cape Coral", "Fort Lauderdale",
            "Pembroke Pines", "Hollywood", "Miramar", "Gainesville", "Coral Springs",
            "Clearwater", "Palm Bay", "Pompano Beach", "West Palm Beach", "Lakeland",
            "Davie", "Miami Beach"
          ]
        },
        {
          id: "ILLINOIS",
          name: "Illinois",
          cities: [
            "Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield",
            "Elgin", "Peoria", "Champaign", "Waukegan", "Cicero", "Bloomington",
            "Decatur", "Arlington Heights"
          ]
        },
        {
          id: "PENNSYLVANIA",
          name: "Pennsylvania",
          cities: [
            "Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton",
            "Bethlehem", "Lancaster", "Harrisburg", "Altoona", "York", "State College",
            "Wilkes-Barre", "Chester"
          ]
        },
        {
          id: "OHIO",
          name: "Ohio",
          cities: [
            "Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton",
            "Parma", "Canton", "Youngstown", "Lorain", "Hamilton", "Springfield",
            "Kettering", "Elyria"
          ]
        },
        {
          id: "GEORGIA",
          name: "Georgia",
          cities: [
            "Atlanta", "Augusta", "Columbus", "Macon", "Savannah", "Athens",
            "Sandy Springs", "Roswell", "Johns Creek", "Warner Robins", "Albany",
            "Alpharetta", "Marietta", "Valdosta"
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
            "Mushin", "Oshodi", "Somolu", "Ifako-Ijaiye", "Amuwo-Odofin", "Ojo",
            "Ibeju-Lekki", "Eti-Osa", "Lagos Mainland"
          ]
        },
        {
          id: "ABUJA",
          name: "Abuja",
          cities: [
            "Abuja", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa",
            "Jahi", "Lugbe", "Karu", "Nyanya", "Bwari", "Kuje", "Gwagwalada", "Kwali",
            "Jabi", "Utako", "Durumi", "Gudu", "Lokogoma", "Galadimawa", "Karmo"
          ]
        },
        {
          id: "KANO",
          name: "Kano",
          cities: [
            "Kano", "Nassarawa", "Tarauni", "Dala", "Fagge", "Gwale", "Kumbotso",
            "Ungogo", "Dawakin Tofa", "Tofa", "Rimin Gado", "Bagwai", "Gezawa",
            "Gabasawa", "Minjibir", "Kura", "Madobi", "Garun Mallam", "Bebeji",
            "Rano", "Bunkure", "Kibiya"
          ]
        },
        {
          id: "RIVERS",
          name: "Rivers",
          cities: [
            "Port Harcourt", "Obio-Akpor", "Ikwerre", "Eleme", "Oyigbo", "Etche",
            "Omuma", "Okrika", "Ogu–Bolo", "Bonny", "Degema", "Asari-Toru",
            "Akuku-Toru", "Abua–Odual", "Ahoada", "Andoni", "Emohua", "Khana",
            "Ogba–Egbema–Ndoni", "Tai", "Opobo–Nkoro", "Gokana"
          ]
        },
        {
          id: "KADUNA",
          name: "Kaduna",
          cities: [
            "Kaduna", "Zaria", "Kafanchan", "Makarfi", "Soba", "Ikara", "Kudan",
            "Lere", "Kauru", "Kubau", "Kajuru", "Jaba", "Sanga", "Chikun"
          ]
        },
        {
          id: "OYO",
          name: "Oyo",
          cities: [
            "Ibadan", "Ogbomoso", "Iseyin", "Oyo", "Saki", "Kishi", "Ibarapa",
            "Okeho", "Eruwa", "Lanlate", "Igbo-Ora", "Ido", "Afijio", "Akinyele"
          ]
        },
        {
          id: "ENUGU",
          name: "Enugu",
          cities: [
            "Enugu", "Nsukka", "Agbani", "Awgu", "Udi", "Ezeagu", "Igbo-Etiti",
            "Nkanu", "Isi-Uzo", "Oji River", "Uzo-Uwani", "Enugu East",
            "Enugu North", "Enugu South"
          ]
        },
        {
          id: "DELTA",
          name: "Delta",
          cities: [
            "Asaba", "Warri", "Sapele", "Agbor", "Ughelli", "Oleh", "Burutu",
            "Koko", "Ozoro", "Patani", "Akumazi", "Illah", "Ubulu-Uku", "Umunede"
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
            "Gujrat", "Sahiwal", "Wah Cantonment", "Kasur", "Okara", "Chiniot",
            "Kamoke", "Hafizabad", "Sadiqabad", "Burewala", "Khanewal", "Muzaffargarh"
          ]
        },
        {
          id: "SINDH",
          name: "Sindh",
          cities: [
            "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
            "Jacobabad", "Shikarpur", "Khairpur", "Dadu", "Tando Allahyar",
            "Tando Adam", "Badin", "Thatta", "Kotri", "Ghotki", "Daharki",
            "Umerkot", "Tharparkar", "Matiari", "Tando Muhammad Khan", "Jamshoro"
          ]
        },
        {
          id: "KHYBER",
          name: "Khyber Pakhtunkhwa",
          cities: [
            "Peshawar", "Mardan", "Abbottabad", "Mingora", "Kohat", "Bannu",
            "Swabi", "Dera Ismail Khan", "Charsadda", "Nowshera", "Mansehra",
            "Haripur", "Timergara", "Tank", "Hangu", "Karak", "Battagram",
            "Shangla", "Lower Dir", "Upper Dir", "Malakand", "Buner"
          ]
        },
        {
          id: "BALOCHISTAN",
          name: "Balochistan",
          cities: [
            "Quetta", "Turbat", "Khuzdar", "Chaman", "Gwadar", "Dera Murad Jamali",
            "Dera Allah Yar", "Usta Mohammad", "Sibi", "Loralai", "Zhob", "Pasni",
            "Qila Saifullah", "Khost", "Hub", "Panjgur", "Mastung", "Nushki",
            "Kalat", "Kharan", "Awaran", "Washuk"
          ]
        },
        {
          id: "GILGIT",
          name: "Gilgit-Baltistan",
          cities: [
            "Gilgit", "Skardu", "Chilas", "Ghizer", "Khaplu", "Astore", "Ghanche",
            "Shigar", "Nagar", "Diamer", "Gultari", "Roundu", "Thowar", "Hushe"
          ]
        },
        {
          id: "AJK",
          name: "Azad Jammu & Kashmir",
          cities: [
            "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bhimber", "Bagh",
            "Sudhnuti", "Neelum", "Hattian", "Haveli", "Pallandri", "Forward Kahuta",
            "Jhelum Valley", "Samahni"
          ]
        },
        {
          id: "ISLAMABAD",
          name: "Islamabad",
          cities: [
            "Islamabad", "Sector F-6", "Sector G-6", "Sector I-8", "Sector E-7",
            "Sector F-7", "Sector G-7", "Sector H-8", "Sector I-9", "Sector D-12",
            "Sector E-11", "Sector F-10", "Sector G-10", "Sector H-11"
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
            "Patel Nagar", "Rajouri Garden", "Kalkaji", "Sarita Vihar", "Vasant Kunj",
            "Greater Kailash", "Connaught Place", "Chanakyapuri", "Mayur Vihar",
            "Preet Vihar", "Shahdara"
          ]
        },
        {
          id: "MAHARASHTRA",
          name: "Maharashtra",
          cities: [
            "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
            "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Ulhasnagar", "Sangli",
            "Malegaon", "Jalgaon", "Akola", "Latur", "Thane", "Kalyan", "Vasai-Virar",
            "Mira-Bhayandar", "Bhiwandi-Nizampur", "Jalna"
          ]
        },
        {
          id: "KARNATAKA",
          name: "Karnataka",
          cities: [
            "Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere",
            "Ballari", "Tumakuru", "Shivamogga", "Raichur", "Bidar", "Hospet",
            "Udupi", "Gadag-Betageri", "Robertson Pet", "Hassan", "Mandya",
            "Chitradurga", "Kolar", "Chikkaballapur", "Ramanagara", "Chikmagalur"
          ]
        },
        {
          id: "TAMIL_NADU",
          name: "Tamil Nadu",
          cities: [
            "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
            "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi",
            "Dindigul", "Thanjavur", "Hosur", "Nagercoil", "Kanchipuram", "Kumarapalayam",
            "Kumbakonam", "Tiruvannamalai", "Pollachi", "Rajapalayam", "Sivakasi", "Ambur"
          ]
        },
        {
          id: "UTTAR_PRADESH",
          name: "Uttar Pradesh",
          cities: [
            "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut",
            "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur",
            "Gorakhpur", "Faizabad", "Jhansi"
          ]
        },
        {
          id: "WEST_BENGAL",
          name: "West Bengal",
          cities: [
            "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda",
            "Bardhaman", "Habra", "Kharagpur", "Shantipur", "Dankuni", "Dhulian",
            "Ranaghat", "Haldia"
          ]
        },
        {
          id: "GUJARAT",
          name: "Gujarat",
          cities: [
            "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
            "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Gandhidham",
            "Bharuch", "Vapi"
          ]
        },
        {
          id: "RAJASTHAN",
          name: "Rajasthan",
          cities: [
            "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara",
            "Alwar", "Bharatpur", "Sri Ganganagar", "Sikar", "Pali", "Tonk", "Jhunjhunu"
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
            "Tanjung Priok", "Kelapa Gading", "Kemayoran", "Gambir", "Tanah Abang",
            "Menteng", "Senen", "Cempaka Putih", "Johar Baru"
          ]
        },
        {
          id: "WEST_JAVA",
          name: "West Java",
          cities: [
            "Bandung", "Bekasi", "Depok", "Bogor", "Cimahi", "Sukabumi",
            "Cirebon", "Tasikmalaya", "Karawang", "Purwakarta", "Subang",
            "Sumedang", "Garut", "Majalengka", "Cianjur", "Banjar", "Soreang",
            "Cileungsi", "Cibinong", "Cipanas", "Cisarua", "Lembang"
          ]
        },
        {
          id: "CENTRAL_JAVA",
          name: "Central Java",
          cities: [
            "Semarang", "Surakarta", "Tegal", "Pekalongan", "Salatiga",
            "Magelang", "Kudus", "Jepara", "Rembang", "Blora", "Batang", "Pati",
            "Wonosobo", "Temanggung", "Boyolali", "Klaten", "Purwodadi", "Slawi",
            "Pemalang", "Brebes", "Kendal", "Demak"
          ]
        },
        {
          id: "EAST_JAVA",
          name: "East Java",
          cities: [
            "Surabaya", "Malang", "Kediri", "Mojokerto", "Jember", "Banyuwangi",
            "Madiun", "Pasuruan", "Probolinggo", "Blitar", "Lumajang", "Bondowoso",
            "Situbondo", "Tulungagung", "Tuban", "Lamongan", "Sidoarjo", "Gresik",
            "Nganjuk", "Magetan", "Ponorogo", "Trenggalek"
          ]
        },
        {
          id: "BANTEN",
          name: "Banten",
          cities: [
            "Serang", "Tangerang", "Cilegon", "South Tangerang", "Pandeglang",
            "Lebak", "Rangkasbitung", "Ciputat", "Balaraja", "Tigaraksa", "Curug",
            "Kresek", "Malingping", "Labuan"
          ]
        },
        {
          id: "BALI",
          name: "Bali",
          cities: [
            "Denpasar", "Badung", "Gianyar", "Tabanan", "Singaraja", "Kuta",
            "Ubud", "Sanur", "Nusa Dua", "Jimbaran", "Canggu", "Seminyak",
            "Legian", "Kerobokan"
          ]
        },
        {
          id: "SUMATERA_UTARA",
          name: "Sumatera Utara",
          cities: [
            "Medan", "Binjai", "Pematang Siantar", "Tebing Tinggi", "Tanjung Balai",
            "Sibolga", "Padang Sidempuan", "Gunungsitoli", "Deli Serdang", "Langkat",
            "Karo", "Simalungun", "Labuhan Batu", "Asahan"
          ]
        },
        {
          id: "SULAWESI_SELATAN",
          name: "Sulawesi Selatan",
          cities: [
            "Makassar", "Parepare", "Palopo", "Maros", "Pangkajene", "Barru",
            "Bone", "Soppeng", "Wajo", "Sidenreng Rappang", "Pinrang", "Enrekang",
            "Luwu", "Tana Toraja"
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
            "Maltepe", "Sarıyer", "Pendik", "Kartal", "Beylikdüzü", "Bağcılar",
            "Kağıthane", "Güngören", "Esenyurt", "Avcılar", "Gaziosmanpaşa"
          ]
        },
        {
          id: "ANKARA",
          name: "Ankara",
          cities: [
            "Ankara", "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Sincan",
            "Altındağ", "Etimesgut", "Polatlı", "Gölbaşı", "Pursaklar", "Akyurt",
            "Kahramankazan", "Elmadağ", "Bala", "Ayaş", "Nallıhan", "Beypazarı",
            "Kızılcahamam", "Çubuk", "Haymana", "Kalecik"
          ]
        },
        {
          id: "IZMIR",
          name: "İzmir",
          cities: [
            "İzmir", "Bornova", "Karşıyaka", "Konak", "Buca", "Bayraklı",
            "Çiğli", "Balçova", "Narlıdere", "Gaziemir", "Güzelbahçe", "Urla",
            "Seferihisar", "Menderes", "Torbalı", "Bergama", "Aliağa", "Kemalpaşa",
            "Ödemiş", "Tire", "Bayındır", "Menemen"
          ]
        },
        {
          id: "ANTALYA",
          name: "Antalya",
          cities: [
            "Antalya", "Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat",
            "Serik", "Kumluca", "Kaş", "Korkuteli", "Finike", "Gazipaşa",
            "Demre", "Akseki", "Elmalı", "Gündoğmuş", "İbradı", "Kemer", "Aksu",
            "Döşemealtı", "Korkuteli", "Kumluca"
          ]
        },
        {
          id: "BURSA",
          name: "Bursa",
          cities: [
            "Bursa", "Osmangazi", "Yıldırım", "Nilüfer", "İnegöl", "Gemlik",
            "Mustafakemalpaşa", "Mudanya", "Gürsu", "Kestel", "Karacabey",
            "Orhangazi", "İznik", "Yenişehir"
          ]
        },
        {
          id: "ADANA",
          name: "Adana",
          cities: [
            "Adana", "Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan",
            "Kozan", "İmamoğlu", "Karataş", "Pozantı", "Feke", "Saimbeyli",
            "Aladağ", "Tufanbeyli"
          ]
        },
        {
          id: "KONYA",
          name: "Konya",
          cities: [
            "Konya", "Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir",
            "Beyşehir", "Çumra", "Seydişehir", "Ilgın", "Cihanbeyli", "Kadınhanı",
            "Sarayönü", "Bozkır"
          ]
        },
        {
          id: "GAZIANTEP",
          name: "Gaziantep",
          cities: [
            "Gaziantep", "Şahinbey", "Şehitkamil", "Nizip", "İslahiye", "Nurdağı",
            "Araban", "Oğuzeli", "Yavuzeli", "Karkamış", "Nizip", "İslahiye",
            "Nurdağı", "Araban"
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
            "Santos", "Mauá", "Diadema", "Jundiaí", "Barueri", "São Vicente", "Carapicuíba",
            "Itaquaquecetuba", "São Carlos", "Americana", "Araraquara", "Hortolândia", "Rio Claro"
          ]
        },
        {
          id: "RIO_JANEIRO",
          name: "Rio de Janeiro",
          cities: [
            "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu",
            "Niterói", "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti",
            "Petrópolis", "Volta Redonda", "Magé", "Itaboraí", "Macaé", "Mesquita",
            "Teresópolis", "Nilópolis", "Queimados", "Maricá", "Resende", "Angra dos Reis",
            "Paracambi", "Barra Mansa"
          ]
        },
        {
          id: "MINAS_GERAIS",
          name: "Minas Gerais",
          cities: [
            "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim",
            "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares",
            "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité",
            "Poços de Caldas", "Patos de Minas", "Pouso Alegre", "Varginha",
            "Conselheiro Lafaiete", "Sabará", "Ribeirão das Neves", "Itabira"
          ]
        },
        {
          id: "BAHIA",
          name: "Bahia",
          cities: [
            "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari",
            "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié",
            "Alagoinhas", "Teixeira de Freitas", "Barreiras", "Porto Seguro",
            "Simões Filho", "Paulo Afonso", "Eunápolis", "Lucas", "Santo Antônio de Jesus",
            "Valença", "Guanambi", "Bom Jesus da Lapa", "Brumado"
          ]
        },
        {
          id: "RIO_GRANDE_DO_SUL",
          name: "Rio Grande do Sul",
          cities: [
            "Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria",
            "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande",
            "Alvorada", "Passo Fundo", "Uruguaiana", "Bage"
          ]
        },
        {
          id: "PARANA",
          name: "Paraná",
          cities: [
            "Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel",
            "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava",
            "Paranaguá", "Araucária", "Toledo", "Apucarana", "Pinhais"
          ]
        },
        {
          id: "CEARA",
          name: "Ceará",
          cities: [
            "Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral",
            "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá", "Pacatuba",
            "Quixeramobim", "Aracati", "Canindé"
          ]
        },
        {
          id: "PERNAMBUCO",
          name: "Pernambuco",
          cities: [
            "Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina",
            "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns",
            "Vitória de Santo Antão", "Ipojuca", "São Lourenço da Mata",
            "Serra Talhada", "Arcoverde"
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
    const def = COUNTRY_DATA[code] || {
      label: code.toUpperCase(),
      phonePrefix: "",
      provinces: [],
    };

    return { ...def, code: (code || "ma").toUpperCase() };
  }

  /* ------------------------------------------------------------------ */
  /* Thank you (popup / redirect / inline)                               */
  /* ------------------------------------------------------------------ */
  function getThankYouConfig(cfg, offersCfg) {
    const a =
      (cfg && (cfg.thankYou || cfg.thankyou || cfg.thank_you)) ||
      (cfg && cfg.behavior && (cfg.behavior.thankYou || cfg.behavior.thankyou)) ||
      (cfg && cfg.form && (cfg.form.thankYou || cfg.form.thankyou)) ||
      (offersCfg && (offersCfg.thankYou || offersCfg.thankyou)) ||
      (offersCfg && offersCfg.global && (offersCfg.global.thankYou || offersCfg.global.thankyou)) ||
      null;

    if (!a || typeof a !== "object") return null;

    const ty = { ...a };
    if (ty.enabled === undefined) ty.enabled = true;
    if (!ty.mode && ty.type) ty.mode = ty.type;

    return ty;
  }

  function thankYouOverlayId(root) {
    return `tf-ty-${root && root.id ? root.id : "root"}`;
  }

  function ensureThankYouOverlay(root) {
    const id = thankYouOverlayId(root);
    let overlay = document.getElementById(id);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = id;
    overlay.className = "tf-ty-overlay";
    overlay.innerHTML = `<div class="tf-ty-card" data-tf-ty-card="1"></div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hideThankYou(root);
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function hideThankYou(root) {
    const overlay = document.getElementById(thankYouOverlayId(root));
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  function normalizeDesign(d0) {
    const d = d0 && typeof d0 === "object" ? { ...d0 } : {};
    if (!d.bg) d.bg = "#ffffff";
    if (!d.text) d.text = "#111827";
    if (!d.border) d.border = "rgba(2,6,23,.10)";
    if (!d.inputBg) d.inputBg = "#FFFFFF";
    if (!d.inputBorder) d.inputBorder = "rgba(2,6,23,.15)";
    if (!d.btnBg) d.btnBg = "#111827";
    if (!d.btnBg2) d.btnBg2 = "#2563EB";
    if (!d.btnBgMode) d.btnBgMode = "solid";
    if (!d.btnText) d.btnText = "#FFFFFF";
    if (!d.cartBg) d.cartBg = "#FFFFFF";
    if (!d.cartBorder) d.cartBorder = "rgba(2,6,23,.10)";
    if (!d.cartRowBg) d.cartRowBg = "#F8FAFC";
    if (!d.cartRowBorder) d.cartRowBorder = "rgba(2,6,23,.08)";
    if (!d.cartTitleColor) d.cartTitleColor = d.text;
    if (!d.cartTextColor) d.cartTextColor = d.text;
    if (d.radius == null) d.radius = 12;
    if (d.padding == null) d.padding = 16;
    if (d.btnRadius == null) d.btnRadius = 10;
    if (d.btnHeight == null) d.btnHeight = 46;
    return d;
  }

  function showThankYouPopup(root, cfg, ty, ctx) {
    const overlay = ensureThankYouOverlay(root);
    const card = overlay.querySelector('[data-tf-ty-card="1"]');
    if (!card) return;

    const d = normalizeDesign((cfg && cfg.design) || {});
    const bg = css(d.bg || "#ffffff");
    const text = css(d.text || "#111827");
    const border = css(d.border || "rgba(2,6,23,.10)");
    const btnBg = resolveButtonBackground(d);
    const btnBorder = resolveButtonBorder(d, btnBg);
    const btnText = css(d.btnText || "#ffffff");

    const title = css(ty.title || ty.heading || "Thank you!");
    const message = css(ty.text || ty.message || "We will contact you soon.");
    const img = String(ty.imageUrl || ty.image || "").trim();

    const primaryText = css(ty.primaryText || ty.buttonText || "Close");
    const secondaryText = css(ty.secondaryText || ty.secondaryButtonText || "Continue shopping");

    card.innerHTML = `
      <div style="
        background:${bg};
        color:${text};
        border:1px solid ${border};
        border-radius:18px;
        padding:16px;
        box-shadow:0 26px 60px rgba(15,23,42,.38);
      ">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:900;font-size:16px;line-height:1.2;margin-bottom:6px;">${title}</div>
            <div style="opacity:.9;line-height:1.45;font-size:13px;">${message}</div>
          </div>
          <button type="button" data-tf-ty-x="1" aria-label="Close" style="
            width:36px;height:36px;border-radius:999px;
            background:transparent;border:1px solid ${border};
            color:${text};cursor:pointer;font-size:20px;
            display:flex;align-items:center;justify-content:center;
          ">&times;</button>
        </div>

        ${img ? `<div style="margin-top:14px;"><img class="tf-ty-img" src="${css(img)}" alt="" /></div>` : ""}

        <div class="tf-ty-actions">
          <button type="button" data-tf-ty-primary="1" class="tf-ty-btn" style="
            background:${btnBg};
            border:1px solid ${btnBorder};
            color:${btnText};
          ">${primaryText}</button>

          <button type="button" data-tf-ty-secondary="1" class="tf-ty-btn" style="
            background:transparent;
            border:1px solid ${border};
            color:${text};
          ">${secondaryText}</button>
        </div>
      </div>
    `;

    const xBtn = overlay.querySelector('[data-tf-ty-x="1"]');
    const primary = overlay.querySelector('[data-tf-ty-primary="1"]');
    const secondary = overlay.querySelector('[data-tf-ty-secondary="1"]');

    const close = () => hideThankYou(root);

    if (xBtn) xBtn.onclick = (e) => { e.preventDefault(); close(); };
    if (primary) primary.onclick = (e) => { e.preventDefault(); close(); };
    if (secondary) secondary.onclick = (e) => {
      e.preventDefault();
      const url = String(ty.secondaryUrl || ty.continueUrl || "").trim();
      if (url) window.location.href = url;
      else close();
    };

    const autoCloseMs = Number(ty && ty.autoCloseMs ? ty.autoCloseMs : 0);
    if (autoCloseMs > 0) setTimeout(() => hideThankYou(root), autoCloseMs);

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function handleThankYou(root, cfg, offersCfg, payload, json) {
    const ty = getThankYouConfig(cfg, offersCfg);
    if (!ty || ty.enabled === false) return;

    const mode = String(ty.mode || ty.type || "redirect").toLowerCase();
    const serverRedirect = (json && (json.redirectUrl || json.thankYouUrl || json.url)) || "";

    if (mode === "redirect" || mode === "simple") {
      const url = String(serverRedirect || ty.redirectUrl || ty.url || "").trim();
      if (url) return (window.location.href = url);
      return showThankYouPopup(root, cfg, { ...ty, mode: "popup" }, { payload, json });
    }

    if (mode === "popup") return showThankYouPopup(root, cfg, ty, { payload, json });

    if (mode === "inline") {
      const msg = css(ty.text || "Thank you! We will contact you soon.");
      alert(msg);
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

  let __tfInternalQty = 1;
  let __tfLastRoot = null;
  let __tfGlobalWatchAttached = false;
  function setActiveRoot(root) {
    if (root && root.nodeType === 1) __tfLastRoot = root;
  }

  function findQtyInput(root) {
    if (!root || root.nodeType !== 1) return null;
    return (
      root.querySelector('[data-tf-field="quantity"]') ||
      root.querySelector('input[data-tf-role="quantity"]') ||
      root.querySelector('input[name="quantity"]') ||
      root.querySelector('select[name="quantity"]')
    );
  }

  function dispatchQtyEvents(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } catch {
      // noop
    }
  }

  // ✅ getQty / setQty are now COD-aware (root quantity field has priority)
  function getQty(root) {
    const r = root || __tfLastRoot;

    const local = findQtyInput(r);
    const vLocal = Number(local && local.value != null ? local.value : NaN);

    const qEl =
      document.querySelector('form[action^="/cart/add"] input[name="quantity"]') ||
      document.querySelector('form[action^="/cart/add"] select[name="quantity"]') ||
      document.querySelector('input[name="quantity"]') ||
      document.querySelector('select[name="quantity"]');

    const vTheme = Number(qEl && qEl.value != null ? qEl.value : NaN);

    // If both exist and theme qty is higher, keep them in sync (fixes x2/x3 blocking in some themes)
    if (Number.isFinite(vLocal) && vLocal > 0 && Number.isFinite(vTheme) && vTheme > 0) {
      const lv = Math.max(1, Math.round(vLocal));
      const tv = Math.max(1, Math.round(vTheme));
      if (local && (local.getAttribute("data-tf-field") === "quantity" || local.getAttribute("data-tf-role") === "quantity")) {
        if (tv !== lv && (tv > 1 || lv > 1)) {
          // sync local -> theme selection (without fighting user)
          try {
            local.value = String(tv);
            dispatchQtyEvents(local);
          } catch {}
          __tfInternalQty = tv;
          return tv;
        }
      }
      __tfInternalQty = lv;
      return lv;
    }

    if (Number.isFinite(vLocal) && vLocal > 0) {
      __tfInternalQty = Math.max(1, Math.round(vLocal));
      return __tfInternalQty;
    }

    if (Number.isFinite(vTheme) && vTheme > 0) {
      __tfInternalQty = Math.max(1, Math.round(vTheme));
      return __tfInternalQty;
    }

    return Math.max(1, Number(__tfInternalQty || 1));
  }
  function setQty(nextQty, root) {
    const n = Math.max(1, Math.round(Number(nextQty || 1)));
    __tfInternalQty = n;

    const r = root || __tfLastRoot;
    const local = findQtyInput(r);
    let did = false;

    if (local) {
      local.value = String(n);
      dispatchQtyEvents(local);
      did = true;
    }

    const q = document.querySelector('form[action^="/cart/add"] input[name="quantity"]') || document.querySelector('form[action^="/cart/add"] select[name="quantity"]');
    if (q && q !== local) {
      q.value = String(n);
      dispatchQtyEvents(q);
      did = true;
    }

    return did;
  }

  // ✅ Watch variant + BOTH qty sources (theme qty + COD qty inside holder)
  function watchVariantAndQty(onChange, scopeEl) {
    const safeCall = () => {
      try {
        onChange();
      } catch (e) {
        console.warn("[Tripleform COD] watchVariantAndQty onChange error:", e);
      }
    };

    // Bind global watchers once (theme variant + theme qty)
    window.__tfVQHandlers = window.__tfVQHandlers || [];
    window.__tfVQHandlers.push(safeCall);

    if (!__tfGlobalWatchAttached) {
      __tfGlobalWatchAttached = true;

      const fireAll = () => {
        const list = Array.isArray(window.__tfVQHandlers) ? window.__tfVQHandlers : [];
        list.forEach((fn) => {
          try {
            if (typeof fn === "function") fn();
          } catch {
            // noop
          }
        });
      };

      const isQtyEl = (t) =>
        !!t &&
        t.matches &&
        (t.matches('input[name="quantity"]') ||
          t.matches('select[name="quantity"]') ||
          t.matches('[data-quantity-input]') ||
          t.matches('.quantity__input') ||
          t.matches('.quantity__selector input'));

      const isVariantEl = (t) =>
        !!t &&
        t.matches &&
        (t.matches('select[name="id"]') ||
          t.matches('input[name="id"]') ||
          t.matches('[name="id"]'));

      document.addEventListener(
        "change",
        (e) => {
          if (isVariantEl(e.target) || isQtyEl(e.target)) fireAll();
        },
        true
      );

      document.addEventListener(
        "input",
        (e) => {
          if (isQtyEl(e.target)) fireAll();
        },
        true
      );

      // Some themes change qty via +/- buttons without firing input immediately
      document.addEventListener(
        "click",
        (e) => {
          const t = e.target;
          if (!t || !t.closest) return;
          const btn = t.closest(
            'button[name="plus"],button[name="minus"],.quantity__button,[data-quantity-plus],[data-quantity-minus]'
          );
          if (btn) fireAll();
        },
        true
      );

      document.addEventListener("variant:change", fireAll);
    }

    // Bind COD-qty watcher per holder (delegated, survives re-render)
    const scope = scopeEl && scopeEl.nodeType === 1 ? scopeEl : null;
    if (scope && !scope.__tfWatchCodQtyBound) {
      scope.__tfWatchCodQtyBound = true;

      const matchQty = (t) =>
        !!t &&
        t.matches &&
        (t.matches('[data-tf-field="quantity"]') ||
          t.matches('input[data-tf-role="quantity"]') ||
          t.matches('input[name="quantity"]') ||
          t.matches('select[name="quantity"]'));

      scope.addEventListener(
        "input",
        (e) => {
          if (matchQty(e.target)) safeCall();
        },
        true
      );
      scope.addEventListener(
        "change",
        (e) => {
          if (matchQty(e.target)) safeCall();
        },
        true
      );
    }
  }

/* ------------------------------------------------------------------ */
  /* Sticky button                                                      */
  /* ------------------------------------------------------------------ */
  function setupSticky(root, cfg, openHandler, motionClass) {
    const rootId = (root && root.id) ? root.id : "root";
    const stickyTypeRaw = String(cfg?.behavior?.stickyType || "none");
    const stickyType = stickyTypeRaw.trim().toLowerCase();
    const stickyPos = String(cfg?.behavior?.stickyPosition || cfg?.behavior?.stickyPos || "").trim().toLowerCase();

    const stickyLabel = css(cfg?.behavior?.stickyLabel || cfg?.uiTitles?.orderNow || "Order now");
    const stickyIcon = cfg?.behavior?.stickyIcon || "AppsIcon";

    const prev = document.querySelector(`[data-tf-sticky-for="${rootId}"]`);
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (stickyType === "none") return;

    const d = normalizeDesign(cfg.design || {});
    const bg = resolveButtonBackground(d);
    const text = d.btnText || "#FFFFFF";
    const br = resolveButtonBorder(d, bg);

    const el = document.createElement("div");
    el.setAttribute("data-tf-sticky-for", rootId);
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

    const posMap = {
      "bottom-right": "right:16px; bottom:12px;",
      "bottom-left": "left:16px; bottom:12px;",
      "top-right": "right:16px; top:12px; bottom:auto;",
      "top-left": "left:16px; top:12px; bottom:auto;",
      "middle-right": "right:16px; top:50%; bottom:auto; transform:translateY(-50%);",
      "middle-left": "left:16px; top:50%; bottom:auto; transform:translateY(-50%);",
      "center-bottom": "left:50%; bottom:12px; transform:translateX(-50%);",
    };

    const isBottomBar = stickyType === "bottom-bar";
    const looksLeft = stickyType.includes("left");
    const looksRight = stickyType.includes("right");

    let posCss = "";
    if (isBottomBar) {
      posCss = "left:12px; right:12px; bottom:12px;";
    } else if (stickyPos && posMap[stickyPos]) {
      posCss = posMap[stickyPos];
    } else if (looksLeft) {
      posCss = posMap["bottom-left"];
    } else if (looksRight) {
      posCss = posMap["bottom-right"];
    } else {
      posCss = posMap["bottom-right"];
    }

    el.style.cssText = baseStyle + posCss;

    const iconHtml = getIconHtml(stickyIcon, 16, text);
    const motion = motionClass ? ` ${motionClass}` : "";

    el.innerHTML = `
      <button
        type="button"
        data-tf-sticky-cta="1"
        class="tf-btn${motion}"
        style="
          width:${isBottomBar ? "100%" : "auto"};
          max-width:${isBottomBar ? "540px" : "none"};
          display:inline-flex;
          gap:10px;
          align-items:center;
          justify-content:center;
          padding:12px 14px;
          border-radius:${isBottomBar ? "14px" : "999px"};
          min-height:${Math.max(44, Number(d.btnHeight || 46))}px;
          background:${bg};
          color:${text};
          border:1px solid ${br};
          box-shadow:0 10px 30px rgba(0,0,0,.16);
          cursor:pointer;
          font-weight:800;
          letter-spacing:.2px;
        "
      >
        ${iconHtml}${stickyLabel}
      </button>
    `;

    const btn = el.querySelector("[data-tf-sticky-cta]");
    if (btn) {
      btn.onclick = (e) => {
        e.preventDefault();
        if (typeof openHandler === "function") openHandler();
      };
    }

    document.body.appendChild(el);
  }

  /* ------------------------------------------------------------------ */
  /* Dropdown province / city (NO DATA => placeholders only)            */
  /* ------------------------------------------------------------------ */
  function setupLocationDropdowns(root, cfg, countryDef) {
    const provinces = (countryDef && countryDef.provinces) || [];

    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');
    if (!provSelect && !citySelect) return;

    // ✅ no country data => keep placeholders, do nothing
    if (!Array.isArray(provinces) || provinces.length === 0) return;

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
          ? cfg.fields?.city?.ph || "Select city"
          : cfg.fields?.city?.ph || "Select province first"
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

    if (provSelect) provSelect.onchange = (e) => fillCities(e.target.value || "");
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
  /* Offers activation (SCOPED PER ROOT)                                */
  /* ------------------------------------------------------------------ */
  function lsKey(rootId, name) {
    return `tf_${name}_${rootId}`;
  }

  function getActiveOfferData(rootId) {
    const storeKey = lsKey(rootId, "current_active_offer");
    const raw = localStorage.getItem(storeKey);
    return raw ? safeJsonParse(raw, null) : null;
  }

  function setActiveOfferData(rootId, dataOrNull) {
    const storeKey = lsKey(rootId, "current_active_offer");
    if (!dataOrNull) return localStorage.removeItem(storeKey);
    localStorage.setItem(storeKey, JSON.stringify(dataOrNull));
  }

  function getActiveUpsellsData(rootId) {
    const storeKey = lsKey(rootId, "current_active_upsells");
    const raw = localStorage.getItem(storeKey);
    const arr = raw ? safeJsonParse(raw, []) : [];
    return Array.isArray(arr) ? arr : [];
  }

  function setActiveUpsellsData(rootId, arr) {
    const storeKey = lsKey(rootId, "current_active_upsells");
    if (!arr || !Array.isArray(arr) || !arr.length) return localStorage.removeItem(storeKey);
    localStorage.setItem(storeKey, JSON.stringify(arr));
  }

  function isUpsellActive(rootId, upsell, idx) {
    const active = getActiveUpsellsData(rootId);
    const pid = String(upsell?.productId || upsell?.product_id || upsell?.product || "");
    return active.some((x) => {
      if (!x) return false;
      if (pid) return String(x.productId || x.product_id || x.product || "") === pid;
      return Number(x.index) === Number(idx);
    });
  }

  function toggleUpsellActivation(button, upsellIndex, upsellsList, root, updateMoney) {
    const rootId = root.id || "root";
    const upsell = upsellsList[upsellIndex] || {};
    const productId = String(upsell.productId || upsell.product_id || upsell.product || "");
    const qty = Math.max(1, Math.round(Number(upsell.qty || button.getAttribute("data-tf-upsell-qty") || 1)));

    const active = getActiveUpsellsData(rootId);
    const already = isUpsellActive(rootId, upsell, upsellIndex);

    let next = active.filter(Boolean);

    if (already) {
      next = next.filter((x) => {
        if (!x) return false;
        if (productId) return String(x.productId || x.product_id || x.product || "") !== productId;
        return Number(x.index) !== Number(upsellIndex);
      });
    } else {
      next.push({
        index: upsellIndex,
        productId: productId || null,
        title: upsell.title || "",
        qty,
      });
    }

    setActiveUpsellsData(rootId, next);

    // UI
    const btnLabel = button.getAttribute("data-tf-btn-label") || upsell.buttonText || "Add";
    const addedText = button.getAttribute("data-tf-added-text") || upsell.addedText || "Added";
    const nowActive = !already;

    button.classList.toggle("active", nowActive);
    button.setAttribute("aria-pressed", nowActive ? "true" : "false");
    button.innerHTML = `${nowActive ? getIconHtml("CheckCircleIcon", 16, "currentColor") : getIconHtml("CirclePlusIcon", 16, "currentColor")} ${css(nowActive ? addedText : btnLabel)}`;

    try {
      if (typeof updateMoney === "function") updateMoney();
    } catch {}
  }


  function toggleOfferActivation(button, offerIndex, offersList, root, updateMoney) {
    const rootId = root.id || "root";
    const isActive = button.classList.contains("active");

    const allButtons = root.querySelectorAll("[data-tf-offer-toggle]");
    allButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
      const baseText = btn.getAttribute("data-tf-btn-label") || "Activer";
      btn.innerHTML = `${getIconHtml("CirclePlusIcon", 16, "currentColor")} ${css(baseText)}`;
    });

    setActiveOfferData(rootId, null);

    if (!isActive) {
      const offer = offersList[offerIndex] || {};

      const bundleQty = Number(offer.bundleQty || offer.minQty || offer.requiredQty || offer.qtyMultiplier || offer.minQuantity || 0);
      if (bundleQty > 0) setQty(bundleQty, root);

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      button.innerHTML = `${getIconHtml("CheckCircleIcon", 16, "currentColor")} Activée`;

      const selectedPackQty = Number(button.getAttribute("data-tf-pack-qty") || 0) || bundleQty || 0;
      if (selectedPackQty > 0) setQty(selectedPackQty, root);

      setActiveOfferData(rootId, {
        index: offerIndex,
        type: "offer",
        title: offer.title || "",
        discountType: offer.discountType || null,
        discountValue: Number(offer.discountValue || 0),
        minQty: Number(selectedPackQty || offer.requiredQty || offer.bundleQty || offer.minQty || offer.qtyMultiplier || offer.minQuantity || 1),
        applyPerItem: offer.applyPerItem === true,
        fixedMode: offer.fixedMode || null,
        capDiscount: offer.capDiscount !== false,
        maxDiscountCents: Number(offer.maxDiscountCents || 0),
        forceQty: offer.forceQty === true || !!selectedPackQty || !!offer.requiredQty || !!offer.bundleQty,
        bundleQty: Number(selectedPackQty || offer.requiredQty || offer.bundleQty || offer.qtyMultiplier || offer.minQuantity || 0),
        bundleTotal: offer.bundleTotal ?? null,
        bundleTotalCents: offer.bundleTotalCents ?? null,
        packQty: selectedPackQty || null,
      });
    }

    updateMoney();
  }

  /* ------------------------------------------------------------------ */
  /* OFFRES / UPSELL – HTML                                             */
  /* ------------------------------------------------------------------ */
  function fallbackImgSvg() {
    return (
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23EEF2FF'/%3E%3Cstop offset='1' stop-color='%23F8FAFC'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='220' rx='18' fill='url(%23g)'/%3E%3Cpath d='M120 92l40-40 80 80v72H80V92z' fill='%234F46E5' opacity='.9'/%3E%3Ccircle cx='110' cy='78' r='18' fill='%2399A7FF' opacity='.85'/%3E%3C/svg%3E"
    );
  }

  function pickColors(item, globalColors) {
    const useGlobal = item?.useGlobalColors !== false;
    const c = useGlobal ? globalColors || {} : item?.colors || {};
    const d = item?.design || {};
    const borderStyle = String(d.borderStyle || "solid").toLowerCase();
    const borderWidth = borderStyle === "double" ? 3 : 1;
    return {
      cardBg: c.cardBg || "var(--tf-offer-bg,#FFFFFF)",
      borderColor: c.borderColor || "var(--tf-offer-border,#E5E7EB)",
      borderStyle,
      borderWidth,
      textColor: d.textColor || "var(--tf-offer-text,#111827)",
      textSize: Number(d.textSize || 14) || 14,
      iconBg: c.iconBg || "var(--tf-offer-iconbg,#EEF2FF)",
      buttonBg: c.buttonBg || "var(--tf-btn-bg,#111827)",
      buttonTextColor: c.buttonTextColor || "var(--tf-btn-text,#FFFFFF)",
      buttonBorder: c.buttonBorder || (c.buttonBg || "var(--tf-btn-bg,#111827)"),
      iconColor: c.iconColor || "var(--tf-icon-color,#111827)",
    };
  }

  function packOptionsForOffer(offer) {
    if (!offer) return [];
    const arr = Array.isArray(offer.packOptions) ? offer.packOptions : [];
    if (arr.length) return arr.map((n) => Number(n)).filter((n) => n > 1);
    if (offer.enablePackOptions === true) return [2, 3, 4];
    return [];
  }

  function buildOffersHtml(offersCfg, rootId, mode = "all") {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (global.enabled === false) return "";

    const globalColors = global.colors || {};
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    const showOffers = mode === "all" || mode === "offers";
    const showUpsells = mode === "all" || mode === "upsells";

    const activeOffers = showOffers
      ? offers.filter((o) => o && o.enabled !== false && o.showInPreview !== false)
      : [];
    const activeUpsells = showUpsells
      ? upsells.filter((u) => u && u.enabled !== false && u.showInPreview !== false)
      : [];

    if (!activeOffers.length && !activeUpsells.length) return "";

    const active = getActiveOfferData(rootId);
    let html = `<div class="tf-offers-container" data-tf-offers-block="1">`;

    activeOffers.forEach((offer, idx) => {
      const title = offer.title || "Offre spéciale";
      const description = offer.description || "";
      const img = (offer.imageUrl || "").trim() || fallbackImgSvg();
      const iconUrl = (offer.iconUrl || "").trim();
      const c = pickColors(offer, globalColors);

      const isActive = active && Number(active.index) === idx && active.type === "offer";
      const btnLabel = offer.buttonText || "Activer";

      const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || offer.qtyMultiplier || offer.minQuantity || 1);
      const packHint = minQty > 1 ? `Pack: ${minQty} pcs` : offer.subText || "";

      const packOptions = packOptionsForOffer(offer);
      const activePack = active && active.packQty && Number(active.index) === idx ? Number(active.packQty) : 0;

      html += `
        <div class="tf-offer-card" style="background:${css(c.cardBg)};border-color:${css(c.borderColor)};border-style:${css(c.borderStyle)};border-width:${css(c.borderWidth)}px;">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              <span class="tf-offer-icon-fallback" style="color:${css(c.iconColor)}">
                ${getIconHtml("DiscountIcon", 18, "currentColor")}
              </span>
              ${iconUrl ? `<img src="${css(iconUrl)}" alt="" onerror="this.remove();" />` : ``}
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title" style="color:${css(c.textColor)};font-size:${css(c.textSize)}px">${css(title)}</div>
              <div class="tf-offer-desc" style="color:${css(c.textColor)};font-size:${css(c.textSize)}px">${css(description)}</div>
              ${packHint ? `<div class="tf-offer-sub" style="color:${css(c.textColor)};font-size:${css(c.textSize)}px">${css(packHint)}</div>` : ""}

              ${
                packOptions.length
                  ? `<div class="tf-pack-row" data-tf-pack-row="${idx}">
                      ${packOptions
                        .map((q) => {
                          const on = isActive && activePack === q;
                          return `<button type="button" class="tf-pack-pill ${on ? "active" : ""}"
                            data-tf-pack-pill="1" data-tf-offer-index="${idx}" data-tf-pack-qty="${q}">
                            x${q}
                          </button>`;
                        })
                        .join("")}
                    </div>`
                  : ""
              }

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
                ${isActive ? getIconHtml("CheckCircleIcon", 16, "currentColor") : getIconHtml("CirclePlusIcon", 16, "currentColor")}
                ${isActive ? "Activée" : css(btnLabel)}
              </button>
            </div>

            <div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}" onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
            </div>
          </div>
          <div data-tf-timer-offer="${idx}"></div>
        </div>
      `;
    });

    activeUpsells.forEach((upsell, uidx) => {
      const title = upsell.title || "Upsell";
      const description = upsell.description || "";
      const img = (upsell.imageUrl || "").trim() || fallbackImgSvg();
      const iconUrl = (upsell.iconUrl || "").trim();
      const c = pickColors(upsell, globalColors);
      const isActiveU = isUpsellActive(rootId, upsell, uidx);
      const btnEnabledU = upsell.buttonEnabled !== false;
      const btnLabelU = upsell.buttonText || "Add";
      const addedTextU = upsell.addedText || "Added";
      const upsellQtyU = Math.max(1, Math.round(Number(upsell.qty || 1)));
      const upsellProductIdU = String(upsell.productId || upsell.product_id || upsell.product || "").trim();
      const upsellBtnDisabledU = !upsellProductIdU;


      html += `
        <div class="tf-offer-card" style="background:${css(c.cardBg)};border-color:${css(c.borderColor)};border-style:${css(c.borderStyle)};border-width:${css(c.borderWidth)}px;">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              <span class="tf-offer-icon-fallback" style="color:${css(c.iconColor)}">
                ${getIconHtml("GiftCardIcon", 18, "currentColor")}
              </span>
              ${iconUrl ? `<img src="${css(iconUrl)}" alt="" onerror="this.remove();" />` : ``}
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title" style="color:${css(c.textColor)};font-size:${css(c.textSize)}px">${css(title)}</div>
              <div class="tf-offer-desc" style="color:${css(c.textColor)};font-size:${css(c.textSize)}px">${css(description)}</div>
            </div>
              ${
                btnEnabledU
                  ? `<button
                      type="button"
                      class="tf-offer-btn tf-upsell-btn ${isActiveU ? "active" : ""} ${upsellBtnDisabledU ? "disabled" : ""}"
                      data-tf-upsell-toggle="1"
                      data-tf-upsell-index="${uidx}"
                      data-tf-root-id="${css(rootId)}"
                      data-tf-btn-label="${css(btnLabelU)}"
                      data-tf-added-text="${css(addedTextU)}"
                      data-tf-upsell-qty="${upsellQtyU}"
                      style="
                        background:${css(c.buttonBg)};
                        color:${css(c.buttonTextColor)};
                        border:1px solid ${css(c.buttonBorder)};
                        margin-top:10px;
                        width:100%;
                      "
                      aria-pressed="${isActiveU ? "true" : "false"}"
                      ${upsellBtnDisabledU ? "disabled" : ""}
                      title="${upsellBtnDisabledU ? "Select a product for this upsell first" : ""}"
                    >
                      ${isActiveU ? getIconHtml("CheckCircleIcon", 16, "currentColor") : getIconHtml("CirclePlusIcon", 16, "currentColor")}
                      ${isActiveU ? css(addedTextU) : css(btnLabelU)}
                      ${upsellQtyU > 1 ? `<span style="opacity:.85;margin-left:6px">x${upsellQtyU}</span>` : ``}
                    </button>`
                  : ""
              }
<div class="tf-offer-img">
              <img src="${css(img)}" alt="${css(title)}" onerror="this.onerror=null;this.src='${fallbackImgSvg()}'"/>
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
  
  /* ------------------------------------------------------------------ */
  /* Theme block layout (positions)                                      */
  /* ------------------------------------------------------------------ */
  function clampInt(n, min, max) {
    const x = Number.isFinite(n) ? n : NaN;
    if (!Number.isFinite(x)) return min;
    return Math.max(min, Math.min(max, x));
  }

  function readThemeLayout(root) {
    // data-* provided by the Liquid app block (Theme Editor settings)
    const pos = (attr, def) => {
      const v = String(root.getAttribute(attr) || "").toLowerCase();
      if (v === "top" || v === "bottom" || v === "inside" || v === "hide") return v;
      return def;
    };
    const ord = (attr, def) => {
      const n = parseInt(String(root.getAttribute(attr) || ""), 10);
      if (!Number.isFinite(n)) return def;
      return clampInt(n, 1, 3);
    };

    return {
      summary: { position: pos("data-summary-position", "top"), order: ord("data-summary-order", 3) },
      offers: { position: pos("data-offers-position", "top"), order: ord("data-offers-order", 1) },
      upsells: { position: pos("data-upsells-position", "top"), order: ord("data-upsells-order", 2) },
    };
  }



  function readBlocksLayoutFromConfig(cfg) {
    const bl = cfg && cfg.behavior && cfg.behavior.blocksLayout ? cfg.behavior.blocksLayout : null;
    if (!bl || typeof bl !== "object") return null;

    const normPos = (v, def) => {
      const x = String(v || "").toLowerCase();
      if (x === "top" || x === "bottom" || x === "inside" || x === "hide") return x;
      return def;
    };
    const normOrd = (v, def) => {
      const n = parseInt(String(v || ""), 10);
      if (!Number.isFinite(n)) return def;
      return clampInt(n, 1, 3);
    };

    return {
      summary: {
        position: normPos(bl?.summary?.position, "top"),
        order: normOrd(bl?.summary?.order, 3),
      },
      offers: {
        position: normPos(bl?.offers?.position, "top"),
        order: normOrd(bl?.offers?.order, 1),
      },
      upsells: {
        position: normPos(bl?.upsells?.position, "top"),
        order: normOrd(bl?.upsells?.order, 2),
      },
    };
  }

  function readLayout(cfg, root) {
    return readBlocksLayoutFromConfig(cfg) || readThemeLayout(root);
  }

/* Render                                                             */
  /* ------------------------------------------------------------------ */
  function render(root, cfg, offersCfg, geoCfg, product, getVariant, moneyFmt, recaptchaCfg) {
    setActiveRoot(root);
    const rootId = (root && root.id) ? root.id : "root";

    const d0 = cfg.design || {};
    const d = Object.assign(
      {
        bg: "#FFFFFF",
        text: "#111827",
        border: "rgba(2,6,23,.12)",
        padding: 16,
        radius: 12,
        inputBg: "#FFFFFF",
        inputBorder: "rgba(2,6,23,.15)",
        btnText: "#FFFFFF",
        btnRadius: 10,
        btnHeight: 46,
        btnBg: "#111827",
        cartBg: "#FFFFFF",
        cartBorder: "rgba(2,6,23,.12)",
        cartTitleColor: "#111827",
        cartRowBg: "#F9FAFB",
        cartRowBorder: "rgba(2,6,23,.10)",
        cartTextColor: "#111827",
      },
      d0
    );

    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    const f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";

    const motion = beh.buttonMotion || "none";
    const motionClass =
      motion === "x" ? "tf-motion-x" :
      motion === "y" ? "tf-motion-y" :
      motion === "pulse" ? "tf-motion-pulse" :
      motion === "shake" ? "tf-motion-shake" : "";

    const countryDef = getCountryDef(beh);
    const pageStart = Date.now();

    const baseGlow = d.btnBg || "#2563EB";
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

    // unified vars
    const shellBg = d.shellBg || d.sectionBg || "#F3F4F6";
    const shellBorder = d.shellBorder || "rgba(2,6,23,.08)";
    const iconColor = d.iconColor || d.text || "#111827";
    const offerBg = d.offerCardBg || "#FFFFFF";
    const offerBorder = d.offerCardBorder || "#E5E7EB";
    const offerIconBg = d.offerIconBg || "#EEF2FF";
    const titleColor = d.titleColor || d.text || "#0F172A";
    const mutedColor = d.mutedColor || "#64748B";
    const muted2Color = d.muted2Color || "#94A3B8";

    root.style.setProperty("--tf-shell-bg", shellBg);
    root.style.setProperty("--tf-shell-border", shellBorder);
    root.style.setProperty("--tf-icon-color", iconColor);
    root.style.setProperty("--tf-offer-bg", offerBg);
    root.style.setProperty("--tf-offer-border", offerBorder);
    root.style.setProperty("--tf-offer-iconbg", offerIconBg);
    root.style.setProperty("--tf-title", titleColor);
    root.style.setProperty("--tf-muted", mutedColor);
    root.style.setProperty("--tf-muted2", muted2Color);

    const __btnBg = resolveButtonBackground(d);
    const __btnSolid = resolveButtonBorder(d, __btnBg);
    root.style.setProperty("--tf-btn-bg", __btnBg);
    root.style.setProperty("--tf-btn-solid", __btnSolid);
    root.style.setProperty("--tf-btn-text", d.btnText || "#FFFFFF");

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
      border:1px solid ${css(__btnSolid)};
      color:${css(d.btnText)};
      background:${css(__btnBg)};
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


    const layout = readLayout(cfg, root);

    const offersBlockHtml =
      layout.offers.position === "hide" ? "" : buildOffersHtml(offersCfg || {}, rootId, "offers");
    const upsellsBlockHtml =
      layout.upsells.position === "hide" ? "" : buildOffersHtml(offersCfg || {}, rootId, "upsells");
    const summaryBlockHtml =
      layout.summary.position === "hide" ? "" : cartSummaryHTML();

    const blocks = [
      { key: "offers", html: offersBlockHtml, position: layout.offers.position, order: layout.offers.order },
      { key: "upsells", html: upsellsBlockHtml, position: layout.upsells.position, order: layout.upsells.order },
      { key: "summary", html: summaryBlockHtml, position: layout.summary.position, order: layout.summary.order },
    ].filter((b) => b && b.html && b.position !== "hide");

    const blocksHtml = (where) =>
      blocks
        .filter((b) => b.position === where)
        .sort((a, b) => (a.order || 99) - (b.order || 99))
        .map((b) => b.html)
        .join("");

    const topBlocksHtml = blocksHtml("top");
    const insideBlocksHtml = blocksHtml("inside");
    const bottomBlocksHtml = blocksHtml("bottom");


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

      const iconCol = d.iconColor || d.text || "#111827";
      const iconHtml = field.icon ? getIconHtml(field.icon, 18, iconCol) : "";

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
            <div style="width:22px;height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
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
            <div style="width:22px;height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
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
            <div style="width:22px;height:100px; display:flex; align-items:flex-start; justify-content:center; padding-top:12px;">
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
            <div style="width:22px;height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
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
          <div style="width:22px;height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
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
      const cartIconHtml = t.cartIcon
        ? `<span class="tf-circle-icon">${getIconHtml(t.cartIcon, 18, css(d.cartTitleColor || "#111827"))}</span>`
        : "";
      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">${cartIconHtml}${css(t.top || "Order summary")}</div>
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
              <div>${css(t.discountLabel || "Discount")}</div>
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

      const formContainerStyle = isPopupOrDrawer
        ? `padding:0;background:transparent;border:none;box-shadow:none;border-radius:0;`
        : cardStyle;

      return `
        <div style="${formContainerStyle}" data-tf-role="form-card">
          ${
            cfg.form?.title || cfg.form?.subtitle
              ? `
            <div style="text-align:${titleAlign}; margin-bottom:20px;">
              ${cfg.form?.title ? `<div style="font-weight:900; font-size:${labelFontSize}; margin-bottom:4px;">${css(cfg.form.title)}</div>` : ""}
              ${cfg.form?.subtitle ? `<div style="opacity:.85; font-size:${smallFontSize};">${css(cfg.form.subtitle)}</div>` : ""}
            </div>`
              : ""
          }

          <div style="position:relative;">
            <!-- ✅ Honeypot -->
            <input type="text" data-tf-role="honeypot" name="tf_hp_token"
              style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;"
              tabindex="-1" autocomplete="off" />

            ${fieldsBlockHTML()}

            ${
              beh?.requireGDPR
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" data-tf-gdpr="1" /> ${css(beh.gdprLabel || "I accept the privacy policy")}
              </label>`
                : ""
            }

            ${
              beh?.whatsappOptIn
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151; margin:12px 0;">
                <input type="checkbox" data-tf-wa-optin="1" /> ${css(beh.whatsappLabel || "Receive confirmation on WhatsApp")}
              </label>`
                : ""
            }

            ${
              recaptchaCfg && recaptchaCfg.enabled
                ? `
              <div data-tf-recaptcha-v2="1" style="margin-top:12px;"></div>`
                : ""
            }

            ${insideBlocksHtml ? `<div style="height:10px"></div>${insideBlocksHtml}` : ""}

            <button type="button" style="${btnStyle}; margin-top:16px;"
              class="${motionClass}"
              data-tf-cta="1" data-tf="${ctaKey}">
              ${buttonIconHtml}${orderLabel} · ${suffix} …
            </button>
          </div>
        </div>
      `;
    }

    const mainStart = `
      <div class="tf-shell">
        <div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};box-sizing:border-box;">
    `;
    const mainEnd = `
        </div>
      </div>
    `;

    let html = "";

    if (styleType === "inline") {
      const topGap = topBlocksHtml ? `<div style="height:6px"></div>` : "";
      const bottomGap = bottomBlocksHtml ? `<div style="height:6px"></div>` : "";

      html =
        mainStart +
        topBlocksHtml +
        topGap +
        formCardHTML("cta-inline", false) +
        bottomGap +
        bottomBlocksHtml +
        mainEnd;
    } else if (styleType === "popup") {
      const topGap = topBlocksHtml ? `<div style="height:6px"></div>` : "";
      html =
        mainStart +
        topBlocksHtml +
        topGap +
        `
        <div style="text-align:${titleAlign};">
          <button type="button" style="${btnStyle}" class="${motionClass}" data-tf-cta="1" data-tf="launcher">
            ${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : ""}
            ${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …
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
                background:${css(d.bg)}; border:1px solid ${css(d.border)}; color:${css(d.text)};
                font-size:20px; cursor:pointer; width:32px; height:32px; display:flex;
                align-items:center; justify-content:center; border-radius:50%;">&times;</button>
            </div>
            <div style="padding:24px; box-sizing:border-box;">
              <div class="tf-shell">
                <div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};">
                  ${topBlocksHtml}
                  ${topBlocksHtml ? `<div style="height:6px"></div>` : ``}
                  ${formCardHTML("cta-popup", true)}
                  ${bottomBlocksHtml ? `<div style="height:6px"></div>` : ``}
                  ${bottomBlocksHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      const origin = beh.drawerOrigin || beh.drawerDirection || "right";

      html =
        mainStart +
        topBlocksHtml +
        (topBlocksHtml ? `<div style="height:6px"></div>` : "") +
        `
        <div style="text-align:${titleAlign};">
          <button type="button" style="${btnStyle}" class="${motionClass}" data-tf-cta="1" data-tf="launcher">
            ${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : ""}
            ${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …
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
                  background:${css(d.bg)}; border:1px solid ${css(d.border)}; color:${css(d.text)};
                  font-size:20px; cursor:pointer; width:32px; height:32px; display:flex;
                  align-items:center; justify-content:center; border-radius:50%;">&times;</button>
              </div>
              <div class="tf-shell">
                <div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};">
                  ${topBlocksHtml}
                  ${topBlocksHtml ? `<div style="height:6px"></div>` : ``}
                  ${formCardHTML("cta-drawer", true)}
                  ${bottomBlocksHtml ? `<div style="height:6px"></div>` : ``}
                  ${bottomBlocksHtml}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = html;

    // ✅ reCAPTCHA v2: render checkbox widget if enabled
    if (recaptchaCfg && recaptchaCfg.enabled) {
      ensureRecaptchaV2Widget(root, recaptchaCfg);
    }

    setTimeout(() => initializeTimers(root, offersCfg), 80);
    setupLocationDropdowns(root, cfg, countryDef);

    // ✅ GEO shipping: recalc shipping when province/city changes (select + input, debounced)
    try {
      const provEl = root.querySelector('[data-tf-role="province"], [data-tf-field="province"]');
      const cityEl = root.querySelector('[data-tf-role="city"], [data-tf-field="city"]');

      let geoTimer = null;
      const scheduleGeoRecalc = () => {
        try { if (geoTimer) clearTimeout(geoTimer); } catch (e) {}
        geoTimer = setTimeout(() => {
          try { updateMoney(); } catch (e) {}
        }, 220);
      };

      if (provEl) {
        provEl.addEventListener("change", scheduleGeoRecalc);
        provEl.addEventListener("input", scheduleGeoRecalc);
        provEl.addEventListener("blur", scheduleGeoRecalc);
      }
      if (cityEl) {
        cityEl.addEventListener("change", scheduleGeoRecalc);
        cityEl.addEventListener("input", scheduleGeoRecalc);
        cityEl.addEventListener("blur", scheduleGeoRecalc);
      }
    } catch (e) {}

    /* --------------------- Field helpers --------------------------- */
    function getField(key) {
      return root.querySelector(`[data-tf-field="${key}"]`) || null;
    }
    function getVal(key) {
      const el = getField(key);
      return el ? String(el.value || "").trim() : "";
    }
    // ✅ GEO helper: always read current province/city selection from the form
    function readGeoSelection() {
      const provEl =
        root.querySelector('select[data-tf-role="province"]') ||
        root.querySelector('select[data-tf-field="province"]');
      const cityEl =
        root.querySelector('select[data-tf-role="city"]') ||
        root.querySelector('select[data-tf-field="city"]');

      const province = provEl ? String(provEl.value || "").trim() : getVal("province");
      const city = cityEl ? String(cityEl.value || "").trim() : getVal("city");
      return { province, city };
    }

    function getPhone() {
      const phoneField = f.phone || {};
      const prefix = phoneField.prefix ? String(phoneField.prefix) : "";
      const number = getVal("phone");
      const fullPhone = prefix && number ? `${prefix}${number}` : number || prefix || "";
      return { prefix, number, fullPhone };
    }

    function getCheckbox(sel) {
      const el = root.querySelector(sel);
      return !!(el && el.checked);
    }

    /* ✅ Build fields payload dynamically (so Sheets gets ALL fields) */
    function buildFieldsPayload() {
      const out = {};
      const keys = orderedFieldKeys().filter((k) => f[k] && f[k].on !== false);

      keys.forEach((k) => {
        out[k] = getVal(k);
      });

      // normalize phone fields
      const phone = getPhone();
      if ("phone" in out) out.phone = phone.number || phone.fullPhone;
      out.phonePrefix = phone.prefix;
      out.fullPhone = phone.fullPhone;

      // optional checkboxes
      if (beh?.requireGDPR) out.gdprAccepted = getCheckbox('[data-tf-gdpr="1"]');
      if (beh?.whatsappOptIn) out.whatsappOptIn = getCheckbox('[data-tf-wa-optin="1"]');

      return out;
    }

    /* --------------------- Price parse (cents-safe) ----------------- */
    function variantPriceToCents(variant) {
      const raw = variant && variant.price != null ? String(variant.price).trim() : "0";
      if (!raw) return 0;

      const cleaned = raw.replace(/[^\d.,-]/g, "");
      if (!cleaned) return 0;

      const hasDecimal = /[.,]\d{1,2}$/.test(cleaned);
      if (hasDecimal) {
        const normalized = cleaned.replace(",", ".");
        const n = Number(normalized);
        return Number.isFinite(n) ? Math.round(n * 100) : 0;
      }

      const n = Number(cleaned);
      return Number.isFinite(n) ? Math.round(n) : 0;
    }

    function computeProductTotals() {
      const vId = getVariant();
      const qty = getQty(root);
      const variant =
        product.variants.find((v) => String(v.id) === String(vId)) ||
        product.variants[0];

      const priceCents = variantPriceToCents(variant);
      const baseTotalCents = priceCents * qty;

      return { priceCents, baseTotalCents, qty, variantId: vId };
    }

    /* --------------------- Offers & packs: sync qty ----------------- */
    const offersVisible = Array.isArray(offersCfg?.offers) ? offersCfg.offers : [];
    const activeOffersOnly = offersVisible.filter((o) => o && o.enabled !== false && o.showInPreview !== false);

    const upsellsVisible = Array.isArray(offersCfg?.upsells) ? offersCfg.upsells : [];
    const activeUpsellsOnly = upsellsVisible.filter((u) => u && u.enabled !== false && u.showInPreview !== false);


    function currentOffer() {
      const active = getActiveOfferData(rootId);
      if (!active || active.type !== "offer") return null;
      const idx = Number(active.index);
      const offer = activeOffersOnly[idx];
      return offer ? { active, offer, idx } : null;
    }

    function applyOfferQtyIfNeeded() {
      const x = currentOffer();
      if (!x) return;
      const q = Number(x.active.packQty || x.offer.bundleQty || x.offer.minQty || x.offer.requiredQty || x.offer.qtyMultiplier || x.offer.minQuantity || 0);
      if (q > 0 && getQty(root) !== q) setQty(q, root);
    }

    function computeDiscountCents(baseTotalCents, qty) {
      const x = currentOffer();
      if (!x) return 0;

      const { offer } = x;
      const discountType = offer.discountType || null;
      const discountValue = Number(offer.discountValue ?? 0);

      const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || offer.qtyMultiplier || offer.minQuantity || 1);
      if (minQty > 1 && Number(qty || 1) < minQty) return 0;

      if (!discountType || !(discountValue > 0)) return 0;

      const applyPerItem = offer.applyPerItem === true;

      let discount = 0;
      if (discountType === "percentage") {
        discount = Math.round(baseTotalCents * (discountValue / 100));
      } else if (discountType === "fixed") {
        const onceCents = Math.round(discountValue * 100);
        discount = applyPerItem ? onceCents * Math.max(1, qty) : onceCents;
      }

      if (discount < 0) discount = 0;
      if (discount > baseTotalCents) discount = baseTotalCents;
      return discount;
    }

    function offerSubtotalOverrideCents() {
      const x = currentOffer();
      if (!x) return null;
      const v = x.offer.bundleTotalPrice;
      if (v == null) return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return null;
      return Math.round(n * 100);
    }


function extractGeoShippingCents(resp) {
  try {
    if (!resp || typeof resp !== "object") return null;

    // Explicit free-shipping flags
    if (resp.freeShipping === true || resp.isFreeShipping === true || resp.free === true) return 0;

    const pick = (v) => {
      if (v == null) return null;
      if (typeof v === "number" && Number.isFinite(v)) {
        // Heuristic: if looks like major units (e.g. 39.9), convert to cents; if integer, assume cents
        if (Number.isInteger(v)) return v;
        return Math.round(v * 100);
      }
      if (typeof v === "string") {
        const s = v.trim();
        if (!s) return null;
        const n = Number(s.replace(",", ".").replace(/[^\d.\-]/g, ""));
        if (!Number.isFinite(n)) return null;
        // If string contains decimal separator, assume major units
        if (s.includes(".") || s.includes(",")) return Math.round(n * 100);
        // Otherwise: could be cents or major; choose cents if big
        if (n >= 1000) return Math.round(n);
        return Math.round(n * 100);
      }
      return null;
    };

    const candidates = [
      resp.shippingCents,
      resp.shipping_cents,
      resp.shippingPriceCents,
      resp.shipping_price_cents,
      resp.amountCents,
      resp.amount_cents,
      resp.cents,
      resp.shipping,
      resp.price,
      resp.amount,
    ];

    for (const c of candidates) {
      const cents = pick(c);
      if (typeof cents === "number" && Number.isFinite(cents) && cents >= 0) return Math.round(cents);
    }

    // Nested shapes: { data: { ... } } or { result: { ... } }
    if (resp.data) {
      const cents = extractGeoShippingCents(resp.data);
      if (cents != null) return cents;
    }
    if (resp.result) {
      const cents = extractGeoShippingCents(resp.result);
      if (cents != null) return cents;
    }

    return null;
  } catch (e) {
    return null;
  }
}

function computeShippingCents(subtotalCents) {
  // Return null => keep "Shipping to calculate"
  // Return number (cents) => show shipping amount
  try {
    if (!geoCfg) return null;
    if (geoCfg.enabled === false) return null;

    const mode = String(geoCfg.mode || "province").toLowerCase();

    // Preferred: server-side GEO shipping calculation via endpoint (Shopify App Proxy)
    if (geoEndpoint) {
      const sel = (typeof readGeoSelection === "function" ? readGeoSelection(cfg) : {}) || {};
      const province = String(sel.province || "").trim();
      const city = String(sel.city || "").trim();

      // Requirements depend on GEO mode:
      //  - price: no province/city required
      //  - province: province required
      //  - city: province + city required
      if (mode !== "price") {
        if (!province) {
          __tfGeoRemote.key = null;
          __tfGeoRemote.cents = null;
          __tfGeoRemote.pending = false;
          __tfGeoRemote.error = null;
          return null;
        }
        if (mode === "city" && !city) {
          __tfGeoRemote.key = null;
          __tfGeoRemote.cents = null;
          __tfGeoRemote.pending = false;
          __tfGeoRemote.error = null;
          return null;
        }
      }

      const amt = Number(subtotalCents || 0);
      const key = [String(geoCountryAttr || geoCfg.country || ""), province, city, String(Math.round(amt))].join("|");

      // Use cached / in-flight result
      if (__tfGeoRemote.key === key) {
        if (typeof __tfGeoRemote.cents === "number" && Number.isFinite(__tfGeoRemote.cents)) return __tfGeoRemote.cents;
        return null;
      }

      __tfGeoRemote.key = key;
      __tfGeoRemote.cents = null;
      __tfGeoRemote.pending = true;
      __tfGeoRemote.error = null;

      const payload = {
        country: geoCountryAttr || geoCfg.country || "MA",
        province,
        city,
        subtotalCents: Math.max(0, Math.round(amt)),
        currency: holder.getAttribute("data-currency") || "",
        productId: Number(holder.getAttribute("data-product-id") || 0) || undefined,
        variantId: Number(holder.getAttribute("data-variant-id") || 0) || undefined,
        locale: holder.getAttribute("data-locale") || ""
      };

      fetch(geoEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(async (r) => {
          let data = null;
          try { data = await r.json(); } catch (e) { data = null; }
          if (!r.ok) {
            const msg = (data && (data.error || data.message)) ? (data.error || data.message) : ("HTTP " + r.status);
            throw new Error(msg);
          }
          return data;
        })
        .then((data) => {
          const cents = extractGeoShippingCents(data);
          __tfGeoRemote.cents = (typeof cents === "number" && Number.isFinite(cents) && cents >= 0) ? cents : null;
          __tfGeoRemote.pending = false;
          // Re-render totals (will switch from "Shipping to calculate" => amount)
          try { updateMoney(); } catch (e) {}
        })
        .catch((err) => {
          __tfGeoRemote.pending = false;
          __tfGeoRemote.error = err && err.message ? err.message : "shipping calc error";
          __tfGeoRemote.cents = null;
          try { updateMoney(); } catch (e) {}
        });

      return null;
    }

    const country = (geoCfg.country || "MA").toUpperCase().slice(0, 2);
    const adv = geoCfg.advanced || {};
    const amount = Number(subtotalCents || 0) / 100;

    // Explicit free shipping toggles (only if merchant enabled them)
    if (geoCfg.isFree === true) return 0;

    const freeThreshold = Number(adv.freeThreshold || 0);
    if (freeThreshold > 0 && amount >= freeThreshold) return 0;

    const sel = readGeoSelection() || {};
    const province = sel.province ? String(sel.province).trim() : "";
    const city = sel.city ? String(sel.city).trim() : "";

    // ✅ Requirements depend on mode (important for "price" mode)
    if (mode === "province" || mode === "city") {
      if (!province) return null;
    }
    if (mode === "city" && !city) return null;

    const useFallback = Boolean(adv.useFallbackIfNotFound);
    const hasDefaultRate = adv.defaultRate !== undefined && adv.defaultRate !== null && String(adv.defaultRate).trim() !== "";
    const defaultRate = hasDefaultRate ? Number(adv.defaultRate) : null;

    let rate = null;

    if (mode === "price") {
      const brackets = Array.isArray(geoCfg.priceBrackets) ? geoCfg.priceBrackets : [];
      if (brackets.length) {
        for (const b of brackets) {
          const min = (b && b.min) == null ? -Infinity : Number(b.min);
          const max = (b && b.max) == null ? Infinity : Number(b.max);
          if (!Number.isFinite(min) && min !== -Infinity) continue;
          if (!Number.isFinite(max) && max !== Infinity) continue;
          if (amount >= min && amount < max) {
            rate = Number(b && b.rate) || 0;
            break;
          }
        }
      }
      if (rate == null && defaultRate != null) rate = defaultRate;
    } else if (mode === "province") {
      const list = (geoCfg.provinceRates && geoCfg.provinceRates[country]) || [];
      const p = province.toLowerCase();
      for (const r of list) {
        const name = String((r && (r.name || r.province || r.label)) || "").trim().toLowerCase();
        if (name && name === p) {
          rate = Number(r && (r.rate ?? r.price ?? r.amount)) || 0;
          break;
        }
      }
      if (rate == null && useFallback && list.length) {
        // fallback to first rule
        const r0 = list[0];
        rate = Number(r0 && (r0.rate ?? r0.price ?? r0.amount)) || 0;
      }
      if (rate == null && defaultRate != null) rate = defaultRate;
    } else {
      // city
      const list = (geoCfg.cityRates && geoCfg.cityRates[country]) || [];
      const key1 = (province + "|" + city).toLowerCase();
      const key2 = city.toLowerCase();
      for (const r of list) {
        const rp = String((r && (r.province || r.region || "")) || "").trim();
        const rc = String((r && (r.city || r.name || r.label || "")) || "").trim();
        const k = (rp + "|" + rc).toLowerCase();
        if ((rp && rc && k === key1) || (!rp && rc && rc.toLowerCase() === key2)) {
          rate = Number(r && (r.rate ?? r.price ?? r.amount)) || 0;
          break;
        }
      }
      if (rate == null && useFallback && list.length) {
        const r0 = list[0];
        rate = Number(r0 && (r0.rate ?? r0.price ?? r0.amount)) || 0;
      }
      if (rate == null && defaultRate != null) rate = defaultRate;
    }

    // No match -> keep placeholder
    if (rate == null || Number.isNaN(rate)) return null;

    // COD extra fee (optional)
    const isCod = true; // storefront form is COD
    const codExtraFee = (isCod && adv.codExtraFee != null) ? Number(adv.codExtraFee || 0) : 0;

    const final = Math.max(0, Number(rate || 0) + codExtraFee);
    return Math.round(final * 100);
  } catch (e) {
    return null;
  }
}


function updateMoney() {
      applyOfferQtyIfNeeded();

      const { priceCents, baseTotalCents, qty } = computeProductTotals();

      const override = offerSubtotalOverrideCents();
      const subtotalBeforeDiscount = override != null ? override : baseTotalCents;

      const discountCents = computeDiscountCents(subtotalBeforeDiscount, qty);
      const discountedSubtotalCents = Math.max(0, subtotalBeforeDiscount - discountCents);

      const shippingCents = computeShippingCents(discountedSubtotalCents);
      const grandTotalCents = discountedSubtotalCents + (shippingCents || 0);

      root.querySelectorAll('[data-tf="price"]').forEach((el) => (el.textContent = moneyFmt(priceCents)));
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

      const shippingEls = root.querySelectorAll('[data-tf="shipping"]');
      const shippingNoteEls = root.querySelectorAll('[data-tf="shipping-note"]');
      if (shippingCents == null) {
        shippingEls.forEach((el) => (el.textContent = css(t.shippingToCalculate || "Shipping to calculate")));
        shippingNoteEls.forEach((el) => (el.textContent = css(t.selectShipping || "Select province/city to calculate shipping")));
      } else if (shippingCents <= 0) {
        shippingEls.forEach((el) => (el.textContent = css(t.freeShipping || "Free")));
        shippingNoteEls.forEach((el) => (el.textContent = ""));
      } else {
        shippingEls.forEach((el) => (el.textContent = moneyFmt(shippingCents)));
        shippingNoteEls.forEach((el) => (el.textContent = ""));
      }

      const label = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const suffix = css(ui.totalSuffix || "Total:");
      const buttonIconHtml = cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : "";

      root.querySelectorAll('[data-tf-cta="1"]').forEach((el) => {
        el.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;
      });

      const mainCta = root.querySelector('[data-tf="launcher"]');
      if (mainCta) mainCta.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;

      const buttons = root.querySelectorAll("[data-tf-offer-toggle]");
      buttons.forEach((btn) => {
        const i = parseInt(btn.getAttribute("data-tf-offer-index") || "0", 10);
        const offer = activeOffersOnly[i];
        if (!offer) return;

        const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || offer.qtyMultiplier || offer.minQuantity || 1);
        const mustHavePack = minQty > 1;
        const ok = !mustHavePack || qty >= minQty;

        btn.classList.toggle("disabled", !ok);
        btn.title = !ok ? `Need quantity ${minQty} to apply discount` : "";
      });
    }

    setTimeout(() => {
      const buttons = root.querySelectorAll("[data-tf-offer-toggle]");
      buttons.forEach((btn) => {
        btn.onclick = function (e) {
          e.preventDefault();
          if (this.classList.contains("disabled")) return;
          const offerIndex = parseInt(this.getAttribute("data-tf-offer-index"), 10);
          toggleOfferActivation(this, offerIndex, activeOffersOnly, root, updateMoney);
        };
      });

      const upsellButtons = root.querySelectorAll("[data-tf-upsell-toggle]");
      upsellButtons.forEach((btn) => {
        btn.onclick = function (e) {
          e.preventDefault();
          if (this.classList.contains("disabled") || this.disabled) return;
          const idx = parseInt(this.getAttribute("data-tf-upsell-index") || "0", 10);
          toggleUpsellActivation(this, idx, activeUpsellsOnly, root, updateMoney);
        };
      });

      const pills = root.querySelectorAll("[data-tf-pack-pill]");
      pills.forEach((pill) => {
        pill.onclick = (e) => {
          e.preventDefault();
          const idx = Number(pill.getAttribute("data-tf-offer-index") || 0);
          const q = Number(pill.getAttribute("data-tf-pack-qty") || 0);
          if (!(q > 1)) return;

          setActiveOfferData(rootId, { index: idx, type: "offer", packQty: q });
          setQty(q, root);
          updateMoney();

          const row = root.querySelector(`[data-tf-pack-row="${idx}"]`);
          if (row) {
            row.querySelectorAll(".tf-pack-pill").forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
          }

          const btn = root.querySelector(`[data-tf-offer-toggle][data-tf-offer-index="${idx}"]`);
          if (btn) {
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
            btn.innerHTML = `${getIconHtml("CheckCircleIcon", 16, "currentColor")} Activée`;
          }
        };
      });
    }, 60);

    function validateRequiredFields() {
      const requiredKeys = Object.keys(f || {}).filter((k) => f[k]?.on && f[k]?.required);
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
        alert("Merci de remplir les champs obligatoires :\n- " + missing.join("\n- "));
        if (firstInvalid && typeof firstInvalid.focus === "function") firstInvalid.focus();
        return false;
      }
      return true;
    }

    /* ✅ Anti-bot (adapted) */
    function checkAntibotFront() {
      const antibot = (cfg && cfg.behavior && (cfg.behavior.antibot || cfg.behavior.antiBot)) || {};
      const minTimeMs = Number(antibot.minTimeMs ?? cfg?.behavior?.minTimeMs ?? 1500);
      const hpInput = root.querySelector('[data-tf-role="honeypot"]');
      const hpValue = hpInput ? String(hpInput.value || "").trim() : "";
      const timeOnPageMs = Date.now() - pageStart;

      // honeypot filled => bot
      if (hpInput && hpValue) {
        alert(css(antibot.hpMessage || "Votre commande n'a pas pu être envoyée. (anti-bot)"));
        return { ok: false };
      }

      // too fast
      if (Number.isFinite(minTimeMs) && minTimeMs > 0 && timeOnPageMs < minTimeMs) {
        alert(css(antibot.timeMessage || "Merci de prendre quelques secondes avant d'envoyer le formulaire."));
        return { ok: false };
      }

      return { ok: true };
    }

    async function onSubmitClick() {
      if (!checkAntibotFront().ok) return;
      if (!validateRequiredFields()) return;

      const totals = computeProductTotals();
      const { priceCents, baseTotalCents, qty, variantId } = totals;

      const override = offerSubtotalOverrideCents();
      const subtotalBeforeDiscount = override != null ? override : baseTotalCents;

      const discountCents = computeDiscountCents(subtotalBeforeDiscount, qty);
      const discountedSubtotalCents = Math.max(0, subtotalBeforeDiscount - discountCents);

              const shippingCents = computeShippingCents(discountedSubtotalCents);
        const totalCents = discountedSubtotalCents + (shippingCents || 0); // subtotal + shipping
let recaptchaToken = null;
      let recaptchaVersion = "v2";

      recaptchaToken = await getRecaptchaToken(recaptchaCfg, root);

      // ✅ IMPORTANT: stop if enabled but token missing (avoid 403)
      if (recaptchaCfg?.enabled && !recaptchaToken) {
        alert("Veuillez cocher le reCAPTCHA (Je ne suis pas un robot).");
        return;
      }

      const activeOfferData = getActiveOfferData(rootId);

      const payload = {
        fields: buildFieldsPayload(), // ✅ ALL fields
        productId: root.getAttribute("data-product-id") || null,
        variantId,
        qty,
        priceCents,
        baseTotalCents,
        discountCents,
        shippingCents,
        totalCents,
        grandTotalCents: totalCents,
        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,
        offer: activeOfferData || null,
        upsells: getActiveUpsellsData(rootId) || null,
        recaptchaToken,
        recaptchaVersion,
        recaptchaAction: recaptchaCfg?.expectedAction || recaptchaCfg?.action || "tf_submit",
      };

      const formCard = root.querySelector('[data-tf-role="form-card"]');
      const btn = formCard ? formCard.querySelector('[data-tf-cta="1"]') : null;
      const originalHTML = btn ? btn.innerHTML : "";

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
          const ty = getThankYouConfig(cfg, offersCfg);
          const tyEnabled = !!ty && ty.enabled !== false;

          if (btn) {
            if (!tyEnabled) {
              btn.innerHTML = css(cfg.form?.successText || "Thanks! We'll contact you");
            } else {
              btn.innerHTML = originalHTML;
            }
          }

          try {
            handleThankYou(root, cfg, offersCfg, payload, json);
          } catch (e) {
            console.warn("[Tripleform COD] Thank you handler error:", e);
          }

          // ✅ reCAPTCHA v2: reset checkbox after successful submit
          if (recaptchaCfg && recaptchaCfg.enabled) resetRecaptchaV2(root);

          const reEnableMs = Number(ty?.reEnableMs || 1200);
          if (btn) setTimeout(() => { btn.disabled = false; }, Math.max(400, reEnableMs));
        } else {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
          }
          alert("Erreur: " + (json?.error || res.statusText || "Submit failed"));
        }
      } catch {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
        }
        alert("Erreur réseau. Réessaie.");
      }
    }

    /* behaviors inline/popup/drawer */
    let openHandler = null;

    if (styleType === "inline") {
      const btn = root.querySelector('[data-tf="cta-inline"]');
      if (btn) btn.onclick = onSubmitClick;
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
        launcher.onclick = (e) => { e.preventDefault(); openHandler(); };
      }

      if (popup && beh.closeOnOutside !== false) {
        popup.onclick = (e) => {
          if (e.target === popup) {
            popup.style.display = "none";
            document.body.style.overflow = "";
          }
        };
      }

      closeBtns.forEach((b) => (b.onclick = (e) => {
        e.preventDefault();
        if (!popup) return;
        popup.style.display = "none";
        document.body.style.overflow = "";
      }));

      if (popupCta) popupCta.onclick = onSubmitClick;
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
        drawer.style.transform = "translateX(0)";
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
        launcher.onclick = (e) => { e.preventDefault(); openDrawer(); };
      }

      if (overlay && beh.closeOnOutside !== false) {
        overlay.onclick = (e) => { if (e.target === overlay) closeDrawer(); };
      }

      closeBtns.forEach((b) => (b.onclick = (e) => { e.preventDefault(); closeDrawer(); }));
      if (drawerCta) drawerCta.onclick = onSubmitClick;
    }

    setupSticky(root, cfg, openHandler, motionClass);

    const delay = Number(beh.openDelayMs || 0);
    if (delay > 0 && styleType !== "inline" && typeof openHandler === "function") {
      setTimeout(() => openHandler(), delay);
    }

    updateMoney();
    return function handleTotalsChange() {
      updateMoney();
    };
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                              */
  /* ------------------------------------------------------------------ */
  function deriveSectionIdFromHolder(holder) {
    if (!holder) return "";
    const id = String(holder.id || "");
    const m = id.match(/^tripleform-cod-(.+)$/);
    if (m && m[1]) return String(m[1]);
    const ds = holder.getAttribute("data-section-id") || holder.getAttribute("data-tf-section-id");
    return ds ? String(ds) : "";
  }

  function findProductJsonEl(holder, sectionId) {
    if (holder) {
      const inside =
        holder.querySelector('script[id^="tf-product-json-"]') ||
        holder.querySelector('script[data-tf-product-json]') ||
        holder.querySelector('script[type="application/json"][data-product-json]') ||
        null;
      if (inside) return inside;
    }

    if (sectionId) {
      const byLegacy = byId(`tf-product-json-${sectionId}`);
      if (byLegacy) return byLegacy;
    }

    return document.querySelector('script[id^="tf-product-json-"]') || null;
  }

  function boot(sectionIdOrEl) {
    let holder = null;
    let sectionId = "";

    if (sectionIdOrEl && sectionIdOrEl.nodeType === 1) {
      holder = sectionIdOrEl;
      sectionId = deriveSectionIdFromHolder(holder);
    } else {
      sectionId = String(sectionIdOrEl || "");
      holder =
        byId(`tripleform-cod-${sectionId}`) ||
        document.querySelector(`.tripleform-cod[data-section-id="${sectionId}"]`) ||
        document.querySelector(".tripleform-cod");
    }

    if (!holder) return;

    if (holder.getAttribute("data-tf-booted") === "1") return;
    holder.setAttribute("data-tf-booted", "1");

    injectGlobalCSSOnce();

    const cfg = parseSettingsAttr(holder);
    const offersCfg = parseOffersAttr(holder);
      const geoCfg = (function () {
  const base = parseGeoAttr(holder) || {};
  // New theme-block attributes (preferred)
  const enabledAttr = holder.getAttribute("data-geo-enabled");
  if (enabledAttr != null) base.enabled = String(enabledAttr) === "true";

  const endpointAttr = holder.getAttribute("data-geo-endpoint");
  if (endpointAttr) base.endpoint = endpointAttr;

  const countryAttr = holder.getAttribute("data-geo-country") || holder.getAttribute("data-geo-country-code");
  if (countryAttr) base.country = countryAttr;

  // Backward-compat: allow config inside settings JSON (cfg.geo)
  try {
    if (cfg && cfg.geo && typeof cfg.geo === "object") {
      Object.assign(base, cfg.geo);
    }
  } catch (e) {}

  return Object.keys(base).length ? base : null;
})();
    // Shipping (GEO) remote calc state (used when data-geo-endpoint is provided)
    const geoEndpoint = (geoCfg && (geoCfg.endpoint || geoCfg.geoEndpoint)) || holder.getAttribute("data-geo-endpoint") || "";
    const geoCountryAttr = (geoCfg && geoCfg.country) || holder.getAttribute("data-geo-country") || holder.getAttribute("data-geo-country-code") || "";
    const __tfGeoRemote = { key: null, cents: null, pending: false, error: null };


    const currency = holder.getAttribute("data-currency") || "USD";
    const locale = holder.getAttribute("data-locale") || "en";
    const moneyFmt = fmtMoneyFactory(locale, currency);

    const recaptchaEnabledAttr = holder.getAttribute("data-recaptcha-enabled");
    const recaptchaEnabled =
      recaptchaEnabledAttr === "true" ||
      recaptchaEnabledAttr === "1" ||
      recaptchaEnabledAttr === "yes";

    const recaptchaSiteKey = holder.getAttribute("data-recaptcha-site-key") || "";

    const recaptchaV2Container =
      holder.getAttribute("data-recaptcha-v2-container") || '[data-tf-recaptcha-v2="1"]';
    const recaptchaV2Theme = holder.getAttribute("data-recaptcha-v2-theme") || "light";
    const recaptchaV2Size = holder.getAttribute("data-recaptcha-v2-size") || "normal";

    const recaptchaCfg = {
      enabled: recaptchaEnabled && !!recaptchaSiteKey,
      version: "v2",
      siteKey: recaptchaSiteKey,
      v2Container: recaptchaV2Container,
      v2Theme: recaptchaV2Theme,
      v2Size: recaptchaV2Size,
    };

    const prodEl = findProductJsonEl(holder, sectionId);
    if (!prodEl) {
      console.error("[Tripleform COD] product JSON introuvable");
      return;
    }

    const product = safeJsonParse(prodEl.textContent || "{}", { variants: [] });

    const getVariant = () => getSelectedVariantId() || holder.getAttribute("data-variant-id");

    const doUpdate = render(holder, cfg, offersCfg, geoCfg, product, getVariant, moneyFmt, recaptchaCfg);

    watchVariantAndQty(() => doUpdate(), holder);
  }

  function autoBootAll() {
    document.querySelectorAll(".tripleform-cod").forEach((el) => {
      try {
        boot(el);
      } catch (e) {
        console.warn("[Tripleform COD] autoBoot error:", e);
      }
    });
  }

  if (!window.__TripleformCOD_AutoBooted) {
    window.__TripleformCOD_AutoBooted = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoBootAll);
    } else {
      setTimeout(autoBootAll, 0);
    }
  }

  return { boot };
})();