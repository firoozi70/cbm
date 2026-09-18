"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  LANGUAGES,
  type Locale,
  type TranslationDictionary,
  type LanguageInfo,
  DICTIONARIES,
  getDictionary,
  formatLocaleNumber,
} from "./index";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationDictionary;
  dir: "rtl" | "ltr";
  isRtl: boolean;
  currentLanguage: LanguageInfo;
  formatNumber: (value: number, decimals?: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "cbm_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fa");

  // Initial detection on mount (from query param, then localStorage, then navigator language)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryLang = urlParams.get("lang") as Locale | null;
      if (queryLang && LANGUAGES.some((l) => l.code === queryLang)) {
        setLocaleState(queryLang);
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLocaleState(saved);
        return;
      }

      // Detect from browser navigator
      const navLang = navigator.language?.slice(0, 2).toLowerCase();
      const matched = LANGUAGES.find((l) => l.code === navLang);
      if (matched) {
        setLocaleState(matched.code);
      }
    } catch {
      // fallback to default
    }
  }, []);

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0],
    [locale]
  );

  const dir = currentLanguage.dir;
  const isRtl = dir === "rtl";

  // Update HTML tag attributes when locale changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
      if (isRtl) {
        document.documentElement.classList.add("rtl");
        document.documentElement.classList.remove("ltr");
      } else {
        document.documentElement.classList.add("ltr");
        document.documentElement.classList.remove("rtl");
      }
    }
  }, [locale, dir, isRtl]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${STORAGE_KEY}=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // ignore
    }
  }, []);

  const t = useMemo(() => getDictionary(locale), [locale]);

  const formatNumber = useCallback(
    (value: number, decimals = 0) => formatLocaleNumber(value, locale, decimals),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dir,
      isRtl,
      currentLanguage,
      formatNumber,
    }),
    [locale, setLocale, t, dir, isRtl, currentLanguage, formatNumber]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
