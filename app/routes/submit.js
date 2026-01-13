// ===== File: app/routes/proxy.submit.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";
import { trackOrderWithPixels } from "../utils/pixels.server";

import prisma from "../db.server";
import { decryptSecret } from "../utils/crypto.server";

const TF_TAG = "tripleform-cod"; // 👈 tag unique pour reconnaître les commandes de l'app

/* ------------------------------------------------------------------ */
/* ✅ SAFE BODY PARSER (App Proxy JSON / urlencoded / form-data)        */
/* ------------------------------------------------------------------ */
async function readBodySafe(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  // JSON
  if (contentType.includes("application/json")) {
    try {
      const j = await request.json();
      return j && typeof j === "object" ? j : {};
    } catch {
      // fallthrough -> try text
    }
  }

  // urlencoded
  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const text = await request.text();
      const params = new URLSearchParams(text);
      const out = {};
      for (const [k, v] of params.entries()) out[k] = v;

      // if proxy sends a raw json string inside "body" or "payload"
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

  // multipart/form-data
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

  // fallback: try json then text
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

  // basic honeypot checks
  if (checkHoneypot && honeypot && honeypot.triggered) {
    res.blocked = true;
    res.reasons.push("Honeypot triggered");
  }

  // time-based check
  if (checkTime && honeypot && honeypot.startedAt && honeypot.submittedAt) {
    const dt = Number(honeypot.submittedAt) - Number(honeypot.startedAt);
    if (Number.isFinite(dt) && dt < Number(minFillTimeMs || 0)) {
      res.blocked = true;
      res.reasons.push(`Too fast submit (${dt}ms < ${minFillTimeMs}ms)`);
    }
  }

  // optional mouse move check (if config asks and client provides)
  if (honeypotCfg?.checkMouseMove) {
    const mouseMoved = honeypot?.mouseMoved === true;
    if (!mouseMoved) {
      res.blocked = true;
      res.reasons.push("No mouse movement detected");
    }
  }

  // recaptcha only if enabled in config
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
    const hostname = data?.hostname ? String(data.hostname) : "";
    const challengeTs = data?.challenge_ts ? String(data.challenge_ts) : "";

    const ok = success === true;
    let reason = "ok";
    if (!success) {
      reason = errorCodes.length ? errorCodes.join(",") : "google_failed";
    }

    return { ok, success, reason, hostname, challengeTs, errorCodes, data };
  } catch (e) {
    return { ok: false, success: false, reason: String(e?.message || e), errorCodes: [] };
  }
}

/* ------------------------------------------------------------------ */
/* Build shipping address for Draft Order                               */
/* ------------------------------------------------------------------ */
function buildShippingAddress(fields, fullPhone, countryCode) {
  return {
    firstName: String(fields.name || "").trim() || "Customer",
    address1: String(fields.address || "").trim(),
    city: String(fields.city || "").trim(),
    province: String(fields.province || "").trim(),
    zip: String(fields.zip || fields.postal || "").trim(),
    country: countryCode || String(fields.country || "").trim() || "MA",
    phone: fullPhone || String(fields.phone || "").trim(),
  };
}

/* ------------------------------------------------------------------ */
/* Fetch product title/variant title from Admin API                     */
/* ------------------------------------------------------------------ */
async function fetchProductInfo(admin, variantGid) {
  if (!admin || !variantGid) return { productTitle: null, variantTitle: null };

  try {
    const QUERY = `
      query tfProductInfo($id: ID!) {
        productVariant(id: $id) {
          id
          title
          product { id title }
        }
      }
    `;
    const resp = await admin.graphql(QUERY, { variables: { id: variantGid } });
    const j = await resp.json();
    const pv = j?.data?.productVariant;
    if (!pv) return { productTitle: null, variantTitle: null };

    return {
      productTitle: pv.product?.title || null,
      variantTitle: pv.title || null,
    };
  } catch (e) {
    console.error("fetchProductInfo error:", e);
    return { productTitle: null, variantTitle: null };
  }
}

