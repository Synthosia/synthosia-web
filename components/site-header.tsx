import Link from "next/link";
import { Container } from "@/components/container";

const navItems = [
  { href: "/platform", label: "Platform" },
  { href: "/language", label: "Language" },
  { href: "/framework", label: "Framework" },
  { href: "/opensource", label: "Open Source" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(38,37,30,0.1)] bg-[rgba(242,241,237,0.92)] backdrop-blur-md">
      <Container className="flex min-h-16 items-center justify-between gap-5">
        <Link
          href="/"
          className="font-display text-base leading-none tracking-[-0.06em] text-[#26251e]"
        >
          Synthosia
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/platform"
          className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#ebeae5] px-3.5 py-2 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
        >
          Explore Platform
        </Link>
      </Container>
    </header>
  );
}
