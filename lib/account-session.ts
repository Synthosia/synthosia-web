export type AccountSession = {
  name: string;
  email: string;
  authProvider?: "email" | "google" | "github";
  projects: string[];
  apiKeys: string[];
  integrations: string[];
  cliConnections: string[];
  role?: "owner" | "admin" | "developer" | "viewer";
  permissions?: string[];
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

export function notifyAccountSessionChanged() {
  window.dispatchEvent(new Event("synthosia-account-change"));
}
