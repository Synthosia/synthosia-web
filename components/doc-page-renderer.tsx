import Link from "next/link";
import { CopyCodeButton } from "@/components/copy-code-button";
import { GithubMentionCard } from "@/components/github-mention-card";
import type { DocEntry, DocWidget } from "@/lib/docs";
import type { getDictionary, Locale } from "@/lib/i18n";
import { getProjectBySlug } from "@/lib/projects";

const calloutToneClass = {
  violet: "border-violet-300/20 bg-[#171124]",
  blue: "border-blue-300/20 bg-[#0f172a]",
  green: "border-emerald-300/20 bg-[#052e24]",
};

type Dictionary = ReturnType<typeof getDictionary>;

export function DocPageRenderer({
  doc,
  nextDoc,
  dictionary,
  locale,
}: {
  doc: DocEntry;
  nextDoc?: DocEntry;
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <article className="surface-panel rounded-[16px] p-6 sm:p-8 lg:p-10" id="overview">
      <header className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">{doc.category}</p>
          <h1 className="mt-3 max-w-4xl text-balance font-display text-[2.7rem] leading-[1.04] tracking-[-0.72px] text-primary sm:text-[4.2rem]">
            {doc.title}
          </h1>
          <p className="mt-5 max-w-3xl text-pretty font-serif text-[1.14rem] leading-[1.6] text-secondary">
            {doc.description}
          </p>
        </div>
        <aside className="surface-raised rounded-[12px] p-5">
          <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
            {dictionary.docs.documentConfig}
          </p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="font-mono text-xs text-muted">slug</dt>
              <dd className="mt-1 font-display text-sm text-primary">{doc.slug}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted">widgets</dt>
              <dd className="mt-1 font-display text-sm text-primary">{doc.widgets.length}</dd>
            </div>
          </dl>
        </aside>
      </header>

      <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,0.42fr)]">
        <div className="space-y-4">
          {doc.body.map((paragraph) => (
            <p key={paragraph} className="text-pretty font-serif text-[1.08rem] leading-[1.72] text-secondary">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="surface-raised rounded-[12px] p-5">
          <h2 className="font-display text-[1.2rem] text-primary">{dictionary.docs.pageComposition}</h2>
          <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.5] text-secondary">
            {dictionary.docs.pageCompositionBody}
          </p>
        </div>
      </section>

      {doc.widgets.length > 0 ? (
        <section className="mt-10 grid gap-5 xl:grid-cols-2" id="widgets">
          {doc.widgets.map((widget, index) => (
            <DocWidgetRenderer key={`${widget.type}-${index}`} widget={widget} dictionary={dictionary} locale={locale} />
          ))}
        </section>
      ) : null}

      <section className="mt-10 rounded-[14px] border border-white/10 bg-[#12111a] p-5 sm:p-6" id="resources">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
              {dictionary.docs.widgetReference}
            </p>
            <h2 className="mt-2 font-display text-[1.45rem] text-primary">
              {dictionary.docs.widgetReferenceTitle}
            </h2>
          </div>
          <p className="font-mono text-xs text-muted">content/docs.json</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dictionary.docs.widgetReferenceItems.map((widget) => (
            <article key={widget.name} className="surface-panel rounded-lg p-4">
              <h3 className="font-mono text-sm brand-accent">{widget.name}</h3>
              <p className="mt-2 font-display text-sm text-primary">{widget.fields}</p>
              <p className="mt-2 text-pretty font-serif text-[0.95rem] leading-[1.45] text-secondary">
                {widget.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-raised mt-6 rounded-[14px] p-5 sm:p-6">
        <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">{dictionary.docs.nextStep}</p>
        {nextDoc ? (
          <Link href={`/docs/${nextDoc.slug}`} className="mt-3 block">
            <h2 className="font-display text-[1.35rem] text-primary">{nextDoc.title}</h2>
            <p className="mt-2 max-w-2xl text-pretty font-serif text-[1rem] leading-[1.5] text-secondary">
              {nextDoc.description}
            </p>
          </Link>
        ) : (
          <Link href="/docs" className="mt-3 inline-flex font-display text-sm brand-accent">
            {dictionary.docs.backToIndex}
          </Link>
        )}
      </section>
    </article>
  );
}

function DocWidgetRenderer({
  widget,
  dictionary,
  locale,
}: {
  widget: DocWidget;
  dictionary: Dictionary;
  locale: Locale;
}) {
  if (widget.type === "code") {
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050509]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-mono text-xs text-muted">{widget.label}</span>
          <CopyCodeButton value={widget.value} />
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.75] text-secondary">
          <code>{widget.value}</code>
        </pre>
      </div>
    );
  }

  if (widget.type === "callout") {
    const tone = widget.tone ?? "violet";

    return (
      <aside className={`rounded-xl border p-5 ${calloutToneClass[tone]}`}>
        <h2 className="font-display text-[1.25rem] text-primary">{widget.title}</h2>
        <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.55] text-secondary">{widget.body}</p>
      </aside>
    );
  }

  if (widget.type === "steps") {
    return (
      <section className="surface-raised rounded-xl p-5 xl:col-span-2">
        <h2 className="font-display text-[1.25rem] text-primary">{widget.title}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {widget.items.map((item, index) => (
            <li key={item.title} className="surface-panel rounded-lg p-4">
              <p className="font-mono text-xs tabular-nums brand-accent">0{index + 1}</p>
              <h3 className="mt-2 font-display text-[1.05rem] text-primary">{item.title}</h3>
              <p className="mt-2 text-pretty font-serif text-[0.98rem] leading-[1.5] text-secondary">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (widget.type === "video") {
    return (
      <section className="surface-raised rounded-xl p-5">
        <div className="surface-panel grid aspect-video place-items-center rounded-lg">
          <div className="text-center">
            <span className="surface-raised mx-auto grid size-14 place-items-center rounded-full font-display text-lg brand-accent">
              ▶
            </span>
            <p className="mt-3 font-mono text-xs text-muted">{widget.duration ?? "video"}</p>
          </div>
        </div>
        <h2 className="mt-4 font-display text-[1.25rem] text-primary">{widget.title}</h2>
        <p className="mt-2 text-pretty font-serif text-[1rem] leading-[1.55] text-secondary">{widget.body}</p>
        <Link
          href={widget.href}
          className="btn-secondary focus-themed mt-4 inline-flex rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85"
        >
          {dictionary.docs.openVideo}
        </Link>
      </section>
    );
  }

  if (widget.type === "githubProfile") {
    return (
      <section className="xl:col-span-2">
        <GithubMentionCard
          username={widget.username}
          role={widget.role}
          focus={widget.focus}
          relatedProjects={widget.relatedProjects}
          repositoryLimit={widget.repositoryLimit}
          locale={locale}
        />
      </section>
    );
  }

  if (widget.type === "projectGrid") {
    const projects = widget.projects.map((slug) => getProjectBySlug(slug, locale)).filter(Boolean);

    return (
      <section className="surface-raised rounded-xl p-5 xl:col-span-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
              {dictionary.docs.projectsEyebrow}
            </p>
            <h2 className="mt-2 font-display text-[1.35rem] text-primary">{widget.title}</h2>
          </div>
          <p className="font-mono text-xs text-muted">
            {projects.length} {dictionary.docs.linked}
          </p>
        </div>
        {widget.body ? (
          <p className="mt-3 max-w-3xl text-pretty font-serif text-[1rem] leading-[1.55] text-secondary">
            {widget.body}
          </p>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) =>
            project ? (
              <article key={project.slug} className="surface-panel rounded-lg p-4">
                <p className="font-mono text-xs uppercase tracking-[0.08em] brand-accent">{project.category}</p>
                <h3 className="mt-2 font-display text-[1.1rem] text-primary">{project.name}</h3>
                <p className="mt-2 line-clamp-3 text-pretty font-serif text-[0.96rem] leading-[1.5] text-secondary">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="surface-raised rounded-full px-2 py-1 font-display text-xs text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/projects/${project.slug}`} className="font-display text-sm brand-accent">
                    {dictionary.docs.details}
                  </Link>
                  <Link href={project.githubUrl} className="font-display text-sm text-secondary">
                    GitHub
                  </Link>
                </div>
              </article>
            ) : null,
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="surface-raised rounded-xl p-5">
      <h2 className="font-display text-[1.25rem] text-primary">{widget.title}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {widget.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="btn-secondary focus-themed rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
