import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Language",
  description:
    "Plex Language: toolchain Rust modular com runtime de agentes, multi-provider AI e LSP integrado.",
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
  "Workspace Rust com módulos dedicados para lexer, parser, checker, runtime, CLI e LSP.",
  "Suporte a providers Ollama, OpenAI, Claude e OpenCode via configuração e variáveis de ambiente.",
  "Manifesto Plex.toml com strict_types e políticas explícitas de segurança para execução de agentes.",
];

export default function LanguagePage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Programming Language"
          title="Plex: linguagem com AI integrada na toolchain"
          description="Plex combina semântica de linguagem, runtime de agentes e experiência de editor em um único ecossistema."
        />

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6">
            <h3 className="font-display text-[1.38rem] tracking-[-0.11px] text-[#26251e]">
              What makes it unique
            </h3>
            <ul className="mt-4 space-y-3 text-pretty font-serif text-[1.02rem] leading-[1.5] text-[rgba(38,37,30,0.78)]">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-6">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
              Core Focus
            </p>
            <h3 className="mt-3 text-balance font-display text-[1.3rem] text-[#26251e]">
              Runtime de agentes + tipagem estática + LSP
            </h3>
            <p className="mt-3 text-pretty font-serif text-[1rem] text-[rgba(38,37,30,0.74)]">
              O projeto já demonstra imports modulares, decorators HTTP, contracts,
              validação com checker e fluxo de execução com `plex run` e `plex check --imports`.
            </p>
          </article>
        </section>

        <section className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#26251e] p-6 text-[#f2f1ed]">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(242,241,237,0.7)]">
            Code Example
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-[rgba(242,241,237,0.14)] bg-[#1f1e18] p-4 font-mono text-[12px] leading-[1.67] text-[#f2f1ed]">
            <code>{codeExample}</code>
          </pre>
        </section>
      </Container>
    </div>
  );
}
