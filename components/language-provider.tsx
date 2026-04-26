"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultLocale,
  getDictionary,
  localeCookieName,
  localeStorageKey,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function persistLocale(locale: Locale) {
  window.localStorage.setItem(localeStorageKey, locale);
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = locale;
  window.dispatchEvent(new CustomEvent("synthosia-locale-change", { detail: locale }));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedLocale = normalizeLocale(window.localStorage.getItem(localeStorageKey));
      setLocaleState(storedLocale);
      persistLocale(storedLocale);
    });

    function syncLocale(event: Event) {
      setLocaleState(normalizeLocale((event as CustomEvent<Locale>).detail));
    }

    window.addEventListener("synthosia-locale-change", syncLocale);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("synthosia-locale-change", syncLocale);
    };
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dictionary: getDictionary(locale),
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
        persistLocale(nextLocale);
      },
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
