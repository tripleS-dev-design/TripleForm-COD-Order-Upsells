// ===== File: app/routes/app.antibot.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section5Antibot from "../sections/Section5Antibot.jsx";

// 🔒 Accès protégé par l’abonnement actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppAntibot() {
  return (
    <Page title="Anti-bot">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section5Antibot />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
