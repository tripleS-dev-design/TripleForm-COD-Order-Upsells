// app/routes/action.set-locale.js
import { json } from "@remix-run/node";
import { languageCookie } from "../i18n/i18n.server.js";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const newLocale = formData.get("locale");

  const validLocales = ["en", "fr", "es", "ar"];
  const locale = validLocales.includes(newLocale) ? newLocale : "fr";

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await languageCookie.serialize({ locale }),
      },
    }
  );
};
