/* =========================
   Tripleform COD — JS FINAL
   PART 1 / 2
   ========================= */

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
  /* Helpers généraux                                                   */
  /* ------------------------------------------------------------------ */

  function byId(id) {
    return document.getElementById(id);
  }

  function css(s) {
    return String(s ?? "");
  }

  function safeJsonParse(raw, fallback) {
    const txt = raw || "";
    try {
      return JSON.parse(txt);
    } catch {
      try {
        return JSON.parse(txt.replace(/=>/g, ":"));
      } catch (e2) {
        return fallback;
      }
    }
  }

  function parseSettingsAttr(el) {
    const raw = el.getAttribute("data-settings") || "{}";
    const obj = safeJsonParse(raw, {});
    if (!obj || typeof obj !== "object") return {};
    return obj;
  }

  function parseOffersAttr(el) {
    const raw = el.getAttribute("data-offers") || "{}";
    const obj = safeJsonParse(raw, {});
    if (!obj || typeof obj !== "object") return {};
    return obj;
  }

  function fmtMoneyFactory(locale, currency) {
    const nf = new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: currency || "USD",
    });
    return (cents) => nf.format(Number(cents || 0) / 100);
  }

  /* ------------------------------------------------------------------ */
  /* Polaris SVG Icons (NO EMOJIS)                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Tu peux aussi injecter tes icônes dynamiquement :
   * window.TripleformCODIcons = { CartIcon: "<svg...>", ... }
   */
  const DEFAULT_POLARIS_SVG = {
    CartIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M3 3.5a.75.75 0 0 1 .75-.75h1.34c.64 0 1.2.42 1.38 1.04l.24.86h10.02c.95 0 1.68.86 1.5 1.79l-.86 4.45a1.75 1.75 0 0 1-1.72 1.42H8.05a1.75 1.75 0 0 1-1.68-1.25L5.1 4.25a.75.75 0 0 0-.72-.5H3.75A.75.75 0 0 1 3 3.5Zm5.1 12.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Zm8 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/></svg>',
    BagIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M6.5 6V5.5a3.5 3.5 0 0 1 7 0V6h2.05c.84 0 1.52.7 1.45 1.53l-.65 7.5A2 2 0 0 1 14.36 17H5.64a2 2 0 0 1-1.99-1.97l-.65-7.5A1.5 1.5 0 0 1 4.45 6H6.5Zm1.5 0h4V5.5a2 2 0 1 0-4 0V6Z"/></svg>',
    PersonIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M10 10.25a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 1.5c-3.31 0-6.5 1.66-6.5 4v.5c0 .41.34.75.75.75h11.5c.41 0 .75-.34.75-.75v-.5c0-2.34-3.19-4-6.5-4Z"/></svg>',
    PhoneIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M6.7 2.5h-.2c-.8 0-1.45.65-1.45 1.45 0 7.9 6.4 14.3 14.3 14.3.8 0 1.45-.65 1.45-1.45v-.2c0-.56-.31-1.07-.8-1.32l-2.4-1.2a1.5 1.5 0 0 0-1.7.28l-.9.9c-3.02-1.16-5.46-3.6-6.62-6.62l.9-.9a1.5 1.5 0 0 0 .28-1.7l-1.2-2.4a1.48 1.48 0 0 0-1.32-.8Z"/></svg>',
    LocationIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M10 18s6-5.12 6-10a6 6 0 1 0-12 0c0 4.88 6 10 6 10Zm0-7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>',
    HomeIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M10 2.5a1 1 0 0 1 .66.25l7 6.13a.75.75 0 0 1-.99 1.12L16 9.45V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.45l-.67.55a.75.75 0 0 1-.98-1.12l7-6.13A1 1 0 0 1 10 2.5Z"/></svg>',
    TruckIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M2.5 4.75A2.25 2.25 0 0 1 4.75 2.5h7A2.25 2.25 0 0 1 14 4.75V6h1.13c.6 0 1.17.24 1.6.66l1.61 1.6c.42.43.66 1 .66 1.6V14a2 2 0 0 1-2 2h-.2a2.3 2.3 0 0 1-4.6 0H8.8a2.3 2.3 0 0 1-4.6 0H4.5A2 2 0 0 1 2.5 14V4.75ZM14 7.5V12h4v-2.14a1 1 0 0 0-.3-.71l-1.6-1.6a1 1 0 0 0-.7-.29H14Zm-8.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>',
    CheckCircleIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.72-9.78a.75.75 0 0 1 .06 1.06l-4.1 4.5a.75.75 0 0 1-1.1.02l-2.3-2.3a.75.75 0 1 1 1.06-1.06l1.74 1.74 3.57-3.91a.75.75 0 0 1 1.07-.05Z"/></svg>',
    ChevronDownIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M5.22 7.72a.75.75 0 0 1 1.06 0L10 11.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.78a.75.75 0 0 1 0-1.06Z"/></svg>',
    XIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M6.22 6.22a.75.75 0 0 1 1.06 0L10 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L11.06 10l2.72 2.72a.75.75 0 1 1-1.06 1.06L10 11.06l-2.72 2.72a.75.75 0 1 1-1.06-1.06L8.94 10 6.22 7.28a.75.75 0 0 1 0-1.06Z"/></svg>',
    AppsIcon:
      '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path fill="currentColor" d="M6 2.75A3.25 3.25 0 1 0 6 9.25 3.25 3.25 0 0 0 6 2.75Zm8 0A3.25 3.25 0 1 0 14 9.25 3.25 3.25 0 0 0 14 2.75ZM6 10.75A3.25 3.25 0 1 0 6 17.25 3.25 3.25 0 0 0 6 10.75Zm8 0A3.25 3.25 0 1 0 14 17.25 3.25 3.25 0 0 0 14 10.75Z"/></svg>',
  };

  function getPolarisSvg(iconName) {
    const injected = window.TripleformCODIcons && window.TripleformCODIcons[iconName];
    if (injected && typeof injected === "string") return injected;
    if (DEFAULT_POLARIS_SVG[iconName]) return DEFAULT_POLARIS_SVG[iconName];
    // fallback: try AppsIcon
    return DEFAULT_POLARIS_SVG.AppsIcon;
  }

  function getIconHtml(iconName, sizePx) {
    const size = sizePx || "18px";
    if (!iconName) return "";
    const svg = getPolarisSvg(iconName);
    return `
      <span style="display:inline-flex;align-items:center;justify-content:center;width:${size};height:${size};flex:none;">
        <span style="display:inline-flex;width:${size};height:${size};color:currentColor;">
          ${svg}
        </span>
      </span>
    `;
  }

  /* ------------------------------------------------------------------ */
  /* CountryData Adapter (from separate countryData.js)                  */
  /* ------------------------------------------------------------------ */

  /**
   * Expected (recommended) in storefront:
   * window.TripleformCODCountryData = {
   *   countries: [
   *     {
   *       code:"MA", label:"Morocco", phonePrefix:"+212",
   *       provinces:[ { code:"CAS", label:"Casablanca-Settat", cities:["Casablanca", ...] } ]
   *     }
   *   ]
   * }
   *
   * I also accept old structure:
   * window.TripleformCODCountryData = { MA: { label, phonePrefix, provinces:[{name, cities}] } }
   */

  function normalizeCountryData(raw) {
    if (!raw || typeof raw !== "object") return null;

    // New format: { countries:[...] }
    if (Array.isArray(raw.countries)) {
      return {
        countries: raw.countries
          .filter(Boolean)
          .map((c) => ({
            code: String(c.code || c.iso2 || c.isoCode || "").toUpperCase(),
            label: String(c.label || c.name || "").trim(),
            phonePrefix: String(c.phonePrefix || c.phone || "").trim(),
            provinces: Array.isArray(c.provinces)
              ? c.provinces.map((p) => ({
                  code: String(p.code || p.id || p.isoCode || "").toUpperCase(),
                  label: String(p.label || p.name || "").trim(),
                  cities: Array.isArray(p.cities) ? p.cities.slice() : [],
                }))
              : [],
          }))
          .filter((c) => c.code && c.label),
      };
    }

    // Old format: { ma:{label, phonePrefix, provinces:[{name,cities}]} , dz:{...} }
    const keys = Object.keys(raw);
    if (!keys.length) return null;

    const countries = keys
      .map((k) => {
        const def = raw[k];
        if (!def || typeof def !== "object") return null;
        const code = String(def.code || k || "").toUpperCase();
        const label = String(def.label || def.name || code).trim();
        const phonePrefix = String(def.phonePrefix || def.phone || "").trim();
        const provinces = Array.isArray(def.provinces)
          ? def.provinces.map((p) => ({
              code: String(p.code || p.id || p.isoCode || p.name || "").toUpperCase(),
              label: String(p.label || p.name || "").trim(),
              cities: Array.isArray(p.cities) ? p.cities.slice() : [],
            }))
          : [];
        return { code, label, phonePrefix, provinces };
      })
      .filter(Boolean);

    return { countries };
  }

  function getCountryDataStorefront() {
    const raw = window.TripleformCODCountryData || null;
    const normalized = normalizeCountryData(raw);

    // fallback minimal MA
    if (!normalized || !normalized.countries || !normalized.countries.length) {
      return {
        countries: [
          {
            code: "MA",
            label: "Morocco",
            phonePrefix: "+212",
            provinces: [],
          },
        ],
      };
    }
    return normalized;
  }

  function findCountryDef(code) {
    const db = getCountryDataStorefront();
    const cc = String(code || "MA").toUpperCase();
    return (
      db.countries.find((c) => String(c.code).toUpperCase() === cc) ||
      db.countries.find((c) => c.code === "MA") ||
      db.countries[0]
    );
  }

  /* ------------------------------------------------------------------ */
  /* Overlay / couleurs / tailles popup & drawer                        */
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
  /* Sticky button                                                      */
  /* ------------------------------------------------------------------ */

  function setupSticky(root, cfg, styleType, openHandler) {
    const stickyType = cfg?.behavior?.stickyType || "none";
    const stickyLabel = css(cfg?.behavior?.stickyLabel || cfg?.uiTitles?.orderNow || "Order now");
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
      position:fixed; z-index:999999; bottom:12px;
      display:flex; align-items:center; justify-content:center;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    `;

    if (stickyType === "bottom-bar") {
      el.style.cssText = baseStyle + `left:16px; right:16px;`;
      el.innerHTML = `
        <div style="
          max-width:720px; width:100%;
          background:#0F172A; color:#F9FAFB;
          border-radius:999px; padding:8px 14px;
          display:flex; align-items:center; justify-content:space-between;
          box-shadow:0 18px 32px rgba(15,23,42,0.55);
          font-size:12px;
        ">
          <span>Quick COD — ${styleType === "inline" ? "scroll to form" : "open form"}</span>
          <button type="button" data-tf-sticky-cta style="
            border-radius:999px;
            border:1px solid ${br};
            background:${bg}; color:${text};
            font-weight:600;
            padding:6px 18px;
            font-size:13px;
            cursor:pointer;
            box-shadow:0 10px 24px rgba(0,0,0,.35);
            display:flex; align-items:center; gap:8px;
          ">
            ${getIconHtml(stickyIcon, "16px")}<span>${stickyLabel}</span>
          </button>
        </div>
      `;
    } else {
      const isLeft = stickyType === "bubble-left";
      el.style.cssText = baseStyle + `${isLeft ? "left:16px;" : "right:16px;"}`;
      el.innerHTML = `
        <button type="button" data-tf-sticky-cta style="
          border-radius:999px;
          border:1px solid ${br};
          background:${bg}; color:${text};
          font-weight:600;
          padding:10px 18px;
          font-size:13px;
          cursor:pointer;
          box-shadow:0 18px 36px rgba(0,0,0,.55);
          max-width:220px;
          white-space:nowrap;
          display:flex; align-items:center; gap:8px;
        ">
          ${getIconHtml(stickyIcon, "16px")}<span>${stickyLabel}</span>
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
  /* OFFERS CSS (shared)                                                */
  /* ------------------------------------------------------------------ */

  function injectOffersCSS() {
    if (document.getElementById("tf-offers-css")) return;

    const style = document.createElement("style");
    style.id = "tf-offers-css";
    style.textContent = `
      .tf-offers-container{display:grid;gap:10px;margin-bottom:16px}
      .tf-offer-card{border:1px solid #E5E7EB;border-radius:12px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.05);overflow:hidden}
      .tf-offer-row{display:grid;grid-template-columns:60px minmax(0,1fr);gap:12px;align-items:center;padding:12px}
      .tf-offer-thumb{width:56px;height:56px;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;display:flex;align-items:center;justify-content:center;flex:none;background:#F9FAFB}
      .tf-offer-thumb img{width:100%;height:100%;object-fit:cover;display:block}
      .tf-offer-title{font-size:14px;font-weight:700;color:#111827;margin-bottom:2px;line-height:1.25}
      .tf-offer-desc{font-size:12px;color:#6B7280;line-height:1.35}
      .tf-offer-meta{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}

      .tf-offer-badge{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;border:1px solid #E5E7EB;background:#F9FAFB;color:#111827}
      .tf-offer-badge strong{font-weight:800}

      .tf-offer-timer{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;padding:6px 10px;border-radius:10px;border:1px solid #E5E7EB;background:#F9FAFB;color:#111827}
      .tf-offer-timer .tf-timer-count{margin-left:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;letter-spacing:.06em}

      /* 4 styles */
      .tf-style-strip .tf-offer-card{border-radius:10px}
      .tf-style-compact .tf-offer-row{grid-template-columns:44px minmax(0,1fr)}
      .tf-style-compact .tf-offer-thumb{width:40px;height:40px;border-radius:10px}
      .tf-style-glow .tf-offer-card{border:1px solid rgba(59,130,246,.35);box-shadow:0 10px 24px rgba(59,130,246,.18)}
      .tf-style-glow .tf-offer-thumb{border-color:rgba(59,130,246,.35)}
      .tf-style-minimal .tf-offer-card{box-shadow:none}

      /* activation button */
      .tf-offer-btn{
        display:inline-flex;align-items:center;gap:8px;
        background:#111827;color:#fff;border:1px solid #111827;
        border-radius:10px;padding:6px 10px;font-size:12px;font-weight:700;
        cursor:pointer;transition:all .18s ease;user-select:none;
      }
      .tf-offer-btn:hover{transform:translateY(-1px)}
      .tf-offer-btn[disabled]{opacity:.55;cursor:not-allowed;transform:none}
      .tf-offer-btn.is-active{background:#10B981;border-color:#10B981}
      .tf-offer-btn .tf-offer-btn-icon{display:inline-flex;width:14px;height:14px}

      .tf-discount-row{color:#10B981!important;font-weight:800}
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /* Timer component (offers / upsells)                                 */
  /* ------------------------------------------------------------------ */

  function buildTimerNode({ minutes, message, timeFormat, tone }) {
    const container = document.createElement("div");
    container.className = "tf-offer-timer";

    // tone: "hot" etc (optional)
    if (tone === "hot") {
      container.style.background = "linear-gradient(90deg,#991B1B,#DC2626)";
      container.style.borderColor = "rgba(252,165,165,.8)";
      container.style.color = "#fff";
    }

    let timeLeft = Math.max(0, Number(minutes || 0) * 60);

    function formatTime(seconds, format) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      switch (format) {
        case "hh[h] mm[m]":
          return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
        case "mm[m] ss[s]":
          return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
        case "hh[h]":
          return `${String(h).padStart(2, "0")}h`;
        case "mm:ss":
        default:
          return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
    }

    function draw() {
      container.innerHTML = `
        ${getIconHtml("ClockIcon", "14px")}
        <span>${css(message || "Limited time offer")}</span>
        <span class="tf-timer-count">${formatTime(timeLeft, timeFormat || "mm:ss")}</span>
      `;
    }

    draw();

    const interval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        container.innerHTML = `
          ${getIconHtml("ClockIcon", "14px")}
          <span>${css("Offer expired")}</span>
          <span class="tf-timer-count">00:00</span>
        `;
        return;
      }
      timeLeft--;
      draw();
    }, 1000);

    return container;
  }

  /* ------------------------------------------------------------------ */
  /* OFFERS Activation + Discount sync                                  */
  /* ------------------------------------------------------------------ */

  function storageKeyForOffer(type, index) {
    return `tf_active_offer_${type}_${index}`;
  }

  function setActiveOfferPayload(payloadOrNull) {
    if (!payloadOrNull) {
      localStorage.removeItem("tf_current_active_offer");
      return;
    }
    localStorage.setItem("tf_current_active_offer", JSON.stringify(payloadOrNull));
  }

  function getActiveOfferPayload() {
    const raw = localStorage.getItem("tf_current_active_offer");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function clearAllOfferFlags(root) {
    const allButtons = root.querySelectorAll("[data-tf-offer-toggle]");
    allButtons.forEach((btn) => {
      btn.classList.remove("is-active");
      btn.removeAttribute("aria-pressed");
      btn.innerHTML = `${getIconHtml("AddIcon", "14px")}<span>${css(btn.getAttribute("data-tf-btn-label") || "Activate")}</span>`;
      const idx = btn.getAttribute("data-tf-offer-index");
      const type = btn.getAttribute("data-tf-offer-type");
      localStorage.removeItem(storageKeyForOffer(type, idx));
    });
    setActiveOfferPayload(null);
  }

  function applyOfferButtonState(btn, isActive) {
    const label = btn.getAttribute("data-tf-btn-label") || "Activate";
    if (isActive) {
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      btn.innerHTML = `${getIconHtml("CheckCircleIcon", "14px")}<span>${css("Activated")}</span>`;
    } else {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = `${getIconHtml("AddIcon", "14px")}<span>${css(label)}</span>`;
    }
  }

  function toggleOfferActivation({ root, offersList, btn, offerIndex, offerType, updateMoney }) {
    const isActive = btn.classList.contains("is-active");
    const offer = offersList[offerIndex];

    // One active at a time (global)
    clearAllOfferFlags(root);

    if (isActive) {
      // just cleared above
      if (typeof updateMoney === "function") updateMoney();
      return;
    }

    // activate this one
    applyOfferButtonState(btn, true);
    localStorage.setItem(storageKeyForOffer(offerType, offerIndex), "true");

    // store full payload
    setActiveOfferPayload({
      index: offerIndex,
      type: offerType,
      title: offer?.title || "",
      discountType: offer?.discountType || null,
      discountValue: Number(offer?.discountValue || 0),
      currency: offer?.currency || null,
    });

    if (typeof updateMoney === "function") updateMoney();
  }

  function computeActiveDiscountCents({ offersList, totalCents }) {
    const payload = getActiveOfferPayload();

    if (!payload || payload.type !== "offer") {
      return { discountCents: 0, payload: null };
    }

    const dt = payload.discountType;
    const dv = Number(payload.discountValue || 0);

    if (!dt || !dv) return { discountCents: 0, payload };

    if (dt === "percentage") {
      const pct = Math.max(0, Math.min(100, dv));
      return { discountCents: Math.round((totalCents * pct) / 100), payload };
    }

    // fixed: assume value is in "major" currency unit (ex: 20 => 20.00)
    if (dt === "fixed") {
      return { discountCents: Math.round(dv * 100), payload };
    }

    return { discountCents: 0, payload };
  }

  /* ------------------------------------------------------------------ */
  /* OFFERS HTML builder (4 styles)                                     */
  /* ------------------------------------------------------------------ */

  function resolveOfferStyle(offersCfg) {
    // From admin: offersCfg.display.previewStyle / style / layout etc
    const display = offersCfg?.display || {};
    const style =
      display.previewStyle ||
      display.style ||
      display.layout ||
      display.cardStyle ||
      "strip";

    const s = String(style || "strip").toLowerCase();
    if (["strip", "compact", "glow", "minimal"].includes(s)) return s;
    return "strip";
  }

  function buildOffersHtml(offersCfg, rootId) {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (!global.enabled) return "";

    const display = offersCfg.display || {};
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    const activeOffers = offers.filter((o) => o && o.enabled && o.showInPreview !== false);
    const activeUpsells = upsells.filter((u) => u && u.enabled && u.showInPreview !== false);

    if (!activeOffers.length && !activeUpsells.length) return "";

    const style = resolveOfferStyle(offersCfg);
    let html = `<div class="tf-offers-container tf-style-${style}" data-tf-offers-root="${rootId}">`;

    // OFFERS (discount) with activation
    activeOffers.forEach((offer, idx) => {
      const title = offer.title || "Special discount";
      const description = offer.description || "";
      const img = offer.imageUrl || "";
      const btnLabel = offer.buttonText || "Activate";
      const hasTimer = !!offer.enableTimer && display.showTimerInPreview !== false;

      html += `
        <div class="tf-offer-card" data-tf-offer-card="offer" data-tf-offer-index="${idx}">
          <div class="tf-offer-row">
            <div class="tf-offer-thumb">
              ${
                img
                  ? `<img src="${css(img)}" alt="${css(title)}" loading="lazy" />`
                  : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#3B82F6,#8B5CF6);"></div>`
              }
            </div>

            <div style="min-width:0;">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>

              <div class="tf-offer-meta">
                ${
                  offer.discountType === "percentage"
                    ? `<span class="tf-offer-badge">${getIconHtml("DiscountIcon", "14px")}<strong>-${css(offer.discountValue || 0)}%</strong></span>`
                    : offer.discountType === "fixed"
                    ? `<span class="tf-offer-badge">${getIconHtml("DiscountIcon", "14px")}<strong>-${css(offer.discountValue || 0)}</strong></span>`
                    : ``
                }

                ${
                  hasTimer
                    ? `<span data-tf-timer="offer" data-tf-timer-index="${idx}"></span>`
                    : ``
                }

                <button
                  type="button"
                  class="tf-offer-btn"
                  data-tf-offer-toggle="1"
                  data-tf-offer-index="${idx}"
                  data-tf-offer-type="offer"
                  data-tf-root-id="${rootId}"
                  data-tf-btn-label="${css(btnLabel)}"
                  aria-pressed="false"
                >
                  ${getIconHtml("AddIcon", "14px")}<span>${css(btnLabel)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // UPSELLS (gift) no activation
    activeUpsells.forEach((upsell, idx) => {
      const title = upsell.title || "Free gift";
      const description = upsell.description || "";
      const img = upsell.imageUrl || "";
      const hasTimer = !!upsell.enableTimer && display.showTimerInPreview !== false;

      html += `
        <div class="tf-offer-card" data-tf-offer-card="upsell" data-tf-upsell-index="${idx}">
          <div class="tf-offer-row">
            <div class="tf-offer-thumb">
              ${
                img
                  ? `<img src="${css(img)}" alt="${css(title)}" loading="lazy" />`
                  : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#EC4899,#F59E0B);"></div>`
              }
            </div>

            <div style="min-width:0;">
              <div class="tf-offer-title">${css(title)}</div>
              <div class="tf-offer-desc">${css(description)}</div>

              <div class="tf-offer-meta">
                <span class="tf-offer-badge">${getIconHtml("GiftIcon", "14px")}<strong>${css(upsell.badgeText || "GIFT")}</strong></span>
                ${
                  hasTimer
                    ? `<span data-tf-timer="upsell" data-tf-timer-index="${idx}"></span>`
                    : ``
                }
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  function initializeOffersUI(root, offersCfg, updateMoney) {
    if (!offersCfg || typeof offersCfg !== "object") return;

    const display = offersCfg.display || {};
    const offers = Array.isArray(offersCfg.offers) ? offersCfg.offers : [];
    const upsells = Array.isArray(offersCfg.upsells) ? offersCfg.upsells : [];

    // Timers
    const timerSpots = root.querySelectorAll("[data-tf-timer]");
    timerSpots.forEach((spot) => {
      const kind = spot.getAttribute("data-tf-timer");
      const index = Number(spot.getAttribute("data-tf-timer-index") || 0);
      const item = kind === "offer" ? offers[index] : upsells[index];
      if (!item) return;

      if (!item.enableTimer) return;
      if (display.showTimerInPreview === false) return;

      // clear and append node
      spot.innerHTML = "";
      const node = buildTimerNode({
        minutes: item.timerMinutes || 60,
        message: item.timerMessage || (kind === "offer" ? "Limited time offer" : "Limited time gift"),
        timeFormat: item.timerTimeFormat || "mm:ss",
        tone: item.timerTone || "",
      });
      spot.appendChild(node);
    });

    // Restore active offer (if any)
    const payload = getActiveOfferPayload();
    if (payload && payload.type === "offer") {
      const btn = root.querySelector(
        `[data-tf-offer-toggle][data-tf-offer-type="offer"][data-tf-offer-index="${payload.index}"]`
      );
      if (btn) applyOfferButtonState(btn, true);
    }

    // Activation buttons
    const offerButtons = root.querySelectorAll("[data-tf-offer-toggle]");
    offerButtons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const offerIndex = Number(this.getAttribute("data-tf-offer-index") || 0);
        const offerType = this.getAttribute("data-tf-offer-type") || "offer";

        toggleOfferActivation({
          root,
          offersList: offers,
          btn: this,
          offerIndex,
          offerType,
          updateMoney,
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* END PART 1 — continue in PART 2                                    */
  /* ------------------------------------------------------------------ */
  /* =========================
     PART 2 / 2
     ========================= */

  /* ------------------------------------------------------------------ */
  /* Dropdown Country / Province / City                                 */
  /* ------------------------------------------------------------------ */

  function setupLocationDropdowns(root, cfg, beh) {
    const fields = cfg.fields || {};

    const countrySelect = root.querySelector('select[data-tf-role="country"]');
    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');

    if (!countrySelect && !provSelect && !citySelect) return;

    const countryDb = getCountryDataStorefront();

    function resetSelect(el, placeholder) {
      if (!el) return;
      el.innerHTML = "";
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = placeholder || "";
      el.appendChild(opt);
    }

    function fillCountries(selectedCode) {
      if (!countrySelect) return;

      const ph = fields?.country?.ph || "Select country";
      resetSelect(countrySelect, ph);

      (countryDb.countries || []).forEach((c) => {
        const o = document.createElement("option");
        o.value = c.code;
        o.textContent = c.label;
        if (selectedCode && String(selectedCode).toUpperCase() === String(c.code).toUpperCase()) {
          o.selected = true;
        }
        countrySelect.appendChild(o);
      });
    }

    function fillProvinces(countryCode, selectedProv) {
      if (!provSelect) return;

      const ph = fields?.province?.ph || "Province / State";
      resetSelect(provSelect, ph);

      const cdef = findCountryDef(countryCode);
      const provinces = cdef.provinces || [];

      provinces.forEach((p) => {
        const o = document.createElement("option");
        o.value = p.code || p.label;
        o.textContent = p.label || p.code;
        if (selectedProv && String(selectedProv).toUpperCase() === String(o.value).toUpperCase()) {
          o.selected = true;
        }
        provSelect.appendChild(o);
      });
    }

    function fillCities(countryCode, provinceCodeOrLabel, selectedCity) {
      if (!citySelect) return;

      const ph = fields?.city?.ph || "City";
      resetSelect(citySelect, provinceCodeOrLabel ? ph : (fields?.city?.phEmpty || "Select province first"));

      if (!provinceCodeOrLabel) return;

      const cdef = findCountryDef(countryCode);
      const provinces = cdef.provinces || [];
      const prov = provinces.find((p) => {
        const a = String(p.code || "").toUpperCase();
        const b = String(provinceCodeOrLabel || "").toUpperCase();
        const c = String(p.label || "").toUpperCase();
        return a === b || c === b;
      });

      const cities = (prov && Array.isArray(prov.cities)) ? prov.cities : [];
      cities.forEach((city) => {
        const o = document.createElement("option");
        o.value = city;
        o.textContent = city;
        if (selectedCity && String(selectedCity).toUpperCase() === String(city).toUpperCase()) {
          o.selected = true;
        }
        citySelect.appendChild(o);
      });
    }

    function tryAutoPhonePrefix(countryCode) {
      // If phone prefix field exists (tel prefix)
      const phoneCfg = fields?.phone;
      if (!phoneCfg) return;

      const prefixFieldEl =
        root.querySelector('[data-tf-field="phonePrefix"]') ||
        root.querySelector('[data-tf-field="prefix"]');

      // If phone field is "tel with prefix" in same group, we detect the readonly prefix input
      const telPrefixInput = root.querySelector('[data-tf-role="tel-prefix"]');

      const cdef = findCountryDef(countryCode);
      const prefix = cdef?.phonePrefix || "";

      if (telPrefixInput && prefix) {
        telPrefixInput.value = prefix;
      } else if (prefixFieldEl && prefix) {
        prefixFieldEl.value = prefix;
      }
    }

    // initial values from behavior or current selects
    const initialCountry =
      (beh && (beh.country || beh.codCountry)) ? String(beh.country || beh.codCountry).toUpperCase() : "MA";

    // Fill chain
    fillCountries(initialCountry);

    const currentCountry = countrySelect ? (countrySelect.value || initialCountry) : initialCountry;
    fillProvinces(currentCountry, provSelect ? provSelect.value : "");
    fillCities(currentCountry, provSelect ? provSelect.value : "", citySelect ? citySelect.value : "");

    tryAutoPhonePrefix(currentCountry);

    if (countrySelect) {
      countrySelect.addEventListener("change", () => {
        const cc = countrySelect.value || "MA";
        fillProvinces(cc, "");
        fillCities(cc, "", "");
        tryAutoPhonePrefix(cc);
      });
    }

    if (provSelect) {
      provSelect.addEventListener("change", () => {
        const cc = countrySelect ? (countrySelect.value || "MA") : initialCountry;
        fillCities(cc, provSelect.value || "", "");
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Render principal                                                   */
  /* ------------------------------------------------------------------ */

  function render(root, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg) {
    const d = cfg.design || {};
    const ui = cfg.uiTitles || {};
    const t = cfg.cartTitles || {};
    const f = cfg.fields || {};
    const beh = cfg.behavior || {};
    const styleType = (cfg.form && cfg.form.style) || "inline";

    const pageStart = Date.now();

    // geo shipping (if enabled via data-* in liquid)
    const geoEndpointAttr = root.getAttribute("data-geo-endpoint") || "";
    const geoEnabledAttr = root.getAttribute("data-geo-enabled") || "";
    const geoCountryAttr = root.getAttribute("data-geo-country") || "";

    const geoEnabled =
      !!geoEndpointAttr &&
      (geoEnabledAttr === "1" || geoEnabledAttr === "true" || geoEnabledAttr === "yes");

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
      d.direction ||
      d.textDirection ||
      beh.textDirection ||
      "ltr";

    const rawTitleAlign =
      d.titleAlign ||
      beh.titleAlign ||
      d.textAlign ||
      beh.textAlign ||
      "left";

    const rawFieldAlign =
      d.fieldAlign ||
      beh.fieldAlign ||
      rawTitleAlign;

    const rawInputFont =
      d.fontSize ||
      d.inputFontSize ||
      beh.inputFontSize ||
      16;

    const inputFontSize = Number(rawInputFont) || 16;

    const textDir = String(rawDirection).toLowerCase() === "rtl" ? "rtl" : "ltr";

    const titleAlignValue = String(rawTitleAlign).toLowerCase();
    const titleAlign =
      titleAlignValue === "center" ? "center" : titleAlignValue === "right" ? "right" : "left";

    const fieldAlignValue = String(rawFieldAlign).toLowerCase();
    const fieldAlign = fieldAlignValue === "right" ? "right" : "left";

    const labelFontSize = `${Math.max(inputFontSize - 1, 11)}px`;
    const smallFontSize = `${Math.max(inputFontSize - 2, 10)}px`;
    const tinyFontSize = `${Math.max(inputFontSize - 3, 9)}px`;

    const inputHeight = `${+d.btnHeight || 46}px`;

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

      const iconHtml = field.icon ? getIconHtml(field.icon, "18px") : "";
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

      // Country
      if (key === "country") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml || getIconHtml("GlobeIcon", "18px")}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <select data-tf-role="country" data-tf-field="${key}" style="${selectStyle}" ${requiredAttr}>
                <option value="">${css(ph || "Select country")}</option>
              </select>
            </div>
          </div>
        `;
      }

      // Province
      if (key === "province") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml || getIconHtml("LocationIcon", "18px")}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <select data-tf-role="province" data-tf-field="${key}" style="${selectStyle}" ${requiredAttr}>
                <option value="">${css(ph || "Province / State")}</option>
              </select>
            </div>
          </div>
        `;
      }

      // City
      if (key === "city") {
        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml || getIconHtml("LocationIcon", "18px")}
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

      // Textarea
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

      // Tel with prefix auto sync
      if (field.type === "tel") {
        const prefixVal = field.prefix || ""; // admin may set default prefix
        const prefixInput = `
          <input
            data-tf-role="tel-prefix"
            style="${inputStyle}; text-align:center;"
            value="${css(prefixVal)}"
            readonly
          />
        `;
        const grid = "minmax(88px,130px) 1fr";

        return `
          <div style="${fieldContainerStyle}">
            <div style="height:${inputHeight}; display:flex; align-items:center; justify-content:center;">
              ${iconHtml || getIconHtml("PhoneIcon", "18px")}
            </div>
            <div style="flex:1;">
              <label style="${labelStyle}">${css(label)}</label>
              <div style="display:grid; grid-template-columns:${grid}; gap:8px;">
                ${prefixInput}
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
      return orderedFieldKeys().map((k) => fieldHTML(k)).join("");
    }

    function cartSummaryHTML() {
      const cartIconName = t.cartIcon || "CartIcon";
      const cartIconHtml = getIconHtml(cartIconName, "20px");

      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">${cartIconHtml}<span>${css(t.top || "Order summary")}</span></div>
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
              <div style="font-weight:800;" data-tf="shipping">
                ${css(t.shippingToCalculate || "Shipping to calculate")}
              </div>
            </div>

            <div style="${rowStyle}; display:none;" data-tf="discount-row">
              <div class="tf-discount-row">${css(t.discountLabel || "Discount")}</div>
              <div style="font-weight:900;" class="tf-discount-row" data-tf="discount">—</div>
            </div>

            <div style="${rowStyle}">
              <div>${css(t.total || "Total")}</div>
              <div style="font-weight:900;" data-tf="total">—</div>
            </div>
          </div>
        </div>
      `;
    }

    function formCardHTML(ctaKey, isPopupOrDrawer) {
      const orderLabel = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const buttonIconName = cfg.form?.buttonIcon || "CartIcon";
      const buttonIconHtml = getIconHtml(buttonIconName, "20px");
      const suffix = css(ui.totalSuffix || "Total:");

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
            <!-- honeypot anti-bot -->
            <input
              type="text"
              data-tf-role="honeypot"
              name="tf_hp_token"
              style="position:absolute;left:-9999px;opacity:0;pointer-events:none;height:0;width:0;"
              tabindex="-1"
              autocomplete="off"
            />

            ${fieldsBlockHTML()}

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

            <button type="button" style="${btnStyle}; margin-top:16px;" data-tf-cta="1" data-tf="${ctaKey}">
              ${buttonIconHtml}<span>${orderLabel}</span><span style="opacity:.9;">·</span><span>${suffix}</span><span>…</span>
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
          <button type="button" style="${btnStyle}" data-tf-cta="1" data-tf="launcher">
            ${getIconHtml(cfg.form?.buttonIcon || "CartIcon", "20px")}
            <span>${css(ui.orderNow || cfg.form?.buttonText || "Order now")}</span>
            <span style="opacity:.9;">·</span>
            <span>${css(ui.totalSuffix || "Total:")}</span>
            <span>…</span>
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (popup)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div data-tf-role="popup" style="
          position:fixed; inset:0; display:none;
          align-items:center; justify-content:center;
          z-index:999999; background:${ovBg};
          padding:20px; box-sizing:border-box;">
          <div style="
            width:100%; max-width:${popupCfg.maxWidth};
            max-height:${popupCfg.maxHeight};
            box-sizing:border-box; position:relative;
            background:${css(d.bg)};
            border-radius:${+d.radius || 12}px;
            box-shadow:${cardShadow};
            overflow:auto;">
            <div style="text-align:right; position:absolute; top:12px; right:12px; z-index:10;">
              <button type="button" data-tf="close" style="
                background:${css(d.bg)};
                border:1px solid ${css(d.border)};
                color:${css(d.text)};
                cursor:pointer;
                width:34px;height:34px;
                display:flex;align-items:center;justify-content:center;
                border-radius:12px;">
                ${getIconHtml("XIcon", "18px")}
              </button>
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
          <button type="button" style="${btnStyle}" data-tf-cta="1" data-tf="launcher">
            ${getIconHtml(cfg.form?.buttonIcon || "CartIcon", "20px")}
            <span>${css(ui.orderNow || cfg.form?.buttonText || "Order now")}</span>
            <span style="opacity:.9;">·</span>
            <span>${css(ui.totalSuffix || "Total:")}</span>
            <span>…</span>
          </button>
          <div style="font-size:${tinyFontSize}; color:#6B7280; margin-top:4px; text-align:${titleAlign};">
            Click to open COD form (drawer)
          </div>
        </div>
        ` +
        mainEnd +
        `
        <div data-tf-role="drawer-overlay" style="
          position:fixed; inset:0; display:none;
          z-index:999999; background:${ovBg};
          overflow:hidden; padding:0;">
          <div data-tf-role="drawer" data-origin="${origin}" style="
            position:absolute; top:0; bottom:0;
            width:${drawerCfg.sideWidth};
            max-height:100%;
            background:${css(d.bg)};
            box-shadow:0 0 40px rgba(15,23,42,0.65);
            display:flex; flex-direction:column;
            padding:0; box-sizing:border-box;
            transform:translateX(100%);
            transition:transform 260ms ease;
            overflow:hidden;">
            <div style="padding:24px; overflow:auto; flex:1; box-sizing:border-box;">
              <div style="text-align:right; margin-bottom:16px;">
                <button type="button" data-tf="close" style="
                  background:${css(d.bg)};
                  border:1px solid ${css(d.border)};
                  color:${css(d.text)};
                  cursor:pointer;
                  width:34px;height:34px;
                  display:flex;align-items:center;justify-content:center;
                  border-radius:12px;">
                  ${getIconHtml("XIcon", "18px")}
                </button>
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

    // Setup country/province/city
    setupLocationDropdowns(root, cfg, beh);

    /* ===================== Helpers fields =========================== */

    function findLabelByText(sub) {
      sub = String(sub || "").toLowerCase();
      const labels = Array.from(root.querySelectorAll("label"));
      return labels.find((lab) => (lab.textContent || "").toLowerCase().includes(sub)) || null;
    }

    function getFieldValueByLabel(sub) {
      const lab = findLabelByText(sub);
      if (!lab) return "";
      const el =
        lab.querySelector("input:not([readonly]), textarea, select") ||
        lab.querySelector("input, textarea, select");
      if (!el) return "";
      return (el.value || "").trim();
    }

    function getPhoneFields() {
      const phoneEl = root.querySelector('[data-tf-field="phone"]');
      const prefixEl = root.querySelector('[data-tf-role="tel-prefix"]');

      const number = phoneEl ? String(phoneEl.value || "").trim() : "";
      const prefix = prefixEl ? String(prefixEl.value || "").trim() : "";

      const fullPhone = prefix && number ? `${prefix}${number}` : number || prefix || "";
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
          priceCents = rawStr.includes(".") ? Math.round(rawNum * 100) : Math.round(rawNum);
        }
      }

      const baseTotalCents = priceCents * qty;
      return { priceCents, totalCents: baseTotalCents, baseTotalCents, qty, variantId: vId };
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

      const province = getFieldValueByLabel("wilaya") || getFieldValueByLabel("province");
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

        // country: prefer selected country from dropdown, else from attr
        const countrySel = root.querySelector('select[data-tf-role="country"]');
        const selectedCountry = countrySel ? (countrySel.value || "") : "";

        url.searchParams.set("country", selectedCountry || geoCountryAttr || "");
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
          let shippingCents = 0;
          let codFeeCents = 0;

          const shippingObj = json.shipping || {};

          if (shippingObj && shippingObj.amount != null) {
            const amount = Number(shippingObj.amount);
            if (Number.isFinite(amount) && amount > 0) shippingCents = Math.round(amount * 100);
          }

          if (shippingObj && shippingObj.codExtraFee != null) {
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

    /* ===================== Validation required ====================== */

    function validateRequiredFields() {
      const requiredFields = Object.keys(f || {}).filter((key) => f[key]?.on && f[key]?.required);
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
        alert("Merci de remplir les champs obligatoires :\n- " + missingLabels.join("\n- "));
        if (firstInvalid && typeof firstInvalid.focus === "function") firstInvalid.focus();
        return false;
      }

      return true;
    }

    /* ===================== Anti-bot simple ==================== */

    function checkAntibotFront() {
      const timeOnPageMs = Date.now() - pageStart;

      const hpInput = root.querySelector('[data-tf-role="honeypot"]');
      const hpValue = hpInput ? (hpInput.value || "").trim() : "";

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

    /* ===================== Money + offers sync =================== */

    function updateMoney() {
      const { priceCents, totalCents } = computeProductTotals();

      // discount from active offer
      const { discountCents, payload } = computeActiveDiscountCents({
        offersList: offersCfg?.offers || [],
        totalCents,
      });

      const discountedTotalCents = Math.max(0, totalCents - (discountCents || 0));
      const grandTotalCents = discountedTotalCents + (geoShippingCents || 0);

      const prices = root.querySelectorAll('[data-tf="price"]');
      const totals = root.querySelectorAll('[data-tf="total"]');
      const shippingEls = root.querySelectorAll('[data-tf="shipping"]');
      const shippingNoteEls = root.querySelectorAll('[data-tf="shipping-note"]');
      const discountRow = root.querySelector('[data-tf="discount-row"]');
      const discountAmount = root.querySelector('[data-tf="discount"]');
      const ctas = root.querySelectorAll('[data-tf-cta="1"]');

      prices.forEach((el) => (el.textContent = moneyFmt(priceCents)));
      totals.forEach((el) => (el.textContent = moneyFmt(grandTotalCents)));

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

      shippingEls.forEach((el) => (el.textContent = shippingText));
      shippingNoteEls.forEach((el) => (el.textContent = geoNote || ""));

      const label = css(ui.orderNow || cfg.form?.buttonText || "Order now");
      const buttonIconHtml = getIconHtml(cfg.form?.buttonIcon || "CartIcon", "20px");
      const suffix = css(ui.totalSuffix || "Total:");

      ctas.forEach((el) => {
        el.innerHTML = `${buttonIconHtml}<span>${label}</span><span style="opacity:.9;">·</span><span>${suffix}</span><span>${moneyFmt(grandTotalCents)}</span>`;
      });

      // also main launcher
      const mainCta = root.querySelector('[data-tf="launcher"]');
      if (mainCta) {
        mainCta.innerHTML = `${buttonIconHtml}<span>${label}</span><span style="opacity:.9;">·</span><span>${suffix}</span><span>${moneyFmt(grandTotalCents)}</span>`;
      }
    }

    /* ============== Submit + reCAPTCHA ==================== */

    async function onSubmitClick() {
      const ab = checkAntibotFront();
      if (!ab.ok) return;

      if (!validateRequiredFields()) return;

      const totals = computeProductTotals();
      const { priceCents, totalCents, baseTotalCents, qty, variantId } = totals;

      const activeOfferPayload = getActiveOfferPayload();
      const { discountCents } = computeActiveDiscountCents({
        offersList: offersCfg?.offers || [],
        totalCents,
      });

      const discountedTotalCents = Math.max(0, totalCents - (discountCents || 0));
      const shippingCentsToSend = geoShippingCents || 0;
      const grandTotalCents = discountedTotalCents + shippingCentsToSend;

      const phone = getPhoneFields();

      let recaptchaToken = null;
      let recaptchaVersion = recaptchaCfg?.version || null;

      if (recaptchaCfg && recaptchaCfg.enabled && recaptchaCfg.version === "v3" && recaptchaCfg.siteKey) {
        try {
          await ensureRecaptchaScript(recaptchaCfg);
          if (window.grecaptcha && window.grecaptcha.execute) {
            recaptchaToken = await window.grecaptcha.execute(recaptchaCfg.siteKey, { action: "submit_cod" });
          }
        } catch {}
      }

      const countrySel = root.querySelector('select[data-tf-role="country"]');
      const selectedCountry = countrySel ? (countrySel.value || null) : null;

      const payload = {
        fields: {
          name: getFieldValueByLabel("name"),
          phone: phone.number || phone.fullPhone,
          phonePrefix: phone.prefix,
          fullPhone: phone.fullPhone,
          address: getFieldValueByLabel("address"),
          city: getFieldValueByLabel("city"),
          province: getFieldValueByLabel("wilaya") || getFieldValueByLabel("province"),
          country: selectedCountry || getFieldValueByLabel("country") || null,
          notes: getFieldValueByLabel("notes"),
        },
        productId: root.getAttribute("data-product-id") || null,
        variantId,
        qty,
        priceCents,
        baseTotalCents,
        discountCents: discountCents || 0,
        shippingCents: shippingCentsToSend,
        totalCents: discountedTotalCents,
        grandTotalCents,
        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,

        offer: activeOfferPayload
          ? {
              title: activeOfferPayload.title,
              discountType: activeOfferPayload.discountType,
              discountValue: activeOfferPayload.discountValue,
              discountApplied: discountCents || 0,
              currency: activeOfferPayload.currency || (root.getAttribute("data-currency") || null),
            }
          : null,

        geo: {
          enabled: geoEnabled,
          country: selectedCountry || geoCountryAttr || null,
          province: getFieldValueByLabel("wilaya") || getFieldValueByLabel("province"),
          city: getFieldValueByLabel("city"),
          note: geoNote,
        },

        tracking: { eventSourceUrl: window.location.href, referrer: document.referrer || null },

        recaptchaToken,
        recaptchaVersion,
      };

      const formCard = root.querySelector('[data-tf-role="form-card"]');
      const btn = formCard ? formCard.querySelector('[data-tf-cta="1"]') : null;
      const original = btn ? btn.innerHTML : "";

      try {
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = `${getIconHtml("SpinnerIcon", "18px")}<span>Sending...</span>`;
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

    /* ============== behaviors inline / popup / drawer ============ */

    let openHandler = null;

    function handleTotalsChange() {
      updateMoney();
      if (geoEnabled) recalcGeo();
    }

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

      closeBtns.forEach((b) => {
        b.addEventListener("click", (e) => {
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
        if (origin === "bottom" || origin === "top") drawer.style.transform = "translateY(0)";
        else drawer.style.transform = "translateX(0)";
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

      closeBtns.forEach((b) => {
        b.addEventListener("click", (e) => {
          e.preventDefault();
          closeDrawer();
        });
      });

      if (drawerCta) drawerCta.addEventListener("click", onSubmitClick);
    }

    // Sticky
    setupSticky(root, cfg, styleType, openHandler);

    // Hook geo recalculation when location changes
    const provSelect = root.querySelector('select[data-tf-role="province"]');
    const citySelect = root.querySelector('select[data-tf-role="city"]');
    const countrySelect = root.querySelector('select[data-tf-role="country"]');

    if (geoEnabled) {
      if (countrySelect) countrySelect.addEventListener("change", () => recalcGeo());
      if (provSelect) provSelect.addEventListener("change", () => recalcGeo());
      if (citySelect) citySelect.addEventListener("change", () => recalcGeo());
    }

    // Offers init (timers + activation)
    setTimeout(() => {
      initializeOffersUI(root, offersCfg, updateMoney);
    }, 60);

    // Auto-open
    const delay = Number(beh.openDelayMs || 0);
    if (delay > 0 && styleType !== "inline" && typeof openHandler === "function") {
      setTimeout(() => openHandler(), delay);
    }

    // first update
    updateMoney();
    if (geoEnabled) recalcGeo();

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

    const recaptchaVersion = holder.getAttribute("data-recaptcha-version") || "v3";
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

    const product = safeJsonParse(prodEl.textContent || "{}", {});
    if (!product || !product.variants) {
      console.error("[Tripleform COD] product JSON invalide");
      return;
    }

    const getVariant = () => getSelectedVariantId() || holder.getAttribute("data-variant-id");

    const doUpdate = render(holder, cfg, offersCfg, product, getVariant, moneyFmt, recaptchaCfg);

    watchVariantAndQty(() => doUpdate());
  }

  return { boot };
})();
