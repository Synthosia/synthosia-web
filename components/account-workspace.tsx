"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ApiIcon, CloudIcon, IntegrationIcon, KeyIcon, ProjectIcon, TerminalIcon } from "@/components/auth-icons";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { type AccountSession } from "@/lib/account-session";
import { platformConfig } from "@/lib/platform-config";
import {
  connectCli as connectCliSession,
  connectIntegration as connectIntegrationSession,
  createApiKey as createApiKeySession,
  getAccountSession,
  linkProject as linkProjectSession,
  logoutAccount,
} from "@/lib/synthosia-api";

const integrationOptions = ["GitHub", "OAuth provider", "AI provider", "Webhook endpoint"];
const sidebarItems = [
  { label: "Overview", icon: CloudIcon },
  { label: "Projects", icon: ProjectIcon },
  { label: "API keys", icon: KeyIcon },
  { label: "Integrations", icon: IntegrationIcon },
  { label: "CLI", icon: TerminalIcon },
];

export function AccountWorkspace() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [projectName, setProjectName] = useState("");
  const [integrationName, setIntegrationName] = useState(integrationOptions[0]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      try {
        setSession(await getAccountSession());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load account.");
      } finally {
        setIsLoading(false);
      }
    };

    syncSession();
    window.addEventListener("synthosia-account-change", syncSession);

    return () => {
      window.removeEventListener("synthosia-account-change", syncSession);
    };
  }, []);

  const resources = useMemo(() => {
    if (!session) {
      return [];
    }

    return [
      { label: "Projects", value: session.projects.length, detail: "Linked repositories", icon: ProjectIcon },
      { label: "API keys", value: session.apiKeys.length, detail: "Scoped credentials", icon: KeyIcon },
      { label: "Integrations", value: session.integrations.length, detail: "Connected services", icon: IntegrationIcon },
      { label: "CLI contexts", value: session.cliConnections.length, detail: "Local or CI sessions", icon: TerminalIcon },
    ];
  }, [session]);

  async function runMutation(action: () => Promise<AccountSession>, successMessage: string) {
    setIsMutating(true);
    try {
      const nextSession = await action();
      setSession(nextSession);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cloud action failed.");
    } finally {
      setIsMutating(false);
    }
  }

  function linkProject() {
    const name = projectName.trim();

    if (!name) {
      return;
    }

    runMutation(() => linkProjectSession(name), "Project linked.");
    setProjectName("");
  }

  function createApiKey() {
    setIsMutating(true);
    createApiKeySession()
      .then((response) => {
        setSession(response.account);
        setMessage(`API key created. Copy now: ${response.secret}`);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to create API key."))
      .finally(() => setIsMutating(false));
  }

  function connectIntegration() {
    runMutation(() => connectIntegrationSession(integrationName), "Integration connected.");
  }

  function connectCli() {
    runMutation(() => connectCliSession(), "CLI context connected.");
  }

  if (isLoading) {
    return (
      <div className="grid min-h-dvh bg-[var(--surface-page)] lg:grid-cols-[280px_1fr]">
        <CloudSidebar />
        <main className="flex min-w-0 flex-col">
          <CloudTopBar />
          <section className="grid flex-1 place-items-center p-5 sm:p-8">
            <div className="surface-panel w-full max-w-2xl rounded-[28px] p-6 text-center font-serif text-secondary sm:p-10">
              Loading Synthosia Cloud session...
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="grid min-h-dvh bg-[var(--surface-page)] lg:grid-cols-[280px_1fr]">
        <CloudSidebar />
        <main className="flex min-w-0 flex-col">
          <CloudTopBar />
          <section className="grid flex-1 place-items-center p-5 sm:p-8">
            <div className="surface-panel w-full max-w-5xl rounded-[28px] p-6 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
                <div>
                  <p className="font-display text-xs uppercase brand-accent">Synthosia Cloud Console</p>
                  <h1 className="mt-4 max-w-3xl text-balance font-display text-[2.8rem] leading-[1.02] text-primary sm:text-[4rem]">
                    Sign in to open your cloud control plane.
                  </h1>
                  <p className="mt-5 max-w-2xl text-pretty font-serif text-[1.08rem] leading-[1.55] text-secondary">
                    The account console manages projects, API keys, integrations, and CLI contexts under one developer identity.
                  </p>
                  {message ? <p className="mt-4 font-serif text-sm text-secondary">{message}</p> : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/auth/login" className="btn-primary focus-themed rounded-lg px-4 py-2.5 font-display text-sm">
                      Sign in
                    </Link>
                    <Link href="/auth/register" className="btn-secondary focus-themed rounded-lg px-4 py-2.5 font-display text-sm">
                      Create account
                    </Link>
                  </div>
                </div>
                <div className="surface-raised rounded-2xl p-5">
                  {sidebarItems.slice(1).map((item) => (
                    <div key={item.label} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
                      <span className="surface-panel grid size-9 place-items-center rounded-lg brand-accent">
                        <item.icon className="size-4" />
                      </span>
                      <span className="font-display text-sm text-primary">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh bg-[var(--surface-page)] lg:grid-cols-[280px_1fr]">
      <CloudSidebar />
      <main className="min-w-0">
        <CloudTopBar
          session={session}
          onSignOut={() => {
            logoutAccount().finally(() => setSession(null));
          }}
        />

        <div className="p-4 sm:p-6 lg:p-8">
          <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_360px]">
            <motion.article
              className="surface-panel rounded-[24px] p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <p className="font-display text-xs uppercase brand-accent">Cloud overview</p>
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-balance font-display text-[2.4rem] leading-[1.05] text-primary">
                    Welcome, {session.name}
                  </h1>
                  <p className="mt-2 font-serif text-[1rem] text-secondary">{session.email}</p>
                </div>
                <span className="surface-raised rounded-full px-3 py-1 font-mono text-xs text-secondary">
                  provider: {session.authProvider ?? "email"} · role: {session.role ?? "viewer"}
                </span>
              </div>
              {message ? <p className="mt-4 font-serif text-sm text-secondary">{message}</p> : null}
            </motion.article>

            <article className="surface-panel rounded-[24px] p-6">
              <p className="font-display text-xs uppercase brand-accent">Quick command</p>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#050509] p-4 font-mono text-xs leading-[1.6] text-secondary">
                <code>{`${platformConfig.cli.command} project status\n${platformConfig.cli.command} keys list`}</code>
              </pre>
            </article>
          </section>

          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resources.map((resource, index) => (
              <motion.article
                key={resource.label}
                className="surface-panel rounded-2xl p-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: index * 0.03, ease: "easeOut" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="surface-raised grid size-10 place-items-center rounded-xl brand-accent">
                    <resource.icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted">active</span>
                </div>
                <p className="mt-4 font-display text-sm text-secondary">{resource.label}</p>
                <p className="mt-2 font-display text-[2rem] tabular-nums text-primary">{resource.value}</p>
                <p className="mt-1 text-pretty font-serif text-sm text-secondary">{resource.detail}</p>
              </motion.article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 lg:grid-cols-2">
              <CloudPanel icon={ProjectIcon} title="Projects" eyebrow="Resource manager">
                <div className="mt-4 flex gap-2">
                  <input
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    className="focus-themed min-w-0 flex-1 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none placeholder:text-muted"
                    placeholder="project-slug"
                  />
                  <button type="button" disabled={isMutating} onClick={linkProject} className="btn-primary focus-themed cursor-pointer rounded-lg px-3 py-2 font-display text-sm">
                    {isMutating ? "Syncing" : "Link"}
                  </button>
                </div>
                <ResourceList items={session.projects} emptyLabel="No project connected." />
              </CloudPanel>

              <CloudPanel icon={KeyIcon} title="API keys" eyebrow="Access control">
                <button type="button" disabled={isMutating} onClick={createApiKey} className="btn-primary focus-themed mt-4 cursor-pointer rounded-lg px-3 py-2 font-display text-sm">
                  {isMutating ? "Creating" : "Create key"}
                </button>
                <ResourceList items={session.apiKeys} emptyLabel="No key created." monospace />
              </CloudPanel>

              <CloudPanel icon={IntegrationIcon} title="Integrations" eyebrow="Connections">
                <div className="mt-4 flex gap-2">
                  <select
                    value={integrationName}
                    onChange={(event) => setIntegrationName(event.target.value)}
                    className="focus-themed min-w-0 flex-1 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none"
                  >
                    {integrationOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <button type="button" disabled={isMutating} onClick={connectIntegration} className="btn-primary focus-themed cursor-pointer rounded-lg px-3 py-2 font-display text-sm">
                    {isMutating ? "Syncing" : "Connect"}
                  </button>
                </div>
                <ResourceList items={session.integrations} emptyLabel="No integration connected." />
              </CloudPanel>

              <CloudPanel icon={TerminalIcon} title="CLI connections" eyebrow="Developer tools">
                <p className="mt-3 font-serif text-sm text-secondary">
                  Register this browser as the local context for `{platformConfig.cli.command}`.
                </p>
                <button type="button" disabled={isMutating} onClick={connectCli} className="btn-primary focus-themed mt-4 cursor-pointer rounded-lg px-3 py-2 font-display text-sm">
                  {isMutating ? "Syncing" : "Connect CLI"}
                </button>
                <ResourceList items={session.cliConnections} emptyLabel="No CLI connected." monospace />
              </CloudPanel>
            </div>

            <aside className="surface-panel rounded-[24px] p-5">
              <p className="font-display text-xs uppercase brand-accent">Activity</p>
              <div className="mt-4 space-y-3">
                {[
                  "Console initialized",
                  "HTTP session active",
                  "Resource state synced from synthosia-api",
                  "CLI ready for registration",
                ].map((item) => (
                  <div key={item} className="surface-raised flex items-center gap-3 rounded-xl p-3">
                    <span className="grid size-7 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <ApiIcon className="size-3.5" />
                    </span>
                    <p className="font-display text-sm text-secondary">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}

function CloudSidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-[var(--surface-panel)] p-4 lg:block">
      <Link href="/" className="flex items-center gap-2 rounded-xl px-2 py-3 font-display text-base text-primary">
        <BrandLogo />
        <span>Synthosia Cloud</span>
      </Link>
      <nav className="mt-6 space-y-1" aria-label="Cloud console navigation">
        {sidebarItems.map((item, index) => (
          <a
            key={item.label}
            href={index === 0 ? "#overview" : `#${item.label.toLowerCase().replaceAll(" ", "-")}`}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm transition-colors duration-150 ${
              index === 0 ? "btn-primary" : "text-secondary hover:bg-black/5 hover:text-primary"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function CloudTopBar({
  session,
  onSignOut,
}: {
  session?: AccountSession;
  onSignOut?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--header-bg)] px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm text-primary">Synthosia Cloud Console</p>
          <p className="truncate font-mono text-xs text-muted">{session?.email ?? "No session"}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {session && onSignOut ? (
            <button type="button" onClick={onSignOut} className="btn-secondary focus-themed cursor-pointer rounded-lg px-3 py-2 font-display text-sm">
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function CloudPanel({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: typeof CloudIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="surface-panel rounded-[20px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase brand-accent">{eyebrow}</p>
          <h2 className="mt-2 font-display text-[1.25rem] text-primary">{title}</h2>
        </div>
        <span className="surface-raised grid size-10 place-items-center rounded-xl brand-accent">
          <Icon className="size-5" />
        </span>
      </div>
      {children}
    </article>
  );
}

function ResourceList({
  items,
  emptyLabel,
  monospace = false,
}: {
  items: string[];
  emptyLabel: string;
  monospace?: boolean;
}) {
  if (items.length === 0) {
    return <p className="mt-4 font-serif text-[1rem] text-white/50">{emptyLabel}</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-lg border border-white/10 bg-[#050509] px-3 py-2 text-sm text-white/72 ${
            monospace ? "font-mono" : "font-display"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
