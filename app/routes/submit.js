// ===== File: app/routes/proxy.submit.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";
import { trackOrderWithPixels } from "../utils/pixels.server";

import prisma from "../db.server";
import { decryptSecret } from "../utils/crypto.server";

const TF_TAG = "tripleform-cod";

/* ------------------------------------------------------------------ */
/* ✅ SAFE BODY PARSER (App Proxy JSON / urlencoded / form-data)        */
/* ------------------------------------------------------------------ */
async function readBodySafe(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      const j = await request.json();
      return j && typeof j === "object" ? j : {};
    } catch {
      // fallthrough
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const out = {};
      for (const [k, v] of params.entries()) out[k] = v;
      if (typeof out.body === "string") {
        try {
          const parsed = JSON.parse(out.body);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
      if (typeof out.payload === "string") {
        try {
          const parsed = JSON.parse(out.payload);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
      return out;
    } catch {
      // fallthrough
    }
  }

  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      const out = {};
      for (const [k, v] of form.entries()) out[k] = v;
      if (typeof out.body === "string") {
        try {
          const parsed = JSON.parse(out.body);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
      if (typeof out.payload === "string") {
        try {
          const parsed = JSON.parse(out.payload);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
      return out;
    } catch {
      // fallthrough
    }
  }

  try {
    const j = await request.json();
    return j && typeof j === "object" ? j : {};
  } catch {
    const t = await request.text();
    try {
      return JSON.parse(t);
    } catch {
      return { raw: t };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Helpers: IP / country                                                */
/* ------------------------------------------------------------------ */
function headerAny(headers, name) {
  return (
    headers.get(name) ||
    headers.get(name.toLowerCase()) ||
    headers.get(name.toUpperCase()) ||
    ""
  );
}

function getClientIpFromRequest(request) {
  const headers = request.headers;
  const cfConnectingIp = headerAny(headers, "cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  const xForwardedFor = headerAny(headers, "x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
  const xRealIp = headerAny(headers, "x-real-ip");
  if (xRealIp) return xRealIp;
  return "";
}

function getCountryCodeFromRequest(request) {
  const headers = request.headers;
  const cfCountry = headerAny(headers, "cf-ipcountry");
  if (cfCountry) return String(cfCountry).trim();
  const xCountry = headerAny(headers, "x-country-code");
  if (xCountry) return String(xCountry).trim();
  return "";
}

/* ------------------------------------------------------------------ */
/* Load antibot config from shop metafield                              */
/* ------------------------------------------------------------------ */
async function loadAntibotConfig(admin) {
  try {
    const QUERY = `
      query antibotSettingsForProxy {
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
    if (!mf?.value) return null;
    try {
      return JSON.parse(mf.value);
    } catch {
      return null;
    }
  } catch (e) {
    console.error("loadAntibotConfig error:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Anti-bot evaluation                                                  */
/* ------------------------------------------------------------------ */
function evaluateAntibot({ config, clientIp, countryCode, fullPhone, honeypot }) {
  const res = { blocked: false, reasons: [], needsRecaptcha: false };
  if (!config || typeof config !== "object") return res;

  const honeypotCfg = config?.honeypot || {};
  const recaptchaCfg = config?.recaptcha || config?.googleRecaptcha || {};
  const { checkHoneypot, checkTime, minFillTimeMs } = config || {};

  if (checkHoneypot && honeypot && honeypot.triggered) {
    res.blocked = true;
    res.reasons.push("Honeypot triggered");
  }

  if (checkTime && honeypot && honeypot.startedAt && honeypot.submittedAt) {
    const dt = Number(honeypot.submittedAt) - Number(honeypot.startedAt);
    if (Number.isFinite(dt) && dt < Number(minFillTimeMs || 0)) {
      res.blocked = true;
      res.reasons.push(`Too fast submit (${dt}ms < ${minFillTimeMs}ms)`);
    }
  }

  if (honeypotCfg?.checkMouseMove) {
    const mouseMoved = honeypot?.mouseMoved === true;
    if (!mouseMoved) {
      res.blocked = true;
      res.reasons.push("No mouse movement detected");
    }
  }

  if (recaptchaCfg?.enabled) {
    res.needsRecaptcha = true;
  }

  return res;
}

/* ------------------------------------------------------------------ */
/* reCAPTCHA v2 verify                                                  */
/* ------------------------------------------------------------------ */
async function verifyRecaptchaV2({ token, remoteip, secret }) {
  if (!secret) return { ok: false, reason: "missing_secret", success: false };
  if (!token) return { ok: false, reason: "missing_token", success: false };

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteip) form.set("remoteip", remoteip);

    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const data = await resp.json().catch(() => ({}));
    const success = data?.success === true;
    const errorCodes = Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [];
    const ok = success === true;
    let reason = "ok";
    if (!success) reason = errorCodes.length ? errorCodes.join(",") : "google_failed";
    return { ok, success, reason, hostname: data?.hostname, challengeTs: data?.challenge_ts, errorCodes };
  } catch (e) {
    return { ok: false, success: false, reason: String(e?.message || e), errorCodes: [] };
  }
}

/* ------------------------------------------------------------------ */
/* Build a realistic shipping address for draft order                  */
/* ------------------------------------------------------------------ */
function buildGenericShippingAddress(countryCode) {
  // Adresse générique mais réaliste pour éviter les erreurs Shopify
  return {
    firstName: "COD",
    lastName: "Customer",
    address1: "123 Main Street",
    city: "Casablanca",
    province: "Casablanca-Settat",
    zip: "20000",
    country: countryCode || "MA",
    phone: "+212600000000",
  };
}

/* ------------------------------------------------------------------ */
/* ACTION (submit COD) – NO PERSONAL DATA COLLECTED                    */
/* ------------------------------------------------------------------ */
export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.public.appProxy(request);
    const shop = session?.shop;

    if (!shop) {
      return json(
        {
          ok: false,
          error: "No session for this shop via app proxy. Please install the app first.",
        },
        { status: 401 }
      );
    }

    if (!admin) {
      return json(
        { ok: false, error: "Admin API client unavailable for this shop." },
        { status: 401 }
      );
    }

    const body = await readBodySafe(request);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Missing or invalid body." }, { status: 400 });
    }

    // ✅ Only non‑personal fields are allowed
    const fields = (body.fields && typeof body.fields === "object" ? body.fields : {}) || {};
    const allowedFieldKeys = ["quantity", "pincode", "pincode2", "pincode3", "notes"];
    const cleanFields = {};
    for (const key of allowedFieldKeys) {
      if (fields[key] !== undefined) cleanFields[key] = String(fields[key] || "").trim();
    }

    const rawVariantId = body.variantId;
    let variantGid = null;
    if (rawVariantId) {
      const s = String(rawVariantId);
      variantGid = s.startsWith("gid://") ? s : `gid://shopify/ProductVariant/${s}`;
    }
    const qty = Number(body.qty || cleanFields.quantity || 1);
    if (!variantGid || !(qty > 0)) {
      return json({ ok: false, error: "variantId/qty invalid." }, { status: 400 });
    }

    const countryCode = String(
      body?.countryCode ||
        body?.country ||
        fields?.countryCode ||
        fields?.country ||
        getCountryCodeFromRequest(request) ||
        "MA"
    )
      .trim()
      .toUpperCase();

    // Honeypot + anti‑bot
    const honeypotInfo = body.honeypot || body.antiBot || body.antibot || null;

    const recaptchaTokenRaw =
      body.recaptchaToken ||
      body.recaptcha_token ||
      body["g-recaptcha-response"] ||
      fields?.["g-recaptcha-response"] ||
      body?.recaptcha?.token ||
      (typeof body?.recaptcha === "string" ? body.recaptcha : "") ||
      "";
    const recaptchaToken = String(recaptchaTokenRaw || "").trim();
    const clientRecaptchaAction = String(
      body.recaptchaAction || body.recaptcha_action || body?.recaptcha?.action || ""
    ).trim();

    const antibotCfg = await loadAntibotConfig(admin);
    const clientIp = getClientIpFromRequest(request);
    const userAgent = request.headers.get("user-agent") || null;

    const antibotResult = evaluateAntibot({
      config: antibotCfg,
      clientIp,
      countryCode,
      fullPhone: "", // no phone collected
      honeypot: honeypotInfo,
    });

    if (antibotResult.blocked) {
      console.warn("TripleForm COD — Anti-bot blocked request:", shop, clientIp, antibotResult.reasons);
      return json(
        {
          ok: false,
          code: "ANTIBOT_BLOCKED",
          error: "Request blocked by Anti-bot rules.",
          reasons: antibotResult.reasons,
        },
        { status: 403 }
      );
    }

    // reCAPTCHA check (v2)
    if (antibotResult.needsRecaptcha) {
      const row = await prisma.shopAntibotSettings.findUnique({
        where: { shopDomain: shop },
        select: { recaptchaSecretEnc: true },
      });
      let secret = "";
      if (row?.recaptchaSecretEnc) {
        try {
          secret = decryptSecret(row.recaptchaSecretEnc) || "";
        } catch (e) {
          console.error("Decrypt recaptcha secret failed:", e);
          secret = "";
        }
      }
      if (!secret) {
        return json(
          {
            ok: false,
            code: "RECAPTCHA_MISCONFIG",
            error: "reCAPTCHA enabled but secret key is missing for this shop.",
          },
          { status: 403 }
        );
      }
      const check = await verifyRecaptchaV2({
        token: recaptchaToken,
        remoteip: clientIp,
        secret,
      });
      if (!check.ok) {
        console.warn("TripleForm COD — reCAPTCHA v2 failed:", {
          shop,
          clientIp,
          clientAction: clientRecaptchaAction || null,
          success: check.success,
          reason: check.reason,
          errorCodes: check.errorCodes,
        });
        return json(
          {
            ok: false,
            code: "RECAPTCHA_FAILED",
            error: "Recaptcha verification failed.",
            details: { reason: check.reason, success: check.success, errorCodes: check.errorCodes },
          },
          { status: 403 }
        );
      }
    }

    // Coupon code (optional, non‑personal)
    const couponCode = String(
      body?.couponCode ??
        body?.coupon_code ??
        body?.promoCode ??
        body?.promo_code ??
        body?.discountCode ??
        body?.discount_code ??
        (body?.fields &&
          (body.fields.couponCode ||
            body.fields.coupon_code ||
            body.fields.promoCode ||
            body.fields.promo_code ||
            body.fields.discountCode ||
            body.fields.discount_code)) ??
        fields?.couponCode ??
        fields?.coupon_code ??
        ""
    ).trim();

    const totals = {
      priceCents: body?.priceCents != null ? Number(body.priceCents) : null,
      totalCents: body?.totalCents != null ? Number(body.totalCents) : null,
      discountCents: body?.discountCents != null ? Number(body.discountCents) : null,
      qty,
      currency: body?.currency || null,
      couponCode,
      productId: body?.productId || null,
      variantId: rawVariantId || null,
      pageUrl: body?.pageUrl || null,
      eventId: body?.eventId || null,
    };

    // ✅ Ajout d'un timestamp unique pour forcer un nouveau draft
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 8);
    const note = [
      "Created by TripleForm COD",
      cleanFields.notes ? `Notes: ${cleanFields.notes}` : null,
      countryCode ? `Country: ${countryCode}` : null,
      couponCode ? `Coupon: ${couponCode}` : null,
      cleanFields.pincode ? `Pincode: ${cleanFields.pincode}` : null,
      cleanFields.pincode2 ? `Pincode2: ${cleanFields.pincode2}` : null,
      cleanFields.pincode3 ? `Pincode3: ${cleanFields.pincode3}` : null,
      `UID: ${uniqueId}`,
    ]
      .filter(Boolean)
      .join(" | ");

    // Custom attributes – only non‑personal fields
    const customAttributes = [
      { key: "tf_quantity", value: String(qty) },
      { key: "tf_pincode", value: cleanFields.pincode || "" },
      { key: "tf_pincode2", value: cleanFields.pincode2 || "" },
      { key: "tf_pincode3", value: cleanFields.pincode3 || "" },
      { key: "tf_notes", value: cleanFields.notes || "" },
      { key: "tf_coupon", value: couponCode || "" },
    ];

    const shippingAddress = buildGenericShippingAddress(countryCode);

    const input = {
      lineItems: [{ variantId: variantGid, quantity: qty }],
      shippingAddress,
      tags: [TF_TAG],
      note,
      customAttributes,
    };

    // ✅ Log avant création
    console.log("📦 Creating new draft order for shop:", shop, "variantId:", variantGid, "qty:", qty);

    // Create draft order (without personal data)
    const CREATE = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder { id invoiceUrl }
          userErrors { field message }
        }
      }
    `;
    const createResp = await admin.graphql(CREATE, { variables: { input } });
    const createJson = await createResp.json();
    const createData = createJson?.data?.draftOrderCreate;
    const userErrA = createData?.userErrors || [];
    const draft = createData?.draftOrder || null;

    if (userErrA.length) {
      console.error("draftOrderCreate userErrors:", userErrA);
      return json(
        { ok: false, error: userErrA[0]?.message || "draftOrderCreate error", details: userErrA },
        { status: 400 }
      );
    }
    if (!draft?.id) {
      console.error("No draft order id returned.");
      return json({ ok: false, error: "No draft order id returned." }, { status: 500 });
    }

    console.log("✅ Draft order created with ID:", draft.id, "invoiceUrl:", draft.invoiceUrl);

    // ✅ Compléter le draft
    const COMPLETE = `
      mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
        draftOrderComplete(id: $id, paymentPending: $paymentPending) {
          draftOrder {
            id
            invoiceUrl
            order { id name }
          }
          userErrors { field message }
        }
      }
    `;
    const compResp = await admin.graphql(COMPLETE, {
      variables: { id: draft.id, paymentPending: true },
    });
    const compJson = await compResp.json();
    const compData = compJson?.data?.draftOrderComplete;
    const userErrB = compData?.userErrors || [];
    const completedDraft = compData?.draftOrder || null;
    const orderObj = completedDraft?.order || null;

    if (userErrB.length) {
      console.error("draftOrderComplete userErrors:", userErrB);
      return json(
        {
          ok: false,
          error: userErrB[0]?.message || "draftOrderComplete error",
          draftInvoiceUrl: draft?.invoiceUrl || null,
        },
        { status: 400 }
      );
    }

    const orderName = orderObj?.name || null;
    const invoiceUrl = completedDraft?.invoiceUrl || draft?.invoiceUrl || null;
    console.log("🏁 Draft completed, order:", orderName, "final invoiceUrl:", invoiceUrl);

    // Google Sheets – only non‑personal data
    try {
      const shippingCents =
        body?.shippingCents != null
          ? Number(body.shippingCents)
          : body?.shipping_cents != null
          ? Number(body.shipping_cents)
          : null;
      const baseTotalCents =
        body?.baseTotalCents != null
          ? Number(body.baseTotalCents)
          : body?.base_total_cents != null
          ? Number(body.base_total_cents)
          : null;
      const totalWithShippingCents =
        totals.totalCents != null
          ? Number(totals.totalCents)
          : body?.grandTotalCents != null
          ? Number(body.grandTotalCents)
          : null;
      const totalWithoutShippingCents =
        baseTotalCents != null
          ? Math.max(0, Number(baseTotalCents) - Number(totals.discountCents || 0))
          : totalWithShippingCents != null && shippingCents != null
          ? Math.max(0, Number(totalWithShippingCents) - Number(shippingCents))
          : totals.priceCents != null
          ? Number(totals.priceCents)
          : null;

      const offerPayload = body?.appliedOffer ?? body?.offer ?? null;
      const offerName = String(
        body?.offerName ??
          body?.offer_name ??
          body?.offerTitle ??
          body?.offer_title ??
          offerPayload?.title ??
          offerPayload?.name ??
          ""
      ).trim();
      const upsellsPayload = body?.upsells ?? null;
      const upsellName = String(
        body?.upsellName ??
          body?.upsell_name ??
          body?.upsellTitle ??
          body?.upsell_title ??
          (Array.isArray(upsellsPayload) &&
            upsellsPayload[0] &&
            (upsellsPayload[0].title || upsellsPayload[0].name)) ??
          ""
      ).trim();

      const orderForSheet = {
        shop,
        createdAt: new Date().toISOString(),
        order: {
          id: orderObj?.id || completedDraft?.id || draft.id,
          name: orderName,
        },
        customer: {
          pincode: cleanFields.pincode || "",
          pincode2: cleanFields.pincode2 || "",
          pincode3: cleanFields.pincode3 || "",
          notes: cleanFields.notes || "",
        },
        fields: { ...cleanFields, couponCode, countryCode },
        cart: {
          productTitle: body?.productTitle || body?.product_title || body?.productName || "",
          variantTitle: body?.variantTitle || body?.variant_title || "",
          quantity: qty,
          offerName,
          offer: offerPayload || null,
          offers: body?.offers || null,
          appliedOffer: offerPayload || null,
          upsellName,
          upsells: upsellsPayload || null,
          appliedUpsell: body?.appliedUpsell || null,
          couponCode,
          totalNormal: baseTotalCents != null ? Number(baseTotalCents) / 100 : null,
          discount: totals.discountCents != null ? Number(totals.discountCents) / 100 : null,
          totalWithoutShipping:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotal: totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotalCents: totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) : null,
          shipping: shippingCents != null ? Number(shippingCents) / 100 : null,
          shippingCents: shippingCents != null ? Number(shippingCents) : null,
          totalWithShipping:
            totalWithShippingCents != null ? Number(totalWithShippingCents) / 100 : null,
          total: totalWithShippingCents != null ? Number(totalWithShippingCents) / 100 : null,
          totalCents: totalWithShippingCents != null ? Number(totalWithShippingCents) : totals.totalCents,
          currency: totals.currency,
        },
        meta: { source: "tripleform-cod" },
      };
      await appendOrderToSheet({ shop, order: orderForSheet });
    } catch (err) {
      console.error("Erreur Google Sheets:", err);
    }

    // Pixels tracking (no personal data)
    try {
      await trackOrderWithPixels({
        admin,
        shop,
        totals,
        fields: { ...cleanFields, couponCode, countryCode },
        shippingAddress,
        orderName,
        clientIp,
        userAgent,
      });
    } catch (err) {
      console.error("Erreur tracking pixels:", err);
    }

    // ✅ Retourner l'URL de checkout avec un timestamp pour éviter le cache
    const finalRedirectUrl = invoiceUrl ? invoiceUrl + (invoiceUrl.includes('?') ? '&' : '?') + '_=' + Date.now() : null;

    return json({
      ok: true,
      redirectUrl: finalRedirectUrl,
      draftId: completedDraft?.id || draft.id,
      draftInvoiceUrl: finalRedirectUrl,
      orderName,
    });
  } catch (e) {
    console.error("proxy.submit error:", e);
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
};

export const loader = () => json({ ok: true, where: "proxy.submit" });
