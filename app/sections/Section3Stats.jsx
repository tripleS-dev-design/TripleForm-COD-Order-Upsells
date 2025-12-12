// ===== File: app/sections/Section3Stats.jsx =====
import React, { useEffect, useState } from "react";
import {
  BlockStack,
  Card,
  Checkbox,
  InlineStack,
  Select,
  Text,
  Button,
  Spinner,
  Badge,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

/* ================== CSS ================== */
const STATS_CSS = `
  .tf-stats-shell {
    padding: 16px;
    background:#F6F7F9;
  }
  .tf-stats-grid {
    display:grid;
    grid-template-columns: 260px minmax(0,1.4fr) 340px;
    gap:16px;
    align-items:flex-start;
  }
  @media (max-width: 1100px){
    .tf-stats-grid { grid-template-columns: 1fr; }
  }

  .tf-stats-hero {
    margin-bottom: 16px;
    padding: 14px 18px;
    border-radius: 14px;
    background:linear-gradient(90deg,#1D4ED8 0%,#7C3AED 50%,#EC4899 100%);
    color:#F9FAFB;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:18px;
  }
  .tf-stats-hero-left { max-width: 520px; }
  .tf-stats-hero-title {
    font-size:16px;
    font-weight:800;
    letter-spacing:.08em;
    text-transform:uppercase;
    opacity:.95;
  }
  .tf-stats-hero-sub {
    font-size:13px;
    opacity:.9;
    margin-top:4px;
  }
  .tf-stats-hero-pill {
    padding:3px 10px;
    background:rgba(15,23,42,.22);
    border-radius:999px;
    font-size:11px;
    font-weight:700;
    border:1px solid rgba(248,250,252,.38);
  }

  .tf-stats-rail-card,
  .tf-stats-main-card,
  .tf-stats-side-card {
    background:#fff;
    border-radius:10px;
    border:1px solid #E5E7EB;
  }
  .tf-stats-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
  }
  .tf-stats-rail-list {
    padding:8px; display:grid; gap:8px;
  }
  .tf-stats-rail-item {
    border-radius:10px;
    border:1px solid #E5E7EB;
    background:#fff;
    padding:8px 10px;
    display:grid;
    grid-template-columns:24px 1fr;
    align-items:center;
    gap:8px;
  }

  .tf-stats-main-card { padding:12px; }
  .tf-stats-side-card { padding:12px; }

  .tf-stats-table {
    width:100%;
    border-collapse:separate;
    border-spacing:0;
    font-size:12px;
  }
  .tf-stats-table th,
  .tf-stats-table td {
    border:1px solid #E5E7EB;
    padding:6px 8px;
    white-space:nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
  .tf-stats-table th {
    background:#F3F4F6;
    font-weight:600;
  }

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }
`;

function useInjectStatsCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-stats-css")) return;
    const s = document.createElement("style");
    s.id = "tf-stats-css";
    s.appendChild(document.createTextNode(STATS_CSS));
    document.head.appendChild(s);
  }, []);
}

/* ================== Helpers ================== */

// fallback colonnes si on n'arrive pas à lire la config Sheets
const DEFAULT_COLUMNS = [
  { id: "c1", header: "Date", appField: "order.date" },
  { id: "c2", header: "Order ID", appField: "order.id" },
  { id: "c3", header: "Client", appField: "customer.name" },
  { id: "c4", header: "Téléphone", appField: "customer.phone" },
  { id: "c5", header: "Ville", appField: "customer.city" },
];

const RANGE_OPTIONS = [
  { label: "7 jours", value: "7" },
  { label: "15 jours", value: "15" },
  { label: "30 jours", value: "30" },
  { label: "60 jours", value: "60" },
];

const STATUS_OPTIONS = [
  { label: "—", value: "none" },
  { label: "Nouvelle", value: "new" },
  { label: "En route / en cours", value: "in_transit" },
  { label: "Livrée", value: "delivered" },
  { label: "Refusée / annulée", value: "rejected" },
];

function formatMoneyFromCents(cents, currency) {
  const value = (Number(cents || 0) || 0) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "MAD",
  }).format(value);
}

