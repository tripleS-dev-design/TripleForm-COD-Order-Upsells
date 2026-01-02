// ===== File: app/sections/Section0Home.jsx =====
import React, { useEffect, useMemo, useState } from "react";
import CountryFlagsBar from "../components/CountryFlagsBar";

import {
  Card,
  InlineStack,
  Button,
  Text,
  List,
  Icon,
  Banner,
  Badge,
  Spinner,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";
import SmartSupportPanel from "../components/SmartSupportPanel";
import PlanUsageWidget from "../components/PlanUsageWidget";
import { useI18n } from "../i18n/react";
import LanguageSelector from "../components/LanguageSelector";

/* ======================= CSS / layout ======================= */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content {
    max-width:none!important;
    padding-left:0!important;
    padding-right:0!important;
  }
  .Polaris-TextField, .Polaris-Select, .Polaris-Labelled__LabelWrapper { min-width:0; }

  /* ✅ HEADER SLIM */
  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:8px 12px;             /* ✅ plus slim */
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.35);
  }

  .tf-shell { padding:16px; }

  /* 3 colonnes : gauche | milieu | droite */
  .tf-editor {
    display:grid;
    grid-template-columns: 340px 3fr 1.35fr;
    gap:16px;
    align-items:start;
  }

  /* colonne gauche (sticky) */
  .tf-rail {
    position:sticky;
    top:58px; /* ✅ header slim */
    max-height:calc(100vh - 74px);
    overflow:auto;
  }

  /* colonne milieu */
  .tf-right-col { display:grid; gap:16px; }
  .tf-panel   { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  /* colonne droite (preview) */
  .tf-preview-col {
    position:sticky;
    top:58px; /* ✅ header slim */
    max-height:calc(100vh - 74px);
    overflow:auto;
    display:grid;
    gap:12px;
  }
  .tf-preview-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:12px;
  }

  /* titres de groupe */
  .tf-group-title {
    padding:10px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:1px solid rgba(0,167,163,0.85);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:800;
    letter-spacing:.2px;
    margin-bottom:10px;
    box-shadow:0 6px 18px rgba(205, 211, 218, 0.35);
  }

  /* =================== FLAGS BAR (clean) =================== */
  .tf-flags-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    width:100%;
    min-width:0;
  }
  .tf-flags{
    display:flex;
    align-items:center;
    gap:10px;
    padding:6px 12px;
    max-width:760px;
    overflow-x:auto;
    white-space:nowrap;
    scrollbar-width:none;
    -webkit-overflow-scrolling: touch;
    border-radius:999px;
    background:rgba(255,255,255,0.09);
    border:1px solid rgba(255,255,255,0.18);
  }
  .tf-flags::-webkit-scrollbar{ display:none; }

  /* =================== RIGHT CONTROLS (extreme right) =================== */
  .tf-header-right{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:10px;
  }
  .tf-pill{
    font-size:12px;
    padding:5px 10px;
    border-radius:999px;
    border:1px solid rgba(248,250,252,0.40);
    color:rgba(248,250,251,0.92);
    background:linear-gradient(90deg,rgba(15,23,42,0.30),rgba(15,23,42,0.08));
    white-space:nowrap;
  }

  /* ✅ left single button in header */
  .tf-video-btn{
    display:inline-flex;
    align-items:center;
    gap:8px;
    padding:6px 10px;
    border-radius:999px;
    border:1px solid rgba(255,255,255,0.22);
    background:rgba(255,255,255,0.10);
    color:#F9FAFB;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(0,0,0,0.18);
    transition:all .15s ease-out;
    font-size:12px;
    font-weight:700;
    white-space:nowrap;
  }
  .tf-video-btn:hover{
    transform:translateY(-1px);
    background:rgba(255,255,255,0.14);
    border-color:rgba(255,255,255,0.30);
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-preview-col { position:static; max-height:none; }
    .tf-flags{ max-width:260px; gap:8px; padding:6px 10px; }
    .tf-pill{ display:none; } /* ✅ header slim on mobile */
  }

  /* =================== PLANS (design) =================== */
  .pricing-grid{
    display:grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    gap:14px;
    margin-top:12px;
  }
  @media (max-width: 1100px) {
    .pricing-grid{ grid-template-columns:1fr; }
  }

  .plan-card{
    border-radius:14px;
    background:#ffffff;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.08);
    overflow:hidden;
  }

  .plan-header{
    padding:12px 12px 10px;
    background:linear-gradient(90deg, rgba(11,59,130,0.10), rgba(125,0,49,0.10));
    border-bottom:1px solid #E5E7EB;
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:10px;
  }
  .plan-header-title{
    font-weight:900;
    color:#0F172A;
    font-size:14px;
    letter-spacing:.2px;
  }
  .plan-header-badges{
    display:flex;
    gap:6px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }
  .plan-header-pill{
    font-size:11px;
    font-weight:800;
    padding:4px 10px;
    border-radius:999px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    color:#F9FAFB;
    border:1px solid rgba(0,167,163,0.55);
    box-shadow:0 6px 16px rgba(11,59,130,0.22);
    white-space:nowrap;
  }

  .plan-body{
    padding:12px;
    display:grid;
    gap:10px;
  }

  .plan-price-row{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap:10px;
    padding:10px 10px;
    background:#F9FAFB;
    border:1px solid #E5E7EB;
    border-radius:12px;
  }
  .plan-price-main{
    font-size:22px;
    font-weight:950;
    color:#0F172A;
    line-height:1.1;
  }
  .plan-price-alt{
    font-size:16px;
    font-weight:900;
    color:#0F172A;
    line-height:1.1;
    text-align:right;
  }
  .plan-price-sub{
    font-size:11px;
    color:#6B7280;
    margin-top:2px;
  }

  .plan-footer-btns{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:10px;
    margin-top:2px;
  }
  @media (max-width: 520px){
    .plan-footer-btns{ grid-template-columns:1fr; }
  }

  /* tabs Section0 */
  .tf-tabs {
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    margin-bottom:10px;
  }
  .tf-tab {
    border-radius:999px;
    padding:4px 12px;
    font-size:12px;
    border:1px solid #E5E7EB;
    background:#F9FAFB;
    cursor:pointer;
  }
  .tf-tab[data-active="1"] {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    color:#F9FAFB;
    border-color:rgba(0,167,163,0.85);
    box-shadow:0 6px 16px rgba(11,59,130,0.35);
  }

  /* =================== WHATSAPP MONITOR =================== */
  .wa-card{
    margin-bottom:14px;
    background:#ffffff;
    border-radius:12px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.12);
    overflow:hidden;
  }
  .wa-head{
    padding:10px 12px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    border-bottom:1px solid #E5E7EB;
  }
  .wa-head-left{
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }
  .wa-logo{
    width:34px; height:34px;
    border-radius:12px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(37,211,102,0.12);
    border:1px solid rgba(37,211,102,0.30);
    position:relative;
    flex:0 0 auto;
  }
  .wa-title{
    display:flex;
    flex-direction:column;
    min-width:0;
    gap:2px;
  }
  .wa-title b{ font-size:13px; color:#0F172A; }

  .wa-body{
    padding:10px 12px 12px;
    display:grid;
    gap:8px;
  }

  .wa-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    background:#F9FAFB;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:8px 10px;
  }
  .wa-row-left{
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }
  .wa-ico{
    width:30px; height:30px;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#ffffff;
    border:1px solid rgba(148,163,184,0.35);
    flex:0 0 auto;
  }
  .wa-meta{ display:flex; flex-direction:column; gap:2px; min-width:0; }
  .wa-meta .k{ font-size:12px; font-weight:800; color:#0F172A; }
  .wa-meta .s{ font-size:11px; color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .wa-val{ font-size:18px; font-weight:900; color:#0F172A; }

  .wa-mini{
    margin-top:4px;
    background:#F9FAFB;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:8px 10px;
    display:grid;
    gap:6px;
  }
  .wa-mini-line{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    font-size:12px;
    color:#374151;
  }
  .wa-mini-line b{ color:#0F172A; }

  .wa-users{
    margin-top:10px;
    background:#ffffff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    overflow:hidden;
  }
  .wa-users-head{
    padding:8px 10px;
    background:#F9FAFB;
    border-bottom:1px solid #E5E7EB;
    font-size:12px;
    font-weight:800;
    color:#0F172A;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }
  .wa-user{
    padding:8px 10px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    border-bottom:1px solid #F3F4F6;
  }
  .wa-user:last-child{ border-bottom:none; }
  .wa-user-left{ display:flex; align-items:center; gap:10px; min-width:0; }
  .wa-user-dot{
    width:10px; height:10px; border-radius:999px;
    background:#22C55E;
    box-shadow:0 0 0 3px rgba(34,197,94,0.15);
    flex:0 0 auto;
  }
  .wa-user-dot.off{
    background:#EF4444;
    box-shadow:0 0 0 3px rgba(239,68,68,0.15);
  }
  .wa-user-meta{ display:flex; flex-direction:column; min-width:0; }
  .wa-user-meta b{ font-size:12px; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .wa-user-meta span{ font-size:11px; color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* ✅ Single video preview */
  .tf-video-hero{
    border-radius:14px;
    border:1px solid #E5E7EB;
    background:#0B1220;
    overflow:hidden;
    box-shadow:0 12px 28px rgba(15,23,42,0.20);
  }
  .tf-video-hero-top{
    padding:10px 12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:10px;
    background:linear-gradient(90deg, rgba(11,59,130,0.35), rgba(125,0,49,0.35));
    border-bottom:1px solid rgba(255,255,255,0.10);
    color:#F9FAFB;
    font-weight:800;
    font-size:12px;
  }
  .tf-video-hero-body{
    padding:14px 12px 12px;
    color:#E5E7EB;
  }
  .tf-video-screen{
    height:160px;
    border-radius:12px;
    background:
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), transparent 55%),
      linear-gradient(135deg, rgba(239,68,68,0.90), rgba(127,29,29,0.85));
    display:flex;
    align-items:center;
    justify-content:center;
    margin-bottom:10px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);
  }
  .tf-video-play{
    width:54px; height:54px;
    border-radius:999px;
    background:rgba(255,255,255,0.18);
    border:1px solid rgba(255,255,255,0.30);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:22px;
    color:#fff;
    box-shadow:0 10px 22px rgba(0,0,0,0.25);
  }
  .tf-video-hero-title{ font-weight:900; color:#F9FAFB; margin-bottom:4px; }
  .tf-video-hero-sub{ font-size:12px; color:rgba(229,231,235,0.85); }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-layout-css")) return;
    const t = document.createElement("style");
    t.id = "tf-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return () => {
      try { t.remove(); } catch {}
    };
  }, []);
}

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* -------- Plan courant: mapping interval+amount -> planKey -------- */
const PLAN_MAP = {
  EVERY_30_DAYS: { 0.99: "starter", 4.99: "basic", 9.99: "premium" },
  ANNUAL: { 9.99: "starter", 49: "basic", 99: "premium" },
};
function resolveCurrentPlan(billingPlan) {
  if (!billingPlan) return { currentKey: null, currentTerm: null };
  const interval = billingPlan.interval || "EVERY_30_DAYS";
  const amount = Number(billingPlan.amount || 0);
  const key = PLAN_MAP[interval]?.[amount] || null;
  const term = interval === "ANNUAL" ? "annual" : "monthly";
  return { currentKey: key, currentTerm: key ? term : null };
}

/* -------- Composant d'une carte plan -------- */
function PlanCard({
  title,
  monthly,
  yearly,
  yearlyPercent,
  ordersLabel,
  features,
  planKey,
  isPopular = false,
  onChooseMonthly,
  onChooseAnnual,
  currentKey,
  currentTerm,
}) {
  const { t } = useI18n();
  const isCurrent = currentKey === planKey;
  const monthlyDisabled = isCurrent && currentTerm === "monthly";
  const annualDisabled = isCurrent && currentTerm === "annual";

  return (
    <div className="plan-card">
      <div className="plan-header">
        <div className="plan-header-title">{title}</div>
        <div className="plan-header-badges">
          {isPopular && <span className="plan-header-pill">{t("section0.plans.badge.popular")}</span>}
          {isCurrent && <span className="plan-header-pill">{t("section0.plans.badge.current")}</span>}
        </div>
      </div>

      <div className="plan-body">
        <div className="plan-price-row">
          <div>
            <div className="plan-price-main">${monthly}</div>
            <div className="plan-price-sub">{t("section0.plans.price.perMonth")}</div>
          </div>
          <div>
            <div className="plan-price-alt">${yearly}</div>
            <div className="plan-price-sub">{t("section0.plans.price.saving", { percent: yearlyPercent })}</div>
          </div>
        </div>

        <Text as="p">
          <b>{ordersLabel}</b>
        </Text>

        <List type="bullet">
          {features.map((fKey, i) => (
            <List.Item key={i}>{t(fKey)}</List.Item>
          ))}
        </List>

        <div className="plan-footer-btns">
          <Button
            onClick={() => onChooseMonthly(planKey)}
            variant={monthlyDisabled ? "secondary" : "primary"}
            fullWidth
            disabled={monthlyDisabled}
          >
            {monthlyDisabled ? t("section0.plans.btn.alreadyMonthly") : t("section0.plans.btn.chooseMonthly")}
          </Button>
          <Button onClick={() => onChooseAnnual(planKey)} fullWidth disabled={annualDisabled}>
            {annualDisabled ? t("section0.plans.btn.alreadyAnnual") : t("section0.plans.btn.chooseAnnual")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ====================== WhatsApp Monitor (LIVE) ====================== */
function WhatsAppMonitorPanel({ stats, wa, loading }) {
  const orders = Number(stats?.orders || 0);
  const abandoned = Number(stats?.abandoned || 0);
  const recovered = Number(stats?.recovered || 0);

  const connected = !!wa?.connected;
  const phoneNumber = wa?.phoneNumber || "";
  const lastConnected = wa?.lastConnected ? new Date(wa.lastConnected).toLocaleString() : null;
  const users = Array.isArray(wa?.users) ? wa.users : null;

  return (
    <div className="wa-card">
      <div className="wa-head">
        <div className="wa-head-left">
          <div className="wa-logo" title="WhatsApp">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M16 4C9.373 4 4 9.149 4 15.5c0 2.39.786 4.61 2.13 6.42L5 28l6.41-1.99A12.5 12.5 0 0 0 16 27c6.627 0 12-5.149 12-11.5S22.627 4 16 4Z"
                fill="#25D366"
                opacity="0.95"
              />
              <path
                d="M20.9 18.7c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.1.2-.6.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4.1-.2 0-.3 0-.4 0-.1-.5-1.2-.7-1.6-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4 0-.6.3-.2.3-.8.8-.8 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.3Z"
                fill="#fff"
              />
            </svg>
          </div>

          <div className="wa-title">
            <b>WhatsApp Monitor</b>
          </div>

          <div style={{ marginLeft: 6 }}>
            {loading ? (
              <Badge tone="info">Loading</Badge>
            ) : connected ? (
              <Badge tone="success">Connected</Badge>
            ) : (
              <Badge tone="critical">Not connected</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="wa-body">
        <div className="wa-row" style={{ alignItems: "center" }}>
          <div className="wa-row-left">
            <div className="wa-ico">
              <SafeIcon name="PhoneIcon" fallback="MobileIcon" />
            </div>
            <div className="wa-meta">
              <div className="k">{connected ? "Connected number" : "WhatsApp status"}</div>
              <div className="s">
                {loading ? "Loading live status..." : connected ? (phoneNumber || "—") : "Scan QR from WhatsApp settings"}
              </div>
            </div>
          </div>

          {loading ? (
            <Spinner size="small" />
          ) : connected ? (
            <span style={{ fontWeight: 900, color: "#16A34A" }}>●</span>
          ) : (
            <span style={{ fontWeight: 900, color: "#EF4444" }}>●</span>
          )}
        </div>

        {lastConnected && (
          <div className="wa-mini">
            <div className="wa-mini-line">
              <span>Last connected</span>
              <b>{lastConnected}</b>
            </div>
          </div>
        )}

        <div className="wa-row">
          <div className="wa-row-left">
            <div className="wa-ico">
              <SafeIcon name="OrdersIcon" fallback="CartIcon" />
            </div>
            <div className="wa-meta">
              <div className="k">Orders</div>
              <div className="s">Confirmed COD orders</div>
            </div>
          </div>
          <div className="wa-val">{orders}</div>
        </div>

        <div className="wa-row">
          <div className="wa-row-left">
            <div className="wa-ico">
              <SafeIcon name="CartIcon" fallback="CartIcon" />
            </div>
            <div className="wa-meta">
              <div className="k">Abandoned</div>
              <div className="s">Left without checkout</div>
            </div>
          </div>
          <div className="wa-val">{abandoned}</div>
        </div>

        <div className="wa-row">
          <div className="wa-row-left">
            <div className="wa-ico">
              <SafeIcon name="ArrowRightIcon" fallback="ArrowRightIcon" />
            </div>
            <div className="wa-meta">
              <div className="k">Recovered</div>
              <div className="s">Recovered via WhatsApp</div>
            </div>
          </div>
          <div className="wa-val">{recovered}</div>
        </div>

        <div className="wa-users">
          <div className="wa-users-head">
            <span>WhatsApp sessions</span>
            <span style={{ color: "#6B7280", fontWeight: 700, fontSize: 11 }}>LIVE</span>
          </div>

          {users && users.length ? (
            users.map((u, idx) => {
              const on = !!u.connected;
              const label = u.name || `User ${idx + 1}`;
              const phone = u.phone || u.phoneNumber || "";
              return (
                <div className="wa-user" key={idx}>
                  <div className="wa-user-left">
                    <div className={`wa-user-dot ${on ? "" : "off"}`} />
                    <div className="wa-user-meta">
                      <b>{label}</b>
                      <span>{phone || "—"}</span>
                    </div>
                  </div>
                  <Badge tone={on ? "success" : "critical"}>{on ? "Connected" : "Offline"}</Badge>
                </div>
              );
            })
          ) : (
            <div className="wa-user">
              <div className="wa-user-left">
                <div className={`wa-user-dot ${connected ? "" : "off"}`} />
                <div className="wa-user-meta">
                  <b>Main session</b>
                  <span>{phoneNumber || "—"}</span>
                </div>
              </div>
              <Badge tone={connected ? "success" : "critical"}>{connected ? "Connected" : "Offline"}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ✅ Single global video window (one only) */
function SingleVideoPreview() {
  const { t } = useI18n();
  return (
    <div className="tf-video-hero">
      <div className="tf-video-hero-top">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon source={PI.PlayIcon} />
          <span>Video guide</span>
        </span>
        <span style={{ opacity: 0.9, fontWeight: 700 }}>TripleForm COD</span>
      </div>

      <div className="tf-video-hero-body">
        <div className="tf-video-screen">
          <div className="tf-video-play">▶</div>
        </div>
        <div className="tf-video-hero-title">
          {t?.("section0.videos.item.intro.title") || "Introduction - Full walkthrough"}
        </div>
        <div className="tf-video-hero-sub">
          {t?.("section0.videos.item.intro.sub") ||
            "Installation, settings, sheets, pixels, anti-bot, WhatsApp (one complete guide)."}
        </div>
      </div>
    </div>
  );
}

/* ======================= CSS injection ======================= */
function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-layout-css")) return;
    const t = document.createElement("style");
    t.id = "tf-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return () => {
      try {
        t.remove();
      } catch {}
    };
  }, []);
}

/* ============================== Contenu Section0 ============================== */
function Section0Inner() {
  useInjectCss();
  const navigate = useNavigate();
  const { t } = useI18n();

  // ✅ Par défaut: Plans & billing
  const [activeTab, setActiveTab] = useState("billing");

  const [billing, setBilling] = useState({ loading: true, active: false, plan: null });
  const [currentKey, setCurrentKey] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [planUsage, setPlanUsage] = useState({ loading: true, ordersUsed: 0, sinceLabel: null });

  const [waStats, setWaStats] = useState({
    loading: true,
    orders: 0,
    abandoned: 0,
    recovered: 0,
  });

  const [waLive, setWaLive] = useState({
    loading: true,
    connected: false,
    phoneNumber: "",
    lastConnected: null,
    users: null,
  });

  // billing
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/billing/guard", { credentials: "include" });
        const j = await r.json();
        const active = !!j.active;
        const plan = j.plan || null;
        setBilling({ loading: false, active, plan });
        const resolved = resolveCurrentPlan(plan);
        setCurrentKey(resolved.currentKey);
        setCurrentTerm(resolved.currentTerm);
      } catch (e) {
        console.error("billing.guard error", e);
        setBilling({ loading: false, active: false, plan: null });
        setCurrentKey(null);
        setCurrentTerm(null);
      }
    })();
  }, []);

  // load orders stats
  const loadOrdersStats = async () => {
    try {
      const r = await fetch("/api/orders/dashboard?days=30&codOnly=1", { credentials: "include" });
      if (!r.ok) throw new Error("bad status");
      const j = await r.json();

      const used = j?.totals?.count ?? 0;
      setPlanUsage({
        loading: false,
        ordersUsed: used,
        sinceLabel: "30 derniers jours (approx. période d'abonnement)",
      });

      const abandoned = j?.abandoned?.count ?? 0;
      const recovered = j?.recovered?.count ?? 0;

      setWaStats({
        loading: false,
        orders: used,
        abandoned,
        recovered,
      });
    } catch (e) {
      console.error("orders.dashboard error", e);
      setPlanUsage((prev) => ({ ...prev, loading: false }));
      setWaStats((prev) => ({ ...prev, loading: false }));
    }
  };

  // load WhatsApp LIVE status
  const loadWhatsAppLive = async () => {
    setWaLive((p) => ({ ...p, loading: true }));
    try {
      const r = await fetch("/api/whatsapp/status", { credentials: "include", cache: "no-store" });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data) throw new Error(data?.error || "WhatsApp status error");

      const connected = !!data.connected;
      const phoneNumber = data.phoneNumber || data?.whatsappStatus?.phoneNumber || data?.config?.phoneNumber || "";

      setWaLive({
        loading: false,
        connected,
        phoneNumber,
        lastConnected: data.lastConnected || data?.whatsappStatus?.connectedAt || null,
        users: data.users || null,
      });
    } catch (e) {
      console.error("wa status error", e);
      setWaLive((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    loadOrdersStats();
    loadWhatsAppLive();

    const t1 = setInterval(loadWhatsAppLive, 8000);
    const t2 = setInterval(loadOrdersStats, 12000);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  const isSubscribed = billing.active;

  // Billing functions
  async function openBilling(plan, term) {
    try {
      const u = new URL("/api/billing/request", window.location.origin);
      u.searchParams.set("plan", plan);
      u.searchParams.set("term", term);

      const res = await fetch(u.toString(), { method: "GET", credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        console.error("Billing request failed:", data);
        alert("Erreur lors de la création de l'abonnement. Regarde la console.");
        return;
      }
      window.top.location.href = data.confirmationUrl;
    } catch (e) {
      console.error(e);
      alert("Erreur réseau pendant la création du plan d'abonnement.");
    }
  }
  const handleBuyMonthly = (plan) => openBilling(plan, "monthly");
  const handleBuyAnnual = (plan) => openBilling(plan, "annual");

  const commonFeatureKeys = [
    "section0.features.1",
    "section0.features.2",
    "section0.features.3",
    "section0.features.4",
    "section0.features.5",
    "section0.features.6",
    "section0.features.7",
    "section0.features.8",
  ];

  return (
    <>
      {/* ===== Header (SLIM) ===== */}
      <div className="tf-header">
        <InlineStack align="space-between" blockAlign="center">
          {/* Left: logo + title + ONE video button */}
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
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontWeight: 800, color: "#F9FAFB", lineHeight: 1.05 }}>
                {t("section0.header.title")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.78)" }}>
                {t("section0.header.subtitle")}
              </div>

              {/* ✅ ONE button only */}
              <button
                type="button"
                className="tf-video-btn"
                onClick={() => {
                  // optional: open your global video page or youtube
                  // navigate("/app/help/video");  // if you have it
                }}
              >
                <span style={{ display: "inline-flex" }}>
                  <Icon source={PI.PlayIcon} />
                </span>
                <span>Video guide</span>
              </button>
            </div>
          </InlineStack>

          {/* Center flags */}
          <div className="tf-flags-wrap">
            <div className="tf-flags">
              <CountryFlagsBar />
            </div>
          </div>

          {/* Right: pill + language (extreme right) */}
          <div className="tf-header-right">
            <span className="tf-pill">{t("section0.header.pill")}</span>
            <LanguageSelector />
          </div>
        </InlineStack>
      </div>

      {/* ===== Grille 3 colonnes ===== */}
      <div className="tf-shell">
        <div className="tf-editor">
          {/* ✅ Colonne gauche: WhatsApp ONLY */}
          <div className="tf-rail">
            <WhatsAppMonitorPanel stats={waStats} wa={waLive} loading={waLive.loading} />
          </div>

          {/* Colonne milieu */}
          <div className="tf-right-col">
            <div className="tf-panel">
              <div className="tf-group-title">{t("section0.group.main")}</div>

              <div className="tf-tabs">
                <button
                  type="button"
                  className="tf-tab"
                  data-active={activeTab === "support" ? "1" : "0"}
                  onClick={() => setActiveTab("support")}
                >
                  {t("section0.tabs.support")}
                </button>
                <button
                  type="button"
                  className="tf-tab"
                  data-active={activeTab === "billing" ? "1" : "0"}
                  onClick={() => setActiveTab("billing")}
                >
                  {t("section0.tabs.billing")}
                </button>
              </div>

              {activeTab === "support" ? (
                <SmartSupportPanel />
              ) : (
                <>
                  <Card>
                    <div style={{ padding: 12 }}>
                      {billing.loading ? (
                        <Text as="p" tone="subdued">
                          {t("section0.billing.loading")}
                        </Text>
                      ) : isSubscribed ? (
                        <>
                          <Text as="p" variant="headingSm">
                            {t("section0.billing.active")}
                          </Text>
                          <Text as="p" tone="subdued" style={{ marginTop: 6 }}>
                            {billing.plan?.interval === "ANNUAL"
                              ? t("section0.billing.planAnnual")
                              : t("section0.billing.planMonthly")}{" "}
                            — {billing.plan?.amount} {billing.plan?.currency}
                            {billing.plan?.test ? " " + t("section0.billing.testMode") : ""}
                          </Text>
                        </>
                      ) : (
                        <Text as="p" tone="subdued">{t("section0.billing.none")}</Text>
                      )}
                    </div>
                  </Card>

                  {isSubscribed && (
                    <div style={{ marginTop: 12 }}>
                      <Banner tone="success" title={t("section0.banner.alreadySubscribed.title")}>
                        <p>{t("section0.banner.alreadySubscribed.body")}</p>
                      </Banner>
                    </div>
                  )}

                  <div className="pricing-grid">
                    <PlanCard
                      title={t("section0.plans.starter.title")}
                      monthly="0.99"
                      yearly="9.99"
                      yearlyPercent={16}
                      ordersLabel={t("section0.plans.starter.orders")}
                      features={[
                        "section0.features.1","section0.features.2","section0.features.3","section0.features.4",
                        "section0.features.5","section0.features.6","section0.features.7","section0.features.8",
                      ]}
                      planKey="starter"
                      onChooseMonthly={handleBuyMonthly}
                      onChooseAnnual={handleBuyAnnual}
                      currentKey={currentKey}
                      currentTerm={currentTerm}
                    />
                    <PlanCard
                      title={t("section0.plans.basic.title")}
                      monthly="4.99"
                      yearly="49"
                      yearlyPercent={18}
                      ordersLabel={t("section0.plans.basic.orders")}
                      features={commonFeatureKeys}
                      planKey="basic"
                      isPopular
                      onChooseMonthly={handleBuyMonthly}
                      onChooseAnnual={handleBuyAnnual}
                      currentKey={currentKey}
                      currentTerm={currentTerm}
                    />
                    <PlanCard
                      title={t("section0.plans.premium.title")}
                      monthly="9.99"
                      yearly="99"
                      yearlyPercent={17}
                      ordersLabel={t("section0.plans.premium.orders")}
                      features={commonFeatureKeys}
                      planKey="premium"
                      onChooseMonthly={handleBuyMonthly}
                      onChooseAnnual={handleBuyAnnual}
                      currentKey={currentKey}
                      currentTerm={currentTerm}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ✅ Colonne droite: PlanUsage TOP + Video BELOW */}
          <div className="tf-preview-col">
            <div className="tf-preview-card">
              <PlanUsageWidget
                isSubscribed={isSubscribed}
                planKey={currentKey}
                currentTerm={currentTerm}
                usage={planUsage}
              />
            </div>

            <div className="tf-preview-card">
              <SingleVideoPreview />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Section0Home() {
  return <Section0Inner />;
}
