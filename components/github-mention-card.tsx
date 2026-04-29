import Image from "next/image";
import Link from "next/link";
import { getGithubMention } from "@/lib/github";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";
import { getProjectBySlug } from "@/lib/projects";

type GithubMentionCardProps = {
  username: string;
  role?: string;
  focus?: string;
  relatedProjects?: string[];
  repositoryLimit?: number;
  locale?: Locale;
};

export async function GithubMentionCard({
  username,
  role,
  focus,
  relatedProjects = [],
  repositoryLimit = 4,
  locale = defaultLocale,
}: GithubMentionCardProps) {
  const mention = await getGithubMention(username, repositoryLimit);
  const dictionary = getDictionary(locale);

  if (!mention) {
    return (
      <article className="surface-panel rounded-[14px] p-5">
        <p className="font-display text-[1.2rem] text-primary">@{username}</p>
        <p className="mt-2 font-serif text-[1rem] text-secondary">
          {dictionary.githubMention.loadError}
        </p>
      </article>
    );
  }

  const { profile, repositories } = mention;
  const resolvedProjects = relatedProjects.map((slug) => getProjectBySlug(slug, locale)).filter(Boolean);

  return (
    <article className="surface-panel overflow-hidden rounded-[16px]">
      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="surface-raised p-6">
          <div className="relative size-28 overflow-hidden rounded-[18px] border border-white/10">
            <Image
              src={profile.avatar_url}
              alt={`${profile.login} avatar`}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <h2 className="mt-5 font-display text-[1.55rem] text-primary">
            {profile.name ?? profile.login}
          </h2>
          <p className="mt-1 font-mono text-sm brand-accent">@{profile.login}</p>
          {role ? <p className="mt-3 font-display text-sm text-primary">{role}</p> : null}
          {profile.location ? <p className="mt-2 font-serif text-[0.98rem] text-secondary">{profile.location}</p> : null}
          <Link
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary focus-themed mt-5 inline-flex rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85"
          >
            {dictionary.githubMention.profile}
          </Link>
        </aside>

        <div className="p-6">
          <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
            {dictionary.githubMention.mention}
          </p>
          <p className="mt-3 max-w-3xl text-pretty font-serif text-[1.08rem] leading-[1.6] text-secondary">
            {profile.bio ?? focus ?? dictionary.githubMention.defaultBio}
          </p>
          {focus && focus !== profile.bio ? (
            <p className="mt-3 max-w-3xl text-pretty font-serif text-[1rem] leading-[1.55] text-secondary">
              {focus}
            </p>
          ) : null}

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="surface-raised rounded-lg p-4">
              <dt className="font-display text-xs uppercase tracking-[0.08em] text-muted">
                {dictionary.githubMention.repos}
              </dt>
              <dd className="mt-2 font-display text-[1.5rem] tabular-nums text-primary">{profile.public_repos}</dd>
            </div>
            <div className="surface-raised rounded-lg p-4">
              <dt className="font-display text-xs uppercase tracking-[0.08em] text-muted">
                {dictionary.githubMention.followers}
              </dt>
              <dd className="mt-2 font-display text-[1.5rem] tabular-nums text-primary">{profile.followers}</dd>
            </div>
            <div className="surface-raised rounded-lg p-4">
              <dt className="font-display text-xs uppercase tracking-[0.08em] text-muted">
                {dictionary.githubMention.following}
              </dt>
              <dd className="mt-2 font-display text-[1.5rem] tabular-nums text-primary">{profile.following}</dd>
            </div>
          </dl>

          {repositories.length > 0 ? (
            <section className="mt-6">
              <h3 className="font-display text-[1.2rem] text-primary">{dictionary.githubMention.projects}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {repositories.map((repository) => (
                  <Link
                    key={repository.id}
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-raised rounded-lg p-4 transition duration-150 hover:opacity-85"
                  >
                    <p className="font-display text-[1rem] text-primary">{repository.name}</p>
                    <p className="mt-2 line-clamp-2 font-serif text-[0.95rem] leading-[1.45] text-secondary">
                      {repository.description ?? dictionary.githubMention.repositoryFallback}
                    </p>
                    <p className="mt-3 font-mono text-xs tabular-nums text-muted">
                      {repository.language ?? dictionary.githubMention.code} · {repository.stargazers_count}{" "}
                      {dictionary.githubMention.stars}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {resolvedProjects.length > 0 ? (
            <section className="mt-6">
              <h3 className="font-display text-[1.2rem] text-primary">{dictionary.githubMention.related}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {resolvedProjects.map((project) =>
                  project ? (
                    <Link
                      key={project.slug}
                      href={`/projects/${project.slug}`}
                      className="btn-secondary focus-themed rounded-full px-3 py-1.5 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85"
                    >
                      {project.name}
                    </Link>
                  ) : null,
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
