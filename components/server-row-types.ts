import type { ComputeInstance, ServerInstance } from "@/lib/synthosia-api";

export type CloudLifecycle =
  | "pending_deploy"
  | "running"
  | "provisioning"
  /** Instância em `reconfiguring` no compute plane (PATCH / agente a aplicar alterações). */
  | "reconfiguring"
  | "removing"
  | "error"
  | "sleeping"
  | "stopped"
  /** Estado devolvido pela API mas não previsto no contrato UI — não usar como pending deploy */
  | "unknown";

/** Estado de instância no compute plane (VPS / jobs). Alinhado à ADR `docs/adr/001-compute-plane-state-contract.md`. */
export function mapComputeLifecycleFromStatus(status: string | null | undefined): CloudLifecycle {
  const u = (status ?? "").toLowerCase();
  if (u === "running") return "running";
  /** Pedido de provisionamento na API — UI: fila / à espera do agente */
  if (u === "provisioning_requested") return "pending_deploy";
  /** Provisionamento em curso no agente */
  if (u === "provisioning") return "provisioning";
  if (u === "reconfiguring") return "reconfiguring";
  if (u === "pending") return "provisioning";
  if (u === "destroying") return "removing";
  /** Resposta pontual do DELETE (instância já removida na API). */
  if (u === "deleted") return "removing";
  if (u === "error") return "error";
  if (u === "stopped") return "stopped";
  if (u === "sleeping") return "sleeping";
  if (u === "") return "pending_deploy";
  return "unknown";
}

export function mapComputeInstanceToRow(r: ComputeInstance): ServerRow {
  const cloudLifecycle = mapComputeLifecycleFromStatus(r.status);
  const healthy = r.status === "running";
  /** Mini barras na lista usam métricas reais via API; aqui não geramos valores fictícios a partir do id. */
  const cpu = 0;
  const ram = 0;
  const disk = 0;
  return {
    id: `compute:${r.id}`,
    name: r.name,
    env: "production",
    region: "VPS",
    ip: r.publicHostname?.trim() || r.slug?.trim() || r.nerdctlContainerName?.trim() || r.id.slice(0, 8),
    specs: r.slug ? `${r.dockerImage} · ${r.slug}` : r.dockerImage,
    healthy,
    cpu,
    ram,
    disk,
    cloudLifecycle,
    managedCompute: r,
  };
}

export type ServerRow = {
  id: string;
  name: string;
  env: "production" | "staging";
  region: string;
  ip: string;
  specs: string;
  healthy: boolean;
  cpu: number;
  ram: number;
  disk: number;
  cloudLifecycle?: CloudLifecycle;
  managedCompute?: ComputeInstance;
  sshInstance?: ServerInstance;
  /** Métricas ao vivo (dashboard) — só instâncias compute. */
  liveCpuPercent?: number | null;
  liveMemoryPercent?: number | null;
  liveHttpProbeSummary?: string;
  liveContainerMemUsage?: string;
  liveMetricRecordedAt?: string;
};

export function cloudStatusBadgeClass(lc: CloudLifecycle | undefined): string {
  if (!lc) return "bg-emerald-50 text-emerald-800 ring-emerald-100";
  if (lc === "running") return "bg-emerald-50 text-emerald-800 ring-emerald-100";
  if (lc === "pending_deploy") return "bg-amber-50 text-amber-900 ring-amber-100";
  if (lc === "provisioning" || lc === "reconfiguring") return "bg-sky-50 text-sky-900 ring-sky-100";
  if (lc === "removing") return "bg-orange-50 text-orange-900 ring-orange-100";
  if (lc === "error") return "bg-red-50 text-red-800 ring-red-100";
  if (lc === "stopped") return "bg-gray-100 text-gray-800 ring-gray-200";
  if (lc === "unknown") return "bg-violet-50 text-violet-900 ring-violet-100";
  return "bg-gray-50 text-gray-800 ring-gray-100";
}

// cloudStatusBadgeClass Backup
// export function cloudStatusBadgeClass(lc: CloudLifecycle | undefined): string {
//   if (!lc) return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";
//   if (lc === "running") return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";
//   if (lc === "pending_deploy") return "bg-amber-50 text-amber-900 ring-1 ring-amber-100";
//   if (lc === "provisioning" || lc === "reconfiguring") return "bg-sky-50 text-sky-900 ring-1 ring-sky-100";
//   if (lc === "removing") return "bg-orange-50 text-orange-900 ring-1 ring-orange-100";
//   if (lc === "error") return "bg-red-50 text-red-800 ring-1 ring-red-100";
//   if (lc === "stopped") return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
//   if (lc === "unknown") return "bg-violet-50 text-violet-900 ring-1 ring-violet-100";
//   return "bg-gray-50 text-gray-800 ring-1 ring-gray-100";
// }

export function cloudStatusDotClass(lc: CloudLifecycle | undefined): string {
  if (!lc) return "bg-emerald-500";
  if (lc === "running") return "bg-emerald-500";
  if (lc === "pending_deploy") return "bg-amber-500";
  if (lc === "provisioning" || lc === "reconfiguring") return "bg-sky-500";
  if (lc === "removing") return "bg-orange-500";
  if (lc === "error") return "bg-red-500";
  if (lc === "stopped") return "bg-gray-400";
  if (lc === "unknown") return "bg-violet-500";
  return "bg-gray-400";
}

export function cloudStatusLabel(row: ServerRow, sm: Record<string, string>): string {
  if (row.managedCompute?.status === "error") return sm.cloudStateError ?? "Error";
  if (row.cloudLifecycle === "pending_deploy") return sm.cloudStatePendingDeploy ?? "Pending deploy";
  if (row.cloudLifecycle === "running") return sm.cloudStateRunning ?? "Running";
  if (row.cloudLifecycle === "provisioning") return sm.cloudStateProvisioning ?? "Provisioning";
  if (row.cloudLifecycle === "reconfiguring") return sm.cloudStateReconfiguring ?? "Applying configuration";
  if (row.cloudLifecycle === "removing") return sm.cloudStateRemoving ?? "Remoção em curso";
  if (row.cloudLifecycle === "error") return sm.cloudStateError ?? "Error";
  if (row.cloudLifecycle === "sleeping") return sm.cloudStateSleeping ?? "Sleeping";
  if (row.cloudLifecycle === "stopped") return sm.cloudStateStopped ?? "Stopped";
  if (row.cloudLifecycle === "unknown") return sm.cloudStateUnknown ?? "Estado desconhecido";
  return row.healthy ? (sm.healthy ?? "OK") : (sm.unhealthy ?? "Issue");
}
