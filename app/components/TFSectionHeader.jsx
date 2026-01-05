// ===== File: app/components/TFSectionHeader.jsx =====
import React from "react";
import { Button } from "@shopify/polaris";
import CountryFlagsBar from "./CountryFlagsBar";

/**
 * Header commun pour TOUTES les sections (même design + mêmes drapeaux).
 * -> Résout le souci des drapeaux "condensés" car wrapper identique partout.
 */
export default function TFSectionHeader({
  title,
  subtitle,
  themeLink,
  onPreview,
  rightSlot,
}) {
  return (
    <div className="tf-header">
      <div className="tf-header-row">
        <div className="tf-brand">
          <div
            style={{
              width: 38,
              height: 38,
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
            <div className="tf-brand-title">{title}</div>
            <div className="tf-brand-sub">{subtitle}</div>
          </div>
        </div>

        <div className="tf-flags-wrap">
          <CountryFlagsBar />
        </div>

        <div className="tf-header-right">
          {themeLink ? (
            <Button url={themeLink} external target="_blank">
              Ajouter le bloc dans le thème
            </Button>
          ) : null}

          {onPreview ? <Button onClick={onPreview}>Prévisualiser</Button> : null}

          {rightSlot}
        </div>
      </div>
    </div>
  );
}
