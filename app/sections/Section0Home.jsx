// ===== File: app/sections/Section0Home.jsx =====
import React, { useEffect, useState } from "react";
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
import SmartSupportPanel from "../components/SmartSupportPanel"; // 👈 mini IA
import PlanUsageWidget from "../components/PlanUsageWidget"; // 👈 widget suivi plan
import { useI18n } from "../i18n/react";
import  LanguageSelector  from "../components/LanguageSelector";
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
  .tf-rail-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:10px;
  }
  .tf-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
  }
  .tf-rail-body { padding:12px; display:grid; gap:8px; }

  /* widget usage / diagramme de plan */
  .tf-usage-card {
    margin-top:14px;
    background:#ffffff;
    border-radius:10px;
    border:1px solid #E5E7EB;
    box-shadow:0 10px 24px rgba(15,23,42,0.12);
    padding:10px 12px 12px;
  }
  .tf-usage-title {
    font-size:13px;
    font-weight:700;
    margin-bottom:4px;
    color:#0F172A;
  }
  .tf-usage-sub {
    font-size:11px;
    color:#6B7280;
    margin-bottom:8px;
  }
  .tf-usage-row {
    display:flex;
    align-items:center;
    gap:10px;
  }
  .tf-usage-meta {
    font-size:12px;
    color:#111827;
    display:grid;
    gap:4px;
  }
  .tf-usage-pill {
    display:inline-flex;
    align-items:center;
    gap:4px;
    padding:3px 8px;
    border-radius:999px;
    font-size:11px;
    background:rgba(11,59,130,0.06);
    color:#0B3B82;
    border:1px solid rgba(11,59,130,0.18);
  }
  .tf-usage-value-main {
    font-size:18px;
    font-weight:800;
  }
  .tf-usage-value-sub {
    font-size:11px;
    color:#6B7280;
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

  /* hero preview à droite (centre vidéos) */
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
  .tf-video-title {
    font-size:13px;
    font-weight:600;
    color:#0F172A;
  }
  .tf-video-sub {
    font-size:11px;
    color:#6B7280;
  }
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
  .tf-video-duration {
    opacity:.75;
    color:#6B7280;
  }

  /* grille pricing */
  .pricing-grid {
    display:grid;
    grid-template-columns: repeat(3, minmax(260px, 1fr));
    gap:16px;
  }
  @media (max-width: 1100px) {
    .pricing-grid { grid-template-columns: 1fr; }
  }

  .badge {
    display:inline-block;
    padding:4px 10px;
    border-radius:999px;
    font-size:12px;
    border:1px solid #E5E7EB;
    background:#F9FAFB;
    color:#111827;
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

  /* cartes plan design "bande" */
  .plan-card {
    border-radius:16px;
    overflow:hidden;
    background:#ffffff;
    border:1px solid #e5e7eb;
    box-shadow:0 16px 40px rgba(15,23,42,0.16);
    display:flex;
    flex-direction:column;
    min-height:230px;
  }
  .plan-header {
    padding:8px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    color:#F9FAFB;
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .plan-header-title {
    font-weight:700;
    letter-spacing:.02em;
  }
  .plan-header-badges {
    display:flex;
    gap:6px;
    font-size:11px;
  }
  .plan-header-pill {
    padding:3px 8px;
    border-radius:999px;
    border:1px solid rgba(248,250,252,0.7);
    background:rgba(15,23,42,0.18);
  }
  .plan-body {
    padding:12px 14px 14px;
    display:grid;
    gap:10px;
    background:#f9fafb;
  }
  .plan-price-row {
    display:flex;
    align-items:flex-end;
    gap:10px;
    flex-wrap:wrap;
  }
  .plan-price-main {
    font-size:22px;
    font-weight:800;
    color:#0f172a;
  }
  .plan-price-sub {
    font-size:12px;
    color:#6b7280;
  }
  .plan-price-alt {
    font-size:13px;
    color:#111827;
  }
  .plan-footer-btns {
    display:flex;
    gap:8px;
    margin-top:6px;
  }

  @media (max-width: 1200px) {
    .tf-editor { grid-template-columns: 300px 2.2fr 1.4fr; }
  }
  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-preview-col { position:static; max-height:none; }
  }
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
            <div className="plan-price-sub">
              {t("section0.plans.price.perMonth")}
            </div>
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
          <Button
            onClick={() => onChooseAnnual(planKey)}
            fullWidth
            disabled={annualDisabled}
          >
            {annualDisabled
              ? t("section0.plans.btn.alreadyAnnual")
              : t("section0.plans.btn.chooseAnnual")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------- Preview visuel à droite : centre vidéos -------- */
function OverviewPreview() {
  const { t } = useI18n();

  const videos = [
    {
      key: "intro",
      title: t("section0.videos.item.intro.title"),
      sub: t("section0.videos.item.intro.sub"),
      tag: "Dashboard",
      duration: "2 min",
    },
    {
      key: "forms",
      title: t("section0.videos.item.forms.title"),
      sub: t("section0.videos.item.forms.sub"),
      tag: "Forms",
      duration: "4 min",
    },
    {
      key: "offers",
      title: t("section0.videos.item.offers.title"),
      sub: t("section0.videos.item.offers.sub"),
      tag: "Offers",
      duration: "3 min",
    },
    {
      key: "sheets",
      title: t("section0.videos.item.sheets.title"),
      sub: t("section0.videos.item.sheets.sub"),
      tag: "Sheets",
      duration: "3 min",
    },
    {
      key: "pixels",
      title: t("section0.videos.item.pixels.title"),
      sub: t("section0.videos.item.pixels.sub"),
      tag: "Pixels",
      duration: "3 min",
    },
    {
      key: "antibot",
      title: t("section0.videos.item.antibot.title"),
      sub: t("section0.videos.item.antibot.sub"),
      tag: "Anti-bot",
      duration: "2 min",
    },
    {
      key: "locations",
      title: t("section0.videos.item.locations.title"),
      sub: t("section0.videos.item.locations.sub"),
      tag: "Geo",
      duration: "3 min",
    },
  ];

  return (
    <div className="tf-hero">
      <div className="tf-hero-pill">
        <Icon source={PI.PlayIcon} />
        <span>{t("section0.videos.pill")}</span>
      </div>

      <Text as="h3" variant="headingMd">
        {t("section0.videos.title")}
      </Text>
      <Text
        as="p"
        tone="subdued"
        style={{
          marginTop: 4,
          fontSize: 12,
          color: "#6B7280",
        }}
      >
        {t("section0.videos.subtitle")}
      </Text>

      <div className="tf-video-list">
        {videos.map((v) => (
          <button
            key={v.key}
            type="button"
            className="tf-video-item"
            data-video-key={v.key}
            onClick={() => {
              // plus tard: window.open('https://youtube.com/…','_blank');
            }}
          >
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

/* ============================== Contenu Section0 avec i18n ============================== */
function Section0Inner() {
  useInjectCss();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("support");

  // État billing (récupéré via /api/billing/guard)
  const [billing, setBilling] = useState({
    loading: true,
    active: false,
    plan: null,
  });
  const [currentKey, setCurrentKey] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);

  // Suivi du nombre de commandes utilisées sur le plan (widget cercle)
  const [planUsage, setPlanUsage] = useState({
    loading: true,
    ordersUsed: 0,
    sinceLabel: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/billing/guard", {
          credentials: "include",
        });
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

  // Stats commandes
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          "/api/orders/dashboard?days=30&codOnly=1",
          { credentials: "include" }
        );
        if (!r.ok) throw new Error("bad status");
        const j = await r.json();
        const used = j?.totals?.count ?? 0;

        setPlanUsage({
          loading: false,
          ordersUsed: used,
          sinceLabel: "30 derniers jours (approx. période d'abonnement)",
        });
      } catch (e) {
        console.error("plan-usage (orders.dashboard) error", e);
        setPlanUsage((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  const sameOrigin = (p) => {
    try {
      return (
        new URL(p, window.location.origin).origin === window.location.origin
      );
    } catch {
      return false;
    }
  };
  const ping = async (p) => {
    if (typeof window === "undefined" || !sameOrigin(p)) return false;
    try {
      const res = await fetch(p, {
        method: "HEAD",
        cache: "no-store",
      });
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

  // Appels billing côté client
  async function openBilling(plan, term) {
    try {
      const u = new URL("/api/billing/request", window.location.origin);
      u.searchParams.set("plan", plan);
      u.searchParams.set("term", term);

      const res = await fetch(u.toString(), {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        console.error("Billing request failed:", data);
        alert(
          "Erreur lors de la création de l'abonnement. Regarde la console."
        );
        return;
      }

      const url = data.confirmationUrl;
      window.top.location.href = url;
    } catch (e) {
      console.error(e);
      alert("Erreur réseau pendant la création du plan d'abonnement.");
    }
  }

  const handleBuyMonthly = (plan) => openBilling(plan, "monthly");
  const handleBuyAnnual = (plan) => openBilling(plan, "annual");

  const PATHS = {
    forms: ["/app/sections/1", "/app/forms", "/forms", "/sections/1"],
    offers: ["/app/sections/2", "/app/offers", "/offers", "/sections/2"],
    sheets: [
      "/app/sections/3",
      "/app/google-sheets",
      "/google-sheets",
      "/sections/3",
    ],
    pixels: ["/app/sections/4", "/app/pixels", "/pixels", "/sections/4"],
    antibot: ["/app/sections/5", "/app/anti-bot", "/anti-bot", "/sections/5"],
    locations: [
      "/app/sections/6",
      "/app/locations",
      "/locations",
      "/sections/6",
    ],
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
                {t("section0.header.title")}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                {t("section0.header.subtitle")}
              </div>
            </div>
          </InlineStack>

          <InlineStack gap="200" blockAlign="center">
            <span
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(248,250,252,0.45)",
                color: "rgba(248,250,251,0.9)",
                background:
                  "linear-gradient(90deg,rgba(15,23,42,0.35),rgba(15,23,42,0.1))",
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
          {/* Colonne gauche : navigation simple + widget plan */}
          <div className="tf-rail">
            <div className="tf-rail-card">
              <div className="tf-rail-head">Navigation</div>
              <div className="tf-rail-body">
                <NavBtn
                  label={t("section0.nav.forms")}
                  iconKey="AppsIcon"
                  onClick={() => smartGo(PATHS.forms)}
                />
                <NavBtn
                  label={t("section0.nav.offers")}
                  iconKey="DiscountIcon"
                  onClick={() => smartGo(PATHS.offers)}
                />
                <NavBtn
                  label={t("section0.nav.sheets")}
                  iconKey="AnalyticsIcon"
                  onClick={() => smartGo(PATHS.sheets)}
                />
                <NavBtn
                  label={t("section0.nav.pixels")}
                  iconKey="TargetIcon"
                  onClick={() => smartGo(PATHS.pixels)}
                />
                <NavBtn
                  label={t("section0.nav.antibot")}
                  iconKey="ShieldIcon"
                  onClick={() => smartGo(PATHS.antibot)}
                />
                <NavBtn
                  label={t("section0.nav.locations")}
                  iconKey="GlobeIcon"
                  onClick={() => smartGo(PATHS.locations)}
                />
              </div>
            </div>

            {/* Widget cercle de suivi du plan */}
            <PlanUsageWidget
              isSubscribed={isSubscribed}
              planKey={currentKey}
              currentTerm={currentTerm}
              usage={planUsage}
            />
          </div>

          {/* Colonne milieu : Support / Billing tabs */}
          <div className="tf-right-col">
            <div className="tf-panel">
              <div className="tf-group-title">
                {t("section0.group.main")}
              </div>

              {/* Tabs */}
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
                <>
                  <SmartSupportPanel />
                </>
              ) : (
                <>
                  {/* Onglet Plans & billing */}
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
                          <Text
                            as="p"
                            tone="subdued"
                            style={{ marginTop: 6 }}
                          >
                            {billing.plan?.interval === "ANNUAL"
                              ? t("section0.billing.planAnnual")
                              : t("section0.billing.planMonthly")}{" "}
                            — {billing.plan?.amount} {billing.plan?.currency}
                            {billing.plan?.test
                              ? " " + t("section0.billing.testMode")
                              : ""}
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
                      <Banner
                        tone="success"
                        title={t(
                          "section0.banner.alreadySubscribed.title"
                        )}
                      >
                        <p>
                          {t("section0.banner.alreadySubscribed.body")}
                        </p>
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
                      features={commonFeatureKeys}
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

                  <BlockStack gap="200" style={{ marginTop: 16 }}>
                    <Card>
                      <div style={{ padding: 12 }}>
                        <InlineStack
                          align="space-between"
                          blockAlign="center"
                        >
                          <Text as="h3" variant="headingSm">
                            {t("section0.quickstart.title")}
                          </Text>
                        </InlineStack>
                        <BlockStack gap="100" style={{ marginTop: 8 }}>
                          <Text as="p">
                            {t("section0.quickstart.step1")}
                          </Text>
                          <Text as="p">
                            {t("section0.quickstart.step2")}
                          </Text>
                          <Text as="p">
                            {t("section0.quickstart.step3")}
                          </Text>
                        </BlockStack>
                      </div>
                    </Card>
                  </BlockStack>
                </>
              )}
            </div>
          </div>

          {/* Colonne droite : centre vidéos */}
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

/* ============================== Section0Home ============================== */
export default function Section0Home() {
  return <Section0Inner />;
}