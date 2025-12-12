// ===== File: app/routes/api.orders.dashboard.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const url = new URL(request.url);

    // on accepte ?days= ou ?range=
    const daysParam =
      url.searchParams.get("days") || url.searchParams.get("range");

    // on accepte ?codOnly=1 OU ?onlyCod=1 (pour ancienne/new UI)
    const codOnlyParam =
      url.searchParams.get("codOnly") ?? url.searchParams.get("onlyCod");
    const codOnly =
      codOnlyParam === "1" ||
      codOnlyParam === "true" ||
      codOnlyParam === "yes";

    const days = Number(daysParam || 15) || 15;

    const now = new Date();
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const sinceIso = since.toISOString();

    // filtre de base sur la date
    let query = `created_at:>=${sinceIso}`;

    // plus tard: filtrer seulement les commandes COD si tu veux
    // if (codOnly) {
    //   query += " AND tag:'TRIPLEFORM_COD'";
    // }

    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `
      query OrdersDashboard($query: String!) {
        orders(first: 100, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              currencyCode

              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }

              currentSubtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }

              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }

              lineItems(first: 100) {
                edges {
                  node {
                    title
                    quantity
                    variant {
                      title
                    }
                  }
                }
              }

              shippingAddress {
                firstName
                countryCodeV2
                city
                province
                provinceCode
                phone
              }

              customer {
                displayName
                phone
              }
            }
          }
        }
      }
      `,
      { variables: { query } }
    );

    const data = await response.json();

    if (data?.errors?.length) {
      console.error("GraphQL errors /orders/dashboard:", data.errors);
      return json(
        {
          ok: false,
          error: data.errors[0]?.message || "Erreur GraphQL",
        },
        { status: 500 }
      );
    }

    const edges = data?.data?.orders?.edges || [];

    const orders = edges.map((edge) => {
      const o = edge.node;

      const currency =
        o.currentTotalPriceSet?.shopMoney?.currencyCode ||
        o.currencyCode ||
        "MAD";

      // prix en CENTIMES
      const totalCents =
        Number(o.currentTotalPriceSet?.shopMoney?.amount ?? 0) * 100;
      const subtotalCents =
        Number(o.currentSubtotalPriceSet?.shopMoney?.amount ?? 0) * 100;
      const shippingCents =
        Number(o.totalShippingPriceSet?.shopMoney?.amount ?? 0) * 100;

      const lineEdges = o.lineItems?.edges || [];

      // nombre total de produits (somme des quantités)
      const itemsCount = lineEdges.reduce(
        (sum, e) => sum + Number(e?.node?.quantity || 0),
        0
      );

      // titre du premier produit + variante du premier produit
      const firstLine = lineEdges[0]?.node || {};
      const firstLineTitle = firstLine.title || "";
      const firstVariantTitle = firstLine.variant?.title || "";

      const createdAt = o.createdAt;
      const dateObj = new Date(createdAt);
      const dateLabel = dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });

      const shippingAddress = o.shippingAddress || {};
      const shippingPhone = shippingAddress.phone || "";
      const shippingName = shippingAddress.firstName || "";
      const shippingCity = shippingAddress.city || "";
      const shippingProvince =
        shippingAddress.province ||
        shippingAddress.provinceCode ||
        "";
      const shippingCountry = shippingAddress.countryCodeV2 || "";

      const customerName =
        o.customer?.displayName || shippingName || "";
      const customerPhone =
        o.customer?.phone || shippingPhone || "";

      // objet "fields" pour Google Sheets / UI (même clés que APP_FIELDS + extra)
      const fields = {
        "order.date": createdAt,
        "order.id": o.name,

        "customer.name": customerName,
        "customer.phone": customerPhone,
        "customer.city": shippingCity,

        "shipping.province": shippingProvince,
        "shipping.country": shippingCountry,

        "cart.productTitle": firstLineTitle,
        "cart.variantTitle": firstVariantTitle,
        "cart.quantity": itemsCount,

        "cart.subtotal": subtotalCents,
        "cart.shipping": shippingCents,
        "cart.total": totalCents,
        "cart.currency": currency,
      };

      return {
        id: o.id,
        name: o.name,
        createdAt,
        dateLabel,

        currency,
        totalCents,
        subtotalCents,
        shippingCents,
        itemsCount,
        totalQuantity: itemsCount,

        productTitle: firstLineTitle,
        variantTitle: firstVariantTitle,

        customerName,
        customerPhone,
        city: shippingCity,
        province: shippingProvince,
        country: shippingCountry,
        shippingPhone,
        shippingName,

        // liste simplifiée des lignes
        items: lineEdges.map((e) => ({
          title: e.node?.title || "",
          quantity: Number(e.node?.quantity || 0),
          variantTitle: e.node?.variant?.title || "",
        })),

        // mapping pour Google Sheets / autres écrans
        fields,
      };
    });

    // ====== STATS GLOBALES ======
    const totalCentsAll = orders.reduce(
      (sum, o) => sum + (o.totalCents || 0),
      0
    );
    const totalAmount = totalCentsAll / 100; // en devise

    // points pour le graph (même si tu n’affiches plus le graphe, on garde pour compat)
    const pointsMap = new Map();
    for (const o of orders) {
      const d = (o.createdAt || "").slice(0, 10); // YYYY-MM-DD
      if (!d) continue;
      const prev = pointsMap.get(d) || { date: d, count: 0 };
      prev.count += 1;
      pointsMap.set(d, prev);
    }

    const points = Array.from(pointsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({
        date: p.date, // YYYY-MM-DD
        shortDate: p.date.slice(5), // "MM-DD"
        count: p.count,
        value: p.count,
        label: p.date.slice(5),
      }));

    const totals = {
      count: orders.length,
      totalCents: totalCentsAll,
      currency: orders[0]?.currency || "MAD",
      rangeDays: days,
    };

    return json({
      ok: true,

      // pour Section3Sheets (liste + stats)
      points,
      latest: orders,
      totals,

      // compat Section3Stats.jsx
      orders,
      stats: {
        totalOrders: totals.count,
        totalAmount, // en devise (MAD...), pas en centimes
        rangeDays: totals.rangeDays,
      },
    });
  } catch (e) {
    console.error("Erreur /api/orders/dashboard:", e);
    return json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
};