/* ------------------------------------------------------------------ */
/* ACTION (submit COD)                                                 */
/* ------------------------------------------------------------------ */
export const action = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.public.appProxy(request);
    const shop = session?.shop;

    if (!shop) {
      return json(
        {
          ok: false,
          error:
            "No session for this shop via app proxy. Ouvre l'app depuis l'admin une fois puis réessaie.",
        },
        { status: 401 }
      );
    }

    if (!admin) {
      return json(
        {
          ok: false,
          error: "Admin API client unavailable for this shop (no offline session).",
        },
        { status: 401 }
      );
    }

    // ✅ App Proxy body can be JSON or urlencoded -> use safe parser
    const body = await readBodySafe(request);

    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Missing or invalid body." }, { status: 400 });
    }

    const rawVariantId = body.variantId;
    let variantGid = null;

    if (rawVariantId) {
      const s = String(rawVariantId);
      variantGid = s.startsWith("gid://") ? s : `gid://shopify/ProductVariant/${s}`;
    }

    const qty = Number(body.qty || 1);

    if (!variantGid || !(qty > 0)) {
      return json({ ok: false, error: "variantId/qty invalid." }, { status: 400 });
    }

    // fields payload
    const fields = (body.fields && typeof body.fields === "object" ? body.fields : {}) || {};

    const phonePrefix =
      fields.phonePrefix ||
      fields.phone_prefix ||
      fields.phoneCode ||
      fields.phone_code ||
      "";

    const phoneVal = fields.phone || "";

    const fullPhone = String(fields.fullPhone || body.fullPhone || `${phonePrefix}${phoneVal}` || "")
      .trim()
      .replace(/\s+/g, "");

    const countryCode =
      String(body.countryCode || fields.countryCode || getCountryCodeFromRequest(request) || "")
        .trim()
        .toUpperCase() || null;

    // Honeypot + anti-bot
    const honeypotInfo = body.honeypot || body.antiBot || body.antibot || null;

    // ✅ reCAPTCHA token (v2 checkbox => g-recaptcha-response)
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
      fullPhone,
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

    // ✅ reCAPTCHA check (v2) — secret par shop depuis DB
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
          hostname: check.hostname || null,
          challengeTs: check.challengeTs,
        });

        return json(
          {
            ok: false,
            code: "RECAPTCHA_FAILED",
            error: "Recaptcha verification failed.",
            details: {
              reason: check.reason,
              success: check.success,
              errorCodes: check.errorCodes,
              hostname: check.hostname,
              challengeTs: check.challengeTs,
            },
          },
          { status: 403 }
        );
      }
    }

    const shippingAddress = buildShippingAddress(fields, fullPhone, countryCode);

    const currency = body?.currency || null;

    // ✅ Coupon / Promo code (optional)
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
        fields?.promoCode ??
        fields?.promo_code ??
        fields?.discountCode ??
        fields?.discount_code ??
        ""
    ).trim();

    const totals = {
      priceCents: body?.priceCents != null ? Number(body.priceCents) : null,
      totalCents: body?.totalCents != null ? Number(body.totalCents) : null,
      discountCents: body?.discountCents != null ? Number(body.discountCents) : null,
      qty,
      currency,
      couponCode,
      productId: body?.productId || null,
      variantId: rawVariantId || null,
      pageUrl: body?.pageUrl || null,
      eventId: body?.eventId || null,
    };

    const note = [
      "Created by TripleForm COD",
      fields.notes ? `Notes: ${fields.notes}` : null,
      countryCode ? `Country: ${countryCode}` : null,
      couponCode ? `Coupon: ${couponCode}` : null,
      currency && totals.totalCents != null
        ? `Total shown: ${(Number(totals.totalCents) / 100).toFixed(2)} ${currency}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const input = {
      lineItems: [{ variantId: variantGid, quantity: qty }],
      shippingAddress,
      tags: [TF_TAG],
      note,
      customAttributes: [
        { key: "tf_name", value: String(fields.name || "") },
        { key: "tf_phone", value: fullPhone },
        { key: "tf_city", value: String(fields.city || "") },
        { key: "tf_province", value: String(fields.province || "") },
        { key: "tf_country", value: countryCode || "" },
        { key: "tf_coupon", value: couponCode || "" },
      ],
    };

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
      return json(
        {
          ok: false,
          error: userErrA[0]?.message || "draftOrderCreate error",
          details: userErrA,
        },
        { status: 400 }
      );
    }

    if (!draft?.id) {
      return json({ ok: false, error: "No draft order id returned." }, { status: 500 });
    }

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

    // Fetch product info for better Sheets export
    const productInfo = await fetchProductInfo(admin, variantGid);

    // 6) Google Sheets
    try {
      // ✅ Totaux explicit (pour mapping Google Sheets)
      const shippingCents =
        body?.shippingCents != null
          ? Number(body.shippingCents)
          : body?.shipping_cents != null
            ? Number(body.shipping_cents)
            : body?.shippingAmount != null
              ? Math.round(Number(body.shippingAmount) * 100)
              : null;

      const baseTotalCents =
        body?.baseTotalCents != null
          ? Number(body.baseTotalCents)
          : body?.base_total_cents != null
            ? Number(body.base_total_cents)
            : body?.baseTotal != null
              ? Math.round(Number(body.baseTotal) * 100)
              : null;

      const totalWithShippingCents =
        totals.totalCents != null
          ? Number(totals.totalCents)
          : body?.grandTotalCents != null
            ? Number(body.grandTotalCents)
            : body?.grand_total_cents != null
              ? Number(body.grand_total_cents)
              : null;

      // total without shipping = (base - discount) OR (total - shipping) fallback
      const totalWithoutShippingCents =
        baseTotalCents != null
          ? Math.max(0, Number(baseTotalCents) - Number(totals.discountCents || 0))
          : totalWithShippingCents != null && shippingCents != null
            ? Math.max(0, Number(totalWithShippingCents) - Number(shippingCents))
            : totals.priceCents != null
              ? Number(totals.priceCents)
              : null;

      // ✅ Offers / Upsells payload (forwarded from product page)
      const offerPayload = body?.appliedOffer ?? body?.offer ?? null;
      const offersPayload = body?.offers ?? null;

      const offerName = String(
        body?.offerName ??
          body?.offer_name ??
          body?.offerTitle ??
          body?.offer_title ??
          offerPayload?.title ??
          offerPayload?.name ??
          offerPayload?.label ??
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
            (upsellsPayload[0].title || upsellsPayload[0].name || upsellsPayload[0].label)) ??
          ""
      ).trim();

      const appliedUpsellPayload = body?.appliedUpsell ?? null;

      const orderForSheet = {
        shop,
        createdAt: new Date().toISOString(),
        order: {
          id: orderObj?.id || completedDraft?.id || draft.id || null,
          name: orderName,
        },
        customer: {
          name: fields.name || "",
          phone: fullPhone,
          city: fields.city || "",
          province: fields.province || "",
          address: fields.address || "",
          country: countryCode || "",
          notes: fields.notes || "",
          email: fields.email || "",
          pincode: fields.pincode || "",
          pincode2: fields.pincode2 || "",
          pincode3: fields.pincode3 || "",
          company: fields.company || "",
          birthday: fields.birthday || "",
        },
        // ✅ raw form fields (for flexible Sheets mapping)
        fields: { ...fields, fullPhone, countryCode, couponCode },
        cart: {
          productTitle:
            productInfo.productTitle ||
            body?.productTitle ||
            body?.product_title ||
            body?.productName ||
            body?.product_name ||
            body?.title ||
            (body?.product && (body.product.title || body.product.name)) ||
            "",
          variantTitle:
            productInfo.variantTitle ||
            body?.variantTitle ||
            body?.variant_title ||
            "",
          quantity: qty,

          // ✅ OFFERS / UPSELLS / COUPON
          offerName: offerName || "",
          offer: offerPayload || null,
          offers: offersPayload || null,
          appliedOffer: offerPayload || null,

          upsellName: upsellName || "",
          upsells: upsellsPayload || null,
          appliedUpsell: appliedUpsellPayload || null,

          couponCode: couponCode || "",

          // ✅ Totaux (nombres purs pour mapping Sheets)
          totalNormal: baseTotalCents != null ? Number(baseTotalCents) / 100 : null,
          totalNormalWithShipping:
            baseTotalCents != null && shippingCents != null
              ? (Number(baseTotalCents) + Number(shippingCents)) / 100
              : null,
          discount: totals.discountCents != null ? Number(totals.discountCents) / 100 : null,

          totalWithoutShipping:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotal:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotalCents:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) : null,

          shipping:
            shippingCents != null
              ? Number(shippingCents) / 100
              : body?.shippingAmount != null
                ? Number(body.shippingAmount)
                : null,
          shippingCents: shippingCents != null ? Number(shippingCents) : null,

          totalWithShipping:
            totalWithShippingCents != null ? Number(totalWithShippingCents) / 100 : null,
          total:
            totalWithShippingCents != null ? Number(totalWithShippingCents) / 100 : null,
          totalCents:
            totalWithShippingCents != null
              ? Number(totalWithShippingCents)
              : totals.totalCents != null
                ? Number(totals.totalCents)
                : null,

          currency,
        },
        meta: { source: "tripleform-cod" },
      };

      await appendOrderToSheet({ shop, order: orderForSheet });
    } catch (err) {
      console.error("Erreur lors de l'envoi de la commande vers Google Sheets :", err);
    }

    // 7) Pixels
    try {
      await trackOrderWithPixels({
        admin,
        shop,
        totals,
        fields: { ...fields, fullPhone, countryCode, couponCode },
        shippingAddress,
        orderName,
        clientIp,
        userAgent,
      });
    } catch (err) {
      console.error("Erreur tracking pixels Tripleform COD :", err);
    }

    return json({
      ok: true,
      draftId: completedDraft?.id || draft.id,
      draftInvoiceUrl: completedDraft?.invoiceUrl || draft?.invoiceUrl || null,
      orderName,
    });
  } catch (e) {
    console.error("proxy.submit error:", e);
    const msg =
      e?.message ||
      (e?.response?.errors && JSON.stringify(e.response.errors)) ||
      String(e);
    return json({ ok: false, error: msg }, { status: 500 });
  }
};

export const loader = () => json({ ok: true, where: "proxy.submit" });
