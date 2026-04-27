"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ApiIcon, IntegrationIcon, KeyIcon, ProjectIcon, TerminalIcon } from "@/components/auth-icons";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { type AccountSession } from "@/lib/account-session";
import { platformConfig } from "@/lib/platform-config";
import {
  type CloudflareRedirect,
  type GithubRepository,
  type ServerInstance,
  type WorkspaceMember,
  connectCli as connectCliSession,
  connectIntegration as connectIntegrationSession,
  API_KEY_SCOPE_OPTIONS,
  createApiKey as createApiKeySession,
  createCloudflareRedirect,
  createServerInstance,
  enqueueGitOperation,
  getAccountSession,
  linkProject as linkProjectSession,
  listCloudflareRedirects,
  listGithubRepositories,
  listServerInstances,
  listWorkspaceMembers,
  logoutAccount,
} from "@/lib/synthosia-api";

const integrationOptions = ["GitHub", "OAuth provider", "AI provider", "Webhook endpoint"];

type SectionId =
  | "overview"
  | "workspace"
  | "projects"
  | "repositories"
  | "instances"
  | "edge"
  | "apikeys"
  | "integrations"
  | "activity";

const NAV_GROUPS: { title: string; items: { id: SectionId; label: string; hint: string }[] }[] = [
  {
    title: "Console",
    items: [
      { id: "overview", label: "Visão geral", hint: "KPIs e contexto" },
      { id: "workspace", label: "Workspace & equipe", hint: "Membros e papéis" },
    ],
  },
  {
    title: "Entrega",
    items: [
      { id: "projects", label: "Projetos", hint: "Slugs e escopo" },
      { id: "repositories", label: "Repositórios GitHub", hint: "Leitura via API" },
      { id: "instances", label: "Instâncias", hint: "Hosts registrados" },
    ],
  },
  {
    title: "Edge",
    items: [{ id: "edge", label: "Cloudflare & DNS", hint: "Redirecionamentos" }],
  },
  {
    title: "Acesso",
    items: [
      { id: "apikeys", label: "API keys & IAM", hint: "Credenciais" },
      { id: "integrations", label: "Integrações & CLI", hint: "Conectores" },
      { id: "activity", label: "Atividade", hint: "Linha do tempo" },
    ],
  },
];

