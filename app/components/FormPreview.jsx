// app/components/FormPreview.jsx
import React, { useMemo } from "react";
import { Card, BlockStack, InlineStack, Text, Box } from "@shopify/polaris";

// Petite fonction pour nettoyer les textes (mêmes remplacements que dans Forms)
const REPLACERS = [
  [/â€™|’/g, "'"],
  [/â€œ|â€\u009D|â€|“|”/g, '"'],
  [/â€“|â€”|–|—/g, "-"],
  [/\u00A0/g, " "],
  [/Â/g, ""],
  [/ØŸ/g, ""],
];
const sStr = (s) =>
  typeof s === "string"
    ? REPLACERS.reduce((x, [r, v]) => x.replace(r, v), s)
    : s || "";

// Même logique de shadow que dans Section1FormsLayout
function computeShadow(effect, glowPx, glowColor, hasShadow) {
  if (effect === "glow") return `0 0 ${glowPx}px ${glowColor}`;
  if (effect === "light") return "0 12px 28px rgba(0,0,0,.12)";
  if (hasShadow) return "0 10px 24px rgba(15,23,42,.16)";
  return "none";
}

/**
 * Preview réutilisable du formulaire COD + résumé commande
 *
 * props:
 *  - config : objet settings complet (même shape que dans Section1FormsLayout)
 *  - mode   : "forms" | "offers"
 *  - offers : objet offers (optionnel) pour le prix du produit en preview
 */
