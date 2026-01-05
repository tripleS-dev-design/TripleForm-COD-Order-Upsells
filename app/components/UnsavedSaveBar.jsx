// ===== File: app/components/UnsavedSaveBar.jsx =====
import React, { useEffect } from "react";
import { Button, Icon } from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

/**
 * Barre top slim (pro) qui s'affiche UNIQUEMENT quand l'utilisateur essaie
 * de quitter la section avec des changements non sauvegardés.
 *
 * Boutons : Enregistrer / Annuler (quitter sans enregistrer) / Rester
 */
export default function UnsavedSaveBar({
  open,
  dirty,
  saving,
  mode, // "idle" | "attention" | "success" | "error"
  onSave,
  onDiscard,
  onCancel,
  t,
}) {
  useEffect(() => {
    const id = "tf-unsaved-savebar-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.appendChild(
      document.createTextNode(`
        .tf-unsaved-wrap{
          position: sticky;
          top: 56px;
          z-index: 55;
          padding: 8px 10px;
          background: rgba(255,255,255,0.86);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #E5E7EB;
        }
        .tf-unsaved-bar{
          max-width: 1100px;
          margin: 0 auto;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 10px 24px rgba(15,23,42,.06);
        }
        .tf-unsaved-left{
          display:flex;
          align-items:center;
          gap: 10px;
          min-width: 0;
        }
        .tf-unsaved-badge{
          font-size:12px;
          font-weight:900;
          padding:6px 10px;
          border-radius:999px;
          border:1px solid #E5E7EB;
          background:#F8FAFC;
          white-space:nowrap;
        }
        .tf-unsaved-text{
          display:flex;
          flex-direction:column;
          min-width:0;
          line-height:1.15;
        }
        .tf-unsaved-msg{
          font-size:13px;
          font-weight:800;
          color:#0F172A;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .tf-unsaved-sub{
          font-size:12px;
          color:#64748B;
          font-weight:600;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        @keyframes tfBarBlink { 0%,100%{filter:none} 50%{filter:brightness(1.15)} }
        @keyframes tfBarSlide { 0%{transform:translateX(0)} 50%{transform:translateX(10px)} 100%{transform:translateX(0)} }
        .tf-unsaved-attn{
          animation: tfBarBlink .9s ease-in-out 2, tfBarSlide .9s ease-in-out 2;
          border-color:#F97316 !important;
          box-shadow:0 10px 24px rgba(249,115,22,.18);
        }
      `)
    );
    document.head.appendChild(style);
  }, []);

  if (!open) return null;

  const isSuccess = mode === "success";
  const isError = mode === "error";
  const isAttn = mode === "attention";

  const badgeText = isError ? "Erreur" : isSuccess ? "Enregistré" : "Non enregistré";
  const badgeStyle = isError
    ? { background: "#FEF2F2", borderColor: "#FCA5A5", color: "#991B1B" }
    : isSuccess
    ? { background: "#ECFDF5", borderColor: "#86EFAC", color: "#065F46" }
    : { background: "#FFF7ED", borderColor: "#FDBA74", color: "#9A3412" };

  const mainMsg =
    isSuccess
      ? (t?.("common.save.success") || "Modifications enregistrées.")
      : isError
      ? (t?.("common.save.error") || "Impossible d’enregistrer. Réessaie.")
      : (t?.("common.save.unsaved") || "Tu as des modifications non enregistrées.");

  const subMsg =
    isSuccess
      ? ""
      : isError
      ? (t?.("common.save.errorSub") || "Vérifie ta connexion puis clique sur Enregistrer.")
      : (t?.("common.save.leaveSub") ||
          "Enregistre avant de changer de section, sinon tu vas perdre tes changements.");

  return (
    <div className="tf-unsaved-wrap">
      <div className={`tf-unsaved-bar ${isAttn ? "tf-unsaved-attn" : ""}`}>
        <div className="tf-unsaved-left">
          <span className="tf-unsaved-badge" style={badgeStyle}>
            {badgeText}
          </span>

          <span
            style={{
              width: 18,
              height: 18,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {/* ✅ FIX: CircleAlertIcon -> AlertCircleIcon */}
            <Icon
              source={
                isError
                  ? PI.AlertCircleIcon
                  : isSuccess
                  ? PI.CheckCircleIcon
                  : PI.AlertCircleIcon
              }
            />
          </span>

          <div className="tf-unsaved-text">
            <div className="tf-unsaved-msg">{mainMsg}</div>
            {subMsg ? <div className="tf-unsaved-sub">{subMsg}</div> : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: "0 0 auto" }}>
          {dirty ? (
            <>
              <Button variant="primary" onClick={onSave} loading={saving}>
                {t?.("common.save.btnSave") || "Enregistrer"}
              </Button>
              <Button tone="critical" onClick={onDiscard} disabled={saving}>
                {t?.("common.save.btnDiscard") || "Annuler"}
              </Button>
              <Button onClick={onCancel} disabled={saving}>
                {t?.("common.save.btnStay") || "Rester"}
              </Button>
            </>
          ) : (
            <Button onClick={onCancel}>{t?.("common.save.ok") || "OK"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
