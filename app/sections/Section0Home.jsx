// ===== File: app/sections/Section0Home.jsx =====
import React, { useEffect, useState } from "react";
import CountryFlagsBar from "../components/CountryFlagsBar";

import {
  Card,
  BlockStack,
  InlineStack,
  Button,
  Text,
  List,
  Icon,
  Banner,
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

  .tf-header {
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border-bottom:none;
    padding:12px 16px;
    position:sticky;
    top:0;
    z-index:40;
    box-shadow:0 10px 28px rgba(11,59,130,0.45);
  }
  .tf-shell { padding:16px; }

  /* 3 colonnes : gauche | milieu | droite */
  .tf-editor {
    display:grid;
    grid-template-columns: 340px 3fr 1.4fr;
    gap:16px;
    align-items:start;
  }

  /* colonne gauche (sticky) */
  .tf-rail {
    position:sticky;
    top:68px;
    max-height:calc(100vh - 84px);
    overflow:auto;
  }

  /* colonne milieu */
  .tf-right-col { display:grid; gap:16px; }
  .tf-panel   { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:12px; }

  /* colonne droite (preview) */
  .tf-preview-col {
    position:sticky;
    top:68px;
    max-height:calc(100vh - 84px);
    overflow:auto;
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

  /* hero preview à droite */
  .tf-hero {
    position:relative;
    border-radius:12px;
    padding:12px 12px 14px;
    background:#ffffff;
    color:#0F172A;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.10);
  }
  .tf-hero-pill {
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:4px 10px;
    border-radius:999px;
    font-size:11px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:none;
    color:#F9FAFB;
    margin-bottom:10px;
    box-shadow:0 6px 16px rgba(11,59,130,0.35);
  }

  /* Liste vidéos */
  .tf-video-list {
    margin-top:10px;
    display:flex;
    flex-direction:column;
    gap:8px;
  }
  .tf-video-item {
    width:100%;
    border-radius:12px;
    border:1px solid #E5E7EB;
    padding:8px 10px;
    display:flex;
    gap:10px;
    background:#F9FAFB;
    color:#0F172A;
    cursor:pointer;
    text-align:left;
    box-shadow:0 8px 18px rgba(15,23,42,0.07);
    transition:all .16s ease-out;
  }
  .tf-video-item:hover {
    background:#ffffff;
    transform:translateY(-1px);
    border-color:rgba(11,59,130,0.3);
    box-shadow:0 12px 26px rgba(15,23,42,0.14);
  }
  .tf-video-thumb {
    width:46px;
    height:32px;
    border-radius:10px;
    background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.25),transparent 55%),
               linear-gradient(135deg,#EF4444,#7F1D1D);
    display:flex;
    align-items:center;
    justify-content:center;
    box-shadow:0 6px 18px rgba(15,23,42,0.35);
    color:#F9FAFB;
    font-size:18px;
    font-weight:700;
  }
  .tf-video-meta {
    flex:1;
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:2px;
  }
  .tf-video-title { font-size:13px; font-weight:600; color:#0F172A; }
  .tf-video-sub { font-size:11px; color:#6B7280; }
  .tf-video-footer {
    margin-top:2px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:6px;
    font-size:10px;
  }
  .tf-video-tag {
    padding:2px 8px;
    border-radius:999px;
    border:1px solid rgba(148,163,184,0.9);
    background:#ffffff;
    color:#0F172A;
  }
  .tf-video-duration { opacity:.75; color:#6B7280; }

  /* grille pricing */
  .pricing-grid {
    display:grid;
    grid-template-columns: repeat(3, minmax(260px, 1fr));
    gap:16px;
  }
  @media (max-width: 1100px) { .pricing-grid { grid-template-columns: 1fr; } }

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

  /* Flags bar (header center) - FIX */
  .tf-flags{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    padding:6px 10px;
    max-width:720px;
    overflow-x:auto;
    white-space:nowrap;
    scrollbar-width:none;
    -webkit-overflow-scrolling: touch;
  }
  .tf-flags::-webkit-scrollbar{ display:none; }
  .tf-flag-item{
    flex:0 0 auto;
    display:flex;
    align-items:center;
  }
  /* si ton CountryFlagsBar utilise des spans/emoji */
  .tf-flags span{ font-size:18px; line-height:1; }
  /* si ton CountryFlagsBar utilise des images */
  .tf-flags img{ width:22px; height:16px; border-radius:3px; display:block; }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-preview-col { position:static; max-height:none; }
    .tf-flags{ max-width:240px; gap:6px; }
    .tf-flags span{ font-size:16px; }
    .tf-flags img{ width:20px; height:14px; }
  }

  /* ===== WhatsApp Monitor (new: same style as plan widget) ===== */
  .wa-card{
    margin-bottom:14px;
    background:#ffffff;
    border-radius:10px;
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
  .wa-dot{
    position:absolute;
    top:-6px; right:-6px;
    width:18px; height:18px;
    border-radius:999px;
    background:#EF4444;
    color:#fff;
    border:2px solid #fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:10px;
    font-weight:900;
  }
  .wa-title{
    display:flex;
    flex-direction:column;
    min-width:0;
    gap:2px;
  }
  .wa-title b{ font-size:13px; color:#0F172A; }
  .wa-title span{ font-size:11px; color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

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
      try {
        t.remove();
      } catch {}
    };
  }, []);
}

/* ======================= SAFE ICON helper ======================= */
function SafeIcon({ name, fallback = "AppsIcon", tone }) {
  const src = PI?.[name] || PI?.[fallback];
  if (!src) return null;
  return <Icon source={src} tone={tone} />;
}

/* ============================== Small helpers ============================== */
function NavBtn({ label, iconKey, onClick }) {
  const src = PI[iconKey] || PI.AppsIcon;
  return (
    <Button fullWidth onClick={onClick}>
      <InlineStack gap="200" blockAlign="center">
        <Icon source={src} />
        <span>{label}</span>
      </InlineStack>
    </Button>
  );
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
          {isPopular && (
            <span className="plan-header-pill">
              {t("section0.plans.badge.popular")}
            </span>
          )}
          {isCurrent && (
            <span className="plan-header-pill">
              {t("section0.plans.badge.current")}
            </span>
          )}
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
            <div className="plan-price-sub">
              {t("section0.plans.price.saving", { percent: yearlyPercent })}
            </div>
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
            {monthlyDisabled
              ? t("section0.plans.btn.alreadyMonthly")
              : t("section0.plans.btn.chooseMonthly")}
          </Button>
          <Button onClick={() => onChooseAnnual(planKey)} fullWidth disabled={annualDisabled}>
            {annualDisabled
              ? t("section0.plans.btn.alreadyAnnual")
              : t("section0.plans.btn.chooseAnnual")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ====================== WhatsApp Monitor (compact + pro) ====================== */
function WhatsAppMonitorPanel({ stats, onGoSheets }) {
  const orders = Number(stats?.orders || 0);
  const abandoned = Number(stats?.abandoned || 0);
  const recovered = Number(stats?.recovered || 0);
  const subtotal = Number(stats?.subtotal || 0);
  const shipping = stats?.shipping ?? "Free";
  const total = Number(stats?.total || 0);
  const waUnread = Number(stats?.waUnread || 6);
  const currency = stats?.currency || "MAD";

  return (
    <div className="wa-card">
      <div className="wa-head">
        <div className="wa-head-left">
          <div className="wa-logo" title="WhatsApp">
            {/* WhatsApp icon green */}
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
            <div className="wa-dot">{waUnread}</div>
          </div>

          <div className="wa-title">
            <b>WhatsApp Monitor</b>
            <span>Orders, carts & recovery</span>
          </div>
        </div>

        {/* Button settings -> Sheets */}
        <Button
          icon={PI.SettingsIcon}
          onClick={onGoSheets}
          accessibilityLabel="Open Google Sheets settings"
        >
          Sheets
        </Button>
      </div>

      <div className="wa-body">
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

        <div className="wa-mini">
          <div className="wa-mini-line">
            <span>Subtotal</span>
            <b>
              {currency} {subtotal.toFixed(2)}
            </b>
          </div>
          <div className="wa-mini-line">
            <span>Shipping</span>
            <b>{shipping}</b>
          </div>
          <div className="wa-mini-line">
            <span>Total</span>
            <b>
              {currency} {total.toFixed(2)}
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Preview visuel à droite : centre vidéos -------- */
function OverviewPreview() {
  const { t } = useI18n();

  const videos = [
    { key: "intro", title: t("section0.videos.item.intro.title"), sub: t("section0.videos.item.intro.sub"), tag: "Dashboard", duration: "2 min" },
    { key: "forms", title: t("section0.videos.item.forms.title"), sub: t("section0.videos.item.forms.sub"), tag: "Forms", duration: "4 min" },
    { key: "offers", title: t("section0.videos.item.offers.title"), sub: t("section0.videos.item.offers.sub"), tag: "Offers", duration: "3 min" },
    { key: "sheets", title: t("section0.videos.item.sheets.title"), sub: t("section0.videos.item.sheets.sub"), tag: "Sheets", duration: "3 min" },
    { key: "pixels", title: t("section0.videos.item.pixels.title"), sub: t("section0.videos.item.pixels.sub"), tag: "Pixels", duration: "3 min" },
    { key: "antibot", title: t("section0.videos.item.antibot.title"), sub: t("section0.videos.item.antibot.sub"), tag: "Anti-bot", duration: "2 min" },
    { key: "locations", title: t("section0.videos.item.locations.title"), sub: t("section0.videos.item.locations.sub"), tag: "Geo", duration: "3 min" },
  ];

  return (
    <div className="tf-hero">
      <div className="tf-hero-pill">
        <Icon source={PI.PlayIcon} />
        <span>{t("section0.videos.pill")}</span>
      </div>

      <Text as="h3" variant="headingMd">{t("section0.videos.title")}</Text>
      <Text as="p" tone="subdued" style={{ marginTop: 4, fontSize: 12, color: "#6B7280" }}>
        {t("section0.videos.subtitle")}
      </Text>

      <div className="tf-video-list">
        {videos.map((v) => (
          <button key={v.key} type="button" className="tf-video-item" onClick={() => {}}>
            <div className="tf-video-thumb">▶</div>
            <div className="tf-video-meta">
              <div className="tf-video-title">{v.title}</div>
              <div className="tf-video-sub">{v.sub}</div>
              <div className="tf-video-footer">
                <span className="tf-video-tag">{v.tag}</span>
                <span className="tf-video-duration">{v.duration}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================== Contenu Section0 ============================== */
function Section0Inner() {
  useInjectCss();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("support");

  const [billing, setBilling] = useState({ loading: true, active: false, plan: null });
  const [currentKey, setCurrentKey] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  const [planUsage, setPlanUsage] = useState({ loading: true, ordersUsed: 0, sinceLabel: null });

  const [waStats, setWaStats] = useState({
    loading: true,
    orders: 0,
    abandoned: 0,
    recovered: 0,
    subtotal: 9.99,
    shipping: "Free",
    total: 9.99,
    currency: "MAD",
    waUnread: 6,
  });

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

  useEffect(() => {
    (async () => {
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

        const abandoned = j?.abandoned?.count ?? 42;
        const recovered = j?.recovered?.count ?? 12;
        const subtotal = j?.totals?.subtotal ?? 9.99;
        const total = j?.totals?.total ?? subtotal;
        const currency = j?.totals?.currency ?? "MAD";

        setWaStats((prev) => ({
          ...prev,
          loading: false,
          orders: used,
          abandoned,
          recovered,
          subtotal: Number(subtotal || 0),
          total: Number(total || 0),
          currency,
        }));
      } catch (e) {
        console.error("orders.dashboard error", e);
        setPlanUsage((prev) => ({ ...prev, loading: false }));
        setWaStats((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  const sameOrigin = (p) => {
    try {
      return new URL(p, window.location.origin).origin === window.location.origin;
    } catch {
      return false;
    }
  };
  const ping = async (p) => {
    if (typeof window === "undefined" || !sameOrigin(p)) return false;
    try {
      const res = await fetch(p, { method: "HEAD", cache: "no-store" });
      return res.ok;
    } catch {
      return false;
    }
  };
  const smartGo = async (candidates) => {
    for (const p of candidates) {
      if (await ping(p)) {
        navigate(p);
        return;
      }
    }
    navigate(candidates[0]);
  };

  const PATHS = {
    forms: ["/app/sections/1", "/app/forms", "/forms", "/sections/1"],
    offers: ["/app/sections/2", "/app/offers", "/offers", "/sections/2"],
    sheets: ["/app/sections/3", "/app/google-sheets", "/google-sheets", "/sections/3"],
    pixels: ["/app/sections/4", "/app/pixels", "/pixels", "/sections/4"],
    antibot: ["/app/sections/5", "/app/anti-bot", "/anti-bot", "/sections/5"],
    locations: ["/app/sections/6", "/app/locations", "/locations", "/sections/6"],
  };

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

  const isSubscribed = billing.active;

  // Billing functions conservées (pas touchées)
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

  return (
    <>
      {/* ===== Header ===== */}
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
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#F9FAFB" }}>{t("section0.header.title")}</div>
              <div style={{ fontSize: 12, color: "rgba(249,250,251,0.8)" }}>{t("section0.header.subtitle")}</div>
            </div>
          </InlineStack>

          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <CountryFlagsBar />
          </div>

          <InlineStack gap="200" blockAlign="center">
            <span
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(248,250,252,0.45)",
                color: "rgba(248,250,251,0.9)",
                background: "linear-gradient(90deg,rgba(15,23,42,0.35),rgba(15,23,42,0.1))",
              }}
            >
              {t("section0.header.pill")}
            </span>
            <LanguageSelector />
          </InlineStack>
        </InlineStack>
      </div>

      {/* ===== Grille 3 colonnes ===== */}
      <div className="tf-shell">
        <div className="tf-editor">
          {/* Colonne gauche */}
          <div className="tf-rail">
            <WhatsAppMonitorPanel
              stats={waStats}
              onGoSheets={() => smartGo(PATHS.sheets)}
            />

            <PlanUsageWidget
              isSubscribed={isSubscribed}
              planKey={currentKey}
              currentTerm={currentTerm}
              usage={planUsage}
            />
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

                  <div className="pricing-grid" style={{ marginTop: 12 }}>
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

          {/* Colonne droite */}
          <div className="tf-preview-col">
            <div className="tf-preview-card">
              <OverviewPreview />
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
