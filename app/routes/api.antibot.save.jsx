import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server"; // adapte si ton chemin est différent
import { encryptSecret } from "../utils/crypto.server";

/**
 * POST /api/antibot/save
 * Body JSON: { antibot: { ...config... } }
 *
 * - Metafield tripleform_cod.antibot = config publique (SANS secretKey)
 * - DB ShopAntibotSettings = secretKey chiffrée (recaptchaSecretEnc)
 */
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
      return json({ ok: false, error: "Missing 'antibot' object in body" }, { status: 400 });
    }

    // shopDomain depuis session Shopify (le plus fiable)
    const shopDomain = session?.shop;
    if (!shopDomain) {
      return json({ ok: false, error: "Missing shopDomain in session" }, { status: 400 });
    }

    // Normalisation + defaults
    const normalized = {
      meta: { version: Number(antibot?.meta?.version || 4) },
      ...antibot,
    };

    // ==== 1) Secret -> DB (chiffré) ====
    const secretKey = normalized?.recaptcha?.secretKey?.trim() || "";
    const recaptchaEnabled = normalized?.recaptcha?.enabled === true;
    const recaptchaVersion = normalized?.recaptcha?.version || "v3";
    const recaptchaSiteKey = normalized?.recaptcha?.siteKey?.trim() || "";

    // ✅ FIX: supporter expectedAction OU action
    const recaptchaExpectedAction = (
      normalized?.recaptcha?.expectedAction ||
      normalized?.recaptcha?.action ||
      "tf_submit"
    ).trim();

    // upsert DB (on n’écrase pas le secret si vide)
    await prisma.shopAntibotSettings.upsert({
      where: { shopDomain },
      create: {
        shopDomain,
        recaptchaEnabled,
        recaptchaVersion,
        recaptchaSiteKey: recaptchaSiteKey || null,
        recaptchaSecretEnc: secretKey ? encryptSecret(secretKey) : null,
        recaptchaExpectedAction,
      },
      update: {
        recaptchaEnabled,
        recaptchaVersion,
        recaptchaSiteKey: recaptchaSiteKey || null,
        ...(secretKey ? { recaptchaSecretEnc: encryptSecret(secretKey) } : {}),
        recaptchaExpectedAction,
      },
    });

    // ==== 2) Metafield -> config publique (SANS secretKey) ====
    const sanitized = structuredClone(normalized);

    // ✅ FIX: forcer expectedAction dans la config publique (source de vérité pour le front)
    if (sanitized?.recaptcha && typeof sanitized.recaptcha === "object") {
      sanitized.recaptcha.expectedAction = (
        sanitized.recaptcha.expectedAction ||
        sanitized.recaptcha.action ||
        "tf_submit"
      ).trim();

      // ne jamais envoyer le secret dans le metafield public
      delete sanitized.recaptcha.secretKey;
    }

    const value = JSON.stringify(sanitized);

    // récupérer shop.id
    const SHOP_ID_QUERY = `
      query GetShopIdForAntibot {
        shop { id }
      }
    `;
    const shopResp = await admin.graphql(SHOP_ID_QUERY);
    const shopJson = await shopResp.json();
    const shopId = shopJson?.data?.shop?.id || null;

    if (!shopId) {
      console.error("api.antibot.save — impossible de récupérer shop.id", shopJson);
      return json(
        { ok: false, error: "Unable to resolve shop.id for metafieldsSet." },
        { status: 500 }
      );
    }

    const MUTATION = `
      mutation antibotMetafieldSave($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }
    `;

    const resp = await admin.graphql(MUTATION, {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "tripleform_cod",
            key: "antibot",
            type: "json",
            value,
          },
        ],
      },
    });

    const data = await resp.json();
    const errs = data?.data?.metafieldsSet?.userErrors || [];
    if (errs.length > 0) {
      console.error("api.antibot.save metafieldsSet userErrors:", errs);
      return json(
        { ok: false, error: errs[0]?.message || "metafieldsSet error", details: errs },
        { status: 400 }
      );
    }

    return json({ ok: true });
  } catch (e) {
    console.error("api.antibot.save error:", e);
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
};
