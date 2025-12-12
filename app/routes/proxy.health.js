import { json } from "@remix-run/node";

export const loader = () => json({ ok: true, where: "proxy.health" });
export const action = loader;
