// ===== File: app/routes/api.google.callback.jsx =====
import { redirect, json } from "@remix-run/node";
import { handleGoogleCallback } from "../services/google.server";

// Page principale après connexion Google : ton écran Section3
const APP_AFTER_GOOGLE = "/app/sheets";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (error) {
    console.error("Google OAuth error:", error);
    return redirect(
      `${APP_AFTER_GOOGLE}?google_error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return json(
      { ok: false, error: "Code ou state manquant dans la réponse Google" },
      { status: 400 }
    );
  }

  try {
    const { shop, target, userEmail } = await handleGoogleCallback(
      code,
      state
    );

    console.log(
      `[Google OAuth] Boutique ${shop} connectée avec ${userEmail} (target=${target})`
    );

    return redirect(`${APP_AFTER_GOOGLE}?google=connected`);
  } catch (e) {
    console.error("handleGoogleCallback error", e);
    return redirect(
      `${APP_AFTER_GOOGLE}?google_error=${encodeURIComponent(
        e?.message || "Erreur Google OAuth"
      )}`
    );
  }
};
