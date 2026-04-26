import Link from "next/link";
import { Container } from "@/components/container";

const navItems = [
  { href: "/platform", label: "Platform" },
  { href: "/get-started", label: "Get Started" },
  { href: "/docs", label: "Docs" },
  { href: "/integrations", label: "Integrations" },
  { href: "/opensource", label: "Open Source" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#02030a]/82 backdrop-blur-md">
      <Container className="flex min-h-16 items-center justify-between gap-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-base leading-none text-white"
        >
          <span className="grid size-8 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-sm font-bold text-violet-100 shadow-[0_0_22px_rgba(157,53,255,0.32)]">
            S
          </span>
          <span>Synthosia</span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/auth"
          className="rounded-lg border border-violet-300/30 bg-violet-500/18 px-3.5 py-2 font-display text-sm text-white transition-transform duration-150 ease-out hover:scale-[1.02] hover:border-violet-200/60"
        >
          Sign in
        </Link>
      </Container>
    </header>
  );
}
