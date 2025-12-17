// ===== File: app/routes/api.google.callback.jsx =====
import { handleGoogleCallback } from "../services/google.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");

  if (error) {
    console.error("Google OAuth error:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Error</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: '${error.replace(/'/g, "\\'")}'
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
        </head>
        <body>
          <p>Erreur Google OAuth: ${error}</p>
          <p>Fermeture automatique...</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code || !state) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth - Missing parameters</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: 'Missing code or state parameters'
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
        </head>
        <body>
          <p>Paramètres manquants</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
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

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Success</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_SUCCESS',
                email: '${(userEmail || '').replace(/'/g, "\\'")}',
                shop: '${shop}'
              }, '*');
            }
            setTimeout(() => {
              window.close();
            }, 1000);
          </script>
        </head>
        <body>
          <p>Connexion Google réussie !</p>
          <p>Fermeture automatique...</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (e) {
    console.error("handleGoogleCallback error", e);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth Error</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: '${(e?.message || "Erreur Google OAuth").replace(/'/g, "\\'")}'
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
        </head>
        <body>
          <p>Erreur: ${e?.message || "Erreur Google OAuth"}</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
};