// mapping des champs pour la table (basé sur json.latest de /api/orders/dashboard)
function getFieldValue(order, appField) {
  if (!order) return "—";

  // si ton backend envoie order.fields["customer.phone"], etc.
  if (order.fields && order.fields[appField] !== undefined) {
    return order.fields[appField];
  }

  switch (appField) {
    /* ====== COMMANDE ====== */
    case "order.date":
      return order.dateLabel || (order.createdAt || "").slice(0, 10) || "—";
    case "order.id":
      return order.name || order.shortId || order.id || "—";

    /* ====== CLIENT ====== */
    case "customer.name":
      return order.customerName || order.customer || "—";
    case "customer.phone":
      return order.customerPhone || order.phone || "—";
    case "customer.city":
      return order.city || order.customerCity || "—";
    case "customer.province":
      return order.province || order.region || order.customerProvince || "—";
    case "customer.country":
      return order.country || order.countryCode || order.customerCountry || "—";

    /* ====== PRODUIT / VARIANTE / OFFRES ====== */
    case "cart.productTitle":
      return order.productTitle || order.mainProductTitle || "—";
    case "cart.variantTitle":
      return order.variantTitle || order.mainVariantTitle || "—";
    case "cart.offerName":
      return order.offerName || order.bundleName || "—";
    case "cart.upsellName":
      return order.upsellName || "—";

    /* ====== PANIER & MONTANTS ====== */
    case "cart.quantity":
      return order.quantity || order.totalItems || "—";

    case "cart.total": {
      // total “classique” que tu utilisais déjà
      return formatMoneyFromCents(order.totalCents, order.currency);
    }

    case "cart.subtotal": {
      const cents =
        order.subtotalCents !== undefined
          ? order.subtotalCents
          : order.totalCents;
      return formatMoneyFromCents(cents, order.currency);
    }

    case "cart.shipping": {
      const cents =
        order.shippingCents !== undefined ? order.shippingCents : 0;
      return cents
        ? formatMoneyFromCents(cents, order.currency)
        : "—";
    }

    case "cart.totalWithShipping": {
      const base = Number(order.totalCents || 0);
      const shipping = Number(order.shippingCents || 0);
      const total = base + (shipping || 0);
      return formatMoneyFromCents(
        total || order.totalCents,
        order.currency
      );
    }

    case "cart.currency":
      return order.currency || "MAD";

    default:
      return order[appField] ?? "—";
  }
}


