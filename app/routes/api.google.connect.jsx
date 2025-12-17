// ===== File: app/routes/api.google.connect.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { buildGoogleAuthUrl } from "../services/google.server";

export const loader = async ({ request }) => {
  try {
    // 1. Authentifier avec Shopify
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    if (!shop) {
      return json(
        { error: "Shop non trouvé dans la session", requiresReauth: true },
        { status: 401 }
      );
    }

    // 2. Récupérer la cible
    const url = new URL(request.url);
    const target = url.searchParams.get("target") || "orders";

    // 3. Construire l'URL Google OAuth
    const authUrl = buildGoogleAuthUrl({ shop, target });

    // 4. Retourner l'URL en JSON pour le frontend
    return json({ 
      success: true, 
      url: authUrl,
      shop: shop 
    });

  } catch (error) {
    console.error("Erreur dans api.google.connect:", error);
    
    // Si l'authentification Shopify échoue, retourner une erreur JSON
    return json(
      { 
        error: "Session Shopify expirée ou invalide", 
        requiresReauth: true,
        message: "Veuillez rafraîchir la page et réessayer"
      },
      { status: 401 }
    );
  }
};