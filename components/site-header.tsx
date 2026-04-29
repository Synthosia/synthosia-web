"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccountLink } from "@/components/account-link";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/container";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/platform", key: "platform" },
  { href: "/get-started", key: "getStarted" },
  { href: "/docs", key: "docs" },
  { href: "/language", key: "language" },
  { href: "/framework", key: "framework" },
  { href: "/integrations", key: "integrations" },
  { href: "/opensource", key: "opensource" },
] as const;

type NavItemKey = (typeof navItems)[number]["key"];

function navItemLabel(dictionary: { header: { navItems: Record<string, string> } }, key: NavItemKey): string {
  return dictionary.header.navItems[key] ?? key;
}

export function SiteHeader() {
  const pathname = usePathname();
  const { dictionary } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const isStandaloneRoute = pathname.startsWith("/auth") || pathname.startsWith("/account");

  if (isStandaloneRoute) {
    return null;
  }

  return (
    <header className="app-header sticky top-0 z-40 bg-[rgba(247,247,251,0.88)] backdrop-blur-md">
      <Container className="relative flex min-h-16 items-center justify-between gap-5 py-3">
        <Link
          href="/"
          className="text-primary flex items-center gap-2 font-display text-base leading-none"
        >
          <BrandLogo />
          <span>Synthosia</span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={dictionary.header.navLabel}
          aria-expanded={menuOpen}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-panel)] text-primary lg:hidden"
        >
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current mt-1" />
          <span className="block h-0.5 w-5 rounded-full bg-current mt-1" />
        </button>

        <nav aria-label={dictionary.header.navLabel} className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link relative text-sm font-medium transition-colors duration-150 ease-out",
                pathname === item.href &&
                  "nav-link-active after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-violet-300",
              )}
            >
              {navItemLabel(dictionary, item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <AccountLink />
        </div>
      </Container>

      {menuOpen ? (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-lg shadow-slate-900/5">
          <Container className="py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 hover:bg-slate-100",
                    pathname === item.href ? "bg-slate-100 text-slate-950" : "text-slate-700",
                  )}
                >
                  {navItemLabel(dictionary, item.key)}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
