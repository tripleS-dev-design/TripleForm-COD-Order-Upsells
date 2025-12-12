// ===== File: app/routes/app.pixels.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section4Pixels from "../sections/Section4Pixels.jsx";

// 🔒 Protège l'accès : redirige vers /app/sections/0 si l'abonnement n'est pas actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppPixels() {
  return (
    <Page title="Pixels">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section4Pixels />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}