"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { CloudLifecycle } from "@/components/server-row-types";

export function InstanceActionsSidebar({
  labels,
  canManage,
  busy,
  lifecycle,
  railwayMissing,
  hasDeployment,
  hideLifecycleControls,
  onDeploy,
  onRestart,
  onStop,
  onDelete,
}: {
  labels: {
    actions: string;
    health: string;
    billing: string;
    deploy: string;
    restart: string;
    stop: string;
    delete: string;
    billingPlaceholder: string;
    billingLink: string;
    healthCpu: string;
    healthDeploy: string;
    healthSync: string;
    healthApi: string;
    statusOk: string;
    statusWarn: string;
    confirmDelete: string;
    confirmStop: string;
  };
  canManage: boolean;
  busy: boolean;
  lifecycle: CloudLifecycle;
  railwayMissing: boolean;
  hasDeployment: boolean;
  /** Quando true, só «Eliminar» (compute plane / jobs — sem deploy na API). */
  hideLifecycleControls?: boolean;
  onDeploy: () => void;
  onRestart: () => void;
  onStop: () => void;
  onDelete: () => void;
}) {
  const running = lifecycle === "running";
  const provisioning = lifecycle === "provisioning";
  const removing = lifecycle === "removing";
  const canStop = running && !railwayMissing;
  const canRestart =
    hasDeployment && !railwayMissing && lifecycle !== "pending_deploy" && lifecycle !== "provisioning";

  const healthItems: { label: string; ok: boolean }[] = [
    { label: labels.healthCpu, ok: !railwayMissing && !provisioning && !removing },
    { label: labels.healthDeploy, ok: hasDeployment && !railwayMissing && !removing },
    { label: labels.healthSync, ok: !railwayMissing && !removing },
    { label: labels.healthApi, ok: !railwayMissing && !removing },
  ];

  return (
    <div className="flex flex-col gap-4">
      <motion.section
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
        className={cn(
          "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        )}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {labels.actions}
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {!hideLifecycleControls ? (
            <>
          <button
            type="button"
            disabled={!canManage || busy || provisioning || railwayMissing}
            onClick={onDeploy}
            className={cn(
              "rounded-xl border border-[#1a73e8] bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white",
              "shadow-sm transition hover:bg-[#1557b0] disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {labels.deploy}
          </button>
          <button
            type="button"
            disabled={!canManage || busy || !canRestart}
            onClick={onRestart}
            className={cn(
              "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]",
              "transition hover:bg-[var(--surface-interactive)] disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {labels.restart}
          </button>
          <button
            type="button"
            disabled={!canManage || busy || !canStop}
            onClick={() => {
              if (window.confirm(labels.confirmStop)) onStop();
            }}
            className={cn(
              "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]",
              "transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {labels.stop}
          </button>
            </>
          ) : null}
          <button
            type="button"
            disabled={!canManage || busy || lifecycle === "removing"}
            onClick={() => {
              if (window.confirm(labels.confirmDelete)) onDelete();
            }}
            className={cn(
              "mt-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 py-2.5 text-sm font-medium text-[#dc2626]",
              "transition hover:bg-[var(--surface-raised)] disabled:cursor-not-allowed disabled:opacity-45",
            )}
          >
            {labels.delete}
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, delay: 0.05 }}
        className={cn(
          "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        )}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {labels.health}
        </h2>
        <ul className="mt-4 space-y-3">
          {healthItems.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-[var(--text-secondary)]">{item.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  item.ok
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-800 dark:text-amber-300",
                )}
              >
                {item.ok ? labels.statusOk : labels.statusWarn}
              </span>
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, delay: 0.1 }}
        className={cn(
          "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        )}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {labels.billing}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {labels.billingPlaceholder}
        </p>
        <span className="mt-3 inline-block text-xs font-medium text-[var(--brand-accent-2)] opacity-80">
          {labels.billingLink}
        </span>
      </motion.section>
    </div>
  );
}
