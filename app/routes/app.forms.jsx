// ===== File: app/routes/app.forms.jsx =====
import { json } from "@remix-run/node";
import { Page, Layout, BlockStack } from "@shopify/polaris";
import { withBillingGuard } from "../middlewares/withBillingGuard.server.js";
import Section1Forms from "../sections/Section1Forms.jsx";

// 🔒 Protège l'accès : redirige vers /app/sections/0 si l'abonnement n'est pas actif
export const loader = withBillingGuard(async () => {
  return json({ ok: true });
});

export default function AppForms() {
  return (
    <Page title="Forms COD">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Section1Forms />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