export default function FormPreview({ config, mode = "forms", offers }) {
  if (!config) return null;

  const eff = config.behavior?.effect || "none";
  const glowPx = config.design?.glowPx ?? config.behavior?.glowPx ?? 18;
  const glowCol = config.design?.btnBg || "#2563EB";

  const cardCSS = useMemo(
    () => ({
      background: config.design.bg,
      color: config.design.text,
      border: `1px solid ${config.design.border}`,
      borderRadius: config.design.radius,
      padding: config.design.padding,
      width: "100%",
      boxSizing: "border-box",
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
    }),
    [config.design, eff, glowPx, glowCol],
  );

  const inputBase = useMemo(
    () => ({
      width: "100%",
      padding: "10px 12px",
      borderRadius: config.design.btnRadius,
      border: `1px solid ${config.design.inputBorder}`,
      background: config.design.inputBg,
      color: config.design.text,
      outline: "none",
      fontSize: 13,
      boxSizing: "border-box",
    }),
    [config.design],
  );

  const btnCSS = useMemo(
    () => ({
      width: "100%",
      height: config.design.btnHeight,
      borderRadius: config.design.btnRadius,
      border: `1px solid ${config.design.btnBorder}`,
      color: config.design.btnText,
      background: config.design.btnBg,
      fontWeight: 700,
      letterSpacing: 0.2,
      fontSize: 14,
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
    }),
    [config.design, eff, glowPx, glowCol],
  );

  const cartBoxCSS = useMemo(
    () => ({
      background: config.design.cartBg,
      border: `1px solid ${config.design.cartBorder}`,
      borderRadius: 12,
      padding: 14,
      boxShadow: computeShadow(eff, glowPx, glowCol, !!config.design.shadow),
    }),
    [config.design, eff, glowPx, glowCol],
  );

  const cartRowCSS = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 8,
      alignItems: "center",
      padding: "8px 10px",
      border: `1px solid ${config.design.cartRowBorder}`,
      borderRadius: 10,
      background: config.design.cartRowBg,
      color: config.design.cartTextColor,
      boxShadow: computeShadow(
        eff,
        Math.max(8, Math.round(glowPx * 0.6)),
        glowCol,
        !!config.design.shadow,
      ),
    }),
    [config.design, eff, glowPx, glowCol],
  );

  // ----- Données produit pour le résumé -----
  const previewProduct = offers?.previewProduct || {};
  const productPrice = Number(
    isNaN(previewProduct.price) ? 19.99 : previewProduct.price,
  );
  const shippingPrice = Number(
    isNaN(previewProduct.shippingPrice) ? 0 : previewProduct.shippingPrice,
  );
  const total = productPrice + shippingPrice;
  const currency = offers?.currency || "dh";

  const formatMoney = (v) => `${v.toFixed(2)} ${currency}`;

  // ----- Order summary -----
  const renderCartBox = () => (
    <div style={cartBoxCSS}>
      <div
        style={{
          textAlign: "left",
          fontWeight: 700,
          marginBottom: 10,
          color: config.design.cartTitleColor,
          fontSize: 14,
        }}
      >
        {sStr(config.cartTitles.top)}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.price)}</div>
          <div style={{ fontWeight: 700 }}>
            {formatMoney(productPrice)}
          </div>
        </div>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.shipping)}</div>
          <div style={{ fontWeight: 700 }}>
            {shippingPrice === 0 ? "Gratuit" : formatMoney(shippingPrice)}
          </div>
        </div>
        <div style={cartRowCSS}>
          <div>{sStr(config.cartTitles.total)}</div>
          <div style={{ fontWeight: 700 }}>
            {formatMoney(total)}
          </div>
        </div>
      </div>
    </div>
  );

  // ----- Formulaire -----
  const fieldKeys = Object.keys(config.fields || {});
  const orderFromMeta = config.meta?.fieldsOrder || [];
  const orderedFields = [
    ...orderFromMeta.filter((k) => fieldKeys.includes(k)),
    ...fieldKeys.filter((k) => !orderFromMeta.includes(k)),
  ];

  const renderField = (key) => {
    const f = config.fields[key];
    if (!f?.on) return null;

    const labelEl = (
      <span style={{ fontSize: 13, color: "#475569" }}>
        {sStr(f.label)}
        {f.required ? " *" : ""}
      </span>
    );

    const ph = sStr(f.ph);

    if (f.type === "textarea") {
      return (
        <label key={key} style={{ display: "grid", gap: 6 }}>
          {labelEl}
          <textarea
            style={{ ...inputBase, minHeight: 80, resize: "vertical" }}
            placeholder={ph}
            disabled
          />
        </label>
      );
    }

    if (f.type === "tel") {
      return (
        <label key={key} style={{ display: "grid", gap: 6 }}>
          {labelEl}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: f.prefix
                ? "minmax(80px,120px) 1fr"
                : "1fr",
              gap: 8,
            }}
          >
            {f.prefix && (
              <input
                style={{ ...inputBase, textAlign: "center" }}
                value={f.prefix}
                readOnly
              />
            )}
            <input
              type="tel"
              style={inputBase}
              placeholder={ph || "Phone number"}
              disabled
            />
          </div>
        </label>
      );
    }

    // text par défaut
    return (
      <label key={key} style={{ display: "grid", gap: 6 }}>
        {labelEl}
        <input
          type="text"
          style={inputBase}
          placeholder={ph}
          disabled
        />
      </label>
    );
  };

  const renderFormCard = () => (
    <div style={cardCSS}>
      {(config.form.title || config.form.subtitle) && (
        <div style={{ marginBottom: 10 }}>
          {config.form.title && (
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              {sStr(config.form.title)}
            </div>
          )}
          {config.form.subtitle && (
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              {sStr(config.form.subtitle)}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {orderedFields.map((k) => renderField(k))}

        {config.behavior?.requireGDPR && (
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
              color: "#374151",
            }}
          >
            <input type="checkbox" disabled />{" "}
            {sStr(config.behavior.gdprLabel)}
          </label>
        )}

        {config.behavior?.whatsappOptIn && (
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
              color: "#374151",
            }}
          >
            <input type="checkbox" disabled />{" "}
            {sStr(config.behavior.whatsappLabel)}
          </label>
        )}

        <button type="button" style={btnCSS} disabled>
          {sStr(config.uiTitles.orderNow || "Order now")} ·{" "}
          {sStr(config.uiTitles.totalSuffix || "Total:")}{" "}
          {formatMoney(total)}
        </button>
      </div>
    </div>
  );

  return (
    <Card>
      <BlockStack gap="400">
        {/* Bande "OFFERS" en haut uniquement en mode offers */}
        {mode === "offers" && (
          <Box padding="200" background="bg-surface" borderRadius="200">
            <InlineStack align="space-between" gap="200">
              <Box
                paddingInline="300"
                paddingBlock="150"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  OFFERS NON ÉLIGIBLE
                </Text>
              </Box>
              <Box
                paddingInline="300"
                paddingBlock="150"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  CADEAU EN ATTENTE
                </Text>
              </Box>
            </InlineStack>
          </Box>
        )}

        <Box
          borderColor="border-subdued"
          borderWidth="025"
          borderRadius="300"
          padding="300"
          background="bg-surface-subdued"
        >
          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {renderCartBox()}
            {renderFormCard()}
          </div>
        </Box>
      </BlockStack>
    </Card>
  );
}
