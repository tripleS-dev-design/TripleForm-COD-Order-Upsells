// app/routes/webhooks.app.installed.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin, shop } = await authenticate.webhook(request);

  // URL de callback du Carrier Service (doit être accessible publiquement)
  const callbackUrl = `${process.env.SHOPIFY_APP_URL}/api/carrier-service`;

  // Enregistrer le Carrier Service via l'API GraphQL Admin
  const response = await admin.graphql(
    `#graphql
    mutation carrierServiceCreate($input: DeliveryCarrierServiceCreateInput!) {
      carrierServiceCreate(input: $input) {
        carrierService {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          name: "TripleForm COD",
          callbackUrl: callbackUrl,
          serviceDiscovery: true,
          active: true,
        },
      },
    }
  );

  const data = await response.json();
  console.log("Carrier service registration:", data);

  return new Response("OK", { status: 200 });
};
