// ===== File: app/routes/api.google.status.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getGoogleStatusForShop } from "../services/google.server";

// helper robuste pour récupérer le shop
function getShopFromRequest(request, session, admin) {
  return (
    session?.shop ||
    admin?.rest?.session?.shop ||
    new URL(request.url).searchParams.get("shop")
  );
}

export const loader = async ({ request }) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const shop = getShopFromRequest(request, session, admin);

    if (!shop) {
      throw new Error("Shop introuvable dans /api/google/status");
    }

    const status = await getGoogleStatusForShop(shop);

    return json({
      ok: true,
      ...status,
    });
  } catch (e) {
    console.error("Erreur /api/google/status:", e);
    return json(
      {
        ok: false,
        connected: false,
        error: String(e?.message || e),
      },
      { status: 500 }
    );
  }
};
