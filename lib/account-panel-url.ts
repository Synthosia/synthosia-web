import {
  DEFAULT_PANEL_ITEM,
  findPanelNavItem,
  type PanelCategory,
} from "@/lib/account-panel";

const PATH = "/account";

const CATEGORIES: PanelCategory[] = ["dashboard", "servers", "databases", "extensions"];

/** Separadores da página de detalhe da instância compute (query `view=`). */
export type InstanceDetailTab = "overview" | "monitoring" | "configuration" | "stream";

const VALID_INSTANCE_DETAIL_VIEWS = new Set<string>(["overview", "monitoring", "configuration", "stream"]);

export type AccountPanelUrlState = {
  category: PanelCategory;
  section: string;
  /** Binding UUID (Synthosia) para detalhe / consola de serviço cloud. */
  cloudBindingId?: string;
  /** Separador inicial em `srv-instance-detail` (ex.: `view=stream` para consola de logs). */
  instanceDetailTab?: InstanceDetailTab;
};

/** Lê `cat`, `section` e `cloud` da query e normaliza (valores inválidos → predefinições). */
export function parseAccountPanelSearchParams(input: {
  cat?: string | undefined;
  section?: string | undefined;
  cloud?: string | undefined;
  view?: string | undefined;
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

  const rawView = input.view?.trim().toLowerCase();
  const instanceDetailTab =
    rawView && VALID_INSTANCE_DETAIL_VIEWS.has(rawView) ? (rawView as InstanceDetailTab) : undefined;

  if (section === "srv-console") {
    section = "srv-instance-detail";
  }

  if (section === "srv-instance-detail") {
    category = "servers";
    if (!cloudBindingId) {
      section = DEFAULT_PANEL_ITEM.servers;
      return { category, section, cloudBindingId, instanceDetailTab: undefined };
    }
    return { category, section, cloudBindingId, instanceDetailTab };
  }

  const item = findPanelNavItem(category, section);
  if (!item || item.disabled) {
    section = DEFAULT_PANEL_ITEM[category];
  }

  return {
    category,
    section,
    cloudBindingId,
    instanceDetailTab: section === "srv-instance-detail" ? instanceDetailTab : undefined,
  };
}

export function buildAccountPanelHref(
  category: PanelCategory,
  section: string,
  cloudBindingId?: string | null,
  view?: InstanceDetailTab | null,
): string {
  const params = new URLSearchParams();
  params.set("cat", category);
  params.set("section", section);
  if (cloudBindingId?.trim()) {
    params.set("cloud", cloudBindingId.trim());
  }
  if (view?.trim()) {
    params.set("view", view.trim());
  }
  return `${PATH}?${params.toString()}`;
}
