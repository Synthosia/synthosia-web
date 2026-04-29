import Link from "next/link";
import { Container } from "@/components/container";
import { ProductCard } from "@/components/product-card";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { getGithubRepositories } from "@/lib/github";
import { platformConfig } from "@/lib/platform-config";
import { getFeaturedProjects } from "@/lib/projects";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const [featuredProjects, githubRepositories] = await Promise.all([
    Promise.resolve(getFeaturedProjects(6)),
    getGithubRepositories(4),
  ]);

  return (
    <div className="pb-12">
      <section className="border-b border-white/10 py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
                {dictionary.home.heroEyebrow}
              </p>
              <h1 className="hero-text text-balance font-display text-[2.5rem] leading-[1.05] text-[#f7f4ff] sm:text-[4rem]">
                {dictionary.home.heroTitle}
              </h1>
              <p className="max-w-[56ch] text-pretty font-serif text-[1.06rem] leading-[1.55] text-white/72 sm:text-[1.2rem]">
                {dictionary.home.heroDescription}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/get-started"
                  className="rounded-lg bg-violet-200 px-4 py-2.5 font-display text-sm text-[#09070f] transition-colors duration-150 ease-out hover:bg-white"
                >
                  {dictionary.home.getStarted}
                </Link>
                <Link
                  href="/docs"
                  className="rounded-lg border border-white/10 bg-[#12111a] px-4 py-2.5 font-display text-sm text-white transition-colors duration-150 ease-out hover:text-violet-200"
                >
                  {dictionary.home.docs}
                </Link>
                <Link
                  href="/platform"
                  className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 font-display text-sm text-white/74 transition-colors duration-150 ease-out hover:text-white"
                >
                  {dictionary.home.viewPlatform}
                </Link>
              </div>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.36)]">
              <p className="font-display text-xs uppercase tracking-[0.08em] text-blue-200/70">
                {dictionary.home.platformConsoleEyebrow}
              </p>
              <p className="mt-4 font-serif text-[1.08rem] leading-[1.45] text-white/72">
                {dictionary.home.platformConsoleBody}
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-lg bg-[#12111a] px-3 py-3">
                  <p className="font-display text-lg tabular-nums text-white">4</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    {dictionary.home.platformAreas}
                  </p>
                </div>
                <div className="rounded-lg bg-[#12111a] px-3 py-3">
                  <p className="font-display text-lg tabular-nums text-white">6+</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    {dictionary.home.projects}
                  </p>
                </div>
                <div className="rounded-lg bg-[#12111a] px-3 py-3">
                  <p className="font-display text-lg tabular-nums text-white">DX</p>
                  <p className="font-display text-[11px] uppercase text-white/52">
                    {dictionary.home.dxFirst}
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-[#050509] p-4 font-mono text-[12px] leading-[1.67] text-white/70">
                <p>
                  <span className="text-violet-200">$</span>{" "}
                  {dictionary.home.cliCommand.replace("{command}", platformConfig.cli.command)}
                </p>
                <p>{dictionary.home.cliSync}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow={dictionary.home.coreProductsEyebrow}
            title={dictionary.home.coreProductsTitle}
            description={dictionary.home.coreProductsDescription}
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
            eyebrow={dictionary.home.featuredProjectsEyebrow}
            title={dictionary.home.featuredProjectsTitle}
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
            eyebrow={dictionary.home.githubLiveEyebrow}
            title={dictionary.home.githubLiveTitle}
            description={dictionary.home.githubLiveDescription}
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
                    {repository.description ?? dictionary.home.githubRepoFallbackBody}
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs tabular-nums text-white/58">
                      Stars {repository.stargazers_count}
                    </p>
                    <Link
                      href={repository.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
                    >
                      {dictionary.home.githubOpenRepo}
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5">
                <p className="font-display text-base text-[#f7f4ff]">{dictionary.home.githubRepoFallbackTitle}</p>
                <p className="mt-2 font-serif text-[1rem] text-white/68">
                  {dictionary.home.githubRepoFallbackBody}
                </p>
              </article>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}
