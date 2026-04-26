import Link from "next/link";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-violet-300/25 hover:shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
      <p className="font-display text-xs uppercase tabular-nums text-white/48">
        {project.category}
      </p>
      <h3 className="mt-2 text-balance font-display text-[1.25rem] text-[#f7f4ff]">
        {project.name}
      </h3>
      <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-white/68">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#181524] px-2.5 py-1 font-display text-xs text-white/70"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/projects/${project.slug}`}
          className="rounded-lg bg-[#171124] px-3 py-2 font-display text-sm text-violet-100 transition-colors duration-150 ease-out hover:text-white"
        >
          View project
        </Link>
        <Link
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
        >
          GitHub
        </Link>
      </div>
    </article>
  );
}
