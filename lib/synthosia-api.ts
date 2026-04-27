import { type AccountSession, notifyAccountSessionChanged } from "@/lib/account-session";
import { platformConfig } from "@/lib/platform-config";

type ApiKeyCreateResponse = {
  secret: string;
  account: AccountSession;
};

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

export async function createApiKey(): Promise<ApiKeyCreateResponse> {
  const response = await apiFetch<ApiKeyCreateResponse>(
    "/v1/api-keys",
    {
      method: "POST",
      headers: csrfHeaders(),
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
    throw new ApiClientError(response.status, await errorMessage(response));
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

async function errorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
