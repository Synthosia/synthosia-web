import Link from "next/link";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { getGithubRepositories } from "@/lib/github";
import { getFeaturedProjects } from "@/lib/projects";

export default async function HomePage() {
  const [featuredProjects, githubRepositories] = await Promise.all([
    Promise.resolve(getFeaturedProjects(6)),
    getGithubRepositories(4),
  ]);

  return (
    <div className="pb-12">
      <section className="border-b border-[rgba(38,37,30,0.1)] py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.6)]">
                Synthosia by SorPuti
              </p>
              <h1 className="hero-text text-balance font-display text-[2.8rem] leading-[1.05] text-[#26251e] sm:text-[4.5rem]">
                Build the future with AI-native tools
              </h1>
              <p className="max-w-[52ch] text-pretty font-serif text-[1.2rem] leading-[1.5] text-[rgba(38,37,30,0.78)]">
                A unified platform where language, backend framework, and open-source
                tools are designed as one system for modern products.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/platform"
                  className="rounded-lg bg-[#ebeae5] px-4 py-2.5 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
                >
                  Explore Platform
                </Link>
                <Link
                  href="/opensource"
                  className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] px-4 py-2.5 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#f54e00]"
                >
                  View Projects
                </Link>
              </div>
            </div>
            <div className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
                Ecosystem Signal
              </p>
              <p className="mt-4 font-serif text-[1.08rem] leading-[1.45] text-[rgba(38,37,30,0.8)]">
                Language-level AI, framework-level scale, and tool-level velocity.
                Every layer amplifies the next.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#f2f1ed] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-[#26251e]">3</p>
                  <p className="font-display text-[11px] uppercase text-[rgba(38,37,30,0.58)]">
                    Core Lines
                  </p>
                </div>
                <div className="rounded-lg bg-[#f2f1ed] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-[#26251e]">6+</p>
                  <p className="font-display text-[11px] uppercase text-[rgba(38,37,30,0.58)]">
                    Projects
                  </p>
                </div>
                <div className="rounded-lg bg-[#f2f1ed] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-[#26251e]">1</p>
                  <p className="font-display text-[11px] uppercase text-[rgba(38,37,30,0.58)]">
                    Platform Vision
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="Core Products"
            title="Plex + Strider + Tooling OSS"
            description="O ecossistema é composto por produtos conectados, com papéis claros e integração entre camadas."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ProductCard
              title="Plex Language"
              description="Linguagem e toolchain Rust com checker, runtime, CLI e LSP para fluxos AI-native."
              href="/language"
              tone="language"
            />
            <ProductCard
              title="Strider Framework"
              description="Framework backend Python com ergonomia estilo Django e performance async inspirada no FastAPI."
              href="/framework"
              tone="framework"
            />
            <ProductCard
              title="MCP + Open Source Tools"
              description="MCP Server, workers, integrações e utilitários que sustentam operação e evolução da plataforma."
              href="/opensource"
              tone="tools"
            />
          </div>
        </Container>
      </section>

      <section className="border-y border-[rgba(38,37,30,0.1)] bg-[#ebeae5] py-16">
        <Container>
          <blockquote className="max-w-3xl text-balance font-display text-[2rem] leading-[1.15] tracking-[-0.72px] text-[#26251e] sm:text-[2.25rem]">
            We do not build isolated apps. We design evolvable systems where AI,
            backend architecture, and tooling move as one product organism.
          </blockquote>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="Featured Projects"
            title="High-leverage tools from the ecosystem"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-4">
        <Container className="space-y-5">
          <SectionHeading
            eyebrow="GitHub Live"
            title="Repositories fetched from GitHub API"
            description="Auto-synced list ready for scaling the open-source hub over time."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {githubRepositories.length > 0 ? (
              githubRepositories.map((repository) => (
                <article
                  key={repository.id}
                  className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-4"
                >
                  <h3 className="font-display text-lg text-[#26251e]">{repository.name}</h3>
                  <p className="mt-1 font-serif text-[1rem] text-[rgba(38,37,30,0.72)]">
                    {repository.description ?? "No description provided yet."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-mono text-xs tabular-nums text-[rgba(38,37,30,0.6)]">
                      Stars {repository.stargazers_count}
                    </p>
                    <Link
                      href={repository.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
                    >
                      Open repo
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-5">
                <p className="font-display text-base text-[#26251e]">GitHub integration ready.</p>
                <p className="mt-2 font-serif text-[1rem] text-[rgba(38,37,30,0.72)]">
                  Set GITHUB_USERNAME and optional GITHUB_TOKEN to fetch live repositories.
                </p>
              </article>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
