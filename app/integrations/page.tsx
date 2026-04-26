import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Connect authentication, API keys, webhooks, GitHub, and external services to Synthosia projects.",
};

const integrations = [
  {
    name: "Authentication",
    status: "Ready for OAuth",
    description: "Login, register, service identity, and project-level permissions.",
  },
  {
    name: "API keys",
    status: "Scoped resources",
    description: "Issue, rotate, and audit keys per account, project, and external service.",
  },
  {
    name: "Webhooks",
    status: "Event driven",
    description: "Subscribe to project sync, repository updates, deploy hooks, and CLI events.",
  },
  {
    name: "GitHub",
    status: "Live sync",
    description: "Auto-sync open-source repositories and expose project metadata in the platform.",
  },
  {
    name: "AI providers",
    status: "Multi-provider",
    description: "Prepare provider credentials for Plex language agents and framework workflows.",
  },
  {
    name: "External services",
    status: "Connectors",
    description: "Future-ready slots for deploy targets, observability, queues, and auth providers.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Integrations"
          title="Connect services without scattering platform state"
          description="Integrations are managed as account and project resources so API keys, webhooks, providers, and GitHub sync stay understandable."
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <article key={integration.name} className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6">
              <p className="font-mono text-xs text-blue-200/70">{integration.status}</p>
              <h2 className="mt-3 font-display text-[1.3rem] tracking-[-0.11px] text-[#f7f4ff]">
                {integration.name}
              </h2>
              <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-white/68">
                {integration.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[10px] border border-white/10 bg-[#08070d] p-6">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">Connection model</p>
          <div className="mt-5 grid gap-3 font-mono text-[12px] text-white/70 md:grid-cols-5">
            {["Account", "Project", "API key", "Webhook", "Service"].map((item, index) => (
              <div key={item} className="rounded-lg border border-white/10 bg-[#12111a] p-3">
                <span className="text-violet-200">0{index + 1}</span>
                <p className="mt-2">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
