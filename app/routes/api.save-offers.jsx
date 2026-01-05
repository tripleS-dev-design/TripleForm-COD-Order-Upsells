// ===== File: app/routes/api.save-offers.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // ⬅️ ON SAUVEGARDE TOUT LE CONFIG
    const payload = await request.json();

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) {
      return json({ ok: false, error: "No shopId" }, { status: 400 });
    }

    const mfRes = await admin.graphql(
      `mutation metafieldsSet($metafields:[MetafieldsSetInput!]!) {
        metafieldsSet(metafields:$metafields) {
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace: "tripleform_cod",
              key: "offers",
              type: "json",
              value: JSON.stringify(payload), // ✅ TOUT LE CONFIG
              ownerId: shopId,
            },
          ],
        },
      }
    );

    const mfJson = await mfRes.json();
    const errors = mfJson?.data?.metafieldsSet?.userErrors || [];
    if (errors.length) {
      return json({ ok: false, errors }, { status: 400 });
    }

    return json({ ok: true });
  } catch (e) {
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
