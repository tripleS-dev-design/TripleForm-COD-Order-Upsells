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
   ========================================================================= */

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

  function fmtMoneyFactory(locale, currency) {
    const nf = new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: currency || "USD",
    });
    return (cents) => nf.format(Number(cents || 0) / 100);
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
      .tf-offer-icon{
        width:34px;height:34px;border-radius:12px;
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
  /* ✅ NO COUNTRY_DATA HERE (paste manually if you want)                */
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

  function getQty() {
    const q = document.querySelector('form[action^="/cart/add"] input[name="quantity"]');
    const v = Number(q && q.value ? q.value : NaN);
    if (v && v > 0) {
      __tfInternalQty = v;
      return v;
    }
    return Math.max(1, Number(__tfInternalQty || 1));
  }

  function setQty(nextQty) {
    const n = Math.max(1, Number(nextQty || 1));
    __tfInternalQty = n;

    const q = document.querySelector('form[action^="/cart/add"] input[name="quantity"]');
    if (q) {
      q.value = String(n);
      q.dispatchEvent(new Event("input", { bubbles: true }));
      q.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return true;
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
  /* Sticky button                                                      */
  /* ------------------------------------------------------------------ */
  function setupSticky(root, cfg, openHandler, motionClass) {
    const stickyType = cfg?.behavior?.stickyType || "none";
    const stickyLabel = css(cfg?.behavior?.stickyLabel || cfg?.uiTitles?.orderNow || "Order now");
    const stickyIcon = cfg?.behavior?.stickyIcon || "AppsIcon";

    const prev = document.querySelector(`[data-tf-sticky-for="${root.id}"]`);
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (stickyType === "none") return;

    const d = normalizeDesign(cfg.design || {});
    const bg = resolveButtonBackground(d);
    const text = d.btnText || "#FFFFFF";
    const br = resolveButtonBorder(d, bg);

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
    const isLeft = stickyType === "bubble-left";
    el.style.cssText = baseStyle + `${isLeft ? "left:16px;" : "right:16px;"}`;
    el.innerHTML = `
      <button type="button" data-tf-sticky-cta class="${motionClass}" style="
        border-radius:999px;
        border:1px solid ${br};
        background:${bg};
        color:${text};
        font-weight:800;
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

      const bundleQty = Number(offer.bundleQty || offer.minQty || offer.requiredQty || 0);
      if (bundleQty > 0) setQty(bundleQty);

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      button.innerHTML = `${getIconHtml("CheckCircleIcon", 16, "currentColor")} Activée`;

      const selectedPackQty = Number(button.getAttribute("data-tf-pack-qty") || 0) || bundleQty || 0;
      if (selectedPackQty > 0) setQty(selectedPackQty);

      setActiveOfferData(rootId, {
        index: offerIndex,
        type: "offer",
        title: offer.title || "",
        discountType: offer.discountType || null,
        discountValue: Number(offer.discountValue || 0),
        minQty: Number(selectedPackQty || offer.requiredQty || offer.bundleQty || offer.minQty || 1),
        applyPerItem: offer.applyPerItem === true,
        fixedMode: offer.fixedMode || null,
        capDiscount: offer.capDiscount !== false,
        maxDiscountCents: Number(offer.maxDiscountCents || 0),
        forceQty: offer.forceQty === true || !!selectedPackQty || !!offer.requiredQty || !!offer.bundleQty,
        bundleQty: Number(selectedPackQty || offer.requiredQty || offer.bundleQty || 0),
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
    return {
      cardBg: c.cardBg || "var(--tf-offer-bg,#FFFFFF)",
      borderColor: c.borderColor || "var(--tf-offer-border,#E5E7EB)",
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

  function buildOffersHtml(offersCfg, rootId) {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (global.enabled === false) return "";

    const globalColors = global.colors || {};
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    const activeOffers = offers.filter((o) => o && o.enabled !== false && o.showInPreview !== false);
    const activeUpsells = upsells.filter((u) => u && u.enabled !== false && u.showInPreview !== false);

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

      const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || 1);
      const packHint = minQty > 1 ? `Pack: ${minQty} pcs` : offer.subText || "";

      const packOptions = packOptionsForOffer(offer);
      const activePack = active && active.packQty && Number(active.index) === idx ? Number(active.packQty) : 0;

      html += `
        <div class="tf-offer-card" style="background:${css(c.cardBg)};border-color:${css(c.borderColor)}">
          <div class="tf-offer-row">
            <div class="tf-offer-icon" style="background:${css(c.iconBg)}">
              <span class="tf-offer-icon-fallback" style="color:${css(c.iconColor)}">
                ${getIconHtml("DiscountIcon", 18, "currentColor")}
              </span>
              ${iconUrl ? `<img src="${css(iconUrl)}" alt="" onerror="this.remove();" />` : ``}
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>
              ${packHint ? `<div class="tf-offer-sub">${css(packHint)}</div>` : ""}

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
              <span class="tf-offer-icon-fallback" style="color:${css(c.iconColor)}">
                ${getIconHtml("GiftCardIcon", 18, "currentColor")}
              </span>
              ${iconUrl ? `<img src="${css(iconUrl)}" alt="" onerror="this.remove();" />` : ``}
            </div>

            <div class="tf-offer-main">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>
            </div>

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
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  function render(root, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg) {
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
        ? getIconHtml(t.cartIcon, 18, css(d.cartTitleColor || "#111827"))
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
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        `<div style="height:6px"></div>` +
        formCardHTML("cta-inline", false) +
        mainEnd;
    } else if (styleType === "popup") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        `<div style="height:6px"></div>` +
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
                  ${offersHtml}
                  ${cartSummaryHTML()}
                  <div style="height:6px"></div>
                  ${formCardHTML("cta-popup", true)}
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
        offersHtml +
        cartSummaryHTML() +
        `<div style="height:6px"></div>` +
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
                  ${offersHtml}
                  ${cartSummaryHTML()}
                  <div style="height:6px"></div>
                  ${formCardHTML("cta-drawer", true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = html;

    setTimeout(() => initializeTimers(root, offersCfg), 80);
    setupLocationDropdowns(root, cfg, countryDef);

    /* --------------------- Field helpers --------------------------- */
    function getField(key) {
      return root.querySelector(`[data-tf-field="${key}"]`) || null;
    }
    function getVal(key) {
      const el = getField(key);
      return el ? String(el.value || "").trim() : "";
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
      const qty = getQty();
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

    function currentOffer() {
      const active = getActiveOfferData(root.id);
      if (!active || active.type !== "offer") return null;
      const idx = Number(active.index);
      const offer = activeOffersOnly[idx];
      return offer ? { active, offer, idx } : null;
    }

    function applyOfferQtyIfNeeded() {
      const x = currentOffer();
      if (!x) return;
      const q = Number(x.active.packQty || x.offer.bundleQty || x.offer.minQty || 0);
      if (q > 0 && getQty() !== q) setQty(q);
    }

    function computeDiscountCents(baseTotalCents, qty) {
      const x = currentOffer();
      if (!x) return 0;

      const { offer } = x;
      const discountType = offer.discountType || null;
      const discountValue = Number(offer.discountValue ?? 0);

      const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || 1);
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

    function updateMoney() {
      applyOfferQtyIfNeeded();

      const { priceCents, baseTotalCents, qty } = computeProductTotals();

      const override = offerSubtotalOverrideCents();
      const subtotalBeforeDiscount = override != null ? override : baseTotalCents;

      const discountCents = computeDiscountCents(subtotalBeforeDiscount, qty);
      const discountedSubtotalCents = Math.max(0, subtotalBeforeDiscount - discountCents);

      const shippingCents = 0;
      const grandTotalCents = discountedSubtotalCents + shippingCents;

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

      root.querySelectorAll('[data-tf="shipping"]').forEach((el) => (el.textContent = css(t.freeShipping || "Free")));
      root.querySelectorAll('[data-tf="shipping-note"]').forEach((el) => (el.textContent = ""));

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

        const minQty = Number(offer.minQty || offer.requiredQty || offer.bundleQty || 1);
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

      const pills = root.querySelectorAll("[data-tf-pack-pill]");
      pills.forEach((pill) => {
        pill.onclick = (e) => {
          e.preventDefault();
          const idx = Number(pill.getAttribute("data-tf-offer-index") || 0);
          const q = Number(pill.getAttribute("data-tf-pack-qty") || 0);
          if (!(q > 1)) return;

          setActiveOfferData(root.id, { index: idx, type: "offer", packQty: q });
          setQty(q);
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

      let recaptchaToken = null;
      let recaptchaVersion = recaptchaCfg?.version || null;

      if (recaptchaCfg?.enabled && recaptchaCfg.version === "v3" && recaptchaCfg.siteKey) {
        try {
          await ensureRecaptchaScript(recaptchaCfg);
          if (window.grecaptcha && window.grecaptcha.execute) {
            recaptchaToken = await window.grecaptcha.execute(recaptchaCfg.siteKey, { action: "submit_cod" });
          }
        } catch (e) {
          console.warn("[Tripleform COD] reCAPTCHA v3 error:", e);
        }
      }

      const activeOfferData = getActiveOfferData(root.id);

      const payload = {
        fields: buildFieldsPayload(), // ✅ ALL fields
        productId: root.getAttribute("data-product-id") || null,
        variantId,
        qty,
        priceCents,
        baseTotalCents,
        discountCents,
        shippingCents: 0,
        totalCents: discountedSubtotalCents,
        grandTotalCents: discountedSubtotalCents,
        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,
        offer: activeOfferData || null,
        recaptchaToken,
        recaptchaVersion,
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

    const prodEl = findProductJsonEl(holder, sectionId);
    if (!prodEl) {
      console.error("[Tripleform COD] product JSON introuvable");
      return;
    }

    const product = safeJsonParse(prodEl.textContent || "{}", { variants: [] });

    const getVariant = () => getSelectedVariantId() || holder.getAttribute("data-variant-id");

    const doUpdate = render(holder, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg);

    watchVariantAndQty(() => doUpdate());
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
