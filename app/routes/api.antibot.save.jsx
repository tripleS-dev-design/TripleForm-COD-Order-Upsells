import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { encryptSecret } from "../utils/crypto.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    if (!admin) {
      return json({ ok: false, error: "Unauthorized: no admin session" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Missing or invalid JSON body" }, { status: 400 });
    }

    const antibot = body.antibot;
    if (!antibot || typeof antibot !== "object") {
      return json({ ok: false, error: "Missing 'antibot' object" }, { status: 400 });
    }

    const shopDomain = session?.shop;
    if (!shopDomain) {
      return json({ ok: false, error: "Missing shopDomain" }, { status: 400 });
    }

    // Normalisation
    const normalized = { ...antibot };
    if (!normalized.meta) normalized.meta = {};
    normalized.meta.version = 4;

    // Récupération du secret reCAPTCHA
    const secretKey = (normalized?.recaptcha?.secretKey || "").trim();
    const recaptchaEnabled = normalized?.recaptcha?.enabled === true;
    const recaptchaSiteKey = (normalized?.recaptcha?.siteKey || "").trim();

    // Sauvegarde en base (chiffré)
    await prisma.shopAntibotSettings.upsert({
      where: { shopDomain },
      create: {
        shopDomain,
        recaptchaEnabled,
        recaptchaVersion: "v2",
        recaptchaSiteKey: recaptchaSiteKey || null,
        recaptchaSecretEnc: secretKey ? encryptSecret(secretKey) : null,
      },
      update: {
        recaptchaEnabled,
        recaptchaVersion: "v2",
        recaptchaSiteKey: recaptchaSiteKey || null,
        ...(secretKey ? { recaptchaSecretEnc: encryptSecret(secretKey) } : {}),
      },
    });

    // Préparer la config publique (sans secret)
    const sanitized = JSON.parse(JSON.stringify(normalized));
    if (!sanitized.recaptcha) sanitized.recaptcha = {};
    sanitized.recaptcha.version = "v2";
    delete sanitized.recaptcha.secretKey;
    delete sanitized.recaptcha.expectedAction;
    delete sanitized.recaptcha.action;
    delete sanitized.recaptcha.minScore;

    const value = JSON.stringify(sanitized);

    // Récupérer shop.id pour le metafield
    const shopResp = await admin.graphql(`{ shop { id } }`);
    const shopJson = await shopResp.json();
    const shopId = shopJson?.data?.shop?.id;
    if (!shopId) {
      return json({ ok: false, error: "Unable to fetch shop id" }, { status: 500 });
    }

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
