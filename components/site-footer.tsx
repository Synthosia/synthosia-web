import Link from "next/link";
import { Container } from "@/components/container";

const footerLinks = [
  { id: "platform", href: "/platform", label: "Platform" },
  { id: "docs", href: "/docs", label: "Docs" },
  { id: "get-started", href: "/get-started", label: "Get Started" },
  { id: "integrations", href: "/integrations", label: "Integrations" },
  { id: "account", href: "/account", label: "Account" },
  { id: "opensource", href: "/opensource", label: "Open Source" },
  { id: "github", href: "https://github.com/SorPuti", label: "GitHub", target: "_blank" as const },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#02030a]/70 py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg text-white">
            Synthosia Platform
          </p>
          <p className="max-w-[48ch] font-serif text-[1.02rem] text-slate-400">
            Language, backend framework, CLI, integrations, account layer, and open-source tools designed as one developer system.
          </p>
        </div>
        <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={('target' in link && link.target) || undefined}
              rel={('target' in link && link.target === '_blank') ? 'noopener noreferrer' : undefined}
              className="font-display text-sm text-slate-300 transition-colors duration-150 ease-out hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
