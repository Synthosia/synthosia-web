"use client";

import type { PlanPreset } from "@/lib/provision-wizard/schema";

export function ResourceEstimator({
  plan,
  regionLabel,
  labels,
}: {
  plan: PlanPreset;
  regionLabel: string;
  labels: {
    title: string;
    footnote: string;
    linePlan: string;
    lineRegion: string;
    lineEgress: string;
  };
}) {
  return (
    <aside className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/50 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{labels.title}</p>
      <dl className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
        <div className="flex justify-between gap-4">
          <dt>{labels.linePlan}</dt>
          <dd className="font-medium tabular-nums text-[var(--text-primary)]">
            ${plan.monthlyUsd}/mo
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{labels.lineRegion}</dt>
          <dd className="text-right text-[var(--text-primary)]">{regionLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{labels.lineEgress}</dt>
          <dd className="text-[var(--text-muted)]">—</dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] leading-relaxed text-[var(--text-muted)]">{labels.footnote}</p>
    </aside>
  );
}