/* ================== Component ================== */
export default function Section3Stats() {
  useInjectStatsCss();

  const [range, setRange] = useState("15"); // "7" | "15" | "30" | "60"
  const [onlyCod, setOnlyCod] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState([]); // json.latest
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmountCents: 0,
    rangeDays: 0,
    currency: "MAD",
  });

  // colonnes configurées dans Section3Sheets (met la même clé que là-bas !)
  const [sheetColumns, setSheetColumns] = useState([]);

  // statut interne des lignes (localStorage)
  const [rowStatus, setRowStatus] = useState({});

  /* ----- charger config colonnes + statut interne ----- */
  useEffect(() => {
    try {
      const s = window.localStorage.getItem("tripleform_cod_sheets_cfg_v7");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && Array.isArray(parsed.columns)) {
          setSheetColumns(parsed.columns);
        }
      }
    } catch {
      // ignore
    }

    try {
      const s2 = window.localStorage.getItem("tripleform_cod_order_status");
      if (s2) setRowStatus(JSON.parse(s2));
    } catch {
      // ignore
    }
  }, []);

  const columns = sheetColumns.length ? sheetColumns : DEFAULT_COLUMNS;

  const saveRowStatus = (next) => {
    setRowStatus(next);
    try {
      window.localStorage.setItem(
        "tripleform_cod_order_status",
        JSON.stringify(next)
      );
    } catch {
      // ignore
    }
  };

  /* ----- charger data depuis /api/orders/dashboard ----- */
  async function loadData(opts) {
    const r = opts && opts.range !== undefined ? opts.range : range;
    const oc = opts && opts.onlyCod !== undefined ? opts.onlyCod : onlyCod;
    const days = Number(r) || 15;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/orders/dashboard?days=${days}&codOnly=${oc ? "1" : "0"}`,
        { credentials: "include" }
      );
      const json = await res.json();

      if (!res.ok || json.ok === false) {
        throw new Error(json.error || res.statusText || "Erreur de chargement");
      }

      const latest = Array.isArray(json.latest) ? json.latest : [];
      const totals = json.totals || {};

      setOrders(latest);
      setStats({
        totalOrders: totals.count || latest.length || 0,
        totalAmountCents: totals.totalCents || 0,
        rangeDays: days,
        currency:
          totals.currency ||
          (latest[0] && latest[0].currency) ||
          "MAD",
      });
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des commandes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData({ range, onlyCod });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, onlyCod]);

  /* ================== UI ================== */
  return (
    <div className="tf-stats-shell">
      {/* HERO */}
      <div className="tf-stats-hero">
        <div className="tf-stats-hero-left">
          <div className="tf-stats-hero-title">
            GOOGLE SHEETS & COMMANDES COD
          </div>
          <div className="tf-stats-hero-sub">
            Mappe tes champs vers les colonnes, connecte ta feuille Google
            Sheets et suis les commandes COD en temps réel.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tf-stats-hero-pill">
            Période stats : {stats.rangeDays || 0} jours (COD uniquement)
          </div>
          <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>
            Cmd : {stats.totalOrders} · Total :{" "}
            {formatMoneyFromCents(stats.totalAmountCents, stats.currency)}
          </div>
        </div>
      </div>

      <div className="tf-stats-grid">
        {/* ===== Rail gauche ===== */}
        <div>
          <div className="tf-stats-rail-card">
            <div className="tf-stats-rail-head">Panneaux</div>
            <div className="tf-stats-rail-list">
              <div className="tf-stats-rail-item">
                <Icon source={PI.IndexTableIcon} />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Google Sheets (champs & connexion)
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    Configure les colonnes et la connexion à ta feuille.
                  </div>
                </div>
              </div>
              <div className="tf-stats-rail-item">
                <Icon source={PI.ClockIcon} />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Commandes en temps réel
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    Liste complète des dernières commandes COD.
                  </div>
                </div>
              </div>
              <div className="tf-stats-rail-item">
                <Icon source={PI.ChartHistogramIcon} />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Graphiques & stats
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    Résumé global des commandes (sans graphe).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Colonne centrale : commandes ===== */}
        <div>
          <div className="tf-stats-main-card">
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h3" variant="headingSm">
                    Commandes en temps réel (large)
                  </Text>
                  <Badge>
                    Période : {stats.rangeDays || range} jours
                  </Badge>
                </InlineStack>
                <InlineStack gap="200" blockAlign="center">
                  <Text tone="subdued" as="span">
                    {orders.length} commande(s)
                  </Text>
                  <Button
                    size="slim"
                    icon={PI.RefreshIcon}
                    onClick={() => loadData({})}
                    disabled={loading}
                  >
                    Rafraîchir
                  </Button>
                </InlineStack>
              </InlineStack>

              {loading ? (
                <InlineStack align="center">
                  <Spinner />
                </InlineStack>
              ) : error ? (
                <Text tone="critical" as="p">
                  {error}
                </Text>
              ) : (
                <div style={{ marginTop: 8, overflowX: "auto" }}>
                  <table className="tf-stats-table">
                    <thead>
                      <tr>
                        {columns.map((c) => (
                          <th key={c.id || c.header}>{c.header}</th>
                        ))}
                        <th>Total</th>
                        <th>Pays</th>
                        <th>Statut interne</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          {columns.map((c) => (
                            <td key={c.id || c.header}>
                              {getFieldValue(o, c.appField)}
                            </td>
                          ))}
                          <td>
                            {formatMoneyFromCents(
                              o.totalCents,
                              o.currency || stats.currency
                            )}
                          </td>
                          <td>{o.country || o.countryCode || "—"}</td>
                          <td>
                            <Select
                              label="Statut"
                              labelHidden
                              options={STATUS_OPTIONS}
                              value={rowStatus[o.id] || "none"}
                              onChange={(v) =>
                                saveRowStatus({
                                  ...rowStatus,
                                  [o.id]: v,
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {!orders.length && (
                        <tr>
                          <td colSpan={columns.length + 3}>
                            <Text tone="subdued" as="span">
                              Aucune commande pour l’instant.
                            </Text>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </BlockStack>
          </div>
        </div>

        {/* ===== Colonne droite : résumé + filtres + guide ===== */}
        <div>
          <BlockStack gap="300">
            <div className="tf-stats-side-card">
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingSm">
                    Résumé période
                  </Text>
                  <Icon source={PI.ChartHistogramIcon} />
                </InlineStack>
                <Text as="p">
                  <b>{stats.totalOrders}</b> commande(s) détectée(s) sur{" "}
                  <b>{stats.rangeDays || 0}</b> jour(s).
                </Text>
                <Text tone="subdued" as="p">
                  Montant total :{" "}
                  <b>
                    {formatMoneyFromCents(
                      stats.totalAmountCents,
                      stats.currency
                    )}
                  </b>
                </Text>
              </BlockStack>
            </div>

            <div className="tf-stats-side-card">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Filtres des commandes
                </Text>

                <Select
                  label="Période des commandes"
                  options={RANGE_OPTIONS}
                  value={range}
                  onChange={(v) => setRange(v)}
                />

                <Checkbox
                  label="Afficher seulement les commandes COD"
                  checked={onlyCod}
                  onChange={(val) => setOnlyCod(val)}
                />

                <Text as="p" tone="subdued">
                  Ces réglages contrôlent la <b>liste des commandes</b> et le{" "}
                  <b>résumé</b> ci-dessus.
                </Text>
              </BlockStack>
            </div>

            <div className="tf-stats-side-card tf-guide-text">
              <Text as="h3" variant="headingSm">
                Guide · Google Sheets & commandes
              </Text>
              <div style={{ marginTop: 8 }}>
                <p>
                  <b>Panneau “Google Sheets (champs & connexion)”</b> : choisis
                  les champs COD et mappe-les vers les colonnes de ta feuille.
                  Utilise le carrousel pour régler l’ordre et la largeur.
                </p>
                <p>
                  <b>Panneau “Commandes en temps réel”</b> : affiche les
                  dernières commandes reçues par TripleForm COD sur la période
                  choisie.
                </p>
                <p>
                  <b>Panneau “WhatsApp & export”</b> : prépare les réglages pour
                  envoyer les commandes vers WhatsApp ou un outil externe
                  (webhook, Zapier, etc.).
                </p>
                <p>
                  <b>Panneau “Graphiques & stats”</b> : ici tu vois un résumé
                  global (total commandes + montant), sans graphe pour garder
                  l’interface plus simple.
                </p>
              </div>
            </div>
          </BlockStack>
        </div>
      </div>
    </div>
  );
}
