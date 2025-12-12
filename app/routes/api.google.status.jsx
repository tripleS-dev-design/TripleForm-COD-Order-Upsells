// ===== File: app/routes/api.google.status.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getGoogleStatusForShop } from "../services/google.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const status = await getGoogleStatusForShop(shop);

  return json({
    ok: true,
    ...status,
  });
};
