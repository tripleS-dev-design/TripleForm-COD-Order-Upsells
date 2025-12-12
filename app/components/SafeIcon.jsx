// app/components/SafeIcon.jsx
import { Icon } from "@shopify/polaris";
import * as PI from "@shopify/polaris-icons";

/**
 * Usage:
 *   <SafeIcon name="AppsIcon" />
 *   <SafeIcon name={dynamicName} />
 *   <SafeIcon name="GoogleSheetsLogo" fallback="AppsIcon" />
 */
export default function SafeIcon({ name, fallback = "AppsIcon", ...props }) {
  // Autorise 3 formes:
  //  - name = string (clé dans polaris-icons)
  //  - name = objet (déjà une icône importée)
  //  - sinon => fallback
  let src;

  if (typeof name === "string") {
    // Quelques variantes fréquentes: accepter "Icon" à la fin, ou pas
    src = PI[name] || PI[`${name}Icon`];
  } else if (name && typeof name === "object") {
    src = name;
  }

  if (!src) {
    src = PI[fallback] || PI[`${fallback}Icon`] || PI.AppsIcon;
  }

  return <Icon source={src} {...props} />;
}
