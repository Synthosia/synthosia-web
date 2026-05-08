"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { type AccountSession } from "@/lib/account-session";
import { ServerPanelModals } from "@/components/server-panel-modals";
import {
  cloudStatusDotClass,
  cloudStatusLabel,
  mapComputeInstanceToRow,
  type ServerRow,
} from "@/components/server-row-types";
import { infraMetricsStream, snapshotToConsoleLiveMetric } from "@/lib/infra-metrics-stream";
import {
  ApiClientError,
  type ConsoleDashboard,
  type ComputeInstance,
  type ServerInstance,
  deleteComputeInstance,
  listComputeInstances,
  listServerInstances,
} from "@/lib/synthosia-api";
import { formatContainerMem, formatHttpProbeSummary } from "@/lib/telemetry-display";

function stableMetricsFromId(id: string): Pick<ServerRow, "cpu" | "ram" | "disk"> {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  const cpu = 25 + Math.abs(h % 55);
  const ram = 30 + Math.abs((h >> 3) % 50);
  const disk = 28 + Math.abs((h >> 6) % 45);
  return { cpu, ram, disk };
}

function mapInstanceToRow(inst: ServerInstance): ServerRow {
  const envLower = inst.environment.toLowerCase();
  const env: ServerRow["env"] =
    envLower.includes("stag") || envLower.includes("dev") || envLower.includes("preview")
      ? "staging"
      : "production";
  const { cpu, ram, disk } = stableMetricsFromId(inst.id);
  return {
    id: inst.id,
    name: inst.name,
    env,
    region: "Synthosia",
    ip: inst.host,
    specs: `SSH :${inst.port}`,
    healthy: cpu < 88,
    cpu,
    ram,
    disk,
    sshInstance: inst,
  };
}

function barTone(pct: number): string {
  if (pct < 70) return "#10b981";
  if (pct < 85) return "#f59e0b";
  return "#ef4444";
}

function smoothAreaPath(values: number[], w: number, h: number): { line: string; area: string } {
  if (values.length < 2) {
    return { line: "", area: "" };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });

  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[i + 1]!;
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }

  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const area = `${d} L ${last[0]} ${h} L ${first[0]} ${h} Z`;
  return { line: d, area };
}

