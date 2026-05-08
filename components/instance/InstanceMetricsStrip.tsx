"use client";

import { motion } from "motion/react";
import { InstanceMetricSparkline } from "@/components/instance/InstanceMetricSparkline";
import {
  extractMetricSeries,
  lastOrZero,
  parseLimits,
} from "@/components/instance/cloud-metrics";
import { useCloudInstanceMetrics } from "@/components/instance/use-cloud-instance-metrics";
import { useCloudInstanceMetricsLatest } from "@/components/instance/use-cloud-instance-metrics-latest";
import { cn } from "@/lib/cn";
import type { ComputeInstance } from "@/lib/synthosia-api";
import { formatContainerMem, formatHttpProbeSummary } from "@/lib/telemetry-display";

function MetricCard({
  title,
  hint,
  value,
  unit,
  spark,
  stroke,
  delay,
}: {
  title: string;
  hint: string;
  value: string;
  unit?: string;
  spark: number[];
  stroke: string;
  delay: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
          <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{hint}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-[var(--text-primary)]">
            {value}
          </span>
          {unit ? (
            <span className="ml-0.5 text-sm font-medium text-[var(--text-muted)]">{unit}</span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex justify-end border-t border-[var(--border-subtle)] pt-3">
        <InstanceMetricSparkline values={spark} stroke={stroke} />
      </div>
    </motion.article>
  );
}

export function InstanceMetricsStrip({
  bindingId,
  service,
  labels,
}: {
  bindingId: string;
  service: ComputeInstance;
  labels: {
    cpu: string;
    cpuHint: string;
    memory: string;
    memoryHint: string;
    network: string;
    networkHint: string;
    disk: string;
    diskHint: string;
    lastWindow: string;
    loading: string;
    telemetryLiveTitle: string;
    telemetryHttp: string;
    telemetryMem: string;
    telemetryRecorded: string;
  };
}) {
  const { data, loading } = useCloudInstanceMetrics(bindingId, 24);
  const { data: latest } = useCloudInstanceMetricsLatest(bindingId, 0);
  const { cpuPct, memPct, netMbps } = extractMetricSeries(data);
  const lim = parseLimits(null);

  const cpuVal =
    cpuPct.length >= 1 ? `${lastOrZero(cpuPct)}` : loading ? "…" : "—";
  const memVal =
    memPct.length >= 1 ? `${lastOrZero(memPct)}` : loading ? "…" : "—";
  const netLast = netMbps.length ? netMbps[netMbps.length - 1]! : 0;
  const netVal = netMbps.length >= 1 ? `${netLast.toFixed(2)}` : loading ? "…" : "—";

  const diskPrimary = `${service.memoryMb} MB / ${service.cpuMillicores} mCPU`;
  const diskSecondary = labels.diskHint;

  const extras = latest?.extras ?? {};
  const httpProbe = extras.httpProbe;
  const container = extras.container;
  const probeSummary = formatHttpProbeSummary(httpProbe);
  const memUsage = formatContainerMem(container);

  return (
    <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title={labels.cpu}
        hint={labels.cpuHint}
        value={cpuVal}
        unit="%"
        spark={cpuPct.length >= 1 ? cpuPct : loading ? [] : [0, 0]}
        stroke="#1a73e8"
        delay={0}
      />
      <MetricCard
        title={labels.memory}
        hint={labels.memoryHint}
        value={memVal}
        unit="%"
        spark={memPct.length >= 1 ? memPct : loading ? [] : [0, 0]}
        stroke="#16a34a"
        delay={0.04}
      />
      <MetricCard
        title={labels.network}
        hint={labels.networkHint}
        value={netVal}
        unit={netMbps.length >= 1 ? "Mb/s" : ""}
        spark={
          netMbps.length >= 1
            ? netMbps.map((v) => Math.min(100, (v / 5) * 100))
            : loading
              ? []
              : [0, 0]
        }
        stroke="#7c3aed"
        delay={0.08}
      />
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.12 }}
        className={cn(
          "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
        )}
      >
        <p className="text-xs font-medium text-[var(--text-muted)]">{labels.disk}</p>
        <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">{labels.diskHint}</p>
        <p className="mt-4 text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {diskPrimary}
          {diskSecondary ? (
            <span className="ml-1 text-sm font-semibold text-[var(--text-muted)]">{diskSecondary}</span>
          ) : null}
        </p>
        <p className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-[10px] font-medium text-[var(--text-secondary)]">
          {labels.lastWindow}
          {data?.windowHours != null ? ` · ${data.windowHours}h` : ""}
        </p>
      </motion.article>
    </div>
      {(probeSummary || memUsage || latest?.recordedAt) && (
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3 text-xs text-[var(--text-secondary)]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {labels.telemetryLiveTitle}
          </p>
          {latest?.recordedAt ? (
            <p className="mt-1 text-[11px]">
              <span className="text-[var(--text-muted)]">{labels.telemetryRecorded}: </span>
              {new Date(latest.recordedAt).toLocaleString()}
            </p>
          ) : null}
          {probeSummary ? (
            <p className="mt-1">
              <span className="text-[var(--text-muted)]">{labels.telemetryHttp}: </span>
              <span className="font-medium text-[var(--text-primary)]">{probeSummary}</span>
            </p>
          ) : null}
          {memUsage ? (
            <p className="mt-1">
              <span className="text-[var(--text-muted)]">{labels.telemetryMem}: </span>
              <span className="font-mono text-[11px] text-[var(--text-primary)]">{memUsage}</span>
            </p>
          ) : null}
        </motion.section>
      )}
    </div>
  );
}
