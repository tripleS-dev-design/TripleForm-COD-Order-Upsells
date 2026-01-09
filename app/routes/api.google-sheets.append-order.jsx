// ===== File: app/routes/api.google-sheets.append-order.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";

export const action = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.order) {
      return json({ ok: false, error: "Missing 'order' in body" }, { status: 400 });
    }

    const { session } = await authenticate.admin(request);
    const shop = session?.shop;

    if (!shop) {
      return json({ ok: false, error: "Shop session missing." }, { status: 401 });
    }

    // ✅ Important: pas besoin de "admin" ici
    await appendOrderToSheet({ shop, order: body.order });

    return json({ ok: true });
  } catch (e) {
    // ✅ Si limite atteinte => réponse claire pour l’UI
    if (e?.name === "UsageLimitError" || e?.code === "USAGE_LIMIT_REACHED") {
      return json(
        {
          ok: false,
          code: e?.code || "USAGE_LIMIT_REACHED",
          message: e?.message || "Monthly limit reached",
          meta: e?.meta || null,
        },
        { status: 402 }
      );
    }

    if (e?.name === "UsageLimitError" || e?.code === "BILLING_INACTIVE") {
      return json(
        {
          ok: false,
          code: e?.code || "BILLING_INACTIVE",
          message: e?.message || "Billing inactive",
          meta: e?.meta || null,
        },
        { status: 403 }
      );
    }

    console.error("Erreur /api/google-sheets/append-order:", e);
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
};
