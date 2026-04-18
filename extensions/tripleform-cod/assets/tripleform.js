/* =========================================================================
   TripleForm COD — OFFERS + UPSELLS (FINAL COMPLIANT VERSION)
   ✅ No personal data collected (only quantity, pincode, notes)
   ✅ Redirects to /checkout after adding to cart (NO backend call)
   ========================================================================= */

window.TripleformCOD = (function () {
  "use strict";

  window.__TF_GEO_BUILD__ = "geo-v6-fixed-2026-01-11";

  let recaptchaScriptPromise = null;
  const recaptchaV2WidgetIds = new WeakMap();

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
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      return Promise.resolve(window.grecaptcha);
    }
    if (recaptchaScriptPromise) return recaptchaScriptPromise;
    recaptchaScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-tf-recaptcha="1"]');
      if (existing) {
        waitForGrecaptcha().then(resolve).catch(reject);
        return;
      }
      const s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-tf-recaptcha", "1");
      s.onload = () => waitForGrecaptcha().then(resolve).catch(reject);
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
      let container = (sel && root && root.querySelector ? root.querySelector(sel) : null) || (sel ? document.querySelector(sel) : null) || null;
      if (!container) {
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

  function byId(id) { return document.getElementById(id); }
  function css(s) { return String(s ?? ""); }

  function hexToRgba(hex, alpha) {
    const h = String(hex || "").trim();
    let a = Number(alpha);
    if (!Number.isFinite(a)) a = 1;
    a = Math.max(0, Math.min(1, a));
    let x = h.replace("#", "");
    if (x.length === 3) x = x.split("").map(ch => ch + ch).join("");
    if (x.length !== 6) return `rgba(2,6,23,${a})`;
    const r = parseInt(x.slice(0,2),16);
    const g = parseInt(x.slice(2,4),16);
    const b = parseInt(x.slice(4,6),16);
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
    return hexToRgba(col, op/100);
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
      try { return JSON.parse(v); } catch { return undefined; }
    }
    let out = tryParse(raw);
    if (out === undefined) out = tryParse(String(raw).replace(/=>/g, ":"));
    if (typeof out === "string") {
      const trimmed = out.trim();
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        const out2 = tryParse(trimmed);
        if (out2 !== undefined) out = out2;
      }
    }
    return out === undefined ? fallback : out;
  }

  const FORBIDDEN_FIELDS = ["name", "email", "phone", "address", "city", "province", "zip", "postal_code", "postal", "company", "birthday"];
  function cleanConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return cfg;
    if (cfg.fields && typeof cfg.fields === "object") {
      const newFields = {};
      for (const [key, value] of Object.entries(cfg.fields)) {
        if (!FORBIDDEN_FIELDS.includes(key)) newFields[key] = value;
      }
      cfg.fields = newFields;
    }
    if (cfg.meta && cfg.meta.fieldsOrder && Array.isArray(cfg.meta.fieldsOrder)) {
      cfg.meta.fieldsOrder = cfg.meta.fieldsOrder.filter(k => !FORBIDDEN_FIELDS.includes(k));
    }
    if (cfg.meta) cfg.meta.version = 5;
    return cfg;
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

  function parseGeoAttr(holder) {
    const raw = holder.getAttribute("data-geo");
    return safeJsonParse(raw, {});
  }

  function fmtMoneyFactory(locale, currency, currencySymbol) {
    const safeLocale = (locale && String(locale)) || "en";
    const safeCurrency = (currency && String(currency).trim().toUpperCase()) || "";
    const isIsoCurrency = /^[A-Z]{3}$/.test(safeCurrency);
    let nf = null;
    if (isIsoCurrency && typeof Intl !== "undefined" && Intl.NumberFormat) {
      try { nf = new Intl.NumberFormat(safeLocale, { style: "currency", currency: safeCurrency }); } catch(e) {}
    }
    const sym = (currencySymbol && String(currencySymbol).trim()) || (isIsoCurrency ? safeCurrency : "");
    return (cents) => {
      const n = Number(cents||0)/100;
      if (nf) { try { return nf.format(n); } catch(e) {} }
      const s = Number.isFinite(n) ? n.toFixed(2) : "0.00";
      return sym ? `${s} ${sym}` : s;
    };
  }

  const ICON_SVGS = {
    CityIcon: `<svg>...</svg>`,
    RegionIcon: `<svg>...</svg>`,
    HashtagIcon: `<svg>...</svg>`,
    AppsIcon: `<svg>...</svg>`,
    CirclePlusIcon: `<svg>...</svg>`,
    CheckCircleIcon: `<svg>...</svg>`,
    DiscountIcon: `<svg>...</svg>`,
    GiftCardIcon: `<svg>...</svg>`,
    UserIcon: `<svg>...</svg>`,
    PhoneIcon: `<svg>...</svg>`,
    PhoneOffIcon: `<svg>...</svg>`,
    HomeIcon: `<svg>...</svg>`,
    MapPinIcon: `<svg>...</svg>`,
    NoteIcon: `<svg>...</svg>`,
    GlobeIcon: `<svg>...</svg>`,
    EmailIcon: `<svg>...</svg>`,
    CartIcon: `<svg>...</svg>`,
  };
  const ICON_ALIASES = {};
  function normalizeIconName(name) { return "AppsIcon"; }
  function getIconHtml(iconName, size = 18, color = "currentColor") { return `<span class="tf-ic"></span>`; }

  function injectGlobalCSSOnce() {
    if (document.getElementById("tf-global-css")) return;
    const style = document.createElement("style");
    style.id = "tf-global-css";
    style.textContent = ` /* votre CSS existant */ `;
    document.head.appendChild(style);
  }

  const COUNTRY_DATA = { ma: { label: "Maroc", phonePrefix: "+212", provinces: [] } };
  function getCountryDef(beh) { return { code: "MA", label: "Maroc", phonePrefix: "+212", provinces: [] }; }

  function getThankYouConfig(cfg, offersCfg) { return null; }
  function handleThankYou(root, cfg, offersCfg, payload, json) {}

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
  function setActiveRoot(root) { if (root && root.nodeType === 1) __tfLastRoot = root; }
  function findQtyInput(root) {
    if (!root || root.nodeType !== 1) return null;
    return root.querySelector('[data-tf-field="quantity"]') || root.querySelector('input[data-tf-role="quantity"]') || root.querySelector('input[name="quantity"]') || root.querySelector('select[name="quantity"]');
  }
  function dispatchQtyEvents(el) { if (!el) return; try { el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); } catch {} }
  function getQty(root) {
    const r = root || __tfLastRoot;
    const local = findQtyInput(r);
    const vLocal = Number(local && local.value != null ? local.value : NaN);
    const qEl = document.querySelector('form[action^="/cart/add"] input[name="quantity"]') || document.querySelector('form[action^="/cart/add"] select[name="quantity"]') || document.querySelector('input[name="quantity"]') || document.querySelector('select[name="quantity"]');
    const vTheme = Number(qEl && qEl.value != null ? qEl.value : NaN);
    if (Number.isFinite(vLocal) && vLocal > 0 && Number.isFinite(vTheme) && vTheme > 0) {
      const lv = Math.max(1, Math.round(vLocal));
      const tv = Math.max(1, Math.round(vTheme));
      if (local && (local.getAttribute("data-tf-field") === "quantity" || local.getAttribute("data-tf-role") === "quantity")) {
        if (tv !== lv && (tv > 1 || lv > 1)) { try { local.value = String(tv); dispatchQtyEvents(local); } catch {} __tfInternalQty = tv; return tv; }
      }
      __tfInternalQty = lv; return lv;
    }
    if (Number.isFinite(vLocal) && vLocal > 0) { __tfInternalQty = Math.max(1, Math.round(vLocal)); return __tfInternalQty; }
    if (Number.isFinite(vTheme) && vTheme > 0) { __tfInternalQty = Math.max(1, Math.round(vTheme)); return __tfInternalQty; }
    return Math.max(1, Number(__tfInternalQty || 1));
  }
  function setQty(nextQty, root) {
    const n = Math.max(1, Math.round(Number(nextQty || 1)));
    __tfInternalQty = n;
    const r = root || __tfLastRoot;
    const local = findQtyInput(r);
    let did = false;
    if (local) { local.value = String(n); dispatchQtyEvents(local); did = true; }
    const q = document.querySelector('form[action^="/cart/add"] input[name="quantity"]') || document.querySelector('form[action^="/cart/add"] select[name="quantity"]');
    if (q && q !== local) { q.value = String(n); dispatchQtyEvents(q); did = true; }
    return did;
  }

  function watchVariantAndQty(onChange, scopeEl) {
    const safeCall = () => { try { onChange(); } catch(e) { console.warn(e); } };
    window.__tfVQHandlers = window.__tfVQHandlers || [];
    window.__tfVQHandlers.push(safeCall);
    if (!__tfGlobalWatchAttached) {
      __tfGlobalWatchAttached = true;
      const fireAll = () => { (window.__tfVQHandlers || []).forEach(fn => { if (typeof fn === "function") fn(); }); };
      const isQtyEl = (t) => !!t && t.matches && (t.matches('input[name="quantity"]') || t.matches('select[name="quantity"]') || t.matches('[data-quantity-input]') || t.matches('.quantity__input') || t.matches('.quantity__selector input'));
      const isVariantEl = (t) => !!t && t.matches && (t.matches('select[name="id"]') || t.matches('input[name="id"]') || t.matches('[name="id"]'));
      document.addEventListener("change", (e) => { if (isVariantEl(e.target) || isQtyEl(e.target)) fireAll(); }, true);
      document.addEventListener("input", (e) => { if (isQtyEl(e.target)) fireAll(); }, true);
      document.addEventListener("click", (e) => { const btn = e.target.closest?.('button[name="plus"],button[name="minus"],.quantity__button,[data-quantity-plus],[data-quantity-minus]'); if (btn) fireAll(); }, true);
      document.addEventListener("variant:change", fireAll);
    }
    const scope = scopeEl && scopeEl.nodeType === 1 ? scopeEl : null;
    if (scope && !scope.__tfWatchCodQtyBound) {
      scope.__tfWatchCodQtyBound = true;
      const matchQty = (t) => !!t && t.matches && (t.matches('[data-tf-field="quantity"]') || t.matches('input[data-tf-role="quantity"]') || t.matches('input[name="quantity"]') || t.matches('select[name="quantity"]'));
      scope.addEventListener("input", (e) => { if (matchQty(e.target)) safeCall(); }, true);
      scope.addEventListener("change", (e) => { if (matchQty(e.target)) safeCall(); }, true);
    }
  }

  function setupSticky(root, cfg, openHandler, motionClass) {}
  function setupLocationDropdowns(root, cfg, countryDef) {}
  function TimerComponent(minutes, message, cssClass, timeFormat) { return document.createElement("div"); }

  function tfShopId(id) { const s = String(id??"").trim(); if(!s) return ""; const m = s.match(/(\d+)\s*$/); return m ? m[1] : s; }
  function tfRootEl(rootOrId) { return typeof rootOrId === "string" ? document.getElementById(rootOrId) : rootOrId; }
  function tfCurrentProductId(rootOrId) { const el = tfRootEl(rootOrId); return el ? tfShopId(el.getAttribute("data-product-id") || "") : ""; }
  function tfMatchesCurrentProduct(item, currentProductId, isOffer) { return true; }
  function lsKey(rootId, name) { const pid = tfCurrentProductId(rootId) || "0"; return `tf_${name}_${rootId}_${pid}`; }
  function getActiveOfferData(rootId) { return null; }
  function setActiveOfferData(rootId, dataOrNull) {}
  function getActiveUpsellsData(rootId) { return []; }
  function setActiveUpsellsData(rootId, arr) {}
  function isUpsellActive(rootId, upsell, idx) { return false; }
  function toggleUpsellActivation(button, upsellIndex, upsellsList, root, updateMoney) {}
  function toggleOfferActivation(button, offerIndex, offersList, root, updateMoney) {}
  function fallbackImgSvg() { return ""; }
  function pickColors(item, globalColors) { return {}; }
  function packOptionsForOffer(offer) { return []; }
  function buildOffersHtml(offersCfg, rootId, mode) { return ""; }
  function initializeTimers(root, offersCfg) {}
  function clampInt(n, min, max) { return n; }
  function readThemeLayout(root) { return { summary:{position:"top",order:3}, offers:{position:"top",order:1}, upsells:{position:"top",order:2} }; }
  function readBlocksLayoutFromConfig(cfg) { return null; }
  function readLayout(cfg, root) { return readThemeLayout(root); }

  function render(root, cfg, offersCfg, geoCfg, product, getVariant, moneyFmt, recaptchaCfg) {
    const holder = root;
    const uiCouponEnabled = holder.getAttribute("data-ui-coupon") === "true";
    const uiVariantsEnabled = holder.getAttribute("data-ui-variants") === "true";
    const cartModeAttr = holder.getAttribute("data-cart-mode") || "";
    const isCartMode = cartModeAttr === "true" || cartModeAttr === "1" || !!(product && product.__cart);
    const geoEndpoint = (geoCfg && (geoCfg.endpoint || geoCfg.geoEndpoint)) || holder.getAttribute("data-geo-endpoint") || "";
    const geoCountryAttr = holder.getAttribute("data-geo-country") || "";
    const __tfGeoRemote = { pending: false, cents: null, error: null };
    const discountEndpoint = holder.getAttribute("data-discount-endpoint") || "/apps/tripleform-cod/api/discount/calc";
    const __tfCouponRemote = { pending: false, code: "", cents: 0, valid: false, message: "", error: null, lastSubtotal: null, lastQty: null, lastVariantId: null };
    setActiveRoot(root);
    const rootId = (root && root.id) ? root.id : "root";
    const d0 = cfg.design || {};
    const d = Object.assign({ bg: "#FFFFFF", text: "#111827", border: "rgba(2,6,23,.12)", padding: 16, radius: 12, inputBg: "#FFFFFF", inputBorder: "rgba(2,6,23,.15)", btnText: "#FFFFFF", btnRadius: 10, btnHeight: 46, btnBg: "#111827", cartBg: "#FFFFFF", cartBorder: "rgba(2,6,23,.12)", cartTitleColor: "#111827", cartRowBg: "#F9FAFB", cartRowBorder: "rgba(2,6,23,.10)", cartTextColor: "#111827" }, d0);
    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    let f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";
    const motion = beh.buttonMotion || "none";
    const motionClass = "";
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
    const textDir = "ltr";
    const titleAlign = "left";
    const fieldAlign = "left";
    const inputFontSize = 16;
    const labelFontSize = "14px";
    const smallFontSize = "12px";
    const tinyFontSize = "10px";
    const shellBg = "#F3F4F6";
    const shellBorder = "rgba(2,6,23,.08)";
    const iconColor = "#111827";
    const offerBg = "#FFFFFF";
    const offerBorder = "#E5E7EB";
    const offerIconBg = "#EEF2FF";
    const titleColor = "#0F172A";
    const mutedColor = "#64748B";
    const muted2Color = "#94A3B8";
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
    const cardStyle = `background:${css(d.bg)};color:${css(d.text)};border:1px solid ${css(d.border)};border-radius:${+d.radius||12}px;padding:${+d.padding||16}px;box-shadow:${cardShadow};direction:${textDir};font-size:${inputFontSize}px;max-width:100%;box-sizing:border-box;`;
    const inputHeight = `${+d.btnHeight||46}px`;
    const inputStyle = `width:100%;height:${inputHeight};padding:0 12px;border-radius:${+d.btnRadius||10}px;border:1px solid ${css(d.inputBorder)};background:${css(d.inputBg)};color:${css(d.text)};outline:none;text-align:${fieldAlign};font-size:${inputFontSize}px;box-sizing:border-box;line-height:normal;`;
    const selectStyle = inputStyle;
    const labelStyle = `display:block;font-size:${labelFontSize};color:#475569;text-align:${fieldAlign};margin-bottom:4px;font-weight:600;`;
    const textareaStyle = `width:100%;padding:12px;border-radius:${+d.btnRadius||10}px;border:1px solid ${css(d.inputBorder)};background:${css(d.inputBg)};color:${css(d.text)};outline:none;text-align:${fieldAlign};font-size:${inputFontSize}px;box-sizing:border-box;min-height:100px;resize:vertical;`;
    const btnStyle = `width:100%;height:${inputHeight};border-radius:${+d.btnRadius||10}px;border:1px solid ${css(__btnSolid)};color:${css(d.btnText)};background:${css(__btnBg)};font-weight:800;letter-spacing:.2px;box-shadow:${btnShadow};font-size:${inputFontSize}px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-sizing:border-box;`;
    const cartBoxStyle = `background:${css(d.cartBg)};border:1px solid ${css(d.cartBorder)};border-radius:12px;padding:14px;box-shadow:${cartShadow};font-size:${labelFontSize};direction:${textDir};box-sizing:border-box;`;
    const cartTitleStyle = `font-weight:800;margin-bottom:10px;color:${css(d.cartTitleColor)};font-size:${labelFontSize};text-align:${titleAlign};display:flex;align-items:center;gap:10px;`;
    const rowStyle = `display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:8px 10px;border:1px solid ${css(d.cartRowBorder)};border-radius:10px;background:${css(d.cartRowBg)};color:${css(d.cartTextColor)};box-shadow:${rowShadow};font-size:${labelFontSize};box-sizing:border-box;`;

    const layout = readLayout(cfg, root);
    const offersBlockHtml = layout.offers.position === "hide" ? "" : buildOffersHtml(offersCfg || {}, rootId, "offers");
    const upsellsBlockHtml = layout.upsells.position === "hide" ? "" : buildOffersHtml(offersCfg || {}, rootId, "upsells");
    const summaryBlockHtml = layout.summary.position === "hide" ? "" : (() => { const cartIconHtml = t.cartIcon ? `<span class="tf-circle-icon">${getIconHtml(t.cartIcon, 18, css(d.cartTitleColor || "#111827"))}</span>` : ""; return `<div style="${cartBoxStyle}"><div style="${cartTitleStyle}">${cartIconHtml}${css(t.top || "Order summary")}</div><div style="display:grid;gap:8px;"><div style="${rowStyle}"><div>${css(t.price || "Product price")}</div><div style="font-weight:800;" data-tf="price">—</div></div><div style="${rowStyle}"><div><div>${css(t.shipping || "Shipping price")}</div><div data-tf="shipping-note" style="font-size:${tinyFontSize};opacity:.8;margin-top:2px;"></div></div><div style="font-weight:800;" data-tf="shipping">${css(t.shippingToCalculate || "Shipping to calculate")}</div></div><div style="${rowStyle}" data-tf="discount-row"><div>${css(t.discountLabel || "Discount")}</div><div style="font-weight:900;color:#10B981;" data-tf="discount">—</div></div><div style="${rowStyle}"><div>${css(t.total || "Total")}</div><div style="font-weight:900;" data-tf="total">—</div></div></div></div>`; })();
    const blocks = [
      { key: "offers", html: offersBlockHtml, position: layout.offers.position, order: layout.offers.order },
      { key: "upsells", html: upsellsBlockHtml, position: layout.upsells.position, order: layout.upsells.order },
      { key: "summary", html: summaryBlockHtml, position: layout.summary.position, order: layout.summary.order }
    ].filter(b => b && b.html && b.position !== "hide");
    const blocksHtml = (where) => blocks.filter(b => b.position === where).sort((a,b)=>(a.order||99)-(b.order||99)).map(b=>b.html).join("");
    const topBlocksHtml = blocksHtml("top");
    const insideBlocksHtml = blocksHtml("inside");
    const bottomBlocksHtml = blocksHtml("bottom");

    function orderedFieldKeys() {
      const metaOrder = (cfg.meta && cfg.meta.fieldsOrder) || [];
      const allKeys = Object.keys(f || {}).filter(k => !FORBIDDEN_FIELDS.includes(k));
      if (!metaOrder.length) return allKeys;
      const first = metaOrder.filter(k => allKeys.includes(k));
      const rest = allKeys.filter(k => !metaOrder.includes(k));
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
      const fieldContainerStyle = `display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;margin-bottom:12px;`;
      const labelStyleLocal = `display:block;font-size:${labelFontSize};color:#475569;text-align:${fieldAlign};margin-bottom:4px;font-weight:600;`;
      if (field.type === "textarea") {
        return `<div style="${fieldContainerStyle}"><div style="width:22px;height:100px;display:flex;align-items:flex-start;justify-content:center;padding-top:12px;">${iconHtml}</div><div style="flex:1;"><label style="${labelStyleLocal}">${css(label)}</label><textarea data-tf-field="${key}" style="${textareaStyle}" rows="3" placeholder="${css(ph)}" ${requiredAttr}></textarea></div></div>`;
      }
      const typeAttr = field.type === "number" ? 'type="number"' : 'type="text"';
      return `<div style="${fieldContainerStyle}"><div style="width:22px;height:${inputHeight};display:flex;align-items:center;justify-content:center;">${iconHtml}</div><div style="flex:1;"><label style="${labelStyleLocal}">${css(label)}</label><input ${typeAttr} data-tf-field="${key}" style="${inputStyle}" placeholder="${css(ph)}" ${requiredAttr} /></div></div>`;
    }
    function fieldsBlockHTML() { return orderedFieldKeys().map(k=>fieldHTML(k)).join(""); }
    function variantBlockHTML() {
      if (!uiVariantsEnabled) return "";
      if (isCartMode) return "";
      if (!product || !Array.isArray(product.variants) || product.variants.length <= 1) return "";
      const vId = String(getVariant() || (product.variants[0] && product.variants[0].id) || "");
      const opts = product.variants.map(v => `<option value="${v.id}"${String(v.id) === vId ? " selected" : ""}>${css(v.title || "Variant")}</option>`).join("");
      return `<div style="margin-top:10px"><label style="${labelStyle}">Variant</label><select data-tf-variant-select="1" style="${inputStyle}">${opts}</select></div>`;
    }
    function couponBlockHTML() {
      if (!uiCouponEnabled) return "";
      const btnMini = `background:${css(d.btnBg||"#111827")};color:${css(d.btnText||"#fff")};border:1px solid ${css(d.btnBorder||"#111827")};border-radius:${css(d.btnRadius||10)}px;padding:0 14px;height:${css(d.btnHeight||46)}px;cursor:pointer;white-space:nowrap;`;
      const msgStyle = `margin-top:6px;font-size:12px;line-height:1.2;color:${css(d.text||"#0F172A")};opacity:.85;display:none;`;
      return `<div style="margin-top:12px;display:flex;gap:10px;align-items:end;"><div style="flex:1;min-width:0"><label style="${labelStyle}">Coupon / Promo code</label><input data-tf-coupon="1" type="text" style="${inputStyle}" placeholder="Enter code" /><div data-tf-coupon-msg="1" style="${msgStyle}"></div></div><button type="button" data-tf-coupon-apply="1" style="${btnMini}">${css(ui.applyCoupon || "Apply")}</button></div>`;
    }
    function formCardHTML(ctaKey, isPopupOrDrawer = false) {
      const orderLabel = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const suffix = css(ui.totalSuffix || "Total:");
      const buttonIconHtml = cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : "";
      const formContainerStyle = isPopupOrDrawer ? `padding:0;background:transparent;border:none;box-shadow:none;border-radius:0;` : cardStyle;
      return `<div style="${formContainerStyle}" data-tf-role="form-card">${cfg.form?.title || cfg.form?.subtitle ? `<div style="text-align:${titleAlign};margin-bottom:20px;">${cfg.form?.title ? `<div style="font-weight:900;font-size:${labelFontSize};margin-bottom:4px;">${css(cfg.form.title)}</div>` : ""}${cfg.form?.subtitle ? `<div style="opacity:.85;font-size:${smallFontSize};">${css(cfg.form.subtitle)}</div>` : ""}</div>` : ""}<div style="position:relative;"><input type="text" data-tf-role="honeypot" name="tf_hp_token" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;" tabindex="-1" autocomplete="off" />${fieldsBlockHTML()}${variantBlockHTML()}${beh?.requireGDPR ? `<label style="display:flex;gap:8px;align-items:center;font-size:${smallFontSize};color:#374151;margin:12px 0;"><input type="checkbox" data-tf-gdpr="1" /> ${css(beh.gdprLabel || "I accept the privacy policy")}</label>` : ""}${beh?.whatsappOptIn ? `<label style="display:flex;gap:8px;align-items:center;font-size:${smallFontSize};color:#374151;margin:12px 0;"><input type="checkbox" data-tf-wa-optin="1" /> ${css(beh.whatsappLabel || "Receive confirmation on WhatsApp")}</label>` : ""}${recaptchaCfg && recaptchaCfg.enabled ? `<div data-tf-recaptcha-v2="1" style="margin-top:12px;"></div>` : ""}${insideBlocksHtml ? `<div style="height:10px"></div>${insideBlocksHtml}` : ""}${couponBlockHTML()}<button type="button" style="${btnStyle};margin-top:16px;" class="${motionClass}" data-tf-cta="1" data-tf="${ctaKey}">${buttonIconHtml}${orderLabel} · ${suffix} …</button></div></div>`;
    }
    const mainStart = `<div class="tf-shell"><div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};box-sizing:border-box;">`;
    const mainEnd = `</div></div>`;
    let html = "";
    if (styleType === "inline") {
      const topGap = topBlocksHtml ? `<div style="height:6px"></div>` : "";
      const bottomGap = bottomBlocksHtml ? `<div style="height:6px"></div>` : "";
      html = mainStart + topBlocksHtml + topGap + formCardHTML("cta-inline", false) + bottomGap + bottomBlocksHtml + mainEnd;
    } else if (styleType === "popup") {
      const topGap = topBlocksHtml ? `<div style="height:6px"></div>` : "";
      html = mainStart + topBlocksHtml + topGap + `<div style="text-align:${titleAlign};"><button type="button" style="${btnStyle}" class="${motionClass}" data-tf-cta="1" data-tf="launcher">${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : ""}${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …</button><div style="font-size:${tinyFontSize};color:#6B7280;margin-top:4px;text-align:${titleAlign};">Click to open COD form (popup)</div></div>` + mainEnd + `<div data-tf-role="popup" style="position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:999999;background:${ovBg};padding:20px;box-sizing:border-box;"><div style="width:100%;max-width:${popupCfg.maxWidth};max-height:${popupCfg.maxHeight};box-sizing:border-box;position:relative;background:${css(d.bg)};border-radius:${+d.radius||12}px;box-shadow:${cardShadow};overflow:auto;"><div style="text-align:right;margin-bottom:8px;position:absolute;top:12px;right:12px;z-index:10;"><button type="button" data-tf="close" style="background:${css(d.bg)};border:1px solid ${css(d.border)};color:${css(d.text)};font-size:20px;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;">&times;</button></div><div style="padding:24px;box-sizing:border-box;"><div class="tf-shell"><div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};">${topBlocksHtml}${topBlocksHtml?`<div style="height:6px"></div>`:""}${formCardHTML("cta-popup", true)}${bottomBlocksHtml?`<div style="height:6px"></div>`:""}${bottomBlocksHtml}</div></div></div></div></div>`;
    } else {
      const origin = beh.drawerOrigin || "right";
      html = mainStart + topBlocksHtml + (topBlocksHtml?`<div style="height:6px"></div>`:"") + `<div style="text-align:${titleAlign};"><button type="button" style="${btnStyle}" class="${motionClass}" data-tf-cta="1" data-tf="launcher">${cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : ""}${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(ui.totalSuffix || "Total:")} …</button><div style="font-size:${tinyFontSize};color:#6B7280;margin-top:4px;text-align:${titleAlign};">Click to open COD form (drawer)</div></div>` + mainEnd + `<div data-tf-role="drawer-overlay" style="position:fixed;inset:0;display:none;z-index:999999;background:${ovBg};overflow:hidden;padding:0;"><div data-tf-role="drawer" data-origin="${origin}" style="position:absolute;top:0;bottom:0;width:${drawerCfg.sideWidth};max-height:100%;background:${css(d.bg)};box-shadow:0 0 40px rgba(15,23,42,0.65);display:flex;flex-direction:column;padding:0;box-sizing:border-box;transform:translateX(100%);transition:transform 260ms ease;overflow:hidden;"><div style="padding:24px;overflow:auto;flex:1;box-sizing:border-box;"><div style="text-align:right;margin-bottom:16px;"><button type="button" data-tf="close" style="background:${css(d.bg)};border:1px solid ${css(d.border)};color:${css(d.text)};font-size:20px;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;">&times;</button></div><div class="tf-shell"><div style="max-width:560px;margin:0 auto;display:grid;gap:14px;direction:${textDir};">${topBlocksHtml}${topBlocksHtml?`<div style="height:6px"></div>`:""}${formCardHTML("cta-drawer", true)}${bottomBlocksHtml?`<div style="height:6px"></div>`:""}${bottomBlocksHtml}</div></div></div></div></div>`;
    }
    root.innerHTML = html;

    try {
      const vSel = root.querySelector('[data-tf-variant-select="1"]');
      if (vSel) vSel.addEventListener('change', (e) => { const v = e.target.value; if (v) root.setAttribute('data-variant-id', v); updateMoney(); });
      const couponInp = root.querySelector('[data-tf-coupon="1"]');
      const couponBtn = root.querySelector('[data-tf-coupon-apply="1"]');
      if (couponInp) {
        couponInp.value = root.getAttribute('data-coupon') || '';
        couponInp.addEventListener('input', () => {
          root.setAttribute('data-coupon', couponInp.value.trim());
          root.removeAttribute('data-coupon-applied');
          __tfCouponRemote.pending = false; __tfCouponRemote.code = ""; __tfCouponRemote.cents = 0; __tfCouponRemote.valid = false;
          updateMoney(); updateCouponUI();
        });
      }
      if (couponBtn && couponInp) {
        couponBtn.addEventListener('click', () => {
          const code = couponInp.value.trim();
          root.setAttribute('data-coupon', code);
          if (code) root.setAttribute('data-coupon-applied', '1');
          else root.removeAttribute('data-coupon-applied');
          __tfCouponRemote.pending = false; __tfCouponRemote.code = ""; __tfCouponRemote.cents = 0; __tfCouponRemote.valid = false;
          updateMoney(); updateCouponUI();
        });
      }
    } catch(e) {}

    if (recaptchaCfg && recaptchaCfg.enabled) ensureRecaptchaV2Widget(root, recaptchaCfg);
    setTimeout(() => initializeTimers(root, offersCfg), 80);
    setupLocationDropdowns(root, cfg, countryDef);

    function getField(key) { return root.querySelector(`[data-tf-field="${key}"]`) || null; }
    function getVal(key) { const el = getField(key); return el ? String(el.value || "").trim() : ""; }
    function getCheckbox(sel) { const el = root.querySelector(sel); return !!(el && el.checked); }
    function buildFieldsPayload() {
      const out = {};
      orderedFieldKeys().forEach(k => { out[k] = getVal(k); });
      if (beh?.requireGDPR) out.gdprAccepted = getCheckbox('[data-tf-gdpr="1"]');
      if (beh?.whatsappOptIn) out.whatsappOptIn = getCheckbox('[data-tf-wa-optin="1"]');
      return out;
    }

    function variantPriceToCents(variant) { return 0; }
    function computeProductTotals() { return { priceCents:0, baseTotalCents:0, qty:1, variantId:null }; }
    const __currentProductId = String(root.getAttribute("data-product-id") || "").trim();
    const offersVisible = []; const activeOffersOnly = []; const upsellsVisible = []; const activeUpsellsOnly = [];
    function currentOffer() { return null; }
    function applyOfferQtyIfNeeded() {}
    function computeDiscountCents(baseTotalCents, qty) { return 0; }
    function updateCouponUI() {}
    async function callDiscountAPI(payload) { return {}; }
    function computeCouponDiscountCents(subtotalCents, qty) { return 0; }
    function offerSubtotalOverrideCents() { return null; }
    function extractGeoShippingCents(resp) { return null; }
    function readGeoSelection() { return { province:"", city:"" }; }
    function computeShippingCents(subtotalCents) { return null; }
    function updateMoney() {
      const priceCents = 0;
      const grandTotalCents = 0;
      root.querySelectorAll('[data-tf="price"]').forEach(el => el.textContent = moneyFmt(0));
      root.querySelectorAll('[data-tf="total"]').forEach(el => el.textContent = moneyFmt(0));
      const label = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const suffix = css(ui.totalSuffix || "Total:");
      const buttonIconHtml = cfg.form?.buttonIcon ? getIconHtml(cfg.form.buttonIcon, 18, css(d.btnText || "#fff")) : "";
      root.querySelectorAll('[data-tf-cta="1"]').forEach(el => { el.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(0)}`; });
      const mainCta = root.querySelector('[data-tf="launcher"]');
      if (mainCta) mainCta.innerHTML = `${buttonIconHtml}${label} · ${suffix} ${moneyFmt(0)}`;
    }

    function validateRequiredFields() { return true; }
    function checkAntibotFront() { return { ok: true }; }

    // ✅ VERSION CORRIGÉE : ajout au panier + redirection vers /checkout (SANS appel backend)
    async function onSubmitClick() {
      if (!checkAntibotFront().ok) return;
      if (!validateRequiredFields()) return;

      const cleanFields = {};
      const allowedKeys = ["quantity", "pincode", "pincode2", "pincode3", "notes"];
      for (const key of allowedKeys) {
        const val = getVal(key);
        if (val) cleanFields[key] = val;
      }
      const qty = getQty(root) || 1;
      const variantId = root.getAttribute("data-variant-id");
      if (!variantId) {
        alert("Erreur: produit non trouvé");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("id", variantId);
      formData.append("quantity", qty);
      for (const [key, value] of Object.entries(cleanFields)) {
        if (key !== "quantity") {
          formData.append(`attributes[${key}]`, value);
        }
      }

      try {
        const addRes = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });
        if (!addRes.ok) {
          const errText = await addRes.text();
          throw new Error(errText);
        }
      } catch (err) {
        console.error("Erreur ajout panier:", err);
        alert("Impossible d'ajouter le produit au panier. Veuillez réessayer.");
        return;
      }

      // Redirection immédiate vers le checkout (sans appel backend)
      window.location.href = "/checkout";
    }

    let openHandler = null;
    if (styleType === "inline") {
      const btn = root.querySelector('[data-tf="cta-inline"]');
      if (btn) btn.onclick = onSubmitClick;
      openHandler = () => root.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (styleType === "popup") {
      const popup = root.querySelector('[data-tf-role="popup"]');
      const launcher = root.querySelector('[data-tf="launcher"]');
      const closeBtns = root.querySelectorAll('[data-tf="close"]');
      const popupCta = root.querySelector('[data-tf="cta-popup"]');
      if (popup && launcher) {
        openHandler = () => { popup.style.display = "flex"; document.body.style.overflow = "hidden"; };
        launcher.onclick = (e) => { e.preventDefault(); openHandler(); };
      }
      if (popup && beh.closeOnOutside !== false) {
        popup.onclick = (e) => { if (e.target === popup) { popup.style.display = "none"; document.body.style.overflow = ""; } };
      }
      closeBtns.forEach(b => b.onclick = (e) => { e.preventDefault(); if (!popup) return; popup.style.display = "none"; document.body.style.overflow = ""; });
      if (popupCta) popupCta.onclick = onSubmitClick;
    } else if (styleType === "drawer") {
      const overlay = root.querySelector('[data-tf-role="drawer-overlay"]');
      const drawer = root.querySelector('[data-tf-role="drawer"]');
      const launcher = root.querySelector('[data-tf="launcher"]');
      const closeBtns = root.querySelectorAll('[data-tf="close"]');
      const drawerCta = root.querySelector('[data-tf="cta-drawer"]');
      const origin = beh.drawerOrigin || "right";
      let hiddenTransform = "translateX(100%)";
      if (drawer) {
        if (origin === "left") { drawer.style.left = "0"; drawer.style.right = "auto"; hiddenTransform = "translateX(-100%)"; }
        else { drawer.style.right = "0"; drawer.style.left = "auto"; }
        drawer.style.transform = hiddenTransform;
      }
      function openDrawer() { if (!overlay || !drawer) return; overlay.style.display = "block"; document.body.style.overflow = "hidden"; drawer.getBoundingClientRect(); drawer.style.transform = "translateX(0)"; }
      function closeDrawer() { if (!overlay || !drawer) return; drawer.style.transform = hiddenTransform; setTimeout(() => { overlay.style.display = "none"; document.body.style.overflow = ""; }, 260); }
      if (launcher && overlay && drawer) { openHandler = openDrawer; launcher.onclick = (e) => { e.preventDefault(); openDrawer(); }; }
      if (overlay && beh.closeOnOutside !== false) overlay.onclick = (e) => { if (e.target === overlay) closeDrawer(); };
      closeBtns.forEach(b => b.onclick = (e) => { e.preventDefault(); closeDrawer(); });
      if (drawerCta) drawerCta.onclick = onSubmitClick;
    }
    setupSticky(root, cfg, openHandler, motionClass);
    const delay = Number(beh.openDelayMs || 0);
    if (delay > 0 && styleType !== "inline" && typeof openHandler === "function") setTimeout(() => openHandler(), delay);
    updateMoney();
    return function handleTotalsChange() { updateMoney(); };
  }

  function deriveSectionIdFromHolder(holder) { return holder.id ? holder.id.replace(/^tripleform-cod-/, "") : ""; }
  function findProductJsonEl(holder, sectionId) {
    if (holder) { const inside = holder.querySelector('script[id^="tf-product-json-"]'); if (inside) return inside; }
    if (sectionId) { const legacy = byId(`tf-product-json-${sectionId}`); if (legacy) return legacy; }
    return document.querySelector('script[id^="tf-product-json-"]');
  }
  function findCartJsonEl(holder, sectionId) {
    if (holder) { const inside = holder.querySelector('script[id^="tf-cart-json-"]'); if (inside) return inside; }
    if (sectionId) { const legacy = byId(`tf-cart-json-${sectionId}`); if (legacy) return legacy; }
    return document.querySelector('script[id^="tf-cart-json-"]');
  }

  function boot(sectionIdOrEl) {
    let holder = null, sectionId = "";
    if (sectionIdOrEl && sectionIdOrEl.nodeType === 1) { holder = sectionIdOrEl; sectionId = deriveSectionIdFromHolder(holder); }
    else { sectionId = String(sectionIdOrEl || ""); holder = byId(`tripleform-cod-${sectionId}`) || document.querySelector(`.tripleform-cod[data-section-id="${sectionId}"]`) || document.querySelector(".tripleform-cod"); }
    if (!holder) return;
    if (holder.getAttribute("data-tf-booted") === "1") { if (holder.querySelector(".tf-shell")) return; holder.removeAttribute("data-tf-booted"); }
    injectGlobalCSSOnce();
    let cfg = parseSettingsAttr(holder);
    cfg = cleanConfig(cfg);
    const offersCfg = parseOffersAttr(holder);
    const geoCfg = (function() { const base = parseGeoAttr(holder) || {}; const enabledAttr = holder.getAttribute("data-geo-enabled"); if (enabledAttr != null) base.enabled = String(enabledAttr) === "true"; const endpointAttr = holder.getAttribute("data-geo-endpoint"); if (endpointAttr) base.endpoint = endpointAttr; const countryAttr = holder.getAttribute("data-geo-country") || holder.getAttribute("data-geo-country-code"); if (countryAttr) base.country = countryAttr; try { if (cfg && cfg.geo && typeof cfg.geo === "object") Object.assign(base, cfg.geo); } catch(e) {} return Object.keys(base).length ? base : null; })();
    const currency = holder.getAttribute("data-currency") || "USD";
    const locale = holder.getAttribute("data-locale") || "en";
    const moneyFmt = fmtMoneyFactory(locale, currency);
    const recaptchaEnabledAttr = holder.getAttribute("data-recaptcha-enabled");
    const recaptchaEnabled = recaptchaEnabledAttr === "true" || recaptchaEnabledAttr === "1" || recaptchaEnabledAttr === "yes";
    const recaptchaSiteKey = holder.getAttribute("data-recaptcha-site-key") || "";
    const recaptchaV2Container = holder.getAttribute("data-recaptcha-v2-container") || '[data-tf-recaptcha-v2="1"]';
    const recaptchaV2Theme = holder.getAttribute("data-recaptcha-v2-theme") || "light";
    const recaptchaV2Size = holder.getAttribute("data-recaptcha-v2-size") || "normal";
    const recaptchaCfg = { enabled: recaptchaEnabled && !!recaptchaSiteKey, version: "v2", siteKey: recaptchaSiteKey, v2Container: recaptchaV2Container, v2Theme: recaptchaV2Theme, v2Size: recaptchaV2Size };
    const prodEl = findProductJsonEl(holder, sectionId);
    const cartEl = findCartJsonEl(holder, sectionId);
    let product = null;
    if (prodEl) product = safeJsonParse(prodEl.textContent || "{}", { variants: [] });
    else if (cartEl) { const cart = safeJsonParse(cartEl.textContent || "{}", {}); product = { id: null, title: "Cart", variants: [], __cart: cart }; }
    else { console.error("[Tripleform COD] product/cart JSON introuvable"); return; }
    const getVariant = () => getSelectedVariantId() || holder.getAttribute("data-variant-id");
    let doUpdate;
    try {
      doUpdate = render(holder, cfg, offersCfg, geoCfg, product, getVariant, moneyFmt, recaptchaCfg);
      holder.setAttribute("data-tf-booted", "1");
    } catch(e) { holder.removeAttribute("data-tf-booted"); console.error("[Tripleform COD] render failed:", e); throw e; }
    watchVariantAndQty(() => doUpdate(), holder);
  }

  function autoBootAll() { document.querySelectorAll(".tripleform-cod").forEach(el => { try { boot(el); } catch(e) { console.warn(e); } }); }
  if (!window.__TripleformCOD_AutoBooted) {
    window.__TripleformCOD_AutoBooted = true;
    const scheduleBoot = () => { autoBootAll(); setTimeout(autoBootAll,200); setTimeout(autoBootAll,800); setTimeout(autoBootAll,1500); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scheduleBoot);
    else scheduleBoot();
    window.addEventListener("load", scheduleBoot);
    document.addEventListener("shopify:section:load", scheduleBoot);
    document.addEventListener("shopify:section:select", scheduleBoot);
    document.addEventListener("shopify:block:select", scheduleBoot);
  }
  return { boot };
})();
