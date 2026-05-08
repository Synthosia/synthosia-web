"use client";

import { cn } from "@/lib/cn";

export function WizardStepper({
  steps,
  current,
  labels,
}: {
  steps: readonly string[];
  current: number;
  labels: Record<string, string>;
}) {
  return (
    <nav aria-label="Progress" className="w-full overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {steps.map((id, i) => {
          const n = i + 1;
          const active = n === current;
          const done = n < current;
          return (
            <li key={id} className="flex items-center gap-1 sm:gap-2">
              {i > 0 ? (
                <div
                  className={cn(
                    "hidden h-px w-4 shrink-0 sm:block sm:w-6",
                    done ? "bg-emerald-500/60" : "bg-[var(--border-subtle)]",
                  )}
                  aria-hidden
                />
              ) : null}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition sm:px-3",
                  active &&
                    "bg-[var(--surface-interactive)] text-[var(--text-primary)] ring-1 ring-[var(--brand-accent)]/35",
                  done && !active && "text-emerald-600 dark:text-emerald-400",
                  !done && !active && "text-[var(--text-muted)]",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] tabular-nums",
                    active && "bg-[var(--brand-accent)] text-[var(--button-primary-text)] dark:bg-violet-400 dark:text-[#09070f]",
                    done && !active && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                    !done && !active && "bg-[var(--surface-raised)] text-[var(--text-muted)]",
                  )}
                >
                  {done ? "✓" : n}
                </span>
                <span className="hidden max-w-[8rem] truncate sm:inline">{labels[id] ?? id}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
