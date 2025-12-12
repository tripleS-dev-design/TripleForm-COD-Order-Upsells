// ===== File: app/routes/api.billing.guard.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// (optionnel) import { setBillingActive } from "../models/shop.server.js";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // On demande à Shopify l’état des abonnements actifs de TON app
  const Q = `
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          status
          test
          lineItems {
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricing {
                  interval
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
      shop { name }
    }
  `;

  const resp = await admin.graphql(Q);
  const data = await resp.json();

  const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
  const active = subs.find(s => s?.status === "ACTIVE") || null;

  // Normaliser une réponse simple pour le front
  let plan = null;
  if (active) {
    const pd = active.lineItems?.[0]?.plan?.pricingDetails;
    if (pd?.__typename === "AppRecurringPricing") {
      plan = {
        interval: pd.interval,                        // "EVERY_30_DAYS" ou "ANNUAL"
        amount: Number(pd.price?.amount || 0),
        currency: pd.price?.currencyCode || "USD",
        test: !!active.test,
        subId: active.id,
      };
    } else {
      plan = { interval: "UNKNOWN", amount: 0, currency: "USD", test: !!active.test, subId: active.id };
    }

    // (optionnel) Marquer actif dans TA DB maintenant que l’on sait qu’il y a un abo actif
    // try { await setBillingActive(session.shop, /*planKey*/ null, plan.interval === "ANNUAL" ? "annual" : "monthly", plan.subId); } catch {}
  }

  return json({
    ok: true,
    shop: session.shop,
    active: !!active,
    plan,
  });
}
