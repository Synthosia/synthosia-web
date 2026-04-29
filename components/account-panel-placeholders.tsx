"use client";

import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import type { PanelNavItem } from "@/lib/account-panel";

export function PanelPlaceholder({
  title,
  description,
  actionLabel,
  showAction = true,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  showAction?: boolean;
}) {
  const { dictionary } = useLanguage();
  const p = dictionary.panel.placeholders;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-500">{description ?? p.defaultDescription}</p>
      {showAction ? (
        <button
          type="button"
          disabled
          className="mt-6 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel ?? p.manage}
        </button>
      ) : null}
    </div>
  );
}

export function ExtensionManageCard({
  item,
  slug,
}: {
  item: Pick<PanelNavItem, "label" | "hint">;
  slug: "ai" | "github" | "store";
}) {
  const { dictionary } = useLanguage();
  const p = dictionary.panel.placeholders;
  const copy = p.extensionCopy[slug];
  return (
    <PanelPlaceholder
      title={item.label}
      description={`${item.hint}. ${copy}`}
      actionLabel={p.manageIntegration}
    />
  );
}

export function DatabaseSectionPlaceholder({ variant }: { variant: "gestor" | "datasets" }) {
  const { dictionary } = useLanguage();
  const p = dictionary.panel.placeholders;
  if (variant === "gestor") {
    return (
      <PanelPlaceholder
        title={p.databaseGestor.title}
        description={p.databaseGestor.description}
        actionLabel={p.databaseGestor.action}
      />
    );
  }
  return (
    <PanelPlaceholder
      title={p.databaseDatasets.title}
      description={p.databaseDatasets.description}
      actionLabel={p.databaseDatasets.action}
    />
  );
}

export function PanelBreadcrumbBar({
  className,
  parts,
}: {
  className?: string;
  parts: string[];
}) {
  return (
    <div className={cn("border-b border-gray-200 bg-white/90 px-4 py-2.5 backdrop-blur-sm sm:px-6", className)}>
      <p className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
        {parts.map((c, i) => (
          <span key={`${c}-${i}`}>
            {i > 0 ? <span className="px-1.5 text-gray-400">/</span> : null}
            <span className={i === parts.length - 1 ? "font-medium text-gray-900" : "text-gray-500"}>{c}</span>
          </span>
        ))}
      </p>
    </div>
  );
}
