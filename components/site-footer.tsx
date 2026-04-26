"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { useLanguage } from "@/components/language-provider";

const footerLinks = [
  { id: "platform", href: "/platform", label: "Platform" },
  { id: "get-started", href: "/get-started", label: "Get Started" },
  { id: "docs", href: "/docs", label: "Docs" },
  { id: "integrations", href: "/integrations", label: "Integrations" },
  { id: "account", href: "/account", label: "Account" },
  { id: "opensource", href: "/opensource", label: "Open Source" },
  { id: "about", href: "/about", label: "About" },
  { id: "github-repo", href: "https://github.com/SorPuti", label: "GitHub", target: "_blank" as const },
  { id: "github-profile", href: "https://github.com/SorPuti", label: "SorPuti", target: "_blank" as const },
];

export function SiteFooter() {
  const { dictionary } = useLanguage();
  const pathname = usePathname();

  if (pathname.startsWith("/auth") || pathname.startsWith("/account")) {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#08070d] py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg tracking-[-0.11px] text-[#f7f4ff]">
            {dictionary.footer.brand}
          </p>
          <p className="max-w-[48ch] font-serif text-[1.02rem] text-white/68">
            {dictionary.footer.description}
          </p>
        </div>
        <nav aria-label={dictionary.footer.navLabel} className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={('target' in link && link.target) || undefined}
              rel={('target' in link && link.target === '_blank') ? 'noopener noreferrer' : undefined}
              className="font-display text-sm text-white/70 transition-colors duration-150 ease-out hover:text-violet-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
