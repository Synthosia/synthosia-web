"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { mapCloudLifecycleFromStatus } from "@/components/server-row-types";
import type { AccountSession } from "@/lib/account-session";
import {
  ApiClientError,
  cloudManagedServiceStreamUrl,
  deleteCloudManagedService,
  deployCloudService,
  forgetCloudManagedServiceBinding,
  listCloudManagedServices,
  recreateCloudManagedService,
  restartCloudService,
  stopCloudService,
  type CloudManagedService,
} from "@/lib/synthosia-api";

type CloudServiceSseSnapshot = {
  type?: string;
  railwayMissing?: boolean;
  deployment?: { id?: string; status?: string };
  metrics?: {
    cpu?: { ts?: number; value?: number };
    memoryGb?: { ts?: number; value?: number };
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

export function CloudServiceConsole({
  session,
  cloudBindingId,
  onNavigateCloud,
  onBackToServerList,
}: {
  session: AccountSession;
  cloudBindingId: string | null;
  onNavigateCloud: (bindingId: string | null) => void;
  onBackToServerList: () => void;
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring as Record<string, string>;
  const canManage = session.role !== "viewer";

  const [serviceRow, setServiceRow] = useState<CloudManagedService | null>(null);
  const [loadErr, setLoadErr] = useState(false);

  useEffect(() => {
    if (!cloudBindingId) {
      setServiceRow(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const list = await listCloudManagedServices();
        if (cancelled) return;
        const row = list.find((s) => s.id === cloudBindingId) ?? null;
        setServiceRow(row);
        setLoadErr(false);
      } catch {
        if (!cancelled) {
          setServiceRow(null);
          setLoadErr(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cloudBindingId]);

  const railwayMissing = !!serviceRow?.railwayMissing;
  const [snap, setSnap] = useState<CloudServiceSseSnapshot | null>(null);
  const [runtimeText, setRuntimeText] = useState("");
  const [buildText, setBuildText] = useState("");
  const [streamState, setStreamState] = useState<"idle" | "live" | "error">("idle");
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const runtimeBottom = useRef<HTMLDivElement>(null);
  const buildBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cloudBindingId || railwayMissing) {
      setSnap(null);
      setRuntimeText("");
      setBuildText("");
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
      es.addEventListener("logsBuild", (e) => {
        setStreamState("live");
        try {
          const d = JSON.parse((e as MessageEvent).data) as StreamLogsPayload;
          if (d.error === "fetch_failed") {
            setBuildText(sm.logsLoadError ?? "Erro ao carregar registos de build.");
          } else {
            setBuildText(
              linesToText(d.lines) || (d.hint === "no_deployment" ? `— ${sm.streamLogsNoDeploy}` : ""),
            );
          }
        } catch {
          /* ignore */
        }
      });

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

  useEffect(() => {
    buildBottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [buildText]);

  const refreshServiceRow = useCallback(async () => {
    if (!cloudBindingId) return;
    try {
      const list = await listCloudManagedServices();
      setServiceRow(list.find((s) => s.id === cloudBindingId) ?? null);
    } catch {
      /* manter estado anterior */
    }
  }, [cloudBindingId]);

  const deployStatus = snap?.deployment?.status ?? serviceRow?.deploymentStatus;
  const cloudLifecycle = railwayMissing ? ("error" as const) : mapCloudLifecycleFromStatus(deployStatus);
  const latestDeploymentId = snap?.deployment?.id ?? serviceRow?.latestDeploymentId ?? null;

  const runDeploy = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    setLifecycleBusy(true);
    try {
      await deployCloudService(cloudBindingId);
      await refreshServiceRow();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, refreshServiceRow, sm.modalError]);

  const runRestart = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    setLifecycleBusy(true);
    try {
      await restartCloudService(cloudBindingId);
      await refreshServiceRow();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, refreshServiceRow, sm.modalError]);

  const runStop = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    setLifecycleBusy(true);
    try {
      await stopCloudService(cloudBindingId);
      await refreshServiceRow();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, refreshServiceRow, sm.modalError]);

  const runDelete = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    if (!window.confirm(sm.deleteConfirm ?? "Eliminar este serviço?")) return;
    setLifecycleBusy(true);
    try {
      await deleteCloudManagedService(cloudBindingId);
      onNavigateCloud(null);
      onBackToServerList();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, onNavigateCloud, onBackToServerList, sm.deleteConfirm, sm.modalError]);

  const runRecreate = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    setLifecycleBusy(true);
    try {
      await recreateCloudManagedService(cloudBindingId);
      await refreshServiceRow();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, refreshServiceRow, sm.modalError]);

  const runForgetBinding = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    if (!window.confirm(sm.forgetConfirm)) return;
    setLifecycleBusy(true);
    try {
      await forgetCloudManagedServiceBinding(cloudBindingId);
      onNavigateCloud(null);
      onBackToServerList();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, onNavigateCloud, onBackToServerList, sm.forgetConfirm, sm.modalError]);

  const cpu = snap?.metrics?.cpu?.value;
  const mem = snap?.metrics?.memoryGb?.value;
  const cpuLabel =
    cpu != null ? `${cpu <= 1 && cpu >= 0 ? Math.round(cpu * 100) : Math.round(cpu)}%` : "—";
  const memLabel = mem != null ? `${mem < 32 ? mem.toFixed(2) : Math.round(mem)} GB` : "—";

  if (!cloudBindingId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">{sm.consolePickService}</p>
        <p className="mt-2 text-xs text-gray-600">{sm.consolePickServiceHint}</p>
        <button
          type="button"
          onClick={onBackToServerList}
          className="btn-primary focus-themed mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium"
        >
          {sm.consoleBackToServerList}
        </button>
      </div>
    );
  }

  if (loadErr) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {sm.consoleLoadServiceError}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-gray-900">{sm.consoleStreamPageTitle}</h1>
          <p className="mt-1 text-xs text-gray-600">
            {serviceRow?.name ? (
              <>
                <span className="font-medium text-gray-800">{serviceRow.name}</span>
                <span className="text-gray-400"> · </span>
              </>
            ) : null}
            {sm.consoleStreamPageSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToServerList}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          {sm.consoleBackToServerList}
        </button>
      </div>

      {cloudBindingId && serviceRow && !railwayMissing ? (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {sm.consoleInstanceActions}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canManage || lifecycleBusy || cloudLifecycle === "provisioning"}
              onClick={() => void runDeploy()}
              className="rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-medium text-cyan-900 shadow-sm transition hover:bg-cyan-100 disabled:opacity-50"
            >
              {sm.actionDeploy}
            </button>
            <button
              type="button"
              disabled={
                !canManage ||
                lifecycleBusy ||
                !latestDeploymentId ||
                cloudLifecycle === "pending_deploy" ||
                cloudLifecycle === "provisioning"
              }
              onClick={() => void runRestart()}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              {sm.actionRestart}
            </button>
            <button
              type="button"
              disabled={!canManage || lifecycleBusy || cloudLifecycle !== "running"}
              onClick={() => void runStop()}
              className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-950 shadow-sm transition hover:bg-amber-100 disabled:opacity-50"
            >
              {sm.actionStop}
            </button>
            <button
              type="button"
              disabled={!canManage || lifecycleBusy}
              onClick={() => void runDelete()}
              className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-900 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
            >
              {sm.actionDelete}
            </button>
          </div>
        </div>
      ) : null}

      {railwayMissing ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">{sm.orphanBannerTitle}</p>
          <p className="mt-1 text-xs leading-relaxed">{sm.orphanBannerBody}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canManage || lifecycleBusy}
              onClick={() => void runRecreate()}
              className="rounded-md border border-cyan-600/30 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-950 disabled:opacity-50"
            >
              {sm.actionRecreate}
            </button>
            <button
              type="button"
              disabled={!canManage || lifecycleBusy}
              onClick={() => void runForgetBinding()}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 disabled:opacity-50"
            >
              {sm.actionForgetBinding}
            </button>
          </div>
        </div>
      ) : null}

      {!railwayMissing ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Painel 1: estado / métricas — evento SSE snapshot */}
          <section
            className="flex min-h-[320px] flex-col rounded-xl border border-cyan-100 bg-cyan-50/35 p-4 shadow-sm"
            aria-label={sm.streamPanelStatus}
          >
            <div className="flex items-center justify-between gap-2 border-b border-cyan-100/80 pb-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-cyan-950/85">
                {sm.streamPanelStatus}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                  streamState === "live" && "bg-emerald-100 text-emerald-900",
                  streamState === "idle" && "bg-sky-100 text-sky-900",
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
            <div className="mt-3 flex-1 overflow-auto">
              {snap?.runtime?.containerOsHint ? (
                <p className="text-xs text-gray-800">
                  <span className="text-gray-500">{sm.liveStreamOsHint}: </span>
                  {snap.runtime.containerOsHint}
                </p>
              ) : null}
              {snap?.runtime?.ssh?.message ? (
                <p className="mt-2 text-[11px] leading-snug text-gray-600">{snap.runtime.ssh.message}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-white/90 bg-white px-2 py-2 shadow-sm">
                  <p className="text-[10px] font-medium uppercase text-gray-400">{sm.liveStreamCpu}</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-gray-900">{cpuLabel}</p>
                </div>
                <div className="rounded-md border border-white/90 bg-white px-2 py-2 shadow-sm">
                  <p className="text-[10px] font-medium uppercase text-gray-400">{sm.liveStreamMem}</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-gray-900">{memLabel}</p>
                </div>
              </div>
              {snap?.deployment?.status ? (
                <p className="mt-4 text-[11px] text-gray-700">
                  <span className="font-medium text-gray-500">{sm.liveStreamDeploy}: </span>
                  {snap.deployment.status}
                </p>
              ) : null}
              {snap?.at ? <p className="mt-3 text-[10px] text-gray-400">{snap.at}</p> : null}
            </div>
          </section>

          {/* Painel 2: logs runtime — evento SSE logsRuntime */}
          <section
            className="flex min-h-[320px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            aria-label={sm.streamPanelRuntime}
          >
            <h2 className="border-b border-gray-100 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {sm.streamPanelRuntime}
            </h2>
            <pre className="mt-3 max-h-[min(52vh,28rem)] flex-1 overflow-auto rounded-md border border-gray-900/10 bg-gray-950 px-2 py-2 font-mono text-[10px] leading-relaxed text-emerald-100/95">
              {runtimeText || sm.streamPanelLogsWaiting}
              <div ref={runtimeBottom} />
            </pre>
          </section>

          {/* Painel 3: logs build — evento SSE logsBuild */}
          <section
            className="flex min-h-[320px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            aria-label={sm.streamPanelBuild}
          >
            <h2 className="border-b border-gray-100 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {sm.streamPanelBuild}
            </h2>
            <p className="mt-1 text-[10px] text-gray-400">{sm.streamPanelBuildHint}</p>
            <pre className="mt-2 max-h-[min(52vh,28rem)] flex-1 overflow-auto rounded-md border border-gray-900/10 bg-gray-950 px-2 py-2 font-mono text-[10px] leading-relaxed text-sky-100/95">
              {buildText || sm.streamPanelLogsWaiting}
              <div ref={buildBottom} />
            </pre>
          </section>
        </div>
      ) : null}
    </div>
  );
}