function AreaMetricChart({
  values,
  stroke,
  gradFrom,
  className,
}: {
  values: number[];
  stroke: string;
  gradFrom: string;
  className?: string;
}) {
  const gid = useId();
  const w = 320;
  const h = 120;
  const { line, area } = smoothAreaPath(values.length >= 2 ? values : [0, 0], w, h);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-28 w-full", className)} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradFrom} stopOpacity="0.35" />
          <stop offset="100%" stopColor={gradFrom} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid}-fill)`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniProgress({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="w-7 shrink-0 text-[10px] font-medium text-gray-400">{label}</span>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100" />
        <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-gray-400">—</span>
      </div>
    );
  }
  const tone = barTone(value);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-7 shrink-0 text-[10px] font-medium text-gray-400">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: tone }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-gray-500">{value}%</span>
    </div>
  );
}

function fillTemplate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function mergeDashboardLiveMetrics(
  servers: ServerRow[],
  live: ConsoleDashboard["instanceLiveMetrics"],
): ServerRow[] {
  if (!live?.length) return servers;
  const map = new Map(live.map((x) => [x.instanceId, x]));
  return servers.map((s) => {
    if (!s.managedCompute) return s;
    const L = map.get(s.managedCompute.id);
    if (!L) return s;
    return {
      ...s,
      liveCpuPercent: L.cpuPercent ?? null,
      liveMemoryPercent: L.memoryPercent ?? null,
      liveHttpProbeSummary: formatHttpProbeSummary(L.httpProbe),
      liveContainerMemUsage: formatContainerMem(L.container),
      liveMetricRecordedAt: L.recordedAt,
    };
  });
}

export function ServerMonitoringDashboard({
  session,
  dashboard,
  cloudBindingId,
  onNavigateCloud,
  onOpenCloudDetail,
  onOpenGuidedProvision,
}: {
  session: AccountSession;
  dashboard: ConsoleDashboard | null;
  cloudBindingId: string | null;
  onNavigateCloud: (bindingId: string | null) => void;
  onOpenCloudDetail: (bindingId: string) => void;
  onOpenGuidedProvision: () => void;
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring;
  const smRecord = sm as Record<string, string>;
  const m = dashboard?.metrics;
  const zeros = useMemo(() => Array.from({ length: 24 }, () => 0), []);

  const [dashPoll, setDashPoll] = useState<ConsoleDashboard | null>(null);
  const dashboardRef = useRef(dashboard);
  dashboardRef.current = dashboard;

  useEffect(() => {
    setDashPoll(dashboard);
  }, [dashboard]);

  /** Métricas live da frota: WebSocket `metrics-stream` (subscribe fleet); séries agregadas continuam no HTTP ao carregar. */
  useEffect(() => {
    const unsub = infraMetricsStream.subscribeFleet((msg) => {
      if (msg.type === "fleetSnapshot") {
        const live = msg.instances
          .map((row) => snapshotToConsoleLiveMetric(row.instanceId, row.snapshot))
          .filter((x): x is NonNullable<typeof x> => x != null);
        setDashPoll((prev) => {
          const base = prev ?? dashboardRef.current;
          if (!base) return prev;
          return { ...base, instanceLiveMetrics: live };
        });
        return;
      }
      if (msg.type === "instanceUpdate") {
        const m = snapshotToConsoleLiveMetric(msg.instanceId, msg.snapshot);
        if (!m) return;
        setDashPoll((prev) => {
          const base = prev ?? dashboardRef.current;
          if (!base) return prev;
          const arr = [...(base.instanceLiveMetrics ?? [])];
          const idx = arr.findIndex((x) => x.instanceId === m.instanceId);
          if (idx >= 0) arr[idx] = m;
          else arr.push(m);
          return { ...base, instanceLiveMetrics: arr };
        });
      }
    });
    return unsub;
  }, []);

  const dashEffective = dashPoll ?? dashboard;

  const [cloudChartSeries, setCloudChartSeries] = useState<{
    cpu: number[];
    mem: number[];
    netMbps: number[];
  } | null>(null);
  /** Nº de serviços cloud incluídos na média/soma dos gráficos (para escala de rede). */
  const [cloudFleetChartCount, setCloudFleetChartCount] = useState(0);

  const [servers, setServers] = useState<ServerRow[]>([]);
  const [serversLoad, setServersLoad] = useState<"loading" | "ok" | "error">("loading");
  const [selectedId, setSelectedId] = useState("");
  const [modalKind, setModalKind] = useState<"new" | null>(null);

  /** Assinatura das instâncias compute (para refrescar gráficos placeholder). */
  const computeMetricsSignature = useMemo(() => {
    return servers
      .filter((s) => s.managedCompute?.id)
      .map((s) => `${s.managedCompute!.id}:${s.managedCompute!.status}`)
      .sort()
      .join("|");
  }, [servers]);

  /** Séries do `/v1/console/dashboard` (BD); placeholders só se a API ainda não tiver janela útil. */
  const apiCpuOk = (m?.cpuPercentSeries?.length ?? 0) >= 2;
  const apiMemOk = (m?.memoryPercentSeries?.length ?? 0) >= 2;
  const apiNetOk = (m?.networkMbpsSeries?.length ?? 0) >= 2;

  const cpuSeries = apiCpuOk
    ? m!.cpuPercentSeries
    : cloudChartSeries && cloudChartSeries.cpu.length >= 2
      ? cloudChartSeries.cpu
      : zeros;
  const memSeries = apiMemOk
    ? m!.memoryPercentSeries
    : cloudChartSeries && cloudChartSeries.mem.length >= 2
      ? cloudChartSeries.mem
      : zeros;
  const netRaw = apiNetOk
    ? m!.networkMbpsSeries
    : cloudChartSeries && cloudChartSeries.netMbps.length >= 2
      ? cloudChartSeries.netMbps
      : null;
  const netSeries = netRaw ?? cpuSeries.map((c) => Math.max(0, (c / 100) * 3));

  const cpuPct = Math.round(cpuSeries[cpuSeries.length - 1] ?? 0);
  const memPct = Math.round(memSeries[memSeries.length - 1] ?? 0);
  const netLast = netSeries[netSeries.length - 1] ?? 0;
  const fleetCloudCount = useMemo(() => servers.filter((s) => s.managedCompute?.id).length, [servers]);
  const netCapMbps = 5 * Math.max(1, cloudFleetChartCount > 0 ? cloudFleetChartCount : fleetCloudCount);
  const netScaled = Math.min(100, Math.round((netLast / netCapMbps) * 100));

  const alerts = dashboard?.alerts ?? [];
  const attentionItems = useMemo(() => {
    const tones = ["red", "rose", "amber"] as const;
    return alerts.slice(0, 6).map((a, i) => ({
      id: a.id,
      title: a.title,
      desc: a.message,
      value: a.severity === "error" ? "CRIT" : "WARN",
      tone: tones[Math.min(i, 2)] ?? "amber",
    }));
  }, [alerts]);

  const canManage = session.role !== "viewer";

  const refreshServers = useCallback(async () => {
    setServersLoad("loading");
    try {
      const [ssh, rw] = await Promise.all([
        listServerInstances().catch(() => [] as ServerInstance[]),
        listComputeInstances().catch(() => [] as ComputeInstance[]),
      ]);
      const mapped = [...ssh.map(mapInstanceToRow), ...rw.map(mapComputeInstanceToRow)];
      setServers(mapped);
      setServersLoad("ok");
      setSelectedId((prev) => {
        if (prev && mapped.some((s) => s.id === prev)) return prev;
        return mapped[0]?.id ?? "";
      });
    } catch {
      setServers([]);
      setServersLoad("error");
    }
  }, []);

  useEffect(() => {
    void refreshServers();
  }, [refreshServers]);

  /** Sincroniza lista SSH + instâncias compute. */
  useEffect(() => {
    let cancelled = false;
    const intervalMs = 60_000;

    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const [ssh, rw] = await Promise.all([
          listServerInstances().catch(() => [] as ServerInstance[]),
          listComputeInstances().catch(() => [] as ComputeInstance[]),
        ]);
        if (cancelled) return;
        const mapped = [...ssh.map(mapInstanceToRow), ...rw.map(mapComputeInstanceToRow)];
        setServers(mapped);
        setSelectedId((prev) =>
          prev && mapped.some((s) => s.id === prev) ? prev : (mapped[0]?.id ?? ""),
        );
        setServersLoad((prev) => (prev === "error" ? "ok" : prev));
      } catch {
        /* manter estado */
      }
    };

    const id = window.setInterval(() => void tick(), intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  /** Séries placeholder a partir das instâncias compute (métricas reais virão dos agentes). */
  useEffect(() => {
    if (serversLoad !== "ok") return;
    const targets = servers.filter((s) => s.managedCompute?.id);
    if (targets.length === 0) {
      setCloudChartSeries(null);
      setCloudFleetChartCount(0);
      return;
    }
    const n = 24;
    const avgCpu = Math.round(
      targets.reduce((acc, s) => acc + s.cpu, 0) / Math.max(1, targets.length),
    );
    const avgRam = Math.round(
      targets.reduce((acc, s) => acc + s.ram, 0) / Math.max(1, targets.length),
    );
    const cpu = Array.from({ length: n }, (_, i) =>
      Math.min(100, Math.round(avgCpu * (0.9 + 0.1 * Math.sin(i / 3)))),
    );
    const mem = Array.from({ length: n }, (_, i) =>
      Math.min(100, Math.round(avgRam * (0.92 + 0.08 * Math.cos(i / 4)))),
    );
    const netMbps = cpu.map((c) => Math.max(0, (c / 100) * 3));
    setCloudChartSeries({ cpu, mem, netMbps });
    setCloudFleetChartCount(targets.length);
  }, [serversLoad, computeMetricsSignature]);

  const selectSshServer = useCallback(
    (id: string) => {
      setSelectedId(id);
      onNavigateCloud(null);
    },
    [onNavigateCloud],
  );

  useEffect(() => {
    if (serversLoad !== "ok" || !cloudBindingId) return;
    const row = servers.find((s) => s.managedCompute?.id === cloudBindingId);
    if (row) setSelectedId(row.id);
  }, [cloudBindingId, serversLoad, servers]);

  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const runDeleteBinding = useCallback(
    async (bindingId: string) => {
      if (!canManage || !bindingId) return;
      if (!window.confirm(smRecord.deleteConfirm ?? "Remover esta instância?")) return;
      setLifecycleBusy(true);
      try {
        await deleteComputeInstance(bindingId);
        if (cloudBindingId === bindingId) onNavigateCloud(null);
        await refreshServers();
      } catch (e) {
        window.alert(e instanceof ApiClientError ? e.message : (smRecord.modalError ?? "Erro"));
      } finally {
        setLifecycleBusy(false);
      }
    },
    [canManage, cloudBindingId, onNavigateCloud, refreshServers, smRecord.deleteConfirm, smRecord.modalError],
  );

  const cloudCardActions = useMemo(
    () => ({
      canManage,
      busy: lifecycleBusy,
      labels: {
        delete: sm.actionDelete,
      },
      onDelete: runDeleteBinding,
    }),
    [canManage, lifecycleBusy, sm.actionDelete, runDeleteBinding],
  );

  const serversLive = useMemo(
    () => mergeDashboardLiveMetrics(servers, dashEffective?.instanceLiveMetrics),
    [servers, dashEffective?.instanceLiveMetrics],
  );

  const prod = useMemo(() => serversLive.filter((s) => s.env === "production"), [serversLive]);
  const stg = useMemo(() => serversLive.filter((s) => s.env === "staging"), [serversLive]);

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        {/* Filtros e ação — pesquisa fica só no cabeçalho global */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <FilterPill label={sm.filterAllRegions} />
          <FilterPill label={sm.filterAllStates} />
          <FilterPill label={sm.filterSilenced} />
          <button
            type="button"
            onClick={onOpenGuidedProvision}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
          >
            {smRecord.guidedProvisionCta ?? "Assistente"}
          </button>
          <button
            type="button"
            onClick={() => setModalKind("new")}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            <span aria-hidden className="text-lg leading-none">
              +
            </span>
            {sm.newServer}
          </button>
        </div>

        {/* Precisa de atenção — só com alertas reais do dashboard */}
        {attentionItems.length > 0 ? (
          <section className="relative overflow-hidden rounded-lg border border-red-100 bg-red-50/90 shadow-sm">
            <div className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
              {attentionItems.length}
            </div>
            <div className="p-4 pt-5">
              <h2 className="text-sm font-semibold text-red-900">{sm.needsAttention}</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-md border px-3 py-2.5",
                      item.tone === "red" && "border-red-100 bg-white/80",
                      item.tone === "rose" && "border-rose-100 bg-white/80",
                      item.tone === "amber" && "border-amber-100 bg-white/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-red-800">{item.title}</p>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-red-700">{item.value}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-900">
            {sm.attentionAllClear}
          </section>
        )}

        {/* Metric charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            title={sm.metricCpu}
            hint={sm.metricCpuHint}
            pct={cpuPct}
            footerLeft={sm.last24h}
            footerRight={sm.current}
            stroke="#14b8a6"
            gradFrom="#14b8a6"
            values={cpuSeries}
          />
          <MetricCard
            title={sm.metricMemory}
            hint={sm.metricMemoryHint}
            pct={memPct}
            footerLeft={sm.last24h}
            footerRight={sm.current}
            stroke="#f59e0b"
            gradFrom="#fbbf24"
            values={memSeries}
          />
          <MetricCard
            title={sm.metricNetwork}
            hint={sm.metricNetworkHint}
            pct={netScaled}
            footerLeft={sm.last24h}
            footerRight={sm.current}
            stroke="#f97316"
            gradFrom="#fb923c"
            values={netSeries.length >= 2 ? netSeries : [0, 0]}
          />
        </div>

        {/* Servidores */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">{sm.serversHeading}</h2>
            <span className="text-xs text-gray-500">
              {serversLoad === "ok" ? fillTemplate(sm.hostsCount, { n: servers.length }) : "—"}
            </span>
          </div>

          {serversLoad === "loading" ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center text-sm text-gray-500">
              {sm.loadingServers}
            </p>
          ) : null}
          {serversLoad === "error" ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{sm.loadError}</p>
          ) : null}
          {serversLoad === "ok" && servers.length === 0 ? (
            <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">{sm.emptyServers}</p>
          ) : null}
          {serversLoad === "ok" && servers.length > 0 ? (
            <>
              <ServerGroup
                label={sm.production}
                count={prod.length}
                servers={prod}
                selectedId={selectedId}
                urlCloudBindingId={cloudBindingId}
                onSelectSsh={selectSshServer}
                onOpenCloudDetail={onOpenCloudDetail}
                healthyTitle={sm.healthyStatus}
                issueTitle={sm.issueStatus}
                statusLocale={smRecord}
                miniCpu={sm.miniCpu}
                miniRam={sm.miniRam}
                miniDisk={sm.miniDisk}
                cloudCardHint={smRecord.cardCloudMetricsHint}
                telemetryLabels={{
                  httpProbe: smRecord.streamPanelHttpProbe ?? "HTTP",
                  containerMem: smRecord.streamPanelContainerMem ?? "Memória",
                  recordedAt: smRecord.streamPanelSampleRecorded ?? "Amostra",
                }}
                cloudActions={cloudCardActions}
              />
              <ServerGroup
                label={sm.staging}
                count={stg.length}
                servers={stg}
                selectedId={selectedId}
                urlCloudBindingId={cloudBindingId}
                onSelectSsh={selectSshServer}
                onOpenCloudDetail={onOpenCloudDetail}
                healthyTitle={sm.healthyStatus}
                issueTitle={sm.issueStatus}
                statusLocale={smRecord}
                miniCpu={sm.miniCpu}
                miniRam={sm.miniRam}
                miniDisk={sm.miniDisk}
                cloudCardHint={smRecord.cardCloudMetricsHint}
                telemetryLabels={{
                  httpProbe: smRecord.streamPanelHttpProbe ?? "HTTP",
                  containerMem: smRecord.streamPanelContainerMem ?? "Memória",
                  recordedAt: smRecord.streamPanelSampleRecorded ?? "Amostra",
                }}
                cloudActions={cloudCardActions}
              />
            </>
          ) : null}
        </div>
      </div>

      <ServerPanelModals
        kind={modalKind}
        selected={null}
        t={sm as Record<string, string>}
        onClose={() => setModalKind(null)}
        onServersChanged={refreshServers}
        canManage={canManage}
        session={session}
      />
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50"
    >
      {label}
      <svg className="size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>
  );
}

function MetricCard({
  title,
  hint,
  pct,
  footerLeft,
  footerRight,
  stroke,
  gradFrom,
  values,
}: {
  title: string;
  hint: string;
  pct: number;
  footerLeft: string;
  footerRight: string;
  stroke: string;
  gradFrom: string;
  values: number[];
}) {
  return (
    <motion.article
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
        </div>
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-gray-900">{pct}%</span>
      </div>
      <div className="mt-3 -mx-1">
        <AreaMetricChart values={values} stroke={stroke} gradFrom={gradFrom} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
    </motion.article>
  );
}

type CloudCardActionsBundle = {
  canManage: boolean;
  busy: boolean;
  labels: { delete: string };
  onDelete: (bindingId: string) => void | Promise<void>;
};

function ServerGroup({
  label,
  count,
  servers,
  selectedId,
  urlCloudBindingId,
  onSelectSsh,
  onOpenCloudDetail,
  healthyTitle,
  issueTitle,
  statusLocale,
  miniCpu,
  miniRam,
  miniDisk,
  cloudCardHint,
  telemetryLabels,
  cloudActions,
}: {
  label: string;
  count: number;
  servers: ServerRow[];
  selectedId: string;
  urlCloudBindingId: string | null;
  onSelectSsh: (id: string) => void;
  onOpenCloudDetail: (bindingId: string) => void;
  healthyTitle: string;
  issueTitle: string;
  statusLocale: Record<string, string>;
  miniCpu: string;
  miniRam: string;
  miniDisk: string;
  cloudCardHint: string;
  telemetryLabels: { httpProbe: string; containerMem: string; recordedAt: string };
  cloudActions: CloudCardActionsBundle;
}) {
  if (servers.length === 0) return null;
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</h3>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-gray-600">
          {count}
        </span>
      </div>
      <ul className="space-y-2">
        {servers.map((s) => {
          const rowActive = s.managedCompute
            ? urlCloudBindingId === s.managedCompute.id
            : selectedId === s.id;
          return (
          <li key={s.id}>
            <div
              className={cn(
                "flex w-full flex-col gap-3 rounded-lg border p-3 text-left transition sm:flex-row sm:items-stretch sm:gap-4",
                rowActive
                  ? "border-gray-900/15 bg-white shadow-sm ring-1 ring-gray-900/10"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  s.managedCompute ? onOpenCloudDetail(s.managedCompute.id) : onSelectSsh(s.id)
                }
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500 ring-1 ring-gray-100">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M5 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2M5 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-gray-900">{s.name}</span>
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        s.cloudLifecycle
                          ? cloudStatusDotClass(s.cloudLifecycle)
                          : s.healthy
                            ? "bg-emerald-500"
                            : "bg-red-500",
                      )}
                      title={s.cloudLifecycle ? cloudStatusLabel(s, statusLocale) : s.healthy ? healthyTitle : issueTitle}
                    />
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-gray-500">
                    {s.ip} · {s.region} · {s.specs}
                  </p>
                </div>
              </button>
              {s.managedCompute ? (
                <div className="flex w-full min-w-0 flex-col gap-2 sm:w-56">
                  <p className="text-[10px] text-gray-400 sm:text-right">{cloudCardHint}</p>
                  {s.liveMetricRecordedAt ? (
                    <p className="text-[9px] text-gray-400 sm:text-right">
                      {telemetryLabels.recordedAt}:{" "}
                      {new Date(s.liveMetricRecordedAt).toLocaleString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  ) : null}
                  {s.liveHttpProbeSummary ? (
                    <p className="text-[10px] font-medium text-violet-800 sm:text-right">
                      <span className="text-gray-500">{telemetryLabels.httpProbe}: </span>
                      {s.liveHttpProbeSummary}
                    </p>
                  ) : null}
                  {s.liveContainerMemUsage ? (
                    <p className="text-[10px] text-gray-700 sm:text-right">
                      <span className="text-gray-500">{telemetryLabels.containerMem}: </span>
                      {s.liveContainerMemUsage}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-1 border-t border-gray-100 pt-2">
                    <MiniProgress
                      value={
                        s.liveCpuPercent != null && Number.isFinite(s.liveCpuPercent)
                          ? Math.round(Math.min(100, s.liveCpuPercent))
                          : null
                      }
                      label={miniCpu}
                    />
                    <MiniProgress
                      value={
                        s.liveMemoryPercent != null && Number.isFinite(s.liveMemoryPercent)
                          ? Math.round(Math.min(100, s.liveMemoryPercent))
                          : null
                      }
                      label={miniRam}
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-2 sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={!cloudActions.canManage || cloudActions.busy}
                      onClick={() => void cloudActions.onDelete(s.managedCompute!.id)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-900 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {cloudActions.labels.delete}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex w-full shrink-0 flex-col justify-center gap-1.5 sm:w-52">
                  <MiniProgress value={s.cpu} label={miniCpu} />
                  <MiniProgress value={s.ram} label={miniRam} />
                  <MiniProgress value={s.disk} label={miniDisk} />
                </div>
              )}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
