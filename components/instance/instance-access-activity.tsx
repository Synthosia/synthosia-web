"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getComputeInstanceHttpAccess, type ComputeHttpAccessEvent } from "@/lib/synthosia-api";

export type InstanceAccessActivityLabels = {
  panelTitle: string;
  panelSubtitle: string;
  hintTraefik: string;
  colTime: string;
  colRequest: string;
  colStatus: string;
  colLatency: string;
  colHost: string;
  colClient: string;
  empty: string;
  loadMore: string;
  refresh: string;
  loadError: string;
};

function statusTone(code: number | undefined): string {
  if (code == null) return "text-[var(--text-muted)]";
  if (code >= 500) return "text-red-600 dark:text-red-400";
  if (code >= 400) return "text-amber-700 dark:text-amber-400";
  if (code >= 200 && code < 300) return "text-emerald-700 dark:text-emerald-400";
  return "text-[var(--text-primary)]";
}

/** Registo HTTP real (Traefik JSON → agente → BD), com paginação estável. */
export function InstanceAccessActivityPanel({
  bindingId,
  labels,
  pageSize = 40,
}: {
  bindingId: string;
  labels: InstanceAccessActivityLabels;
  pageSize?: number;
}) {
  const [items, setItems] = useState<ComputeHttpAccessEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<{ occurredAt: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchFirst = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await getComputeInstanceHttpAccess(bindingId, { limit: pageSize });
      setItems(r.items);
      setNextCursor(r.nextCursor ?? null);
    } catch {
      setErr(labels.loadError);
      setItems([]);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [bindingId, pageSize, labels.loadError]);

  useEffect(() => {
    void fetchFirst();
  }, [fetchFirst]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setErr(null);
    try {
      const r = await getComputeInstanceHttpAccess(bindingId, {
        limit: pageSize,
        cursor: nextCursor,
      });
      setItems((prev) => [...prev, ...r.items]);
      setNextCursor(r.nextCursor ?? null);
    } catch {
      setErr(labels.loadError);
    } finally {
      setLoadingMore(false);
    }
  }, [bindingId, nextCursor, loadingMore, pageSize, labels.loadError]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      )}
      aria-label={labels.panelTitle}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{labels.panelTitle}</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{labels.panelSubtitle}</p>
          <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)]">{labels.hintTraefik}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void fetchFirst()}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-panel)] disabled:opacity-50"
          >
            {labels.refresh}
          </button>
        </div>
      </div>

      {err ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
              <th className="whitespace-nowrap px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colTime}</th>
              <th className="min-w-[180px] px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colRequest}</th>
              <th className="whitespace-nowrap px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colStatus}</th>
              <th className="whitespace-nowrap px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colLatency}</th>
              <th className="min-w-[120px] px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colHost}</th>
              <th className="min-w-[120px] px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colClient}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-[var(--text-muted)]">
                  …
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-[var(--text-secondary)]">
                  {labels.empty}
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const when =
                  row.occurredAt && row.occurredAt !== ""
                    ? new Date(row.occurredAt).toLocaleString()
                    : "—";
                const req = `${(row.method || "").toUpperCase()} ${row.path || "/"}`;
                const ms = row.durationMs != null ? `${row.durationMs} ms` : "—";
                return (
                  <tr key={row.id} className="border-b border-[var(--border-subtle)] last:border-b-0">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--text-secondary)]">{when}</td>
                    <td className="max-w-[420px] px-3 py-2 font-mono text-[11px] text-[var(--text-primary)] break-all">
                      {req}
                    </td>
                    <td className={cn("whitespace-nowrap px-3 py-2 font-semibold tabular-nums", statusTone(row.statusCode))}>
                      {row.statusCode ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--text-secondary)]">{ms}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[var(--text-primary)]">
                      {row.requestHost?.trim() || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[var(--text-secondary)]">
                      {row.remoteAddr?.trim() || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {nextCursor ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-panel)] disabled:opacity-50"
          >
            {labels.loadMore}
          </button>
        </div>
      ) : null}
    </section>
  );
}
