"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { getDocCategories, getDocs, getDocsByCategory, type DocEntry } from "@/lib/docs";

const categoryIconMap: Record<string, string> = {
  "Getting Started": "↗",
  Language: "{}",
  Framework: "▦",
  CLI: "$_",
  Integrations: "⎇",
  "Account & Platform": "◎",
  "Primeiros passos": "↗",
  Linguagem: "{}",
  Integrações: "⎇",
  "Conta e plataforma": "◎",
};

export function DocsExplorer() {
  const [query, setQuery] = useState("");
  const { locale, dictionary } = useLanguage();
  const localizedDocs = useMemo(() => getDocs(locale), [locale]);
  const docCategories = useMemo(() => getDocCategories(locale), [locale]);

  const filteredDocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return localizedDocs;
    }

    return localizedDocs.filter((doc) =>
      [doc.title, doc.description, doc.category, ...doc.body].join(" ").toLowerCase().includes(normalizedQuery),
    );
  }, [localizedDocs, query]);

  const featuredDocs = filteredDocs.slice(0, 6);

  return (
    <section className="space-y-12">
      <div className="surface-panel rounded-[24px] p-6 sm:p-10 lg:p-16">
        <div className="max-w-5xl">
          <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
            {dictionary.docs.onboardingEyebrow}
          </p>
          <h2 className="mt-5 max-w-5xl text-balance font-display text-[2.8rem] leading-[1.03] tracking-[-0.72px] text-primary sm:text-[4.8rem]">
            {dictionary.docs.onboardingTitle}
          </h2>
          <p className="mt-6 max-w-3xl text-pretty font-serif text-[1.16rem] leading-[1.65] text-secondary">
            {dictionary.docs.onboardingBody}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_420px]">
          <label className="surface-raised flex items-center gap-4 rounded-2xl px-5 py-4 text-left">
            <span className="font-display text-sm text-muted">{dictionary.docs.searchLabel}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent font-display text-lg text-primary outline-none placeholder:text-muted"
              placeholder={dictionary.docs.searchPlaceholder}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            {docCategories.slice(0, 4).map((category) => (
              <a key={category.title} href={`#${category.title}`} className="btn-secondary rounded-xl px-4 py-3 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85">
                {categoryIconMap[category.title]} {category.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {dictionary.docs.widgetTypes.map((widget) => (
          <article key={widget.title} className="surface-raised rounded-[12px] p-5">
            <span className="surface-panel grid size-10 place-items-center rounded-lg font-mono text-sm brand-accent">{widget.icon}</span>
            <h3 className="mt-4 font-display text-[1.15rem] text-primary">{widget.title}</h3>
            <p className="mt-2 text-pretty font-serif text-[0.98rem] leading-[1.5] text-secondary">{widget.body}</p>
          </article>
        ))}
      </section>

      {query ? (
        <section className="surface-panel rounded-[14px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-[1.4rem] text-primary">{dictionary.docs.searchResults}</h3>
            <span className="font-mono text-xs tabular-nums text-muted">
              {filteredDocs.length} {dictionary.docs.matches}
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featuredDocs.map((doc) => (
              <DocCard key={doc.slug} doc={doc} openLabel={dictionary.docs.openDoc} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-8">
        {docCategories.map((category) => {
          const categoryDocs = getDocsByCategory(category, locale).filter((doc) =>
            filteredDocs.some((filteredDoc) => filteredDoc.slug === doc.slug),
          );

          if (categoryDocs.length === 0) {
            return null;
          }

          return (
            <section key={category.title} id={category.title} className="surface-panel scroll-mt-24 rounded-[16px] p-5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="surface-raised inline-grid size-10 place-items-center rounded-lg font-mono text-sm brand-accent">
                    {categoryIconMap[category.title]}
                  </span>
                  <h3 className="mt-4 font-display text-[1.65rem] text-primary">{category.title}</h3>
                  <p className="mt-2 max-w-2xl text-pretty font-serif text-[1rem] leading-[1.5] text-secondary">
                    {dictionary.docs.categoryBody}
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-muted">
                  {categoryDocs.length} {dictionary.docs.docsCount}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryDocs.map((doc) => (
                  <DocCard key={doc.slug} doc={doc} openLabel={dictionary.docs.openDoc} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function DocCard({ doc, openLabel }: { doc: DocEntry; openLabel: string }) {
  return (
    <Link
      href={`/docs/${doc.slug}`}
      className="surface-raised block rounded-xl p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90"
    >
      <p className="font-mono text-xs uppercase tracking-[0.08em] brand-accent">{doc.category}</p>
      <p className="mt-3 font-display text-[1.18rem] text-primary">{doc.title}</p>
      <p className="mt-2 line-clamp-3 text-pretty font-serif text-[0.98rem] leading-[1.5] text-secondary">
        {doc.description}
      </p>
      <p className="mt-4 font-display text-sm brand-accent">{openLabel} →</p>
    </Link>
  );
}
