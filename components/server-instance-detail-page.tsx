"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "motion/react";
import { CloudServiceConfigForm } from "@/components/cloud-service-config-form";
import { CloudServiceStreamPanels } from "@/components/cloud-service-stream-panels";
import { InstanceActionsSidebar } from "@/components/instance/InstanceActionsSidebar";
import { InstanceMetricsStrip } from "@/components/instance/InstanceMetricsStrip";
import { InstanceMonitoringCharts } from "@/components/instance/InstanceMonitoringCharts";
import { useLanguage } from "@/components/language-provider";
import {
  cloudStatusBadgeClass,
  cloudStatusDotClass,
  cloudStatusLabel,
  mapCloudLifecycleFromStatus,
  mapCloudManagedToRow,
  type CloudLifecycle,
  type ServerRow,
} from "@/components/server-row-types";
import { cn } from "@/lib/cn";
import type { AccountSession } from "@/lib/account-session";
import { buildAccountPanelHref } from "@/lib/account-panel-url";
import {
  ApiClientError,
  deleteCloudManagedService,
  deployCloudService,
  listCloudManagedServices,
  recreateCloudManagedService,
  restartCloudService,
  stopCloudService,
  type CloudManagedService,
} from "@/lib/synthosia-api";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type DetailTab = "overview" | "monitoring" | "configuration" | "stream";

