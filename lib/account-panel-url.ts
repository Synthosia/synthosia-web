import {
  DEFAULT_PANEL_ITEM,
  findPanelNavItem,
  type PanelCategory,
} from "@/lib/account-panel";

const PATH = "/account";

const CATEGORIES: PanelCategory[] = ["dashboard", "servers", "databases", "extensions"];

export type AccountPanelUrlState = {
  category: PanelCategory;
  section: string;
  /** Binding UUID (Synthosia) para detalhe / consola de serviço cloud. */
  cloudBindingId?: string;
};

/** Lê `cat`, `section` e `cloud` da query e normaliza (valores inválidos → predefinições). */
export function parseAccountPanelSearchParams(input: {
  cat?: string | undefined;
  section?: string | undefined;
  cloud?: string | undefined;
}): AccountPanelUrlState {
  const rawCat = input.cat?.trim().toLowerCase();
  let category: PanelCategory = "dashboard";
  if (rawCat && (CATEGORIES as readonly string[]).includes(rawCat)) {
    category = rawCat as PanelCategory;
  }

  let section = input.section?.trim() ?? "";
  if (!section) {
    section = DEFAULT_PANEL_ITEM[category];
  }

  const cloudRaw = input.cloud?.trim();
  const cloudBindingId =
    cloudRaw && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cloudRaw)
      ? cloudRaw
      : undefined;

  if (section === "srv-console") {
    section = "srv-instance-detail";
  }

  if (section === "srv-instance-detail") {
    category = "servers";
    if (!cloudBindingId) {
      section = DEFAULT_PANEL_ITEM.servers;
    }
    return { category, section, cloudBindingId };
  }

  const item = findPanelNavItem(category, section);
  if (!item || item.disabled) {
    section = DEFAULT_PANEL_ITEM[category];
  }

  return { category, section, cloudBindingId };
}

export function buildAccountPanelHref(
  category: PanelCategory,
  section: string,
  cloudBindingId?: string | null,
): string {
  const params = new URLSearchParams();
  params.set("cat", category);
  params.set("section", section);
  if (cloudBindingId?.trim()) {
    params.set("cloud", cloudBindingId.trim());
  }
  return `${PATH}?${params.toString()}`;
}
