// app/routes/app.lang.jsx
import { redirect } from "@remix-run/node";
import { commitLocale } from "../i18n/i18n.server";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const locale = formData.get("locale") || "fr";

  const cookie = await commitLocale(locale);

  // On revient sur la page précédente sinon /app
  const referer = request.headers.get("Referer") || "/app";

  return redirect(referer, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};
