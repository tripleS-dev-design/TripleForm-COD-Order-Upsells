// ===== File: app/sections/Section7Guide.jsx =====
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Icon,
} from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

/* ======================= CSS / layout (aligné sur Sheets/Geo/Pixels) ======================= */
const LAYOUT_CSS = `
  html, body {
    margin: 0;
    padding: 0;
    background: #F6F7F9;
  }

  .Polaris-Page {
    max-width: none !important;
    padding: 0 !important;
  }

  .Polaris-Page-Header {
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
  }

  .Polaris-Page__Content {
    max-width: none !important;
    padding: 0 !important;
  }

  /* HEADER — gradient comme Sheets/Pixels */
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

  /* ===== Grille: nav gauche | contenu centre | guide droite ===== */
  .tf-editor {
    display:grid;
    grid-template-columns: 260px minmax(0,1fr) 320px;
    gap:16px;
    align-items:start;
  }

  /* rail gauche */
  .tf-rail {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow:auto;
  }
  .tf-rail-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    margin-bottom:12px;
  }
  .tf-rail-head {
    padding:10px 12px;
    border-bottom:1px solid #E5E7EB;
    font-weight:700;
  }
  .tf-rail-list {
    padding:8px;
    display:grid;
    gap:8px;
  }
  .tf-rail-item {
    display:grid;
    grid-template-columns:28px 1fr;
    align-items:flex-start;
    gap:8px;
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:8px 10px;
    cursor:pointer;
    font-size:13px;
  }
  .tf-rail-item[data-sel="1"] {
    outline:2px solid #2563EB;
    box-shadow:0 12px 26px rgba(37,99,235,.25);
  }
  .tf-rail-mini {
    margin-top:6px;
    border:1px dashed #E5E7EB;
    border-radius:8px;
    padding:6px;
    background:#FAFAFA;
  }

  /* Colonne centrale (contenu principal) */
  .tf-main-col {
    display:grid;
    gap:16px;
    min-width:0;
  }
  .tf-panel {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    min-width:0;
  }

  /* Colonne droite (notes) */
  .tf-side-col {
    position:sticky;
    top:84px;
    max-height:calc(100vh - 100px);
    overflow-y:auto;
    overflow-x:hidden;
    width:320px;
    flex:none;
  }
  .tf-side-card {
    background:#fff;
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:12px;
    margin-bottom:12px;
  }

  /* TITRES — même bande que Sheets/Pixels */
  .tf-group-title {
    padding:10px 12px;
    background:linear-gradient(90deg,#0B3B82,#7D0031);
    border:1px solid rgba(0,167,163,0.85);
    color:#F9FAFB;
    border-radius:10px;
    font-weight:800;
    letter-spacing:.2px;
    margin-bottom:10px;
    box-shadow:0 6px 18px rgba(11,59,130,0.35);
  }

  .row-card {
    border:1px solid #E5E7EB;
    border-radius:10px;
    padding:10px;
    background:#FFF;
  }

  /* minis */
  .mini-chip {
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:4px 8px;
    border-radius:999px;
    background:#EEF2FF;
    border:1px solid #C7D2FE;
    font-size:12px;
    color:#1E3A8A;
  }
  .mini-list {
    display:grid;
    gap:6px;
  }
  .mini-box {
    padding:4px 6px;
    border-radius:6px;
    background:#111827;
    color:#fff;
    font-size:11px;
    display:inline-block;
  }

  .tf-guide-text p {
    font-size:13px;
    line-height:1.5;
    margin:0 0 6px 0;
    white-space:normal;
  }

  @media (max-width: 980px) {
    .tf-editor { grid-template-columns: 1fr; }
    .tf-rail, .tf-side-col { position:static; max-height:none; width:auto; }
  }
`;

function useInjectCss() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tf-guide-css")) return;
    const t = document.createElement("style");
    t.id = "tf-guide-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
  }, []);
}

