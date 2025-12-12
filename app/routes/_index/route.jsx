// app/routes/_index/route.jsx
import { redirect } from "@remix-run/node";
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const qs = url.search ? `?${url.searchParams.toString()}` : "";
  return redirect("/app" + qs);
};
export default function Index(){ return null; }
