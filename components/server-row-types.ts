import type { CloudManagedService, ServerInstance } from "@/lib/synthosia-api";

export type CloudLifecycle =
  | "pending_deploy"
  | "running"
  | "provisioning"
  | "error"
  | "sleeping"
  | "stopped";

/** Deriva o ciclo de vida a partir do estado de deploy devolvido pela API (Railway / DTO). */
export function mapCloudLifecycleFromStatus(status: string | null | undefined): CloudLifecycle {
  if (!status?.trim()) return "pending_deploy";
  const u = status.toUpperCase();
  if (u === "SUCCESS") return "running";
  if (u === "FAILED" || u === "CRASHED") return "error";
  if (u === "SLEEPING") return "sleeping";
  if (u === "STOPPED" || u === "REMOVED" || u === "CANCELED" || u === "CANCELLED") return "stopped";
  if (u === "BUILDING" || u === "DEPLOYING" || u === "QUEUED" || u === "WAITING" || u === "SKIPPED") {
    return "provisioning";
  }
  return "provisioning";
}

export function mapCloudManagedToRow(r: CloudManagedService): ServerRow {
  const cloudLifecycle = r.railwayMissing
    ? "error"
    : mapCloudLifecycleFromStatus(r.deploymentStatus);
  const healthy =
    !r.railwayMissing &&
    cloudLifecycle !== "error" &&
    cloudLifecycle !== "stopped" &&
    cloudLifecycle !== "sleeping";
  return {
    id: `cloud:${r.id}`,
    name: r.name,
    env: "production",
    region: r.region?.trim() || "Synthosia Cloud",
    ip: r.cloudServiceId,
    specs: r.dockerImage?.trim() || "Synthosia Cloud",
    healthy,
    cpu: 0,
    ram: 0,
    disk: 0,
    cloudLifecycle,
    managedCloud: r,
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
  /** Só serviços cloud: estado derivado do último deploy na API. */
  cloudLifecycle?: CloudLifecycle;
  managedCloud?: CloudManagedService;
  sshInstance?: ServerInstance;
};

export function cloudStatusBadgeClass(lc: CloudLifecycle | undefined): string {
  if (!lc) return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";
  if (lc === "running") return "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100";
  if (lc === "pending_deploy") return "bg-amber-50 text-amber-900 ring-1 ring-amber-100";
  if (lc === "provisioning") return "bg-sky-50 text-sky-900 ring-1 ring-sky-100";
  if (lc === "error") return "bg-red-50 text-red-800 ring-1 ring-red-100";
  if (lc === "stopped") return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
  return "bg-gray-50 text-gray-800 ring-1 ring-gray-100";
}

export function cloudStatusDotClass(lc: CloudLifecycle | undefined): string {
  if (!lc) return "bg-emerald-500";
  if (lc === "running") return "bg-emerald-500";
  if (lc === "pending_deploy") return "bg-amber-500";
  if (lc === "provisioning") return "bg-sky-500";
  if (lc === "error") return "bg-red-500";
  if (lc === "stopped") return "bg-gray-400";
  return "bg-gray-400";
}

export function cloudStatusLabel(row: ServerRow, sm: Record<string, string>): string {
  if (row.managedCloud?.railwayMissing) return sm.cloudStateOrphan ?? "Ausente na cloud";
  if (row.cloudLifecycle === "pending_deploy") return sm.cloudStatePendingDeploy ?? "Pending deploy";
  if (row.cloudLifecycle === "running") return sm.cloudStateRunning ?? "Running";
  if (row.cloudLifecycle === "provisioning") return sm.cloudStateProvisioning ?? "Provisioning";
  if (row.cloudLifecycle === "error") return sm.cloudStateError ?? "Error";
  if (row.cloudLifecycle === "sleeping") return sm.cloudStateSleeping ?? "Sleeping";
  if (row.cloudLifecycle === "stopped") return sm.cloudStateStopped ?? "Stopped";
  return row.healthy ? (sm.healthy ?? "OK") : (sm.unhealthy ?? "Issue");
}
