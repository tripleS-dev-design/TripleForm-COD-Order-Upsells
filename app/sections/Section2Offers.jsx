// ===== File: app/sections/Section2Offers.jsx =====
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  Tabs,
  Divider,
  Box,
  Badge,
  Button,
  TextField,
  Select,
  Checkbox,
  Toast,
  Spinner,
} from "@shopify/polaris";

import SettingTile from "../components/SettingTile";

/**
 * Section2Offers.jsx
 * - ✅ Design Shopify-like (cards + grille + colonne droite)
 * - ✅ Garde le même schema: { global, offers[], upsells[], thankYou }
 * - ✅ Load: GET /api/offers/load
 * - ✅ Save: POST /api/offers/save  (à créer si pas encore)
 */

const PALETTE_OPTIONS = [
  { label: "Clean Pro", value: "clean-pro" },
  { label: "Brand Gradient", value: "brand-gradient" },
  { label: "Default", value: "default" },
];

const LAYOUT_OPTIONS = [
  { label: "Image à gauche", value: "image-left" },
  { label: "Image en haut", value: "image-top" },
  { label: "Sans image", value: "no-image" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Pourcentage (%)", value: "percentage" },
  { label: "Montant fixe", value: "fixed" },
];

const THANKYOU_MODE_OPTIONS = [
  { label: "Simple", value: "simple" },
  { label: "Popup", value: "popup" },
];

const THANKYOU_SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}

function isObject(x) {
  return x && typeof x === "object" && !Array.isArray(x);
}

function clampInt(n, min, max, fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  const i = Math.round(v);
  return Math.max(min, Math.min(max, i));
}

