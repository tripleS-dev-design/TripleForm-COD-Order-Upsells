// ===== File: app/routes/api.pixels.save.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const { pixels } = await request.json(); // { fb, tiktok, capi_fb, tiktok_api, ... }

    // 1) Récupérer l'ID du shop
    const shopRes = await admin.graphql(`
      query GetShopId {
        shop { id }
      }
    `);
    const shopJson = await shopRes.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) {
      return json({ ok: false, error: "No shopId" }, { status: 400 });
    }

    // 2) Sauvegarder en metafield JSON
    const mfRes = await admin.graphql(
      `#graphql
      mutation SavePixels($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            key
            namespace
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              ownerId: shopId,
              namespace: "tripleform_cod",
              key: "pixels",
              type: "json",
              value: JSON.stringify(pixels || {}),
            },
          ],
        },
      },
    );

    const mfJson = await mfRes.json();
    const errs = mfJson?.data?.metafieldsSet?.userErrors || [];
    if (errs.length) {
      return json(
        { ok: false, errors: errs },
        { status: 400 },
      );
    }

    return json({ ok: true });
  } catch (e) {
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 },
    );
  }
};
