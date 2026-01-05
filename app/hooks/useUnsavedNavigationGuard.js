// ===== File: app/hooks/useUnsavedNavigationGuard.js =====
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Logique unique:
 * - PAS d'alert à chaque modif
 * - Bloque seulement quand l'utilisateur veut quitter la section (liens internes)
 * - Ouvre une barre slim avec animation "attention"
 *
 * ✅ NEW:
 * - manualSave() : pour le bouton "Enregistrer" du header (save direct, sans navigation)
 */
export function useUnsavedNavigationGuard({
  dirty,
  onSave,
  navigate,
  isInternalHref,
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("idle"); // idle | attention | success | error
  const [saving, setSaving] = useState(false);

  const pendingHrefRef = useRef(null);
  const closeTimerRef = useRef(null);

  const internalCheck = useMemo(() => {
    return (
      isInternalHref ||
      ((href) => {
        if (!href) return false;
        if (href.startsWith("#")) return false;
        if (/^https?:\/\//i.test(href)) return false;
        return true;
      })
    );
  }, [isInternalHref]);

  // Browser refresh/close guard
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const openAttention = () => {
    setMode("attention");
    setOpen(true);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  // Intercept internal navigation clicks ONLY when leaving the current route
  useEffect(() => {
    const onClick = (e) => {
      if (!dirty) return;

      const a = e.target?.closest?.("a");
      if (!a) return;

      const href = a.getAttribute("href") || "";
      const target = a.getAttribute("target");

      if (target === "_blank") return;
      if (!internalCheck(href)) return;

      const currentPath = window.location.pathname;
      const nextPath = href.startsWith("/") ? href.split("?")[0] : href;

      if (!nextPath || nextPath === currentPath) return;

      e.preventDefault();
      pendingHrefRef.current = href;
      openAttention();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, internalCheck]);

  const proceed = () => {
    const href = pendingHrefRef.current;
    pendingHrefRef.current = null;
    setOpen(false);
    setMode("idle");
    if (href) navigate(href);
  };

  // ✅ Save flow utilisé quand on veut QUITTER (avec pending href)
  const runSaveAndMaybeLeave = async () => {
    if (saving) return false;

    setSaving(true);
    setMode("attention");
    setOpen(true);

    try {
      const ok = await onSave?.();

      if (ok) {
        setMode("success");

        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

        closeTimerRef.current = setTimeout(() => {
          // ✅ important: si user était en train de quitter -> navigate
          // sinon -> juste fermer
          if (pendingHrefRef.current) {
            proceed();
          } else {
            setOpen(false);
            setMode("idle");
          }
        }, 600);

        return true;
      }

      setMode("error");
      setOpen(true);
      return false;
    } catch {
      setMode("error");
      setOpen(true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ✅ NEW: Save direct (header button) => pas besoin de pending href
  const manualSave = async () => {
    // force: on n'est pas en train de quitter
    pendingHrefRef.current = null;
    return runSaveAndMaybeLeave();
  };

  const discardAndLeave = () => {
    proceed(); // quitter sans enregistrer
  };

  const cancel = () => {
    pendingHrefRef.current = null;
    setOpen(false);
    setMode("idle");
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return {
    open,
    mode,
    saving,
    dirty,
    // Pour UnsavedSaveBar (quand user veut quitter)
    onSave: runSaveAndMaybeLeave,
    onDiscard: discardAndLeave,
    onCancel: cancel,
    // ✅ Pour le bouton Enregistrer du header
    manualSave,
  };
}
