// app/routes/app.sections.$id.jsx
import { json } from "@remix-run/node";
import Section0Home from "../sections/Section0Home.jsx";
import Section1Forms from "../sections/Section1Forms.jsx";
import Section2Offers from "../sections/Section2Offers.jsx";
import Section3Sheets from "../sections/Section3Sheets.jsx";
import Section4Pixels from "../sections/Section4Pixels.jsx";
import Section5Antibot from "../sections/Section5Antibot.jsx";
import Section6Geo from "../sections/Section6Geo.jsx";
import Section7Guides from "../sections/Section7Guides.jsx";

export async function loader() {
  // Pas de logique serveur ici, on laisse le parent faire le guard.
  return json({ ok: true });
}

// Mapping NUM -> composant (selon ta capture d’écran)
const SECTIONS = {
  "0": Section0Home,
  "1": Section1Forms,
  "2": Section2Offers,
  "3": Section3Sheets,
  "4": Section4Pixels,
  "5": Section5Antibot,
  "6": Section6Geo,
  "7": Section7Guides,
};

export default function SectionByIdRoute() {
  const id = typeof window !== "undefined"
    ? window.location.pathname.split("/").pop()
    : "1";

  const Comp = SECTIONS[id] || Section1Forms;
  return <Comp />;
}
