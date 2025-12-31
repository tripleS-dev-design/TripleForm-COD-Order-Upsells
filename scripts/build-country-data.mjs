import fs from "fs";
import path from "path";
import { Country, State, City } from "country-state-city";

/**
 * ⚙️ Mets ici la même logique que ton fichier admin
 */
const USE_ALL_COUNTRIES = false;

const POPULAR_COUNTRY_CODES = [
  "MA","DZ","TN","EG","SA","AE","QA","KW","BH","OM","JO","LB","IQ",
  "FR","ES","IT","DE","GB","NL","BE","CH","AT","SE","NO","DK","FI","IE","PT","GR",
  "PL","CZ","HU","RO","BG","UA",
  "US","CA","MX","BR","AR","CL","CO","PE",
  "NG","ZA","KE","GH","SN","CI","CM","ET","TZ","UG",
  "TR","PK","IN","BD","LK",
  "ID","MY","SG","TH","VN","PH",
  "JP","KR","CN","TW","HK",
  "AU","NZ",
];

const safeUpper = (s) => (typeof s === "string" ? s.toUpperCase() : "");

function getTargetCountries() {
  const all = Country.getAllCountries() || [];
  if (USE_ALL_COUNTRIES) return all;
  return all.filter((c) => POPULAR_COUNTRY_CODES.includes(safeUpper(c.isoCode)));
}

function build() {
  const countries = getTargetCountries();

  const out = countries.map((c) => {
    const cc = c.isoCode;

    const phone = c.phonecode ? (String(c.phonecode).startsWith("+") ? String(c.phonecode) : `+${c.phonecode}`) : "";
    const currency = c.currency || "USD";

    const states = State.getStatesOfCountry(cc) || [];
    const provinces = states.map((st) => {
      const pc = st.isoCode;
      const cities = (City.getCitiesOfState(cc, pc) || [])
        .map((x) => x.name)
        .filter(Boolean);

      // uniq + sort
      const uniqCities = Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, "fr"));

      return {
        code: pc,
        label: st.name,
        cities: uniqCities,
      };
    }).sort((a, b) => a.label.localeCompare(b.label, "fr"));

    return {
      code: cc,
      label: c.name,
      phonePrefix: phone,
      currency,
      provinces,
    };
  }).sort((a, b) => a.label.localeCompare(b.label, "fr"));

  return { generatedAt: new Date().toISOString(), countries: out };
}

const data = build();

// ✅ output dans ton extension theme assets (adapte le path)
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "extensions/tripleform-cod/assets/countryData.generated.json"
);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf8");
console.log("✅ Generated:", OUTPUT_PATH);
