import { type AccountSession, notifyAccountSessionChanged } from "@/lib/account-session";
import { platformConfig } from "@/lib/platform-config";

type ApiKeyCreateResponse = {
  secret: string;
  account: AccountSession;
};

/** Escopos aceitos pelo backend (`POST /v1/api-keys`) — manter alinhado com `ALLOWED_API_KEY_SCOPES` na API. */
export const API_KEY_SCOPE_OPTIONS = [
  { id: "account:read", label: "Conta — leitura" },
  { id: "projects:read", label: "Projetos — leitura" },
  { id: "projects:write", label: "Projetos — escrita" },
  { id: "integrations:read", label: "Integrações — leitura" },
  { id: "integrations:write", label: "Integrações — escrita" },
  { id: "infra:read", label: "Infra — leitura" },
  { id: "infra:write", label: "Infra — escrita" },
  { id: "edge:read", label: "Edge — leitura" },
  { id: "edge:write", label: "Edge — escrita" },
  { id: "git:write", label: "Git — enfileirar operações" },
] as const;

const API_URL = process.env.NEXT_PUBLIC_SYNTHOSIA_API_URL ?? "http://localhost:8080";

export function githubOAuthUrl(): string {
  return `${API_URL}/v1/auth/github/authorize`;
}

export async function startGithubOAuth(): Promise<void> {
  const response = await fetch(githubOAuthUrl(), { credentials: "include" });
  if (!response.ok) {
    throw new Error("GitHub OAuth not available.");
  }
  const payload = (await response.json()) as { authorizeUrl?: string };
  if (!payload.authorizeUrl) {
    throw new Error("Missing GitHub OAuth authorize URL.");
  }
  window.location.assign(payload.authorizeUrl);
}

export async function exchangeGithubOAuth(payload: { code: string; state: string }): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>("/v1/auth/github/exchange", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  notifyAccountSessionChanged();
  return session;
}

export async function getAccountSession(): Promise<AccountSession | null> {
  try {
    return await apiFetch<AccountSession>("/v1/me", { method: "GET" }, { retryAuth: true });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export type ConsoleAlert = {
  id: string;
  title: string;
  message: string;
  severity: string;
};

export type ConsoleDashboard = {
  alerts: ConsoleAlert[];
  metrics: {
    cpuPercentSeries: number[];
    memoryPercentSeries: number[];
    networkMbpsSeries: number[];
    activeWorkers: number;
  };
  notificationCount: number;
  windowLabel: string;
  generatedAt: number;
};

export async function getConsoleDashboard(): Promise<ConsoleDashboard> {
  return apiFetch<ConsoleDashboard>("/v1/console/dashboard", { method: "GET" }, { retryAuth: true });
}

export async function registerAccount(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  notifyAccountSessionChanged();
  return session;
}

export async function loginAccount(payload: { email: string; password: string }): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  notifyAccountSessionChanged();
  return session;
}

export async function logoutAccount() {
  await apiFetch("/v1/auth/logout", {
    method: "POST",
    headers: csrfHeaders(),
  });
  notifyAccountSessionChanged();
}

export async function linkProject(name: string): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>(
    "/v1/projects",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({ name }),
    },
    { retryAuth: true },
  );
  notifyAccountSessionChanged();
  return session;
}

export async function createApiKey(payload?: {
  name?: string;
  scopes?: string[];
}): Promise<ApiKeyCreateResponse> {
  const body = JSON.stringify({
    name: payload?.name,
    scopes: payload?.scopes?.length
      ? payload.scopes
      : ["account:read", "projects:read"],
  });
  const response = await apiFetch<ApiKeyCreateResponse>(
    "/v1/api-keys",
    {
      method: "POST",
      headers: { ...csrfHeaders(), "Content-Type": "application/json" },
      body,
    },
    { retryAuth: true },
  );
  notifyAccountSessionChanged();
  return response;
}

export async function connectIntegration(name: string): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>(
    "/v1/integrations",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({ name }),
    },
    { retryAuth: true },
  );
  notifyAccountSessionChanged();
  return session;
}

export async function connectCli(): Promise<AccountSession> {
  const session = await apiFetch<AccountSession>(
    "/v1/cli-connections",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({ name: `${platformConfig.cli.command}@local` }),
    },
    { retryAuth: true },
  );
  notifyAccountSessionChanged();
  return session;
}

export type WorkspaceMember = {
  email: string;
  name: string;
  role: string;
};

export async function listWorkspaceMembers(): Promise<WorkspaceMember[]> {
  return apiFetch<WorkspaceMember[]>("/v1/workspace/members", { method: "GET" }, { retryAuth: true });
}

export type ServerInstance = {
  id: string;
  name: string;
  host: string;
  port: number;
  environment: string;
};

export async function listServerInstances(): Promise<ServerInstance[]> {
  return apiFetch<ServerInstance[]>("/v1/infrastructure/server-instances", { method: "GET" }, { retryAuth: true });
}

