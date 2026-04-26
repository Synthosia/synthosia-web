import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Understand how Plex Language, Strider Framework, and open-source tooling connect as one ecosystem.",
};

const connectionSteps = [
  {
    id: "language",
    title: "Plex Language",
    description:
      "A base da linguagem e da toolchain: parser, checker, runtime, CLI e LSP com manifesto próprio.",
    href: "/language",
    tone: "bg-[#dfa88f]/45",
  },
  {
    id: "framework",
    title: "Strider Framework",
    description:
      "Camada backend para APIs e serviços com ergonomia de framework maduro e performance async moderna.",
    href: "/framework",
    tone: "bg-[#9fbbe0]/45",
  },
  {
    id: "tools",
    title: "MCP + Tooling OSS",
    description:
      "Ferramentas de suporte como MCP Server, pacotes de runtime e infraestrutura de DX para times.",
    href: "/opensource",
    tone: "bg-[#9fc9a2]/45",
  },
];

export default function PlatformPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Platform"
          title="Dois repositórios centrais, um ecossistema único"
          description="Plex e core-framework evoluem juntos para formar uma plataforma coerente de linguagem, backend e operações."
        />

        <section className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6 sm:p-8">
          <p className="max-w-[60ch] text-pretty font-serif text-[1.08rem] leading-[1.5] text-[rgba(38,37,30,0.8)]">
            Em vez de montar uma pilha desconexa, o ecossistema conecta linguagem,
            execução de serviços e tooling operacional com contratos e padrões consistentes.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            {connectionSteps.map((step, index) => (
              <div key={step.id} className="contents">
                <article className="flex flex-col rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-5">
                  <span className={`mb-4 h-2 w-12 rounded-full ${step.tone}`} />
                  <h3 className="text-balance font-display text-[1.3rem] tracking-[-0.11px] text-[#26251e]">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty font-serif text-[1rem] leading-[1.5] text-[rgba(38,37,30,0.75)]">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-4 font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
                  >
                    Open layer
                  </Link>
                </article>
                {index < connectionSteps.length - 1 ? (
                  <div className="hidden items-center justify-center md:flex">
                    <span className="font-mono text-sm text-[rgba(38,37,30,0.55)]">--&gt;</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
