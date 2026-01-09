// app/routes/api.plan-usage.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getPlan, isBillingActive } from "../utils/plans";

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
    const { session } = await authenticate.admin(request);
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

    // --- Billing (plan réel) depuis DB ---
    const shopRow = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    const isSubscribed = isBillingActive(shopRow);
    const planKey = (shopRow?.billingPlan || "starter").toLowerCase();
    const term = (shopRow?.billingTerm || "monthly").toLowerCase();

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
