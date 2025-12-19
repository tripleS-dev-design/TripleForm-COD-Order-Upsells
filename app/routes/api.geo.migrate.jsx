// ===== File: app/routes/api.geo.migrate.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { GEO_META_NAMESPACE } from "../utils/geo.server";

export const action = async ({ request }) => {
  console.log('[GEO MIGRATE] Début de la migration');
  
  try {
    const { admin } = await authenticate.admin(request);
    
    // 1. Lire l'ancien métafield "geo_min_v2"
    const oldQuery = `
      query GetOldGeoConfig {
        shop {
          metafield(namespace: "${GEO_META_NAMESPACE}", key: "geo_min_v2") {
            value
          }
        }
      }
    `;
    
    const oldResponse = await admin.graphql(oldQuery);
    const oldResult = await oldResponse.json();
    const oldValue = oldResult?.data?.shop?.metafield?.value;
    
    console.log('[GEO MIGRATE] Ancienne valeur (geo_min_v2):', oldValue);
    
    // 2. Si existe, copier vers "geo"
    if (oldValue) {
      const mutation = `
        mutation MigrateGeoConfig($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            userErrors { field message }
          }
        }
      `;
      
      // Récupérer shopId
      const shopRes = await admin.graphql(`{ shop { id } }`);
      const shopJson = await shopRes.json();
      const shopId = shopJson?.data?.shop?.id;
      
      if (shopId) {
        const mfRes = await admin.graphql(mutation, {
          variables: {
            metafields: [
              {
                ownerId: shopId,
                namespace: GEO_META_NAMESPACE,
                key: "geo",  // Nouvelle clé
                type: "json",
                value: oldValue,
              },
            ],
          },
        });
        
        const mfJson = await mfRes.json();
        console.log('[GEO MIGRATE] Résultat migration:', mfJson);
      }
    }
    
    // 3. Vérifier les deux métafields
    const checkQuery = `
      query CheckGeoConfigs {
        shop {
          old: metafield(namespace: "${GEO_META_NAMESPACE}", key: "geo_min_v2") {
            key
            value
          }
          new: metafield(namespace: "${GEO_META_NAMESPACE}", key: "geo") {
            key
            value
          }
        }
      }
    `;
    
    const checkResponse = await admin.graphql(checkQuery);
    const checkResult = await checkResponse.json();
    
    return json({
      ok: true,
      old: checkResult.data?.shop?.old,
      new: checkResult.data?.shop?.new,
      message: oldValue ? 'Migration effectuée' : 'Pas de migration nécessaire'
    });
    
  } catch (error) {
    console.error('[GEO MIGRATE] Erreur:', error);
    return json({ ok: false, error: error.message }, { status: 500 });
  }
};