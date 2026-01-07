// app/routes/api.save-settings.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Robust save:
 * - accepts settings as object OR JSON string
 * - validates serializability + size
 * - returns detailed userErrors
 */
export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    let settings = body?.settings;

    // Accept settings sent as a JSON string (avoid double-stringify issues)
    if (typeof settings === "string") {
      try {
        settings = JSON.parse(settings);
      } catch {
        return json({ ok: false, error: "Invalid settings JSON string" }, { status: 400 });
      }
    }

    if (!settings || typeof settings !== "object") {
      return json({ ok: false, error: "Missing settings object" }, { status: 400 });
    }

    // Normalize layout orders if present (avoid NaN / weird values)
    if (settings?.meta?.layout) {
      const normOrder = (v, fallback) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return fallback;
        const i = Math.max(1, Math.min(3, Math.round(n)));
        return i;
      };
      const normPos = (v, fallback) => {
        const s = String(v || "").toLowerCase();
        if (s === "top" || s === "bottom" || s === "hide") return s;
        return fallback;
      };

      const l = settings.meta.layout;
      if (l.orderSummary) {
        l.orderSummary.order = normOrder(l.orderSummary.order, 1);
        l.orderSummary.position = normPos(l.orderSummary.position, "top");
      }
      if (l.offers) {
        l.offers.order = normOrder(l.offers.order, 2);
        l.offers.position = normPos(l.offers.position, "top");
      }
      if (l.upsells) {
        l.upsells.order = normOrder(l.upsells.order, 3);
        l.upsells.position = normPos(l.upsells.position, "top");
      }
    }

    // shop id
    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) return json({ ok: false, error: "No shopId" }, { status: 400 });

    // Serialize once
    let value = "";
    try {
      value = JSON.stringify(settings);
    } catch (e) {
      return json(
        { ok: false, error: "Settings not serializable (JSON.stringify failed)" },
        { status: 400 }
      );
    }

    // Shopify metafield json value limit is roughly 64KB
    const bytes =
      typeof Buffer !== "undefined"
        ? Buffer.byteLength(value, "utf8")
        : new TextEncoder().encode(value).length;

    if (bytes > 65000) {
      return json(
        {
          ok: false,
          error: `Settings too large (${bytes} bytes). Reduce data (remove big lists / texts).`,
          bytes,
        },
        { status: 413 }
      );
    }

    // write metafield
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
              key: "settings",
              type: "json",
              value,
              ownerId: shopId,
            },
          ],
        },
      }
    );

    const mfJson = await mfRes.json();

    // GraphQL top-level errors
    const gqlErrors = mfJson?.errors || [];
    if (gqlErrors.length) {
      return json(
        { ok: false, error: gqlErrors?.[0]?.message || "GraphQL error", bytes },
        { status: 500 }
      );
    }

    const errs = mfJson?.data?.metafieldsSet?.userErrors || [];
    if (errs.length) return json({ ok: false, errors: errs, bytes }, { status: 400 });

    return json({ ok: true, bytes });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
