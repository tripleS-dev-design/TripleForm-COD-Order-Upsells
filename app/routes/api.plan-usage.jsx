// app/routes/api.plan-usage.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getPlan, isBillingActive } from "../utils/plans";

/**
 * 🔎 Parse planKey/term depuis le nom d'abonnement Shopify.
 * Exemples attendus:
 * - "TripleForm COD – Starter (monthly)"
 * - "TripleForm COD – Basic (annual)"
 * - "TripleForm COD – Premium (monthly)"
 */
function parsePlanFromSubscriptionName(name) {
  const n = String(name || "").toLowerCase();

  let planKey = null;
  if (n.includes("starter")) planKey = "starter";
  else if (n.includes("basic")) planKey = "basic";
  else if (n.includes("premium")) planKey = "premium";

  let term = null;
  if (n.includes("annual") || n.includes("year")) term = "annual";
  else if (n.includes("monthly") || n.includes("month")) term = "monthly";

  return { planKey, term };
}

/**
 * ✅ Récupère le plan réel actif depuis Shopify (source de vérité).
 * Retourne: { planKey, term } ou { planKey:null, term:null }
 */
async function fetchActivePlanFromShopify(admin) {
  if (!admin) return { planKey: null, term: null };

  const QUERY = `
    query ActiveSubs {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
        }
      }
    }
  `;

  try {
    const resp = await admin.graphql(QUERY);
    const j = await resp.json();

    const subs = j?.data?.currentAppInstallation?.activeSubscriptions || [];
    const s = subs.find((x) => String(x?.status || "").toUpperCase() === "ACTIVE") || subs[0];
    if (!s) return { planKey: null, term: null };

    const parsed = parsePlanFromSubscriptionName(s?.name);

    const term = parsed.term || null;

    return { planKey: parsed.planKey, term };
  } catch (e) {
    console.error("fetchActivePlanFromShopify error:", e);
    return { planKey: null, term: null };
  }
}


/**
 * Usage mensuel EXACT basé sur les exports Google Sheets réussis.
 * Source de vérité: ShopMonthlyOrderUsage (used par mois).
 *
 * Réponse:
 * {
 *   ok: true,
 *   ordersUsed,
 *   ordersLimit, // null si illimité
 *   unlimited,
 *   remaining,   // null si illimité
 *   planKey,
 *   term,
 *   monthKey,
 *   sinceLabel,
 *   nextPlanKey,
 *   isSubscribed
 * }
 */
export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const shop = session?.shop;

    if (!shop) {
      return json(
        { ok: false, error: "Shop manquant", ordersUsed: 0, sinceLabel: null },
        { status: 400 }
      );
    }

    // --- Mois courant ---
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const sinceLabel = `Depuis le ${start.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    })}`;

    // --- Billing (plan réel) ---
    const shopRow = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    // 1) On tente Shopify (source de vérité)
    const shopifyPlan = await fetchActivePlanFromShopify(admin);

    // 2) Fallback DB
    const dbPlanKey = (shopRow?.billingPlan || "starter").toLowerCase();
    const dbTerm = (shopRow?.billingTerm || "monthly").toLowerCase();

    const planKey = (shopifyPlan.planKey || dbPlanKey).toLowerCase();
    const term = (shopifyPlan.term || dbTerm).toLowerCase();

    // 3) isSubscribed: Shopify actif OU DB billing actif
    const isSubscribed = !!shopifyPlan.planKey || isBillingActive(shopRow);

    // 4) Sync DB si Shopify nous donne un plan clair (évite blocage sur 500)
    if (shopifyPlan.planKey && (shopifyPlan.planKey !== dbPlanKey || (shopifyPlan.term && shopifyPlan.term !== dbTerm))) {
      try {
        await prisma.shop.update({
          where: { shopDomain: shop },
          data: {
            billingPlan: shopifyPlan.planKey,
            ...(shopifyPlan.term ? { billingTerm: shopifyPlan.term } : {}),
          },
        });
      } catch (e) {
        console.error("Failed to sync billingPlan in DB:", e);
      }
    }

    const plan = getPlan(planKey) || getPlan("starter");
    const limit = plan?.orderLimit ?? 100;
    const unlimited = limit === Infinity || !Number.isFinite(limit);

    // --- Usage mensuel DB (exports réussis) ---
    const usageRow = await prisma.shopMonthlyOrderUsage.upsert({
      where: { shop_monthKey: { shopDomain: shop, monthKey } },
      create: { shopDomain: shop, monthKey, used: 0 },
      update: {},
    });

    const ordersUsed = Number(usageRow?.used || 0);
    const ordersLimit = unlimited ? null : Number(limit);
    const remaining = unlimited ? null : Math.max(0, ordersLimit - ordersUsed);

    // Next plan (pour le bouton Upgrade UI)
    const nextPlanKey =
      planKey === "starter" ? "basic" : planKey === "basic" ? "premium" : null;

    return json({
      ok: true,
      ordersUsed,
      ordersLimit,
      unlimited,
      remaining,
      planKey,
      term,
      monthKey,
      sinceLabel,
      nextPlanKey,
      isSubscribed,
    });
  } catch (e) {
    console.error("api.plan-usage error", e);
    return json(
      {
        ok: false,
        ordersUsed: 0,
        sinceLabel: null,
        error: e?.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
};
