/* =========================================================
   TripleForm COD - Country Data (Admin/React)
   Uses country-state-city library directly
   ========================================================= */

import { Country, State, City } from "country-state-city";

const safeUpper = (s) => (typeof s === "string" ? s.toUpperCase() : "");

/**
 * Get all countries
 */
export function getCountries() {
  try {
    const countries = Country.getAllCountries() || [];
    return countries.map(c => ({
      code: c.isoCode,
      label: c.name
    })).sort((a, b) => a.label.localeCompare(b.label, "en"));
  } catch (error) {
    console.error("Error getting countries:", error);
    return [];
  }
}

/**
 * Get provinces/states for a country
 */
export function getProvinces(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return [];
  
  try {
    const states = State.getStatesOfCountry(cc) || [];
    return states.map(s => ({
      code: s.isoCode || s.name?.replace(/\s+/g, "_").toUpperCase(),
      label: s.name
    })).filter(s => s.code && s.label)
      .sort((a, b) => a.label.localeCompare(b.label, "en"));
  } catch (error) {
    console.error(`Error getting provinces for ${cc}:`, error);
    return [];
  }
}

/**
 * Get cities for a country and province
 */
export function getCities(countryCode, provinceCode) {
  const cc = safeUpper(countryCode);
  const pc = safeUpper(provinceCode);
  if (!cc || !pc) return [];
  
  try {
    // First, get the actual province code from the state
    const states = State.getStatesOfCountry(cc) || [];
    const state = states.find(s => 
      s.isoCode === pc || 
      s.name?.toUpperCase() === pc ||
      s.isoCode?.toUpperCase() === pc
    );
    
    if (!state) return [];
    
    const cities = City.getCitiesOfState(cc, state.isoCode) || [];
    const cityNames = cities.map(c => c.name).filter(Boolean);
    
    // Remove duplicates and sort
    return Array.from(new Set(cityNames)).sort((a, b) => 
      a.localeCompare(b, "en")
    );
  } catch (error) {
    console.error(`Error getting cities for ${cc}/${pc}:`, error);
    return [];
  }
}

/**
 * Get phone prefix for a country
 */
export function getPhonePrefixByCountry(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return "";
  
  try {
    const country = Country.getCountryByCode(cc);
    if (!country || !country.phonecode) return "";
    
    const phonecode = String(country.phonecode);
    return phonecode.startsWith("+") ? phonecode : `+${phonecode}`;
  } catch (error) {
    console.error(`Error getting phone prefix for ${cc}:`, error);
    return "";
  }
}

/**
 * Get currency for a country
 */
export function getCurrencyByCountry(countryCode) {
  const cc = safeUpper(countryCode);
  if (!cc) return "USD";
  
  try {
    const country = Country.getCountryByCode(cc);
    return country?.currency || "USD";
  } catch (error) {
    console.error(`Error getting currency for ${cc}:`, error);
    return "USD";
  }
}

/**
 * Mock shipping calculation for preview
 */
export function getShippingExample(city, countryCode) {
  // This is just for preview purposes
  // In a real app, this would call your shipping API
  if (!city) {
    return {
      amount: 0,
      note: "Select city to calculate shipping"
    };
  }
  
  const baseAmount = 45.00;
  const country = safeUpper(countryCode);
  
  // Adjust shipping based on country
  let amount = baseAmount;
  let note = `Standard shipping to ${city}: 3-5 business days`;
  
  if (country === "MA") {
    amount = 25.00;
    note = `Local shipping to ${city}: 1-2 business days`;
  } else if (country === "FR" || country === "ES") {
    amount = 35.00;
    note = `European shipping to ${city}: 2-4 business days`;
  } else if (country === "US" || country === "CA") {
    amount = 55.00;
    note = `International shipping to ${city}: 5-10 business days`;
  }
  
  return {
    amount: amount,
    note: note
  };
}

/**
 * Get full country data for export
 */
export function getAllCountryData() {
  try {
    const countries = Country.getAllCountries() || [];
    
    return countries.map(c => {
      const cc = c.isoCode;
      const states = State.getStatesOfCountry(cc) || [];
      
      const provinces = states.map(s => {
        const cities = City.getCitiesOfState(cc, s.isoCode) || [];
        const cityNames = cities.map(city => city.name).filter(Boolean);
        
        return {
          code: s.isoCode || s.name?.replace(/\s+/g, "_").toUpperCase(),
          label: s.name,
          cities: Array.from(new Set(cityNames)).sort((a, b) => 
            a.localeCompare(b, "en")
          )
        };
      }).filter(p => p.code && p.label)
        .sort((a, b) => a.label.localeCompare(b.label, "en"));
      
      return {
        code: cc,
        label: c.name,
        phonePrefix: c.phonecode ? 
          (String(c.phonecode).startsWith("+") ? String(c.phonecode) : `+${c.phonecode}`) : "",
        currency: c.currency || "USD",
        provinces
      };
    }).filter(c => c.code)
      .sort((a, b) => a.label.localeCompare(b.label, "en"));
  } catch (error) {
    console.error("Error getting all country data:", error);
    return [];
  }
}

export default {
  getCountries,
  getProvinces,
  getCities,
  getPhonePrefixByCountry,
  getCurrencyByCountry,
  getShippingExample,
  getAllCountryData
};