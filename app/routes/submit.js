// ===== File: app/routes/proxy.submit.jsx =====
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { appendOrderToSheet } from "../utils/googleSheets.server";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const TF_TAG = "tripleform-cod";

/* ------------------------------------------------------------------ */
/* Helpers: safe body parser (JSON or urlencoded)                      */
/* ------------------------------------------------------------------ */

async function readBodySafe(request) {
  const contentType = request.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      return await request.json();
    }

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const out = {};
      for (const [k, v] of form.entries()) {
        out[k] = v;
      }

      // If "body" key exists (some proxies send raw json string)
      if (out.body && typeof out.body === "string") {
        try {
          const parsed = JSON.parse(out.body);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {}
      }

      // If "payload" key exists
      if (out.payload && typeof out.payload === "string") {
        try {
          const parsed = JSON.parse(out.payload);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {}
      }

      return out;
    }

    // fallback: try json first then text
    try {
      return await request.json();
    } catch (e) {
      const t = await request.text();
      try {
        return JSON.parse(t);
      } catch (err) {
        return { raw: t };
      }
    }
  } catch (e) {
    console.error("readBodySafe error:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Helpers: IP + country + antibot                                     */
/* ------------------------------------------------------------------ */

function getClientIpFromRequest(request, antibotCfg) {
  const headers = request.headers;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // first ip in list
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  // fallback
  return null;
}

function getCountryCodeFromRequest(request) {
  const headers = request.headers;
  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry) return String(cfCountry).trim();
  const xCountry = headers.get("x-country-code");
  if (xCountry) return String(xCountry).trim();
  return null;
}

async function loadAntibotConfig(admin) {
  // TODO: if you have a shop-level config in DB, load it here
  // For now, defaults
  return {
    checkHoneypot: true,
    checkTime: true,
    minFillTimeMs: 900, // must be at least 0.9s
    checkMouseMove: false,
    recaptcha: { enabled: true }, // enabled globally, secret per shop in DB
  };
}

/* ------------------------------------------------------------------ */
/* reCAPTCHA v2 verify                                                  */
/* ------------------------------------------------------------------ */

async function verifyRecaptchaV2({ token, secret, remoteip }) {
  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (remoteip) params.append("remoteip", remoteip);

    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await resp.json().catch(() => ({}));
    const ok = !!data.success;

    return {
      ok,
      success: ok,
      reason: ok ? null : "recaptcha_invalid",
      errorCodes: data["error-codes"] || null,
      hostname: data.hostname || null,
      challengeTs: data.challenge_ts || null,
    };
  } catch (e) {
    return {
      ok: false,
      success: false,
      reason: "recaptcha_error",
      errorCodes: [String(e?.message || e)],
      hostname: null,
      challengeTs: null,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Decrypt helper (for encrypted secrets in DB)                         */
/* ------------------------------------------------------------------ */

function decryptSecret(encrypted) {
  // TODO: implement your decrypt logic if you encrypt secrets.
  // For now, assume it's stored as plain text
  return encrypted || "";
}

/* ------------------------------------------------------------------ */
/* Anti-bot evaluation                                                  */
/* ------------------------------------------------------------------ */

function evaluateAntibot({ config, clientIp, countryCode, fullPhone, honeypot }) {
  const res = { blocked: false, reasons: [], needsRecaptcha: false };

  const honeypotCfg = config?.honeypot || {};
  const recaptchaCfg = config?.recaptcha || {};
  const { checkHoneypot, checkTime, minFillTimeMs } = config || {};

  // basic checks
  if (checkHoneypot && honeypot && honeypot.triggered) {
    res.blocked = true;
    res.reasons.push("Honeypot triggered");
  }

  // optional time-based check
  if (checkTime && honeypot && honeypot.startedAt && honeypot.submittedAt) {
    const dt = Number(honeypot.submittedAt) - Number(honeypot.startedAt);
    if (Number.isFinite(dt) && dt < Number(minFillTimeMs || 0)) {
      res.blocked = true;
      res.reasons.push(`Too fast submit (${dt}ms < ${minFillTimeMs}ms)`);
    }
  }

  // optional mouse movement (if client provides it)
  if (honeypotCfg.checkMouseMove) {
    const mouseMoved = honeypot?.mouseMoved === true;
    if (!mouseMoved) {
      res.blocked = true;
      res.reasons.push("No mouse movement detected");
    }
  }

  // reCAPTCHA required if enabled
  if (recaptchaCfg?.enabled) {
    res.needsRecaptcha = true;
  }

  return res;
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

    // ✅ FIX: App Proxy body can be JSON or urlencoded -> use safe parser
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

    // reCAPTCHA token (client sends)
    const recaptchaTokenRaw =
      body.recaptchaToken ||
      body.recaptcha ||
      body.recaptcha_token ||
      (body?.recaptcha && body.recaptcha.token) ||
      (typeof body.recaptcha === "string" ? body.recaptcha : "") ||
      "";

    const recaptchaToken = String(recaptchaTokenRaw || "").trim();

    // ⚠️ action envoyée par le client: utile pour debug seulement
    const clientRecaptchaAction = String(
      body.recaptchaAction || body.recaptcha_action || body?.recaptcha?.action || ""
    ).trim();

    const antibotCfg = await loadAntibotConfig(admin);

    const clientIp = getClientIpFromRequest(request, antibotCfg);
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
      // 🔐 charger secret enc depuis DB
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

      // si recaptcha activé mais pas de secret => configuration cassée
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
            body.fields.promo_code)) ??
        fields?.couponCode ??
        fields?.coupon_code ??
        fields?.promoCode ??
        fields?.promo_code ??
        fields?.discountCode ??
        fields?.discount_code ??
        ""
    ).trim();

    const totals = {
      // priceCents might be per-item (depends on client); keep it for pixels/debug
      priceCents: body?.priceCents != null ? Number(body.priceCents) : null,

      // baseTotalCents = subtotal before discount (client sends this)
      baseTotalCents:
        body?.baseTotalCents != null
          ? Number(body.baseTotalCents)
          : body?.base_total_cents != null
            ? Number(body.base_total_cents)
            : body?.baseTotal != null
              ? Number(body.baseTotal)
              : body?.subtotalCents != null
                ? Number(body.subtotalCents)
                : null,

      discountCents: body?.discountCents != null ? Number(body.discountCents) : null,

      shippingCents:
        body?.shippingCents != null
          ? Number(body.shippingCents)
          : body?.shipping_cents != null
            ? Number(body.shipping_cents)
            : body?.shippingAmount != null
              ? Math.round(Number(body.shippingAmount) * 100)
              : null,

      totalCents:
        body?.totalCents != null
          ? Number(body.totalCents)
          : body?.grandTotalCents != null
            ? Number(body.grandTotalCents)
            : body?.grand_total_cents != null
              ? Number(body.grand_total_cents)
              : null,

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
      const totalWithoutShippingCents =
        totals.baseTotalCents != null
          ? Math.max(0, Number(totals.baseTotalCents) - Number(totals.discountCents || 0))
          : totals.totalCents != null && totals.shippingCents != null
            ? Math.max(0, Number(totals.totalCents) - Number(totals.shippingCents))
            : null;

      const totalWithShippingCents =
        totals.totalCents != null
          ? Number(totals.totalCents)
          : totalWithoutShippingCents != null && totals.shippingCents != null
            ? Number(totalWithoutShippingCents) + Number(totals.shippingCents)
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
        fields: { ...(fields || {}), fullPhone, countryCode, couponCode },
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

          // ✅ Offers (forwarded from client)
          offerName: offerName || "",
          offer: offerPayload || null,
          offers: offersPayload || null,
          appliedOffer: offerPayload || null,

          // ✅ Upsells (optional)
          upsellName: upsellName || "",
          upsells: upsellsPayload || null,
          appliedUpsell: upsellsPayload || null,

          // ✅ Code promo / coupon (optional)
          couponCode: couponCode || "",

          // ✅ Totaux (nombres purs pour mapping Sheets)
          totalNormal: totals.baseTotalCents != null ? Number(totals.baseTotalCents) / 100 : null,
          totalNormalWithShipping:
            totals.baseTotalCents != null && totals.shippingCents != null
              ? (Number(totals.baseTotalCents) + Number(totals.shippingCents)) / 100
              : null,
          discount: totals.discountCents != null ? Number(totals.discountCents) / 100 : null,

          totalWithoutShipping:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotal:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) / 100 : null,
          subtotalCents:
            totalWithoutShippingCents != null ? Number(totalWithoutShippingCents) : null,

          shipping:
            totals.shippingCents != null
              ? Number(totals.shippingCents) / 100
              : body?.shippingAmount != null
                ? Number(body.shippingAmount)
                : null,
          shippingCents: totals.shippingCents != null ? Number(totals.shippingCents) : null,

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

    // 7) Pixels (keep existing behavior)
    try {
      // If you have this util in your project, keep it as-is.
      // eslint-disable-next-line no-undef
      await trackOrderWithPixels({
        admin,
        shop,
        totals,
        fields: { ...(fields || {}), fullPhone, countryCode, couponCode },
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
