// app/routes/app.sections._index.jsx
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const to = new URL("/app/sections/1", url.origin);
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  if (shop) to.searchParams.set("shop", shop);
  if (host) to.searchParams.set("host", host);
  return redirect(to.toString());
}

export default function Index() { return null; }
