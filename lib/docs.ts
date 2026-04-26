import docsConfig from "@/content/docs.json";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n";
import { cliCommandExamples, platformConfig } from "@/lib/platform-config";

export type DocCategory = {
  title: string;
  entries: string[];
};

export type DocWidget =
  | {
      type: "code";
      label: string;
      value: string;
    }
  | {
      type: "callout";
      title: string;
      body: string;
      tone?: "violet" | "blue" | "green";
    }
  | {
      type: "steps";
      title: string;
      items: Array<{ title: string; body: string }>;
    }
  | {
      type: "links";
      title: string;
      items: Array<{ label: string; href: string }>;
    }
  | {
      type: "video";
      title: string;
      body: string;
      href: string;
      duration?: string;
    }
  | {
      type: "githubProfile";
      username: string;
      role?: string;
      focus?: string;
      relatedProjects?: string[];
      repositoryLimit?: number;
    }
  | {
      type: "projectGrid";
      title: string;
      projects: string[];
      body?: string;
    };

export type DocEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  body: string[];
  widgets: DocWidget[];
};

type RawDocEntry = Omit<DocEntry, "body" | "widgets"> & {
  body: string[];
  widgets?: DocWidget[];
  translations?: Partial<Record<Locale, Partial<Omit<DocEntry, "slug" | "category">>>>;
};

const tokenMap: Record<string, string> = {
  "{{cli.command}}": platformConfig.cli.command,
  "{{cli.installCommand}}": platformConfig.cli.installCommand,
  "{{cli.packageName}}": platformConfig.cli.packageName,
  "{{cli.examples}}": cliCommandExamples.join("\n"),
};

function resolveTokens(value: string): string {
  return Object.entries(tokenMap).reduce(
    (currentValue, [token, replacement]) => currentValue.replaceAll(token, replacement),
    value,
  );
}

function resolveWidget(widget: DocWidget): DocWidget {
  if (widget.type === "code") {
    return { ...widget, value: resolveTokens(widget.value) };
  }

  if (widget.type === "callout") {
    return { ...widget, body: resolveTokens(widget.body) };
  }

  if (widget.type === "steps") {
    return {
      ...widget,
      items: widget.items.map((item) => ({ ...item, body: resolveTokens(item.body) })),
    };
  }

  return widget;
}

const rawDocs = docsConfig.docs as RawDocEntry[];

const rawDocCategories = docsConfig.categories as DocCategory[];

export function getDocCategories(locale: Locale = defaultLocale): DocCategory[] {
  const categoryTranslations = getDictionary(locale).docs.categories as Record<string, string>;

  return rawDocCategories.map((category) => ({
    ...category,
    title: categoryTranslations[category.title] ?? category.title,
  }));
}

function localizeDoc(doc: RawDocEntry, locale: Locale): DocEntry {
  const translation = locale === defaultLocale ? undefined : doc.translations?.[locale];
  const categoryTranslations = getDictionary(locale).docs.categories as Record<string, string>;
  const { slug, category } = doc;

  return {
    slug,
    title: translation?.title ?? doc.title,
    description: translation?.description ?? doc.description,
    category: categoryTranslations[category] ?? category,
    body: (translation?.body ?? doc.body).map(resolveTokens),
    widgets: (translation?.widgets ?? doc.widgets ?? []).map(resolveWidget),
  };
}

export const docCategories = getDocCategories(defaultLocale);

export const docs: DocEntry[] = rawDocs.map((doc) => localizeDoc(doc, defaultLocale));

export function getDocs(locale: Locale = defaultLocale): DocEntry[] {
  return rawDocs.map((doc) => localizeDoc(doc, locale));
}

export function getDocBySlug(slug: string, locale: Locale = defaultLocale): DocEntry | undefined {
  return getDocs(locale).find((doc) => doc.slug === slug);
}

export function getDocsByCategory(category: DocCategory, locale: Locale = defaultLocale): DocEntry[] {
  const rawCategory = rawDocCategories.find(
    (candidate) => candidate.entries === category.entries || candidate.entries.every((entry) => category.entries.includes(entry)),
  );

  return (rawCategory ?? category).entries
    .map((entry) => getDocBySlug(entry, locale))
    .filter((doc): doc is DocEntry => Boolean(doc));
}

export function getDocCategory(slug: string, locale: Locale = defaultLocale): DocCategory | undefined {
  const categoryIndex = rawDocCategories.findIndex((category) => category.entries.includes(slug));

  return categoryIndex >= 0 ? getDocCategories(locale)[categoryIndex] : undefined;
}

export function getNextDoc(slug: string, locale: Locale = defaultLocale): DocEntry | undefined {
  const localizedDocs = getDocs(locale);
  const currentIndex = localizedDocs.findIndex((doc) => doc.slug === slug);

  return currentIndex >= 0 ? localizedDocs[currentIndex + 1] : undefined;
}

export function getNextDocInCategory(slug: string, locale: Locale = defaultLocale): DocEntry | undefined {
  const rawCategory = rawDocCategories.find((category) => category.entries.includes(slug));

  if (!rawCategory) {
    return undefined;
  }

  const categoryDocs = rawCategory.entries
    .map((entry) => getDocBySlug(entry, locale))
    .filter((doc): doc is DocEntry => Boolean(doc));
  const currentIndex = categoryDocs.findIndex((doc) => doc.slug === slug);

  return currentIndex >= 0 ? categoryDocs[currentIndex + 1] : undefined;
}