/* ======================= UI helpers ======================= */
function GroupCard({ title, children }) {
  return (
    <Card>
      <div className="tf-group-title">{title}</div>
      <BlockStack gap="200">{children}</BlockStack>
    </Card>
  );
}

/* ======================= Aperçus compacts (rail) ======================= */
const MiniPreview = {
  events: () => (
    <div className="mini-list">
      <span className="mini-chip">Test Events</span>
      <span className="mini-chip">Pixel helper</span>
      <span className="mini-chip">View / Lead / Purchase</span>
    </div>
  ),
  bm: () => (
    <div className="mini-list">
      <span className="mini-chip">1 BM · 1 Pixel</span>
      <span className="mini-chip">Domaine vérifié</span>
      <span className="mini-chip">Events agrégés</span>
    </div>
  ),
  metaAds: () => (
    <div className="mini-list">
      <span className="mini-chip">Cold / Warm</span>
      <span className="mini-chip">Objectif Lead</span>
      <span className="mini-chip">Retarget COD</span>
    </div>
  ),
  tiktokAds: () => (
    <div className="mini-list">
      <span className="mini-chip">TikTok Ads</span>
      <span className="mini-chip">Lead / Purchase</span>
      <span className="mini-chip">Créatives UGC</span>
    </div>
  ),
};

