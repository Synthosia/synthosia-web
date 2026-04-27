import en from "@/lib/locales/en";
import ptBR from "@/lib/locales/pt-BR";

export const locales = ["en", "pt-BR"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "synthosia.locale";
export const localeStorageKey = "synthosia.locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

const dictionaries = {
  en,
  "pt-BR": ptBR,
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
