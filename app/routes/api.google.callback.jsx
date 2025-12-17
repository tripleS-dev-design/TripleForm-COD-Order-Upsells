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
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f6f7f9;
            }
            .container {
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Erreur Google OAuth</h2>
            <p>${error}</p>
            <button onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
      `,
      { 
        headers: { 
          "Content-Type": "text/html",
          "X-Frame-Options": "DENY"
        } 
      }
    );
  }

  if (!code || !state) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google OAuth - Missing parameters</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: 'Missing code or state parameters'
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
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
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f6f7f9;
            }
            .container {
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Connexion Google réussie !</h2>
            <p>Compte connecté : ${userEmail || ''}</p>
            <p>Cette fenêtre va se fermer automatiquement...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_SUCCESS',
                email: '${(userEmail || '').replace(/'/g, "\\'")}',
                timestamp: ${Date.now()}
              }, '*');
            }
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
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
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_ERROR',
                error: '${(e?.message || "Erreur Google OAuth").replace(/'/g, "\\'")}'
              }, '*');
            }
            setTimeout(() => window.close(), 1000);
          </script>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }
};