import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Framework",
  description:
    "Strider Framework: backend Python Django-inspired com execução async e performance próxima ao FastAPI puro.",
};

const pillars = [
  {
    title: "Django-inspired structure",
    description:
      "ModelViewSets, permissões por ação, autenticação e organização por apps para acelerar APIs REST de produto.",
  },
  {
    title: "FastAPI-inspired performance",
    description:
      "Arquitetura async com SQLAlchemy 2.0 e Pydantic v2, mantendo alta taxa de requests com baixo overhead.",
  },
  {
    title: "Built-in admin panel",
    description:
      "Camada administrativa e operacional no roadmap, alinhada ao objetivo de baterias incluídas no estilo Django.",
  },
  {
    title: "Scalability by design",
    description:
      "Features plug-and-play para messaging, workers e multi-tenancy com configuração centralizada via settings.",
  },
];

export default function FrameworkPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Framework"
          title="Strider: produtividade de framework maduro com runtime moderno"
          description="A proposta é eliminar o trade-off entre DX de alto nível e throughput de APIs assíncronas."
        />

        <section className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6"
            >
              <p className="font-mono text-xs tabular-nums text-[rgba(38,37,30,0.55)]">0{index + 1}</p>
              <h3 className="mt-2 text-balance font-display text-[1.3rem] tracking-[-0.11px] text-[#26251e]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
                {pillar.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-6">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
            Benchmark Snapshot
          </p>
          <p className="mt-3 text-pretty font-serif text-[1rem] leading-[1.5] text-[rgba(38,37,30,0.78)]">
            Nos benchmarks do repositório, Strider alcança aproximadamente 14.1k req/s,
            mantendo cerca de 93% da performance de uma implementação FastAPI pura,
            com vantagem substancial sobre stacks tradicionais síncronas.
          </p>
        </section>
      </Container>
    </div>
  );
}
