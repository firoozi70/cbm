import { fa } from "./locales/fa";
import { en } from "./locales/en";
import { ar } from "./locales/ar";
import { zh } from "./locales/zh";
import { ru } from "./locales/ru";
import { es } from "./locales/es";
import { tr } from "./locales/tr";
import { de } from "./locales/de";
import { fr } from "./locales/fr";
import { LANGUAGES, type Locale, type TranslationDictionary } from "./types";

export * from "./types";

export const DICTIONARIES: Record<Locale, TranslationDictionary> = {
  fa,
  en,
  ar,
  zh,
  ru,
  es,
  tr,
  de,
  fr,
};

export function getDictionary(locale: Locale): TranslationDictionary {
  return DICTIONARIES[locale] || DICTIONARIES.fa;
}

export function formatLocaleNumber(value: number, locale: Locale, decimals = 0): string {
  // Only Persian (fa) uses Eastern Persian numerals (۰-۹)
  // All other languages (including Arabic in international logistics) use standard Western Latin numerals (0-9)
  if (locale === "fa") {
    try {
      return new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch {
      return value.toFixed(decimals);
    }
  }

  const intlLocaleMap: Record<Locale, string> = {
    fa: "fa-IR",
    en: "en-US",
    ar: "ar-u-nu-latn",
    zh: "zh-CN",
    ru: "ru-RU",
    es: "es-ES",
    tr: "tr-TR",
    de: "de-DE",
    fr: "fr-FR",
  };

  try {
    return new Intl.NumberFormat(intlLocaleMap[locale] || "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}
