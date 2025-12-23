// ===== File: app/components/SmartSupportPanel.jsx =====
import React, { useMemo, useState } from "react";
import {
  Card,
  Text,
  TextField,
  BlockStack,
  InlineStack,
  Icon,
  Button,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import "../styles/app.css";
import { useI18n } from "../i18n/react";

/* ----------------- Liste des FAQ (clé i18n + catégorie) ----------------- */
/*  cat = id interne; label dyal tabs kayji men dictionaries.js  */
const FAQ_ITEMS = [
  // ===== COMMENCER =====
  { id: "start-1", cat: "start", key: "section0.faq.start.1" },
  { id: "start-2", cat: "start", key: "section0.faq.start.2" },
  { id: "start-3", cat: "start", key: "section0.faq.start.3" },
  { id: "start-4", cat: "start", key: "section0.faq.start.4" },

  // ===== FORMULAIRES =====
  { id: "form-1", cat: "forms", key: "section0.faq.forms.1" },
  { id: "form-2", cat: "forms", key: "section0.faq.forms.2" },
  { id: "form-3", cat: "forms", key: "section0.faq.forms.3" },
  { id: "form-4", cat: "forms", key: "section0.faq.forms.4" },
  { id: "form-5", cat: "forms", key: "section0.faq.forms.5" },

  // ===== OFFERS / UPSELL =====
  { id: "offer-1", cat: "offers", key: "section0.faq.offers.1" },
  { id: "offer-2", cat: "offers", key: "section0.faq.offers.2" },
  { id: "offer-3", cat: "offers", key: "section0.faq.offers.3" },

  // ===== GOOGLE SHEETS =====
  { id: "sheet-1", cat: "sheets", key: "section0.faq.sheets.1" },
  { id: "sheet-2", cat: "sheets", key: "section0.faq.sheets.2" },
  { id: "sheet-3", cat: "sheets", key: "section0.faq.sheets.3" },
  { id: "sheet-4", cat: "sheets", key: "section0.faq.sheets.4" },

  // ===== PIXELS =====
  { id: "pixel-1", cat: "pixels", key: "section0.faq.pixels.1" },
  { id: "pixel-2", cat: "pixels", key: "section0.faq.pixels.2" },
  { id: "pixel-3", cat: "pixels", key: "section0.faq.pixels.3" },

  // ===== ANTI-BOT =====
  { id: "bot-1", cat: "antibot", key: "section0.faq.antibot.1" },
  { id: "bot-2", cat: "antibot", key: "section0.faq.antibot.2" },
  { id: "bot-3", cat: "antibot", key: "section0.faq.antibot.3" },

  // ===== LIVRAISON =====
  { id: "ship-1", cat: "shipping", key: "section0.faq.shipping.1" },
  { id: "ship-2", cat: "shipping", key: "section0.faq.shipping.2" },

  // ===== BILLING =====
  { id: "bill-1", cat: "billing", key: "section0.faq.billing.1" },
  { id: "bill-2", cat: "billing", key: "section0.faq.billing.2" },

  // ===== SUPPORT =====
  { id: "sup-1", cat: "support", key: "section0.faq.support.1" },
];

/* helper: jib les lignes dyal answer.* mn i18n */
function getFaqAnswers(t, baseKey) {
  const lines = [];
  for (let i = 1; i <= 6; i++) {
    const k = `${baseKey}.answer.${i}`;
    const v = t(k);
    if (v === k) break; // mafhatch => sda
    lines.push(v);
  }
  return lines;
}

export default function SmartSupportPanel() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState(null);

  // catégories (labels men dictionaries.js)
  const categories = useMemo(
    () => [
      { id: "all", label: t("section0.support.cat.all") },
      { id: "start", label: t("section0.support.cat.start") },
      { id: "forms", label: t("section0.support.cat.forms") },
      { id: "forms", label: t("section0.support.cat.forms") },
      { id: "offers", label: t("section0.support.cat.offers") },
      { id: "sheets", label: t("section0.support.cat.sheets") },
      { id: "pixels", label: t("section0.support.cat.pixels") },
      { id: "antibot", label: t("section0.support.cat.antibot") },
      { id: "shipping", label: t("section0.support.cat.shipping") },
      { id: "billing", label: t("section0.support.cat.billing") },
      { id: "support", label: t("section0.support.cat.support") },
    ],
    [t]
  );

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return FAQ_ITEMS.filter((f) => {
      if (category !== "all" && f.cat !== category) return false;
      if (!s) return true;

      const title = t(`${f.key}.title`);
      const answers = getFaqAnswers(t, f.key);
      const hay = (title + " " + answers.join(" ")).toLowerCase();
      return hay.includes(s);
    });
  }, [search, category, t]);

  // Vérifiez que les icônes existent dans PI
  const SupportIcon = PI.QuestionMarkIcon || PI.CircleInformationIcon || PI.HelpIcon || "❓";
  const ChevronUpIcon = PI.ChevronUpIcon || "⬆️";
  const ChevronDownIcon = PI.ChevronDownIcon || "⬇️";
  const ChatIcon = PI.ChatIcon || PI.ConversationIcon || "💬";
  const EmailIcon = PI.EmailIcon || "📧";

  return (
    <Card>
      <div style={{ padding: 16 }}>
        <BlockStack gap="300">
          {/* Header */}
          <InlineStack gap="200" blockAlign="center">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Utilisez un caractère emoji si l'icône n'existe pas */}
              {typeof SupportIcon === 'string' ? (
                <span style={{ color: 'white', fontSize: '18px' }}>{SupportIcon}</span>
              ) : (
                <Icon source={SupportIcon} color="base" />
              )}
            </div>
            <Text as="h2" variant="headingMd">
              {t("section0.support.header")}
            </Text>
          </InlineStack>

          {/* Search */}
          <TextField
            placeholder={t("section0.support.search.placeholder")}
            value={search}
            onChange={setSearch}
          />

          {/* Categories */}
          <div className="tf-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="tf-tab"
                data-active={cat.id === category ? "1" : "0"}
                onClick={() => {
                  setCategory(cat.id);
                  setOpenId(null);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="tf-faq-scroll">
            <BlockStack gap="200">
              {filtered.length === 0 ? (
                <Text tone="subdued">
                  {t("section0.support.noResults")}
                </Text>
              ) : (
                filtered.map((item) => {
                  const isOpen = item.id === openId;
                  const title = t(`${item.key}.title`);
                  const answers = getFaqAnswers(t, item.key);

                  return (
                    <div key={item.id} className="tf-faq-item">
                      <button
                        type="button"
                        className="tf-faq-header"
                        onClick={() =>
                          setOpenId(isOpen ? null : item.id)
                        }
                      >
                        <div className="tf-faq-header-label">
                          <Text variant="bodyMd" fontWeight="bold">
                            {title}
                          </Text>
                        </div>
                        <div className="tf-faq-header-icon">
                          <Icon
                            source={
                              isOpen
                                ? ChevronUpIcon
                                : ChevronDownIcon
                            }
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="tf-faq-answer">
                          <BlockStack gap="050">
                            {answers.map((line, i) => (
                              <Text key={i} variant="bodySm">
                                {line}
                              </Text>
                            ))}
                          </BlockStack>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </BlockStack>
          </div>

          {/* Contact */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid #E5E7EB",
            }}
          >
            <InlineStack align="space-between" blockAlign="center">
              <Text tone="subdued">
                {t("section0.support.contactText")}
              </Text>

              <InlineStack gap="200">
                <Button
                  icon={ChatIcon}
                  url="https://wa.me/212681570887"
                >
                  {t("section0.support.whatsapp")}
                </Button>
                <Button
                  icon={EmailIcon}
                  url="mailto:ktami.sami@icloud.com"
                  variant="secondary"
                >
                  {t("section0.support.email")}
                </Button>
              </InlineStack>
            </InlineStack>
          </div>
        </BlockStack>
      </div>
    </Card>
  );
}