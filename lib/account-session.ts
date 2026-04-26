import { platformConfig } from "@/lib/platform-config";

export type AccountSession = {
  name: string;
  email: string;
  authProvider?: "email" | "google" | "github";
  projects: string[];
  apiKeys: string[];
  integrations: string[];
  cliConnections: string[];
};

export const emptyAccountSession = (
  name: string,
  email: string,
  authProvider: AccountSession["authProvider"] = "email",
): AccountSession => ({
  name,
  email,
  authProvider,
  projects: [],
  apiKeys: [],
  integrations: [],
  cliConnections: [],
});

export function readAccountSession(): AccountSession | null {
  const rawSession = window.localStorage.getItem(platformConfig.storageKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AccountSession;
  } catch {
    window.localStorage.removeItem(platformConfig.storageKey);
    return null;
  }
}

export function writeAccountSession(session: AccountSession) {
  window.localStorage.setItem(platformConfig.storageKey, JSON.stringify(session));
  window.dispatchEvent(new Event("synthosia-account-change"));
}

export function clearAccountSession() {
  window.localStorage.removeItem(platformConfig.storageKey);
  window.dispatchEvent(new Event("synthosia-account-change"));
}
