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

    let payload = null;

    if (mf?.value) {
      try {
        payload = JSON.parse(mf.value);
      } catch (e) {
        console.warn("[Tripleform COD] offers metafield JSON invalide:", e);
      }
    }

    // Config par défaut si rien en base
    const DEFAULT_OFFERS = {
      meta: { version: 1 },
      global: { enabled: false },
      display: {
        showDiscountLine: true,
        showUpsellLine: true,
      },
      discount: {
        enabled: false,
        type: "percent", // "percent" | "fixed"
        value: 10,
        previewTitle: "Produit avec remise",
        previewDescription: "Remise appliquée automatiquement sur ce produit.",
        imageUrl: "",
        iconEmoji: "🔥",
        iconUrl: "",
      },
      upsell: {
        enabled: false,
        previewTitle: "Cadeau offert",
        previewDescription: "Un cadeau gratuit sera ajouté à la commande.",
        imageUrl: "",
        iconEmoji: "🎁",
        iconUrl: "",
      },
      theme: {
        offerBg: "#FFFFFF",
        upsellBg: "#FFFFFF",
      },
    };

    const offers =
      payload && typeof payload === "object"
        ? { ...DEFAULT_OFFERS, ...payload }
        : DEFAULT_OFFERS;

    // Toujours renvoyer un objet stable
    return json({ ok: true, offers });
  } catch (e) {
    console.error("api.offers.load error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

export const action = loader; // au cas où tu fais un POST test, ça renvoie pareil
