// ===== File: app/routes/api.load-settings.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // 1) Lecture du métachamp "settings" sur le shop
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
      } catch {
        settings = null;
      }
    }

    // Réponse au front
    return json({ ok: true, settings });
  } catch (e) {
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
