import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { getDictionary } from "@/lib/i18n";
import { platformConfig } from "@/lib/platform-config";
import { getProjectBySlug, projects } from "@/lib/projects";
import { getRequestLocale } from "@/lib/request-locale";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const project = getProjectBySlug(slug, locale);

  if (!project) {
    return { title: dictionary.projectPage.notFound };
  }

  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const project = getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-8">
        <header className="space-y-3">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
            {dictionary.projectPage.overview}
          </p>
          <h1 className="text-balance font-display text-[2.4rem] leading-[1.1] tracking-[-0.72px] text-[#f7f4ff] sm:text-[3rem]">
            {project.name}
          </h1>
          <p className="max-w-[65ch] text-pretty font-serif text-[1.1rem] leading-[1.5] text-white/70">
            {project.description}
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6">
            <h2 className="font-display text-[1.3rem] text-[#f7f4ff]">{dictionary.projectPage.features}</h2>
            <ul className="mt-3 space-y-2 text-pretty font-serif text-[1.02rem] leading-[1.5] text-white/70">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>

          <aside className="rounded-[10px] border border-white/10 bg-[#08070d] p-6">
            <h2 className="font-display text-[1.3rem] text-[#f7f4ff]">{dictionary.projectPage.links}</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href={project.docsUrl}
                className="rounded-lg bg-violet-200 px-3 py-2 font-display text-sm text-[#09070f] transition-colors duration-150 ease-out hover:bg-white"
              >
                {dictionary.projectPage.openDocs}
              </Link>
              <Link
                href={project.githubUrl}
                className="rounded-lg border border-white/10 bg-[#12111a] px-3 py-2 font-display text-sm text-white transition-colors duration-150 ease-out hover:text-blue-200"
              >
                {dictionary.projectPage.openGithub}
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#181524] px-2.5 py-1 font-display text-xs text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-[10px] border border-white/10 bg-[#0d0c13] p-6">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-blue-200/70">
            {dictionary.projectPage.usage}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-[#050509] p-4 font-mono text-[12px] leading-[1.67] text-white/76">
            <code>{`${platformConfig.cli.command} add ${project.slug}
${platformConfig.cli.command} docs ${project.slug}
${platformConfig.cli.command} sync ${project.slug}`}</code>
          </pre>
        </section>
      </Container>
    </div>
  );
}
