// ===== File: app/routes/api/billing/confirm.jsx =====
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { shopifyApp } from "../../shopify.server";
import { setBillingActive } from "../../models/shop.server.js";
import { normalizePlanSelection } from "../../utils/plans.js";

function homeUrl(request) {
  const url = new URL(request.url);
  url.pathname = "/app/sections/0";
  url.search = "";
  return url.toString();
}

export async function loader({ request }) {
  const { admin } = await shopifyApp.authenticate.admin(request);
  const shopDomain = admin.session.shop;

  const url = new URL(request.url);
  const planKey = (url.searchParams.get("plan") || "").toLowerCase();
  const term    = (url.searchParams.get("term") || "monthly").toLowerCase();

  const norm = normalizePlanSelection(planKey, term);
  if (!norm) return redirect(`${homeUrl(request)}?billing=error_invalid_params`);

  const Q = `
    query CurrentAppSubs {
      currentAppInstallation {
        activeSubscriptions {
          id
          status
        }
      }
    }
  `;
  const resp = await admin.graphql(Q);
  const data = await resp.json();
  const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
  const activeSub = subs.find(s => (s?.status || "").toUpperCase() === "ACTIVE");
  if (!activeSub) return redirect(`${homeUrl(request)}?billing=cancelled_or_inactive`);

  await setBillingActive(shopDomain, norm.plan.key, norm.term, activeSub.id);
  return redirect(`${homeUrl(request)}?billing=activated`);
}

// (Mostly unused because loader redirects, but keeps the route render-safe)
export default function BillingConfirm() {
  const data = useLoaderData(); // ✅ no generic in .jsx
  return (
    <div style={{ padding: 16 }}>
      <h3>Confirmation de facturation</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
