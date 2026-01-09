// ===== File: app/components/PlanUsageWidget.jsx =====
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Text, Icon, Banner, Button, Modal } from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { getPlan } from "../utils/plans";
import { useI18n } from "../i18n/react";

const subscriptionIconSource =
  PI.CashDollarIcon || PI.CreditCardIcon || PI.WalletIcon || "💰";

function RemainingCircle({ used, limit, unlimited, label }) {
  const size = 110;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // cercle = "restant"
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
          <linearGradient id="tfRemainingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B3B82" />
            <stop offset="100%" stopColor="#7D0031" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={stroke}
          fill="none"
        />

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
          style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
        />
      </svg>

      {/* centre */}
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
        <span style={{ fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
          {Math.max(0, Number(used || 0))}
        </span>

        {/* ✅ Toujours "used/limit" */}
        <span style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
          / {unlimited ? "∞" : Number(limit || 0)}
        </span>

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

function getNextPlanKey(planKey) {
  const k = String(planKey || "starter").toLowerCase();
  if (k === "starter") return "basic";
  if (k === "basic") return "premium";
  return null;
}

export default function PlanUsageWidget({ isSubscribed, planKey, currentTerm, usage }) {
  const { t } = useI18n();

  // usage depuis /api/plan-usage (idéal)
  const ordersUsed = Math.max(0, Number(usage?.ordersUsed || 0));
  const apiUnlimited = usage?.unlimited;
  const apiLimit = usage?.ordersLimit;
  const apiRemaining = usage?.remaining;
  const monthKey = usage?.monthKey || null;
  const apiNextPlanKey = usage?.nextPlanKey || null;
  const loading = !!usage?.loading;
  const sinceLabel = usage?.sinceLabel || null;

  // fallback si ton endpoint n’envoie pas encore ordersLimit/unlimited
  const cfg = getPlan(planKey || "starter") || getPlan("starter");
  const fallbackLimit = cfg?.orderLimit ?? null;
  const fallbackUnlimited = fallbackLimit == null || !Number.isFinite(fallbackLimit);

  const unlimited = typeof apiUnlimited === "boolean" ? apiUnlimited : fallbackUnlimited;
  const limit = unlimited
    ? Infinity
    : Number.isFinite(Number(apiLimit))
    ? Number(apiLimit)
    : Number(fallbackLimit || 0);

  const remaining = unlimited
    ? null
    : Number.isFinite(Number(apiRemaining))
    ? Math.max(0, Number(apiRemaining))
    : Math.max(0, (Number(limit || 0) || 0) - ordersUsed);

  const usedPct = useMemo(() => {
    if (unlimited) return 0;
    if (!limit || limit <= 0) return 0;
    return Math.min(100, (ordersUsed / limit) * 100);
  }, [unlimited, ordersUsed, limit]);

  const planLabel = cfg?.name || t("section0.usage.planFallback") || "Plan";
  const termLabel =
    currentTerm === "annual"
      ? t("section0.usage.term.annual")
      : currentTerm === "monthly"
      ? t("section0.usage.term.monthly")
      : null;

  const commandsLabel = t("section0.usage.commandsLabel") || "COMMANDS";

  // ✅ Alerte orange à partir de 80% (si pas atteint)
  const warnThresholdPct = 80;
  const showNearLimitWarning = !unlimited && usedPct >= warnThresholdPct && ordersUsed < limit;

  // ✅ Modal rouge فقط quand used >= limit
  const isLimitReached = !unlimited && Number.isFinite(limit) && ordersUsed >= limit;

  const nextPlanKey = apiNextPlanKey || getNextPlanKey(planKey);
  const upgradeTerm = currentTerm === "annual" ? "annual" : "monthly";

  const [openLimitModal, setOpenLimitModal] = useState(false);

  // Ouvrir automatiquement la modal quand limite atteinte (1 fois par moisKey)
  useEffect(() => {
    if (!isSubscribed) return;
    if (!isLimitReached) return;

    const key = `tf_limit_modal_dismissed_${monthKey || "current"}`;
    const dismissed =
      typeof window !== "undefined" ? window.sessionStorage.getItem(key) === "1" : false;

    if (!dismissed) setOpenLimitModal(true);
  }, [isSubscribed, isLimitReached, monthKey]);

  const dismissLimitModal = useCallback(() => {
    setOpenLimitModal(false);
    try {
      const key = `tf_limit_modal_dismissed_${monthKey || "current"}`;
      window.sessionStorage.setItem(key, "1");
    } catch {}
  }, [monthKey]);

  const openBilling = useCallback(
    async (plan, term) => {
      try {
        const u = new URL("/api/billing/request", window.location.origin);
        u.searchParams.set("plan", plan);
        u.searchParams.set("term", term);

        const res = await fetch(u.toString(), { method: "GET", credentials: "include" });
        const data = await res.json();

        if (!res.ok || !data?.ok || !data?.confirmationUrl) {
          console.error("Billing request failed:", data);
          alert(t("section0.usage.upgrade.error") || "Billing error");
          return;
        }

        // embedded → top redirect
        window.top.location.href = data.confirmationUrl;
      } catch (e) {
        console.error(e);
        alert(t("section0.usage.upgrade.networkError") || "Network error");
      }
    },
    [t]
  );

  const onUpgrade = useCallback(() => {
    if (!nextPlanKey) return;
    openBilling(nextPlanKey, upgradeTerm);
  }, [nextPlanKey, openBilling, upgradeTerm]);

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
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
          {t("section0.usage.noPlan.title") || "No active plan"}
        </div>
        <div style={{ fontSize: 12, color: "#6B7280" }}>
          {t("section0.usage.noPlan.body") || "Please subscribe to unlock usage."}
        </div>
      </div>
    );
  }

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
            {typeof subscriptionIconSource === "string" ? (
              <span style={{ fontSize: "14px" }}>{subscriptionIconSource}</span>
            ) : (
              <Icon source={subscriptionIconSource} tone="success" />
            )}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0B1120" }}>
              {t("section0.usage.header.title") || "Plan usage"}
            </div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {planLabel}
              {termLabel ? ` • ${termLabel}` : ""} —{" "}
              {t("section0.usage.header.subtitleTail") || "monthly limit"}
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
          {t("section0.usage.badge.active") || "Active"}
        </span>
      </div>

      {/* BARRE PROGRESS */}
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

      {/* ✅ Alerte orange avant limite */}
      {showNearLimitWarning && (
        <Banner
          tone="warning"
          title={t("section0.usage.alert.nearLimit.title") || "Approaching limit"}
        >
          <p>
            {t("section0.usage.alert.nearLimit.body") ||
              "You are close to your monthly export limit."}
          </p>
        </Banner>
      )}

      {/* ✅ Alerte critique quand limite atteinte (en plus de la modal) */}
      {isLimitReached && (
        <Banner
          tone="critical"
          title={t("section0.usage.alert.limitReached.title") || "Limit reached"}
        >
          <p>
            {t("section0.usage.alert.limitReached.body") ||
              "Your monthly limit is reached. Upgrade to continue exporting."}
          </p>
          {nextPlanKey ? (
            <div style={{ marginTop: 10 }}>
              <Button variant="primary" onClick={onUpgrade}>
                {t("section0.usage.alert.upgradeCta") || "Upgrade"}
              </Button>
            </div>
          ) : null}
        </Banner>
      )}

      {/* CONTENT */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <RemainingCircle used={ordersUsed} limit={limit} unlimited={unlimited} label={commandsLabel} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Text as="p" variant="bodySm">
            {loading
              ? t("section0.usage.loading")
              : unlimited
              ? t("section0.usage.unlimitedText")
              : t("section0.usage.limitedText")}
          </Text>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {/* Used */}
            <div style={{ flex: "1 1 90px", padding: "8px 10px", borderRadius: 12, background: "#F9FAFB" }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
                {t("section0.usage.used") || "Used"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{ordersUsed}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                {t("section0.usage.usedOf") || "of"} {unlimited ? "∞" : limit}
              </div>
            </div>

            {/* Remaining */}
            <div style={{ flex: "1 1 90px", padding: "8px 10px", borderRadius: 12, background: "#F9FAFB" }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
                {t("section0.usage.remaining") || "Remaining"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: unlimited ? "#0B3B82" : "#111827" }}>
                {unlimited ? "∞" : remaining ?? 0}
              </div>
              {!unlimited && (
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                  {t("section0.usage.beforeLimit") || "before limit"}
                </div>
              )}
            </div>

            {/* Progress */}
            {!unlimited && (
              <div style={{ flex: "1 1 90px", padding: "8px 10px", borderRadius: 12, background: "#F9FAFB" }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
                  {t("section0.usage.progress") || "Progress"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{Math.round(usedPct)}%</div>
                {sinceLabel && (
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
                    {t("section0.usage.since") || "Since"} {sinceLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODAL ROUGE: فقط quand used >= limit */}
      <Modal
        open={openLimitModal}
        onClose={dismissLimitModal}
        title={t("section0.usage.modal.limitReached.title") || "Monthly limit reached"}
        primaryAction={
          nextPlanKey
            ? {
                content: t("section0.usage.modal.limitReached.upgradeCta") || "Upgrade",
                onAction: onUpgrade,
              }
            : undefined
        }
        secondaryActions={[
          {
            content: t("section0.usage.modal.limitReached.dismiss") || "Close",
            onAction: dismissLimitModal,
          },
        ]}
      >
        <Modal.Section>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <Text as="p" variant="bodySm">
              {t("section0.usage.modal.limitReached.body") ||
                "You have reached your monthly export limit. Upgrade to continue exporting to Google Sheets."}
            </Text>

            <div style={{ marginTop: 10, fontSize: 12, color: "#111827", fontWeight: 600 }}>
              {t("section0.usage.modal.limitReached.usedLabel") || "Used"}:{" "}
              {ordersUsed} / {unlimited ? "∞" : limit}
            </div>
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}
