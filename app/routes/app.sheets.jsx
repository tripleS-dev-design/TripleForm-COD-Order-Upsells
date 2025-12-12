// ===== File: app/routes/app.sheets.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section3Sheets from "../sections/Section3Sheets.jsx";

// 🔒 Protège l'accès : redirige vers /app/sections/0 si l'abonnement n'est pas actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppSheets() {
  return (
    <Page title="Google Sheets">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section3Sheets />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
