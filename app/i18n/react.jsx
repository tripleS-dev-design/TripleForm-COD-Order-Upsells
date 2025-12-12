// app/i18n/react.jsx
import React, { createContext, useContext, useMemo } from "react";
import { translate, resolveLocale } from "./dictionaries";
import { DEFAULT_LANGUAGE } from "./config";

const I18nContext = createContext({
  locale: DEFAULT_LANGUAGE,
  t: (key, vars) => translate(DEFAULT_LANGUAGE, key, vars),
});

export function I18nProvider({ locale, children }) {
  const value = useMemo(() => {
    const { code } = resolveLocale(locale || DEFAULT_LANGUAGE);

    return {
      locale: code,
      t: (key, vars) => translate(code, key, vars),
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
