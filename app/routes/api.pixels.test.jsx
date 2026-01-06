// ===== File: app/routes/api.pixels.test.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { loadPixelsConfig } from "../utils/pixels.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (!session?.shop) {
      return json({ ok: false, error: "Shop non authentifié (session manquante)." }, { status: 401 });
    }
    if (!admin) {
      return json(
        { ok: false, error: "Admin API client indisponible (offline session manquante)." },
        { status: 401 }
      );
    }

    const cfg = (await loadPixelsConfig(admin)) || {};

    const fbClientReady = !!(cfg?.fb?.enabled && cfg?.fb?.pixelId);
    const tiktokClientReady = !!(cfg?.tiktok?.enabled && cfg?.tiktok?.pixelId);

    const fbCapiReady = !!(
      cfg?.capi_fb?.enabled &&
      cfg?.capi_fb?.pixelId &&
      cfg?.capi_fb?.accessToken
    );

    const tiktokApiReady = !!(
      cfg?.tiktok_api?.enabled &&
      cfg?.tiktok_api?.pixelCode &&
      cfg?.tiktok_api?.accessToken
    );

    return json({
      ok: true,
      fbClientReady,
      tiktokClientReady,
      fbCapiReady,
      tiktokApiReady,
    });
  } catch (e) {
    console.error("api.pixels.test error:", e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};

export const loader = () => json({ ok: true, where: "api.pixels.test" });
