import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocPageRenderer } from "@/components/doc-page-renderer";
import { docs, getDocBySlug, getDocCategory, getDocsByCategory, getNextDocInCategory } from "@/lib/docs";
import { getDictionary } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

type DocsSlugPageProps = {
  params: Promise<{ slug: string }>;
};

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

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocsSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    return { title: "Documentation not found" };
  }

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function DocsSlugPage({ params }: DocsSlugPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const doc = getDocBySlug(slug, locale);

  if (!doc) {
    notFound();
  }

  const currentCategory = getDocCategory(doc.slug, locale);
  const currentCategoryDocs = currentCategory ? getDocsByCategory(currentCategory, locale) : [];
  const nextDoc = getNextDocInCategory(doc.slug, locale);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1680px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2">
            <Link href="/docs" className="btn-secondary focus-themed inline-flex rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out hover:opacity-85">
              ← {dictionary.docs.backToDocs}
            </Link>
            <nav aria-label="Documentation navigation" className="mt-5">
              {currentCategory ? (
                <section className="surface-panel rounded-xl p-3">
                  <p className="flex items-center gap-2 px-2 font-display text-xs uppercase tracking-[0.08em] brand-accent">
                    <span className="font-mono">{categoryIconMap[currentCategory.title]}</span>
                    {currentCategory.title}
                  </p>
                  <p className="px-2 pt-2 font-serif text-sm leading-[1.45] text-secondary">
                    {dictionary.docs.sidebarBody}
                  </p>
                  <div className="mt-4 space-y-1">
                    {currentCategoryDocs.map((categoryDoc) => (
                      <Link
                        key={categoryDoc.slug}
                        href={`/docs/${categoryDoc.slug}`}
                        className={`block rounded-lg px-3 py-2 font-display text-sm transition-opacity duration-150 ease-out ${
                          categoryDoc.slug === doc.slug ? "btn-primary" : "text-secondary hover:opacity-75"
                        }`}
                      >
                        {categoryDoc.title}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </nav>
          </div>
        </aside>

        <DocPageRenderer doc={doc} nextDoc={nextDoc} dictionary={dictionary} locale={locale} />

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <section className="surface-panel rounded-xl p-4">
              <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
                {dictionary.docs.onThisPage}
              </p>
              <nav className="mt-3 space-y-2 font-display text-sm text-secondary" aria-label="Page summary">
                <a className="block transition-colors duration-150 hover:brand-accent" href="#overview">
                  {dictionary.docs.overview}
                </a>
                <a className="block transition-colors duration-150 hover:brand-accent" href="#widgets">
                  {dictionary.docs.widgets}
                </a>
                <a className="block transition-colors duration-150 hover:brand-accent" href="#resources">
                  {dictionary.docs.resources}
                </a>
              </nav>
            </section>

            <section className="surface-panel rounded-xl p-4">
              <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">
                {dictionary.docs.resources}
              </p>
              <div className="mt-3 grid gap-2">
                {doc.widgets.map((widget, index) => (
                  <div key={`${widget.type}-${index}`} className="surface-raised rounded-lg px-3 py-2">
                    <p className="font-mono text-xs brand-accent">{widget.type}</p>
                  </div>
                ))}
                {doc.widgets.length === 0 ? (
                  <p className="font-serif text-sm text-secondary">{dictionary.docs.activeWidgetsEmpty}</p>
                ) : null}
              </div>
            </section>

            <section className="surface-panel rounded-xl p-4">
              <p className="font-display text-xs uppercase tracking-[0.08em] brand-accent">{dictionary.docs.nextStep}</p>
              {nextDoc ? (
                <Link href={`/docs/${nextDoc.slug}`} className="surface-raised mt-3 block rounded-lg p-3 transition duration-150 hover:opacity-85">
                  <p className="font-display text-sm text-primary">{nextDoc.title}</p>
                  <p className="mt-1 line-clamp-2 font-serif text-sm text-secondary">{nextDoc.description}</p>
                </Link>
              ) : (
                <Link href="/docs" className="surface-raised mt-3 block rounded-lg p-3 font-display text-sm brand-accent">
                  {dictionary.docs.backToIndex}
                </Link>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
