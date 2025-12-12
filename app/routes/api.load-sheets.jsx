// ===== File: app/routes/api.load-sheets.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getSheetsConfigForShop } from "../services/google.server";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const cfg = await getSheetsConfigForShop(shop);

    return json({
      ok: true,
      sheets: cfg || null,
    });
  } catch (e) {
    console.error("Erreur /api/load-sheets:", e);
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
