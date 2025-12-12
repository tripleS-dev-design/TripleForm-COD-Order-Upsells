// ===== File: app/routes/app.offers.jsx =====
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section2Offers from "../sections/Section2Offers.jsx";

// 🔒 Protège l'accès : abonnement obligatoire
export const loader = withBillingGuard(async ({ request }) => {
  let products = [];

  try {
    const { admin } = await authenticate.admin(request);

    if (admin) {
      const resp = await admin.graphql(`
        query OffersProducts {
          products(first: 100) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `);

      const data = await resp.json();

      products =
        data?.data?.products?.edges?.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
        })) || [];
    }
  } catch (e) {
    console.error("app.offers loader – error loading products:", e);
  }

  return json({ ok: true, products });
});

export default function AppOffers() {
  const { products } = useLoaderData();

  return (
    <Page title="Offers">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* ⬇️ on passe les produits à la section */}
            <Section2Offers products={products} />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
