import {
  panelNavSections,
  type PanelCategory,
  type PanelNavSection,
} from "@/lib/account-panel";

export type PanelLocaleNav = {
  sections: Record<string, string>;
  items: Record<string, { title: string; hint?: string }>;
  systemSettings: { title: string; hint?: string };
  systemSection: string;
};

export function resolvePanelNavSections(
  category: PanelCategory,
  nav: PanelLocaleNav,
): PanelNavSection[] {
  const raw = panelNavSections(category);
  return raw.map((section) => ({
    ...section,
    label: nav.sections[section.id] ?? section.label,
    items: section.items.map((item) => ({
      ...item,
      label: nav.items[item.id]?.title ?? item.label,
      hint: nav.items[item.id]?.hint ?? item.hint ?? "",
    })),
  }));
}

export function buildPanelBreadcrumb(
  category: PanelCategory,
  itemId: string,
  p: {
    breadcrumbRoot: string;
    categoryLabel: Record<PanelCategory, string>;
    items: Record<string, { title: string }>;
    genericPanel: string;
  },
): string[] {
  const root: string[] = [p.breadcrumbRoot, p.categoryLabel[category]];
  const sections = panelNavSections(category);
  for (const section of sections) {
    const found = section.items.find((i) => i.id === itemId);
    if (found) {
      return [...root, p.items[itemId]?.title ?? found.label];
    }
  }
  const extra = p.items[itemId]?.title;
  if (extra) {
    return [...root, extra];
  }
  return [...root, p.genericPanel];
}
