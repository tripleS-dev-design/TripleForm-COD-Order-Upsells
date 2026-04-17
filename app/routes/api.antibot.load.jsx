import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    if (!admin) {
      return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Lire metafield
    const query = `
      query {
        shop {
          metafield(namespace: "tripleform_cod", key: "antibot") {
            value
          }
        }
      }
    `;
    const resp = await admin.graphql(query);
    const data = await resp.json();
    const metafield = data?.data?.shop?.metafield;
    let antibot = null;
    if (metafield?.value) {
      try {
        antibot = JSON.parse(metafield.value);
      } catch (e) {
        antibot = null;
      }
    }

    // Normalisation v2
    if (antibot && typeof antibot === "object") {
      if (!antibot.recaptcha) antibot.recaptcha = {};
      antibot.recaptcha.version = "v2";
      delete antibot.recaptcha.secretKey;
      delete antibot.recaptcha.expectedAction;
    }

    // Indiquer qu'il n'y a pas de secret en base (on ne stocke plus le secret, seulement la config publique)
    return json({
      ok: true,
      antibot: antibot || null,
      hasRecaptchaSecret: false,
    });
  } catch (error) {
    console.error("api.antibot.load error:", error);
    return json({ ok: false, error: error.message || String(error) }, { status: 500 });
  }
};
