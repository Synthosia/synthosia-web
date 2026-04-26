import Link from "next/link";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { getGithubRepositories } from "@/lib/github";
import { platformConfig } from "@/lib/platform-config";
import { getFeaturedProjects } from "@/lib/projects";

export default async function HomePage() {
  const [featuredProjects, githubRepositories] = await Promise.all([
    Promise.resolve(getFeaturedProjects(6)),
    getGithubRepositories(4),
  ]);

  return (
    <div className="pb-12">
      <section className="border-b border-white/10 py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
                Synthosia Developer Platform
              </p>
              <h1 className="hero-text text-balance font-display text-[2.8rem] leading-[1.05] text-[#f7f4ff] sm:text-[4.5rem]">
                AI-native platform for building scalable systems
              </h1>
              <p className="max-w-[56ch] text-pretty font-serif text-[1.2rem] leading-[1.5] text-white/72">
                A unified ecosystem where programming language, backend framework,
                CLI, integrations, and open-source tools work as one developer platform.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/get-started"
                  className="rounded-lg bg-violet-200 px-4 py-2.5 font-display text-sm text-[#09070f] transition-colors duration-150 ease-out hover:bg-white"
                >
                  Get Started
                </Link>
                <Link
                  href="/docs"
                  className="rounded-lg border border-white/10 bg-[#12111a] px-4 py-2.5 font-display text-sm text-white transition-colors duration-150 ease-out hover:text-violet-200"
                >
                  Docs
                </Link>
                <Link
                  href="/platform"
                  className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 font-display text-sm text-white/74 transition-colors duration-150 ease-out hover:text-white"
                >
                  View Platform
                </Link>
              </div>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.36)]">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-blue-200/70">
                Platform Console
              </p>
              <p className="mt-4 font-serif text-[1.08rem] leading-[1.45] text-white/72">
                One account connects projects, API keys, integrations, CLI sessions,
                documentation, and open-source releases.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#12111a] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-white">4</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    Platform Areas
                  </p>
                </div>
                <div className="rounded-lg bg-[#12111a] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-white">6+</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    Projects
                  </p>
                </div>
                <div className="rounded-lg bg-[#12111a] px-2 py-3">
                  <p className="font-display text-lg tabular-nums text-white">DX</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    First
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-[#050509] p-4 font-mono text-[12px] leading-[1.67] text-white/70">
                <p><span className="text-violet-200">$</span> {platformConfig.cli.command} init api</p>
                <p><span className="text-blue-200">sync</span> language -&gt; framework -&gt; integrations</p>
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
            description="The ecosystem is made of connected products with clear roles across language, framework, tools, and account workflows."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <ProductCard
              title="Plex Language"
              description="Rust language and toolchain with checker, runtime, CLI, and LSP for AI-native workflows."
              href="/language"
              tone="language"
            />
            <ProductCard
              title="Strider Framework"
              description="Python backend framework with Django-style ergonomics and FastAPI-inspired async performance."
              href="/framework"
              tone="framework"
            />
            <ProductCard
              title="MCP + Open Source Tools"
              description="MCP Server, workers, integrations, and utilities that support platform operations and evolution."
              href="/opensource"
              tone="tools"
            />
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-[#08070d] py-16">
        <Container>
          <blockquote className="max-w-3xl text-balance font-display text-[2rem] leading-[1.15] tracking-[-0.72px] text-[#f7f4ff] sm:text-[2.25rem]">
            Learn in the docs, build with the language and framework, manage from
            account surfaces, and extend through open source.
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
                  className="rounded-lg border border-white/10 bg-[#0d0c13] p-4"
                >
                  <h3 className="font-display text-lg text-[#f7f4ff]">{repository.name}</h3>
                  <p className="mt-1 font-serif text-[1rem] text-white/68">
                    {repository.description ?? "No description provided yet."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-mono text-xs tabular-nums text-white/58">
                      Stars {repository.stargazers_count}
                    </p>
                    <Link
                      href={repository.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
                    >
                      Open repo
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5">
                <p className="font-display text-base text-[#f7f4ff]">GitHub integration ready.</p>
                <p className="mt-2 font-serif text-[1rem] text-white/68">
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
