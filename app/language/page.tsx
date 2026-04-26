import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Language",
  description:
    "Plex Language: modular Rust toolchain with agent runtime, multi-provider AI, and integrated LSP.",
};

const codeExample = `agent SupportResponder {
  provider: local
  model "llama3.2"
  tool_loop: true

  intent who_am_i(): string {
    var p = env_var("PLEX_PROVIDER")
    if p == null {
      p = "ollama"
    }
    return "provider=" + p
  }
}`;

const highlights = [
  "Rust workspace with dedicated modules for lexer, parser, checker, runtime, CLI, and LSP.",
  "Support for Ollama, OpenAI, Claude, and OpenCode providers through configuration and environment variables.",
  "Plex.toml manifest with strict_types and explicit safety policies for agent execution.",
];

export default function LanguagePage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Programming Language"
          title="Plex: a language with AI integrated into the toolchain"
          description="Plex combines language semantics, agent runtime, and editor experience in one ecosystem."
        />

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6">
            <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#f7f4ff]">
              What makes it unique
            </h3>
            <ul className="mt-4 space-y-3 text-pretty font-serif text-[1.02rem] leading-[1.5] text-white/70">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[10px] border border-white/10 bg-[#08070d] p-6">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-blue-200/70">
              Core Focus
            </p>
            <h3 className="mt-3 text-balance font-display text-[1.3rem] text-[#f7f4ff]">
              Agent runtime + static typing + LSP
            </h3>
            <p className="mt-3 text-pretty font-serif text-[1rem] text-white/68">
              The project already demonstrates modular imports, HTTP decorators, contracts,
              checker validation, and execution flow with `plex run` and `plex check --imports`.
            </p>
          </article>
        </section>

        <section className="rounded-[10px] border border-white/10 bg-[#050509] p-6 text-[#f7f4ff]">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
            Code Example
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-[#0d0c13] p-4 font-mono text-[12px] leading-[1.67] text-white/78">
            <code>{codeExample}</code>
          </pre>
        </section>
      </Container>
    </div>
  );
}
