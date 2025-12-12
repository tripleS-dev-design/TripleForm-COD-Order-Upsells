// ===== File: app/routes/api/billing/request.js =====
import { json, redirect } from "@remix-run/node";
import { shopifyApp } from "../../shopify.server";            // import RELATIF
import { normalizePlanSelection } from "../../utils/plans.js"; // import RELATIF

// Petite util pour fabriquer une URL absolue à partir de la requête
function absoluteUrl(request, pathAndQuery = "/") {
  const url = new URL(request.url);
  url.pathname = pathAndQuery;
  return url.toString();
}

/**
 * Usage:
 *   GET /api/billing/request?plan=starter&term=monthly
 *   GET /api/billing/request?plan=basic&term=annual
 */
export async function loader({ request }) {
  const { admin } = await shopifyApp.authenticate.admin(request);
  const shopDomain = admin.session.shop;

  const url = new URL(request.url);
  const planKey = (url.searchParams.get("plan") || "").toLowerCase();
  const term    = (url.searchParams.get("term") || "monthly").toLowerCase();

  const norm = normalizePlanSelection(planKey, term);
  if (!norm) {
    return json({ ok: false, error: "Invalid plan or term" }, { status: 400 });
  }

  // Prix et intervalle pour Shopify Billing
  const amount   = norm.amount;                     // ex: 0.99, 4.99, 9.99
  const interval = norm.term === "annual" ? "ANNUAL" : "EVERY_30_DAYS";

  // URL de retour (notre route confirm)
  const returnUrl = absoluteUrl(
    request,
    `/api/billing/confirm?plan=${encodeURIComponent(norm.plan.key)}&term=${encodeURIComponent(norm.term)}`
  );

  // Mutation appSubscriptionCreate (Shopify Billing)
  const MUTATION = `
    mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $trialDays: Int!, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        trialDays: $trialDays
        lineItems: $lineItems
      ) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id status }
      }
    }
  `;

  // Pas d’essai gratuit → trialDays: 0
  const variables = {
    name: `TripleForm COD — ${norm.plan.name} (${norm.term})`,
    returnUrl,
    trialDays: 0,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount, currencyCode: "USD" },
            interval, // "EVERY_30_DAYS" | "ANNUAL"
          },
        },
      },
    ],
  };

  const resp = await admin.graphql(MUTATION, { variables });
  const data = await resp.json();

  const errs = data?.data?.appSubscriptionCreate?.userErrors;
  const confirmationUrl = data?.data?.appSubscriptionCreate?.confirmationUrl;

  if (errs?.length) {
    console.error("Billing userErrors:", errs);
    return json({ ok: false, error: "Billing error", details: errs }, { status: 400 });
  }
  if (!confirmationUrl) {
    console.error("Missing confirmationUrl:", data);
    return json({ ok: false, error: "No confirmation URL returned" }, { status: 500 });
  }

  // Redirection vers la page de confirmation Shopify
  return redirect(confirmationUrl);
}

// Remix exige un export pour POST si jamais tu veux l’appeler en form POST
export const action = loader;
