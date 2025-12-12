// ===== File: app/routes/api.antibot.save.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * POST /api/antibot/save
 * Body JSON: { antibot: { ...config... } }
 * Sauvegarde dans shop.metafields (namespace tripleform_cod, key antibot, type json)
 */
export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    if (!admin) {
      return json(
        { ok: false, error: "Unauthorized: no admin session" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return json(
        { ok: false, error: "Missing or invalid JSON body" },
        { status: 400 }
      );
    }

    const antibot = body.antibot;
    if (!antibot || typeof antibot !== "object") {
      return json(
        { ok: false, error: "Missing 'antibot' object in body" },
        { status: 400 }
      );
    }

    // petit garde-fou : si meta/version absent, on l'ajoute
    const normalized = {
      meta: {
        version: Number(antibot?.meta?.version || 4),
      },
      ...antibot,
    };

    const value = JSON.stringify(normalized);

    // === 1) Récupérer l'ID du shop pour ownerId ===
    const SHOP_ID_QUERY = `
      query GetShopIdForAntibot {
        shop {
          id
        }
      }
    `;
    const shopResp = await admin.graphql(SHOP_ID_QUERY);
    const shopJson = await shopResp.json();
    const shopId = shopJson?.data?.shop?.id || null;

    if (!shopId) {
      console.error("api.antibot.save — impossible de récupérer shop.id", shopJson);
      return json(
        {
          ok: false,
          error: "Unable to resolve shop.id for metafieldsSet (ownerId is required).",
        },
        { status: 500 }
      );
    }

    // === 2) Mutation metafieldsSet avec ownerId obligatoire ===
    const MUTATION = `
      mutation antibotMetafieldSave($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            type
            owner {
              ... on Shop {
                id
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const resp = await admin.graphql(MUTATION, {
      variables: {
        metafields: [
          {
            ownerId: shopId,          // <<<<<< OBLIGATOIRE MAINTENANT
            namespace: "tripleform_cod",
            key: "antibot",
            type: "json",
            value,
          },
        ],
      },
    });

    const data = await resp.json();
    const mfSet = data?.data?.metafieldsSet;
    const errs = mfSet?.userErrors || [];

    if (errs.length > 0) {
      console.error("api.antibot.save metafieldsSet userErrors:", errs);
      return json(
        {
          ok: false,
          error: errs[0]?.message || "metafieldsSet error",
          details: errs,
        },
        { status: 400 }
      );
    }

    return json({ ok: true });
  } catch (e) {
    console.error("api.antibot.save error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};
