// ===== File: app/routes/api.google.connect.jsx =====
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { buildGoogleAuthUrl } from "../services/google.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const urlObj = new URL(request.url);
  const target = urlObj.searchParams.get("target") || "orders";

  const authUrl = buildGoogleAuthUrl({ shop, target });

  return redirect(authUrl);
};
