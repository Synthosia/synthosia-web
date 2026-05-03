"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { getComputeInstanceAuditLatest } from "@/lib/synthosia-api";

export type AuditPeerRow = { address: string; connections: number };

/** Interpreta `extras.audit` tal como o agente/env API enviam. */
export function parseAuditPeers(audit: unknown): AuditPeerRow[] {
  if (!audit || typeof audit !== "object") return [];
  const rp = (audit as Record<string, unknown>).remotePeers;
  if (!Array.isArray(rp)) return [];
  const out: AuditPeerRow[] = [];
  for (const item of rp) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const address = typeof o.address === "string" ? o.address.trim() : "";
    let connections = 0;
    if (typeof o.connections === "number" && Number.isFinite(o.connections)) {
      connections = Math.max(0, Math.floor(o.connections));
    } else if (typeof o.connections === "string") {
      const n = Number(o.connections);
      if (Number.isFinite(n)) connections = Math.max(0, Math.floor(n));
    }
    if (address) out.push({ address, connections });
  }
  return out;
}

export type AuditPeersTableLabels = {
  title?: string;
  colAddress: string;
  colConnections: string;
  empty: string;
  caption?: string;
  recordedAt?: string;
};

export function AuditPeersTable({
  audit,
  labels,
  variant = "panel",
}: {
  audit: unknown;
  labels: AuditPeersTableLabels;
  /** `panel` — cartão completo; `embedded` — só tabela (para SSE). */
  variant?: "panel" | "embedded";
}) {
  const peers = parseAuditPeers(audit);
  const note =
    audit && typeof audit === "object" && typeof (audit as Record<string, unknown>).note === "string"
      ? ((audit as Record<string, unknown>).note as string)
      : null;

  const table = (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
      <table className="w-full min-w-[280px] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]">
            <th className="px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colAddress}</th>
            <th className="px-3 py-2 font-semibold text-[var(--text-muted)]">{labels.colConnections}</th>
          </tr>
        </thead>
        <tbody>
          {peers.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-4 text-[var(--text-secondary)]">
                {labels.empty}
              </td>
            </tr>
          ) : (
            peers.map((row) => (
              <tr key={row.address} className="border-b border-[var(--border-subtle)] last:border-b-0">
                <td className="px-3 py-2 font-mono text-[var(--text-primary)]">{row.address}</td>
                <td className="px-3 py-2 tabular-nums text-[var(--text-primary)]">{row.connections}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  if (variant === "embedded") {
    return (
      <div className="mt-2 space-y-2">
        {labels.caption ? (
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{labels.caption}</p>
        ) : null}
        {note ? <p className="text-[11px] text-[var(--text-secondary)]">{note}</p> : null}
        {table}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {labels.title ? <h3 className="text-sm font-semibold text-[var(--text-primary)]">{labels.title}</h3> : null}
      {labels.recordedAt ? <p className="text-[11px] text-[var(--text-muted)]">{labels.recordedAt}</p> : null}
      {note ? <p className="text-[11px] text-[var(--text-secondary)]">{note}</p> : null}
      {table}
    </div>
  );
}

export type InstanceAuditPeersPollLabels = {
  panelTitle: string;
  panelSubtitle: string;
  pollHint: string;
  colAddress: string;
  colConnections: string;
  empty: string;
  /** Texto com marcador `{at}` para data da última amostra. */
  recordedAtTemplate: string;
};

/** Painel com polling ao endpoint `audit-latest` (ex.: separador Monitorização). */
export function InstanceAuditPeersPollPanel({
  bindingId,
  labels,
  pollMs = 12_000,
}: {
  bindingId: string;
  labels: InstanceAuditPeersPollLabels;
  pollMs?: number;
}) {
  const [audit, setAudit] = useState<Record<string, unknown>>({});
  const [recordedAt, setRecordedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      void getComputeInstanceAuditLatest(bindingId)
        .then((r) => {
          if (cancelled) return;
          setAudit(r.audit);
          setRecordedAt(r.recordedAt);
        })
        .catch(() => {
          /* tab pode estar sem rede — mantém último estado */
        });
    };
    tick();
    const id = window.setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [bindingId, pollMs]);

  const atDisplay =
    recordedAt != null && recordedAt !== ""
      ? new Date(recordedAt).toLocaleString()
      : "—";
  const recordedLabel = labels.recordedAtTemplate.replace("{at}", atDisplay);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      )}
      aria-label={labels.panelTitle}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{labels.panelTitle}</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{labels.panelSubtitle}</p>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">{labels.pollHint}</p>
      </div>
      <div className="mt-4">
        <AuditPeersTable
          audit={audit}
          variant="panel"
          labels={{
            colAddress: labels.colAddress,
            colConnections: labels.colConnections,
            empty: labels.empty,
            recordedAt: recordedLabel,
          }}
        />
      </div>
    </section>
  );
}
