// app/root.jsx
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";

import fr from "@shopify/polaris/locales/fr.json";
import en from "@shopify/polaris/locales/en.json";
import es from "@shopify/polaris/locales/es.json";

import "@shopify/polaris/build/esm/styles.css";

import { getRequestLocale } from "./i18n/i18n.server.js";
import { I18nProvider } from "./i18n/react.jsx";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const locale = await getRequestLocale(request); // lit le cookie tripleform-lang

  return json({
    apiKey: process.env.SHOPIFY_API_KEY ?? "test",
    host: url.searchParams.get("host") ?? "",
    locale,
  });
};

export default function Root() {
  const { apiKey, host, locale } = useLoaderData();

  // Choix des traductions Polaris
  let polarisLocale;
  switch (locale) {
    case "en":
      polarisLocale = en;
      break;
    case "es":
      polarisLocale = es;
      break;
    case "fr":
    case "ar":
    default:
      polarisLocale = fr;
      break;
  }

  // --- DEV MODE Polaris visible hors Shopify ---
  const isDevMode = process.env.NODE_ENV !== "production";
  const effectiveHost = host || (isDevMode ? "dummy-shop.myshopify.com" : "");

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0 }}>
        <ShopifyAppProvider
          apiKey={apiKey}
          host={effectiveHost}
          isEmbeddedApp={!isDevMode} // si dev, pas embedded
        >
          <PolarisAppProvider i18n={polarisLocale}>
            <I18nProvider locale={locale}>
              <Outlet />
            </I18nProvider>
          </PolarisAppProvider>
        </ShopifyAppProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
