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
          title="Projetos do ecossistema em um único hub"
          description="Catálogo curado a partir dos repositórios locais plex-lang e core-framework, com filtros por categoria e busca por tags."
        />

        <section className="grid gap-3 md:grid-cols-2">
          <article className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-5">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
              Local Source
            </p>
            <h3 className="mt-2 font-display text-xl text-[#26251e]">plex-lang</h3>
            <p className="mt-2 font-serif text-[1rem] text-[rgba(38,37,30,0.75)]">
              Workspace Rust com compilador, checker, runtime, CLI e LSP para a linguagem Plex.
            </p>
            <Link
              href="https://github.com/MF07-Language-Programing/plex-lang"
              className="mt-3 inline-flex font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
            >
              Open repository
            </Link>
          </article>

          <article className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#e6e5e0] p-5">
            <p className="font-display text-xs uppercase tracking-[0.08em] text-[rgba(38,37,30,0.55)]">
              Local Source
            </p>
            <h3 className="mt-2 font-display text-xl text-[#26251e]">core-framework</h3>
            <p className="mt-2 font-serif text-[1rem] text-[rgba(38,37,30,0.75)]">
              Strider Framework, documentação técnica e MCP Server para busca e validação com guardrails.
            </p>
            <Link
              href="https://github.com/SorPuti/core-framework"
              className="mt-3 inline-flex font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
            >
              Open repository
            </Link>
          </article>
        </section>

        <OpenSourceHub />

        <section className="space-y-4">
          <h2 className="text-balance font-display text-[1.6rem] text-[#26251e]">From GitHub API</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {githubRepositories.length > 0 ? (
              githubRepositories.map((repository) => (
                <article
                  key={repository.id}
                  className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-4"
                >
                  <h3 className="font-display text-lg text-[#26251e]">{repository.name}</h3>
                  <p className="mt-2 font-serif text-[1rem] text-[rgba(38,37,30,0.72)]">
                    {repository.description ?? "No description provided yet."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-[rgba(38,37,30,0.6)]">
                      Stars {repository.stargazers_count}
                    </span>
                    <Link
                      href={repository.html_url}
                      className="font-display text-sm text-[#f54e00] transition-colors duration-150 ease-out hover:text-[#cf2d56]"
                    >
                      GitHub
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="rounded-lg border border-[rgba(38,37,30,0.1)] bg-[#f7f7f4] p-5">
                <p className="font-display text-base text-[#26251e]">
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
