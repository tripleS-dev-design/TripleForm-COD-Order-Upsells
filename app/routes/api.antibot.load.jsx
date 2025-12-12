// ===== File: app/routes/api.antibot.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GET /api/antibot/load
 * Lit le metafield de boutique tripleform_cod.antibot (type JSON)
 */
export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    if (!admin) {
      return json(
        { ok: false, error: "Unauthorized: no admin session" },
        { status: 401 }
      );
    }

    const QUERY = `
      query antibotSettings {
        shop {
          metafield(namespace: "tripleform_cod", key: "antibot") {
            id
            value
            type
          }
        }
      }
    `;

    const resp = await admin.graphql(QUERY);
    const data = await resp.json();

    const mf = data?.data?.shop?.metafield || null;

    let antibot = null;
    if (mf?.value) {
      try {
        antibot = JSON.parse(mf.value);
      } catch {
        // si la valeur est cassée, on renvoie null pour repartir d'une config par défaut côté UI
        antibot = null;
      }
    }

    return json({ ok: true, antibot });
  } catch (e) {
    console.error("api.antibot.load error:", e);
    const msg = e?.message || String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};
