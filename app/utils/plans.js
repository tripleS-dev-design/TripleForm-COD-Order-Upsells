// ===== File: app/utils/plans.js =====

/**
 * Plans et limites (USD)
 * - Les prix doivent correspondre à l’UI (Section0Home)
 * - Les limites commandes/mois servent à bloquer selon ton compteur (ex: Google Sheets)
 */
export const PLANS = /** @type {const} */ ({
  starter: {
    key: "starter",
    name: "Starter",
    monthly: 0.99,
    annual: 9.99,
    orderLimit: 100,
  },
  basic: {
    key: "basic",
    name: "Basic",
    monthly: 4.99,
    annual: 49,
    orderLimit: 400,
  },
  premium: {
    key: "premium",
    name: "Premium",
    monthly: 9.99,
    annual: 99,
    orderLimit: Infinity, // illimité
  },
});

/** Clés valides pour la normalisation */
export const PLAN_KEYS = Object.keys(PLANS);
export const TERMS = /** @type {const} */ (["monthly", "annual"]);

/** Récupère la définition d’un plan (ou null) */
export function getPlan(planKey) {
  return PLANS[planKey] ?? null;
}

/** Prix du plan selon le terme ('monthly' | 'annual') */
export function getPrice(planKey, term) {
  const p = getPlan(planKey);
  if (!p) return null;
  return term === "annual" ? p.annual : p.monthly;
}

/**
 * Valide plan & term et retourne { plan, term, amount } ou null
 * term normalisé par défaut à "monthly"
 */
export function normalizePlanSelection(planKey, term) {
  const plan = getPlan(planKey);
  if (!plan) return null;
  const t = TERMS.includes(term) ? term : "monthly";
  const amount = getPrice(planKey, t);
  return { plan, term: t, amount };
}

/** 'YYYY-MM' pour l’agrégat mensuel d’usage */
export function currentUsageMonth(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Compare le compteur d’usage à la limite du plan.
 * @param {object} shopRow - enregistrement Shop (Prisma)
 * @returns {{ allowed: boolean, reason?: string, limit?: number, count?: number }}
 */
export function checkUsageAllowed(shopRow) {
  if (!shopRow) return { allowed: false, reason: "shop_missing" };

  const plan = getPlan(shopRow.billingPlan || "starter") || PLANS.starter;
  const limit = plan.orderLimit;
  const month = currentUsageMonth();

  const isSameMonth = shopRow.usageMonth === month;
  const count = isSameMonth ? (shopRow.usageCount || 0) : 0;

  if (limit === Infinity) return { allowed: true, limit, count };
  if (count < limit) return { allowed: true, limit, count };

  return { allowed: false, reason: "limit_reached", limit, count };
}

/**
 * Incrémente usage en mémoire (reset si changement de mois).
 * La sauvegarde DB se fait à l’appelant (service/route).
 */
export function bumpUsageInMemory(shopRow) {
  const month = currentUsageMonth();
  if (shopRow.usageMonth !== month) {
    shopRow.usageMonth = month;
    shopRow.usageCount = 0;
  }
  shopRow.usageCount = (shopRow.usageCount || 0) + 1;
}

/** Vérifie si le statut billing est actif */
export function isBillingActive(shopRow) {
  return (shopRow?.billingStatus || "").toLowerCase() === "active";
}

/** Texte lisible du plan + terme (pour UI) */
export function humanPlan(shopRow) {
  const p = getPlan(shopRow?.billingPlan || "starter");
  const t = (shopRow?.billingTerm || "monthly") === "annual" ? " /an" : " /mois";
  return p ? `${p.name}${t}` : "Starter /mois";
}

/**
 * Spécification de l’abonnement récurrent pour Shopify Billing (sans essai).
 * Utilisable dans /api/billing/request pour créer la souscription.
 *
 * @param {string} planKey - 'starter' | 'basic' | 'premium'
 * @param {'monthly'|'annual'} term
 * @param {{ currency?: string }} [opts]
 * @returns {{
 *   name: string,
 *   price: number,
 *   currencyCode: string,
 *   interval: 'EVERY_30_DAYS' | 'ANNUAL',
 *   trialDays: number
 * } | null}
 */
export function getRecurringChargeSpec(planKey, term, opts = {}) {
  const norm = normalizePlanSelection(planKey, term);
  if (!norm) return null;

  const { plan, term: t, amount } = norm;
  const currencyCode = (opts.currency || "USD").toUpperCase();

  return {
    name: `TripleForm COD — ${plan.name} (${t === "annual" ? "annual" : "monthly"})`,
    price: amount ?? 0,
    currencyCode,                 // Ex: 'USD'
    interval: t === "annual" ? "ANNUAL" : "EVERY_30_DAYS",
    trialDays: 0,                 // 🚫 pas d’essai
  };
}