/* ======================= Aperçus “grands” (centre) ======================= */
function BigPreview({ kind }) {
  if (kind === "events") {
    return (
      <div className="row-card">
        <Text as="h3" variant="headingSm">
          Schéma — Tests Events Pixels
        </Text>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <div className="mini-list">
            <span className="mini-box">Parcours test</span>
            <span className="mini-chip">1️⃣ Ouvrir page produit / landing</span>
            <span className="mini-chip">
              2️⃣ Scroller jusqu&apos;au Form COD
            </span>
            <span className="mini-chip">
              3️⃣ Remplir avec fausse commande de test
            </span>
            <span className="mini-chip">
              4️⃣ Cliquer sur le bouton de confirmation
            </span>
          </div>
          <div className="mini-list">
            <span className="mini-box">À voir dans les outils</span>
            <span className="mini-chip">Meta Pixel Helper : ViewContent / Lead</span>
            <span className="mini-chip">
              TikTok Pixel Helper : PageView / SubmitForm
            </span>
            <span className="mini-chip">
              Events Manager / TikTok Events : events reçus en temps réel
            </span>
          </div>
          <Text as="p" tone="subdued" style={{ marginTop: 8 }}>
            L&apos;objectif est simple : une commande test = une suite
            d&apos;events propres (pas de doublons, bon domaine, bon Pixel ID).
          </Text>
        </div>
      </div>
    );
  }

  if (kind === "bm") {
    return (
      <div className="row-card">
        <Text as="h3" variant="headingSm">
          Schéma — Structure Business Manager
        </Text>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <div className="mini-list">
            <span className="mini-box">Structure recommandée</span>
            <span className="mini-chip">
              Business Manager → 1 compte pub principal
            </span>
            <span className="mini-chip">
              1 Pixel Meta connecté à ton store COD
            </span>
            <span className="mini-chip">
              1 domaine vérifié (celui de la boutique)
            </span>
          </div>
          <div className="mini-list">
            <span className="mini-box">Events agrégés</span>
            <span className="mini-chip">Priorité 1 : Lead (COD)</span>
            <span className="mini-chip">Priorité 2 : Purchase (optionnel)</span>
            <span className="mini-chip">
              Garde 2–3 events max pour rester clair
            </span>
          </div>
          <Text as="p" tone="subdued" style={{ marginTop: 8 }}>
            Pour le COD, le plus important est souvent l&apos;event Lead, qui
            représente le client qui a soumis le Form COD (commande à rappeler).
          </Text>
        </div>
      </div>
    );
  }

  if (kind === "metaAds") {
    return (
      <div className="row-card">
        <Text as="h3" variant="headingSm">
          Schéma — Stratégie Meta Ads (COD)
        </Text>
        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          <div className="mini-list">
            <span className="mini-box">Campagnes</span>
            <span className="mini-chip">
              C1 — Cold (Prospection) · Objectif Lead
            </span>
            <span className="mini-chip">
              C2 — Warm (Retarget) · Objectif Lead / Purchase
            </span>
          </div>
          <div className="mini-list">
            <span className="mini-box">Ad sets (C1)</span>
            <span className="mini-chip">
              2–3 ensembles d&apos;annonces · pays cible (ex : Maroc)
            </span>
            <span className="mini-chip">
              Intérêts larges, âge 18–45 (à ajuster)
            </span>
            <span className="mini-chip">
              Budget test par ad set (ex : 5–10$ / jour)
            </span>
          </div>
          <div className="mini-list">
            <span className="mini-box">Créatives</span>
            <span className="mini-chip">
              Vidéo courte UGC ou simple image produit
            </span>
            <span className="mini-chip">
              Texte clair : offre COD + bénéfice principal
            </span>
            <span className="mini-chip">
              CTA : Commander maintenant / Payer à la livraison
            </span>
          </div>
          <Text as="p" tone="subdued" style={{ marginTop: 8 }}>
            Regarde le coût par Lead et le taux de commandes confirmées par ton
            call-center. Coupe ce qui ne rentre pas, augmente petit à petit ce
            qui fonctionne.
          </Text>
        </div>
      </div>
    );
  }

  if (kind === "tiktokAds") {
    return (
      <div className="row-card">
          <Text as="h3" variant="headingSm">
            Schéma — Stratégie TikTok Ads (COD)
          </Text>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div className="mini-list">
              <span className="mini-box">Campagne</span>
              <span className="mini-chip">
                1 campagne test · objectif Lead / Website conversions
              </span>
              <span className="mini-chip">
                1–2 ad groups (pays cible, placements automatiques)
              </span>
            </div>
            <div className="mini-list">
              <span className="mini-box">Créatives TikTok</span>
              <span className="mini-chip">
                Vidéo verticale 9–15s, style TikTok natif
              </span>
              <span className="mini-chip">
                Hook rapide (3 premières secondes) sur le problème / solution
              </span>
              <span className="mini-chip">
                Mention claire du COD dans la voix / texte
              </span>
            </div>
            <div className="mini-list">
              <span className="mini-box">Suivi</span>
              <span className="mini-chip">
                Events : ViewContent, Lead, Complete Payment / Purchase
              </span>
              <span className="mini-chip">
                Lis les stats : coût par Lead, taux de prise en charge
              </span>
            </div>
            <Text as="p" tone="subdued" style={{ marginTop: 8 }}>
              Comme pour Meta, l&apos;objectif est d&apos;avoir un flux
              régulier de Leads COD avec un coût maîtrisé, puis de scaler
              progressivement ce qui reste rentable.
            </Text>
          </div>
        </div>
    );
  }

  return null;
}

