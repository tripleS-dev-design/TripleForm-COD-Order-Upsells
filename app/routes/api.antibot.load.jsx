import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    if (!admin) {
      return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const shopDomain = session?.shop;
    if (!shopDomain) {
      return json({ ok: false, error: "Missing shopDomain" }, { status: 400 });
    }

    // Charger metafield public
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
      delete antibot.recaptcha.minScore;
    }

    // Vérifier si un secret est présent en base
    const dbRow = await prisma.shopAntibotSettings.findUnique({
      where: { shopDomain },
      select: { recaptchaSecretEnc: true },
    });

    return json({
      ok: true,
      antibot: antibot || null,
      hasRecaptchaSecret: !!dbRow?.recaptchaSecretEnc,
    });
  } catch (error) {
    console.error("api.antibot.load error:", error);
    return json({ ok: false, error: error.message || String(error) }, { status: 500 });
  }
};
