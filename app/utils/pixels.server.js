// ===== File: app/utils/pixels.server.js =====
import { createHash, randomUUID } from "crypto";

/**
 * Charge la config Pixels stockée dans l'installation de l'app
 * (metafield namespace "tripleform_cod", key "pixels")
 */
export async function loadPixelsConfig(admin) {
  if (!admin) return null;
  try {
    const resp = await admin.graphql(`
      query TripleformPixelsConfig {
        currentAppInstallation {
          metafield(namespace: "tripleform_cod", key: "pixels") {
            value
          }
        }
      }
    `);
    const json = await resp.json();
    const raw = json?.data?.currentAppInstallation?.metafield?.value;
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("[Tripleform COD] Pixels metafield JSON invalide :", e);
      return null;
    }
  } catch (e) {
    console.error("[Tripleform COD] Erreur loadPixelsConfig :", e);
    return null;
  }
}

function sha256Normalize(value) {
  if (!value) return null;
  const clean = String(value).trim().toLowerCase();
  if (!clean) return null;
  return createHash("sha256").update(clean).digest("hex");
}

/**
 * Envoie un événement "Purchase" à Facebook Conversions API
 */
export async function sendFbCapiPurchase({
  pixelsCfg,
  shop,
  totals,
  fields,
  shippingAddress,
  orderName,
  clientIp,
  userAgent,
}) {
  const fbCfg = pixelsCfg?.capi_fb;
  if (!fbCfg?.enabled) return;

  const pixelId = fbCfg.pixelId;
  const accessToken = fbCfg.accessToken;
  if (!pixelId || !accessToken) return;

  const totalCents =
    totals?.totalCents != null ? Number(totals.totalCents) : 0;
  const priceCents =
    totals?.priceCents != null ? Number(totals.priceCents) : 0;
  const value = totalCents > 0 ? totalCents / 100 : null;
  const currency = totals?.currency || "USD";

  const qty = totals?.qty || 1;
  const variantId = totals?.variantId || totals?.productId || undefined;

  const phoneHash = sha256Normalize(
    fields?.fullPhone || fields?.phone || shippingAddress?.phone
  );

  const eventId = totals?.eventId || randomUUID();

  const data = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: eventId,
    event_source_url: totals?.pageUrl || undefined,
    user_data: {
      client_ip_address: clientIp || undefined,
      client_user_agent: userAgent || undefined,
      ph: phoneHash ? [phoneHash] : undefined,
    },
    custom_data: {
      currency,
      value,
      contents: [
        {
          id: variantId,
          quantity: qty,
          item_price: priceCents > 0 ? priceCents / 100 : undefined,
        },
      ],
      content_type: "product",
      order_id: orderName || undefined,
    },
  };

  const payload = {
    data: [data],
  };

  if (fbCfg.testEventCode) {
    payload.test_event_code = fbCfg.testEventCode;
  }

  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(
    pixelId
  )}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(
        "[Tripleform COD] FB CAPI error",
        res.status,
        JSON.stringify(json)
      );
    } else {
      console.info("[Tripleform COD] FB CAPI OK", json);
    }
  } catch (e) {
    console.error("[Tripleform COD] FB CAPI network error", e);
  }
}

/**
 * Point d’entrée générique pour le tracking d’une commande COD.
 * (pour l’instant : Facebook CAPI Purchase)
 */
export async function trackOrderWithPixels({
  admin,
  shop,
  totals,
  fields,
  shippingAddress,
  orderName,
  clientIp,
  userAgent,
}) {
  if (!admin) return;

  const cfg = await loadPixelsConfig(admin);
  if (!cfg) return;

  try {
    await sendFbCapiPurchase({
      pixelsCfg: cfg,
      shop,
      totals,
      fields,
      shippingAddress,
      orderName,
      clientIp,
      userAgent,
    });

    // Plus tard : ajouter TikTok Events API ici.
  } catch (e) {
    console.error("[Tripleform COD] trackOrderWithPixels error :", e);
  }
}
