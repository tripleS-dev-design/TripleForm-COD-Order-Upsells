// ===== File: app/routes/app.guides.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section7Guides from "../sections/Section7Guides.jsx";

// 🔒 Accès protégé par l’abonnement actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppGuides() {
  return (
    <Page title="Guides BM & TikTok">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section7Guides />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
