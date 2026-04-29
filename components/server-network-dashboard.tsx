"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { type AccountSession } from "@/lib/account-session";
import { getDictionary } from "@/lib/i18n";
import { type ConsoleDashboard } from "@/lib/synthosia-api";

type NetworkDashboardCopy = ReturnType<typeof getDictionary>["panel"]["networkDashboard"];

const REQUESTS_SERIES = [12, 28, 45, 38, 62, 55, 78, 70, 88, 82, 95, 90];
const LATENCY_SERIES = [65, 58, 72, 68, 45, 52, 38, 48, 35, 42, 28, 32];

type InventoryRow = {
  id: string;
  name: string;
  status: "online" | "warning";
  cpu: number;
  memory: number;
  uptime: string;
};

const INVENTORY: InventoryRow[] = [
  { id: "1", name: "API-Gateway-Primary", status: "online", cpu: 34, memory: 52, uptime: "99.99%" },
  { id: "2", name: "Frontend-Cdn-01", status: "warning", cpu: 98, memory: 76, uptime: "99.12%" },
  { id: "3", name: "Worker-Queue-East", status: "online", cpu: 41, memory: 63, uptime: "99.98%" },
  { id: "4", name: "Search-Index-Replica", status: "online", cpu: 67, memory: 89, uptime: "99.95%" },
  { id: "5", name: "Auth-Service-01", status: "online", cpu: 22, memory: 38, uptime: "100%" },
  { id: "6", name: "Billing-API", status: "warning", cpu: 91, memory: 84, uptime: "98.40%" },
  { id: "7", name: "Notifications-Worker", status: "online", cpu: 19, memory: 44, uptime: "99.99%" },
  { id: "8", name: "GraphQL-Edge", status: "online", cpu: 55, memory: 61, uptime: "99.97%" },
  { id: "9", name: "Cache-Redis-Primary", status: "online", cpu: 28, memory: 71, uptime: "99.96%" },
  { id: "10", name: "Stream-Ingress-01", status: "online", cpu: 48, memory: 55, uptime: "99.94%" },
  { id: "11", name: "ML-Inference-GPU", status: "warning", cpu: 94, memory: 92, uptime: "97.80%" },
  { id: "12", name: "Cron-Scheduler", status: "online", cpu: 12, memory: 29, uptime: "99.99%" },
  { id: "13", name: "Webhook-Dispatcher", status: "online", cpu: 36, memory: 48, uptime: "99.98%" },
  { id: "14", name: "Docs-Static-Host", status: "online", cpu: 8, memory: 22, uptime: "100%" },
  { id: "15", name: "Metrics-Collector", status: "online", cpu: 44, memory: 58, uptime: "99.93%" },
  { id: "16", name: "Feature-Flags-API", status: "online", cpu: 31, memory: 41, uptime: "99.99%" },
  { id: "17", name: "Session-Store", status: "online", cpu: 52, memory: 66, uptime: "99.91%" },
  { id: "18", name: "Image-Processor", status: "warning", cpu: 88, memory: 81, uptime: "98.95%" },
  { id: "19", name: "Email-Outbox", status: "online", cpu: 25, memory: 39, uptime: "99.97%" },
  { id: "20", name: "Audit-Log-Ingest", status: "online", cpu: 18, memory: 35, uptime: "99.99%" },
  { id: "21", name: "Realtime-Presence", status: "online", cpu: 62, memory: 74, uptime: "99.89%" },
  { id: "22", name: "Backup-Agent-West", status: "online", cpu: 15, memory: 28, uptime: "99.99%" },
  { id: "23", name: "Config-Sync-Node", status: "online", cpu: 21, memory: 33, uptime: "99.98%" },
  { id: "24", name: "Edge-Proxy-Tokyo", status: "online", cpu: 39, memory: 51, uptime: "99.96%" },
];

const PAGE_SIZE = 4;

function barClass(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 75) return "bg-amber-500";
  return "bg-gray-300";
}

