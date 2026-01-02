import ReactCountryFlagImport from "react-country-flag";
import { supportedCountries, countryNames } from "../constants/supportedCountries";

const ReactCountryFlag =
  ReactCountryFlagImport?.default || ReactCountryFlagImport;

export default function CountryFlagsBar() {
  // إذا ما كانش component صحيح، مانكسرش الصفحة
  if (typeof ReactCountryFlag !== "function") return null;

  return (
    <div className="tf-flags" title="Pays supportés">
      {supportedCountries.map((code) => (
        <span
          key={code}
          className="tf-flag-item"
          title={countryNames[code] || code}
        >
          <ReactCountryFlag
            svg
            countryCode={code}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              boxShadow: "0 10px 22px rgba(0,0,0,0.22)",

            }}
          />
        </span>
      ))}
    </div>
  );
}
