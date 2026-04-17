// ===== app/routes/api.save-settings.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// ✅ Fonction de nettoyage (identique à celle du front)
function cleanSettings(settings) {
  if (!settings || typeof settings !== "object") return settings;
  const forbiddenFields = [
    "name", "email", "phone", "address", "city", "province",
    "zip", "postal_code", "postal", "company", "birthday"
  ];

  // Nettoyer les champs du formulaire
  if (settings.fields && typeof settings.fields === "object") {
    const newFields = {};
    for (const [key, value] of Object.entries(settings.fields)) {
      if (!forbiddenFields.includes(key)) {
        newFields[key] = value;
      }
    }
    settings.fields = newFields;
  }

  // Nettoyer l'ordre des champs
  if (settings.meta && settings.meta.fieldsOrder && Array.isArray(settings.meta.fieldsOrder)) {
    settings.meta.fieldsOrder = settings.meta.fieldsOrder.filter(k => !forbiddenFields.includes(k));
  }

  // Forcer une version récente pour indiquer que la config est propre
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

    // ✅ APPLIQUER LE NETTOYAGE AVANT SAUVEGARDE
    settings = cleanSettings(settings);

    // Normalisation layout etc. (votre code existant)
    // ...

    // Sérialisation et sauvegarde
    const value = JSON.stringify(settings);
    // ... (suite de votre code)
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
