import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

function cleanSettings(settings) {
  if (!settings || typeof settings !== "object") return settings;
  const forbiddenFields = [
    "name", "email", "phone", "address", "city", "province",
    "zip", "postal_code", "postal", "company", "birthday"
  ];
  if (settings.fields && typeof settings.fields === "object") {
    const newFields = {};
    for (const [key, value] of Object.entries(settings.fields)) {
      if (!forbiddenFields.includes(key)) newFields[key] = value;
    }
    settings.fields = newFields;
  }
  if (settings.meta && settings.meta.fieldsOrder && Array.isArray(settings.meta.fieldsOrder)) {
    settings.meta.fieldsOrder = settings.meta.fieldsOrder.filter(k => !forbiddenFields.includes(k));
  }
  if (settings.meta) settings.meta.version = 5;
  return settings;
}

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    let body = {};
    try { body = await request.json(); } catch { body = {}; }

    let settings = body?.settings;
    if (typeof settings === "string") {
      try { settings = JSON.parse(settings); } catch { return json({ ok: false, error: "Invalid settings JSON string" }, { status: 400 }); }
    }
    if (!settings || typeof settings !== "object") {
      return json({ ok: false, error: "Missing settings object" }, { status: 400 });
    }

    // ✅ Nettoyage
    settings = cleanSettings(settings);

    // ✅ Normalisation du layout
    if (settings?.meta?.layout) {
      const normOrder = (v, fallback) => { const n = Number(v); if (!Number.isFinite(n)) return fallback; return Math.max(1, Math.min(3, Math.round(n))); };
      const normPos = (v, fallback) => { const s = String(v || "").toLowerCase(); if (s === "top" || s === "bottom" || s === "hide") return s; return fallback; };
      const l = settings.meta.layout;
      if (l.orderSummary) { l.orderSummary.order = normOrder(l.orderSummary.order, 1); l.orderSummary.position = normPos(l.orderSummary.position, "top"); }
      if (l.offers) { l.offers.order = normOrder(l.offers.order, 2); l.offers.position = normPos(l.offers.position, "top"); }
      if (l.upsells) { l.upsells.order = normOrder(l.upsells.order, 3); l.upsells.position = normPos(l.upsells.position, "top"); }
    }

    // ✅ Récupérer shopId
    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopRes.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) return json({ ok: false, error: "No shopId" }, { status: 400 });

    // ✅ Sérialiser
    let value = "";
    try { value = JSON.stringify(settings); } catch (e) { return json({ ok: false, error: "Settings not serializable" }, { status: 400 }); }

    // ✅ Vérifier taille
    const bytes = typeof Buffer !== "undefined" ? Buffer.byteLength(value, "utf8") : new TextEncoder().encode(value).length;
    if (bytes > 65000) return json({ ok: false, error: `Settings too large (${bytes} bytes)`, bytes }, { status: 413 });

    // ✅ Sauvegarde via GraphQL
    const mfRes = await admin.graphql(
      `mutation metafieldsSet($metafields:[MetafieldsSetInput!]!) {
        metafieldsSet(metafields:$metafields) {
          metafields { id key namespace }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [{ namespace: "tripleform_cod", key: "settings", type: "json", value, ownerId: shopId }],
        },
      }
    );

    const mfJson = await mfRes.json();
    if (mfJson?.errors?.length) return json({ ok: false, error: mfJson.errors[0].message }, { status: 500 });
    const userErrors = mfJson?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length) return json({ ok: false, errors: userErrors }, { status: 400 });

    return json({ ok: true, bytes });
  } catch (e) {
    console.error("Save settings error:", e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
