import type { Metadata } from "next";
import { Container } from "@/components/container";
import { FounderProfile } from "@/components/founder-profile";
import { GithubMentionCard } from "@/components/github-mention-card";
import { JoinContributorModal } from "@/components/join-contributor-modal";
import { SectionHeading } from "@/components/section-heading";
import { contributors, founder } from "@/lib/people";

export const metadata: Metadata = {
  title: "About Synthosia",
  description:
    "Meet the developer and contributors behind Synthosia, fetched from GitHub and connected to ecosystem projects.",
};

export default function AboutPage() {
  const visibleContributors = contributors.filter((contributor) => contributor.username !== founder.username);

  return (
    <div className="py-16 sm:py-20">
      <Container className="space-y-12">
        <SectionHeading
          eyebrow="About"
          title="Builders and contributors behind Synthosia"
          description="Developer profiles are resolved from GitHub mentions, then connected to local ecosystem projects and contribution context."
        />

        <FounderProfile founder={founder} />

        <section className="space-y-5">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">Contributors</p>
            <h2 className="mt-2 font-display text-[2rem] leading-[1.15] text-primary sm:text-[2.25rem] sm:tracking-[-0.72px]">
              Related people and maintainers
            </h2>
          </div>
          <div className="surface-panel rounded-[18px] p-6 sm:p-8">
            <p className="font-display text-xs uppercase brand-accent">Open contributor seats</p>
            <h3 className="mt-3 text-balance font-display text-[1.7rem] leading-[1.12] text-primary">
              No contributors are listed yet.
            </h3>
            <p className="mt-3 max-w-2xl text-pretty font-serif text-[1.05rem] leading-[1.6] text-secondary">
              Synthosia is ready for collaborators who want to help with language tooling, framework design,
              documentation, integrations, and open-source infrastructure.
            </p>
            <div className="mt-5">
              <JoinContributorModal />
            </div>
          </div>
          {visibleContributors.length > 0 && (
            <div className="grid gap-5">
              {visibleContributors.map((contributor) => (
                <GithubMentionCard
                  key={contributor.username}
                  username={contributor.username}
                  role={contributor.role}
                  focus={contributor.focus}
                  relatedProjects={contributor.relatedProjects}
                  repositoryLimit={3}
                />
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
