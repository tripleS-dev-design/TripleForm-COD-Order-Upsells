// app/i18n/i18n.server.js
import { createCookie } from "@remix-run/node";

export const langCookie = createCookie("tripleform-lang", {
  // IMPORTANT : path global pour toutes les routes
  path: "/",
  httpOnly: false,
  // IMPORTANT : pour que le cookie marche dans l'iframe Shopify
  sameSite: "none",
  secure: true, // obligatoire avec SameSite: "none"
});

// Lire la langue depuis le cookie
export async function getRequestLocale(request) {
  const cookieHeader = request.headers.get("Cookie");
  const localeFromCookie = await langCookie.parse(cookieHeader);

  // si pas de cookie → français par défaut
  return localeFromCookie || "fr";
}

// Écrire le cookie
export async function commitLocale(locale) {
  const safeLocale = ["fr", "en", "es", "ar"].includes(locale)
    ? locale
    : "fr";

  return langCookie.serialize(safeLocale);
}
