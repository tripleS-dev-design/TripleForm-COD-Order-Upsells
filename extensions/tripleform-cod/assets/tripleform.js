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
  /* Pays / wilayas / villes                                            */
  /* ------------------------------------------------------------------ */

  const COUNTRY_DATA = {
    ma: {
      label: "Maroc",
      phonePrefix: "+212",
      provinces: [
        {
          id: "casablanca",
          name: "Casablanca-Settat",
          cities: [
            "Casablanca",
            "Mohammedia",
            "Settat",
            "Berrechid",
            "El Jadida",
          ],
        },
        {
          id: "rabat",
          name: "Rabat-Salé-Kénitra",
          cities: ["Rabat", "Salé", "Kénitra", "Témara", "Khémisset"],
        },
        {
          id: "tanger",
          name: "Tanger-Tétouan-Al Hoceïma",
          cities: ["Tanger", "Tétouan", "Al Hoceïma", "Larache", "Martil"],
        },
        {
          id: "fes",
          name: "Fès-Meknès",
          cities: ["Fès", "Meknès", "Ifrane", "Sefrou"],
        },
        {
          id: "marrakech",
          name: "Marrakech-Safi",
          cities: ["Marrakech", "Safi", "Essaouira", "Chichaoua"],
        },
        {
          id: "oriental",
          name: "L'Oriental",
          cities: ["Oujda", "Nador", "Berkane"],
        },
        {
          id: "souss",
          name: "Souss-Massa",
          cities: ["Agadir", "Inezgane", "Taroudant"],
        },
        {
          id: "beni-mellal",
          name: "Béni Mellal-Khénifra",
          cities: ["Béni Mellal", "Khénifra"],
        },
        {
          id: "draa-tafilalet",
          name: "Drâa-Tafilalet",
          cities: ["Errachidia", "Ouarzazate", "Zagora"],
        },
        {
          id: "guelmim",
          name: "Guelmim-Oued Noun",
          cities: ["Guelmim"],
        },
        {
          id: "laayoune",
          name: "Laâyoune-Sakia El Hamra",
          cities: ["Laâyoune", "Boujdour"],
        },
        {
          id: "dakhla",
          name: "Dakhla-Oued Ed Dahab",
          cities: ["Dakhla"],
        },
      ],
    },

    dz: {
      label: "Algérie",
      phonePrefix: "+213",
      provinces: [
        {
          id: "alger",
          name: "Alger",
          cities: ["Alger", "Bab Ezzouar", "Kouba", "Hussein Dey"],
        },
        { id: "oran", name: "Oran", cities: ["Oran", "Es Senia", "Bir El Djir"] },
        {
          id: "constantine",
          name: "Constantine",
          cities: ["Constantine", "El Khroub"],
        },
        { id: "setif", name: "Sétif", cities: ["Sétif", "El Eulma"] },
        {
          id: "blida",
          name: "Blida",
          cities: ["Blida", "Boufarik", "Mouzaïa"],
        },
        { id: "annaba", name: "Annaba", cities: ["Annaba", "El Bouni"] },
        { id: "tlemcen", name: "Tlemcen", cities: ["Tlemcen", "Maghnia"] },
        { id: "bejaia", name: "Béjaïa", cities: ["Béjaïa", "Akbou"] },
        { id: "batna", name: "Batna", cities: ["Batna"] },
        { id: "tiaret", name: "Tiaret", cities: ["Tiaret"] },
      ],
    },

    tn: {
      label: "Tunisie",
      phonePrefix: "+216",
      provinces: [
        { id: "tunis", name: "Tunis", cities: ["Tunis", "La Marsa", "Carthage"] },
        { id: "ariana", name: "Ariana", cities: ["Ariana", "Raoued"] },
        {
          id: "ben-arous",
          name: "Ben Arous",
          cities: ["Ben Arous", "Ezzahra"],
        },
        { id: "manouba", name: "Manouba", cities: ["Manouba", "Douar Hicher"] },
        { id: "sfax", name: "Sfax", cities: ["Sfax", "Sakiet Ezzit"] },
        {
          id: "sousse",
          name: "Sousse",
          cities: ["Sousse", "Hammam Sousse"],
        },
        {
          id: "monastir",
          name: "Monastir",
          cities: ["Monastir", "Sahline"],
        },
        { id: "nabeul", name: "Nabeul", cities: ["Nabeul", "Hammamet"] },
        {
          id: "bizerte",
          name: "Bizerte",
          cities: ["Bizerte", "Menzel Bourguiba"],
        },
        { id: "gabes", name: "Gabès", cities: ["Gabès"] },
        { id: "gafsa", name: "Gafsa", cities: ["Gafsa"] },
        { id: "kairouan", name: "Kairouan", cities: ["Kairouan"] },
        { id: "kasserine", name: "Kasserine", cities: ["Kasserine"] },
      ],
    },
  };

  function getCountryDef(beh) {
    const raw =
      beh && (beh.country || beh.codCountry)
        ? beh.country || beh.codCountry
        : "ma";

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
          maxWidth: "400px",
          maxHeight: "70vh",
          cardMaxHeight: "calc(70vh - 48px)",
        };
      case "lg":
        return {
          maxWidth: "520px",
          maxHeight: "85vh",
          cardMaxHeight: "calc(85vh - 48px)",
        };
      case "full":
        return {
          maxWidth: "100%",
          maxHeight: "100vh",
          cardMaxHeight: "calc(100vh - 48px)",
        };
      default:
        return {
          maxWidth: "440px",
          maxHeight: "78vh",
          cardMaxHeight: "calc(78vh - 48px)",
        };
    }
  }

  function drawerSizeConfig(beh) {
    const size = beh?.drawerSize || "md";
    switch (size) {
      case "sm":
        return {
          sideWidth: "min(340px,100%)",
          edgeHeight: "min(420px,100%)",
        };
      case "lg":
        return {
          sideWidth: "min(460px,100%)",
          edgeHeight: "min(640px,100%)",
        };
      case "full":
        return {
          sideWidth: "100%",
          edgeHeight: "100%",
        };
      default:
        return {
          sideWidth: "min(380px,100%)",
          edgeHeight: "min(520px,100%)",
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

    const prev = document.querySelector(`[data-tf-sticky-for="${root.id}"]`);
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (stickyType === "none") return;

    const d = cfg.design || {};
    const bg = d.btnBg || "#111827";
    const text = d.btnText || "#FFFFFF";
    const br = d.btnBorder || bg;

    const el = document.createElement("div");
    el.setAttribute("data-tf-sticky-for", root.id);

    const baseStyle = `
      position:fixed;
      z-index:9999;
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
          <span>Quick COD — ${
            styleType === "inline" ? "scroll to form" : "open form"
          }</span>
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
          ">
            ${stickyLabel}
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
        ">
          ${stickyLabel}
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
  /* OFFRES / UPSELL – rendu front                                      */
  /* ------------------------------------------------------------------ */

  function buildOffersHtml(offersCfg) {
    if (!offersCfg || typeof offersCfg !== "object") return "";

    const global = offersCfg.global || {};
    if (!global.enabled) return "";

    const display = offersCfg.display || {};
    const discount = offersCfg.discount || {};
    const upsell = offersCfg.upsell || {};
    const theme = offersCfg.theme || {};

    const showDiscount =
      !!discount.enabled && display.showDiscountLine !== false;
    const showUpsell =
      !!upsell.enabled && display.showUpsellLine !== false;

    if (!showDiscount && !showUpsell) return "";

    const offerBg = css(theme.offerBg || "#FFFFFF");
    const upsellBg = css(theme.upsellBg || "#FFFFFF");

    let html = "";

    // OFFRE (remise)
    if (showDiscount) {
      const title = discount.previewTitle || "Produit avec remise";
      const desc =
        discount.previewDescription ||
        "Remise appliquée automatiquement sur ce produit.";
      const img = discount.imageUrl || "";
      const iconEmoji = discount.iconEmoji || discount.icon || "";
      const iconUrl = discount.iconUrl || "";

      html +=
        '<div style="border-radius:16px;background:' +
        offerBg +
        ';padding:10px 12px;border:1px solid #E5E7EB;box-shadow:0 12px 28px rgba(15,23,42,.16);display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:center;">';
      html +=
        '<div style="width:64px;height:64px;border-radius:18px;overflow:hidden;border:1px solid rgba(248,250,252,.6);display:flex;align-items:center;justify-content:center;">';
      if (img) {
        html +=
          '<img src="' +
          css(img) +
          '" alt="Produit offre" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" />';
      } else {
        html +=
          '<div style="width:100%;height:100%;border-radius:18px;background:linear-gradient(135deg,#3B82F6 0%,#A855F7 40%,#F97316 100%);"></div>';
      }
      html += "</div>";
      html += "<div>";
      html +=
        '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.9;display:flex;align-items:center;gap:6px;">';
      if (iconUrl) {
        html +=
          '<span style="width:22px;height:22px;border-radius:999px;overflow:hidden;display:inline-grid;place-items:center;"><img src="' +
          css(iconUrl) +
          '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" /></span>';
      } else if (iconEmoji) {
        html +=
          '<span style="width:22px;height:22px;border-radius:999px;display:inline-grid;place-items:center;font-size:13px;">' +
          css(iconEmoji) +
          "</span>";
      }
      html += "<span>OFFRE — Produit avec remise</span>";
      html += "</div>";
      html +=
        '<div style="font-size:13px;font-weight:600;margin-top:2px;">' +
        css(title) +
        "</div>";
      html +=
        '<div style="font-size:12px;margin-top:1px;opacity:.9;">' +
        css(desc) +
        "</div>";

      html +=
        '<div style="margin-top:6px;">' +
        '<button type="button" data-tf-discount-toggle="1" data-tf-active="0" style="margin-top:4px;font-size:11px;padding:4px 10px;border-radius:999px;border:1px solid #0F172A;background:#0F172A;color:#F9FAFB;cursor:pointer;opacity:.9;">' +
        "Activer cette offre" +
        "</button>" +
        "</div>";

      html += "</div></div>";
    }

    // CADEAU / UPSELL
    if (showUpsell) {
      const title = upsell.previewTitle || "Cadeau offert";
      const desc =
        upsell.previewDescription ||
        "Cadeau gratuit ajouté automatiquement à la commande.";
      const img = upsell.imageUrl || "";
      const iconEmoji = upsell.iconEmoji || upsell.icon || "";
      const iconUrl = upsell.iconUrl || "";

      html +=
        '<div style="border-radius:16px;background:' +
        upsellBg +
        ';padding:10px 12px;border:1px solid #E5E7EB;box-shadow:0 12px 28px rgba(15,23,42,.16);display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:center;">';
      html +=
        '<div style="width:64px;height:64px;border-radius:18px;overflow:hidden;border:1px solid rgba(248,250,252,.6);display:flex;align-items:center;justify-content:center;">';
      if (img) {
        html +=
          '<img src="' +
          css(img) +
          '" alt="Produit cadeau" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" />';
      } else {
        html +=
          '<div style="width:100%;height:100%;border-radius:18px;background:linear-gradient(135deg,#EC4899 0%,#F97316 40%,#22C55E 100%);"></div>';
      }
      html += "</div>";
      html += "<div>";
      html +=
        '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;opacity:.9;display:flex;align-items:center;gap:6px;">';
      if (iconUrl) {
        html +=
          '<span style="width:22px;height:22px;border-radius:999px;overflow:hidden;display:inline-grid;place-items:center;"><img src="' +
          css(iconUrl) +
          '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" /></span>';
      } else if (iconEmoji) {
        html +=
          '<span style="width:22px;height:22px;border-radius:999px;display:inline-grid;place-items:center;font-size:13px;">' +
          css(iconEmoji) +
          "</span>";
      }
      html += "<span>CADEAU — Produit offert / upsell</span>";
      html += "</div>";
      html +=
        '<div style="font-size:13px;font-weight:600;margin-top:2px;">' +
        css(title) +
        "</div>";
      html +=
        '<div style="font-size:12px;margin-top:1px;opacity:.9;">' +
        css(desc) +
        "</div>";
      html += "</div></div>";
    }

    return '<div style="display:grid;gap:10px;">' + html + "</div>";
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
    let geoShippingCents = 0;
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
    `;
    const inputStyle = `
      width:100%; padding:10px 12px;
      border-radius:${+d.btnRadius || 10}px;
      border:1px solid ${css(d.inputBorder)};
      background:${css(d.inputBg)};
      color:${css(d.text)};
      outline:none;
      text-align:${fieldAlign};
      font-size:${inputFontSize}px;
    `;
    const btnStyle = `
      width:100%;
      height:${+d.btnHeight || 46}px;
      border-radius:${+d.btnRadius || 10}px;
      border:1px solid ${css(d.btnBorder)};
      color:${css(d.btnText)};
      background:${css(d.btnBg)};
      font-weight:700;
      letter-spacing:.2px;
      box-shadow:${btnShadow};
      font-size:${inputFontSize}px;
    `;
    const cartBoxStyle = `
      background:${css(d.cartBg)};
      border:1px solid ${css(d.cartBorder)};
      border-radius:12px;
      padding:14px;
      box-shadow:${cartShadow};
      font-size:${labelFontSize};
      direction:${textDir};
    `;
    const cartTitleStyle = `
      font-weight:700;
      margin-bottom:10px;
      color:${css(d.cartTitleColor)};
      font-size:${labelFontSize};
      text-align:${titleAlign};
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
    `;

    const offersHtml = buildOffersHtml(offersCfg || {});

    const globalOffers = (offersCfg && offersCfg.global) || {};
    const discountCfg = (offersCfg && offersCfg.discount) || {};
    const displayOffers = (offersCfg && offersCfg.display) || {};
    const hasDiscountRow =
      !!globalOffers.enabled &&
      !!discountCfg.enabled &&
      displayOffers.showDiscountLine !== false;

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

      const req = field.required ? " *" : "";
      const label = (field.label || key) + req;
      const ph = field.ph || "";
      const requiredAttr = field.required ? " required" : "";

      if (key === "province") {
        return `
          <label style="display:grid; gap:6px; text-align:${fieldAlign};">
            <span style="font-size:${labelFontSize}; color:#475569;">${css(
              label
            )}</span>
            <select data-tf-role="province" data-tf-field="${key}" style="${inputStyle}"${requiredAttr}>
              <option value="">${css(ph || "Wilaya / Province")}</option>
            </select>
          </label>
        `;
      }

      if (key === "city") {
        return `
          <label style="display:grid; gap:6px; text-align:${fieldAlign};">
            <span style="font-size:${labelFontSize}; color:#475569;">${css(
              label
            )}</span>
            <select data-tf-role="city" data-tf-field="${key}" style="${inputStyle}"${requiredAttr}>
              <option value="">${css(ph || "Select province first")}</option>
            </select>
          </label>
        `;
      }

      if (field.type === "textarea") {
        return `
          <label style="display:grid; gap:6px; text-align:${fieldAlign};">
            <span style="font-size:${labelFontSize}; color:#475569;">${css(
              label
            )}</span>
            <textarea data-tf-field="${key}" style="${inputStyle}" rows="3" placeholder="${css(
          ph
        )}"${requiredAttr}></textarea>
          </label>
        `;
      }

      if (field.type === "tel") {
        const prefix = field.prefix
          ? `<input style="${inputStyle} text-align:center;" value="${css(
              field.prefix
            )}" readonly />`
          : "";
        const grid = field.prefix ? "minmax(88px,130px) 1fr" : "1fr";

        return `
          <label style="display:grid; gap:6px; text-align:${fieldAlign};">
            <span style="font-size:${labelFontSize}; color:#475569;">${css(
              label
            )}</span>
            <div style="display:grid; grid-template-columns:${grid}; gap:8px;">
              ${prefix}
              <input type="tel" data-tf-field="${key}" style="${inputStyle}" placeholder="${css(
          ph
        )}"${requiredAttr} />
            </div>
          </label>
        `;
      }

      const typeAttr =
        field.type === "number" ? 'type="number"' : 'type="text"';

      return `
        <label style="display:grid; gap:6px; text-align:${fieldAlign};">
          <span style="font-size:${labelFontSize}; color:#475569;">${css(
            label
          )}</span>
          <input ${typeAttr} data-tf-field="${key}" style="${inputStyle}" placeholder="${css(
        ph
      )}"${requiredAttr} />
        </label>
      `;
    }

    function fieldsBlockHTML() {
      return orderedFieldKeys()
        .map((k) => fieldHTML(k))
        .join("");
    }

    function cartSummaryHTML() {
      return `
        <div style="${cartBoxStyle}">
          <div style="${cartTitleStyle}">${css(t.top || "Order summary")}</div>
          <div style="display:grid; gap:8px;">
            <div style="${rowStyle}">
              <div>${css(t.price || "Product price")}</div>
              <div style="font-weight:700;" data-tf="price">—</div>
            </div>
            ${
              hasDiscountRow
                ? `
            <div style="${rowStyle}">
              <div>${css(t.discount || "Offer discount")}</div>
              <div style="font-weight:700;" data-tf="discount">—</div>
            </div>`
                : ""
            }
            <div style="${rowStyle}">
              <div>
                <div>${css(t.shipping || "Shipping price")}</div>
                <div data-tf="shipping-note" style="font-size:${tinyFontSize};opacity:.8;margin-top:2px;"></div>
              </div>
              <div style="font-weight:700;" data-tf="shipping">Gratuit</div>
            </div>
            <div style="${rowStyle}">
              <div>${css(t.total || "Total")}</div>
              <div style="font-weight:700;" data-tf="total">—</div>
            </div>
          </div>
        </div>
      `;
    }

    function formCardHTML(ctaKey) {
      const orderLabel = css(
        ui.orderNow || cfg.form?.buttonText || "Order now"
      );
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

      return `
        <div style="${cardStyle}" data-tf-role="form-card">
          ${
            cfg.form?.title || cfg.form?.subtitle
              ? `
            <div style="text-align:${titleAlign}; margin-bottom:10px;">
              ${
                cfg.form?.title
                  ? `<div style="font-weight:700; font-size:${labelFontSize};">${css(
                      cfg.form.title
                    )}</div>`
                  : ""
              }
              ${
                cfg.form?.subtitle
                  ? `<div style="opacity:.8; font-size:${smallFontSize};">${css(
                      cfg.form.subtitle
                    )}</div>`
                  : ""
              }
            </div>`
              : ""
          }

          <div style="display:grid; gap:10px; position:relative;">
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
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151;">
                <input type="checkbox" /> ${css(
                  beh.gdprLabel || "I accept the privacy policy"
                )}
              </label>`
                : ""
            }

            ${
              beh?.whatsappOptIn
                ? `
              <label style="display:flex; gap:8px; align-items:center; font-size:${smallFontSize}; color:#374151;">
                <input type="checkbox" /> ${css(
                  beh.whatsappLabel || "Receive confirmation on WhatsApp"
                )}
              </label>`
                : ""
            }

            <button
              type="button"
              style="${btnStyle}"
              data-tf-cta="1"
              data-tf="${ctaKey}"
            >
              ${orderLabel} · ${suffix} …
            </button>
          </div>
        </div>
      `;
    }

    const mainStart = `<div style="max-width:560px;margin:0 auto;display:grid;gap:12px;direction:${textDir};">`;
    const mainEnd = "</div>";

    let html = "";

    if (styleType === "inline") {
      html =
        mainStart +
        offersHtml +
        cartSummaryHTML() +
        '<div style="height:8px"></div>' +
        formCardHTML("cta-inline") +
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
            ${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(
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
        <div
          data-tf-role="popup"
          style="
            position:fixed;
            inset:0;
            display:none;
            align-items:center;
            justify-content:center;
            z-index:9999;
            background:${ovBg};
          "
        >
          <div style="
            width:100%;
            max-width:${popupCfg.maxWidth};
            max-height:${popupCfg.maxHeight};
            padding:16px;
            box-sizing:border-box;
          ">
            <div style="text-align:right; margin-bottom:8px;">
              <button
                type="button"
                data-tf="close"
                style="background:transparent; border:none; color:#e5e7eb; font-size:24px; cursor:pointer;"
              >&times;</button>
            </div>
            <div style="
              background:${css(d.bg)};
              border-radius:${+d.radius || 12}px;
              box-shadow:${cardShadow};
              padding:16px;
              max-height:${popupCfg.cardMaxHeight};
              overflow:auto;
            ">
              <div style="max-width:560px;margin:0 auto;display:grid;gap:12px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="height:8px"></div>
                ${formCardHTML("cta-popup")}
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
            ${css(ui.orderNow || cfg.form?.buttonText || "Order now")} · ${css(
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
        <div
          data-tf-role="drawer-overlay"
          style="
            position:fixed;
            inset:0;
            display:none;
            z-index:9999;
            background:${ovBg};
            overflow:hidden;
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
              padding:16px;
              box-sizing:border-box;
              transform:translateX(100%);
              transition:transform 260ms ease;
            "
          >
            <div style="text-align:right; margin-bottom:8px;">
              <button
                type="button"
                data-tf="close"
                style="background:transparent; border:none; color:#020617; font-size:24px; cursor:pointer;"
              >&times;</button>
            </div>
            <div style="overflow:auto; flex:1; padding-right:4px;">
              <div style="max-width:560px;margin:0 auto;display:grid;gap:12px;direction:${textDir};">
                ${offersHtml}
                ${cartSummaryHTML()}
                <div style="height:8px"></div>
                ${formCardHTML("cta-drawer")}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = html;

    // Appliquer la taille de texte sur tous les champs (sécurité)
    Array.from(root.querySelectorAll("input, textarea, select")).forEach(
      (el) => {
        el.style.fontSize = inputFontSize + "px";
      }
    );

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

    function isDiscountActive() {
      const btn = root.querySelector('[data-tf-discount-toggle]');
      return !!(btn && btn.getAttribute("data-tf-active") === "1");
    }

    // ✅ Prix corrigé produit (centimes)
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
          // "200.00" → devise → centimes
          if (rawStr.includes(".")) {
            priceCents = Math.round(rawNum * 100);
          } else {
            // déjà en centimes
            priceCents = Math.round(rawNum);
          }
        }
      }

      const baseTotalCents = priceCents * qty;

      let discountCents = 0;
      if (hasDiscountRow && isDiscountActive()) {
        const type = discountCfg.type || "percent";
        const val =
          Number(
            discountCfg.value != null ? discountCfg.value : discountCfg.percent
          ) || 0;

        if (val > 0) {
          if (type === "fixed") {
            // remise fixe en devise -> centimes
            discountCents = Math.round(val * 100);
          } else {
            // remise en %
            discountCents = Math.round((baseTotalCents * val) / 100);
          }
        }

        if (discountCents < 0) discountCents = 0;
        if (discountCents > baseTotalCents) discountCents = baseTotalCents;
      }

      const totalCents = baseTotalCents - discountCents;

      return {
        priceCents,
        totalCents,
        discountCents,
        baseTotalCents,
        qty,
        variantId: vId,
      };
    }
    // ✅ Shipping GEO: appel GET vers /apps/tripleform-cod/api/geo/calc
    async function recalcGeo() {
      if (!geoEnabled || !geoEndpoint) {
        geoShippingCents = 0;
        geoNote = "";
        updateMoney();
        return;
      }

      const reqId = ++geoRequestId;
      const totals = computeProductTotals();
      const baseTotalCents = totals.totalCents; // total produit après remise

      const province =
        getFieldValueByLabel("wilaya") || getFieldValueByLabel("province");
      const city = getFieldValueByLabel("city");

      try {
        // Construire l’URL avec query string
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

        if (reqId !== geoRequestId) return; // ancienne requête dépassée

        if (!res.ok || json.ok === false) {
          console.warn(
            "[Tripleform COD] geo calc error:",
            json.error || res.statusText
          );
          geoShippingCents = 0;
          geoNote = "";
        } else {
          let shippingCents = 0;
          let codFeeCents = 0;

          const shippingObj = json.shipping || {};

          // montant principal (en devise -> centimes)
          if (shippingObj && shippingObj.amount != null) {
            const amount = Number(shippingObj.amount);
            if (Number.isFinite(amount) && amount > 0) {
              shippingCents = Math.round(amount * 100);
            }
          }

          // frais COD éventuels (en devise -> centimes)
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
        geoShippingCents = 0;
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

          // style erreur
          el.style.borderColor = "#ef4444";
          el.style.boxShadow = "0 0 0 1px rgba(239,68,68,0.35)";
        } else {
          // reset style si OK
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

    /* ===================== Money + UI =============================== */

    function updateMoney() {
      const { priceCents, totalCents, discountCents } = computeProductTotals();
      const grandTotalCents = totalCents + (geoShippingCents || 0);

      const prices = root.querySelectorAll('[data-tf="price"]');
      const totals = root.querySelectorAll('[data-tf="total"]');
      const discountEls = root.querySelectorAll('[data-tf="discount"]');
      const shippingEls = root.querySelectorAll('[data-tf="shipping"]');
      const shippingNoteEls = root.querySelectorAll(
        '[data-tf="shipping-note"]'
      );
      const ctas = root.querySelectorAll('[data-tf-cta="1"]');

      prices.forEach((el) => (el.textContent = moneyFmt(priceCents)));
      totals.forEach((el) => (el.textContent = moneyFmt(grandTotalCents)));

      if (discountEls.length) {
        const txt = discountCents ? "-" + moneyFmt(discountCents) : "—";
        discountEls.forEach((el) => (el.textContent = txt));
      }

      const shippingText = geoShippingCents
        ? moneyFmt(geoShippingCents)
        : "Gratuit";

      shippingEls.forEach((el) => (el.textContent = shippingText));
      shippingNoteEls.forEach((el) => {
        el.textContent = geoNote || "";
      });

      const label = css(
        ui.orderNow || cfg.form?.buttonText || "Order now"
      );
      const suffix = css(ui.totalSuffix || "Total:");
      ctas.forEach((el) => {
        el.textContent = `${label} · ${suffix} ${moneyFmt(grandTotalCents)}`;
      });
    }

    function setupOffersInteractions(handleTotalsChange) {
      const discountBtn = root.querySelector('[data-tf-discount-toggle]');
      if (discountBtn) {
        discountBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const active = discountBtn.getAttribute("data-tf-active") === "1";
          if (active) {
            discountBtn.setAttribute("data-tf-active", "0");
            discountBtn.style.opacity = "0.9";
            discountBtn.style.boxShadow = "none";
          } else {
            discountBtn.setAttribute("data-tf-active", "1");
            discountBtn.style.opacity = "1";
            discountBtn.style.boxShadow =
              "0 0 0 1px rgba(15,23,42,.18)";
          }
          handleTotalsChange();
        });
      }
    }

    /* ============== Collect & submit + reCAPTCHA ==================== */

    async function onSubmitClick() {
      const ab = checkAntibotFront();
      if (!ab.ok) return;

      // 🔴 Validation des champs requis
      if (!validateRequiredFields()) return;

      const totals = computeProductTotals();
      const {
        priceCents,
        totalCents,
        discountCents,
        baseTotalCents,
        qty,
        variantId,
      } = totals;

      const shippingCentsToSend = geoShippingCents || 0;
      const grandTotalCents = totalCents + shippingCentsToSend;

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
        discountApplied: discountCents > 0,
        shippingCents: shippingCentsToSend,
        totalCents, // produit après remise
        grandTotalCents,
        currency: root.getAttribute("data-currency") || null,
        locale: root.getAttribute("data-locale") || null,

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
      const original = btn ? btn.textContent : "";

      try {
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Sending...";
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
            btn.textContent = css(
              cfg.form?.successText || "Thanks! We'll contact you"
            );
          }
        } else {
          if (btn) {
            btn.disabled = false;
            btn.textContent = original;
          }
          alert(
            "Erreur: " +
              (json?.error || res.statusText || "Submit failed")
          );
        }
      } catch (e) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
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
        };
        launcher.addEventListener("click", (e) => {
          e.preventDefault();
          openHandler();
        });
      }

      if (popup && beh.closeOnOutside !== false) {
        popup.addEventListener("click", (e) => {
          if (e.target === popup) popup.style.display = "none";
        });
      }

      closeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          if (popup) popup.style.display = "none";
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
      const { edgeHeight } = drawerCfg;

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
          drawer.style.height = edgeHeight;
          drawer.style.width = "100%";
          hiddenTransform = "translateY(100%)";
        } else if (origin === "top") {
          drawer.style.left = "0";
          drawer.style.right = "0";
          drawer.style.top = "0";
          drawer.style.bottom = "auto";
          drawer.style.height = edgeHeight;
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

    // offres
    setupOffersInteractions(handleTotalsChange);

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
