// ===== File: app/routes/api.offers.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GET /api.offers.load
 * Récupère la config OFFERS depuis le metafield:
 * namespace: "tripleform_cod"
 * key: "offers"
 */
export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    if (!admin) {
      return json(
        { ok: false, error: "Unauthorized: no admin session" },
        { status: 401 }
      );
    }

    // Constantes pour les valeurs par défaut
    const DEFAULT_OFFER = {
      enabled: true,
      type: "percent",
      value: 10,
      title: "",
      description: "",
      minQuantity: 2,
      minSubtotal: 0,
      requiresCode: false,
      code: "",
      maxDiscount: 0,
      shopifyProductId: "",
      productRef: "",
      imageUrl: "",
      icon: "🔥",
      showInPreview: true
    };

    const DEFAULT_UPSELL = {
      enabled: true,
      title: "",
      description: "",
      triggerType: "subtotal",
      minSubtotal: 30,
      productHandle: "",
      giftTitle: "Free Gift",
      giftNote: "Special offer",
      originalPrice: 9.99,
      isFree: true,
      shopifyProductId: "",
      productRef: "",
      imageUrl: "",
      icon: "🎁",
      showInPreview: true
    };

    const DEFAULT_CONFIG = {
      meta: { version: 8 },
      global: { 
        enabled: true, 
        currency: "MAD", 
        rounding: "none" 
      },
      offers: [JSON.parse(JSON.stringify(DEFAULT_OFFER))],
      upsells: [JSON.parse(JSON.stringify(DEFAULT_UPSELL))],
      display: {
        showOrderSummary: true,
        showOffersSection: true
      }
    };

    const QUERY = `
      query offersSettingsForAdmin {
        shop {
          metafield(namespace: "tripleform_cod", key: "offers") {
            id
            value
            type
          }
        }
      }
    `;

    const resp = await admin.graphql(QUERY);
    const data = await resp.json();
    const mf = data?.data?.shop?.metafield || null;

    let payload = DEFAULT_CONFIG;

    if (mf?.value) {
      try {
        const rawValue = JSON.parse(mf.value);
        
        // Convertir l'ancien format (s'il existe) au nouveau format
        if (rawValue && typeof rawValue === 'object') {
          // Vérifier si c'est l'ancien format (avec discount/upsell comme objets)
          if (rawValue.discount || rawValue.upsell) {
            // Conversion de l'ancien format au nouveau
            const newOffers = rawValue.discount ? [{
              ...DEFAULT_OFFER,
              enabled: rawValue.discount.enabled || false,
              type: rawValue.discount.type || "percent",
              value: rawValue.discount.value || 10,
              title: rawValue.discount.previewTitle || "",
              description: rawValue.discount.previewDescription || "",
              imageUrl: rawValue.discount.imageUrl || "",
              icon: rawValue.discount.iconEmoji || "🔥"
            }] : [DEFAULT_OFFER];
            
            const newUpsells = rawValue.upsell ? [{
              ...DEFAULT_UPSELL,
              enabled: rawValue.upsell.enabled || false,
              title: rawValue.upsell.previewTitle || "",
              description: rawValue.upsell.previewDescription || "",
              imageUrl: rawValue.upsell.imageUrl || "",
              icon: rawValue.upsell.iconEmoji || "🎁"
            }] : [DEFAULT_UPSELL];
            
            payload = {
              meta: { version: 8 },
              global: {
                enabled: rawValue.global?.enabled || true,
                currency: "MAD",
                rounding: "none"
              },
              offers: newOffers,
              upsells: newUpsells,
              display: {
                showOrderSummary: rawValue.display?.showDiscountLine !== false,
                showOffersSection: rawValue.display?.showDiscountLine !== false
              }
            };
          } else if (Array.isArray(rawValue)) {
            // Si c'est déjà un tableau (ancien format simple)
            payload = {
              ...DEFAULT_CONFIG,
              offers: rawValue.map(offer => ({
                ...DEFAULT_OFFER,
                ...offer
              }))
            };
          } else {
            // Si c'est déjà le nouveau format (avec offre/upsells comme tableaux)
            payload = {
              ...DEFAULT_CONFIG,
              ...rawValue,
              offers: Array.isArray(rawValue.offers) 
                ? rawValue.offers.map(offer => ({
                    ...DEFAULT_OFFER,
                    ...offer
                  }))
                : DEFAULT_CONFIG.offers,
              upsells: Array.isArray(rawValue.upsells)
                ? rawValue.upsells.map(upsell => ({
                    ...DEFAULT_UPSELL,
                    ...upsell
                  }))
                : DEFAULT_CONFIG.upsells
            };
          }
        }
      } catch (e) {
        console.warn("[Tripleform COD] offers metafield JSON invalide, utilisation des valeurs par défaut:", e);
      }
    }

    return json({ ok: true, offers: payload });
  } catch (e) {
    console.error("api.offers.load error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

export const action = loader;