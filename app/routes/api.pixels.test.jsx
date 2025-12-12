// ===== File: app/routes/api.pixels.test.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { loadPixelsConfig } from "../utils/pixels.server";

export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (!session || !session.shop) {
      return json(
        { ok: false, error: "Shop non authentifié (admin session manquante)." },
        { status: 401 }
      );
    }
    if (!admin) {
      return json(
        {
          ok: false,
          error:
            "Admin API client indisponible pour cette boutique (offline session manquante).",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const provider = body?.provider || "fb_capi";

    const cfg = await loadPixelsConfig(admin);
    if (!cfg) {
      return json(
        {
          ok: false,
          error:
            "Aucune configuration Pixels trouvée pour cette boutique (metafield vide). Enregistre d’abord tes paramètres.",
        },
        { status: 400 }
      );
    }

    // === TEST FACEBOOK CAPI ===
    if (provider === "fb_capi") {
      const fb = cfg.capi_fb || {};
      if (!fb.enabled) {
        return json(
          {
            ok: false,
            error:
              "Facebook CAPI n’est pas activé dans la config (capi_fb.enabled = false).",
          },
          { status: 400 }
        );
      }
      if (!fb.pixelId || !fb.accessToken) {
        return json(
          {
            ok: false,
            error:
              "Pixel ID ou Access Token manquant pour Facebook CAPI. Vérifie le panneau CAPI.",
          },
          { status: 400 }
        );
      }

      return json({
        ok: true,
        provider,
        message:
          "Config Facebook CAPI détectée (pixelId + accessToken + enabled). Utilise le Test Event Code dans Events Manager et fais une commande COD pour voir les events.",
        hasTestEventCode: !!fb.testEventCode,
      });
    }

    // === TEST TIKTOK EVENTS API ===
    if (provider === "tiktok_api") {
      const tt = cfg.tiktok_api || {};
      if (!tt.enabled) {
        return json(
          {
            ok: false,
            error:
              "TikTok Events API n’est pas activé dans la config (tiktok_api.enabled = false).",
          },
          { status: 400 }
        );
      }
      if (!tt.pixelCode || !tt.accessToken) {
        return json(
          {
            ok: false,
            error:
              "Pixel Code ou Access Token TikTok manquant. Vérifie le panneau TikTok Events API.",
          },
          { status: 400 }
        );
      }

      return json({
        ok: true,
        provider,
        message:
          "Config TikTok Events API détectée (pixelCode + accessToken + enabled). Utilise TikTok Events Manager pour valider les conversions.",
      });
    }

    return json(
      {
        ok: false,
        error: `Provider inconnu pour le test: ${provider}`,
      },
      { status: 400 }
    );
  } catch (e) {
    console.error("api.pixels.test error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

export const loader = () =>
  json({ ok: true, where: "api.pixels.test" });
