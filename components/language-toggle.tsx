"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const router = useRouter();
  const { locale, dictionary, setLocale } = useLanguage();
  const nextLocale = locale === "en" ? "pt-BR" : "en";

  function toggleLocale() {
    setLocale(nextLocale);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={dictionary.language.label}
      className="btn-secondary focus-themed inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 font-display text-xs transition-opacity duration-150 ease-out hover:opacity-85"
    >
      <span className="font-mono">{dictionary.language.short}</span>
      <span className="hidden sm:inline">{dictionary.language.next}</span>
    </button>
  );
}