/* ======================= Contenu des guides ======================= */
const GUIDE = {
  events: {
    title: "1 · Tests Events & Pixels",
    icon: PI.BugIcon || PI.AnalyticsIcon || PI.AppsIcon,
    kind: "events",
    steps: [
      "Assure-toi que la section Pixels de TripleForm COD est bien configurée (IDs Meta & TikTok) et que le bloc est ajouté dans ton thème.",
      "Installe les extensions Meta Pixel Helper et TikTok Pixel Helper sur ton navigateur (Chrome recommandé).",
      "Ouvre une page produit ou ta landing COD, sans adblock : tu dois voir au moins un event de type ViewContent / PageView déclenché.",
      "Remplis le Form COD avec une fausse commande (Lead test) et envoie la commande : vérifie qu’un event Lead (et éventuellement Purchase) remonte.",
      "Va dans Meta Events Manager et TikTok Events pour vérifier que les events sont bien reçus en temps réel, avec le bon domaine et le bon Pixel ID.",
      "Si rien ne remonte : revérifie les IDs dans TripleForm COD, le thème (bloc bien ajouté) et désactive temporairement les scripts de pixels externes doublons.",
    ],
  },
  bm: {
    title: "2 · Structurer ton Business Manager",
    icon: PI.OrganizationIcon || PI.AnalyticsIcon || PI.AppsIcon,
    kind: "bm",
    steps: [
      "Dans Meta Business Manager, vérifie que tu as : 1 business principal, 1 compte publicitaire principal et 1 Pixel connecté à ta boutique COD.",
      "Ajoute ton domaine de boutique dans la partie Sécurité de la marque / Domaines et vérifie-le si possible.",
      "Dans Events Manager, associe ton Pixel à ce domaine et assure-toi que les events de test arrivent bien depuis ce domaine.",
      "Configure les Events Agrégés (AEM) : mets Lead en priorité 1 pour le COD, puis Purchase en priorité 2 si tu l’utilises pour optimiser la valeur.",
      "Crée des audiences de base : retarget des visiteurs des 30 derniers jours, retarget des Leads, exclusion de ceux qui ont déjà acheté si possible.",
      "Garde ta structure simple au début : trop de pixels, trop de domaines et trop d’events compliquent la lecture et le debug.",
    ],
  },
  metaAds: {
    title: "3 · Stratégie Meta Ads (COD)",
    icon: PI.MarketingIcon || PI.AnalyticsIcon || PI.AppsIcon,
    kind: "metaAds",
    steps: [
      "Commence par une campagne Cold avec objectif Lead (ou Conversions optimisées sur l’event Lead) pour trouver ton coût par Lead de base.",
      "Crée 2–3 ensembles d’annonces (ad sets) avec des ciblages différents : intérêts larges, lookalikes si tu as déjà des données, ou broad si ton marché est petit.",
      "Dans chaque ensemble, mets 2–4 créatives max (vidéos ou images) pour tester les hooks, les promesses et les angles de ton offre COD.",
      "Crée une campagne Retarget séparée pour recibler les personnes qui ont visité le Form COD ou déclenché ViewContent, mais n’ont pas envoyé de Lead.",
      "Regarde les stats tous les 2–3 jours : coupe les ad sets qui n’amènent pas de Leads rentables, garde ceux qui tournent et augmente le budget progressivement.",
      "Connecte les chiffres Meta (coût par Lead) à tes chiffres réels (taux de confirmation, taux de livraison) pour connaître ton coût par commande livrée.",
    ],
  },
  tiktokAds: {
    title: "4 · Stratégie TikTok Ads (COD)",
    icon: PI.VideoIcon || PI.PlayCircleIcon || PI.AppsIcon,
    kind: "tiktokAds",
    steps: [
      "Sur TikTok Ads Manager, crée une campagne avec objectif Leads ou Website Conversions en utilisant l’event qui correspond le mieux à ton Form COD.",
      "Commence avec 1–2 ad groups seulement : même pays que tes clients, placements automatiques et budget test raisonnable par ad group.",
      "Utilise des créatives très natives TikTok : format vertical, style UGC, sous-titres, démonstration rapide du produit et mention claire du COD.",
      "Teste plusieurs hooks (problème, avant/après, témoignage) tout en gardant le même produit et la même offre pour identifier ce qui accroche le plus.",
      "Surveille le coût par Lead et les signaux de qualité (taux d’achèvement de la vidéo, clics, leads). Coupe ce qui est trop cher ou apporte des Leads non qualifiés.",
      "Une fois une combinaison gagnante ad group + créatives identifiée, augmente doucement le budget, duplique éventuellement sur un autre pays ou audience voisine.",
    ],
  },
};

// ordre dans le rail
const ORDER = ["events", "bm", "metaAds", "tiktokAds"];