function DualLineChart({
  requestsLabel,
  latencyLabel,
  title,
}: {
  requestsLabel: string;
  latencyLabel: string;
  title: string;
}) {
  const w = 520;
  const h = 220;
  const padL = 36;
  const padR = 16;
  const padT = 28;
  const padB = 28;
  const gw = w - padL - padR;
  const gh = h - padT - padB;

  const maxValue = Math.max(100, ...REQUESTS_SERIES, ...LATENCY_SERIES);
  const n = Math.max(REQUESTS_SERIES.length, LATENCY_SERIES.length);
  const xs = (i: number) => padL + (i / (n - 1)) * gw;
  const yPos = (value: number) => padT + gh - (value / maxValue) * gh;

  const toPath = (series: number[]) => {
    return series
      .map((v, i) => {
        const x = xs(i);
        const y = yPos(v);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((fraction) => {
    const y = padT + gh - fraction * gh;
    return (
      <line
        key={fraction}
        x1={padL}
        y1={y}
        x2={padL + gw}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth={1}
        strokeDasharray="4 6"
      />
    );
  });

  const xTicks = [0, 15, 30, 45, 60];
  const pointsReq = REQUESTS_SERIES.map((v, i) => {
    const x = xs(i);
    const y = yPos(v);
    return { x, y };
  });
  const pointsLat = LATENCY_SERIES.map((v, i) => {
    const x = xs(i);
    const y = yPos(v);
    return { x, y };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="size-2 rounded-full bg-blue-500" aria-hidden />
            {requestsLabel}
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <span className="size-2 rounded-full bg-orange-500" aria-hidden />
            {latencyLabel}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-h-[240px]" role="img" aria-label={title}>
        {gridLines}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const tick = Math.round(fraction * maxValue);
          return (
            <text
              key={`y-${tick}`}
              x={padL - 8}
              y={padT + gh - fraction * gh + 4}
              textAnchor="end"
              fill="#9ca3af"
              style={{ fontSize: 10 }}
            >
              {tick}
            </text>
          );
        })}
        {xTicks.map((tick, i) => (
          <text
            key={`x-${tick}`}
            x={padL + (i / (xTicks.length - 1)) * gw}
            y={h - 8}
            textAnchor="middle"
            fill="#9ca3af"
            style={{ fontSize: 10 }}
          >
            {tick}
          </text>
        ))}
        <path d={toPath(REQUESTS_SERIES)} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
        <path d={toPath(LATENCY_SERIES)} fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" />
        {pointsReq.map((p, i) => (
          <circle key={`r-${i}`} cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#3b82f6" strokeWidth={2} />
        ))}
        {pointsLat.map((p, i) => (
          <circle key={`l-${i}`} cx={p.x} cy={p.y} r={3.5} fill="white" stroke="#f97316" strokeWidth={2} />
        ))}
      </svg>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <motion.article
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-gray-900">{value}</p>
      <div className="mt-3">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </span>
      </div>
    </motion.article>
  );
}

type DemoAlert = {
  id: string;
  tone: "danger" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  showAction?: boolean;
};

function demoAlertsFromDict(t: NetworkDashboardCopy): DemoAlert[] {
  return [
    {
      id: "a1",
      tone: "danger",
      title: t.alertLatencyTitle,
      description: t.alertLatencyDesc,
      time: t.alertTime2m,
      showAction: true,
    },
    {
      id: "a2",
      tone: "warning",
      title: t.alertDiskTitle,
      description: t.alertDiskDesc,
      time: t.alertTime15m,
    },
    {
      id: "a3",
      tone: "info",
      title: t.alertDeployTitle,
      description: t.alertDeployDesc,
      time: t.alertTime1h,
    },
  ];
}

export function ServerNetworkDashboard({
  session: _session,
  dashboard,
}: {
  session: AccountSession;
  dashboard: ConsoleDashboard | null;
}) {
  void _session;
  const { dictionary } = useLanguage();
  const t = dictionary.panel.networkDashboard;
  const [alerts, setAlerts] = useState<DemoAlert[]>(() => {
    const api = dashboard?.alerts ?? [];
    if (api.length === 0) return demoAlertsFromDict(t);
    const tones: DemoAlert["tone"][] = ["danger", "warning", "info"];
    return api.slice(0, 3).map((a, i) => ({
      id: a.id,
      tone: tones[i] ?? "info",
      title: a.title,
      description: a.message,
      time: t.justNow,
      showAction: i === 0,
    }));
  });
  const [page, setPage] = useState(1);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return INVENTORY.slice(start, start + PAGE_SIZE);
  }, [page]);

  const totalResources = INVENTORY.length;
  const totalPages = Math.max(1, Math.ceil(totalResources / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalResources);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title={t.kpiRequests} value={t.kpiRequestsValue} trend={t.kpiRequestsTrend} trendUp />
        <KpiCard title={t.kpiLatency} value={t.kpiLatencyValue} trend={t.kpiLatencyTrend} trendUp={false} />
        <KpiCard title={t.kpiErrors} value={t.kpiErrorsValue} trend={t.kpiErrorsTrend} trendUp={false} />
        <KpiCard title={t.kpiNodes} value={t.kpiNodesValue} trend={t.kpiNodesTrend} trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DualLineChart title={t.chartTitle} requestsLabel={t.legendRequests} latencyLabel={t.legendLatency} />
        </div>
        <div className="lg:col-span-2">
          <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">{t.alertsTitle}</h3>
              <button
                type="button"
                onClick={() => setAlerts([])}
                disabled={alerts.length === 0}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                {t.dismissAll}
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {alerts.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">{t.noAlerts}</p>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-lg border p-3",
                      a.tone === "danger" && "border-red-200 bg-red-50/50",
                      a.tone === "warning" && "border-amber-200 bg-amber-50/50",
                      a.tone === "info" && "border-blue-200 bg-blue-50/50",
                    )}
                  >
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          a.tone === "danger" && "bg-red-100 text-red-600",
                          a.tone === "warning" && "bg-amber-100 text-amber-600",
                          a.tone === "info" && "bg-blue-100 text-blue-600",
                        )}
                      >
                        {a.tone === "danger" ? (
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                          </svg>
                        ) : a.tone === "warning" ? (
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                          </svg>
                        ) : (
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-gray-600">{a.description}</p>
                        <p className="mt-2 text-[11px] text-gray-400">{a.time}</p>
                        {a.showAction ? (
                          <button
                            type="button"
                            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                          >
                            <svg className="size-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                              />
                            </svg>
                            {t.investigate}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">{t.inventoryTitle}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg className="size-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              {t.filter}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg className="size-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              {t.export}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">{t.colInstance}</th>
                <th className="px-4 py-3">{t.colStatus}</th>
                <th className="px-4 py-3">{t.colCpuMemory}</th>
                <th className="px-4 py-3">{t.colUptime}</th>
                <th className="w-14 px-4 py-3 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.name}</td>
                  <td className="px-4 py-3">
                    {row.status === "online" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        <svg className="size-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {t.statusOnline}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-red-100">
                        <svg className="size-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                          />
                        </svg>
                        {t.statusWarning}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2 min-w-[140px]">
                      <div>
                        <div className="mb-0.5 flex justify-between text-[11px] text-gray-500">
                          <span>{t.cpu}</span>
                          <span className="tabular-nums text-gray-800">{row.cpu.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn("h-full rounded-full transition-all", barClass(row.cpu))}
                            style={{ width: `${Math.min(100, row.cpu)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-0.5 flex justify-between text-[11px] text-gray-500">
                          <span>{t.memory}</span>
                          <span className="tabular-nums text-gray-800">{row.memory.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn("h-full rounded-full transition-all", barClass(row.memory))}
                            style={{ width: `${Math.min(100, row.memory)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-700">{row.uptime}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label={t.rowMenu}
                    >
                      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {t.showingRange
              .replace("{from}", String(from))
              .replace("{to}", String(to))
              .replace("{total}", String(totalResources))}
          </p>
          <nav className="flex items-center gap-1" aria-label={t.paginationAria}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label={t.prevPage}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "min-w-8 rounded-md px-2 py-1 text-xs font-medium tabular-nums",
                  p === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label={t.nextPage}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
