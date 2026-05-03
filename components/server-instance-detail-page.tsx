"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "motion/react";
import { CloudServiceConfigForm } from "@/components/cloud-service-config-form";
import { CloudServiceStreamPanels } from "@/components/cloud-service-stream-panels";
import { InstanceActionsSidebar } from "@/components/instance/InstanceActionsSidebar";
import { InstanceMetricsStrip } from "@/components/instance/InstanceMetricsStrip";
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
import { ApiClientError, deleteComputeInstance, listComputeInstances, type ComputeInstance } from "@/lib/synthosia-api";

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
      st !== "destroying"
    )
      return;
    const id = window.setInterval(() => void refresh({ silent: true }), 4000);
    return () => window.clearInterval(id);
  }, [service, refresh]);

  const serverRow: ServerRow | null = useMemo(
    () => (service ? mapComputeInstanceToRow(service) : null),
    [service],
  );

  const cloudLifecycle: CloudLifecycle = service ? mapComputeLifecycleFromStatus(service.status) : "unknown";

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
                      <dd className="break-all font-mono text-xs text-[var(--text-primary)]">{service.dockerImage}</dd>
                    </div>
                    <div className="grid gap-1 border-b border-[var(--border-subtle)] pb-3">
                      <dt className="text-xs font-medium text-[var(--text-muted)]">Estado</dt>
                      <dd className="text-[var(--text-primary)]">{service.status}</dd>
                    </div>
                    <div className="grid gap-1">
                      <dt className="text-xs font-medium text-[var(--text-muted)]">Traefik</dt>
                      <dd className="text-[var(--text-primary)]">
                        {service.traefikHosts?.length ? service.traefikHosts.join(", ") : "—"}
                      </dd>
                    </div>
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
                    {JSON.stringify(service, null, 2)}
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
              hasDeployment={service.status === "running"}
              hideLifecycleControls
              onDeploy={() => {}}
              onRestart={() => {}}
              onStop={() => {}}
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
