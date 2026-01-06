// ===== File: app/routes/api.pixels.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (!session?.shop) {
      return json({ ok: false, error: "Shop non authentifié." }, { status: 401 });
    }
    if (!admin) {
      return json(
        { ok: false, error: "Admin API client indisponible (offline session manquante)." },
        { status: 401 }
      );
    }

    const resp = await admin.graphql(`
      query LoadPixelsConfig {
        shop {
          id
          metafield(namespace: "tripleform_cod", key: "pixels") {
            id
            type
            value
          }
        }
      }
    `);

    const data = await resp.json();
    const raw = data?.data?.shop?.metafield?.value;

    let pixels = null;
    if (typeof raw === "string" && raw.trim()) {
      try {
        pixels = JSON.parse(raw);
      } catch {
        // on évite un 500 juste pour un JSON invalide
        pixels = null;
      }
    }

    return json({ ok: true, pixels });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
