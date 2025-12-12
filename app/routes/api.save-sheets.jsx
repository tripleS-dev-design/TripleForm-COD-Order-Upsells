// ===== File: app/routes/api.save-sheets.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { saveSheetsConfigForShop } from "../services/google.server";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const body = await request.json().catch(() => ({}));
    const sheets = body?.sheets || {};

    await saveSheetsConfigForShop(shop, sheets);

    return json({ ok: true });
  } catch (e) {
    console.error("Erreur /api/save-sheets:", e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};
