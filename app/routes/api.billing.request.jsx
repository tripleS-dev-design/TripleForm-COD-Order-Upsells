// ===== File: app/routes/api.billing.request.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { normalizePlanSelection } from "../utils/plans.js";

function buildConfirmUrl(request, shop, host) {
  const appOrigin = process.env.SHOPIFY_APP_URL || new URL(request.url).origin;
  const url = new URL("/api/billing/confirm", appOrigin);
  if (shop) url.searchParams.set("shop", shop);
  if (host) url.searchParams.set("host", host);
  return url;
}

export async function loader({ request }) {
  // ✅ plus de billing.request ici, juste admin.graphql
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const planKey = (url.searchParams.get("plan") || "").toLowerCase();   // starter | basic | premium
  const term = (url.searchParams.get("term") || "monthly").toLowerCase(); // monthly | annual
  const host = url.searchParams.get("host") || "";
  const shop = session?.shop || "";

  const norm = normalizePlanSelection(planKey, term);
  if (!norm) {
    return json({ ok: false, error: "Invalid plan/term" }, { status: 400 });
  }

  const returnUrl = buildConfirmUrl(request, shop, host);

  // Dev store => mode test
  let isDevStore = false;
  try {
    const q = await admin.graphql(`{ shop { plan { partnerDevelopment } } }`);
    const j = await q.json();
    isDevStore = j?.data?.shop?.plan?.partnerDevelopment === true;
  } catch (err) {
    console.error("Error checking dev store:", err);
  }

  const interval = norm.term === "annual" ? "ANNUAL" : "EVERY_30_DAYS";
  const amount = Number(norm.amount); // ex: 0.99
  const name = `TripleForm COD – ${norm.plan.name} (${norm.term})`;
  const test = isDevStore || process.env.BILLING_TEST === "1";
  const trialDays = 7; 

  const MUTATION = `
    mutation CreateSub(
      $name: String!,
      $returnUrl: URL!,
      $amount: Decimal!,
      $interval: AppPricingInterval!,
      $trialDays: Int,
      $test: Boolean
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        trialDays: $trialDays
        test: $test
        lineItems: [
          { plan: { appRecurringPricingDetails: {
              price: { amount: $amount, currencyCode: USD }
              interval: $interval
          }}}
        ]
      ) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id status }
      }
    }
  `;

  const resp = await admin.graphql(MUTATION, {
    variables: {
      name,
      returnUrl: returnUrl.toString(),
      amount,
      interval,
      trialDays,
      test,
    },
  });

  const data = await resp.json();
  const errs =
    data?.data?.appSubscriptionCreate?.userErrors ||
    data?.errors ||
    [];

  const confirmationUrl =
    data?.data?.appSubscriptionCreate?.confirmationUrl || null;

  if (errs.length) {
    console.error("Billing request errors:", JSON.stringify(errs, null, 2));
    return json({ ok: false, errors: errs }, { status: 400 });
  }

  if (!confirmationUrl) {
    console.error("No confirmationUrl in billing response:", data);
    return json({ ok: false, error: "No confirmationUrl" }, { status: 500 });
  }

  // 🔁 On renvoie l'URL pour que le client fasse top-level redirect
  return json({ ok: true, confirmationUrl, test, shop, host });
}
