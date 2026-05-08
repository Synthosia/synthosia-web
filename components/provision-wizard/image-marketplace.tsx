"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { StackTemplate, StackTemplateId, TemplateBadge } from "@/lib/provision-wizard/schema";

function TemplateBadgePill({ badge, labels }: { badge: TemplateBadge; labels: Record<TemplateBadge, string> }) {
  const tone =
    badge === "official"
      ? "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200"
      : badge === "optimized"
        ? "bg-violet-500/15 text-violet-800 ring-violet-500/25 dark:text-violet-200"
        : "bg-slate-500/15 text-slate-700 ring-slate-500/25 dark:text-slate-300";
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1", tone)}>
      {labels[badge]}
    </span>
  );
}

export function ImageMarketplace({
  templates,
  selected,
  onSelect,
  templateCopy,
  badgeLabels,
}: {
  templates: StackTemplate[];
  selected: StackTemplateId;
  onSelect: (id: StackTemplateId) => void;
  templateCopy: Record<StackTemplateId, { title: string; desc: string }>;
  badgeLabels: Record<TemplateBadge, string>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t, i) => {
        const copy = templateCopy[t.id] ?? { title: t.id, desc: "" };
        const isSel = selected === t.id;
        return (
          <motion.button
            key={t.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            onClick={() => onSelect(t.id)}
            className={cn(
              "flex flex-col rounded-2xl border p-4 text-left transition",
              "bg-[var(--surface-panel)]/75 backdrop-blur-md",
              isSel
                ? "border-[var(--brand-accent)] ring-1 ring-[var(--brand-accent)]/40"
                : "border-[var(--border-subtle)] hover:border-[var(--text-muted)]/35",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{copy.title}</p>
              <TemplateBadgePill badge={t.badge} labels={badgeLabels} />
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--text-muted)]">{copy.desc}</p>
            <code className="mt-3 truncate rounded-lg bg-[var(--surface-raised)] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)]">
              {t.dockerImage}
            </code>
          </motion.button>
        );
      })}
    </div>
  );
}
