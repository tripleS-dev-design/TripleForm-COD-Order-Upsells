// ===== File: app/sections/Section2OffersLayout.jsx =====
import {
  Card,
  BlockStack,
  InlineStack,
  Select,
  Button,
  TextField,
  Checkbox,
  RangeSlider,
  Modal,
  Box,
  InlineGrid,
  Badge,
  Layout,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import { I18nProvider, useI18n } from "../i18n/react";

/* ============================== Contexte Forms ============================== */
// On importe la même configuration que Section1Forms
import { FormsCtx as OriginalFormsCtx } from "./Section1FormsLayout";

// Hook personnalisé pour utiliser les settings de la section Forms
const useFormSettings = () => {
  // D'abord essayer d'utiliser le contexte Forms
  const formsContext = useContext(OriginalFormsCtx);
  
  // Si on est dans le même contexte, utiliser les settings directement
  if (formsContext) {
    return formsContext.config;
  }
  
  // Sinon, charger depuis localStorage ou API
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let cancelled = false;
    
    async function loadConfig() {
      try {
        // Essayer l'API d'abord
        const res = await fetch("/api/load-settings");
        if (res.ok) {
          const j = await res.json();
          if (j?.ok && j.settings) {
            if (!cancelled) {
              setSettings(j.settings);
              setLoading(false);
            }
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load settings from API", e);
      }
      
      // Fallback sur localStorage
      try {
        const s = localStorage.getItem("tripleform_cod_config");
        if (s) {
          const parsed = JSON.parse(s);
          if (!cancelled) {
            setSettings(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to load settings from localStorage", e);
      }
      
      if (!cancelled) setLoading(false);
    }
    
    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);
  
  return { settings, loading };
};

/* ============================== Contexte Offres ============================== */
const OffersCtx = createContext(null);
const useOffers = () => useContext(OffersCtx);

/* ============================== Fonctions utilitaires partagées ============================== */
// Import des fonctions utilitaires de Section1FormsLayout
const REPLACERS = [
  [/â€™|'/g, "'"],
  [/â€œ|â€\u009D|â€|"|"/g, '"'],
  [/â€"|â€"|–|—/g, "-"],
  [/\u00A0/g, " "],
  [/Â/g, ""],
  [/ØŸ/g, ""],
];
const sStr = (s) =>
  typeof s === "string"
    ? REPLACERS.reduce((x, [r, v]) => x.replace(r, v), s)
    : s;

function sanitizeDeep(o) {
  if (o == null) return o;
  if (typeof o === "string") return sStr(o);
  if (Array.isArray(o)) return o.map(sanitizeDeep);
  if (typeof o === "object") {
    const n = {};
    for (const k in o) n[k] = sanitizeDeep(o[k]);
    return n;
  }
  return o;
}

function hexToRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Fonction pour obtenir la devise en fonction du pays
const getCurrencyByCountry = (countryCode) => {
  const map = {
    'MA': 'MAD',
    'DZ': 'DZD',
    'TN': 'TND',
    'EG': 'EGP',
    'FR': 'EUR',
    'ES': 'EUR',
    'SA': 'SAR',
    'AE': 'AED',
    'US': 'USD',
    'NG': 'NGN',
    'PK': 'PKR',
    'IN': 'INR',
    'ID': 'IDR',
    'TR': 'TRY',
    'BR': 'BRL',
  };
  return map[countryCode] || 'MAD';
};

/* ============================== Composant principal Offres ============================== */
function Section2OffersLayoutInner() {
  const { t } = useI18n();
  const rootData = useRouteLoaderData("root");
  const locale = rootData?.locale || rootData?.language || rootData?.shopLocale || "en";
  const isRTL = /^ar\b/i.test(locale);
  
  // Charger les settings de la section Forms
  const formSettings = useFormSettings();
  const [loadingFormSettings, setLoadingFormSettings] = useState(!formSettings || formSettings.loading);
  
  useEffect(() => {
    if (formSettings && !formSettings.loading) {
      setLoadingFormSettings(false);
    }
  }, [formSettings]);

  // Configuration initiale des offres
  const [config, setConfig] = useState(() => ({
    meta: {
      version: 1,
      syncWithForms: true, // Synchroniser avec les settings de Forms
    },
    offers: [
      {
        id: "offer1",
        active: true,
        title: "Basic Package",
        subtitle: "Perfect for beginners",
        price: 99,
        comparePrice: 149,
        currency: formSettings?.settings?.behavior?.country ? 
          getCurrencyByCountry(formSettings.settings.behavior.country) : "MAD",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        buttonText: "Get Started",
        popular: false,
        colorScheme: "inherit", // Hériter des couleurs de Forms
      },
      {
        id: "offer2",
        active: true,
        title: "Pro Package",
        subtitle: "Most popular choice",
        price: 199,
        comparePrice: 299,
        currency: formSettings?.settings?.behavior?.country ? 
          getCurrencyByCountry(formSettings.settings.behavior.country) : "MAD",
        features: ["All Basic features", "Advanced feature 1", "Advanced feature 2", "Priority support"],
        buttonText: "Go Pro",
        popular: true,
        colorScheme: "inherit", // Hériter des couleurs de Forms
      },
      {
        id: "offer3",
        active: true,
        title: "Enterprise",
        subtitle: "For large businesses",
        price: 499,
        comparePrice: 699,
        currency: formSettings?.settings?.behavior?.country ? 
          getCurrencyByCountry(formSettings.settings.behavior.country) : "MAD",
        features: ["All Pro features", "Custom integration", "Dedicated manager", "24/7 phone support", "Custom SLA"],
        buttonText: "Contact Sales",
        popular: false,
        colorScheme: "inherit", // Hériter des couleurs de Forms
      },
    ],
    design: {
      // Par défaut, on utilise les mêmes que Forms
      layout: "grid-3", // grid-2, grid-3, grid-4
      spacing: 16,
      cardRadius: 12,
      cardPadding: 24,
      showComparePrice: true,
      showFeatures: true,
      showPopularBadge: true,
      buttonStyle: "filled", // filled, outlined, ghost
      direction: isRTL ? "rtl" : "ltr",
    },
  }));

  // Mettre à jour la devise quand les settings de Forms changent
  useEffect(() => {
    if (formSettings?.settings?.behavior?.country && !loadingFormSettings) {
      const newCurrency = getCurrencyByCountry(formSettings.settings.behavior.country);
      setConfig(prev => ({
        ...prev,
        offers: prev.offers.map(offer => ({
          ...offer,
          currency: newCurrency,
        })),
      }));
    }
  }, [formSettings?.settings?.behavior?.country, loadingFormSettings]);

  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Charger la configuration sauvegardée
  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const res = await fetch("/api/load-offers-settings");
        if (res.ok) {
          const j = await res.json();
          if (j?.ok && j.settings) {
            const clean = sanitizeDeep(j.settings);
            if (!cancelled) {
              setConfig(prev => ({
                ...prev,
                ...clean,
                offers: clean.offers || prev.offers,
                design: {
                  ...prev.design,
                  ...(clean.design || {}),
                },
              }));
              try {
                localStorage.setItem("tripleform_offers_config", JSON.stringify(clean));
              } catch {}
            }
            setLoadingInitial(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to load offers settings", e);
      }

      // Fallback sur localStorage
      try {
        const s = localStorage.getItem("tripleform_offers_config");
        if (s && !cancelled) {
          const parsed = sanitizeDeep(JSON.parse(s));
          setConfig(prev => ({
            ...prev,
            ...parsed,
            offers: parsed.offers || prev.offers,
            design: {
              ...prev.design,
              ...(parsed.design || {}),
            },
          }));
        }
      } catch (e) {
        console.error("Failed to load offers settings from localStorage", e);
      }

      if (!cancelled) setLoadingInitial(false);
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = () => {
    try {
      localStorage.setItem("tripleform_offers_config", JSON.stringify(config));
    } catch {}
  };

  const setDesign = (p) =>
    setConfig((c) => ({
      ...c,
      design: { ...c.design, ...p },
    }));

  const setOffer = (id, p) =>
    setConfig((c) => ({
      ...c,
      offers: c.offers.map((offer) =>
        offer.id === id ? { ...offer, ...p } : offer
      ),
    }));

  const addOffer = () => {
    const newId = `offer${config.offers.length + 1}`;
    setConfig((c) => ({
      ...c,
      offers: [
        ...c.offers,
        {
          id: newId,
          active: true,
          title: `New Offer ${config.offers.length + 1}`,
          subtitle: "Description here",
          price: 0,
          comparePrice: 0,
          currency: formSettings?.settings?.behavior?.country ? 
            getCurrencyByCountry(formSettings.settings.behavior.country) : "MAD",
          features: ["Feature 1", "Feature 2"],
          buttonText: "Buy Now",
          popular: false,
          colorScheme: "inherit",
        },
      ],
    }));
  };

  const removeOffer = (id) => {
    if (config.offers.length <= 1) return;
    setConfig((c) => ({
      ...c,
      offers: c.offers.filter((offer) => offer.id !== id),
    }));
  };

  const moveOffer = (id, direction) => {
    const index = config.offers.findIndex((o) => o.id === id);
    if (index < 0) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.offers.length) return;
    
    const newOffers = [...config.offers];
    [newOffers[index], newOffers[newIndex]] = [newOffers[newIndex], newOffers[index]];
    
    setConfig((c) => ({
      ...c,
      offers: newOffers,
    }));
  };

  // Calculer les styles basés sur les settings de Forms
  const computeCardCSS = (offer, isPopular = false) => {
    if (!formSettings?.settings?.design) {
      return {
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #E5E7EB",
        borderRadius: config.design.cardRadius,
        padding: config.design.cardPadding,
        boxShadow: "0 10px 24px rgba(15,23,42,.16)",
      };
    }

    const formsDesign = formSettings.settings.design;
    
    // Si l'offre a un schéma de couleurs hérité, utiliser les couleurs de Forms
    if (offer.colorScheme === "inherit") {
      return {
        background: formsDesign.bg || "#FFFFFF",
        color: formsDesign.text || "#0F172A",
        border: `1px solid ${formsDesign.border || "#E5E7EB"}`,
        borderRadius: config.design.cardRadius || formsDesign.radius || 12,
        padding: config.design.cardPadding || formsDesign.padding || 24,
        boxShadow: formsDesign.shadow ? "0 10px 24px rgba(15,23,42,.16)" : "none",
      };
    }
    
    // Sinon, utiliser le style par défaut
    return {
      background: "#FFFFFF",
      color: "#0F172A",
      border: "1px solid #E5E7EB",
      borderRadius: config.design.cardRadius,
      padding: config.design.cardPadding,
      boxShadow: "0 10px 24px rgba(15,23,42,.16)",
    };
  };

  const computeButtonCSS = (offer) => {
    if (!formSettings?.settings?.design) {
      return {
        width: "100%",
        height: 44,
        borderRadius: 8,
        border: "1px solid #111827",
        color: "#FFFFFF",
        background: "#111827",
        fontWeight: 700,
        fontSize: 14,
      };
    }

    const formsDesign = formSettings.settings.design;
    
    // Si l'offre a un schéma de couleurs hérité, utiliser les couleurs de Forms
    if (offer.colorScheme === "inherit") {
      const style = config.design.buttonStyle || "filled";
      
      if (style === "outlined") {
        return {
          width: "100%",
          height: formsDesign.btnHeight || 44,
          borderRadius: formsDesign.btnRadius || 8,
          border: `2px solid ${formsDesign.btnBg || "#111827"}`,
          color: formsDesign.btnBg || "#111827",
          background: "transparent",
          fontWeight: 700,
          fontSize: formsDesign.fontSize || 14,
        };
      } else if (style === "ghost") {
        return {
          width: "100%",
          height: formsDesign.btnHeight || 44,
          borderRadius: formsDesign.btnRadius || 8,
          border: "1px solid transparent",
          color: formsDesign.btnBg || "#111827",
          background: "transparent",
          fontWeight: 700,
          fontSize: formsDesign.fontSize || 14,
        };
      }
      
      // filled (par défaut)
      return {
        width: "100%",
        height: formsDesign.btnHeight || 44,
        borderRadius: formsDesign.btnRadius || 8,
        border: `1px solid ${formsDesign.btnBorder || formsDesign.btnBg || "#111827"}`,
        color: formsDesign.btnText || "#FFFFFF",
        background: formsDesign.btnBg || "#111827",
        fontWeight: 700,
        fontSize: formsDesign.fontSize || 14,
      };
    }
    
    // Style par défaut
    return {
      width: "100%",
      height: 44,
      borderRadius: 8,
      border: "1px solid #111827",
      color: "#FFFFFF",
      background: "#111827",
      fontWeight: 700,
      fontSize: 14,
    };
  };

  const saveToShop = async () => {
    setSaving(true);
    try {
      persistLocal();
      const res = await fetch("/api/save-offers-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: config }),
      });
      let j = {};
      try {
        j = await res.json();
      } catch {}
      if (!res.ok || !j.ok) {
        const msg = j?.errors?.[0]?.message || j?.error || t("offers.save.errorGeneric");
        throw new Error(msg);
      }
      alert(t("offers.save.success"));
    } catch (e) {
      console.error(e);
      alert(t("offers.save.failed") + (e?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial || loadingFormSettings) {
    return (
      <div style={{ padding: 32 }}>
        <Card>
          <BlockStack gap="300">
            <div style={{ height: 16, background: "#E5E7EB", borderRadius: 999 }} />
            <div style={{ height: 16, background: "#E5E7EB", borderRadius: 999, width: "60%" }} />
            <div style={{ height: 220, background: "#E5E7EB", borderRadius: 16 }} />
          </BlockStack>
        </Card>
      </div>
    );
  }

  return (
    <OffersCtx.Provider
      value={{
        config,
        setConfig,
        setDesign,
        setOffer,
        addOffer,
        removeOffer,
        moveOffer,
        computeCardCSS,
        computeButtonCSS,
        formSettings: formSettings?.settings,
        t,
      }}
    >
      <OffersShell
        onSave={saveToShop}
        saving={saving}
        onOpenPreview={() => setShowPreview(true)}
        t={t}
      />
      
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={t("offers.preview.title")}
        primaryAction={{
          content: t("offers.preview.close"),
          onAction: () => setShowPreview(false),
        }}
        large
      >
        <Modal.Section>
          <OffersPreview />
        </Modal.Section>
      </Modal>
    </OffersCtx.Provider>
  );
}

/* ============================== Shell Offres ============================== */
function OffersShell({ onSave, saving, onOpenPreview, t }) {
  return (
    <>
      <div className="tf-header">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(11,59,130,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
              }}
            >
              <img
                src="/tripleform-cod-icon.png"
                alt="TripleForm COD"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#F9FAFB" }}>
                {t("offers.header.title")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.8)" }}>
                {t("offers.header.subtitle")}
              </div>
            </div>
          </InlineStack>
          <InlineStack gap="200">
            <Button onClick={onOpenPreview}>
              {t("offers.header.preview")}
            </Button>
            <Button variant="primary" onClick={onSave} loading={saving}>
              {t("offers.header.save")}
            </Button>
          </InlineStack>
        </InlineStack>
      </div>
      <div className="tf-shell">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
          <div>
            <OffersEditor />
          </div>
          <div className="tf-preview-col">
            <div className="tf-preview-card">
              <OffersPreview />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== Éditeur Offres ============================== */
function OffersEditor() {
  const { config, setDesign, setOffer, addOffer, removeOffer, moveOffer, t } = useOffers();
  const [selectedOffer, setSelectedOffer] = useState(config.offers[0]?.id);

  const currentOffer = config.offers.find((o) => o.id === selectedOffer);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Configuration générale */}
      <Card>
        <div className="tf-group-title">{t("offers.design.title")}</div>
        <BlockStack gap="200">
          <Select
            label={t("offers.design.layout")}
            options={[
              { label: t("offers.design.layoutOptions.grid2"), value: "grid-2" },
              { label: t("offers.design.layoutOptions.grid3"), value: "grid-3" },
              { label: t("offers.design.layoutOptions.grid4"), value: "grid-4" },
            ]}
            value={config.design.layout}
            onChange={(v) => setDesign({ layout: v })}
          />
          
          <Select
            label={t("offers.design.buttonStyle")}
            options={[
              { label: t("offers.design.buttonStyleOptions.filled"), value: "filled" },
              { label: t("offers.design.buttonStyleOptions.outlined"), value: "outlined" },
              { label: t("offers.design.buttonStyleOptions.ghost"), value: "ghost" },
            ]}
            value={config.design.buttonStyle}
            onChange={(v) => setDesign({ buttonStyle: v })}
          />
          
          <InlineStack gap="200" blockAlign="center">
            <Checkbox
              label={t("offers.design.showComparePrice")}
              checked={config.design.showComparePrice}
              onChange={(v) => setDesign({ showComparePrice: v })}
            />
            <Checkbox
              label={t("offers.design.showFeatures")}
              checked={config.design.showFeatures}
              onChange={(v) => setDesign({ showFeatures: v })}
            />
            <Checkbox
              label={t("offers.design.showPopularBadge")}
              checked={config.design.showPopularBadge}
              onChange={(v) => setDesign({ showPopularBadge: v })}
            />
          </InlineStack>
          
          <RangeSlider
            label={t("offers.design.spacing")}
            value={config.design.spacing}
            min={8}
            max={32}
            step={4}
            onChange={(v) => setDesign({ spacing: v })}
          />
          
          <RangeSlider
            label={t("offers.design.cardRadius")}
            value={config.design.cardRadius}
            min={0}
            max={24}
            step={2}
            onChange={(v) => setDesign({ cardRadius: v })}
          />
          
          <RangeSlider
            label={t("offers.design.cardPadding")}
            value={config.design.cardPadding}
            min={16}
            max={48}
            step={4}
            onChange={(v) => setDesign({ cardPadding: v })}
          />
        </BlockStack>
      </Card>

      {/* Liste des offres */}
      <Card>
        <div className="tf-group-title">{t("offers.list.title")}</div>
        <BlockStack gap="100">
          {config.offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                border: selectedOffer === offer.id ? "2px solid #00A7A3" : "1px solid #E5E7EB",
                borderRadius: 8,
                background: selectedOffer === offer.id ? "rgba(0,167,163,0.07)" : "#FFFFFF",
                cursor: "pointer",
              }}
              onClick={() => setSelectedOffer(offer.id)}
            >
              <InlineStack gap="200" blockAlign="center">
                <Checkbox
                  checked={offer.active}
                  onChange={(v) => setOffer(offer.id, { active: v })}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{sStr(offer.title)}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {offer.price} {offer.currency}
                  </div>
                </div>
                {offer.popular && (
                  <Badge tone="success">{t("offers.list.popular")}</Badge>
                )}
              </InlineStack>
              <InlineStack gap="100">
                <Button size="slim" onClick={() => moveOffer(offer.id, "up")}>
                  ↑
                </Button>
                <Button size="slim" onClick={() => moveOffer(offer.id, "down")}>
                  ↓
                </Button>
                <Button
                  size="slim"
                  tone="critical"
                  onClick={() => removeOffer(offer.id)}
                  disabled={config.offers.length <= 1}
                >
                  ×
                </Button>
              </InlineStack>
            </div>
          ))}
          
          <Button onClick={addOffer} fullWidth>
            {t("offers.list.addOffer")}
          </Button>
        </BlockStack>
      </Card>

      {/* Éditeur d'offre sélectionnée */}
      {currentOffer && (
        <Card>
          <div className="tf-group-title">
            {t("offers.editor.title")}: {sStr(currentOffer.title)}
          </div>
          <BlockStack gap="200">
            <TextField
              label={t("offers.editor.offerTitle")}
              value={currentOffer.title}
              onChange={(v) => setOffer(currentOffer.id, { title: v })}
            />
            
            <TextField
              label={t("offers.editor.subtitle")}
              value={currentOffer.subtitle}
              onChange={(v) => setOffer(currentOffer.id, { subtitle: v })}
            />
            
            <InlineGrid columns="1fr 1fr" gap="200">
              <TextField
                type="number"
                label={t("offers.editor.price")}
                value={String(currentOffer.price)}
                onChange={(v) => setOffer(currentOffer.id, { price: Number(v) || 0 })}
                prefix={currentOffer.currency}
              />
              
              <TextField
                type="number"
                label={t("offers.editor.comparePrice")}
                value={String(currentOffer.comparePrice || "")}
                onChange={(v) => setOffer(currentOffer.id, { 
                  comparePrice: v === "" ? null : Number(v) 
                })}
                prefix={currentOffer.currency}
              />
            </InlineGrid>
            
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {t("offers.editor.features")}
              </div>
              <BlockStack gap="100">
                {currentOffer.features.map((feature, idx) => (
                  <InlineStack key={idx} gap="100" blockAlign="center">
                    <TextField
                      value={feature}
                      onChange={(v) => {
                        const newFeatures = [...currentOffer.features];
                        newFeatures[idx] = v;
                        setOffer(currentOffer.id, { features: newFeatures });
                      }}
                    />
                    <Button
                      size="slim"
                      tone="critical"
                      onClick={() => {
                        const newFeatures = currentOffer.features.filter((_, i) => i !== idx);
                        setOffer(currentOffer.id, { features: newFeatures });
                      }}
                    >
                      ×
                    </Button>
                  </InlineStack>
                ))}
                <Button
                  onClick={() => {
                    const newFeatures = [...currentOffer.features, "New feature"];
                    setOffer(currentOffer.id, { features: newFeatures });
                  }}
                >
                  {t("offers.editor.addFeature")}
                </Button>
              </BlockStack>
            </div>
            
            <TextField
              label={t("offers.editor.buttonText")}
              value={currentOffer.buttonText}
              onChange={(v) => setOffer(currentOffer.id, { buttonText: v })}
            />
            
            <InlineStack gap="200" blockAlign="center">
              <Checkbox
                label={t("offers.editor.popular")}
                checked={currentOffer.popular}
                onChange={(v) => setOffer(currentOffer.id, { popular: v })}
              />
              
              <Select
                label={t("offers.editor.colorScheme")}
                options={[
                  { label: t("offers.editor.colorInherit"), value: "inherit" },
                  { label: t("offers.editor.colorDefault"), value: "default" },
                  { label: t("offers.editor.colorBlue"), value: "blue" },
                  { label: t("offers.editor.colorGreen"), value: "green" },
                  { label: t("offers.editor.colorPurple"), value: "purple" },
                ]}
                value={currentOffer.colorScheme}
                onChange={(v) => setOffer(currentOffer.id, { colorScheme: v })}
              />
            </InlineStack>
          </BlockStack>
        </Card>
      )}
    </div>
  );
}

/* ============================== Prévisualisation Offres ============================== */
function OffersPreview() {
  const { config, computeCardCSS, computeButtonCSS, t } = useOffers();
  
  const getGridColumns = () => {
    switch (config.design.layout) {
      case "grid-2": return "repeat(2, 1fr)";
      case "grid-3": return "repeat(3, 1fr)";
      case "grid-4": return "repeat(4, 1fr)";
      default: return "repeat(3, 1fr)";
    }
  };

  return (
    <Card>
      <BlockStack gap="300">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: getGridColumns(),
            gap: config.design.spacing,
            padding: 16,
            background: "#F9FAFB",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
          }}
        >
          {config.offers
            .filter((offer) => offer.active)
            .map((offer) => (
              <div key={offer.id} style={{ position: "relative" }}>
                {config.design.showPopularBadge && offer.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 16,
                      background: "#10B981",
                      color: "#FFFFFF",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 10,
                    }}
                  >
                    {t("offers.preview.popular")}
                  </div>
                )}
                
                <div style={computeCardCSS(offer, offer.popular)}>
                  <BlockStack gap="200">
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                        {sStr(offer.title)}
                      </div>
                      {offer.subtitle && (
                        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
                          {sStr(offer.subtitle)}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ textAlign: "center", margin: "16px 0" }}>
                      <div style={{ fontSize: 36, fontWeight: 800 }}>
                        {offer.price} {offer.currency}
                      </div>
                      {config.design.showComparePrice && offer.comparePrice && (
                        <div style={{ fontSize: 14, opacity: 0.6, textDecoration: "line-through" }}>
                          {offer.comparePrice} {offer.currency}
                        </div>
                      )}
                    </div>
                    
                    {config.design.showFeatures && offer.features && offer.features.length > 0 && (
                      <div style={{ margin: "16px 0" }}>
                        <BlockStack gap="100">
                          {offer.features.map((feature, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ color: "#10B981" }}>✓</div>
                              <div>{sStr(feature)}</div>
                            </div>
                          ))}
                        </BlockStack>
                      </div>
                    )}
                    
                    <button style={computeButtonCSS(offer)}>
                      {sStr(offer.buttonText)}
                    </button>
                  </BlockStack>
                </div>
              </div>
            ))}
        </div>
        
        <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>
          {t("offers.preview.note")}: {config.offers.filter(o => o.active).length} {t("offers.preview.activeOffers")}
          {config.meta.syncWithForms && (
            <div style={{ marginTop: 4 }}>
              {t("offers.preview.syncWithForms")}
            </div>
          )}
        </div>
      </BlockStack>
    </Card>
  );
}

// ============================== Export ==============================
export default Section2OffersLayoutInner;