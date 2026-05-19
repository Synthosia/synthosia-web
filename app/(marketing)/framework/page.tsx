import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Framework",
  description:
    "Strider Framework: Django-inspired Python backend with async execution and performance close to pure FastAPI.",
};

const pillars = [
  {
    title: "Django-inspired structure",
    description:
      "ModelViewSets, action-level permissions, authentication, and app organization to accelerate product REST APIs.",
  },
  {
    title: "FastAPI-inspired performance",
    description:
      "Async architecture with SQLAlchemy 2.0 and Pydantic v2, preserving high request throughput with low overhead.",
  },
  {
    title: "Built-in admin panel",
    description:
      "Administrative and operational layer on the roadmap, aligned with the batteries-included Django-style goal.",
  },
  {
    title: "Scalability by design",
    description:
      "Plug-and-play features for messaging, workers, and multi-tenancy with settings-based centralized configuration.",
  },
];

export default function FrameworkPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Framework"
          title="Strider: mature framework productivity with a modern runtime"
          description="The goal is to remove the trade-off between high-level DX and async API throughput."
        />

        <section className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6"
            >
              <p className="font-mono text-xs tabular-nums text-violet-200/70">0{index + 1}</p>
              <h3 className="mt-2 text-balance font-display text-[1.3rem] tracking-[-0.11px] text-[#f7f4ff]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-white/68">
                {pillar.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[10px] border border-white/10 bg-[#08070d] p-6">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-blue-200/70">
            Benchmark Snapshot
          </p>
          <p className="mt-3 text-pretty font-serif text-[1rem] leading-[1.5] text-white/70">
            In the repository benchmarks, Strider reaches approximately 14.1k req/s,
            keeping about 93% of the performance of a pure FastAPI implementation,
            with a substantial advantage over traditional synchronous stacks.
          </p>
        </section>
      </Container>
    </div>
  );
}