const COMPUTE_INSTANCES_BASE = "/v1/infrastructure/instances";
const MANAGED_SERVER_INSTANCES_BASE = "/v1/infrastructure/managed-server-instances";

/**
 * URL absoluta do SSE da consola cloud (snapshot + logs) para uma instância compute.
 * O `bindingId` na UI corresponde ao `id` de `ComputeInstance`.
 */
export function cloudManagedServiceStreamUrl(computeInstanceId: string): string {
  return `${API_URL}${COMPUTE_INSTANCES_BASE}/${encodeURIComponent(computeInstanceId)}/stream`;
}

/** SSE durante o job de provision (linhas `log` + `done`). */
export function jobProvisioningEventsUrl(jobId: string): string {
  return `${API_URL}/v1/infrastructure/jobs/${encodeURIComponent(jobId)}/events`;
}

/** Estados canónicos em `compute_instances.status` (CHECK na API + ADR 001). */
export const COMPUTE_INSTANCE_STATUSES = [
  "pending",
  "provisioning_requested",
  "provisioning",
  "running",
  "destroying",
  "error",
] as const;

export type ComputeInstanceStatus = (typeof COMPUTE_INSTANCE_STATUSES)[number];

/** Após normalização na fronteira HTTP: só valores do CHECK da API ou `unknown` explícito (drift visível). */
export type ComputeInstanceStatusNormalized = ComputeInstanceStatus | "deleted" | "unknown";

/** Estados em `compute_jobs.status` quando expostos em payloads de jobs. */
export const COMPUTE_JOB_STATUSES = ["pending", "processing", "succeeded", "failed"] as const;

export type ComputeJobStatus = (typeof COMPUTE_JOB_STATUSES)[number];

export type ComputeJobStatusNormalized = ComputeJobStatus | "unknown";

export function normalizeComputeInstanceStatus(raw: string | null | undefined): ComputeInstanceStatusNormalized {
  const u = (raw ?? "").trim();
  if (!u) return "unknown";
  if (u === "deleted") return "deleted";
  if ((COMPUTE_INSTANCE_STATUSES as readonly string[]).includes(u)) {
    return u as ComputeInstanceStatus;
  }
  return "unknown";
}

export function normalizeComputeJobStatus(raw: string | null | undefined): ComputeJobStatusNormalized {
  const u = (raw ?? "").trim();
  if (!u) return "unknown";
  if ((COMPUTE_JOB_STATUSES as readonly string[]).includes(u)) {
    return u as ComputeJobStatus;
  }
  return "unknown";
}

type ComputeInstanceWire = Omit<ComputeInstance, "status"> & { status: string };

function normalizeComputeInstanceBody(row: ComputeInstanceWire): ComputeInstance {
  return { ...row, status: normalizeComputeInstanceStatus(row.status) };
}

/** Instância de workload no compute plane (VPS + agente + jobs). */
export type ComputeInstance = {
  id: string;
  name: string;
  dockerImage: string;
  memoryMb: number;
  cpuMillicores: number;
  traefikHosts: string[];
  status: ComputeInstanceStatusNormalized;
  nerdctlContainerName?: string | null;
  agentId?: string | null;
  slug?: string | null;
  publicHostname?: string | null;
  hostBindPort?: number | null;
  internalContainerPort?: number;
  cloudflareDnsRecordId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ComputeInstanceCreated = {
  instance: ComputeInstance;
  jobId: string;
};

export type ComputeDestroyAccepted = {
  /** Ausente ou `null` quando a API removeu a instância de imediato (sem job `destroy_instance`). */
  jobId?: string | null;
  instanceId: string;
  /** Resposta da API (instância em destruição); normalizado quando possível. */
  status: ComputeInstanceStatusNormalized;
};

export async function listComputeInstances(): Promise<ComputeInstance[]> {
  const rows = await apiFetch<ComputeInstanceWire[]>(COMPUTE_INSTANCES_BASE, { method: "GET" }, { retryAuth: true });
  return rows.map(normalizeComputeInstanceBody);
}

export async function createComputeInstance(payload: {
  name: string;
  dockerImage: string;
  memoryMb?: number;
  cpuMillicores?: number;
  traefikHosts?: string[];
}): Promise<ComputeInstanceCreated> {
  const raw = await apiFetch<{ instance: ComputeInstanceWire; jobId: string }>(
    COMPUTE_INSTANCES_BASE,
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify(payload),
    },
    { retryAuth: true },
  );
  return { jobId: raw.jobId, instance: normalizeComputeInstanceBody(raw.instance) };
}

export async function deleteComputeInstance(instanceId: string): Promise<ComputeDestroyAccepted> {
  const raw = await apiFetch<{ jobId?: string | null; instanceId: string; status: string }>(
    `${COMPUTE_INSTANCES_BASE}/${instanceId}`,
    { method: "DELETE", headers: csrfHeaders() },
    { retryAuth: true },
  );
  return {
    ...raw,
    status: normalizeComputeInstanceStatus(raw.status),
  };
}

