// app/shopify.server.js
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },

  // ---------- Billing : 3 plans (starter / basic / premium) ----------
  billing: {
    // Starter
    "starter-monthly": {
      amount: 0.99,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
      trialDays: 3,
    },
    "starter-annual": {
      amount: 9.99,
      currencyCode: "USD",
      interval: "ANNUAL",
      trialDays: 3,
    },

    // Basic
    "basic-monthly": {
      amount: 4.99,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
      trialDays: 3,
    },
    "basic-annual": {
      amount: 49,
      currencyCode: "USD",
      interval: "ANNUAL",
      trialDays: 3,
    },

    // Premium
    "premium-monthly": {
      amount: 9.99,
      currencyCode: "USD",
      interval: "EVERY_30_DAYS",
      trialDays: 3,
    },
    "premium-annual": {
      amount: 99,
      currencyCode: "USD",
      interval: "ANNUAL",
      trialDays: 3,
    },
  },
  // ---------- SUPPRIMER la configuration webhooks ----------

  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;