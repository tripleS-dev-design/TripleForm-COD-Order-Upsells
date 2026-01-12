import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

const DISCOUNT_QUERY = `#graphql
query DiscountByCode($code: String!) {
  codeDiscountNodeByCode(code: $code) {
    codeDiscount {
      __typename
      ... on DiscountCodeBasic {
        status
        startsAt
        endsAt
        customerGets {
          items {
            __typename
            ... on AllDiscountItems { allItems }
            ... on DiscountCollections { collections(first: 100) { nodes { id } } }
            ... on DiscountProducts { products(first: 100) { nodes { id } } }
          }
          value {
            __typename
            ... on DiscountPercentage { percentage }
            ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem }
          }
        }
      }
    }
  }
}
`;

const PRODUCT_COLLECTIONS_QUERY = `#graphql
query ProductCollections($id: ID!) {
  product(id: $id) {
    collections(first: 100) { nodes { id } }
  }
}
`;

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.public.appProxy(request);
  if (!admin || !session?.shop) {
    return json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").trim();
  const productId = url.searchParams.get("productId");
  const subtotalCents = Number(url.searchParams.get("subtotalCents") || "0");
  const qty = Number(url.searchParams.get("qty") || "1");

  if (!code) return json({ ok: false, message: "Code vide" }, { status: 400 });
  if (!productId || subtotalCents <= 0) return json({ ok: false, message: "Bad params" }, { status: 400 });

  const resp = await admin.graphql(DISCOUNT_QUERY, { variables: { code } });
  const payload = await resp.json();

  const d = payload?.data?.codeDiscountNodeByCode?.codeDiscount;
  if (!d) return json({ ok: false, message: "Code invalide" });

  if (d.__typename !== "DiscountCodeBasic") {
    return json({ ok: false, message: "Type de réduction non supporté" });
  }

  // status / dates (simple)
  const now = Date.now();
  const starts = d.startsAt ? Date.parse(d.startsAt) : null;
  const ends = d.endsAt ? Date.parse(d.endsAt) : null;
  if (d.status !== "ACTIVE") return json({ ok: false, message: "Code inactif" });
  if (starts && now < starts) return json({ ok: false, message: "Code pas encore actif" });
  if (ends && now > ends) return json({ ok: false, message: "Code expiré" });

  // eligibility (All / Products / Collections)
  const productGid = `gid://shopify/Product/${productId}`;
  const items = d.customerGets?.items;

  let eligible = false;

  if (items?.__typename === "AllDiscountItems") eligible = true;

  if (!eligible && items?.__typename === "DiscountProducts") {
    const ids = (items.products?.nodes || []).map(n => n.id);
    eligible = ids.includes(productGid);
  }

  if (!eligible && items?.__typename === "DiscountCollections") {
    const colIds = (items.collections?.nodes || []).map(n => n.id);

    const pResp = await admin.graphql(PRODUCT_COLLECTIONS_QUERY, { variables: { id: productGid } });
    const pPayload = await pResp.json();
    const pCols = (pPayload?.data?.product?.collections?.nodes || []).map(n => n.id);

    eligible = pCols.some(id => colIds.includes(id));
  }

  if (!eligible) {
    return json({ ok: false, message: "Code non applicable à ce produit" });
  }

  // compute discount
  const v = d.customerGets?.value;
  let discountCents = 0;

  if (v?.__typename === "DiscountPercentage") {
    // ex: 10% => 0.1 :contentReference[oaicite:8]{index=8}
    discountCents = Math.round(subtotalCents * Number(v.percentage || 0));
  } else if (v?.__typename === "DiscountAmount") {
    const amount = Number(v.amount?.amount || 0);
    const amountCents = Math.round(amount * 100);
    discountCents = v.appliesOnEachItem ? amountCents * qty : amountCents;
    discountCents = Math.min(discountCents, subtotalCents);
  } else {
    return json({ ok: false, message: "Valeur non supportée" });
  }

  return json({
    ok: true,
    code,
    discountCents,
    message: `Code appliqué`,
  });
};
