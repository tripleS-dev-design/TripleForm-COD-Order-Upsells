// ===== File: app/components/PlanUsageWidget.jsx =====
import React from "react";
import { Text, Icon } from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { getPlan } from "../utils/plans";
import { useI18n } from "../i18n/react";

// Utilisez une icône qui existe certainement
const subscriptionIconSource = PI.CashDollarIcon || PI.CreditCardIcon || PI.WalletIcon || "💰";

/**
 * Cercle qui représente les commandes RESTANTES.
 *  - Au début : cercle complet
 *  - Plus l'utilisateur consomme, plus on enlève des morceaux.
 */
function RemainingCircle({ used, limit, unlimited, label }) {
  const size = 110;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // si illimité, on considère 100% restant
  let remainingPct = 100;
  if (!unlimited && limit > 0) {
    const remaining = Math.max(0, limit - used);
    remainingPct = Math.max(0, Math.min(100, (remaining / limit) * 100));
  }

  const offset = circumference - (remainingPct / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          {/* dégradé vertical : plus foncé en haut */}
          <linearGradient
            id="tfRemainingGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0B3B82" />
            <stop offset="100%" stopColor="#7D0031" />
          </linearGradient>
        </defs>

        {/* cercle fond très léger */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* partie RESTANTE (ce qui reste du plan) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#tfRemainingGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.4s ease-out",
          }}
        />
      </svg>

      {/* centre du cercle */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {unlimited ? "∞" : used}
        </span>

        {!unlimited && typeof limit === "number" && (
          <span
            style={{
              fontSize: 11,
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            / {limit}
          </span>
        )}

        <span
          style={{
            fontSize: 10,
            color: "#9CA3AF",
            marginTop: 6,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Widget principal
 */
export default function PlanUsageWidget({
  isSubscribed,
  planKey,
  currentTerm,
  usage,
}) {
  const { t } = useI18n();
  const { ordersUsed = 0, sinceLabel = null, loading = false } = usage || {};

  if (!isSubscribed) {
    return (
      <div
        className="tf-usage-card"
        style={{
          padding: 14,
          borderRadius: 16,
          border: "1px dashed #E5E7EB",
          background: "#F9FAFB",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {t("section0.usage.noPlan.title")}
        </div>
        <div style={{ fontSize: 12, color: "#6B7280" }}>
          {t("section0.usage.noPlan.body")}
        </div>
      </div>
    );
  }

  const cfg = getPlan(planKey || "starter") || getPlan("starter");
  const limit = cfg?.orderLimit ?? null;
  const unlimited = limit == null || !Number.isFinite(limit);

  const safeUsed = Math.max(0, ordersUsed || 0);
  const remaining = unlimited ? null : Math.max(0, limit - safeUsed);
  const usedPct =
    !unlimited && limit > 0 ? Math.min(100, (safeUsed / limit) * 100) : 0;

  const planLabel = cfg?.name || t("section0.usage.planFallback");
  const termLabel =
    currentTerm === "annual"
      ? t("section0.usage.term.annual")
      : currentTerm === "monthly"
      ? t("section0.usage.term.monthly")
      : null;

  const commandsLabel = t("section0.usage.commandsLabel");

  return (
    <div
      className="tf-usage-card"
      style={{
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, rgba(11,59,130,0.12), rgba(125,0,49,0.16))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {typeof subscriptionIconSource === 'string' ? (
              <span style={{ fontSize: '14px' }}>{subscriptionIconSource}</span>
            ) : (
              <Icon
                source={subscriptionIconSource}
                tone="success"
                style={{ transform: "scale(0.8)" }}
              />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0B1120",
              }}
            >
              {t("section0.usage.header.title")}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B7280",
              }}
            >
              {planLabel}
              {termLabel ? ` • ${termLabel}` : ""} —{" "}
              {t("section0.usage.header.subtitleTail")}
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "4px 10px",
            borderRadius: 999,
            backgroundColor: "#ECFDF5",
            color: "#15803D",
            border: "1px solid #BBF7D0",
            whiteSpace: "nowrap",
          }}
        >
          {t("section0.usage.badge.active")}
        </span>
      </div>

      {/* BARRE FINE EN HAUT (progression des commandes) */}
      {!unlimited && (
        <div
          style={{
            width: "100%",
            height: 6,
            borderRadius: 999,
            backgroundColor: "#F3F4F6",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${usedPct}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #0B3B82, #7D0031)",
              position: "relative",
              transition: "width 0.35s ease-out",
            }}
          >
            {/* petite bulle au bout de la barre */}
            <div
              style={{
                position: "absolute",
                right: -3,
                top: "50%",
                transform: "translateY(-50%)",
                width: 10,
                height: 10,
                borderRadius: "999px",
                background: "#FFFFFF",
                boxShadow: "0 0 0 2px rgba(125,0,49,0.3)",
              }}
            />
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* CERCLE RESTANT */}
        <RemainingCircle
          used={safeUsed}
          limit={limit}
          unlimited={unlimited}
          label={commandsLabel}
        />

        {/* TEXTE + PETITES CARTES */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text as="p" variant="bodySm">
            {loading
              ? t("section0.usage.loading")
              : unlimited
              ? t("section0.usage.unlimitedText")
              : t("section0.usage.limitedText")}
          </Text>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 10,
            }}
          >
            {/* Utilisées */}
            <div
              style={{
                flex: "1 1 90px",
                padding: "8px 10px",
                borderRadius: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginBottom: 2,
                }}
              >
                {t("section0.usage.used")}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {safeUsed}
              </div>
              {!unlimited && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {t("section0.usage.usedOf")} {limit}
                </div>
              )}
            </div>

            {/* Restantes */}
            <div
              style={{
                flex: "1 1 90px",
                padding: "8px 10px",
                borderRadius: 12,
                backgroundColor: "#F9FAFB",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  marginBottom: 2,
                }}
              >
                {t("section0.usage.remaining")}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: unlimited ? "#0B3B82" : "#111827",
                }}
              >
                {unlimited ? "∞" : remaining ?? 0}
              </div>
              {!unlimited && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                    marginTop: 2,
                  }}
                >
                  {t("section0.usage.beforeLimit")}
                </div>
              )}
            </div>

            {/* Progression % */}
            {!unlimited && (
              <div
                style={{
                  flex: "1 1 90px",
                  padding: "8px 10px",
                  borderRadius: 12,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginBottom: 2,
                  }}
                >
                  {t("section0.usage.progress")}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {Math.round(usedPct)}%
                </div>
                {sinceLabel && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9CA3AF",
                      marginTop: 2,
                    }}
                  >
                    {t("section0.usage.since")} {sinceLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}