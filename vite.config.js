import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals({ nativeFetch: true });

/**
 * SAFE SHOPIFY APP URL
 */
let appUrl =
  process.env.SHOPIFY_APP_URL ||
  process.env.HOST ||
  "http://localhost";

/**
 * Fix Render / Docker cases like "0.0.0.0"
 */
if (!appUrl.startsWith("http")) {
  appUrl = `http://${appUrl}`;
}

if (appUrl.includes("0.0.0.0")) {
  appUrl = "http://localhost";
}

const host = new URL(appUrl).hostname;

let hmrConfig;

if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host,
    port: Number(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    cors: {
      preflightContinue: true,
    },
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: false,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"],
  },
});
