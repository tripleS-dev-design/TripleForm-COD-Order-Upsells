// ===== File: app/routes/api.save-settings.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// ✅ Même fonction de nettoyage (vous pouvez la mutualiser dans un utilitaire)
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

    // ✅ Nettoyage obligatoire
    settings = cleanSettings(settings);

    // (Conservez la suite de votre code : normalisation layout, taille, sauvegarde...)
    // ...
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
