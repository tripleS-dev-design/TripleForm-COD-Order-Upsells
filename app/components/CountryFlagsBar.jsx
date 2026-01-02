import ReactCountryFlag from "react-country-flag";
import { supportedCountries, countryNames } from "../constants/supportedCountries";

export default function CountryFlagsBar() {
  return (
    <div className="tf-flags" title="Pays supportés">
      {supportedCountries.map((code) => (
        <span key={code} className="tf-flag-item" title={countryNames[code] || code}>
          <ReactCountryFlag
            svg
            countryCode={code}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "6px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
            }}
          />
        </span>
      ))}
    </div>
  );
}
