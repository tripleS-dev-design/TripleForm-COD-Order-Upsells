// app/routes/api.plan-usage.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Widget "0 / 100" sur le dashboard.
 * On compte UNIQUEMENT les commandes créées par TripleForm COD,
 * identifiées par le tag d’ordre TRIPLEFORM_COD.
 *
 * Réponse:
 * { ok: true, ordersUsed: number, sinceLabel: string }
 */
export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);

    // --- Fenêtre de temps : depuis le début du mois courant ---
    const now = new Date();
    const start = new Date(now);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const startStr = start.toISOString().slice(0, 10); // YYYY-MM-DD
    const endStr = now.toISOString().slice(0, 10);

    // 👉 IMPORTANT : ce tag doit être aussi mis sur les commandes
    const APP_TAG = "TRIPLEFORM_COD";

    // On filtre : période courante + seulement les commandes taguées par l’app
    const search = `created_at:>='${startStr}' created_at:<='${endStr}' tag:'${APP_TAG}'`;

    const gql = `
      {
        orders(
          first: 250,
          query: ${JSON.stringify(search)},
          sortKey: CREATED_AT,
          reverse: true
        ) {
          edges {
            node { id }
          }
        }
      }
    `;

    const res = await admin.graphql(gql);
    const data = await res.json();

    if (!data?.data?.orders) {
      throw new Error("Réponse Shopify invalide");
    }

    const ordersUsed = data.data.orders.edges.length;

    const sinceLabel = `Depuis le ${start.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    })}`;

    return json({ ok: true, ordersUsed, sinceLabel });
  } catch (e) {
    console.error("api.plan-usage error", e);
    return json(
      {
        ok: false,
        ordersUsed: 0,
        sinceLabel: null,
        error: e?.message || "Erreur inconnue",
      },
      { status: 500 },
    );
  }
};
