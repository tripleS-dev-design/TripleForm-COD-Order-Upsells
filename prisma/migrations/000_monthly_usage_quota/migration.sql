-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shop" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "billingPlan" TEXT,
    "billingTerm" TEXT,
    "billingStatus" TEXT,
    "subscriptionId" TEXT,
    "unitAmount" DOUBLE PRECISION,
    "currentPeriodEnd" TIMESTAMP(3),
    "usageMonth" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopGoogleSettings" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "googleUserId" TEXT,
    "googleEmail" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "scope" TEXT,
    "tokenType" TEXT,
    "tokenExpiryDate" TIMESTAMP(3),
    "sheetsConfigJson" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "spreadsheetId" TEXT,
    "sheetName" TEXT DEFAULT 'Orders',
    "columns" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopGoogleSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_status" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "sessionId" TEXT,
    "phoneNumber" TEXT,
    "qrCode" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "connectedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_config" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "phoneNumber" TEXT DEFAULT '',
    "businessName" TEXT DEFAULT '',
    "orderMessage" TEXT DEFAULT '✅ Commande #{orderId} confirmée! Livraison dans 2-3 jours. Merci!',
    "sendAutomatically" BOOLEAN NOT NULL DEFAULT true,
    "useToken" BOOLEAN NOT NULL DEFAULT false,
    "permanentToken" TEXT DEFAULT '',
    "mode" TEXT NOT NULL DEFAULT 'simple',
    "autoConnect" BOOLEAN NOT NULL DEFAULT true,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 24,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "buttonText" TEXT NOT NULL DEFAULT '💬 WhatsApp',
    "messageTemplate" TEXT NOT NULL DEFAULT '✅ Commande #{orderId} confirmée! Livraison dans 2-3 jours.',
    "sendDelay" TEXT NOT NULL DEFAULT 'immediate',
    "buttonPosition" TEXT NOT NULL DEFAULT 'below',
    "buttonStyle" TEXT NOT NULL DEFAULT 'secondary',
    "recoveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "recoveryMessage" TEXT NOT NULL DEFAULT '👋 Vous avez oublié quelque chose! Votre panier vous attend.',
    "recoveryDelay" TEXT NOT NULL DEFAULT '1h',
    "recoveryDiscount" TEXT NOT NULL DEFAULT '10%',
    "recoveryCode" TEXT NOT NULL DEFAULT 'RECOVERY10',
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "enableReadReceipts" BOOLEAN NOT NULL DEFAULT true,
    "enableTypingIndicator" BOOLEAN NOT NULL DEFAULT false,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryInterval" INTEGER NOT NULL DEFAULT 5,
    "businessHoursOnly" BOOLEAN NOT NULL DEFAULT false,
    "businessHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "businessHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "enableMediaMessages" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrl" TEXT,
    "enableButtons" BOOLEAN NOT NULL DEFAULT false,
    "button1Text" TEXT NOT NULL DEFAULT 'Suivre ma commande',
    "button1Url" TEXT NOT NULL DEFAULT '{trackingUrl}',
    "button2Text" TEXT NOT NULL DEFAULT 'Contacter le support',
    "button2Url" TEXT NOT NULL DEFAULT 'https://wa.me/{supportNumber}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_stats" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "successful" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "ordersNotified" INTEGER NOT NULL DEFAULT 0,
    "recoverySent" INTEGER NOT NULL DEFAULT 0,
    "recoveryConverted" INTEGER NOT NULL DEFAULT 0,
    "recoveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3),
    "lastRecoveryAt" TIMESTAMP(3),
    "lastTestAt" TIMESTAMP(3),
    "lastTestMessageAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whatsapp_messages" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "messageId" TEXT,
    "orderId" TEXT,
    "cartToken" TEXT,
    "customerPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abandoned_carts" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "items" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "abandonedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recoveredAt" TIMESTAMP(3),
    "recoveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "recoveryMessageId" TEXT,
    "recoveryError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderSync" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderData" TEXT NOT NULL,
    "syncedToSheets" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "sheetRow" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_antibot_settings" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "recaptchaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "recaptchaVersion" TEXT,
    "recaptchaSiteKey" TEXT,
    "recaptchaSecretEnc" TEXT,
    "recaptchaExpectedAction" TEXT DEFAULT 'tf_submit',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_antibot_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_monthly_order_usage" (
    "id" TEXT NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_monthly_order_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plan_usage" (
    "id" SERIAL NOT NULL,
    "shopDomain" TEXT NOT NULL,
    "planKey" TEXT,
    "periodStart" TIMESTAMP(3),
    "ordersUsed" INTEGER NOT NULL DEFAULT 0,
    "ordersLimit" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "public"."Shop"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "ShopGoogleSettings_shopDomain_key" ON "public"."ShopGoogleSettings"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_status_shopDomain_key" ON "public"."whatsapp_status"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_config_shopDomain_key" ON "public"."whatsapp_config"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_stats_shopDomain_key" ON "public"."whatsapp_stats"("shopDomain");

-- CreateIndex
CREATE INDEX "whatsapp_messages_shopDomain_idx" ON "public"."whatsapp_messages"("shopDomain");

-- CreateIndex
CREATE INDEX "whatsapp_messages_orderId_idx" ON "public"."whatsapp_messages"("orderId");

-- CreateIndex
CREATE INDEX "whatsapp_messages_cartToken_idx" ON "public"."whatsapp_messages"("cartToken");

-- CreateIndex
CREATE INDEX "whatsapp_messages_customerPhone_idx" ON "public"."whatsapp_messages"("customerPhone");

-- CreateIndex
CREATE INDEX "whatsapp_messages_sentAt_idx" ON "public"."whatsapp_messages"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_token_key" ON "public"."abandoned_carts"("token");

-- CreateIndex
CREATE INDEX "abandoned_carts_shopDomain_idx" ON "public"."abandoned_carts"("shopDomain");

-- CreateIndex
CREATE INDEX "abandoned_carts_customerPhone_idx" ON "public"."abandoned_carts"("customerPhone");

-- CreateIndex
CREATE INDEX "abandoned_carts_abandonedAt_idx" ON "public"."abandoned_carts"("abandonedAt");

-- CreateIndex
CREATE INDEX "abandoned_carts_recoveryStatus_idx" ON "public"."abandoned_carts"("recoveryStatus");

-- CreateIndex
CREATE INDEX "OrderSync_shopDomain_idx" ON "public"."OrderSync"("shopDomain");

-- CreateIndex
CREATE INDEX "OrderSync_orderId_idx" ON "public"."OrderSync"("orderId");

-- CreateIndex
CREATE INDEX "OrderSync_syncedToSheets_idx" ON "public"."OrderSync"("syncedToSheets");

-- CreateIndex
CREATE INDEX "OrderSync_syncedAt_idx" ON "public"."OrderSync"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSync_shopDomain_orderId_key" ON "public"."OrderSync"("shopDomain", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_antibot_settings_shopDomain_key" ON "public"."shop_antibot_settings"("shopDomain");

-- CreateIndex
CREATE INDEX "shop_monthly_order_usage_shopDomain_idx" ON "public"."shop_monthly_order_usage"("shopDomain");

-- CreateIndex
CREATE UNIQUE INDEX "shop_monthly_order_usage_shopDomain_monthKey_key" ON "public"."shop_monthly_order_usage"("shopDomain", "monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "plan_usage_shopDomain_key" ON "public"."plan_usage"("shopDomain");

