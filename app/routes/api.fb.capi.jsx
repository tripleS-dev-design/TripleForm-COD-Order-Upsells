// ===== File: app/routes/api.fb.capi.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Cette route reçoit un POST JSON depuis ton app, par ex :
 *
 * fetch("/api/fb/capi", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   credentials: "include",
 *   body: JSON.stringify({
 *     eventName: "Purchase",
 *     eventId: "tfcod_12345",        // optionnel, pour déduplication pixel + CAPI
 *     eventSourceUrl: "https://store.com/products/xxx",
 *     userData: {
 *       // idéalement déjà HASHÉ en SHA-256 côté serveur :
 *       em: "hash_email",
 *       ph: "hash_phone",
 *       client_ip_address: "1.2.3.4",
 *       client_user_agent: "Mozilla/5.0 ..."
 *     },
 *     customData: {
 *       currency: "MAD",
 *       value: 299,
 *       contents: [
 *         { id: "123", quantity: 1, item_price: 299 }
 *       ],
 *       content_type: "product"
 *     }
 *   })
 * });
 */

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  // 1) Vérifier que la requête vient bien d’un admin connecté à l’app
  let admin;
  try {
    const auth = await authenticate.admin(request);
    admin = auth.admin;
  } catch (e) {
    console.error("FB CAPI auth error:", e);
    return json(
      { ok: false, error: "Unauthorized (admin required)" },
      { status: 401 }
    );
  }

  // 2) Lire le body envoyé par ton code (eventName, userData, etc.)
  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const {
    eventName = "Purchase",
    eventId,
    eventSourceUrl,
    eventTime, // optionnel, timestamp (sec). Sinon on met Date.now()
    userData = {},
    customData = {},
  } = payload || {};

  // 3) Charger la config pixels depuis le metafield "tripleform_cod / pixels"
  let pixelsCfg = null;
  try {
    const res = await admin.graphql(
      `#graphql
      query PixelsCfg {
        shop {
          metafield(namespace: "tripleform_cod", key: "pixels") {
            id
            value
          }
        }
      }
    `
    );
    const data = await res.json();
    const raw = data?.data?.shop?.metafield?.value;
    if (raw) {
      try {
        pixelsCfg = JSON.parse(raw);
      } catch (e) {
        console.error("Erreur parse pixels metafield:", e);
      }
    }
  } catch (e) {
    console.error("Erreur GraphQL pixelsCfg:", e);
  }

  const capi = pixelsCfg?.capi_fb;
  if (!capi || !capi.enabled) {
    return json(
      { ok: false, error: "Facebook CAPI non activé dans Pixels settings" },
      { status: 400 }
    );
  }
  if (!capi.pixelId || !capi.accessToken) {
    return json(
      { ok: false, error: "Pixel ID ou Access Token manquant pour CAPI" },
      { status: 400 }
    );
  }

  const pixelId = capi.pixelId;
  const accessToken = capi.accessToken;
  const testEventCode = capi.testEventCode || undefined;
  const useEventIdDedup = !!capi.useEventIdDedup;

  // 4) Construire le body pour Facebook CAPI
  const fbEvent = {
    event_name: eventName,
    event_time: eventTime || Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: userData || {},
    custom_data: customData || {},
  };

  if (useEventIdDedup && eventId) {
    fbEvent.event_id = eventId;
  }

  const fbBody = {
    data: [fbEvent],
  };

  if (testEventCode) {
    fbBody.test_event_code = testEventCode;
  }

  // 5) Appel HTTP vers Facebook Graph
  const url = `https://graph.facebook.com/v18.0/${encodeURIComponent(
    pixelId
  )}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fbBody),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      console.error("FB CAPI error:", data.error || data);
      return json(
        {
          ok: false,
          error: data.error?.message || "Facebook CAPI error",
          raw: data,
        },
        { status: 500 }
      );
    }

    return json({ ok: true, fbResponse: data });
  } catch (e) {
    console.error("FB CAPI fetch exception:", e);
    return json(
      { ok: false, error: e?.message || "Network error" },
      { status: 500 }
    );
  }
}
