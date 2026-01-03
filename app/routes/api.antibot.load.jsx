import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * GET /api/antibot/load
 * - Lit metafield tripleform_cod.antibot (config publique)
 * - Ajoute hasRecaptchaSecret (depuis DB), sans renvoyer la secret
 *
 * ✅ FIX: normalise recaptcha (enabled/siteKey/expectedAction/minScore)
 * pour que le FRONT ait toujours les infos correctes.
 */
export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (!admin) {
      return json({ ok: false, error: "Unauthorized: no admin session" }, { status: 401 });
    }

    const shopDomain = session?.shop;
    if (!shopDomain) {
      return json({ ok: false, error: "Missing shopDomain in session" }, { status: 400 });
    }

    const QUERY = `
      query antibotSettings {
        shop {
          metafield(namespace: "tripleform_cod", key: "antibot") {
            id
            value
            type
          }
        }
      }
    `;

    const resp = await admin.graphql(QUERY);
    const data = await resp.json();
    const mf = data?.data?.shop?.metafield || null;

    let antibot = null;
    if (mf?.value) {
      try {
        antibot = JSON.parse(mf.value);
      } catch {
        antibot = null;
      }
    }

    // DB: est-ce qu'on a une secret key sauvegardée ? + infos recaptcha (fallback)
    const row = await prisma.shopAntibotSettings.findUnique({
      where: { shopDomain },
      select: {
        recaptchaSecretEnc: true,
        recaptchaEnabled: true,
        recaptchaVersion: true,
        recaptchaSiteKey: true,
        recaptchaExpectedAction: true,
      },
    });

    // ✅ Normaliser antibot + recaptcha pour que le front ait toujours expectedAction
    const safe = antibot && typeof antibot === "object" ? antibot : {};

    const mfRecaptcha =
      safe.recaptcha && typeof safe.recaptcha === "object" ? safe.recaptcha : {};

    const expectedAction = (
      mfRecaptcha.expectedAction ||
      mfRecaptcha.action ||
      row?.recaptchaExpectedAction ||
      "tf_submit"
    ).trim();

    const recaptchaSiteKey = (mfRecaptcha.siteKey || row?.recaptchaSiteKey || "").trim();

    const recaptchaEnabled =
      mfRecaptcha.enabled === true || row?.recaptchaEnabled === true;

    const recaptchaVersion = mfRecaptcha.version || row?.recaptchaVersion || "v3";

    const minScore =
      mfRecaptcha.minScore != null ? Number(mfRecaptcha.minScore) : 0.5;

    safe.recaptcha = {
      ...mfRecaptcha,
      enabled: recaptchaEnabled,
      version: recaptchaVersion,
      siteKey: recaptchaSiteKey,
      expectedAction,
      minScore,
      // ⚠️ jamais renvoyer secret
    };

    return json({
      ok: true,
      antibot: safe,
      hasRecaptchaSecret: !!row?.recaptchaSecretEnc,
    });
  } catch (e) {
    console.error("api.antibot.load error:", e);
    return json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
};
