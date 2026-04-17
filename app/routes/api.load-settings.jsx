// ===== File: app/routes/api.load-settings.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// ✅ Nettoyage des champs interdits
function cleanSettings(settings) {
  if (!settings || typeof settings !== "object") return settings;
  const forbiddenFields = [
    "name", "email", "phone", "address", "city", "province",
    "zip", "postal_code", "postal", "company", "birthday"
  ];

  if (settings.fields && typeof settings.fields === "object") {
    const newFields = {};
    for (const [key, value] of Object.entries(settings.fields)) {
      if (!forbiddenFields.includes(key)) {
        newFields[key] = value;
      }
    }
    settings.fields = newFields;
  }

  if (settings.meta && settings.meta.fieldsOrder && Array.isArray(settings.meta.fieldsOrder)) {
    settings.meta.fieldsOrder = settings.meta.fieldsOrder.filter(k => !forbiddenFields.includes(k));
  }

  if (settings.meta) {
    settings.meta.version = 5;
  }

  return settings;
}

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const q = await admin.graphql(`
      query loadFormSettings {
        shop {
          id
          metafield(namespace: "tripleform_cod", key: "settings") {
            id
            type
            value
          }
        }
      }
    `);
    const data = await q.json();
    const raw = data?.data?.shop?.metafield?.value;
    let settings = null;
    if (raw) {
      try {
        settings = JSON.parse(raw);
        // ✅ Nettoyage avant envoi au front
        settings = cleanSettings(settings);
      } catch {
        settings = null;
      }
    }
    return json({ ok: true, settings });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
