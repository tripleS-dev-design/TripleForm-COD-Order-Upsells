// ===== File: app/routes/api.google-sheets.test.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { testGoogleSheetsConnection } from "../utils/googleSheets.server";

export const loader = () => {
  return json({ ok: true, where: "api.google-sheets.test" });
};

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const body = await request.json().catch(() => ({}));
    const sheet = body?.sheet || null;
    const kind = body?.kind || "orders";

    const result = await testGoogleSheetsConnection({ shop, sheet, kind });

    return json({ ok: true, ...result });
  } catch (e) {
    console.error("Erreur /api/google-sheets/test:", e);
    return json(
      {
        ok: false,
        error: e?.message || String(e),
      },
      { status: 500 }
    );
  }
};
