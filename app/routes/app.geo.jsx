// ===== File: app/routes/app.geo.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section6Geo from "../sections/Section6Geo.jsx";

// 🔒 Accès protégé par l’abonnement actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppGeo() {
  return (
    <Page title="Villes / Provinces / Pays">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section6Geo />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