export function ServerInstanceDetailPage({
  session,
  cloudBindingId,
  onBack,
}: {
  session: AccountSession;
  cloudBindingId: string;
  onBack: () => void;
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring as Record<string, string>;
  const canManage = session.role !== "viewer";

  const [service, setService] = useState<CloudManagedService | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [tab, setTab] = useState<DetailTab>("overview");
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listCloudManagedServices();
      setService(list.find((s) => s.id === cloudBindingId) ?? null);
      setLoadErr(false);
    } catch {
      setService(null);
      setLoadErr(true);
    }
  }, [cloudBindingId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const serverRow: ServerRow | null = useMemo(
    () => (service ? mapCloudManagedToRow(service) : null),
    [service],
  );

  const railwayMissing = !!service?.railwayMissing;
  const cloudLifecycle: CloudLifecycle = railwayMissing
    ? "error"
    : mapCloudLifecycleFromStatus(service?.deploymentStatus);
  const latestDeploymentId = service?.latestDeploymentId ?? null;

  const runDeploy = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await deployCloudService(cloudBindingId);
      await refresh();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, refresh, sm.modalError]);

  const runRestart = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await restartCloudService(cloudBindingId);
      await refresh();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, refresh, sm.modalError]);

  const runStop = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await stopCloudService(cloudBindingId);
      await refresh();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, refresh, sm.modalError]);

  const runRecreate = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await recreateCloudManagedService(cloudBindingId);
      await refresh();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, refresh, sm.modalError]);

  const runDelete = useCallback(async () => {
    if (!canManage) return;
    setLifecycleBusy(true);
    try {
      await deleteCloudManagedService(cloudBindingId);
      onBack();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [canManage, cloudBindingId, onBack, sm.modalError]);

  const tabCls = (active: boolean) =>
    cn(
      "relative whitespace-nowrap pb-3 text-sm font-medium transition-colors",
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

  const sidebarLabels = useMemo(
    () => ({
      actions: sm.sidebarActions,
      health: sm.sidebarHealth,
      billing: sm.sidebarBilling,
      deploy: sm.actionDeploy,
      restart: sm.actionRestart,
      stop: sm.actionStop,
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
    }),
    [sm],
  );

  if (loadErr || (!service && !loadErr)) {
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
          {loadErr ? sm.consoleLoadServiceError : sm.loadingServers}
        </p>
      </div>
    );
  }

  if (!service || !serverRow) {
    return null;
  }

  return (
    <div
      className={cn(inter.className, "mx-auto min-h-0 max-w-[1600px] text-[var(--text-primary)] antialiased")}
    >
      <header className="mb-8 border-b border-[var(--border-subtle)] pb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-medium text-[var(--brand-accent-2)] hover:underline"
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
                {sm.instanceDetailServiceId}
              </span>
              {service.cloudServiceId}
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)]">{sm.region}</dt>
                <dd className="font-medium text-[var(--text-primary)]">
                  {service.region?.trim() || sm.instanceDetailRegionUnknown}
                </dd>
                {service.railwaySyncedAt?.trim() ? (
                  <p className="mt-1 max-w-md text-[11px] leading-snug text-[var(--text-secondary)]">
                    {sm.instanceDetailLastSynced.replace(
                      "{at}",
                      new Date(service.railwaySyncedAt).toLocaleString(),
                    )}
                  </p>
                ) : null}
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--text-muted)]">{sm.instanceDetailBindingId}</dt>
                <dd className="font-mono text-xs text-[var(--text-secondary)]">{service.id}</dd>
              </div>
            </dl>
          </motion.div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <span
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                cloudStatusBadgeClass(cloudLifecycle),
              )}
            >
              <span className={cn("size-2 rounded-full", cloudStatusDotClass(cloudLifecycle))} />
              {cloudStatusLabel(serverRow, sm)}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!canManage || lifecycleBusy || cloudLifecycle === "provisioning" || railwayMissing}
                onClick={() => void runDeploy()}
                className="rounded-lg border border-[#1a73e8] bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1557b0] disabled:opacity-45"
              >
                {sm.actionDeploy}
              </button>
              <button
                type="button"
                disabled={
                  !canManage ||
                  lifecycleBusy ||
                  railwayMissing ||
                  !latestDeploymentId ||
                  cloudLifecycle === "pending_deploy" ||
                  cloudLifecycle === "provisioning"
                }
                onClick={() => void runRestart()}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-interactive)] disabled:opacity-45"
              >
                {sm.actionRestart}
              </button>
              <button
                type="button"
                disabled={!canManage || lifecycleBusy || railwayMissing || cloudLifecycle !== "running"}
                onClick={() => void runStop()}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:opacity-90 disabled:opacity-45"
              >
                {sm.actionStop}
              </button>
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
              <InstanceMetricsStrip
                bindingId={cloudBindingId}
                service={service}
                labels={metricStripLabels}
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {sm.instanceDetailProperties}
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="grid gap-1 border-b border-[var(--border-subtle)] pb-3">
                      <dt className="text-xs font-medium text-[var(--text-muted)]">{sm.instanceDetailImage}</dt>
                      <dd className="break-all font-mono text-xs text-[var(--text-primary)]">
                        {service.dockerImage ?? "—"}
                      </dd>
                    </div>
                    <div className="grid gap-1 border-b border-[var(--border-subtle)] pb-3">
                      <dt className="text-xs font-medium text-[var(--text-muted)]">{sm.deploymentLabel}</dt>
                      <dd className="text-[var(--text-primary)]">
                        {service.deploymentStatus?.trim() ? service.deploymentStatus : sm.activityNoDeploy}
                      </dd>
                    </div>
                    {service.latestDeploymentId ? (
                      <div className="grid gap-1">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">Deployment ID</dt>
                        <dd className="break-all font-mono text-xs text-[var(--text-secondary)]">
                          {service.latestDeploymentId}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </motion.section>
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">{sm.actionTechnical}</h2>
                  <pre className="mt-4 max-h-[min(72vh,40rem)] min-h-[12rem] overflow-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] sm:text-[13px]">
                    {JSON.stringify(
                      {
                        bindingId: service.id,
                        cloudServiceId: service.cloudServiceId,
                        name: service.name,
                        region: service.region,
                        dockerImage: service.dockerImage,
                        limits: service.limits,
                        deploymentStatus: service.deploymentStatus,
                        latestDeploymentId: service.latestDeploymentId,
                        railwaySyncedAt: service.railwaySyncedAt,
                        railwayMissing: service.railwayMissing,
                      },
                      null,
                      2,
                    )}
                  </pre>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">{sm.modalTechnicalFootnote}</p>
                </motion.section>
              </div>
              {railwayMissing ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-950">
                  <p className="font-semibold">{sm.orphanBannerTitle}</p>
                  <p className="mt-1 text-xs leading-relaxed">{sm.orphanBannerBody}</p>
                  <button
                    type="button"
                    disabled={!canManage || lifecycleBusy}
                    onClick={() => void runRecreate()}
                    className="mt-4 rounded-lg border border-cyan-600/30 bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-950 disabled:opacity-50"
                  >
                    {sm.actionRecreate}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {tab === "monitoring" ? (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <InstanceMonitoringCharts bindingId={cloudBindingId} labels={monitoringLabels} />
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
            <CloudServiceStreamPanels
              cloudBindingId={cloudBindingId}
              railwayMissing={railwayMissing}
              showStatusPanel
              visual="gcp"
              layout="wide"
            />
          ) : null}
        </div>

        {tab !== "stream" ? (
          <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-72 lg:flex-[3] xl:w-80">
            <InstanceActionsSidebar
              labels={sidebarLabels}
              canManage={canManage}
              busy={lifecycleBusy}
              lifecycle={cloudLifecycle}
              railwayMissing={railwayMissing}
              hasDeployment={!!latestDeploymentId}
              onDeploy={() => void runDeploy()}
              onRestart={() => void runRestart()}
              onStop={() => void runStop()}
              onDelete={() => void runDelete()}
            />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

/** Link estável para a página de detalhes (usar em testes ou copy). */
export function serverInstanceDetailHref(bindingId: string): string {
  return buildAccountPanelHref("servers", "srv-instance-detail", bindingId);
}
