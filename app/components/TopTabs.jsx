// app/components/TopTabs.jsx
import { useCallback, useMemo } from "react";
import { Tabs } from "@shopify/polaris";

export default function TopTabs({ tabs, current, onChange }) {
  // index sélectionné à partir de l'id courant
  const selectedIndex = Math.max(0, tabs.findIndex((t) => t.id === current));

  // mémo pour éviter les recréations inutiles
  const polarisTabs = useMemo(
    () => tabs.map((t) => ({ id: t.id, content: t.label, panelID: `${t.id}-panel` })),
    [tabs]
  );

  // handler stable
  const handleSelect = useCallback(
    (i) => {
      const id = tabs[i]?.id ?? tabs[0]?.id ?? "home";
      onChange?.(id);
    },
    [tabs, onChange]
  );

  // ⚠️ clé basée sur selectedIndex pour forcer un rerender propre si Polaris “colle”
  return (
    <Tabs
      key={selectedIndex}
      tabs={polarisTabs}
      selected={selectedIndex}
      onSelect={handleSelect}
      fitted
    />
  );
}
