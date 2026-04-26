import Link from "next/link";
import type { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-5 transition-shadow duration-200 ease-out hover:shadow-md">
      <p className="font-display text-xs uppercase tabular-nums text-[rgba(38,37,30,0.55)]">
        {project.category}
      </p>
      <h3 className="mt-2 text-balance font-display text-[1.25rem] text-[#26251e]">
        {project.name}
      </h3>
      <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-[rgba(38,37,30,0.75)]">
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#e1e0db] px-2.5 py-1 font-display text-xs text-[rgba(38,37,30,0.75)]"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={`/projects/${project.slug}`}
          className="rounded-lg bg-[#ebeae5] px-3 py-2 font-display text-sm text-[#26251e] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
        >
          View project
        </Link>
        <Link
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
        >
          GitHub
        </Link>
      </div>
    </article>
  );
}
