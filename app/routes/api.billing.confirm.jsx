// ===== File: app/routes/api.billing.confirm.jsx =====
import { redirect } from "@remix-run/node";
// import { authenticate } from "../shopify.server"; // ❌ pas besoin ici pour éviter la boucle
// import { setBillingActive } from "../models/shop.server.js"; // optionnel si tu veux marquer "actif" côté DB

export async function loader({ request }) {
  const url  = new URL(request.url);
  const shop = (url.searchParams.get("shop") || "").trim(); // ex: selyadev.myshopify.com
  const host = (url.searchParams.get("host") || "").trim();

  // Si Shopify ne renvoie pas shop/host, on NE force PAS une auth ici, sinon tu tombes dans "Enter your shop".
  // On renvoie directement vers l’onglet app dans l’admin via exit-iframe.

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;

  // URL onglet de l’app dans l’admin (top-level)
  const store = shop.replace(".myshopify.com", "");
  const adminAppUrl =
    `https://admin.shopify.com/store/${store}/apps/${process.env.SHOPIFY_API_KEY}` +
    ((shop || host)
      ? `?${new URLSearchParams({ ...(shop && { shop }), ...(host && { host }) }).toString()}`
      : "");

  // (Optionnel) si tu tiens à setBillingActive côté DB, fais-le via un endpoint interne
  // ou bien plus tard au prochain hit authentifié.
  // try { await setBillingActive(shop, /*plan*/null, /*term*/null, /*chargeId*/null); } catch {}

  // Sortie d’iframe → renvoie le top window vers l’onglet app
  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shop) exit.searchParams.set("shop", shop);
  if (host) exit.searchParams.set("host", host);
  // ⚠️ ne pas encoder adminAppUrl dans exitIframe
  exit.searchParams.set("exitIframe", adminAppUrl);

  return redirect(exit.toString());
}
