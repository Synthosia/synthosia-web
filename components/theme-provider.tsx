"use client";

import { useEffect, type ReactNode } from "react";

export type ThemeName = "light" | "dark";

const storageKey = "synthosia.theme";

export function applyTheme(theme: ThemeName) {
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
  document.documentElement.classList.toggle("theme-light", theme === "light");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey) as ThemeName | null;
    applyTheme(savedTheme === "dark" ? "dark" : "light");
  }, []);

  return <>{children}</>;
}

export function readTheme(): ThemeName {
  return document.documentElement.classList.contains("theme-dark") ? "dark" : "light";
}

export function saveTheme(theme: ThemeName) {
  window.localStorage.setItem(storageKey, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent("synthosia-theme-change", { detail: theme }));
}
