// ===== File: app/routes/api.save-offers.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // ✅ receive FULL config (global + offers + upsells + thankYou + meta)
    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) return json({ ok: false, error: "No shopId" }, { status: 400 });

    const mfRes = await admin.graphql(
      `mutation metafieldsSet($metafields:[MetafieldsSetInput!]!) {
        metafieldsSet(metafields:$metafields) {
          metafields { id key namespace }
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
              value: JSON.stringify(payload),
              ownerId: shopId,
            },
          ],
        },
      }
    );

    const mfJson = await mfRes.json();
    const errs = mfJson?.data?.metafieldsSet?.userErrors || [];
    if (errs.length) return json({ ok: false, errors: errs }, { status: 400 });

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
