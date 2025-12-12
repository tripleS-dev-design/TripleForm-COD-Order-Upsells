// app/routes/app.sections.jsx
import { Outlet } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const ACTIVE_Q = `
  query {
    currentAppInstallation {
      activeSubscriptions { id status }
    }
  }
`;

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const seg = url.pathname.split("/").pop(); // "0", "1", ...

  // Toujours autoriser la page "0" (pricing) et NE PAS auth si shop/host manquent
  if (seg === "0" || !shop || !host) {
    return json({ ok: true, guard: "skipped" });
  }

  // Bypass optionnel pendant le dev
  if (process.env.BILLING_SKIP_GUARD === "1") {
    return json({ ok: true, guard: "bypassed" });
  }

  try {
    const { admin } = await authenticate.admin(request);
    const r = await admin.graphql(ACTIVE_Q);
    const j = await r.json();
    const active = (j?.data?.currentAppInstallation?.activeSubscriptions || [])
      .some((s) => s?.status === "ACTIVE");

    if (!active) {
      const to = new URL("/app/sections/0", url.origin);
      to.searchParams.set("shop", shop);
      to.searchParams.set("host", host);
      return redirect(to.toString());
    }

    return json({ ok: true, guard: "passed" });
  } catch {
    // En dev, ne bloque pas la navigation si l’auth échoue
    return json({ ok: true, guard: "soft-fail" });
  }
}

export default function SectionsParent() {
  return <Outlet />;
}
