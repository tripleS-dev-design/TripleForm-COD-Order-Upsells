// ===== File: app/routes/app._index.jsx =====
import { Page, Layout } from "@shopify/polaris";
import Section0Home from "../sections/Section0Home";

export default function IndexDashboard() {
  return (
    <Page title="Tripleform COD — Dashboard">
      <Layout>
        <Layout.Section>
          <Section0Home />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
