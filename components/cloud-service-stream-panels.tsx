"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { AuditPeersTable } from "@/components/instance/instance-audit-peers";
import { useInstanceMetricsWebSocket } from "@/components/instance/use-instance-metrics-ws";
import { cloudManagedServiceStreamUrl } from "@/lib/synthosia-api";
import { formatContainerMem, formatHttpProbeSummary } from "@/lib/telemetry-display";
import { Fullscreen } from "lucide-react";

type MetricsLiveSample = {
  recordedAt?: string;
  recordedAtMs?: number;
  cpuPercent?: number;
  memoryPercent?: number;
  networkInMbps?: number;
  networkOutMbps?: number;
  httpProbe?: unknown;
  container?: unknown;
  telemetryVersion?: unknown;
};

type CloudServiceSseSnapshot = {
  railwayMissing?: boolean;
  deployment?: { id?: string; status?: string };
  metrics?: {
    cpu?: { ts?: number; value?: number };
    memoryGb?: { ts?: number; value?: number };
    networkInMbps?: { ts?: number; value?: number };
    networkOutMbps?: { ts?: number; value?: number };
    telemetryExtras?: Record<string, unknown>;
    liveSample?: MetricsLiveSample | null;
  };
  runtime?: {
    containerOsHint?: string;
    ssh?: { message?: string; online?: boolean; supportedInApi?: boolean };
  };
  at?: string;
  cloudConfigured?: boolean;
};

type StreamLogLine = { message: string; timestamp?: string | null };

type StreamLogsPayload = {
  kind?: string;
  lines?: StreamLogLine[];
  at?: string;
  railwayMissing?: boolean;
  hint?: string;
  error?: string;
  cloudConfigured?: boolean;
};

function linesToText(lines: StreamLogLine[] | undefined): string {
  if (!lines?.length) return "";
  return lines.map((l) => (l.timestamp ? `${l.timestamp} ` : "") + l.message).join("\n");
}

