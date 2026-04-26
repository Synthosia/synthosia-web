"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountLink } from "@/components/account-link";
import { BrandLogo } from "@/components/brand-logo";
import { Container } from "@/components/container";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/platform", label: "Platform" },
  { href: "/get-started", label: "Get Started" },
  { href: "/docs", label: "Docs" },
  { href: "/language", label: "Language" },
  { href: "/framework", label: "Framework" },
  { href: "/integrations", label: "Integrations" },
  { href: "/opensource", label: "Open Source" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { dictionary } = useLanguage();
  const isStandaloneRoute = pathname.startsWith("/auth") || pathname.startsWith("/account");

  if (isStandaloneRoute) {
    return null;
  }

  return (
    <header className="app-header sticky top-0 z-40 backdrop-blur-md">
      <Container className="flex min-h-16 items-center justify-between gap-5">
        <Link
          href="/"
          className="text-primary flex items-center gap-2 font-display text-base leading-none tracking-[-0.06em]"
        >
          <BrandLogo />
          <span>Synthosia</span>
        </Link>
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
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <AccountLink />
        </div>
      </Container>
    </header>
  );
}
