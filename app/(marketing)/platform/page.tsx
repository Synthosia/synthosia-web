import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Understand how Plex Language, Strider Framework, CLI, integrations, and projects connect as one ecosystem.",
};

const connectionSteps = [
  {
    id: "language",
    title: "Plex Language",
    description:
      "The language and toolchain foundation: parser, checker, runtime, CLI, and LSP with its own manifest.",
    href: "/language",
    tone: "bg-violet-400/70",
  },
  {
    id: "framework",
    title: "Strider Framework",
    description:
      "Backend layer for APIs and services with mature framework ergonomics and modern async performance.",
    href: "/framework",
    tone: "bg-blue-400/70",
  },
  {
    id: "cli",
    title: "Synthosia CLI",
    description:
      "Layer that initializes projects, connects accounts, syncs keys, and stitches products together in the terminal.",
    href: "/get-started",
    tone: "bg-fuchsia-300/70",
  },
  {
    id: "integrations",
    title: "Integrations",
    description:
      "Authentication, API keys, webhooks, and external services connected through explicit contracts.",
    href: "/integrations",
    tone: "bg-emerald-300/70",
  },
  {
    id: "projects",
    title: "Projects",
    description:
      "Versioned applications and tools with documentation, GitHub, and practical usage by context.",
    href: "/opensource",
    tone: "bg-cyan-300/70",
  },
];

export default function PlatformPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Platform"
          title="Language to projects, with the CLI in the middle"
          description="Synthosia organizes language, framework, account, integrations, and projects as one platform for teams that need to build and operate."
        />

        <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <article className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6 sm:p-8">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
              Ecosystem map
            </p>
            <h2 className="mt-4 text-balance font-display text-[1.8rem] leading-[1.15] tracking-[-0.325px] text-[#f7f4ff]">
              A layered platform, not a loose list of cards.
            </h2>
            <p className="mt-4 text-pretty font-serif text-[1.08rem] leading-[1.55] text-white/72">
              Instead of assembling a disconnected stack, Synthosia defines a clear path:
              language to model behavior, framework to operate services,
              CLI to join workflows, integrations to connect services, and projects to materialize product work.
            </p>
          </article>

          <ol className="relative space-y-4 rounded-[10px] border border-white/10 bg-[#08070d] p-4 sm:p-6">
            {connectionSteps.map((step, index) => (
              <li key={step.id} className="grid gap-3 sm:grid-cols-[44px_1fr] sm:items-start">
                <div className="flex items-center gap-3 sm:block">
                  <span className={`block size-3 rounded-full ${step.tone}`} />
                  <span className="font-mono text-xs tabular-nums text-white/46">0{index + 1}</span>
                </div>
                <article className="rounded-lg border border-white/10 bg-[#12111a] p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-violet-300/25">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-balance font-display text-[1.3rem] tracking-[-0.11px] text-[#f7f4ff]">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-[62ch] text-pretty font-serif text-[1rem] leading-[1.5] text-white/68">
                        {step.description}
                      </p>
                    </div>
                    <Link
                      href={step.href}
                      className="shrink-0 rounded-lg border border-white/10 bg-[#171124] px-3 py-2 font-display text-sm text-violet-100 transition-colors duration-150 ease-out hover:text-white"
                    >
                      Open layer
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </div>
  );
}