export default function Section2Offers() {
  const [cfg, setCfg] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const initialJsonRef = useRef("");
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState({ active: false, content: "", error: false });

  const tabs = useMemo(
    () => [
      { id: "offers", content: "Offers", panelID: "offers-panel" },
      { id: "upsells", content: "Upsells", panelID: "upsells-panel" },
      { id: "thankYou", content: "Thank you", panelID: "thankyou-panel" },
    ],
    []
  );

  const tabId = tabs[selectedTab]?.id || "offers";

  const dirty = useMemo(() => {
    if (!cfg) return false;
    try {
      const now = JSON.stringify(cfg);
      return now !== initialJsonRef.current;
    } catch {
      return true;
    }
  }, [cfg]);

  // -------------------- LOAD --------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/offers/load", { credentials: "include" });
        const data = await res.json();

        if (!mounted) return;

        if (!data?.ok) {
          setToast({ active: true, content: data?.error || "Erreur de chargement", error: true });
          setCfg(null);
          return;
        }

        const payload = data?.offers || null;
        setCfg(payload);

        try {
          initialJsonRef.current = JSON.stringify(payload);
        } catch {
          initialJsonRef.current = "";
        }
      } catch (e) {
        if (!mounted) return;
        setToast({
          active: true,
          content: e?.message || "Erreur réseau /api/offers/load",
          error: true,
        });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // -------------------- SAVE --------------------
  async function saveNow() {
    if (!cfg) return;
    setIsSaving(true);
    try {
      // ⚠️ Si tu n'as pas encore /api/offers/save, crée-le plus tard.
      const res = await fetch("/api/offers/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers: cfg }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Save failed");
      }

      // update baseline (dirty => false)
      initialJsonRef.current = JSON.stringify(cfg);

      setToast({ active: true, content: "Enregistré avec succès ✅", error: false });
    } catch (e) {
      setToast({
        active: true,
        content: e?.message || "Erreur d’enregistrement",
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  // -------------------- HELPERS (update cfg safely) --------------------
  function updateGlobal(patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.global = next.global || {};
      Object.assign(next.global, patch);
      return next;
    });
  }

  function updateGlobalColors(patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.global = next.global || {};
      next.global.colors = next.global.colors || {};
      Object.assign(next.global.colors, patch);
      return next;
    });
  }

  function updateOffer(idx, patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.offers = Array.isArray(next.offers) ? next.offers : [];
      if (!next.offers[idx]) return next;
      Object.assign(next.offers[idx], patch);
      return next;
    });
  }

  function updateOfferColors(idx, patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.offers = Array.isArray(next.offers) ? next.offers : [];
      if (!next.offers[idx]) return next;
      next.offers[idx].colors = next.offers[idx].colors || {};
      Object.assign(next.offers[idx].colors, patch);
      return next;
    });
  }

  function updateUpsell(idx, patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.upsells = Array.isArray(next.upsells) ? next.upsells : [];
      if (!next.upsells[idx]) return next;
      Object.assign(next.upsells[idx], patch);
      return next;
    });
  }

  function updateUpsellColors(idx, patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.upsells = Array.isArray(next.upsells) ? next.upsells : [];
      if (!next.upsells[idx]) return next;
      next.upsells[idx].colors = next.upsells[idx].colors || {};
      Object.assign(next.upsells[idx].colors, patch);
      return next;
    });
  }

  function updateThankYou(patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.thankYou = next.thankYou || {};
      Object.assign(next.thankYou, patch);
      return next;
    });
  }

  function updateThankYouColors(patch) {
    setCfg((prev) => {
      const next = deepClone(prev);
      next.thankYou = next.thankYou || {};
      next.thankYou.colors = next.thankYou.colors || {};
      Object.assign(next.thankYou.colors, patch);
      return next;
    });
  }

  function goTo(id) {
    const idx = tabs.findIndex((t) => t.id === id);
    if (idx >= 0) setSelectedTab(idx);
  }

  // -------------------- RENDERS --------------------
  function renderGlobalColorsBlock() {
    const g = cfg?.global || {};
    const c = g?.colors || {};

    return (
      <Card padding="500">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingSm" as="h3">
              Global settings
            </Text>
            <Checkbox
              label="Enabled"
              checked={!!g.enabled}
              onChange={(v) => updateGlobal({ enabled: v })}
            />
          </InlineStack>

          <Divider />

          <BlockStack gap="300">
            <Select
              label="Palette"
              options={PALETTE_OPTIONS}
              value={c.paletteId || "clean-pro"}
              onChange={(v) => updateGlobalColors({ paletteId: v })}
            />

            <InlineStack gap="300" wrap>
              <TextField
                label="Card bg"
                value={c.cardBg || ""}
                onChange={(v) => updateGlobalColors({ cardBg: v })}
                autoComplete="off"
              />
              <TextField
                label="Border"
                value={c.borderColor || ""}
                onChange={(v) => updateGlobalColors({ borderColor: v })}
                autoComplete="off"
              />
              <TextField
                label="Icon bg"
                value={c.iconBg || ""}
                onChange={(v) => updateGlobalColors({ iconBg: v })}
                autoComplete="off"
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Button bg"
                value={c.buttonBg || ""}
                onChange={(v) => updateGlobalColors({ buttonBg: v })}
                autoComplete="off"
              />
              <TextField
                label="Button text"
                value={c.buttonTextColor || ""}
                onChange={(v) => updateGlobalColors({ buttonTextColor: v })}
                autoComplete="off"
              />
              <TextField
                label="Button border"
                value={c.buttonBorder || ""}
                onChange={(v) => updateGlobalColors({ buttonBorder: v })}
                autoComplete="off"
              />
            </InlineStack>

            <Text tone="subdued" as="p">
              Ces couleurs sont utilisées quand “useGlobalColors” est activé sur Offers/Upsells/Thank you.
            </Text>
          </BlockStack>
        </BlockStack>
      </Card>
    );
  }

  function renderOfferEditor(offer, idx) {
    const o = offer || {};
    const colors = o.colors || {};

    return (
      <Card key={`offer-${idx}`} padding="500">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingSm" as="h3">
              Offer #{idx + 1}
            </Text>

            <InlineStack gap="300" blockAlign="center">
              <Checkbox
                label="Enabled"
                checked={!!o.enabled}
                onChange={(v) => updateOffer(idx, { enabled: v })}
              />
              <Checkbox
                label="Preview"
                checked={!!o.showInPreview}
                onChange={(v) => updateOffer(idx, { showInPreview: v })}
              />
            </InlineStack>
          </InlineStack>

          <Divider />

          <BlockStack gap="300">
            <InlineStack gap="300" wrap>
              <TextField
                label="Title"
                value={o.title || ""}
                onChange={(v) => updateOffer(idx, { title: v })}
                autoComplete="off"
              />
              <TextField
                label="Button text"
                value={o.buttonText || ""}
                onChange={(v) => updateOffer(idx, { buttonText: v })}
                autoComplete="off"
              />
            </InlineStack>

            <TextField
              label="Description"
              value={o.description || ""}
              onChange={(v) => updateOffer(idx, { description: v })}
              multiline={2}
              autoComplete="off"
            />

            <InlineStack gap="300" wrap>
              <TextField
                label="Product ID"
                value={o.productId || ""}
                onChange={(v) => updateOffer(idx, { productId: v })}
                autoComplete="off"
                helpText="Garde bien productId (même terme que ton code)."
              />
              <Select
                label="Layout"
                options={LAYOUT_OPTIONS}
                value={o.layoutStyle || "image-left"}
                onChange={(v) => updateOffer(idx, { layoutStyle: v })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Image URL"
                value={o.imageUrl || ""}
                onChange={(v) => updateOffer(idx, { imageUrl: v })}
                autoComplete="off"
              />
              <TextField
                label="Icon URL"
                value={o.iconUrl || ""}
                onChange={(v) => updateOffer(idx, { iconUrl: v })}
                autoComplete="off"
              />
            </InlineStack>

            <Divider />

            <InlineStack gap="300" wrap>
              <Checkbox
                label="Use global colors"
                checked={o.useGlobalColors !== false}
                onChange={(v) => updateOffer(idx, { useGlobalColors: v })}
              />

              <Select
                label="Qty multiplier"
                options={[
                  { label: "1", value: "1" },
                  { label: "2", value: "2" },
                  { label: "3", value: "3" },
                ]}
                value={String(o.qtyMultiplier || 1)}
                onChange={(v) => updateOffer(idx, { qtyMultiplier: clampInt(v, 1, 3, 1) })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <Checkbox
                label="Discount enabled"
                checked={!!o.discountEnabled}
                onChange={(v) => updateOffer(idx, { discountEnabled: v })}
              />

              <Select
                label="Discount type"
                options={DISCOUNT_TYPE_OPTIONS}
                value={o.discountType === "fixed" ? "fixed" : "percentage"}
                onChange={(v) => updateOffer(idx, { discountType: v })}
              />

              <TextField
                label="Discount value"
                type="number"
                value={String(o.discountValue ?? 10)}
                onChange={(v) => updateOffer(idx, { discountValue: Number(v) })}
                autoComplete="off"
              />
            </InlineStack>

            {o.useGlobalColors === false ? (
              <>
                <Divider />
                <Text tone="subdued" as="p">
                  Colors (Offer #{idx + 1})
                </Text>

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Card bg"
                    value={colors.cardBg || ""}
                    onChange={(v) => updateOfferColors(idx, { cardBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Border"
                    value={colors.borderColor || ""}
                    onChange={(v) => updateOfferColors(idx, { borderColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Icon bg"
                    value={colors.iconBg || ""}
                    onChange={(v) => updateOfferColors(idx, { iconBg: v })}
                    autoComplete="off"
                  />
                </InlineStack>

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Button bg"
                    value={colors.buttonBg || ""}
                    onChange={(v) => updateOfferColors(idx, { buttonBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button text"
                    value={colors.buttonTextColor || ""}
                    onChange={(v) => updateOfferColors(idx, { buttonTextColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button border"
                    value={colors.buttonBorder || ""}
                    onChange={(v) => updateOfferColors(idx, { buttonBorder: v })}
                    autoComplete="off"
                  />
                </InlineStack>
              </>
            ) : null}
          </BlockStack>
        </BlockStack>
      </Card>
    );
  }

  function renderUpsellEditor(upsell, idx) {
    const u = upsell || {};
    const colors = u.colors || {};

    return (
      <Card key={`upsell-${idx}`} padding="500">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingSm" as="h3">
              Upsell #{idx + 1}
            </Text>

            <InlineStack gap="300" blockAlign="center">
              <Checkbox
                label="Enabled"
                checked={!!u.enabled}
                onChange={(v) => updateUpsell(idx, { enabled: v })}
              />
              <Checkbox
                label="Preview"
                checked={!!u.showInPreview}
                onChange={(v) => updateUpsell(idx, { showInPreview: v })}
              />
            </InlineStack>
          </InlineStack>

          <Divider />

          <BlockStack gap="300">
            <InlineStack gap="300" wrap>
              <TextField
                label="Title"
                value={u.title || ""}
                onChange={(v) => updateUpsell(idx, { title: v })}
                autoComplete="off"
              />
              <Select
                label="Layout"
                options={LAYOUT_OPTIONS}
                value={u.layoutStyle || "image-left"}
                onChange={(v) => updateUpsell(idx, { layoutStyle: v })}
              />
            </InlineStack>

            <TextField
              label="Description"
              value={u.description || ""}
              onChange={(v) => updateUpsell(idx, { description: v })}
              multiline={2}
              autoComplete="off"
            />

            <InlineStack gap="300" wrap>
              <TextField
                label="Product ID"
                value={u.productId || ""}
                onChange={(v) => updateUpsell(idx, { productId: v })}
                autoComplete="off"
              />
              <Checkbox
                label="Use global colors"
                checked={u.useGlobalColors !== false}
                onChange={(v) => updateUpsell(idx, { useGlobalColors: v })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Image URL"
                value={u.imageUrl || ""}
                onChange={(v) => updateUpsell(idx, { imageUrl: v })}
                autoComplete="off"
              />
              <TextField
                label="Icon URL"
                value={u.iconUrl || ""}
                onChange={(v) => updateUpsell(idx, { iconUrl: v })}
                autoComplete="off"
              />
            </InlineStack>

            {u.useGlobalColors === false ? (
              <>
                <Divider />
                <Text tone="subdued" as="p">
                  Colors (Upsell #{idx + 1})
                </Text>

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Card bg"
                    value={colors.cardBg || ""}
                    onChange={(v) => updateUpsellColors(idx, { cardBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Border"
                    value={colors.borderColor || ""}
                    onChange={(v) => updateUpsellColors(idx, { borderColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Icon bg"
                    value={colors.iconBg || ""}
                    onChange={(v) => updateUpsellColors(idx, { iconBg: v })}
                    autoComplete="off"
                  />
                </InlineStack>

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Button bg"
                    value={colors.buttonBg || ""}
                    onChange={(v) => updateUpsellColors(idx, { buttonBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button text"
                    value={colors.buttonTextColor || ""}
                    onChange={(v) => updateUpsellColors(idx, { buttonTextColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button border"
                    value={colors.buttonBorder || ""}
                    onChange={(v) => updateUpsellColors(idx, { buttonBorder: v })}
                    autoComplete="off"
                  />
                </InlineStack>
              </>
            ) : null}
          </BlockStack>
        </BlockStack>
      </Card>
    );
  }

  function renderThankYouEditor() {
    const ty = cfg?.thankYou || {};
    const c = ty.colors || {};

    return (
      <Card padding="500">
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingSm" as="h3">
              Thank you settings
            </Text>

            <Checkbox
              label="Enabled"
              checked={ty.enabled !== false}
              onChange={(v) => updateThankYou({ enabled: v })}
            />
          </InlineStack>

          <Divider />

          <BlockStack gap="300">
            <InlineStack gap="300" wrap>
              <Select
                label="Mode"
                options={THANKYOU_MODE_OPTIONS}
                value={ty.mode === "popup" ? "popup" : "simple"}
                onChange={(v) => updateThankYou({ mode: v })}
              />
              <Select
                label="Size"
                options={THANKYOU_SIZE_OPTIONS}
                value={ty.size || "md"}
                onChange={(v) => updateThankYou({ size: v })}
              />
              <Checkbox
                label="Use global colors"
                checked={ty.useGlobalColors !== false}
                onChange={(v) => updateThankYou({ useGlobalColors: v })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Title"
                value={ty.title || ""}
                onChange={(v) => updateThankYou({ title: v })}
                autoComplete="off"
              />
              <TextField
                label="Chip text"
                value={ty.chipText || ""}
                onChange={(v) => updateThankYou({ chipText: v })}
                autoComplete="off"
              />
              <Checkbox
                label="Show chip"
                checked={ty.showChip !== false}
                onChange={(v) => updateThankYou({ showChip: v })}
              />
            </InlineStack>

            <TextField
              label="Message"
              value={ty.message || ""}
              onChange={(v) => updateThankYou({ message: v })}
              multiline={3}
              autoComplete="off"
            />

            <InlineStack gap="300" wrap>
              <TextField
                label="Primary text"
                value={ty.primaryText || ""}
                onChange={(v) => updateThankYou({ primaryText: v })}
                autoComplete="off"
              />
              <TextField
                label="Primary url"
                value={ty.primaryUrl || ""}
                onChange={(v) => updateThankYou({ primaryUrl: v })}
                autoComplete="off"
              />
              <Checkbox
                label="Primary enabled"
                checked={ty.primaryEnabled !== false}
                onChange={(v) => updateThankYou({ primaryEnabled: v })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Secondary text"
                value={ty.secondaryText || ""}
                onChange={(v) => updateThankYou({ secondaryText: v })}
                autoComplete="off"
              />
              <TextField
                label="Secondary url"
                value={ty.secondaryUrl || ""}
                onChange={(v) => updateThankYou({ secondaryUrl: v })}
                autoComplete="off"
              />
              <Checkbox
                label="Secondary enabled"
                checked={!!ty.secondaryEnabled}
                onChange={(v) => updateThankYou({ secondaryEnabled: v })}
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Image URL"
                value={ty.imageUrl || ""}
                onChange={(v) => updateThankYou({ imageUrl: v })}
                autoComplete="off"
              />
              <TextField
                label="Icon URL"
                value={ty.iconUrl || ""}
                onChange={(v) => updateThankYou({ iconUrl: v })}
                autoComplete="off"
              />
            </InlineStack>

            <InlineStack gap="300" wrap>
              <TextField
                label="Radius"
                type="number"
                value={String(ty.radius ?? 16)}
                onChange={(v) => updateThankYou({ radius: Number(v) })}
                autoComplete="off"
              />
              <TextField
                label="Image height"
                type="number"
                value={String(ty.imageHeight ?? 160)}
                onChange={(v) => updateThankYou({ imageHeight: Number(v) })}
                autoComplete="off"
              />
              <TextField
                label="Auto open delay (ms)"
                type="number"
                value={String(ty.autoOpenDelayMs ?? 250)}
                onChange={(v) => updateThankYou({ autoOpenDelayMs: Number(v) })}
                autoComplete="off"
              />
            </InlineStack>

            {ty.useGlobalColors === false ? (
              <>
                <Divider />
                <Select
                  label="Palette"
                  options={PALETTE_OPTIONS}
                  value={c.paletteId || "brand-gradient"}
                  onChange={(v) => updateThankYouColors({ paletteId: v })}
                />

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Card bg"
                    value={c.cardBg || ""}
                    onChange={(v) => updateThankYouColors({ cardBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Border"
                    value={c.borderColor || ""}
                    onChange={(v) => updateThankYouColors({ borderColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Icon bg"
                    value={c.iconBg || ""}
                    onChange={(v) => updateThankYouColors({ iconBg: v })}
                    autoComplete="off"
                  />
                </InlineStack>

                <InlineStack gap="300" wrap>
                  <TextField
                    label="Button bg"
                    value={c.buttonBg || ""}
                    onChange={(v) => updateThankYouColors({ buttonBg: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button text"
                    value={c.buttonTextColor || ""}
                    onChange={(v) => updateThankYouColors({ buttonTextColor: v })}
                    autoComplete="off"
                  />
                  <TextField
                    label="Button border"
                    value={c.buttonBorder || ""}
                    onChange={(v) => updateThankYouColors({ buttonBorder: v })}
                    autoComplete="off"
                  />
                </InlineStack>
              </>
            ) : null}
          </BlockStack>
        </BlockStack>
      </Card>
    );
  }

  function renderRightPreview() {
    const offersCount = Array.isArray(cfg?.offers) ? cfg.offers.length : 0;
    const upsellsCount = Array.isArray(cfg?.upsells) ? cfg.upsells.length : 0;

    return (
      <BlockStack gap="400">
        <Card padding="500">
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              Aide rapide
            </Text>
            <Text tone="subdued" as="p">
              Même style Shopify: colonne droite pour guidance + preview.
            </Text>
            <Text tone="subdued" as="p">
              • Offers: {offersCount} • Upsells: {upsellsCount}
            </Text>
            <Text tone="subdued" as="p">
              • Tab actuel: {tabId}
            </Text>
          </BlockStack>
        </Card>

        <Card padding="500">
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              Preview (simple)
            </Text>

            <Box
              padding="300"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text as="p" tone="subdued">
                Ici tu peux coller ton “preview component” plus tard.
              </Text>
              <Text as="p">
                {tabId === "offers" ? "Preview Offers" : null}
                {tabId === "upsells" ? "Preview Upsells" : null}
                {tabId === "thankYou" ? "Preview Thank you" : null}
              </Text>
            </Box>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  }

  // -------------------- UI --------------------
  if (!cfg) {
    return (
      <Card padding="500">
        <InlineStack gap="300" blockAlign="center">
          <Spinner />
          <Text as="p">Chargement de Offers settings...</Text>
        </InlineStack>
      </Card>
    );
  }

  const offers = Array.isArray(cfg.offers) ? cfg.offers : [];
  const upsells = Array.isArray(cfg.upsells) ? cfg.upsells : [];

  return (
    <>
      {toast.active ? (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={() => setToast((t) => ({ ...t, active: false }))}
        />
      ) : null}

      <Layout>
        {/* LEFT */}
        <Layout.Section>
          {/* Shopify-like dashboard tiles */}
          <Card padding="500">
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Offers & Upsell — Settings
                  </Text>
                  <Text tone="subdued" as="p">
                    Design inspiré de Shopify (cards + grille). Les keys restent identiques.
                  </Text>
                </BlockStack>

                <InlineStack gap="200" blockAlign="center">
                  {dirty ? <Badge tone="warning">Modifications non enregistrées</Badge> : <Badge tone="success">À jour</Badge>}
                  <Button
                    variant="primary"
                    onClick={saveNow}
                    disabled={!dirty || isSaving}
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </InlineStack>
              </InlineStack>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 16,
                }}
              >
                <SettingTile
                  title="Offers"
                  description="Offres / discounts / cadeaux"
                  status={{
                    label: offers.length ? "Configurés" : "À configurer",
                    tone: offers.length ? "success" : "warning",
                  }}
                  primaryAction={{ content: "Configurer", onAction: () => goTo("offers") }}
                />

                <SettingTile
                  title="Upsells"
                  description="Propositions complémentaires"
                  status={{
                    label: upsells.length ? "Configurés" : "À configurer",
                    tone: upsells.length ? "success" : "warning",
                  }}
                  primaryAction={{ content: "Configurer", onAction: () => goTo("upsells") }}
                />

                <SettingTile
                  title="Thank you page"
                  description="Message + bouton + redirection"
                  status={{
                    label: cfg?.thankYou?.enabled !== false ? "Activé" : "Désactivé",
                    tone: cfg?.thankYou?.enabled !== false ? "success" : "critical",
                  }}
                  primaryAction={{ content: "Configurer", onAction: () => goTo("thankYou") }}
                />

                <SettingTile
                  title="Global colors"
                  description="Palette globale (global.colors)"
                  status={{
                    label: cfg?.global?.enabled !== false ? "Actif" : "Off",
                    tone: cfg?.global?.enabled !== false ? "success" : "critical",
                  }}
                  primaryAction={{ content: "Voir", onAction: () => goTo("offers") }}
                />
              </div>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card padding="500">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Paramètres
                  </Text>
                  <Badge tone="info">global • offers • upsells • thankYou</Badge>
                </InlineStack>

                <Tabs
                  tabs={tabs}
                  selected={selectedTab}
                  onSelect={setSelectedTab}
                  fitted
                >
                  <Box paddingBlockStart="400">
                    <BlockStack gap="500">
                      {/* Global settings visible in all tabs (Shopify-like) */}
                      {renderGlobalColorsBlock()}

                      {tabId === "offers" ? (
                        <BlockStack gap="500">
                          {offers.slice(0, 3).map((o, idx) => renderOfferEditor(o, idx))}
                        </BlockStack>
                      ) : null}

                      {tabId === "upsells" ? (
                        <BlockStack gap="500">
                          {upsells.slice(0, 3).map((u, idx) => renderUpsellEditor(u, idx))}
                        </BlockStack>
                      ) : null}

                      {tabId === "thankYou" ? renderThankYouEditor() : null}
                    </BlockStack>
                  </Box>
                </Tabs>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>

        {/* RIGHT */}
        <Layout.Section secondary>{renderRightPreview()}</Layout.Section>
      </Layout>
    </>
  );
}