/** Painéis SSE: estado + runtime + build (sem barra de ações). */
export function CloudServiceStreamPanels({
  cloudBindingId,
  railwayMissing,
  showStatusPanel = true,
  visual = "default",
  layout = "default",
}: {
  cloudBindingId: string | null;
  railwayMissing: boolean;
  showStatusPanel?: boolean;
  /** `gcp` — cartões brancos, cantos 16px, sombra leve (detalhe instância). */
  visual?: "default" | "gcp";
  /** `wide` — coluna única, consolas de log mais altas (página de detalhe). */
  layout?: "default" | "wide";
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring as Record<string, string>;
  const gcp = visual === "gcp";
  const wide = layout === "wide";

  const [snap, setSnap] = useState<CloudServiceSseSnapshot | null>(null);
  const [runtimeText, setRuntimeText] = useState("");
  // const [buildText, setBuildText] = useState("");
  const [streamState, setStreamState] = useState<"idle" | "live" | "error">("idle");

  const [logExpanded, setLogExpanded] = useState(false);

  const runtimeBottom = useRef<HTMLDivElement>(null);
  // const buildBottom = useRef<HTMLDivElement>(null);

  const mergeWsSnapshot = useCallback((incoming: Record<string, unknown>) => {
    setSnap((prev) => {
      const base = { ...(prev ?? {}) } as CloudServiceSseSnapshot;
      const incMetrics = incoming.metrics as CloudServiceSseSnapshot["metrics"] | undefined;
      return {
        ...base,
        ...(incoming as Partial<CloudServiceSseSnapshot>),
        metrics: {
          ...base.metrics,
          ...incMetrics,
        },
      };
    });
  }, []);

  const { status: metricsWsStatus } = useInstanceMetricsWebSocket(
    cloudBindingId ?? undefined,
    mergeWsSnapshot,
  );

  useEffect(() => {
    if (!cloudBindingId || railwayMissing) {
      setSnap(null);
      setRuntimeText("");
      // setBuildText("");
      setStreamState("idle");
      return;
    }

    const url = cloudManagedServiceStreamUrl(cloudBindingId);
    let es: EventSource | null = null;
    let reconnectTimer: number | undefined;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }
      es?.close();
      es = new EventSource(url, { withCredentials: true });
      setStreamState("live");

      es.addEventListener("snapshot", (e) => {
        setStreamState("live");
        try {
          setSnap(JSON.parse((e as MessageEvent).data) as CloudServiceSseSnapshot);
        } catch {
          /* ignore */
        }
      });
      es.addEventListener("logsRuntime", (e) => {
        setStreamState("live");
        try {
          const d = JSON.parse((e as MessageEvent).data) as StreamLogsPayload;
          if (d.error === "fetch_failed") {
            setRuntimeText(sm.logsLoadError ?? "Erro ao carregar registos runtime.");
          } else {
            setRuntimeText(
              linesToText(d.lines) || (d.hint === "no_deployment" ? `— ${sm.streamLogsNoDeploy}` : ""),
            );
          }
        } catch {
          /* ignore */
        }
      });

      // es.addEventListener("logsBuild", (e) => {
      //   setStreamState("live");
      //   try {
      //     const d = JSON.parse((e as MessageEvent).data) as StreamLogsPayload;
      //     if (d.error === "fetch_failed") {
      //       setBuildText(sm.logsLoadError ?? "Erro ao carregar registos de build.");
      //     } else {
      //       setBuildText(
      //         linesToText(d.lines) || (d.hint === "no_deployment" ? `— ${sm.streamLogsNoDeploy}` : ""),
      //       );
      //     }
      //   } catch {
      //     /* ignore */
      //   }
      // });

      es.onerror = () => {
        if (cancelled) return;
        setStreamState("error");
        es?.close();
        reconnectTimer = window.setTimeout(connect, 2500);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [cloudBindingId, railwayMissing, sm.logsLoadError, sm.streamLogsNoDeploy]);

  useEffect(() => {
    runtimeBottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [runtimeText]);

  // useEffect(() => {
  //   buildBottom.current?.scrollIntoView({ behavior: "smooth" });
  // }, [buildText]);

  const cpu = snap?.metrics?.cpu?.value;
  const mem = snap?.metrics?.memoryGb?.value;
  const netIn = snap?.metrics?.networkInMbps?.value;
  const netOut = snap?.metrics?.networkOutMbps?.value;
  const auditRaw = snap?.metrics?.telemetryExtras?.audit as
    | { establishedFlows?: number; remotePeers?: unknown[] }
    | undefined;
  const auditFlows =
    typeof auditRaw?.establishedFlows === "number" ? auditRaw.establishedFlows : null;
  const auditPeerSlots = Array.isArray(auditRaw?.remotePeers) ? auditRaw.remotePeers.length : null;

  const live = snap?.metrics?.liveSample;
  const tx = snap?.metrics?.telemetryExtras;
  const httpProbeRaw = live?.httpProbe ?? tx?.httpProbe;
  const containerRaw = live?.container ?? tx?.container;
  const probeSummary = formatHttpProbeSummary(httpProbeRaw);
  const containerMem = formatContainerMem(containerRaw);

  const cpuLabel =
    cpu != null ? `${cpu <= 1 && cpu >= 0 ? Math.round(cpu * 100) : Math.round(cpu)}%` : "—";
  const memLabel = mem != null ? `${mem < 32 ? mem.toFixed(2) : Math.round(mem)} GB` : "—";
  const mbpsLabel = (v: number | undefined) =>
    v != null && Number.isFinite(v) ? `${v.toFixed(2)} Mbps` : "—";
  const auditLabel =
    auditFlows != null || auditPeerSlots != null
      ? (sm.liveStreamAuditSummary ?? "{flows} fluxos · {peers} IPs remotos")
        .replace("{flows}", String(auditFlows ?? "—"))
        .replace("{peers}", String(auditPeerSlots ?? "—"))
      : null;

  if (!cloudBindingId || railwayMissing) {
    return (
      <p className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        {sm.streamLogsNoDeploy}
      </p>
    );
  }

  const logPreCls = cn(
    "flex-1 overflow-auto rounded-md border border-gray-900/10 bg-[#0f1115] font-mono leading-relaxed",
    wide
      ? "min-h-[min(58vh,520px)] max-h-[min(78vh,720px)] px-3 py-3 text-[12px] sm:text-[13px]"
      : "mt-3 max-h-[min(52vh,28rem)] px-2 py-2 text-[10px]",
  );

  return (
    <div
      className={cn(
        "grid gap-4",
        wide ? "grid-cols-1" : showStatusPanel ? "lg:grid-cols-3" : "lg:grid-cols-2",
      )}
    >
      {showStatusPanel ? (
        <section
          className={cn(
            "flex flex-col p-4 shadow-sm",
            wide ? "min-h-0 lg:min-h-[200px] lg:flex-row lg:gap-8" : "min-h-[280px]",
            gcp
              ? "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              : "rounded-lg border border-cyan-100 bg-cyan-50/35",
          )}
          aria-label={sm.streamPanelStatus}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-between gap-2 pb-2",
              wide ? "lg:w-64 lg:flex-col lg:items-start lg:border-b-0 lg:pb-0 lg:pr-6" : "",
              gcp ? "border-b border-[var(--border-subtle)]" : "border-b border-cyan-100/80",
              wide && gcp && "lg:border-r lg:border-[var(--border-subtle)]",
            )}
          >
            <h2
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider",
                gcp ? "text-[var(--text-muted)]" : "text-cyan-950/85",
              )}
            >
              {sm.streamPanelStatus}
            </h2>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  metricsWsStatus === "live" && "bg-violet-100 text-violet-900",
                  metricsWsStatus === "connecting" && "bg-slate-100 text-slate-700",
                  metricsWsStatus === "error" && "bg-rose-50 text-rose-900",
                  metricsWsStatus === "idle" &&
                  (gcp ? "bg-[var(--surface-raised)] text-[var(--text-muted)]" : "bg-gray-100 text-gray-600"),
                )}
                title={sm.metricsWsHint ?? "WebSocket: push quando o agente grava métricas na API"}
              >
                {metricsWsStatus === "live"
                  ? sm.metricsWsLive ?? "WS métricas"
                  : metricsWsStatus === "connecting"
                    ? sm.metricsWsConnecting ?? "WS…"
                    : metricsWsStatus === "error"
                      ? sm.metricsWsError ?? "WS erro"
                      : "WS"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  streamState === "live" && "bg-emerald-100 text-emerald-900",
                  streamState === "idle" &&
                  (gcp ? "bg-[var(--surface-raised)] text-[var(--text-secondary)]" : "bg-sky-100 text-sky-900"),
                  streamState === "error" && "bg-amber-100 text-amber-950",
                )}
              >
                {streamState === "live"
                  ? sm.liveStreamLive
                  : streamState === "error"
                    ? sm.liveStreamError
                    : sm.liveStreamConnecting}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "mt-3 flex-1 overflow-auto text-xs",
              wide && "lg:mt-0 lg:min-w-0 lg:self-stretch",
            )}
          >
            {snap?.runtime?.containerOsHint ? (
              <p className="text-[var(--text-primary)]">
                <span className="text-[var(--text-muted)]">{sm.liveStreamOsHint}: </span>
                {snap.runtime.containerOsHint}
              </p>
            ) : null}
            {snap?.runtime?.ssh?.message ? (
              <p className="mt-2 text-[11px] leading-snug text-[var(--text-secondary)]">{snap.runtime.ssh.message}</p>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "rounded-md px-2 py-2 shadow-sm",
                  gcp
                    ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    : "border border-white/90 bg-white",
                )}
              >
                <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">{sm.liveStreamCpu}</p>
                <p className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">{cpuLabel}</p>
              </div>
              <div
                className={cn(
                  "rounded-md px-2 py-2 shadow-sm",
                  gcp
                    ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    : "border border-white/90 bg-white",
                )}
              >
                <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">{sm.liveStreamMem}</p>
                <p className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">{memLabel}</p>
              </div>
              <div
                className={cn(
                  "rounded-md px-2 py-2 shadow-sm",
                  gcp
                    ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    : "border border-white/90 bg-white",
                )}
              >
                <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                  {sm.liveStreamNetIn ?? "Rede ↓"}
                </p>
                <p className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">
                  {mbpsLabel(netIn)}
                </p>
              </div>
              <div
                className={cn(
                  "rounded-md px-2 py-2 shadow-sm",
                  gcp
                    ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    : "border border-white/90 bg-white",
                )}
              >
                <p className="text-[10px] font-medium uppercase text-[var(--text-muted)]">
                  {sm.liveStreamNetOut ?? "Rede ↑"}
                </p>
                <p className="mt-0.5 font-semibold tabular-nums text-[var(--text-primary)]">
                  {mbpsLabel(netOut)}
                </p>
              </div>
            </div>
            {auditLabel ? (
              <p className="mt-3 text-[11px] leading-snug text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-muted)]">{sm.liveStreamAudit ?? "Auditoria"}: </span>
                {auditLabel}
              </p>
            ) : null}
            {live?.recordedAt ? (
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                {(sm as Record<string, string>).streamPanelSampleRecorded ?? "BD"}: {live.recordedAt}
              </p>
            ) : null}
            {(probeSummary || containerMem) && (
              <div
                className={cn(
                  "mt-3 space-y-1 rounded-md px-2 py-2 text-[11px]",
                  gcp
                    ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)]"
                    : "border border-cyan-100/80 bg-white/90",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {(sm as Record<string, string>).instanceMetricsLiveTelemetryTitle ??
                    "Telemetria (extras)"}
                </p>
                {probeSummary ? (
                  <p className="text-[var(--text-primary)]">
                    <span className="text-[var(--text-muted)]">
                      {(sm as Record<string, string>).streamPanelHttpProbe ?? "HTTP"}:{" "}
                    </span>
                    {probeSummary}
                  </p>
                ) : null}
                {containerMem ? (
                  <p className="font-mono text-[11px] text-[var(--text-primary)]">
                    <span className="font-sans text-[var(--text-muted)]">
                      {(sm as Record<string, string>).streamPanelContainerMem ?? "Mem"}:{" "}
                    </span>
                    {containerMem}
                  </p>
                ) : null}
              </div>
            )}
            {snap?.metrics?.telemetryExtras?.audit ? (
              <AuditPeersTable
                variant="embedded"
                audit={snap.metrics.telemetryExtras.audit}
                labels={{
                  caption: sm.auditPeersStreamCaption ?? "Origens remotas (SSE)",
                  colAddress: sm.auditPeersColAddress ?? "Endereço",
                  colConnections: sm.auditPeersColConnections ?? "Ligações",
                  empty: sm.auditPeersEmpty ?? "Sem dados nesta amostra.",
                }}
              />
            ) : null}
            {snap?.deployment?.status ? (
              <p className="mt-4 text-[11px] text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-muted)]">{sm.liveStreamDeploy}: </span>
                {snap.deployment.status}
              </p>
            ) : null}
            {snap?.at ? (
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">{snap.at}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {logExpanded && (
        <div className={cn("fixed inset-0 bg-black/20 backdrop-blur-[1px] w-screen h-screen overflow-auto z-[9998]")}></div>
      )}

      <section
        className={cn(
          "flex flex-col shadow-sm",
          logExpanded && "transition-normal ease-in-out duration-300 absolute inset-0 z-[9999] overflow-hidden max-w-7/8 max-h-7/8 mx-auto",
          wide ? "min-h-0 flex-1" : "min-h-[280px]",
          gcp
            ? "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            : "rounded-lg border border-gray-200 bg-white p-4",
        )}
        aria-label={sm.streamPanelRuntime}
      >
        <div className={cn(
          "flex items-center justify-between border-b mb-2 pb-2",
          gcp ? "border-[var(--border-subtle)] " : "border-gray-100",
        )}>
          <h2
            className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              gcp ? "text-[var(--text-muted)]" : "text-gray-500",
            )}
          >
            {sm.streamPanelRuntime}
          </h2>
          <Fullscreen
            onClick={() => setLogExpanded(!logExpanded)}
            className={cn("h-4 w-4 cursor-pointer", gcp ? "text-[var(--text-muted)]" : "text-gray-500")}
          />
        </div>
        <pre className={cn(logPreCls, !wide && "mt-3", "text-emerald-100/95")}>
          {runtimeText || sm.streamPanelLogsWaiting}
          <div ref={runtimeBottom} />
        </pre>
      </section>

      {/* PAINEL DE BUILD DESATIVADO */}
      {/* <section
        className={cn(
          "flex flex-col shadow-sm",
          wide ? "min-h-0 flex-1" : "min-h-[280px]",
          gcp
            ? "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            : "rounded-lg border border-gray-200 bg-white p-4",
          !showStatusPanel && "lg:col-span-1",
        )}
        aria-label={sm.streamPanelBuild}
      >
        <h2
          className={cn(
            "border-b pb-2 text-[11px] font-semibold uppercase tracking-wider",
            gcp ? "border-[var(--border-subtle)] text-[var(--text-muted)]" : "border-gray-100 text-gray-500",
          )}
        >
          {sm.streamPanelBuild}
        </h2>
        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{sm.streamPanelBuildHint}</p>
        <pre className={cn(logPreCls, wide ? "mt-3" : "mt-2", "text-sky-100/95")}>
          {buildText || sm.streamPanelLogsWaiting}
          <div ref={buildBottom} />
        </pre>
      </section> */}
    </div>
  );
}
