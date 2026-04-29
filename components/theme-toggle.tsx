"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/language-provider";
import { readTheme, saveTheme, type ThemeName } from "@/components/theme-provider";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>("light");
  const { dictionary } = useLanguage();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setTheme(readTheme()));

    function syncTheme(event: Event) {
      setTheme((event as CustomEvent<ThemeName>).detail);
    }

    window.addEventListener("synthosia-theme-change", syncTheme);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("synthosia-theme-change", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dictionary.theme.toggle}
      title={theme === "dark" ? dictionary.theme.dark : dictionary.theme.light}
      className="focus-themed group flex cursor-pointer items-center gap-2 rounded-full p-1 transition-transform duration-150 ease-out hover:scale-[1.02]"
    >
      <span className="theme-toggle-track relative grid h-8 w-[72px] grid-cols-2 rounded-full p-1">
        <span className="grid place-items-center">
          <svg aria-hidden="true" className="size-3.5 text-amber-500" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m0-11.32L4.92 4.92m14.16 14.16-1.42-1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="grid place-items-center">
          <svg aria-hidden="true" className="size-3.5 text-violet-400" viewBox="0 0 24 24" fill="none">
            <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </span>
        <motion.span
          className="theme-toggle-thumb absolute top-1 grid size-6 place-items-center rounded-full"
          animate={{ x: theme === "dark" ? 39 : 4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {theme === "dark" ? (
            <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 7 7 0 1 0 20 15.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg aria-hidden="true" className="size-3.5" viewBox="0 0 24 24" fill="none">
              <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m0-11.32L4.92 4.92m14.16 14.16-1.42-1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </motion.span>
      </span>
    </button>
  );
}
