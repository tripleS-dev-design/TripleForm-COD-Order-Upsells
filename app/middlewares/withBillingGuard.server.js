// ===== File: app/middlewares/withBillingGuard.server.js =====
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";          // ⬅️ 1 seul niveau
import { requireActiveBilling } from "../models/shop.server.js";

/**
 * Enveloppe un loader Remix avec :
 * - authentification Admin (embedded)
 * - garde billing actif (sinon redirige pricing)
 */
// app/middlewares/withBillingGuard.server.js
// ✅ NO-OP: n'applique plus aucun blocage d'abonnement
export function withBillingGuard(handler) {
  return async (args) => {
    // Ancienne logique de redirection supprimée
    // On laisse passer toutes les requêtes
    return handler(args);
  };
}
