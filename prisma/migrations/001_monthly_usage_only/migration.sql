-- 1) Table shop_monthly_order_usage (safe)
CREATE TABLE IF NOT EXISTS "public"."shop_monthly_order_usage" (
  "id" TEXT NOT NULL,
  "shopDomain" TEXT NOT NULL,
  "monthKey" TEXT NOT NULL,
  "used" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shop_monthly_order_usage_pkey" PRIMARY KEY ("id")
);

-- 2) Unique shopDomain + monthKey (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "shop_monthKey"
ON "public"."shop_monthly_order_usage" ("shopDomain", "monthKey");

-- 3) Index shopDomain (optional but good)
CREATE INDEX IF NOT EXISTS "shop_monthly_order_usage_shopDomain_idx"
ON "public"."shop_monthly_order_usage" ("shopDomain");

-- 4) Unique OrderSync(shopDomain, orderId) (safe)
CREATE UNIQUE INDEX IF NOT EXISTS "OrderSync_shopDomain_orderId_key"
ON "public"."OrderSync" ("shopDomain", "orderId");
