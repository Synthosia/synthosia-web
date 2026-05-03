"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useId } from "react";
import { extractMetricSeries, chartPathForSeries } from "@/components/instance/cloud-metrics";
import { useCloudInstanceMetrics } from "@/components/instance/use-cloud-instance-metrics";
import { cn } from "@/lib/cn";

function LargeChart({
  title,
  subtitle,
  values,
  stroke,
  grad,
  pctLabel,
}: {
  title: string;
  subtitle: string;
  values: number[];
  stroke: string;
  grad: string;
  pctLabel: string;
}) {
  const gid = useId();
  const w = 400;
  const h = 140;
  const pts = values.length >= 2 ? values : values.length === 1 ? [values[0]!, values[0]!] : [0, 0];
  const line = chartPathForSeries(pts, w, h);
  const min = pts.length ? Math.min(...pts) : 0;
  const max = pts.length ? Math.max(...pts) : 1;
  const last = pts.length ? pts[pts.length - 1]! : 0;
  const area =
    line && pts.length >= 2
      ? `${line} L ${w} ${h} L 0 ${h} Z`
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
        </div>
        <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{pctLabel}</span>
      </div>
      <div className="mt-4 -mx-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`${gid}-f`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={grad} stopOpacity="0.25" />
              <stop offset="100%" stopColor={grad} stopOpacity="0" />
            </linearGradient>
          </defs>
          {area ? (
            <>
              <path d={area} fill={`url(#${gid}-f)`} />
              <path
                d={line!}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <line
              x1="8"
              y1={h / 2}
              x2={w - 8}
              y2={h / 2}
              className="stroke-[var(--border-subtle)]"
              strokeWidth="1"
            />
          )}
        </svg>
      </div>
      <p className="mt-1 text-[10px] font-medium text-[var(--text-secondary)]">
        min {Math.round(min)} · max {Math.round(max)} · last {Math.round(last)}
      </p>
    </motion.div>
  );
}

export function InstanceMonitoringCharts({
  bindingId,
  labels,
}: {
  bindingId: string;
  labels: {
    title: string;
    hours24: string;
    hours72: string;
    hours168: string;
    cpu: string;
    cpuHint: string;
    memory: string;
    memoryHint: string;
    network: string;
    networkHint: string;
    loadError: string;
    loading: string;
  };
}) {
  const [hours, setHours] = useState(24);
  const { data, loading, error } = useCloudInstanceMetrics(bindingId, hours);

  const { cpuPct, memPct, netMbps } = useMemo(() => extractMetricSeries(data), [data]);

  const netDisplay = useMemo(() => {
    if (netMbps.length < 1) return { series: [] as number[], label: "—" };
    const scaled = netMbps.map((v) => Math.min(100, (v / 5) * 100));
    const v = netMbps[netMbps.length - 1] ?? 0;
    return { series: scaled, label: `${v.toFixed(2)} Mb/s` };
  }, [netMbps]);

  if (error) {
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-900">
        {labels.loadError}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{labels.title}</h2>
        <div className="flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-0.5">
          {(
            [
              [24, labels.hours24],
              [72, labels.hours72],
              [168, labels.hours168],
            ] as const
          ).map(([h, lbl]) => (
            <button
              key={h}
              type="button"
              onClick={() => setHours(h)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                hours === h
                  ? "bg-[var(--surface-panel)] text-[var(--brand-accent-2)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
      {loading && !data ? (
        <p className="text-sm text-[var(--text-muted)]">{labels.loading}</p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <LargeChart
          title={labels.cpu}
          subtitle={labels.cpuHint}
          values={cpuPct.length >= 1 ? cpuPct : []}
          stroke="#1a73e8"
          grad="#1a73e8"
          pctLabel={
            cpuPct.length >= 1 ? `${Math.round(cpuPct[cpuPct.length - 1]!)}%` : loading ? "…" : "—"
          }
        />
        <LargeChart
          title={labels.memory}
          subtitle={labels.memoryHint}
          values={memPct.length >= 1 ? memPct : []}
          stroke="#16a34a"
          grad="#22c55e"
          pctLabel={
            memPct.length >= 1 ? `${Math.round(memPct[memPct.length - 1]!)}%` : loading ? "…" : "—"
          }
        />
        <LargeChart
          title={labels.network}
          subtitle={labels.networkHint}
          values={netDisplay.series.length >= 1 ? netDisplay.series : []}
          stroke="#7c3aed"
          grad="#a855f7"
          pctLabel={netDisplay.label}
        />
      </div>
    </div>
  );
}
