import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    if (!admin) {
      return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const antibot = body.antibot;
    if (!antibot || typeof antibot !== "object") {
      return json({ ok: false, error: "Missing 'antibot' object" }, { status: 400 });
    }

    // Récupérer shop.id
    const shopResp = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopResp.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) {
      return json({ ok: false, error: "Unable to fetch shop id" }, { status: 500 });
    }

    // Nettoyer la config : enlever le secret s'il est présent (ne pas le stocker dans metafield)
    const sanitized = JSON.parse(JSON.stringify(antibot));
    if (sanitized.recaptcha) {
      delete sanitized.recaptcha.secretKey;
      delete sanitized.recaptcha.expectedAction;
      sanitized.recaptcha.version = "v2";
    }
    if (!sanitized.meta) sanitized.meta = {};
    sanitized.meta.version = 4;

    const value = JSON.stringify(sanitized);

    // Mutation pour sauvegarder dans metafield
    const mutation = `
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id }
          userErrors { field message }
        }
      }
    `;
    const variables = {
      metafields: [
        {
          ownerId: shopId,
          namespace: "tripleform_cod",
          key: "antibot",
          type: "json",
          value,
        },
      ],
    };

    const mfResp = await admin.graphql(mutation, { variables });
    const mfData = await mfResp.json();
    const userErrors = mfData?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length) {
      console.error("Antibot metafield errors:", userErrors);
      return json({ ok: false, error: userErrors[0]?.message || "Metafield save failed" }, { status: 400 });
    }

    return json({ ok: true });
  } catch (error) {
    console.error("api.antibot.save error:", error);
    return json({ ok: false, error: error.message || String(error) }, { status: 500 });
  }
};
