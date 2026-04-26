import Link from "next/link";
import { Container } from "@/components/container";

const footerLinks = [
  { id: "platform", href: "/platform", label: "Platform" },
  { id: "opensource", href: "/opensource", label: "Open Source" },
  { id: "about", href: "/about", label: "About" },
  { id: "github-repo", href: "https://github.com/SorPuti", label: "GitHub", target: "_blank" as const },
  { id: "github-profile", href: "https://github.com/SorPuti", label: "SorPuti", target: "_blank" as const },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[rgba(38,37,30,0.1)] bg-[#ebeae5] py-10">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg tracking-[-0.11px] text-[#26251e]">
            Synthosia Ecosystem
          </p>
          <p className="max-w-[44ch] font-serif text-[1.02rem] text-[rgba(38,37,30,0.72)]">
            Founder-led by SorPuti. Building systems, not just apps. An AI-native stack for scalable products.
          </p>
        </div>
        <nav aria-label="Footer links" className="flex flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={('target' in link && link.target) || undefined}
              rel={('target' in link && link.target === '_blank') ? 'noopener noreferrer' : undefined}
              className="font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#f54e00]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
