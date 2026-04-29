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

const CLOUD_SERVICES_BASE = "/v1/infrastructure/cloud-services";

/** Serviço gerido pela Synthosia Cloud (organização). */
export type CloudManagedService = {
  id: string;
  cloudServiceId: string;
  name: string;
  dockerImage?: string | null;
  region?: string | null;
  limits: unknown;
  deploymentStatus?: string | null;
  latestDeploymentId?: string | null;
  /** ISO-8601: última sincronização do worker com a Railway. */
  railwaySyncedAt?: string | null;
  /** O recurso deixou de existir no fornecedor cloud (ex.: apagado no painel). */
  railwayMissing?: boolean;
};

export type CloudServiceLogLine = {
  message: string;
  timestamp?: string | null;
};

export type CloudServiceLogs = {
  lines: CloudServiceLogLine[];
};

export async function listCloudManagedServices(): Promise<CloudManagedService[]> {
  return apiFetch<CloudManagedService[]>(CLOUD_SERVICES_BASE, { method: "GET" }, { retryAuth: true });
}

export async function createCloudManagedService(payload: {
  name: string;
  dockerImage?: string;
  sourceRepo?: string;
  branch?: string;
}): Promise<CloudManagedService> {
  return apiFetch<CloudManagedService>(
    CLOUD_SERVICES_BASE,
    {
      method: "POST",
      headers: csrfHeaders(),
      body: JSON.stringify({
        name: payload.name,
        dockerImage: payload.dockerImage,
        sourceRepo: payload.sourceRepo,
        branch: payload.branch,
      }),
    },
    { retryAuth: true },
  );
}

export async function deleteCloudManagedService(bindingId: string): Promise<void> {
  await apiFetch(`${CLOUD_SERVICES_BASE}/${bindingId}`, { method: "DELETE", headers: csrfHeaders() }, {
    retryAuth: true,
  });
}

/** Remove apenas o registo na Synthosia (não apaga infra no fornecedor). */
export async function forgetCloudManagedServiceBinding(bindingId: string): Promise<void> {
  await apiFetch(`${CLOUD_SERVICES_BASE}/${bindingId}/forget`, { method: "POST", headers: csrfHeaders() }, {
    retryAuth: true,
  });
}

export async function recreateCloudManagedService(bindingId: string): Promise<CloudManagedService> {
  return apiFetch<CloudManagedService>(
    `${CLOUD_SERVICES_BASE}/${bindingId}/recreate`,
    { method: "POST", headers: csrfHeaders() },
    { retryAuth: true },
  );
}

export async function patchCloudServiceSettings(
  bindingId: string,
  payload: {
    displayName?: string;
    memoryGb?: number;
    vcpus?: number;
    dockerImage?: string;
  },
): Promise<void> {
  await apiFetch(
    `${CLOUD_SERVICES_BASE}/${bindingId}/settings`,
    {
      method: "PATCH",
      headers: csrfHeaders(),
      body: JSON.stringify({
        displayName: payload.displayName,
        memoryGb: payload.memoryGb,
        vcpus: payload.vcpus,
        dockerImage: payload.dockerImage,
      }),
    },
    { retryAuth: true },
  );
}

/** URL absoluta do stream SSE (session cookie; usar com `EventSource` e `withCredentials: true`). */
export function cloudManagedServiceStreamUrl(bindingId: string): string {
  return `${API_URL}${CLOUD_SERVICES_BASE}/${bindingId}/stream`;
}

export async function updateCloudServiceLimits(
  bindingId: string,
  payload: { memoryGb?: number; vcpus?: number },
): Promise<void> {
  await apiFetch(
    `${CLOUD_SERVICES_BASE}/${bindingId}/limits`,
    {
      method: "PATCH",
      headers: csrfHeaders(),
      body: JSON.stringify({ memoryGb: payload.memoryGb, vcpus: payload.vcpus }),
    },
    { retryAuth: true },
  );
}

export async function updateCloudServiceImage(bindingId: string, dockerImage: string): Promise<void> {
  await apiFetch(
    `${CLOUD_SERVICES_BASE}/${bindingId}/image`,
    {
      method: "PATCH",
      headers: csrfHeaders(),
      body: JSON.stringify({ dockerImage }),
    },
    { retryAuth: true },
  );
}

export type CloudMetricSeries = {
  measurement: string;
  points: { ts: number; value: number }[];
};

export type CloudMetricsResponse = {
  series: CloudMetricSeries[];
  windowHours: number;
};

export async function getCloudServiceMetrics(
  bindingId: string,
  hours?: number,
): Promise<CloudMetricsResponse> {
  const q = hours != null ? `?hours=${encodeURIComponent(String(hours))}` : "";
  return apiFetch<CloudMetricsResponse>(`${CLOUD_SERVICES_BASE}/${bindingId}/metrics${q}`, { method: "GET" }, {
    retryAuth: true,
  });
}

export async function deployCloudService(bindingId: string): Promise<void> {
  await apiFetch(`${CLOUD_SERVICES_BASE}/${bindingId}/deploy`, { method: "POST", headers: csrfHeaders() }, {
    retryAuth: true,
  });
}

export async function restartCloudService(bindingId: string): Promise<void> {
  await apiFetch(`${CLOUD_SERVICES_BASE}/${bindingId}/restart`, { method: "POST", headers: csrfHeaders() }, {
    retryAuth: true,
  });
}

export async function stopCloudService(bindingId: string): Promise<void> {
  await apiFetch(`${CLOUD_SERVICES_BASE}/${bindingId}/stop`, { method: "POST", headers: csrfHeaders() }, {
    retryAuth: true,
  });
}

export async function getCloudServiceLogs(
  bindingId: string,
  kind: "build" | "runtime",
  limit?: number,
): Promise<CloudServiceLogs> {
  const params = new URLSearchParams();
  params.set("kind", kind);
  if (limit != null) params.set("limit", String(limit));
  return apiFetch<CloudServiceLogs>(
    `${CLOUD_SERVICES_BASE}/${bindingId}/logs?${params.toString()}`,
    { method: "GET" },
    { retryAuth: true },
  );
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
