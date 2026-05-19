import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { OpenSourceHub } from "@/components/opensource-hub";
import { SectionHeading } from "@/components/section-heading";
import { getGithubRepositories } from "@/lib/github";

export const metadata: Metadata = {
  title: "Open Source Hub",
  description:
    "Browse ecosystem projects with tags, filters, and GitHub integration for scalable discovery.",
};

export default async function OpenSourcePage() {
  const githubRepositories = await getGithubRepositories(8);

  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Open Source"
          title="Ecosystem projects in one hub"
          description="Curated catalog with filters, tags, and GitHub integration for scalable project discovery."
        />

        <section className="grid gap-3 md:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
              Local Source
            </p>
            <h3 className="mt-2 font-display text-xl text-[#f7f4ff]">plex-lang</h3>
            <p className="mt-2 font-serif text-[1rem] text-white/68">
              Rust workspace with compiler, checker, runtime, CLI, and LSP for the Plex language.
            </p>
            <Link
              href="https://github.com/MF07-Language-Programing/plex-lang"
              className="mt-3 inline-flex font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
            >
              Open repository
            </Link>
          </article>

          <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-violet-200/70">
              Local Source
            </p>
            <h3 className="mt-2 font-display text-xl text-[#f7f4ff]">core-framework</h3>
            <p className="mt-2 font-serif text-[1rem] text-white/68">
              Strider Framework, technical documentation, and MCP Server for search and validation with guardrails.
            </p>
            <Link
              href="https://github.com/SorPuti/core-framework"
              className="mt-3 inline-flex font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
            >
              Open repository
            </Link>
          </article>
        </section>

        <OpenSourceHub />

        <section className="space-y-4">
          <h2 className="text-balance font-display text-[1.6rem] text-[#f7f4ff]">From GitHub API</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {githubRepositories.length > 0 ? (
              githubRepositories.map((repository) => (
                <article
                  key={repository.id}
                  className="rounded-lg border border-white/10 bg-[#0d0c13] p-4"
                >
                  <h3 className="font-display text-lg text-[#f7f4ff]">{repository.name}</h3>
                  <p className="mt-2 font-serif text-[1rem] text-white/68">
                    {repository.description ?? "No description provided yet."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-white/58">
                      Stars {repository.stargazers_count}
                    </span>
                    <Link
                      href={repository.html_url}
                      className="font-display text-sm text-blue-200 transition-colors duration-150 ease-out hover:text-white"
                    >
                      GitHub
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-lg border border-white/10 bg-[#0d0c13] p-5">
                <p className="font-display text-base text-[#f7f4ff]">
                  Connect GITHUB_USERNAME to display repositories.
                </p>
              </article>
            )}
          </div>
        </section>
      </Container>
    </div>
  );
}
