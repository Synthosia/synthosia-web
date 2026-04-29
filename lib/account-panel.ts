import type { ComponentType } from "react";
import {
  CloudIcon,
  GitHubIcon,
  IntegrationIcon,
  NavBarChartIcon,
  NavNetworkingIcon,
  NavTerminalPromptIcon,
  PanelDashboardIcon,
  PanelDatabaseIcon,
  PanelFilesIcon,
  PanelSettingsIcon,
  PanelSitesIcon,
  ShieldIcon,
} from "@/components/auth-icons";

export type PanelCategory = "dashboard" | "servers" | "databases" | "extensions";

export type PanelNavItem = {
  id: string;
  label: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
};

export type PanelNavSection = {
  id: string;
  label: string;
  items: PanelNavItem[];
};

/** Primeiro item ao mudar de categoria no rail. */
export const DEFAULT_PANEL_ITEM: Record<PanelCategory, string> = {
  dashboard: "dash-overview",
  servers: "srv-instances",
  databases: "db-instances",
  extensions: "ext-ai",
};

export function panelNavSections(category: PanelCategory): PanelNavSection[] {
  switch (category) {
    case "dashboard":
      return [
        {
          id: "rep",
          label: "Relatório",
          items: [
            {
              id: "dash-overview",
              label: "Visão geral",
              hint: "Métricas, gráficos e pré-visualizações",
              icon: PanelDashboardIcon,
            },
          ],
        },
      ];
    case "servers":
      return [
        {
          id: "srv-res",
          label: "RESOURCES",
          items: [
            { id: "srv-instances", label: "All Servers", icon: PanelSitesIcon },
            { id: "srv-networking", label: "Networking", icon: NavNetworkingIcon },
          ],
        },
        {
          id: "srv-mon",
          label: "MONITORING",
          items: [
            { id: "srv-analytics", label: "Analytics", icon: NavBarChartIcon },
            { id: "srv-security", label: "Security", icon: ShieldIcon },
          ],
        },
        {
          id: "srv-mgmt",
          label: "MANAGEMENT",
          items: [
            { id: "srv-terminal", label: "Terminal", icon: NavTerminalPromptIcon },
          ],
        },
      ];
    case "databases":
      return [
        {
          id: "data",
          label: "Gerenciamento",
          items: [
            {
              id: "db-instances",
              label: "Instances",
              hint: "Gerenciar instâncias de banco de dados",
              icon: PanelDatabaseIcon,
            },
            {
              id: "db-backups",
              label: "Backups",
              hint: "Backup e restauração",
              icon: PanelFilesIcon,
            },
          ],
        },
      ];
    case "extensions":
      return [
        {
          id: "integ",
          label: "Integrações",
          items: [
            {
              id: "ext-ai",
              label: "Inteligência artificial",
              hint: "Modelos e chamadas API",
              icon: CloudIcon,
            },
            {
              id: "ext-github",
              label: "GitHub",
              hint: "Repos, PRs e webhooks",
              icon: GitHubIcon,
            },
            {
              id: "ext-store",
              label: "Store",
              hint: "Integrações da loja Synthosia",
              icon: IntegrationIcon,
            },
          ],
        },
      ];
  }
}

export const PANEL_CATEGORY_LABEL: Record<PanelCategory, string> = {
  dashboard: "Dashboard",
  servers: "Servidores",
  databases: "Bases de dados",
  extensions: "Extensões",
};

export const SEARCH_PLACEHOLDER: Record<PanelCategory, string> = {
  dashboard: "Pesquisar no relatório…",
  servers: "Search servers…",
  databases: "Pesquisar bases ou datasets…",
  extensions: "Pesquisar integrações…",
};

export function findPanelNavItem(category: PanelCategory, id: string): PanelNavItem | undefined {
  for (const section of panelNavSections(category)) {
    const found = section.items.find((item) => item.id === id);
    if (found) return found;
  }
  return undefined;
}
