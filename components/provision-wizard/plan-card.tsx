"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { PlanBadge, PlanPreset } from "@/lib/provision-wizard/schema";

function Badge({ type, label }: { type: PlanBadge; label: string }) {
  const cls =
    type === "recommended"
      ? "bg-violet-500/15 text-violet-700 ring-violet-500/25 dark:text-violet-200"
      : type === "economical"
        ? "bg-sky-500/15 text-sky-800 ring-sky-500/25 dark:text-sky-200"
        : "bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:text-amber-200";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1", cls)}>
      {label}
    </span>
  );
}

export function PlanCard({
  plan,
  selected,
  onSelect,
  ideal,
  labels,
}: {
  plan: PlanPreset;
  selected: boolean;
  onSelect: () => void;
  ideal: string;
  labels: {
    perMonth: string;
    perHour: string;
    vcpu: string;
    ram: string;
    disk: string;
    badgeRecommended: string;
    badgeEconomical: string;
    badgePerformance: string;
  };
}) {
  const badge =
    plan.badge === "recommended"
      ? labels.badgeRecommended
      : plan.badge === "economical"
        ? labels.badgeEconomical
        : plan.badge === "performance"
          ? labels.badgePerformance
          : null;

  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative flex w-full flex-col rounded-2xl border p-5 text-left transition",
        "bg-[var(--surface-panel)]/80 backdrop-blur-md",
        selected
          ? "border-[var(--brand-accent)] shadow-[0_0_0_1px_var(--brand-accent),0_16px_40px_-12px_rgba(124,58,237,0.35)]"
          : "border-[var(--border-subtle)] hover:border-[var(--text-muted)]/40",
      )}
    >
      {plan.badge && badge ? (
        <div className="absolute right-4 top-4">
          <Badge type={plan.badge} label={badge} />
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{plan.id}</p>
      <p className="mt-3 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
        ${plan.monthlyUsd}
        <span className="text-sm font-medium text-[var(--text-muted)]"> /{labels.perMonth}</span>
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
        ~${plan.hourlyUsd.toFixed(3)} {labels.perHour}
      </p>
      <ul className="mt-4 space-y-1.5 text-sm text-[var(--text-secondary)]">
        <li>
          {plan.vcpu} {labels.vcpu}
        </li>
        <li>
          {plan.ramGb} GB {labels.ram}
        </li>
        <li>
          {plan.diskGb} GB {labels.disk}
        </li>
      </ul>
      <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-[11px] leading-snug text-[var(--text-muted)]">
        {ideal}
      </p>
    </motion.button>
  );
}
