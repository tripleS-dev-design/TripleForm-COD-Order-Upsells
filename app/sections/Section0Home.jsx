// ===== File: app/sections/Section0Home.jsx =====
import React, { useEffect, useMemo, useState } from "react";
import CountryFlagsBar from "../components/CountryFlagsBar";

import {
  Card,
  Button,
  Text,
  List,
  Icon,
  Banner,
  Badge,
  Spinner,
  Modal,
  TextField,
  InlineStack,
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

  /* ✅ HEADER SLIM (same feeling as Section Form) */
  .tf-header{
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:6px 10px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.35);
  }

  /* ✅ force 1 slim row: left | center | right */
  .tf-header-row{
    display:grid;
    grid-template-columns: auto 1fr auto;
    align-items:center;
    gap:10px;
    min-height:44px;
  }

  .tf-brand{
    display:flex;
    align-items:center;
    gap:10px;
    min-width:0;
  }
  .tf-brand-text{
    display:flex;
    flex-direction:column;
    min-width:0;
    line-height:1.05;
  }
  .tf-brand-title{
    font-weight:900;
    color:#F9FAFB;
    font-size:13px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .tf-brand-sub{
    font-size:11px;
    color:rgba(249,250,251,0.78);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  /* ✅ small video pill (NOT under title -> keeps header slim) */
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
    font-weight:800;
    white-space:nowrap;
    line-height:1;
  }
  .tf-video-btn:hover{
    transform:translateY(-1px);
    background:rgba(255,255,255,0.14);
    border-color:rgba(255,255,255,0.30);
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

  /* =================== RIGHT CONTROLS (EXTREME RIGHT) =================== */
  .tf-header-right{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap:10px;
    min-width:0;
  }
  .tf-pill{
    font-size:12px;
    padding:5px 10px;
    border-radius:999px;
    border:1px solid rgba(248,250,252,0.40);
    color:rgba(248,250,251,0.92);
    background:linear-gradient(90deg,rgba(15,23,42,0.30),rgba(15,23,42,0.08));
    white-space:nowrap;
    line-height:1;
  }

  .tf-shell { padding:16px; }

  /* ✅ FIX: remove big empty space at bottom when UI scale < 1 */
  @media (min-width: 900px){
    .tf-shell-fill{
      background:#F6F7F9;
      min-height: calc((100vh - 84px) / var(--tf-ui-scale));
      box-sizing: border-box;
    }
  }


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
    top:56px;
    max-height:calc(100vh - 72px);
    overflow:auto;
  }

  /* colonne milieu */
  .tf-right-col { display:grid; gap:16px; }
  .tf-panel   { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  /* colonne droite (preview) */
  .tf-preview-col {
    position:sticky;
    top:56px;
    max-height:calc(100vh - 72px);
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

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-preview-col { position:static; max-height:none; }

    .tf-flags{ max-width:240px; gap:8px; padding:6px 10px; }
    .tf-pill{ display:none; }
    .tf-brand-sub{ display:none; }
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
    cursor:pointer;
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

  /* ✅ video iframe (Modal) */
  .tf-yt-wrap{
    width:100%;
    border-radius:12px;
    overflow:hidden;
    background:#000;
    border:1px solid rgba(148,163,184,0.25);
  }
  .tf-yt-ratio{
    position:relative;
    width:100%;
    padding-top:56.25%;
  }
  .tf-yt-iframe{
    position:absolute;
    top:0; left:0;
    width:100%;
    height:100%;
    border:0;
  }
`;

/* ======================= helpers ======================= */
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

/* ======================= ✅ Crisp Chat (inject once) ======================= */
function useCrispChat(websiteId) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.$crisp = window.$crisp || [];
    window.CRISP_WEBSITE_ID = websiteId;

    if (document.getElementById("crisp-chat-script")) return;

    const s = document.createElement("script");
    s.id = "crisp-chat-script";
    s.type = "text/javascript";
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
  }, [websiteId]);
}

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ======================= ✅ YouTube parsing ======================= */
function extractYouTubeId(input) {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // already embed url?
  const embedMatch = raw.match(/\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embedMatch?.[1]) return embedMatch[1];

  try {
    const u = new URL(raw);

    // youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    // youtube.com/watch?v=ID
    if (u.searchParams?.get("v")) return u.searchParams.get("v");

    // youtube.com/shorts/ID
    if (u.pathname.includes("/shorts/")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("shorts");
      return parts[idx + 1] || null;
    }

    // youtube.com/embed/ID
    if (u.pathname.includes("/embed/")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("embed");
      return parts[idx + 1] || null;
    }
  } catch {
    // if not a valid URL, try a direct id
    if (/^[a-zA-Z0-9_-]{6,}$/.test(raw)) return raw;
  }

  return null;
}

function toYouTubeEmbedUrl(input, { autoplay = true } = {}) {
  const id = extractYouTubeId(input);
  if (!id) return null;
  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("rel", "0");
  params.set("modestbranding", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/* -------- Plan courant: mapping interval+amount -> planKey -------- */
const PLAN_MAP = {
  EVERY_30_DAYS: { 0.99: "starter", 9.99: "basic", 19.99: "premium" },
  ANNUAL: { 9.99: "starter", 83.99: "basic", 167.99: "premium" },
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
                {loading ? "Loading live status..." : connected ? phoneNumber || "—" : "Scan QR from WhatsApp settings"}
              </div>
            </div>
          </div>

          {loading ? <Spinner size="small" /> : connected ? (
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

/* ✅ Single global video preview (one only) */
function SingleVideoPreview({ onOpen }) {
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
        <div className="tf-video-screen" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen?.()}>
          <div className="tf-video-play">▶</div>
        </div>
        <div className="tf-video-hero-title">
          {t?.("section0.videos.item.intro.title") || "Introduction - Full walkthrough"}
        </div>
        <div className="tf-video-hero-sub">
          {t?.("section0.videos.item.intro.sub") ||
            "Installation, settings, sheets, pixels, anti-bot, WhatsApp (one complete guide)."}
        </div>

        <div style={{ marginTop: 10 }}>
          <Button onClick={onOpen} fullWidth variant="primary">
            Watch now
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Contenu Section0 ============================== */
function Section0Inner() {
  useInjectCss();

  // ✅ Crisp (Home only). If you want it on ALL pages, move this hook to app/root.jsx
  useCrispChat("7ea27a85-6b6c-4a48-8381-6c0fdc94c1ea");

  const navigate = useNavigate();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("billing");

  const [billing, setBilling] = useState({ loading: true, active: false, plan: null });
  const [currentKey, setCurrentKey] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [planUsage, setPlanUsage] = useState({ loading: true, ordersUsed: 0, sinceLabel: null });

  const [waStats, setWaStats] = useState({ loading: true, orders: 0, abandoned: 0, recovered: 0 });

  const [waLive, setWaLive] = useState({
    loading: true,
    connected: false,
    phoneNumber: "",
    lastConnected: null,
    users: null,
  });

  /* ✅ VIDEO SETTINGS (editable from interface) */
  const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=rSNBF-Kh8kk";
  const LS_KEY = "tf_home_video_url";

  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [videoDraft, setVideoDraft] = useState(DEFAULT_VIDEO_URL);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const [videoSaving, setVideoSaving] = useState(false);
  const [videoBanner, setVideoBanner] = useState(null); // {tone, title, body}

  const embedUrl = useMemo(() => toYouTubeEmbedUrl(videoUrl, { autoplay: true }), [videoUrl]);

  const openVideo = () => setVideoModalOpen(true);
  const closeVideo = () => setVideoModalOpen(false);

  // Load saved video (localStorage first, + optional API if exists)
  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) try API (optional)
      try {
        const r = await fetch("/api/settings/home-video", { credentials: "include", cache: "no-store" });
        if (r.ok) {
          const j = await r.json().catch(() => null);
          if (mounted && j?.url) {
            setVideoUrl(j.url);
            setVideoDraft(j.url);
            return;
          }
        }
      } catch {
        // ignore if route doesn't exist
      }

      // 2) localStorage fallback
      try {
        const saved = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
        if (mounted && saved) {
          setVideoUrl(saved);
          setVideoDraft(saved);
        }
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function saveVideoUrl() {
    const cleaned = String(videoDraft || "").trim();
    const testEmbed = toYouTubeEmbedUrl(cleaned, { autoplay: false });

    if (!testEmbed) {
      setVideoBanner({
        tone: "critical",
        title: "Invalid YouTube link",
        body: "Please paste a valid YouTube URL (watch?v=..., youtu.be/..., shorts/...).",
      });
      return;
    }

    setVideoSaving(true);
    setVideoBanner(null);

    // local save
    try {
      window.localStorage.setItem(LS_KEY, cleaned);
    } catch {}

    // update UI immediately
    setVideoUrl(cleaned);

    // optional API save (if you later create it)
    try {
      await fetch("/api/settings/home-video", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleaned }),
      }).catch(() => null);
    } catch {}

    setVideoSaving(false);
    setVideoBanner({
      tone: "success",
      title: "Saved",
      body: "Video link updated successfully.",
    });
  }

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

  // ✅ usage quota (mois courant) = /api/plan-usage
  const loadPlanUsage = async () => {
    setPlanUsage((p) => ({ ...p, loading: true }));

    try {
      const r = await fetch("/api/plan-usage", { credentials: "include", cache: "no-store" });
      const j = await r.json().catch(() => null);

      if (!r.ok || !j?.ok) throw new Error(j?.error || "plan-usage error");

      setPlanUsage({
        loading: false,
        ordersUsed: j.ordersUsed ?? 0,
        ordersLimit: j.ordersLimit ?? null,
        unlimited: !!j.unlimited,
        remaining: j.remaining ?? null,
        monthKey: j.monthKey ?? null,
        nextPlanKey: j.nextPlanKey ?? null,
        sinceLabel: j.sinceLabel ?? null,
        planKey: j.planKey ?? null,
        term: j.term ?? null,
        isSubscribed: !!j.isSubscribed,
      });
    } catch (e) {
      console.error("plan-usage error", e);
      setPlanUsage((prev) => ({ ...prev, loading: false }));
    }
  };

  // ✅ WhatsApp dashboard stats = /api/orders/dashboard
  const loadOrdersStats = async () => {
    try {
      const r = await fetch("/api/orders/dashboard?days=30&codOnly=1", { credentials: "include" });
      if (!r.ok) throw new Error("bad status");
      const j = await r.json();

      const used = j?.totals?.count ?? 0;
      const abandoned = j?.abandoned?.count ?? 0;
      const recovered = j?.recovered?.count ?? 0;

      setWaStats({ loading: false, orders: used, abandoned, recovered });
    } catch (e) {
      console.error("orders.dashboard error", e);
      setWaStats((prev) => ({ ...prev, loading: false }));
    }
  };

  // ✅ load WhatsApp LIVE status
  const loadWhatsAppLive = async () => {
    setWaLive((p) => ({ ...p, loading: true }));
    try {
      const r = await fetch("/api/whatsapp/status", { credentials: "include", cache: "no-store" });
      const data = await r.json().catch(() => null);
      if (!r.ok || !data) throw new Error(data?.error || "WhatsApp status error");

      const connected = !!(data?.config && data?.config?.phoneNumber);

      const phoneNumber =
        data?.config?.phoneNumber ||
        data?.phoneNumber ||
        data?.whatsappStatus?.phoneNumber ||
        "";

      setWaLive({
        loading: false,
        connected,
        phoneNumber,
        lastConnected: data?.lastConnected || data?.whatsappStatus?.connectedAt || null,
        users: data?.users || null,
      });
    } catch (e) {
      console.error("wa status error", e);
      setWaLive((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    loadPlanUsage();
    loadOrdersStats();
    loadWhatsAppLive();

    const t1 = setInterval(loadWhatsAppLive, 8000);
    const t2 = setInterval(loadOrdersStats, 12000);
    const t3 = setInterval(loadPlanUsage, 12000);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  const isSubscribed = billing.active;

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
      {/* ✅ VIDEO POPUP MODAL */}
      <Modal
        open={videoModalOpen}
        onClose={closeVideo}
        title="Video guide"
        primaryAction={{
          content: "Close",
          onAction: closeVideo,
        }}
      >
        <Modal.Section>
          {!embedUrl ? (
            <Banner tone="critical" title="Invalid YouTube link">
              <p>Please update the link from the interface (right panel).</p>
            </Banner>
          ) : (
            <div className="tf-yt-wrap">
              <div className="tf-yt-ratio">
                <iframe
                  className="tf-yt-iframe"
                  src={embedUrl}
                  title="TripleForm COD - Video guide"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <Text as="p" tone="subdued">
              Current link: <b>{videoUrl}</b>
            </Text>
          </div>
        </Modal.Section>
      </Modal>

      {/* ===== Header (SLIM) ===== */}
      <div className="tf-header">
        <div className="tf-header-row">
          {/* LEFT */}
          <div className="tf-brand">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(11,59,130,0.55)",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "linear-gradient(135deg,#0B3B82,#7D0031)",
                flex: "0 0 auto",
              }}
            >
              <img
                src="/tripleform-cod-icon.png"
                alt="TripleForm COD"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>

            <div className="tf-brand-text">
              <div className="tf-brand-title">{t("section0.header.title")}</div>
              <div className="tf-brand-sub">{t("section0.header.subtitle")}</div>
            </div>

            {/* ✅ OPEN POPUP VIDEO */}
            <button type="button" className="tf-video-btn" onClick={openVideo}>
              <span style={{ display: "inline-flex" }}>
                <Icon source={PI.PlayIcon} />
              </span>
              <span>Video guide</span>
            </button>
          </div>

          {/* CENTER */}
          <div className="tf-flags-wrap">
            <div className="tf-flags">
              <CountryFlagsBar />
            </div>
          </div>

          {/* RIGHT */}
          <div className="tf-header-right">
            <span className="tf-pill">{t("section0.header.pill")}</span>
            <LanguageSelector />
          </div>
        </div>
      </div>

      {/* ===== Grille 3 colonnes ===== */}
      <div className="tf-shell tf-shell-fill">
        <div className="tf-editor">
          {/* Colonne gauche: WhatsApp ONLY */}
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
                        <Text as="p" tone="subdued">
                          {t("section0.billing.none")}
                        </Text>
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
                        "section0.features.1",
                        "section0.features.2",
                        "section0.features.3",
                        "section0.features.4",
                        "section0.features.5",
                        "section0.features.6",
                        "section0.features.7",
                        "section0.features.8",
                      ]}
                      planKey="starter"
                      onChooseMonthly={handleBuyMonthly}
                      onChooseAnnual={handleBuyAnnual}
                      currentKey={currentKey}
                      currentTerm={currentTerm}
                    />
                    <PlanCard
                      title={t("section0.plans.basic.title")}
                      monthly="9.99"
                      yearly="83.99"
                      yearlyPercent={30}
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
                      monthly="19.99"
                      yearly="167.99"
                      yearlyPercent={30}
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

          {/* Colonne droite */}
          <div className="tf-preview-col">
            <div className="tf-preview-card">
              <PlanUsageWidget
                isSubscribed={isSubscribed}
                planKey={planUsage?.planKey || currentKey}
                currentTerm={planUsage?.term || currentTerm}
                usage={planUsage}
              />
            </div>

            {/* ✅ VIDEO PREVIEW + SETTINGS */}
            <div className="tf-preview-card">
              <SingleVideoPreview onOpen={openVideo} />

              <div style={{ marginTop: 12 }}>
                {videoBanner ? (
                  <div style={{ marginBottom: 10 }}>
                    <Banner tone={videoBanner.tone} title={videoBanner.title}>
                      <p>{videoBanner.body}</p>
                    </Banner>
                  </div>
                ) : null}

                <Card>
                  <div style={{ padding: 12 }}>
                    <Text as="p" variant="headingSm">
                      Video link (Home)
                    </Text>
                    <div style={{ marginTop: 10 }}>
                      <TextField
                        label="YouTube URL"
                        value={videoDraft}
                        onChange={(v) => setVideoDraft(v)}
                        autoComplete="off"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                   

                    <div style={{ marginTop: 8 }}>
                      <Text as="p" tone="subdued">
                        Tip: click “Video guide” in the header to open the popup.
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
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
