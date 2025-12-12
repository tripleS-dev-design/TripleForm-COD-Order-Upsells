// ===== File: app/routes/api.geo.save.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { saveGeoConfig, normalizeGeoConfig } from "../utils/geo.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const body = await request.json().catch(() => ({}));
    const geoInput = body?.geo;

    if (!geoInput || typeof geoInput !== "object") {
      return json(
        { ok: false, error: "Missing or invalid 'geo' payload" },
        { status: 400 }
      );
    }

    const geo = normalizeGeoConfig(geoInput);
    await saveGeoConfig(admin, geo);

    return json({ ok: true });
  } catch (e) {
    console.error("[api.geo.save] error:", e);
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
