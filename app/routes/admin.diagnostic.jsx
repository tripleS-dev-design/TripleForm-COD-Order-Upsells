// app/routes/admin.diagnostic.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getGoogleSettingsForShop } from "../services/google.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  // Récupérer les paramètres Google pour la boutique actuelle
  const shop = 'samifinal2.myshopify.com'; // À modifier si besoin
  const settings = await getGoogleSettingsForShop(shop);
  
  return json({
    shop,
    hasSettingsRecord: !!settings,
    googleEmail: settings?.googleEmail || 'Non défini',
    accessTokenExists: !!settings?.accessToken,
    refreshTokenExists: !!settings?.refreshToken,
    tokenExpiryDate: settings?.tokenExpiryDate,
    // Pour le débogage avancé uniquement (montre les champs) :
    allFields: settings ? Object.keys(settings) : []
  });
};