/* ======================= HEADER SHELL ======================= */
function PageShell({ children }) {
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
                TripleForm COD · Guide Pixels & Stratégie (Meta / TikTok)
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(249,250,251,0.8)",
                }}
              >
                Ce bloc est 100% texte : tests events, schémas simples et
                stratégies COD à utiliser dans Business Manager et TikTok Ads.
              </div>
            </div>
          </InlineStack>
          <div style={{ fontSize: 12, color: "rgba(249,250,251,0.9)" }}>
            Étape finale · Après Form · Offers · Sheets · Pixels · Anti-bot
          </div>
        </InlineStack>
      </div>

      <div className="tf-shell">{children}</div>
    </>
  );
}

/* ======================= Page ======================= */
export default function Section7Guide() {
  useInjectCss();
  const [sel, setSel] = useState("events");
  const current = useMemo(() => GUIDE[sel] || GUIDE.events, [sel]);

  return (
    <PageShell>
      <div className="tf-editor">
        {/* Rail gauche (sections guide Pixel/Stratégie) */}
        <div className="tf-rail">
          <div className="tf-rail-card">
            <div className="tf-rail-head">Par où commencer ?</div>
            <div className="tf-rail-list">
              {ORDER.map((key) => {
                const item = GUIDE[key];
                const Mini = MiniPreview[key] || (() => null);
                return (
                  <div
                    key={key}
                    className="tf-rail-item"
                    data-sel={sel === key ? 1 : 0}
                    onClick={() => setSel(key)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      <Icon source={item.icon || PI.AppsIcon} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      <div className="tf-rail-mini">
                        <Mini />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Colonne centrale : Guide complet */}
        <div className="tf-main-col">
          <div className="tf-panel">
            <GroupCard title={current.title}>
              {/* Guide écrit (steps) */}
              <Card>
                <div style={{ padding: 12 }}>
                  <Text as="p" tone="subdued">
                    Checklist — ce qu’il faut faire :
                  </Text>
                  <BlockStack gap="150" style={{ marginTop: 8 }}>
                    {current.steps.map((s, i) => (
                      <div key={i} className="row-card">
                        <InlineStack gap="200" blockAlign="center">
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              background: "#111827",
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          >
                            {i + 1}
                          </div>
                          <Text as="p">{s}</Text>
                        </InlineStack>
                      </div>
                    ))}
                  </BlockStack>
                </div>
              </Card>

              {/* Schéma / aperçu visuel */}
              <div style={{ marginTop: 12 }}>
                <BigPreview kind={current.kind} />
              </div>
            </GroupCard>
          </div>
        </div>

        {/* Colonne droite — Notes rapides globales */}
        <div className="tf-side-col">
          <div className="tf-side-card">
            <Text as="h3" variant="headingSm">
              Notes globales (workflow COD)
            </Text>
            <BlockStack
              gap="150"
              className="tf-guide-text"
              style={{ marginTop: 8 }}
            >
              <p>
                • D&apos;abord, assure-toi que toutes les sections de
                l&apos;app sont prêtes : <b>Form</b>, <b>Offers</b>,{" "}
                <b>Sheets</b>, <b>Pixels</b>, <b>Anti-bot</b>.
              </p>
              <p>
                • Ensuite, passe par l&apos;onglet <b>Tests Events</b> pour
                vérifier que tes pixels reçoivent bien les events depuis le
                Form COD.
              </p>
              <p>
                • Organise ton <b>Business Manager</b> simplement : un seul
                Pixel principal, un domaine propre, des events agrégés
                centrés sur Lead (COD).
              </p>
              <p>
                • Lancer les campagnes <b>Meta</b> et <b>TikTok</b> avec de
                petits budgets test, lis bien le coût par Lead et relie-le à
                ton call-center (taux de confirmation).
              </p>
              <p>
                • Ce guide n&apos;écrit rien dans ta boutique. Il sert juste
                de plan d&apos;action texte pour t&apos;aider à utiliser ton
                Business Manager et TikTok avec TripleForm COD.
              </p>
            </BlockStack>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