function parseSection(hash: string): SectionId {
  const id = hash.replace(/^#/, "") as SectionId;
  const flat = NAV_GROUPS.flatMap((g) => g.items).map((i) => i.id);
  return flat.includes(id) ? id : "overview";
}

export function AccountWorkspace() {
  const [session, setSession] = useState<AccountSession | null>(null);
  const [section, setSection] = useState<SectionId>("overview");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [instances, setInstances] = useState<ServerInstance[]>([]);
  const [redirects, setRedirects] = useState<CloudflareRedirect[]>([]);
  const [repos, setRepos] = useState<GithubRepository[]>([]);

  const [projectName, setProjectName] = useState("");
  const [integrationName, setIntegrationName] = useState(integrationOptions[0]);
  const [instName, setInstName] = useState("");
  const [instHost, setInstHost] = useState("");
  const [instPort, setInstPort] = useState("22");
  const [instEnv, setInstEnv] = useState("production");
  const [edgeHost, setEdgeHost] = useState("");
  const [edgeTarget, setEdgeTarget] = useState("https://");
  const [gitUrl, setGitUrl] = useState("https://github.com/org/repo.git");
  const [gitOp, setGitOp] = useState<"clone" | "push" | "sync">("clone");

  useEffect(() => {
    const syncSession = async () => {
      try {
        setSession(await getAccountSession());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível carregar a sessão.");
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

  useEffect(() => {
    const applyHash = () => setSection(parseSection(window.location.hash));
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const go = useCallback((id: SectionId) => {
    window.location.hash = id;
  }, []);

  useEffect(() => {
    if (!session) return;

    const run = async () => {
      try {
        if (section === "workspace") {
          setMembers(await listWorkspaceMembers());
        }
        if (section === "instances") {
          setInstances(await listServerInstances());
        }
        if (section === "edge") {
          setRedirects(await listCloudflareRedirects());
        }
        if (section === "repositories") {
          setRepos(await listGithubRepositories());
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Falha ao carregar dados da seção.");
      }
    };

    void run();
  }, [session, section]);

  const breadcrumbs = useMemo(() => {
    const flat = NAV_GROUPS.flatMap((g) => g.items);
    const current = flat.find((i) => i.id === section);
    return ["Synthosia Cloud", "Console", current?.label ?? "Visão geral"];
  }, [section]);

  async function runMutation(action: () => Promise<unknown>, successMessage: string) {
    setIsMutating(true);
    try {
      await action();
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ação falhou.");
    } finally {
      setIsMutating(false);
    }
  }

  function linkProject() {
    const name = projectName.trim();
    if (!name) return;
    runMutation(async () => {
      const next = await linkProjectSession(name);
      setSession(next);
      setProjectName("");
    }, "Projeto vinculado.");
  }

  function createApiKeyFromPayload(payload: { name: string; scopes: string[] }) {
    setIsMutating(true);
    createApiKeySession({ name: payload.name, scopes: payload.scopes })
      .then((response) => {
        setSession(response.account);
        setMessage(`Chave criada. Copie agora: ${response.secret}`);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Não foi possível criar a chave."))
      .finally(() => setIsMutating(false));
  }

  function connectIntegration() {
    runMutation(async () => {
      const next = await connectIntegrationSession(integrationName);
      setSession(next);
    }, "Integração conectada.");
  }

  function connectCli() {
    runMutation(async () => {
      const next = await connectCliSession();
      setSession(next);
    }, "CLI registrado.");
  }

  function registerInstance() {
    const name = instName.trim();
    const host = instHost.trim();
    if (!name || !host) {
      setMessage("Nome e host são obrigatórios.");
      return;
    }
    const port = Number.parseInt(instPort, 10);
    runMutation(async () => {
      await createServerInstance({
        name,
        host,
        port: Number.isFinite(port) ? port : 22,
        environment: instEnv.trim() || "production",
      });
      setInstances(await listServerInstances());
      setInstName("");
      setInstHost("");
    }, "Instância registrada.");
  }

  function registerRedirect() {
    const sourceHost = edgeHost.trim();
    const targetUrl = edgeTarget.trim();
    if (!sourceHost || !targetUrl) {
      setMessage("Hostname e URL de destino são obrigatórios.");
      return;
    }
    runMutation(async () => {
      await createCloudflareRedirect({ sourceHost, targetUrl });
      setRedirects(await listCloudflareRedirects());
      setEdgeHost("");
      setEdgeTarget("https://");
    }, "Redirecionamento criado (verifique o token DNS).");
  }

  function submitGitJob() {
    const repositoryUrl = gitUrl.trim();
    if (!repositoryUrl) return;
    runMutation(() => enqueueGitOperation({ repositoryUrl, operation: gitOp }), "Operação Git enfileirada.");
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--surface-page)]">
        <ConsoleTopBar session={undefined} />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <ConsoleRail section={section} onNavigate={go} session={undefined} />
          <main className="flex min-w-0 flex-1 flex-col">
            <ConsoleSubheader breadcrumbs={["Synthosia Cloud", "Console"]} />
            <section className="grid flex-1 place-items-center p-6">
              <div className="surface-panel w-full max-w-xl rounded-lg p-8 text-center font-serif text-secondary shadow-sm">
                Carregando sessão do Synthosia Cloud…
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--surface-page)]">
        <ConsoleTopBar session={undefined} />
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <ConsoleRail section={section} onNavigate={go} session={undefined} />
          <main className="flex min-w-0 flex-1 flex-col">
            <ConsoleSubheader breadcrumbs={["Synthosia Cloud", "Console"]} />
            <section className="flex flex-1 flex-col justify-center p-6 sm:p-10">
              <div className="surface-panel mx-auto w-full max-w-4xl rounded-lg p-8 shadow-sm sm:p-12">
              <p className="font-display text-xs uppercase brand-accent">Synthosia Cloud Console</p>
              <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-primary sm:text-5xl">
                Entre para acessar o painel corporativo.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty font-serif text-base leading-relaxed text-secondary">
                O console separa workspace, entrega, edge e IAM — cada camada com controles próprios e auditoria
                consistente.
              </p>
              {message ? <p className="mt-4 font-serif text-sm text-secondary">{message}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/login" className="btn-primary focus-themed rounded-lg px-5 py-2.5 font-display text-sm">
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-secondary focus-themed rounded-lg px-5 py-2.5 font-display text-sm"
                >
                  Criar conta
                </Link>
              </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface-page)]">
      <ConsoleTopBar
        session={session}
        onSignOut={() => {
          logoutAccount().finally(() => setSession(null));
        }}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ConsoleRail section={section} onNavigate={go} session={session} />
        <main className="flex min-w-0 flex-1 flex-col">
          <ConsoleSubheader breadcrumbs={breadcrumbs} sessionName={session.name} />

        <div className="border-b border-[var(--border-subtle)] px-4 py-2 lg:hidden">
          <label className="sr-only" htmlFor="console-section">
            Seção do console
          </label>
          <select
            id="console-section"
            value={section}
            onChange={(e) => go(e.target.value as SectionId)}
            className="focus-themed console-search-input w-full px-3 py-2 font-display text-sm outline-none"
          >
            {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:p-6">
          <div className="min-w-0 flex-1 space-y-6">
            {message ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-serif text-sm text-secondary">
                {message}
              </div>
            ) : null}

            {section === "overview" ? (
              <OverviewSection session={session} isMutating={isMutating} />
            ) : null}
            {section === "workspace" ? <WorkspaceSection members={members} /> : null}
            {section === "projects" ? (
              <ProjectsSection
                session={session}
                projectName={projectName}
                setProjectName={setProjectName}
                onLink={linkProject}
                isMutating={isMutating}
              />
            ) : null}
            {section === "repositories" ? (
              <RepositoriesSection
                repos={repos}
                gitUrl={gitUrl}
                setGitUrl={setGitUrl}
                gitOp={gitOp}
                setGitOp={setGitOp}
                onGitSubmit={submitGitJob}
                isMutating={isMutating}
              />
            ) : null}
            {section === "instances" ? (
              <InstancesSection
                instances={instances}
                instName={instName}
                setInstName={setInstName}
                instHost={instHost}
                setInstHost={setInstHost}
                instPort={instPort}
                setInstPort={setInstPort}
                instEnv={instEnv}
                setInstEnv={setInstEnv}
                onRegister={registerInstance}
                isMutating={isMutating}
              />
            ) : null}
            {section === "edge" ? (
              <EdgeSection
                redirects={redirects}
                edgeHost={edgeHost}
                setEdgeHost={setEdgeHost}
                edgeTarget={edgeTarget}
                setEdgeTarget={setEdgeTarget}
                onCreate={registerRedirect}
                isMutating={isMutating}
              />
            ) : null}
            {section === "apikeys" ? (
              <ApiKeysSection onCreate={createApiKeyFromPayload} isMutating={isMutating} />
            ) : null}
            {section === "integrations" ? (
              <IntegrationsSection
                session={session}
                integrationName={integrationName}
                setIntegrationName={setIntegrationName}
                onConnectIntegration={connectIntegration}
                onConnectCli={connectCli}
                isMutating={isMutating}
              />
            ) : null}
            {section === "activity" ? <ActivitySection /> : null}
          </div>

          <aside className="w-full shrink-0 space-y-4 border-t border-[var(--border-subtle)] pt-6 lg:w-72 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <ContextCard session={session} section={section} />
            <div className="surface-panel rounded-lg p-5 shadow-sm">
              <p className="font-display text-xs uppercase brand-accent">Comandos</p>
              <pre className="console-search-input mt-3 overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-secondary">
                <code>{`${platformConfig.cli.command} project status\n${platformConfig.cli.command} keys list`}</code>
              </pre>
            </div>
          </aside>
        </div>
        </main>
      </div>
    </div>
  );
}

function ConsoleTopBar({
  session,
  onSignOut,
}: {
  session?: AccountSession;
  onSignOut?: () => void;
}) {
  return (
    <header className="console-topbar sticky top-0 z-50 shrink-0">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded px-1 py-0.5 font-display text-sm font-semibold text-primary"
        >
          <BrandLogo />
          <span className="hidden sm:inline">Synthosia</span>
        </Link>
        <span className="hidden h-6 w-px shrink-0 bg-[var(--border-subtle)] sm:block" aria-hidden />
        <div className="hidden min-w-0 flex-1 md:block md:max-w-xl">
          <div className="relative">
            <span
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-muted"
              aria-hidden
            >
              ⌕
            </span>
            <input
              type="search"
              readOnly
              placeholder="Pesquisar recursos, APIs e documentação…"
              className="console-search-input h-9 w-full pl-8 pr-3 font-serif text-sm placeholder:text-muted"
              aria-label="Pesquisa do console (em breve)"
            />
          </div>
        </div>
        <div className="ms-auto flex min-w-0 items-center gap-2 sm:gap-3">
        {session ? (
          <div
            className="console-workspace-pill hidden min-w-0 max-w-[12rem] items-center truncate px-3 py-1.5 font-mono text-[11px] text-secondary sm:flex"
            title={session.email}
          >
            <span className="truncate">{session.email}</span>
          </div>
        ) : null}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {session && onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="btn-secondary focus-themed rounded-md px-2.5 py-1.5 font-display text-xs sm:px-3 sm:text-sm"
            >
              Sair
            </button>
          ) : null}
        </div>
        </div>
      </div>
    </header>
  );
}

function ConsoleSubheader({ breadcrumbs, sessionName }: { breadcrumbs: string[]; sessionName?: string }) {
  return (
    <div className="console-subheader px-4 py-2 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb}-${i}`}>
              {i > 0 ? <span className="px-1.5 text-muted">/</span> : null}
              <span className={i === breadcrumbs.length - 1 ? "text-primary" : "text-secondary"}>{crumb}</span>
            </span>
          ))}
        </p>
        {sessionName ? (
          <span className="font-display text-xs text-secondary">
            Conectado como <span className="text-primary">{sessionName}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ConsoleRail({
  section,
  onNavigate,
  session,
}: {
  section: SectionId;
  onNavigate: (id: SectionId) => void;
  session?: AccountSession;
}) {
  return (
    <aside className="console-rail hidden w-[260px] shrink-0 flex-col lg:flex">
      <div className="border-b border-[var(--console-rail-border)] px-3 py-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Navegação</p>
        <p className="mt-1 font-display text-sm font-semibold text-primary">Cloud Console</p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-6 pt-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">{group.title}</p>
            <nav className="space-y-0.5" aria-label={group.title}>
              {group.items.map((item) => {
                const active = item.id === section;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full flex-col rounded-md border border-transparent py-2 pl-3 pr-2 text-left transition-colors duration-150 ${
                      active
                        ? "console-rail-link-active text-primary"
                        : "text-secondary hover:bg-[color-mix(in_oklab,var(--surface-interactive)_50%,var(--console-rail-bg))] hover:text-primary"
                    }`}
                  >
                    <span className="font-display text-sm">{item.label}</span>
                    <span className="font-serif text-[11px] text-muted">{item.hint}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      {session ? (
        <div className="border-t border-[var(--console-rail-border)] px-3 py-3 font-mono text-[10px] text-muted">
          <p className="truncate text-secondary">{session.email}</p>
          <p>papel: {session.role ?? "viewer"}</p>
        </div>
      ) : null}
    </aside>
  );
}

function OverviewSection({ session, isMutating }: { session: AccountSession; isMutating: boolean }) {
  const tiles = [
    { label: "Projetos", value: session.projects.length, icon: ProjectIcon, detail: "Slugs ativos" },
    { label: "Chaves API", value: session.apiKeys.length, icon: KeyIcon, detail: "Credenciais emitidas" },
    { label: "Integrações", value: session.integrations.length, icon: IntegrationIcon, detail: "Provedores" },
    { label: "CLI", value: session.cliConnections.length, icon: TerminalIcon, detail: "Sessões registradas" },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        className="surface-panel rounded-lg p-6 shadow-sm sm:p-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase brand-accent">Visão geral do workspace</p>
            <h1 className="mt-3 text-balance font-display text-3xl text-primary sm:text-4xl">Olá, {session.name}</h1>
            <p className="mt-2 font-serif text-sm text-secondary sm:text-base">{session.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-secondary">
              auth: {session.authProvider ?? "email"}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-secondary">
              role: {session.role ?? "viewer"}
            </span>
            {isMutating ? (
              <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-xs text-emerald-400">
                sincronizando…
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile, index) => (
            <motion.article
              key={tile.label}
              className="surface-raised rounded-lg p-4 shadow-sm"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
            >
              <div className="flex items-center justify-between gap-3">
                <tile.icon className="size-5 text-[var(--brand-accent,#f54e00)]" />
                <span className="font-mono text-[10px] uppercase text-muted">live</span>
              </div>
              <p className="mt-3 font-display text-xs uppercase text-secondary">{tile.label}</p>
              <p className="mt-2 font-display text-3xl tabular-nums text-primary">{tile.value}</p>
              <p className="mt-1 font-serif text-xs text-muted">{tile.detail}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <section className="surface-panel rounded-lg p-6 shadow-sm">
        <p className="font-display text-xs uppercase brand-accent">Permissões efetivas</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(session.permissions ?? []).map((perm) => (
            <span key={perm} className="rounded-md border border-white/10 px-2 py-1 font-mono text-[11px] text-secondary">
              {perm}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function WorkspaceSection({ members }: { members: WorkspaceMember[] }) {
  return (
    <section className="surface-panel rounded-lg shadow-sm p-6">
      <header className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs uppercase brand-accent">Workspace & equipe</p>
          <h2 className="mt-2 font-display text-2xl text-primary">Membros e papéis</h2>
          <p className="mt-1 font-serif text-sm text-secondary">
            Convites avançados chegam na próxima iteração — hoje você visualiza o time atual da organização padrão.
          </p>
        </div>
      </header>
      <DataTable
        columns={["E-mail", "Nome", "Papel"]}
        rows={members.map((m) => [m.email, m.name, m.role])}
        empty="Nenhum membro retornado (verifique a sessão ou migrações)."
      />
    </section>
  );
}

function ProjectsSection({
  session,
  projectName,
  setProjectName,
  onLink,
  isMutating,
}: {
  session: AccountSession;
  projectName: string;
  setProjectName: (v: string) => void;
  onLink: () => void;
  isMutating: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">Projetos</p>
        <h2 className="mt-2 font-display text-2xl text-primary">Controle de slugs e escopo</h2>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="focus-themed min-w-0 flex-1 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none placeholder:text-muted"
            placeholder="nome-do-projeto"
          />
          <button
            type="button"
            disabled={isMutating}
            onClick={onLink}
            className="btn-primary focus-themed rounded-lg px-4 py-2 font-display text-sm"
          >
            {isMutating ? "Sincronizando" : "Vincular projeto"}
          </button>
        </div>
      </div>
      <DataTable columns={["Projeto (slug)"]} rows={session.projects.map((p) => [p])} empty="Nenhum projeto vinculado." />
    </section>
  );
}

function RepositoriesSection({
  repos,
  gitUrl,
  setGitUrl,
  gitOp,
  setGitOp,
  onGitSubmit,
  isMutating,
}: {
  repos: GithubRepository[];
  gitUrl: string;
  setGitUrl: (v: string) => void;
  gitOp: "clone" | "push" | "sync";
  setGitOp: (v: "clone" | "push" | "sync") => void;
  onGitSubmit: () => void;
  isMutating: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-lg shadow-sm p-6">
        <header className="border-b border-white/10 pb-4">
          <p className="font-display text-xs uppercase brand-accent">Repositórios GitHub</p>
          <h2 className="mt-2 font-display text-2xl text-primary">Leitura via PAT de serviço</h2>
          <p className="mt-2 font-serif text-sm text-secondary">
            Configure <span className="font-mono text-xs">SYNTHOSIA_GITHUB_REPO_LIST_TOKEN</span> na API. Escopos mínimos:
            <span className="font-mono text-xs"> repo</span> (leitura) para a organização desejada.
          </p>
        </header>
        <DataTable
          columns={["Repositório", "Branch padrão", "Visibilidade", "URL"]}
          rows={repos.map((r) => [
            r.fullName,
            r.defaultBranch ?? "—",
            r.private ? "privado" : "público",
            r.htmlUrl,
          ])}
          empty="Nenhum repositório listado (token ausente ou sem permissão)."
          monoLastColumn
        />
      </section>
      <section className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">Operações Git</p>
        <h2 className="mt-2 font-display text-xl text-primary">Clone, push ou sync assíncronos</h2>
        <p className="mt-2 font-serif text-sm text-secondary">
          A API aceita a operação e registra um job. Em produção, workers com acesso ao repositório executam o git com credenciais
          isoladas.
        </p>
        <GitOperationsBar
          gitUrl={gitUrl}
          setGitUrl={setGitUrl}
          gitOp={gitOp}
          setGitOp={setGitOp}
          onSubmit={onGitSubmit}
          isMutating={isMutating}
        />
      </section>
    </div>
  );
}

function InstancesSection(props: {
  instances: ServerInstance[];
  instName: string;
  setInstName: (v: string) => void;
  instHost: string;
  setInstHost: (v: string) => void;
  instPort: string;
  setInstPort: (v: string) => void;
  instEnv: string;
  setInstEnv: (v: string) => void;
  onRegister: () => void;
  isMutating: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">Instâncias</p>
        <h2 className="mt-2 font-display text-2xl text-primary">Gerenciador de hosts</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={props.instName}
            onChange={(e) => props.setInstName(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="nome"
          />
          <input
            value={props.instHost}
            onChange={(e) => props.setInstHost(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="host/ip"
          />
          <input
            value={props.instPort}
            onChange={(e) => props.setInstPort(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="porta"
          />
          <input
            value={props.instEnv}
            onChange={(e) => props.setInstEnv(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="ambiente"
          />
        </div>
        <button
          type="button"
          disabled={props.isMutating}
          onClick={props.onRegister}
          className="btn-primary focus-themed mt-4 rounded-lg px-4 py-2 font-display text-sm"
        >
          Registrar instância
        </button>
      </div>
      <DataTable
        columns={["Nome", "Host", "Porta", "Ambiente"]}
        rows={props.instances.map((i) => [i.name, i.host, String(i.port), i.environment])}
        empty="Nenhuma instância cadastrada."
      />
    </section>
  );
}

function EdgeSection(props: {
  redirects: CloudflareRedirect[];
  edgeHost: string;
  setEdgeHost: (v: string) => void;
  edgeTarget: string;
  setEdgeTarget: (v: string) => void;
  onCreate: () => void;
  isMutating: boolean;
}) {
  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">Cloudflare</p>
        <h2 className="mt-2 font-display text-2xl text-primary">Redirecionamentos & verificação</h2>
        <p className="mt-2 font-serif text-sm text-secondary">
          Após criar, publique o registro DNS indicado com o token. Quando <span className="font-mono text-xs">CLOUDFLARE_API_TOKEN</span>{" "}
          estiver configurado, o estado avança para <span className="font-mono text-xs">configured</span>.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <input
            value={props.edgeHost}
            onChange={(e) => props.setEdgeHost(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="subdominio.seudominio.com"
          />
          <input
            value={props.edgeTarget}
            onChange={(e) => props.setEdgeTarget(e.target.value)}
            className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
            placeholder="https://destino"
          />
        </div>
        <button
          type="button"
          disabled={props.isMutating}
          onClick={props.onCreate}
          className="btn-primary focus-themed mt-4 rounded-lg px-4 py-2 font-display text-sm"
        >
          Criar redirecionamento
        </button>
      </div>
      <DataTable
        columns={["Host", "Destino", "Estado", "Token", "External ID"]}
        rows={props.redirects.map((r) => [
          r.sourceHost,
          r.targetUrl,
          r.status,
          r.verificationToken,
          r.externalId ?? "—",
        ])}
        empty="Nenhum redirecionamento cadastrado."
        monoLastColumn
      />
    </section>
  );
}

function ApiKeysSection({
  onCreate,
  isMutating,
}: {
  onCreate: (payload: { name: string; scopes: string[] }) => void;
  isMutating: boolean;
}) {
  const [keyName, setKeyName] = useState("");
  const [scopes, setScopes] = useState<string[]>(() => ["account:read", "projects:read"]);

  function toggleScope(id: string) {
    setScopes((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function submit() {
    if (scopes.length === 0) {
      return;
    }
    const name = keyName.trim() || "Chave API";
    onCreate({ name, scopes });
  }

  return (
    <section className="surface-panel rounded-lg shadow-sm p-6">
      <p className="font-display text-xs uppercase brand-accent">API keys & IAM</p>
      <h2 className="mt-2 font-display text-2xl text-primary">Credenciais com escopos declarados</h2>
      <p className="mt-2 max-w-3xl font-serif text-sm text-secondary">
        As chaves são exibidas apenas uma vez após a criação. Escolha apenas os escopos necessários (princípio do menor privilégio).
      </p>
      <div className="mt-6 max-w-xl space-y-2">
        <label className="block font-display text-xs uppercase text-muted" htmlFor="api-key-name">
          Nome (opcional)
        </label>
        <input
          id="api-key-name"
          type="text"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder="Ex.: CI produção"
          className="focus-themed w-full rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none"
        />
      </div>
      <fieldset className="mt-6 space-y-3">
        <legend className="font-display text-xs uppercase text-muted">Escopos</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {API_KEY_SCOPE_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-[11px] text-secondary"
            >
              <input
                type="checkbox"
                checked={scopes.includes(opt.id)}
                onChange={() => toggleScope(opt.id)}
                className="rounded border-white/20"
              />
              <span>
                <span className="text-primary">{opt.id}</span>
                <span className="ml-2 font-serif text-[11px] text-muted">{opt.label}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        disabled={isMutating || scopes.length === 0}
        onClick={submit}
        className="btn-primary focus-themed mt-6 rounded-lg px-4 py-2 font-display text-sm"
      >
        {isMutating ? "Emitindo" : "Nova chave"}
      </button>
    </section>
  );
}

function IntegrationsSection({
  session,
  integrationName,
  setIntegrationName,
  onConnectIntegration,
  onConnectCli,
  isMutating,
}: {
  session: AccountSession;
  integrationName: string;
  setIntegrationName: (v: string) => void;
  onConnectIntegration: () => void;
  onConnectCli: () => void;
  isMutating: boolean;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">Integrações</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={integrationName}
            onChange={(e) => setIntegrationName(e.target.value)}
            className="focus-themed flex-1 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none"
          >
            {integrationOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={isMutating}
            onClick={onConnectIntegration}
            className="btn-primary focus-themed rounded-lg px-4 py-2 font-display text-sm"
          >
            Conectar
          </button>
        </div>
        <DataTable columns={["Integração"]} rows={session.integrations.map((i) => [i])} empty="Sem integrações." />
      </div>
      <div className="surface-panel rounded-lg shadow-sm p-6">
        <p className="font-display text-xs uppercase brand-accent">CLI</p>
        <p className="mt-2 font-serif text-sm text-secondary">
          Registre o contexto local para <span className="font-mono text-xs">{platformConfig.cli.command}</span>.
        </p>
        <button
          type="button"
          disabled={isMutating}
          onClick={onConnectCli}
          className="btn-primary focus-themed mt-4 rounded-lg px-4 py-2 font-display text-sm"
        >
          Registrar CLI
        </button>
        <DataTable columns={["Label"]} rows={session.cliConnections.map((c) => [c])} empty="Nenhuma sessão CLI." />
      </div>
    </section>
  );
}

function GitOperationsBar({
  gitUrl,
  setGitUrl,
  gitOp,
  setGitOp,
  onSubmit,
  isMutating,
}: {
  gitUrl: string;
  setGitUrl: (v: string) => void;
  gitOp: "clone" | "push" | "sync";
  setGitOp: (v: "clone" | "push" | "sync") => void;
  onSubmit: () => void;
  isMutating: boolean;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
      <input
        value={gitUrl}
        onChange={(e) => setGitUrl(e.target.value)}
        className="focus-themed flex-1 rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-mono text-sm text-primary outline-none"
        placeholder="https://github.com/org/repo.git"
      />
      <select
        value={gitOp}
        onChange={(e) => setGitOp(e.target.value as "clone" | "push" | "sync")}
        className="focus-themed rounded-lg border border-white/10 bg-[#050509] px-3 py-2 font-display text-sm text-primary outline-none"
      >
        <option value="clone">clone</option>
        <option value="push">push</option>
        <option value="sync">sync</option>
      </select>
      <button
        type="button"
        disabled={isMutating}
        onClick={onSubmit}
        className="btn-primary focus-themed rounded-lg px-4 py-2 font-display text-sm"
      >
        Enfileirar
      </button>
    </div>
  );
}

function ActivitySection() {
  const items = [
    "Console inicializado com segregação de camadas",
    "Sessão HTTP autenticada com cookies HttpOnly",
    "RBAC sincronizado com synthosia-api",
    "Pronto para workers de Git e Cloudflare",
  ];
  return (
    <section className="surface-panel rounded-lg shadow-sm p-6">
      <p className="font-display text-xs uppercase brand-accent">Atividade recente</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="surface-raised flex items-center gap-3 rounded-xl p-3">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-500/10 text-emerald-400">
              <ApiIcon className="size-4" />
            </span>
            <p className="font-serif text-sm text-secondary">{item}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContextCard({ session, section }: { session: AccountSession; section: SectionId }) {
  const hints: Record<SectionId, string> = {
    overview: "Use esta camada para validar escopo, papéis e métricas agregadas.",
    workspace: "Equipe e convites ficam isolados de recursos de entrega.",
    projects: "Projetos são a unidade de custo e permissão para repositórios.",
    repositories: "A listagem usa token de serviço — nunca armazene PAT no browser.",
    instances: "Hosts aparecem aqui antes de agents validarem SSH e health checks.",
    edge: "Cloudflare exige token com zona correta para promover o estado.",
    apikeys: "Emita chaves com escopo mínimo e rotacione com janela controlada.",
    integrations: "Conectores e CLI compartilham identidade, não segredos em duplicidade.",
    activity: "Auditoria completa chegará com export para SIEM.",
  };

  return (
    <div className="surface-panel rounded-2xl p-5">
      <p className="font-display text-xs uppercase brand-accent">Contexto</p>
      <p className="mt-3 font-serif text-sm leading-relaxed text-secondary">{hints[section]}</p>
      <div className="mt-4 border-t border-white/10 pt-4 font-mono text-[11px] text-muted">
        <p>sessão: {session.email}</p>
        <p>seção: {section}</p>
      </div>
    </div>
  );
}

function DataTable({
  columns,
  rows,
  empty,
  monoLastColumn,
}: {
  columns: string[];
  rows: string[][];
  empty: string;
  monoLastColumn?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="mt-4 font-serif text-sm text-muted">{empty}</p>;
  }

  return (
    <div className="console-data-table-wrap mt-4">
      <table className="console-data-table w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="font-mono text-[11px] uppercase text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-normal">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-t border-[var(--border-subtle)]">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-4 py-3 ${monoLastColumn && cIdx === row.length - 1 ? "font-mono text-xs text-secondary" : "font-serif text-secondary"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
