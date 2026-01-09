// app/routes/api.billing.confirm.jsx
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * Billing confirm (returnUrl)
 * - best effort: read ACTIVE subscription from Shopify, sync DB (billingPlan/billingTerm)
 * - then exit iframe to the app page in Shopify Admin
 */

const PLAN_MAP = {
  EVERY_30_DAYS: { 0.99: "starter", 9.99: "basic", 19.99: "premium" },
  ANNUAL: { 9.99: "starter", 83.99: "basic", 167.99: "premium" },
};

function resolvePlanFromSubscription(sub) {
  const details = sub?.lineItems?.[0]?.plan?.pricingDetails;
  if (!details || details?.__typename !== "AppRecurringPricingDetails") return null;

  const interval = details.interval || "EVERY_30_DAYS";
  const amount = Number(details.price?.amount || 0);
  const rounded = Number(amount.toFixed(2));
  const planKey = PLAN_MAP?.[interval]?.[rounded] || null;
  const term = interval === "ANNUAL" ? "annual" : "monthly";

  if (!planKey) return null;
  return { planKey, term };
}

async function fetchShopifyActivePlan(admin) {
  const QUERY = `
    query ActiveSub {
      currentAppInstallation {
        activeSubscriptions {
          id
          status
          lineItems {
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricingDetails {
                  interval
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `;
  const resp = await admin.graphql(QUERY);
  const j = await resp.json();
  const subs = j?.data?.currentAppInstallation?.activeSubscriptions || [];
  const active =
    subs.find((s) => String(s?.status || "").toUpperCase() === "ACTIVE") || subs[0] || null;
  if (!active) return null;
  return resolvePlanFromSubscription(active);
}

function buildAdminAppUrl(shop, host) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const store = (shop || "").replace(".myshopify.com", "");
  const base = `https://admin.shopify.com/store/${store}/apps/${apiKey}`;
  const params = new URLSearchParams();
  if (shop) params.set("shop", shop);
  if (host) params.set("host", host);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shopParam = (url.searchParams.get("shop") || "").trim();
  const host = (url.searchParams.get("host") || "").trim();

  // ✅ best effort sync (no loop if auth fails)
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session?.shop || shopParam;

    if (admin && shop) {
      const planInfo = await fetchShopifyActivePlan(admin).catch(() => null);

      if (planInfo?.planKey) {
        const shopRow = await prisma.shop.findUnique({ where: { shopDomain: shop } });
        if (shopRow) {
          const data = {};
          if (typeof shopRow.billingPlan !== "undefined") data.billingPlan = planInfo.planKey;
          if (typeof shopRow.billingTerm !== "undefined") data.billingTerm = planInfo.term;
          if (typeof shopRow.billingActive !== "undefined") data.billingActive = true;
          if (typeof shopRow.billingStatus !== "undefined") data.billingStatus = "active";
          if (typeof shopRow.billingActivatedAt !== "undefined") data.billingActivatedAt = new Date();

          if (Object.keys(data).length) {
            await prisma.shop.update({ where: { shopDomain: shop }, data }).catch(() => {});
          }
        }
      }
    }
  } catch (e) {
    // ignore: we still redirect out of iframe
  }

  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;
  const adminAppUrl = buildAdminAppUrl(shopParam, host);

  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shopParam) exit.searchParams.set("shop", shopParam);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", adminAppUrl);

  return redirect(exit.toString());
}
