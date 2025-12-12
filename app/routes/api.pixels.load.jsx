// ===== File: app/routes/api.pixels.load.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    const q = await admin.graphql(`
      query LoadPixelsConfig {
        shop { id }
        metafield(namespace: "tripleform_cod", key: "pixels") {
          id
          type
          value
        }
      }
    `);

    const data = await q.json();
    const raw = data?.data?.metafield?.value;
    const pixels = raw ? JSON.parse(raw) : null;

    return json({ ok: true, pixels });
  } catch (e) {
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 },
    );
  }
};
