import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { getProjectBySlug, projects } from "@/lib/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-8">
        <header className="space-y-3">
          <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.58)]">
            Project Overview
          </p>
          <h1 className="text-balance font-display text-[2.4rem] leading-[1.1] tracking-[-0.72px] text-[#26251e] sm:text-[3rem]">
            {project.name}
          </h1>
          <p className="max-w-[65ch] text-pretty font-serif text-[1.1rem] leading-[1.5] text-[rgba(38,37,30,0.76)]">
            {project.description}
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-6">
            <h2 className="font-display text-[1.3rem] text-[#26251e]">Features</h2>
            <ul className="mt-3 space-y-2 text-pretty font-serif text-[1.02rem] leading-[1.5] text-[rgba(38,37,30,0.78)]">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>

          <aside className="rounded-[10px] border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-6">
            <h2 className="font-display text-[1.3rem] text-[#26251e]">Links</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href={project.docsUrl}
                className="rounded-lg bg-[#ebeae5] px-3 py-2 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
              >
                Open docs
              </Link>
              <Link
                href={project.githubUrl}
                className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f2f1ed] px-3 py-2 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#f54e00]"
              >
                Open GitHub
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#e1e0db] px-2.5 py-1 font-display text-xs text-[rgba(38,37,30,0.75)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </section>
      </Container>
    </div>
  );
}
