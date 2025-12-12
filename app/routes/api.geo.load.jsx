// ===== File: app/routes/api.geo.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { loadGeoConfig } from "../utils/geo.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const { geo } = await loadGeoConfig(admin);
    return json({ ok: true, geo });
  } catch (e) {
    console.error("[api.geo.load] error:", e);
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