/** Séries por minuto (CPU %, memória %, rede Mbps) persistidas a partir do agente. */
export type ComputeInstanceMetricSeries = {
  series: { measurement: string; points: { ts: number; value: number }[] }[];
  windowHours: number;
};

export async function getComputeInstanceMetricsSeries(
  instanceId: string,
  minutes: number,
): Promise<ComputeInstanceMetricSeries> {
  const m = Math.min(1440, Math.max(1, Math.round(minutes)));
  const q = new URLSearchParams({ minutes: String(m) });
  return apiFetch<ComputeInstanceMetricSeries>(
    `${COMPUTE_INSTANCES_BASE}/${encodeURIComponent(instanceId)}/metrics-series?${q}`,
    { method: "GET" },
    { retryAuth: true },
  );
}

/** Último bloco `audit` das métricas persistidas (pares TCP remotos, etc.). */
export type ComputeInstanceAuditLatest = {
  recordedAt: string | null;
  audit: Record<string, unknown>;
};

export async function getComputeInstanceAuditLatest(instanceId: string): Promise<ComputeInstanceAuditLatest> {
  return apiFetch<ComputeInstanceAuditLatest>(
    `${COMPUTE_INSTANCES_BASE}/${encodeURIComponent(instanceId)}/audit-latest`,
    { method: "GET" },
    { retryAuth: true },
  );
}

/** VPS gerida: slug + `{slug}.{SYNTHOSIA_COMPUTE_PUBLIC_DOMAIN}` + DNS A (Cloudflare) + job para o agente. */
export async function createManagedServerInstance(payload: {
  label: string;
  image: string;
  internalPort?: number;
  memoryMb?: number;
  cpuMillicores?: number;
}): Promise<ComputeInstanceCreated> {
  const raw = await apiFetch<{ instance: ComputeInstanceWire; jobId: string }>(
    MANAGED_SERVER_INSTANCES_BASE,
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify(payload),
    },
    { retryAuth: true },
  );
  return { jobId: raw.jobId, instance: normalizeComputeInstanceBody(raw.instance) };
}

export async function createServerInstance(payload: {
  name: string;
  host: string;
  port?: number;
  environment?: string;
}): Promise<ServerInstance> {
  return apiFetch<ServerInstance>(
    "/v1/infrastructure/server-instances",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify(payload),
    },
    { retryAuth: true },
  );
}

export type CloudflareRedirect = {
  id: string;
  sourceHost: string;
  targetUrl: string;
  status: string;
  verificationToken: string;
  externalId?: string;
};

export async function listCloudflareRedirects(): Promise<CloudflareRedirect[]> {
  return apiFetch<CloudflareRedirect[]>("/v1/infrastructure/cloudflare/redirects", { method: "GET" }, { retryAuth: true });
}

export async function createCloudflareRedirect(payload: {
  sourceHost: string;
  targetUrl: string;
}): Promise<CloudflareRedirect> {
  return apiFetch<CloudflareRedirect>(
    "/v1/infrastructure/cloudflare/redirects",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({ sourceHost: payload.sourceHost, targetUrl: payload.targetUrl }),
    },
    { retryAuth: true },
  );
}

export type GithubRepository = {
  fullName: string;
  private: boolean;
  defaultBranch?: string;
  htmlUrl: string;
};

export async function listGithubRepositories(): Promise<GithubRepository[]> {
  return apiFetch<GithubRepository[]>("/v1/infrastructure/github/repositories", { method: "GET" }, { retryAuth: true });
}

export type GitOperationAccepted = {
  id: string;
  status: string;
  message: string;
};

export async function enqueueGitOperation(payload: {
  repositoryUrl: string;
  operation: "clone" | "push" | "sync";
}): Promise<GitOperationAccepted> {
  return apiFetch<GitOperationAccepted>(
    "/v1/infrastructure/git/operations",
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({ repositoryUrl: payload.repositoryUrl, operation: payload.operation }),
    },
    { retryAuth: true },
  );
}

async function refreshSession(): Promise<boolean> {
  try {
    await apiFetch<AccountSession>("/v1/auth/refresh", { method: "POST" }, { retryAuth: false });
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: { retryAuth?: boolean } = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 401 && options.retryAuth) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, init, { retryAuth: false });
    }
  }

  if (!response.ok) {
    const err = await parseApiError(response);
    throw new ApiClientError(err.status, err.message, err.reason);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function csrfHeaders(): HeadersInit {
  const token = cookieValue("synthosia_csrf");
  return token ? { "X-CSRF-Token": token } : {};
}

function cookieValue(name: string): string | null {
  return (
    document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

async function parseApiError(response: Response): Promise<{
  status: number;
  message: string;
  reason?: string;
}> {
  try {
    const payload = (await response.json()) as { error?: { message?: string; reason?: string } };
    return {
      status: response.status,
      message: payload.error?.message ?? "Request failed.",
      reason: payload.error?.reason,
    };
  } catch {
    return { status: response.status, message: "Request failed." };
  }
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly reason?: string,
  ) {
    super(message);
  }
}
