import Image from "next/image";
import Link from "next/link";
import { getGithubProfile } from "@/lib/github";
import type { PersonMentionConfig } from "@/lib/people";

export async function FounderProfile({ founder }: { founder: PersonMentionConfig }) {
  const profile = await getGithubProfile(founder.username);

  return (
    <article className="surface-panel overflow-hidden rounded-[24px]">
      <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
        <aside className="surface-raised p-6 sm:p-8">
          <div className="relative size-32 overflow-hidden rounded-[22px] border border-white/10">
            {profile ? (
              <Image src={profile.avatar_url} alt={`${profile.login} avatar`} fill sizes="128px" className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center font-display text-3xl brand-accent">
                {founder.username.slice(0, 1)}
              </div>
            )}
          </div>
          <p className="mt-5 font-display text-xs uppercase brand-accent">{founder.role}</p>
          <h2 className="mt-2 text-balance font-display text-[2rem] leading-[1.08] text-primary">
            {profile?.name ?? founder.username}
          </h2>
          <p className="mt-2 font-mono text-sm text-secondary">@{profile?.login ?? founder.username}</p>
          {profile?.location ? <p className="mt-3 font-serif text-[1rem] text-secondary">{profile.location}</p> : null}
          {profile ? (
            <Link
              href={profile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary focus-themed mt-5 inline-flex rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85"
            >
              GitHub profile
            </Link>
          ) : null}
        </aside>

        <div className="p-6 sm:p-8">
          <p className="font-display text-xs uppercase brand-accent">Founder story</p>
          <p className="mt-4 max-w-3xl text-pretty font-serif text-[1.18rem] leading-[1.65] text-secondary">
            {founder.description ?? founder.focus}
          </p>
          <p className="mt-4 max-w-3xl text-pretty font-serif text-[1rem] leading-[1.6] text-secondary">
            {founder.focus}
          </p>

          {founder.details && founder.details.length > 0 ? (
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {founder.details.map((detail) => (
                <li key={detail} className="surface-raised rounded-xl p-4 text-pretty font-serif text-[0.98rem] leading-[1.5] text-secondary">
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}
