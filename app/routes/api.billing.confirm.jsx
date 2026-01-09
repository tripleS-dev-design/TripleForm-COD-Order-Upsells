// ===== File: app/routes/api.billing.confirm.jsx =====
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// mapping interval+amount -> planKey
const PLAN_MAP = {
  EVERY_30_DAYS: { 0.99: "starter", 9.99: "basic", 19.99: "premium" },
  ANNUAL: { 9.99: "starter", 83.99: "basic", 167.99: "premium" },
};

function resolvePlanFromSubscription(sub) {
  try {
    const li = sub?.lineItems?.[0]?.plan?.pricingDetails;
    const type = li?.__typename || "";
    if (type !== "AppRecurringPricingDetails") return null;

    const interval = li?.interval || "EVERY_30_DAYS";
    const amount = Number(li?.price?.amount || 0);
    const rounded = Number(amount.toFixed(2));
    const planKey = PLAN_MAP[interval]?.[rounded] || null;
    const term = interval === "ANNUAL" ? "annual" : "monthly";
    return { planKey, term };
  } catch {
    return null;
  }
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

function buildBillingUpdateData(shopRow, planInfo) {
  const data = {};
  if (planInfo?.planKey && typeof shopRow?.billingPlan !== "undefined") data.billingPlan = planInfo.planKey;
  if (planInfo?.term && typeof shopRow?.billingTerm !== "undefined") data.billingTerm = planInfo.term;

  if (planInfo?.planKey) {
    if (typeof shopRow?.billingActive !== "undefined") data.billingActive = true;
    if (typeof shopRow?.billingStatus !== "undefined") data.billingStatus = "active";
    if (typeof shopRow?.billingActivatedAt !== "undefined") data.billingActivatedAt = new Date();
  }
  return data;
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shopParam = (url.searchParams.get("shop") || "").trim();
  const host = (url.searchParams.get("host") || "").trim();

  // ✅ Best effort: sync plan Shopify -> DB (sans casser le flow si auth impossible)
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session?.shop;

    if (admin && shop) {
      const planInfo = await fetchShopifyActivePlan(admin).catch(() => null);
      if (planInfo?.planKey) {
        const shopRow = await prisma.shop.findUnique({ where: { shopDomain: shop } });
        if (shopRow) {
          const data = buildBillingUpdateData(shopRow, planInfo);
          if (Object.keys(data).length) {
            await prisma.shop.update({ where: { shopDomain: shop }, data }).catch(() => {});
          }
        }
      }
    }
  } catch (e) {
    // ⚠️ important: NE PAS renvoyer le redirect d'auth ici (sinon boucle "Enter your shop")
  }

  // ✅ Sortie d’iframe → onglet app dans l’admin
  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;
  const store = (shopParam || "").replace(".myshopify.com", "");
  const adminAppUrl =
    `https://admin.shopify.com/store/${store}/apps/${process.env.SHOPIFY_API_KEY}` +
    ((shopParam || host)
      ? `?${new URLSearchParams({ ...(shopParam && { shop: shopParam }), ...(host && { host }) }).toString()}`
      : "");

  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shopParam) exit.searchParams.set("shop", shopParam);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", adminAppUrl);

  return redirect(exit.toString());
}
