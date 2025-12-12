// ===== File: app/routes/app.jsx =====
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { NavMenu } from "@shopify/app-bridge-react";

import { I18nProvider } from "../i18n/react";
import { getRequestLocale } from "../i18n/i18n.server.js";

export const loader = async ({ request }) => {
  const locale = await getRequestLocale(request); // lit le cookie "tripleform-lang"
  return json({ locale });
};

export default function AppLayout() {
  const { locale } = useLoaderData();

  return (
    <I18nProvider locale={locale}>
      <NavMenu>
        <a href="/app" rel="home">Accueil</a>
        <a href="/app/forms">Forms COD</a>
        <a href="/app/offers">Offers</a>
        <a href="/app/sheets">Google Sheets</a>
        <a href="/app/pixels">Pixels</a>
        <a href="/app/antibot">Anti-bot</a>
        <a href="/app/geo">Villes/Provinces/Pays</a>
      </NavMenu>
      <Outlet />
    </I18nProvider>
  );
}
