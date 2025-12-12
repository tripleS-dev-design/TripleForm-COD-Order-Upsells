// ===== File: app/routes/api.google-sheets.append-order.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";

export const action = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.order) {
      return json(
        { ok: false, error: "Missing 'order' in body" },
        { status: 400 }
      );
    }

    const { admin, session } = await authenticate.admin(request);
    const shop = session?.shop;

    if (!admin || !shop) {
      return json(
        { ok: false, error: "Admin session not available for this shop." },
        { status: 401 }
      );
    }

    await appendOrderToSheet({
      shop,
      admin,
      order: body.order,
    });

    return json({ ok: true });
  } catch (e) {
    console.error("Erreur /api/google-sheets/append-order:", e);
    return json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
};
