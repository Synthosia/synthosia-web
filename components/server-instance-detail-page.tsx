"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "motion/react";
import { CloudServiceConfigForm } from "@/components/cloud-service-config-form";
import { CloudServiceStreamPanels } from "@/components/cloud-service-stream-panels";
import { InstanceActionsSidebar } from "@/components/instance/InstanceActionsSidebar";
import { InstanceMetricsStrip } from "@/components/instance/InstanceMetricsStrip";
import { InstanceAccessActivityPanel } from "@/components/instance/instance-access-activity";
import { InstanceAuditPeersPollPanel } from "@/components/instance/instance-audit-peers";
import { InstanceMonitoringCharts } from "@/components/instance/InstanceMonitoringCharts";
import { useLanguage } from "@/components/language-provider";
import {
  cloudStatusBadgeClass,
  cloudStatusDotClass,
  cloudStatusLabel,
  mapComputeInstanceToRow,
  mapComputeLifecycleFromStatus,
  type CloudLifecycle,
  type ServerRow,
} from "@/components/server-row-types";
import { cn } from "@/lib/cn";
import type { AccountSession } from "@/lib/account-session";
import { buildAccountPanelHref, type InstanceDetailTab } from "@/lib/account-panel-url";
import {
  ApiClientError,
  deleteComputeInstance,
  listComputeInstances,
  postComputeInstanceRestart,
  postComputeInstanceStart,
  postComputeInstanceStop,
  type ComputeInstance,
} from "@/lib/synthosia-api";
import { CloudBackup, CloudSync, CloudUpload, Copy, HardDriveUpload, Play, RotateCcw, Square, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function ServerInstanceDetailPage({
  session,
  cloudBindingId,
  initialDetailTab,
  onBack,
}: {
  session: AccountSession;
  cloudBindingId: string;
  /** A partir da query `view=` (ex.: abrir consola de stream noutra janela). */
  initialDetailTab?: InstanceDetailTab;
  onBack: () => void;
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring as Record<string, string>;
  const canManage = session.role !== "viewer";

  const [service, setService] = useState<ComputeInstance | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<InstanceDetailTab>(() => initialDetailTab ?? "overview");
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const list = await listComputeInstances();
        setService(list.find((s) => s.id === cloudBindingId) ?? null);
        setLoadErr(false);
      } catch {
        setService(null);
        setLoadErr(true);
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [cloudBindingId],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setTab(initialDetailTab ?? "overview");
  }, [cloudBindingId, initialDetailTab]);

  useEffect(() => {
    if (!service) return;
    const st = service.status;
    if (
      st !== "pending" &&
      st !== "provisioning_requested" &&
      st !== "provisioning" &&
      st !== "reconfiguring" &&
      st !== "destroying"
    )
      return;
    const id = window.setInterval(() => void refresh({ silent: true }), 4000);
    return () => window.clearInterval(id);
  }, [service, refresh]);

  const pollInstanceRow = useCallback(
    async (done: (row: ComputeInstance | null) => boolean) => {
      for (let i = 0; i < 25; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 2000));
        try {
          const list = await listComputeInstances();
          const s = list.find((x) => x.id === cloudBindingId) ?? null;
          setService(s);
          if (done(s)) return;
        } catch {
          break;
        }
      }
    },
    [cloudBindingId],
  );


  const serverRow: ServerRow | null = useMemo(
    () => (service ? mapComputeInstanceToRow(service) : null),
    [service],
  );

  const cloudLifecycle: CloudLifecycle = service ? mapComputeLifecycleFromStatus(service.status) : "unknown";

  // Starts of Header Actions

  // Fixed parans
  const computePlane = true;
  const railwayMissing = false;

  const running = cloudLifecycle === "running";
  const stopped = cloudLifecycle === "stopped";
  const errorLc = cloudLifecycle === "error";

  const computeTransitioning =
    computePlane &&
    (cloudLifecycle === "provisioning" ||
      cloudLifecycle === "pending_deploy" ||
      cloudLifecycle === "reconfiguring" ||
      cloudLifecycle === "removing");

  const computeOnlineActions = running && !computeTransitioning;
  const computeOfflineActions = stopped && !computeTransitioning;
  const computeErrorSurface = errorLc && !computeTransitioning;

  const hasDeployment =
    service?.status === "running" ||
    service?.status === "stopped" ||
    service?.status === "error" ||
    service?.status === "reconfiguring"

  const canStop = running && !railwayMissing;
  const canRestart =
    hasDeployment &&
    !railwayMissing &&
    cloudLifecycle !== "pending_deploy" &&
    cloudLifecycle !== "provisioning" &&
    cloudLifecycle !== "reconfiguring";

  // Ends of Header Actions

  const runDelete = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await deleteComputeInstance(cloudBindingId);
      onBack();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, onBack, sm.modalError]);

  const runStop = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await postComputeInstanceStop(cloudBindingId);
      await pollInstanceRow((s) => s?.status === "stopped" || s?.status === "error");
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, pollInstanceRow, sm.modalError]);

  const runStart = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await postComputeInstanceStart(cloudBindingId);
      await pollInstanceRow((s) => s?.status === "running" || s?.status === "error");
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, pollInstanceRow, sm.modalError]);

  const runRestart = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await postComputeInstanceRestart(cloudBindingId);
      await new Promise((r) => setTimeout(r, 2500));
      await refresh({ silent: true });
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, refresh, sm.modalError]);

  const tabCls = (active: boolean) =>
    cn(
      "relative whitespace-nowrap pb-3 text-sm font-medium transition-colors cursor-pointer",
      active ? "text-[var(--brand-accent-2)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
      active &&
      "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--brand-accent-2)]",
    );


  const metricStripLabels = useMemo(
    () => ({
      cpu: sm.metricCpu,
      cpuHint: sm.metricCpuHint,
      memory: sm.metricMemory,
      memoryHint: sm.metricMemoryHint,
      network: sm.metricNetwork,
      networkHint: sm.metricNetworkHint,
      disk: sm.instanceDetailMetricLimits,
      diskHint: sm.instanceDetailMetricLimitsHint,
      lastWindow: sm.last24h,
      loading: sm.instanceMonitoringLoading,
      telemetryLiveTitle: sm.instanceMetricsLiveTelemetryTitle,
      telemetryHttp: sm.streamPanelHttpProbe,
      telemetryMem: sm.streamPanelContainerMem,
      telemetryRecorded: sm.streamPanelSampleRecorded,
    }),
    [sm],
  );

  const monitoringLabels = useMemo(
    () => ({
      title: sm.instanceMonitoringTitle,
      hours24: sm.instanceMonitoringHours24,
      hours72: sm.instanceMonitoringHours72,
      hours168: sm.instanceMonitoringHours168,
      cpu: sm.metricCpu,
      cpuHint: sm.metricCpuHint,
      memory: sm.metricMemory,
      memoryHint: sm.metricMemoryHint,
      network: sm.metricNetwork,
      networkHint: sm.metricNetworkHint,
      loadError: sm.modalError,
      loading: sm.instanceMonitoringLoading,
    }),
    [sm],
  );

  const auditPeersPollLabels = useMemo(
    () => ({
      panelTitle: sm.auditPeersPanelTitle,
      panelSubtitle: sm.auditPeersPanelSubtitle,
      pollHint: sm.auditPeersPollHint,
      colAddress: sm.auditPeersColAddress,
      colConnections: sm.auditPeersColConnections,
      empty: sm.auditPeersEmpty,
      recordedAtTemplate: sm.auditPeersRecordedAt,
    }),
    [sm],
  );

  const accessActivityLabels = useMemo(
    () => ({
      panelTitle: sm.accessActivityTitle,
      panelSubtitle: sm.accessActivitySubtitle,
      hintTraefik: sm.accessActivityHintTraefik,
      colTime: sm.accessActivityColTime,
      colRequest: sm.accessActivityColRequest,
      colStatus: sm.accessActivityColStatus,
      colLatency: sm.accessActivityColLatency,
      colHost: sm.accessActivityColHost,
      colClient: sm.accessActivityColClient,
      empty: sm.accessActivityEmpty,
      loadMore: sm.accessActivityLoadMore,
      refresh: sm.accessActivityRefresh,
      loadError: sm.accessActivityLoadError,
    }),
    [sm],
  );

  const sidebarLabels = useMemo(
    () => ({
      actions: sm.sidebarActions,
      health: sm.sidebarHealth,
      billing: sm.sidebarBilling,
      deploy: sm.actionDeploy,
      restart: sm.actionRestart,
      stop: sm.actionStop,
      start: sm.actionStart,
      delete: sm.actionDelete,
      billingPlaceholder: sm.sidebarBillingPlaceholder,
      billingLink: sm.sidebarBillingLink,
      healthCpu: sm.sidebarHealthCpu,
      healthDeploy: sm.sidebarHealthDeploy,
      healthSync: sm.sidebarHealthSync,
      healthApi: sm.sidebarHealthApi,
      statusOk: sm.sidebarStatusOk,
      statusWarn: sm.sidebarStatusWarn,
      confirmDelete: sm.instanceDetailConfirmDelete,
      confirmStop: sm.instanceDetailConfirmStop,
      liveTelemetry: sm.instanceDetailLiveTelemetry,
      telemetryHttp: sm.streamPanelHttpProbe,
      telemetryMem: sm.streamPanelContainerMem,
      telemetryRecorded: sm.streamPanelSampleRecorded,
    }),
    [sm],
  );

  if (loading) {
    return (
      <div
        className={cn(
          inter.className,
          "mx-auto max-w-5xl space-y-4 text-[var(--text-primary)]",
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[#1a73e8] hover:underline"
        >
          ← {sm.instanceDetailBack}
        </button>
        <p className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {sm.loadingServers}
        </p>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div
        className={cn(
          inter.className,
          "mx-auto max-w-5xl space-y-4 text-[var(--text-primary)]",
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[#1a73e8] hover:underline"
        >
          ← {sm.instanceDetailBack}
        </button>
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {sm.consoleLoadServiceError}
        </p>
      </div>
    );
  }

  if (!service || !serverRow) {
    return (
      <div
        className={cn(
          inter.className,
          "mx-auto max-w-5xl space-y-4 text-[var(--text-primary)]",
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[#1a73e8] hover:underline"
        >
          ← {sm.instanceDetailBack}
        </button>
        <p className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {sm.modalSelectServer ?? "Instância não encontrada."}
        </p>
      </div>
    );
  }

  function formatCamelCase(text: string) {
    return text
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, str => str.toUpperCase());
  }

  function ActionTechnicalDetails() {
    const technicalDetails = useMemo(() => {
      if (!service) return sm.actionTechnicalNotFound;

      return Object.entries(service).map(([key, value]) => {
        const parsedValue =
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value);

        return (
          <div key={key} className="group flex justify-between items-center px-4 py-1.5 duration-300 hover:duration-300 rounded-2xl">
            <div className="flex flex-col">
              <p className="font-semibold">{formatCamelCase(key)}</p>
              <p className="text-sm break-all">{parsedValue}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Copy
                  onClick={() => navigator.clipboard.writeText(parsedValue)}
                  className="w-4 h-4 cursor-pointer hidden opacity-50 group-hover:block hover:opacity-100 duration-300 hover:duration-300"
                />
              </TooltipTrigger>
              <TooltipContent>
                <span>{dictionary.copy.idle}</span>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      });
    }, [service]);

    return technicalDetails;
  }

  return (
    <div
      className={cn(inter.className, "mx-auto min-h-0 max-w-[1600px] text-[var(--text-primary)] antialiased")}
    >
      <header className="mb-8 border-b border-[var(--border-subtle)] pb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm cursor-pointer font-medium text-[var(--brand-accent-2)] hover:underline"
        >
          ← {sm.instanceDetailBack}
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="min-w-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {sm.instanceDetailEyebrow}
            </p>
            <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
              {service.name}
            </h1>
            <p className="mt-2 font-mono text-xs text-[var(--text-secondary)]">
              <span className="mr-2 font-sans text-[11px] font-medium uppercase text-[var(--text-muted)]">
                {sm.instanceDetailBindingId}
              </span>
              {service.id}
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)]">{sm.region}</dt>
                <dd className="font-medium text-[var(--text-primary)]">VPS / compute plane</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)]">Container</dt>
                <dd className="font-mono text-xs text-[var(--text-secondary)]">
                  {service.nerdctlContainerName?.trim() || "—"}
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* Actions Header */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className={cn(
              "w-full gap-4 h-10 flex items-center justify-around rounded-2xl border bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
              cloudStatusBadgeClass(cloudLifecycle),
            )}>
              {/* Status */}
              <span
                className={cn(
                  "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                  cloudStatusBadgeClass(cloudLifecycle),
                )}
              >
                <span className={cn("size-2 rounded-full", cloudStatusDotClass(cloudLifecycle))} />
                {cloudStatusLabel(serverRow, sm)}
              </span>

              {computeOfflineActions && (
                <>
                  {/* Start */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        disabled={!canManage || lifecycleBusy}
                        onClick={() => { runStart(); }}
                      >
                        <Play className="w-5 h-5 cursor-pointer duration-200 hover:duration-200 hover:stroke-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{sidebarLabels.start}</span>
                    </TooltipContent>
                  </Tooltip>


                  {/* Deploy */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        disabled={!canManage || lifecycleBusy}
                        onClick={() => { setTab("configuration") }}
                      >
                        <CloudUpload className="w-5 h-5 cursor-pointer duration-200 hover:duration-200 hover:stroke-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>{sidebarLabels.deploy}</span>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {computeOnlineActions && (
                <>
                  {/* Stop */}
                  {canStop && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={!canManage || lifecycleBusy}
                          onClick={() => {
                            if (window.confirm(sm.instanceDetailConfirmStop)) runStop();
                          }}
                        >
                          <Square className="w-5 h-5 cursor-pointer duration-200 hover:duration-200 hover:stroke-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{sidebarLabels.stop}</span>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Restart */}
                  {canRestart && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled={!canManage || lifecycleBusy}
                          onClick={() => { }}
                        >
                          <RotateCcw className="w-5 h-5 cursor-pointer duration-200 hover:duration-200 hover:stroke-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{sidebarLabels.restart}</span>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Deploy */}
              {computeErrorSurface && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      disabled={!canManage || lifecycleBusy}
                      onClick={() => { setTab("configuration") }}
                    >
                      <CloudUpload className="w-5 h-5 cursor-pointer duration-200 hover:duration-200 hover:stroke-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{sidebarLabels.deploy}</span>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={!canManage || lifecycleBusy}
                    onClick={() => {
                      if (window.confirm(sm.instanceDetailConfirmDelete)) runDelete();
                    }}
                  >
                    <Trash className="w-5 h-5 cursor-pointer text-[#dc2626] duration-200 hover:duration-200 hover:stroke-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{sidebarLabels.delete}</span>
                </TooltipContent>
              </Tooltip>

            </div>
          </div>
        </div>

        <nav
          className="mt-8 flex gap-6 overflow-x-auto border-b border-[var(--border-subtle)]"
          aria-label={sm.instanceDetailTabsAria}
        >
          {(
            [
              ["overview", sm.tabOverview],
              ["monitoring", sm.tabMonitoring],
              ["configuration", sm.tabConfiguration],
              ["stream", sm.tabStream],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className={tabCls(tab === id)} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-8 lg:flex-[7]">
          {tab === "overview" ? (
            <>
              <InstanceMetricsStrip bindingId={cloudBindingId} service={service} labels={metricStripLabels} />
              <div className="grid gap-4 lg:grid-cols-1">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">{sm.actionTechnical}</h2>
                  <pre className="mt-4 max-h-[min(72vh,40rem)] min-h-[12rem] overflow-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] sm:text-[13px]">
                    <ActionTechnicalDetails />
                  </pre>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">{sm.modalTechnicalFootnote}</p>
                </motion.section>
              </div>
            </>
          ) : null}

          {tab === "monitoring" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <InstanceMonitoringCharts bindingId={cloudBindingId} labels={monitoringLabels} />
              </div>
              <InstanceAccessActivityPanel bindingId={cloudBindingId} labels={accessActivityLabels} />
              <InstanceAuditPeersPollPanel bindingId={cloudBindingId} labels={auditPeersPollLabels} />
            </div>
          ) : null}

          {tab === "configuration" ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <CloudServiceConfigForm
                selected={serverRow}
                t={sm}
                canManage={canManage}
                onRefresh={refresh}
                onDeleted={onBack}
                surface="instance"
              />
            </div>
          ) : null}

          {tab === "stream" ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {sm.instanceDetailStreamIntro ??
                    "Fluxo em tempo real (SSE) para estado, registos do contentor e job de provisionamento."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      buildAccountPanelHref("servers", "srv-instance-detail", cloudBindingId, "stream"),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--surface-interactive)]"
                >
                  {sm.instanceDetailOpenStreamWindow ?? "Abrir consola numa nova janela"}
                </button>
              </div>
              <CloudServiceStreamPanels
                cloudBindingId={cloudBindingId}
                railwayMissing={false}
                visual="gcp"
                layout="wide"
              />
            </div>
          ) : null}
        </div>

        {tab !== "stream" ? (
          <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72 lg:flex-[3] xl:w-80">
            <InstanceActionsSidebar
              labels={sidebarLabels}
              canManage={canManage}
              busy={lifecycleBusy}
              lifecycle={cloudLifecycle}
              railwayMissing={false}
              computePlane
              bindingId={cloudBindingId}
              hasDeployment={
                service.status === "running" ||
                service.status === "stopped" ||
                service.status === "error" ||
                service.status === "reconfiguring"
              }
              onDeploy={() => setTab("configuration")}
              onRestart={() => void runRestart()}
              onStop={() => void runStop()}
              onStart={() => void runStart()}
              onDelete={() => void runDelete()}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function serverInstanceDetailHref(bindingId: string, view?: InstanceDetailTab): string {
  return buildAccountPanelHref("servers", "srv-instance-detail", bindingId, view);
}
