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

import "@shopify/polaris/build/esm/styles.css";
import "./styles/tripleform.css";

import { getRequestLocale } from "./i18n/i18n.server.js";
import { I18nProvider } from "./i18n/react.jsx";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const locale = await getRequestLocale(request);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY ?? "test",
    host: url.searchParams.get("host") ?? "",
    locale,
  });
};

export default function Root() {
  const { apiKey, host, locale } = useLoaderData();

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
          isEmbeddedApp={!isDevMode}
        >
          <I18nProvider locale={locale}>
            <Outlet />
          </I18nProvider>
        </ShopifyAppProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
