// app/routes/api.billing.request.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Create Shopify subscription (recurring) and return confirmationUrl (JSON),
 * so the client can redirect with window.top.location.href.
 *
 * Query:
 * - plan: starter | basic | premium
 * - term: monthly | annual
 * - host: (optional)
 */
const PRICE_TABLE = {
  monthly: { starter: 0.99, basic: 9.99, premium: 19.99 },
  annual: { starter: 9.99, basic: 83.99, premium: 167.99 },
};

function buildReturnUrl(request, shop, host) {
  const appOrigin = process.env.SHOPIFY_APP_URL || new URL(request.url).origin;
  const u = new URL("/api/billing/confirm", appOrigin);
  if (shop) u.searchParams.set("shop", shop);
  if (host) u.searchParams.set("host", host);
  return u.toString();
}

async function isDevStore(admin) {
  try {
    const resp = await admin.graphql(`{ shop { plan { partnerDevelopment } } }`);
    const j = await resp.json();
    return j?.data?.shop?.plan?.partnerDevelopment === true;
  } catch {
    return false;
  }
}

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const plan = (url.searchParams.get("plan") || "").toLowerCase();
  const termRaw = (url.searchParams.get("term") || "monthly").toLowerCase();
  const host = (url.searchParams.get("host") || "").trim();

  const term = termRaw === "annual" ? "annual" : "monthly";

  if (!["starter", "basic", "premium"].includes(plan)) {
    return json({ ok: false, error: "Invalid plan" }, { status: 400 });
  }

  const amount = PRICE_TABLE[term]?.[plan];
  if (typeof amount !== "number") {
    return json({ ok: false, error: "Invalid pricing" }, { status: 400 });
  }

  const shop = session?.shop || "";
  const returnUrl = buildReturnUrl(request, shop, host);

  const interval = term === "annual" ? "ANNUAL" : "EVERY_30_DAYS";
  const test =
    (await isDevStore(admin)) || process.env.BILLING_TEST === "1" || process.env.NODE_ENV !== "production";

  const trialDays = Number(process.env.BILLING_TRIAL_DAYS || 7);

  const name = `TripleForm COD – ${plan.toUpperCase()} (${term})`;

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
      returnUrl,
      amount: Number(amount.toFixed(2)),
      interval,
      trialDays,
      test,
    },
  });

  const data = await resp.json().catch(() => null);

  const errs =
    data?.data?.appSubscriptionCreate?.userErrors ||
    data?.errors ||
    [];

  const confirmationUrl = data?.data?.appSubscriptionCreate?.confirmationUrl || null;

  if (errs?.length) {
    console.error("Billing request errors:", JSON.stringify(errs, null, 2));
    return json({ ok: false, errors: errs }, { status: 400 });
  }

  if (!confirmationUrl) {
    console.error("No confirmationUrl in billing response:", data);
    return json({ ok: false, error: "No confirmationUrl" }, { status: 500 });
  }

  return json({ ok: true, confirmationUrl, test, shop, host });
};
