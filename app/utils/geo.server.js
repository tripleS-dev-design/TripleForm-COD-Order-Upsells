// ===== File: app/utils/geo.server.js =====

// Namespace / key pour le metafield GEO
export const GEO_META_NAMESPACE = "tripleform_cod";
export const GEO_META_KEY = "geo_min_v2";

// Petit helper pour générer des IDs pour les paliers / provinces / villes
const newId = () => Math.random().toString(36).slice(2, 8);

// Même structure que defaultCfg() de Section6Geo (sans dépendance React)
export function defaultGeoConfig() {
  return {
    meta: { version: 2 },

    country: "MA",
    currency: "MAD",

    // Livraison globale
    isFree: true,          // Gratuit par défaut
    mode: "price",         // price | province | city

    // Tarifs "par prix"
    priceBrackets: [
      { id: newId(), min: 0,   max: 299, rate: 29 },
      { id: newId(), min: 299, max: null, rate: 0 },
    ],

    // Tarifs par province / wilaya
    provinceRates: {
      MA: [],
    },

    // Tarifs par ville / baladiya
    cityRates: {
      MA: [],
    },

    // Options avancées
    advanced: {
      defaultRate: 0,      // tarif appliqué si aucune règle ne match
      freeThreshold: null, // ex: livraison gratuite à partir de 500 MAD
      minOrderAmount: 0,   // commande minimum
      codExtraFee: 0,      // frais COD (optionnel)
      note: "",
    },
  };
}

// Normalise un JSON brut -> config propre
export function normalizeGeoConfig(raw) {
  if (!raw || typeof raw !== "object") return defaultGeoConfig();
  const base = defaultGeoConfig();

  return {
    ...base,
    ...raw,
    provinceRates: {
      ...(base.provinceRates || {}),
      ...(raw.provinceRates || {}),
    },
    cityRates: {
      ...(base.cityRates || {}),
      ...(raw.cityRates || {}),
    },
    advanced: {
      ...(base.advanced || {}),
      ...(raw.advanced || {}),
    },
    priceBrackets: Array.isArray(raw.priceBrackets)
      ? raw.priceBrackets
      : base.priceBrackets,
  };
}

// Récupère shopId
async function getShopId(admin) {
  const res = await admin.graphql(`{ shop { id } }`);
  const json = await res.json();
  return json?.data?.shop?.id || null;
}

/**
 * Charge la config GEO depuis le metafield du shop.
 * @param {object} admin - client admin (authenticate.admin(request).admin)
 * @returns {Promise<{shopId: string|null, geo: object}>}
 */
export async function loadGeoConfig(admin) {
  const res = await admin.graphql(`
    query GetGeoConfig {
      shop {
        id
        metafield(namespace: "${GEO_META_NAMESPACE}", key: "${GEO_META_KEY}") {
          value
        }
      }
    }
  `);

  const json = await res.json();
  const shopId = json?.data?.shop?.id || null;
  const rawVal = json?.data?.shop?.metafield?.value;

  let parsed = null;
  if (rawVal) {
    try {
      parsed = JSON.parse(rawVal);
    } catch (e) {
      console.warn("[geo.server] JSON invalide pour GEO:", e);
    }
  }

  const geo = normalizeGeoConfig(parsed);
  return { shopId, geo };
}

/**
 * Sauvegarde la config GEO dans le metafield du shop.
 * @param {object} admin - client admin
 * @param {object} geo   - config geo à sauvegarder
 */
export async function saveGeoConfig(admin, geo) {
  const shopId = await getShopId(admin);
  if (!shopId) throw new Error("No shopId for geo.save");

  const value = JSON.stringify(geo || defaultGeoConfig());

  const mfRes = await admin.graphql(
    `
    mutation SaveGeoConfig($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }
  `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: GEO_META_NAMESPACE,
            key: GEO_META_KEY,
            type: "json",
            value,
          },
        ],
      },
    }
  );

  const mfJson = await mfRes.json();
  const errs = mfJson?.data?.metafieldsSet?.userErrors || [];
  if (errs.length) {
    throw new Error(
      "Geo metafieldsSet error: " + errs.map((e) => e.message).join(", ")
    );
  }
}
