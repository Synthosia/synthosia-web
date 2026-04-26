"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/lib/projects";
import type { ProjectCategory } from "@/types/project";

const filters: Array<{ label: string; value: "all" | ProjectCategory }> = [
  { label: "All", value: "all" },
  { label: "Tools", value: "tool" },
  { label: "Experiments", value: "experiment" },
  { label: "Libraries", value: "library" },
];

export function OpenSourceHub() {
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectCategory>("all");
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesFilter = activeFilter === "all" || project.category === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [project.name, project.description, ...project.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0d0c13] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-full px-3 py-1.5 font-display text-sm transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300",
                activeFilter === filter.value
                  ? "bg-[#211b33] text-white"
                  : "bg-[#12111a] text-white/62 hover:text-violet-100",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#050509] px-3 py-2">
          <span className="font-display text-xs text-white/62">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent font-display text-sm text-white outline-none placeholder:text-white/35"
            placeholder="project, tag, or capability"
          />
        </label>
      </div>
      {filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-[#0d0c13] p-8 text-center">
          <p className="font-display text-base text-[#f7f4ff]">No projects found</p>
          <p className="mt-2 font-serif text-[1rem] text-white/68">
            Try a different keyword or switch the filter.
          </p>
        </div>
      )}
    </section>
  );
}
