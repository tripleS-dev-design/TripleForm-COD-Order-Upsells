// ===== File: app/models/shop.server.js =====
import { PrismaClient } from "@prisma/client";
import {
  checkUsageAllowed,
  bumpUsageInMemory,
  currentUsageMonth,
  normalizePlanSelection,
  isBillingActive,
  humanPlan,
} from "../utils/plans.js"; // ⬅️ import relatif (pas de ~)

/** Prisma singleton (évite les multiples connexions en dev) */
const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

/* ============================== READ ============================== */
export async function getShopByDomain(shopDomain) {
  if (!shopDomain) return null;
  return prisma.shop.findUnique({ where: { shopDomain } });
}

export async function ensureShop(shopDomain) {
  if (!shopDomain) throw new Error("shopDomain required");
  let row = await getShopByDomain(shopDomain);
  if (row) return row;

  const month = currentUsageMonth();
  row = await prisma.shop.create({
    data: {
      shopDomain,
      billingPlan: "starter",
      billingTerm: "monthly",
      billingStatus: "inactive",
      usageMonth: month,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return row;
}

/* ============================== BILLING ============================== */
export async function updateShopBilling(shopDomain, payload) {
  const { planKey, term, status, chargeId, activeSince, activeUntil } = payload || {};
  if (!shopDomain) throw new Error("shopDomain required");
  if (!planKey || !term) throw new Error("planKey & term required");

  const norm = normalizePlanSelection(planKey, term);
  if (!norm) throw new Error("Invalid plan/term");

  const row = await ensureShop(shopDomain);
  return prisma.shop.update({
    where: { id: row.id },
    data: {
      billingPlan: norm.plan.key,
      billingTerm: norm.term,
      billingStatus: status ?? row.billingStatus ?? "active",
      chargeId: chargeId ?? row.chargeId ?? null,
      activeSince: activeSince ?? row.activeSince ?? new Date(),
      activeUntil: activeUntil ?? row.activeUntil ?? null,
      updatedAt: new Date(),
    },
  });
}

export async function setBillingActive(shopDomain, planKey, term, chargeId) {
  return updateShopBilling(shopDomain, {
    planKey,
    term,
    chargeId: chargeId ?? null,
    status: "active",
    activeSince: new Date(),
  });
}

export async function setBillingInactive(shopDomain) {
  const row = await ensureShop(shopDomain);
  return prisma.shop.update({
    where: { id: row.id },
    data: {
      billingStatus: "inactive",
      updatedAt: new Date(),
    },
  });
}

/* ============================== USAGE ============================== */
export async function canUseThisMonth(shopDomain) {
  const row = await ensureShop(shopDomain);
  const res = checkUsageAllowed(row);
  return { ...res, human: humanPlan(row) };
}

export async function bumpUsage(shopDomain, delta = 1) {
  if (!shopDomain) throw new Error("shopDomain required");
  const row = await ensureShop(shopDomain);

  const month = currentUsageMonth();
  let usageMonth = row.usageMonth;
  let usageCount = row.usageCount || 0;

  if (usageMonth !== month) {
    usageMonth = month;
    usageCount = 0;
  }
  usageCount += Math.max(1, Number(delta) || 1);

  return prisma.shop.update({
    where: { id: row.id },
    data: { usageMonth, usageCount, updatedAt: new Date() },
  });
}

export async function resetUsage(shopDomain) {
  const row = await ensureShop(shopDomain);
  return prisma.shop.update({
    where: { id: row.id },
    data: { usageMonth: currentUsageMonth(), usageCount: 0, updatedAt: new Date() },
  });
}

/* ============================== GUARDS / HELPERS ============================== */
export async function requireActiveBilling(shopDomain) {
  const row = await ensureShop(shopDomain);
  if (!isBillingActive(row)) {
    const planTxt = humanPlan(row);
    const err = new Error("BILLING_INACTIVE");
    err.status = 402; // Payment Required
    err.details = { plan: planTxt, status: row.billingStatus };
    throw err;
  }
  return row;
}

export async function getBillingSnapshot(shopDomain) {
  const row = await ensureShop(shopDomain);
  const month = currentUsageMonth();
  const same = row.usageMonth === month;
  const count = same ? row.usageCount || 0 : 0;

  return {
    shopDomain: row.shopDomain,
    plan: row.billingPlan,
    term: row.billingTerm,
    status: row.billingStatus,
    chargeId: row.chargeId,
    activeSince: row.activeSince,
    activeUntil: row.activeUntil,
    usageMonth: month,
    usageCount: count,
    humanPlan: humanPlan(row),
  };
}

export { prisma };
