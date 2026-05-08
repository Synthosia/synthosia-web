"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BellIcon,
  KeyIcon,
  IntegrationIcon,
  MenuIcon,
  PanelDashboardIcon,
  PanelDatabaseIcon,
  PanelSettingsIcon,
  PanelSitesIcon,
  ProjectIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "@/components/auth-icons";
import { ExtensionManageCard, PanelBreadcrumbBar, PanelPlaceholder } from "@/components/account-panel-placeholders";
import { AccountShellSkeleton } from "@/components/account-shell-skeleton";
import { BrandLogo } from "@/components/brand-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ServerInstanceDetailPage } from "@/components/server-instance-detail-page";
import { ServerMonitoringDashboard } from "@/components/server-monitoring-dashboard";
import { DatabaseMonitoringDashboard } from "@/components/database-monitoring-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { type AccountSession } from "@/lib/account-session";
import { DEFAULT_PANEL_ITEM, findPanelNavItem, type PanelCategory } from "@/lib/account-panel";
import {
  buildAccountPanelHref,
  parseAccountPanelSearchParams,
  type InstanceDetailTab,
} from "@/lib/account-panel-url";
import {
  buildPanelBreadcrumb,
  resolvePanelNavSections,
  type PanelLocaleNav,
} from "@/lib/panel-resolve-nav";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import {
  type ConsoleAlert,
  type ConsoleDashboard,
  getAccountSession,
  getConsoleDashboard,
  logoutAccount,
} from "@/lib/synthosia-api";

type PanelMessages = ReturnType<typeof getDictionary>["panel"];

function fillTemplate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

export function AccountWorkspace({
  initialCategory = "dashboard",
  initialSection = DEFAULT_PANEL_ITEM.dashboard,
  initialCloudBindingId,
  initialInstanceDetailTab,
}: {
  initialCategory?: PanelCategory;
  initialSection?: string;
  initialCloudBindingId?: string;
  initialInstanceDetailTab?: InstanceDetailTab;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<AccountSession | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [consoleDashboard, setConsoleDashboard] = useState<ConsoleDashboard | null>(null);
  const [isHeaderRefreshing, setIsHeaderRefreshing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PanelCategory>(initialCategory);
  const [activeNav, setActiveNav] = useState(initialSection);
  const [cloudBindingId, setCloudBindingId] = useState<string | null>(() => initialCloudBindingId ?? null);
  const [instanceDetailTab, setInstanceDetailTab] = useState<InstanceDetailTab | undefined>(
    () => initialInstanceDetailTab,
  );

  const { dictionary } = useLanguage();
  const p = dictionary.panel;
  const sidebarActiveId = activeNav === "srv-instance-detail" ? "srv-instances" : activeNav;

  const replacePanelUrl = useCallback(
    (cat: PanelCategory, section: string, cloud?: string | null) => {
      router.replace(buildAccountPanelHref(cat, section, cloud ?? undefined), { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const cat = searchParams.get("cat");
    const section = searchParams.get("section");
    const cloud = searchParams.get("cloud");
    const view = searchParams.get("view");
    if (cat === null && section === null && cloud === null && view === null) {
      return;
    }
    const parsed = parseAccountPanelSearchParams({
      cat: cat ?? undefined,
      section: section ?? undefined,
      cloud: cloud ?? undefined,
      view: view ?? undefined,
    });
    setActiveCategory(parsed.category);
    setActiveNav(parsed.section);
    setCloudBindingId(parsed.cloudBindingId ?? null);
    setInstanceDetailTab(parsed.instanceDetailTab);
  }, [searchParams]);

  function selectCategory(cat: PanelCategory) {
    const next = DEFAULT_PANEL_ITEM[cat];
    setActiveCategory(cat);
    setActiveNav(next);
    replacePanelUrl(cat, next, null);
  }

  const loadConsoleDashboard = useCallback(async () => {
    try {
      setConsoleDashboard(await getConsoleDashboard());
    } catch {
      setConsoleDashboard(null);
    }
  }, []);

  useEffect(() => {
    const syncSession = async () => {
      try {
        setSession(await getAccountSession());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : p.login.sessionError);
      } finally {
        setIsLoading(false);
      }
    };

    syncSession();
    window.addEventListener("synthosia-account-change", syncSession);

    return () => {
      window.removeEventListener("synthosia-account-change", syncSession);
    };
  }, [p.login.sessionError]);

  useEffect(() => {
    if (!session) return;
    void loadConsoleDashboard();
  }, [session, loadConsoleDashboard]);

  async function refreshConsole() {
    setIsHeaderRefreshing(true);
    try {
      const next = await getAccountSession();
      setSession(next);
      await loadConsoleDashboard();
    } finally {
      setIsHeaderRefreshing(false);
    }
  }

  if (isLoading) {
    return <AccountShellSkeleton />;
  }

  if (!session) {
    return (
      <div className="account-panel-root flex min-h-dvh flex-col bg-[#F9FAFB]">
        <ConsoleTopBar session={undefined} variant="panel" searchPlaceholder={p.search.dashboard} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="surface-panel w-full max-w-lg rounded-xl p-8 shadow-sm sm:p-10">
            <p className="font-display text-xs uppercase brand-accent">{p.login.eyebrow}</p>
            <h1 className="mt-4 text-balance font-display text-3xl text-primary sm:text-4xl">{p.login.title}</h1>
            <p className="mt-4 font-serif text-secondary">{p.login.body}</p>
            {message ? <p className="mt-4 font-serif text-sm text-amber-200/90">{message}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/login" className="btn-primary focus-themed rounded-lg px-5 py-2.5 font-display text-sm">
                {p.login.signIn}
              </Link>
              <Link href="/auth/register" className="btn-secondary focus-themed rounded-lg px-5 py-2.5 font-display text-sm">
                {p.login.createAccount}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="account-panel-root flex h-[100dvh] flex-col overflow-hidden bg-[#F9FAFB]">
      <ConsoleTopBar
        session={session}
        variant="panel"
        searchPlaceholder={p.search[activeCategory]}
        notificationCount={consoleDashboard?.notificationCount ?? 0}
        onRefresh={refreshConsole}
        isRefreshing={isHeaderRefreshing}
        onOpenMobileSidebar={
          activeCategory === "dashboard" ? undefined : () => setMobileNavOpen(true)
        }
        onSignOut={() => {
          logoutAccount().finally(() => setSession(null));
        }}
      />

      <div className="relative flex min-h-0 flex-1 overflow-visible">
        {mobileNavOpen ? (
          <button
            type="button"
            aria-label={p.header.closeNav}
            className="fixed inset-0 z-[45] cursor-pointer bg-black/40 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <CategoryIconRail
          activeCategory={activeCategory}
          tooltips={p.railTooltip}
          ariaLabel={p.railAria}
          onSelectCategory={(cat) => {
            selectCategory(cat);
            setMobileNavOpen(false);
          }}
          className={cn(
            "relative z-[51] h-full min-h-0 w-14 shrink-0 flex-col border-r border-[var(--console-rail-border)] bg-[var(--console-rail-bg)] px-1 py-3",
            activeCategory === "dashboard" ? "flex" : "hidden lg:flex",
          )}
        />

        {activeCategory !== "dashboard" ? (
          <AccountSidebar
            panel={p}
            category={activeCategory}
            activeId={sidebarActiveId}
            onSelect={(id) => {
              setActiveNav(id);
              replacePanelUrl(activeCategory, id, id === "srv-instances" ? cloudBindingId : null);
              setMobileNavOpen(false);
            }}
            className={cn(
              "fixed left-0 top-14 z-[50] flex h-[calc(100dvh-3.5rem)] w-[min(17.5rem,88vw)] flex-col transition-transform duration-200 ease-out lg:relative lg:top-auto lg:z-0 lg:h-full lg:w-56 lg:max-w-none lg:translate-x-0",
              mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            )}
          />
        ) : null}

        <main className="h-full flex-1 overflow-y-auto bg-[#F9FAFB]">
          <PanelBreadcrumbBar
            parts={buildPanelBreadcrumb(activeCategory, activeNav, {
              breadcrumbRoot: p.breadcrumbRoot,
              categoryLabel: p.categoryLabel,
              items: p.items,
              genericPanel: p.genericPanel,
            })}
          />

          <div
            className={cn(
              "space-y-6 px-4 py-5 sm:px-6 sm:py-6",
              (activeCategory === "dashboard" || activeCategory === "databases") ? "w-full" : "mx-auto",
              activeCategory === "servers" &&
                (activeNav === "srv-instances" ||
                  activeNav === "srv-networking" ||
                  activeNav === "srv-instance-detail")
                ? "max-w-[1600px]"
                : (activeCategory !== "dashboard" && activeCategory !== "databases") ? "max-w-6xl" : "",
            )}
          >
            {message ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-serif text-sm text-secondary">
                {message}
              </div>
            ) : null}

            <motion.div
              key={`${activeCategory}-${activeNav}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <AccountPanelMain
                category={activeCategory}
                activeNav={activeNav}
                session={session}
                consoleDashboard={consoleDashboard}
                cloudBindingId={
                  activeCategory === "servers" &&
                  (activeNav === "srv-instances" || activeNav === "srv-instance-detail")
                    ? cloudBindingId
                    : null
                }
                instanceDetailTab={activeNav === "srv-instance-detail" ? instanceDetailTab : undefined}
                onNavigateCloud={(bindingId) => replacePanelUrl(activeCategory, activeNav, bindingId)}
                onBackToServerList={() => replacePanelUrl("servers", "srv-instances", cloudBindingId)}
                onOpenCloudDetail={(bindingId) =>
                  replacePanelUrl("servers", "srv-instance-detail", bindingId)
                }
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AccountPanelMain({
  category,
  activeNav,
  session,
  consoleDashboard,
  cloudBindingId,
  instanceDetailTab,
  onNavigateCloud,
  onBackToServerList,
  onOpenCloudDetail,
}: {
  category: PanelCategory;
  activeNav: string;
  session: AccountSession;
  consoleDashboard: ConsoleDashboard | null;
  cloudBindingId: string | null;
  instanceDetailTab?: InstanceDetailTab;
  onNavigateCloud: (bindingId: string | null) => void;
  onBackToServerList: () => void;
  onOpenCloudDetail: (bindingId: string) => void;
}) {
  const { dictionary } = useLanguage();
  const ph = dictionary.panel.placeholders;
  if (category === "dashboard" && activeNav === "dash-overview") {
    return (
      <LegacyDashboardMain
        session={session}
        dashboard={consoleDashboard}
        dashboardLabel={consoleDashboard?.windowLabel}
      />
    );
  }
  if (category === "servers" && activeNav === "srv-instances") {
    return (
      <ServerMonitoringDashboard
        session={session}
        dashboard={consoleDashboard}
        cloudBindingId={cloudBindingId}
        onNavigateCloud={onNavigateCloud}
        onOpenCloudDetail={onOpenCloudDetail}
      />
    );
  }
  if (category === "servers" && activeNav === "srv-instance-detail") {
    return cloudBindingId ? (
      <ServerInstanceDetailPage
        session={session}
        cloudBindingId={cloudBindingId}
        initialDetailTab={instanceDetailTab}
        onBack={onBackToServerList}
      />
    ) : (
      <PanelPlaceholder title={ph.serversNav.title} description={ph.serversNav.description} showAction={false} />
    );
  }
  if (category === "servers" && activeNav === "srv-networking") {
    const nr = dictionary.panel.placeholders.networkingRetired;
    return (
      <PanelPlaceholder title={nr.title} description={nr.description} showAction={false} />
    );
  }
  if (category === "databases") {
    return <DatabaseMonitoringDashboard session={session} dashboard={consoleDashboard} />;
  }
  if (category === "servers") {
    return (
      <PanelPlaceholder title={ph.serversNav.title} description={ph.serversNav.description} showAction={false} />
    );
  }
  if (category === "extensions") {
    const meta = findPanelNavItem("extensions", activeNav);
    const dictItems = dictionary.panel.items as Record<string, { title: string; hint?: string }>;
    const it = dictItems[activeNav];
    const item = {
      label: it?.title ?? meta?.label ?? ph.integrationFallback,
      hint: it?.hint ?? meta?.hint ?? "",
    };
    if (activeNav === "ext-ai") return <ExtensionManageCard slug="ai" item={item} />;
    if (activeNav === "ext-github") return <ExtensionManageCard slug="github" item={item} />;
    if (activeNav === "ext-store") return <ExtensionManageCard slug="store" item={item} />;
  }
  return <PanelPlaceholder title={ph.section.title} description={ph.section.description} />;
}

function userInitials(session: AccountSession): string {
  const n = session.name?.trim() || session.email || "?";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
  }
  return n.slice(0, 2).toUpperCase();
}

function resolveAvatarUrl(session: AccountSession): string | null {
  if (!session.avatarUrl) return null;
  
  // Se for uma URL válida (começa com http), retornar direto
  if (session.avatarUrl.startsWith("http")) {
    return session.avatarUrl;
  }
  
  // Se for um bucket S3 ou similar, tentar construir URL
  if (session.avatarUrl.includes("s3") || session.avatarUrl.includes("bucket")) {
    return `https://${session.avatarUrl}`;
  }
  
  // Se for GitHub ou Google, usar URL direto (já vem da API)
  if (session.authProvider === "github" || session.authProvider === "google") {
    return session.avatarUrl;
  }
  
  return null;
}

function userAvatarInitials(session: AccountSession): ReactElement {
  const initials = userInitials(session);
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

function userAvatar(session: AccountSession) {
  const avatarUrl = resolveAvatarUrl(session);
  
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={session.name ? `${session.name} avatar` : session.email ?? "User avatar"}
        className="h-8 w-8 rounded-full object-cover"
        onError={(e) => {
          // Se a imagem não carregar, mostrar iniciais
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = "";
            parent.appendChild(userAvatarInitials(session) as unknown as Node);
          }
        }}
      />
    );
  }
  
  return userAvatarInitials(session);
}

function UserMenuDropdown({
  session,
  onSignOut,
  panelChrome,
}: {
  session: AccountSession;
  onSignOut: () => void;
  panelChrome?: boolean;
}) {
  const { dictionary } = useLanguage();
  const um = dictionary.panel.userMenu;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(ev: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "focus-themed flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full font-display text-xs font-semibold transition",
          panelChrome
            ? "border border-gray-200 bg-gray-100 text-gray-800 hover:border-gray-300 hover:bg-gray-50"
            : "border border-[var(--border-subtle)] bg-[var(--surface-interactive)] text-primary hover:border-[var(--brand-accent,#f54e00)]/40",
        )}
      >
        {userAvatar(session)}
      </button>
      {open ? (
        <div
          className={cn(
            "absolute right-0 z-[60] mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border py-2 shadow-lg",
            panelChrome ? "border-gray-200 bg-white" : "border-[var(--border-subtle)] bg-[var(--surface-panel)]",
          )}
          role="menu"
        >
          <div className={cn("border-b px-3 pb-2 pt-1", panelChrome ? "border-gray-100" : "border-[var(--border-subtle)]")}>
            <p
              className={cn(
                "truncate font-display text-sm font-semibold",
                panelChrome ? "text-gray-900" : "text-primary",
              )}
            >
              {session.name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted">{session.email}</p>
            <p className="mt-1 font-mono text-[10px] text-secondary">
              {um.rolePrefix}: {session.role ?? "viewer"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
            <span className="sr-only">{um.preferencesSr}</span>
            <div className="flex scale-95 flex-wrap items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          <div className={cn("border-t px-2 pt-1", panelChrome ? "border-gray-100" : "border-[var(--border-subtle)]")}>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className={cn(
                "focus-themed w-full rounded-lg px-3 py-2 text-left font-display text-sm transition",
                panelChrome
                  ? "text-gray-600 hover:bg-gray-50"
                  : "text-secondary hover:bg-[color-mix(in_oklab,var(--surface-interactive)_40%,transparent)]",
              )}
            >
              {um.signOut}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConsoleTopBar({
  session,
  onSignOut,
  onRefresh,
  isRefreshing,
  notificationCount = 0,
  onOpenMobileSidebar,
  variant = "default",
  searchPlaceholder: searchPlaceholderProp,
}: {
  session?: AccountSession;
  onSignOut?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  notificationCount?: number;
  onOpenMobileSidebar?: () => void;
  variant?: "default" | "panel";
  searchPlaceholder?: string;
}) {
  const { dictionary } = useLanguage();
  const ph = dictionary.panel.header;
  const isPanel = variant === "panel";
  const searchPlaceholder = searchPlaceholderProp ?? dictionary.panel.search.dashboard;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 shrink-0 border-b",
        isPanel ? "border-gray-200 bg-white" : "console-topbar border-[var(--border-subtle)]",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        {session && onOpenMobileSidebar ? (
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className={cn(
              "focus-themed -ms-1 cursor-pointer rounded-lg p-2 lg:hidden",
              isPanel ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900" : "text-secondary",
            )}
            aria-label={ph.openNav}
          >
            <MenuIcon className="size-5" />
          </button>
        ) : null}
        <Link
          href="/"
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-2 rounded px-1 py-0.5 font-display text-sm font-semibold",
            isPanel ? "text-gray-900" : "text-primary",
          )}
        >
          <BrandLogo />
          <span className="hidden sm:inline">Synthosia</span>
        </Link>
        <span
          className={cn("hidden h-6 w-px shrink-0 sm:block", isPanel ? "bg-gray-200" : "bg-[var(--border-subtle)]")}
          aria-hidden
        />
        <div className="hidden min-w-0 flex-1 md:block md:max-w-xl">
          <div className="relative">
            <span
              className={cn(
                "pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs",
                isPanel ? "text-gray-400" : "font-mono text-muted",
              )}
              aria-hidden
            >
              ⌕
            </span>
            <input
              type="search"
              readOnly
              placeholder={searchPlaceholder}
              className={
                isPanel
                  ? "h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 font-sans text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/5"
                  : "console-search-input h-9 w-full pl-8 pr-3 font-serif text-sm placeholder:text-muted"
              }
              aria-label={ph.searchAria}
            />
          </div>
        </div>
        <div className="ms-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
          {session ? (
            <>
              <Link
                href="/docs"
                className={cn(
                  "focus-themed hidden cursor-pointer rounded-lg px-2 py-1.5 font-display text-xs sm:inline-block",
                  isPanel ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900" : "text-secondary hover:text-primary",
                )}
              >
                {ph.docs}
              </Link>
              <button
                type="button"
                className={cn(
                  "focus-themed relative cursor-pointer rounded-lg p-2 transition",
                  isPanel
                    ? "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    : "text-secondary hover:bg-[color-mix(in_oklab,var(--surface-interactive)_45%,transparent)] hover:text-primary",
                )}
                aria-label={ph.notifications}
                title={ph.notifications}
              >
                <BellIcon className="size-[1.125rem]" />
                {notificationCount > 0 ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-1 font-mono text-[9px] font-semibold text-white"
                    aria-hidden
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                ) : null}
              </button>
              {onRefresh ? (
                <button
                  type="button"
                  onClick={() => void onRefresh()}
                  disabled={isRefreshing}
                  className={cn(
                    "focus-themed cursor-pointer rounded-lg p-2 transition disabled:opacity-50",
                    isPanel
                      ? "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      : "text-secondary hover:bg-[color-mix(in_oklab,var(--surface-interactive)_45%,transparent)] hover:text-primary",
                  )}
                  aria-label={ph.refresh}
                  title={ph.refresh}
                >
                  <motion.span
                    animate={{ rotate: isRefreshing ? 360 : 0 }}
                    transition={{
                      duration: isRefreshing ? 0.85 : 0.25,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear",
                    }}
                  >
                    <RefreshCwIcon className="size-[1.125rem]" />
                  </motion.span>
                </button>
              ) : null}
              {onSignOut ? <UserMenuDropdown session={session} onSignOut={onSignOut} panelChrome={isPanel} /> : null}
            </>
          ) : null}
          {!session ? (
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function panelLocaleNav(panel: PanelMessages): PanelLocaleNav {
  return {
    sections: panel.sections,
    items: panel.items,
    systemSettings: panel.systemSettings,
    systemSection: panel.systemSection,
  };
}

function CategoryIconRail({
  activeCategory,
  onSelectCategory,
  className,
  tooltips,
  ariaLabel,
}: {
  activeCategory: PanelCategory;
  onSelectCategory: (category: PanelCategory) => void;
  className?: string;
  tooltips: Record<PanelCategory, string>;
  ariaLabel: string;
}) {
  const items: { id: PanelCategory; icon: typeof PanelDashboardIcon }[] = [
    { id: "dashboard", icon: PanelDashboardIcon },
    { id: "servers", icon: PanelSitesIcon },
    { id: "databases", icon: PanelDatabaseIcon },
    { id: "extensions", icon: IntegrationIcon },
  ];

  return (
    <nav className={cn("flex flex-col items-center gap-1.5", className)} aria-label={ariaLabel}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeCategory === item.id;
        return (
          <div key={item.id} className="group relative flex w-full justify-center">
            <motion.button
              type="button"
              onClick={() => onSelectCategory(item.id)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className={cn(
                "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-[var(--surface-panel)] text-[var(--text-primary)] shadow-sm ring-1 ring-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:bg-[color-mix(in_oklab,var(--surface-interactive)_45%,transparent)] hover:text-[var(--text-primary)]",
              )}
            >
              <Icon className="pointer-events-none size-[1.125rem] shrink-0 text-current" />
            </motion.button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full top-1/2 z-[70] ms-2.5 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--text-primary)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--surface-panel)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 lg:block dark:bg-gray-900 dark:text-white"
            >
              {tooltips[item.id]}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function AccountSidebar({
  panel,
  category,
  activeId,
  onSelect,
  className,
}: {
  panel: PanelMessages;
  category: PanelCategory;
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const nav = panelLocaleNav(panel);
  const sections = resolvePanelNavSections(category, nav);

  return (
    <aside
      className={cn(
        "flex min-h-0 w-full shrink-0 flex-col border-r bg-surface-panel shadow-sm",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={category}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <nav
              className="min-h-0 flex-1 overflow-hidden px-2 py-3"
              aria-label={panel.navAria}
            >
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id}>
                    <p className="px-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      {section.label}
                    </p>
                    <ul className="space-y-px">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = activeId === item.id && !item.disabled;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              disabled={item.disabled}
                              onClick={() => !item.disabled && onSelect(item.id)}
                              className={cn(
                                "flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 text-left transition-colors duration-150",
                                active
                                  ? "bg-[var(--surface-interactive)] font-semibold text-[var(--text-primary)]"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-interactive)] hover:text-[var(--text-primary)]",
                                item.disabled && "cursor-not-allowed opacity-50",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-interactive)] text-[var(--text-secondary)]",
                                  active && "bg-[var(--surface-panel)] text-[var(--text-primary)]",
                                )}
                              >
                                <Icon className="size-3.5 shrink-0" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1 text-xs font-medium leading-snug">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {category !== "servers" ? (
                  <div>
                    <p className="px-1.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {panel.systemSection}
                    </p>
                    <ul className="space-y-px">
                      <li>
                        <Link
                          href={panel.accountCard.settingsHref}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pl-1.5 pr-2 text-left text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--surface-interactive)] hover:text-[var(--text-primary)]"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-interactive)] text-[var(--text-secondary)]">
                            <PanelSettingsIcon className="size-3.5 shrink-0" aria-hidden />
                          </span>
                          <span className="text-xs font-medium leading-snug">{panel.systemSettings.title}</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </nav>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) {
    return (
      <div
        className={`h-8 w-full max-w-[96px] rounded border border-dashed border-[var(--border-subtle)] opacity-40 ${className ?? ""}`}
        aria-hidden
      />
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 96;
  const h = 32;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-8 w-full max-w-[96px] text-[var(--brand-accent,#f54e00)] ${className ?? ""}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function NeedsAttentionBanner({ alerts }: { alerts: ConsoleAlert[] }) {
  const { dictionary } = useLanguage();
  const t = dictionary.panel.dashboard;
  if (alerts.length === 0) return null;
  return (
    <motion.div
      className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 shadow-sm"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <p className="font-display text-xs uppercase tracking-wide text-amber-200/90">{t.needsAttention}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 font-serif text-sm text-secondary">
        {alerts.map((a) => (
          <li key={a.id}>
            <span className="font-display text-primary">{a.title}</span>
            <span className="text-muted"> — {a.message}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function LegacyDashboardMain({
  session,
  dashboard,
  dashboardLabel,
}: {
  session: AccountSession;
  dashboard: ConsoleDashboard | null;
  dashboardLabel?: string;
}) {
  const { dictionary } = useLanguage();
  const d = dictionary.panel.dashboard;

  // Overview metrics (12, 03, 68%, 545)
  const overviewMetrics = [
    { label: "Active Domains", value: "12", icon: ProjectIcon, color: "text-emerald-600" },
    { label: "Expiring Soon", value: "03", icon: BellIcon, color: "text-amber-600" },
    { label: "DNS Health", value: "68%", icon: KeyIcon, color: "text-blue-600" },
    { label: "Total Records", value: "545", icon: IntegrationIcon, color: "text-purple-600" },
  ];

  // Mock data for charts
  const analyticsData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 52 },
    { month: "Mar", value: 38 },
    { month: "Apr", value: 61 },
    { month: "May", value: 55 },
    { month: "Jun", value: 72 },
  ];

  const domainStats = [
    { name: "Active", value: 565, color: "bg-emerald-500" },
    { name: "Inactive", value: 125, color: "bg-gray-300" },
    { name: "Pending", value: 89, color: "bg-amber-500" },
  ];

  const activeServices = [
    { id: 1, name: "Cloud API - prod-01", location: "us-east-1", ip: "192.168.1.1", status: "Active", uptime: "99.9%", cpu: 42, memory: 68 },
    { id: 2, name: "Web Services - prod-02", location: "eu-west-1", ip: "192.168.1.2", status: "Active", uptime: "99.8%", cpu: 35, memory: 51 },
    { id: 3, name: "Database - staging-01", location: "ap-south-1", ip: "192.168.1.3", status: "Active", uptime: "98.5%", cpu: 78, memory: 85 },
    { id: 4, name: "Cache Server - prod-03", location: "us-west-2", ip: "192.168.1.4", status: "Active", uptime: "99.7%", cpu: 28, memory: 42 },
    { id: 5, name: "Load Balancer - prod-04", location: "eu-central-1", ip: "192.168.1.5", status: "Active", uptime: "99.95%", cpu: 12, memory: 18 },
    { id: 6, name: "Backup Server - bkp-01", location: "us-east-2", ip: "192.168.1.6", status: "Active", uptime: "99.6%", cpu: 55, memory: 72 },
  ];

  const performanceMetrics = [
    { label: "Avg Response Time", value: "245ms", icon: RefreshCwIcon, color: "text-blue-600" },
    { label: "Request Rate", value: "12.5K/s", icon: IntegrationIcon, color: "text-emerald-600" },
    { label: "Error Rate", value: "0.02%", icon: KeyIcon, color: "text-red-600" },
    { label: "Availability", value: "99.87%", icon: ProjectIcon, color: "text-purple-600" },
  ];

  const alerts = dashboard?.alerts ?? [];

  return (
    <div className="space-y-8">
      <NeedsAttentionBanner alerts={alerts} />

      {/* Hero Section */}
      <motion.section
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-gray-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">
          Welcome back {session.name}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Here's what's happening with your hosting today.
        </p>
      </motion.section>

      {/* Overview Cards (full width, 4 columns) */}
      <motion.section
        className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {overviewMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</p>
                <p className={`mt-3 text-3xl font-bold tabular-nums ${metric.color}`}>{metric.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color.replace('text-', 'bg-').replace('600', '100')} ${metric.color}`}>
                <metric.icon className="size-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Performance Metrics (full width, 4 columns) */}
      <motion.section
        className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.08 }}
      >
        {performanceMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</p>
                <p className={`mt-3 text-3xl font-bold tabular-nums ${metric.color}`}>{metric.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color.replace('text-', 'bg-').replace('600', '100')} ${metric.color}`}>
                <metric.icon className="size-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Analytics & Domains Overview (full width) */}
      <motion.div
        className="grid w-full gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {/* Analytics Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Analytics</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Domain Activity Trend</p>
          
          <div className="mt-6 h-48 flex items-end justify-between gap-2">
            {analyticsData.map((item, idx) => {
              const maxValue = Math.max(...analyticsData.map(d => d.value));
              const heightPercent = (item.value / maxValue) * 100;
              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all hover:opacity-80"
                      style={{ height: `${heightPercent}%`, minHeight: "8px" }}
                    />
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-emerald-300 to-emerald-200 transition-all hover:opacity-80"
                      style={{ height: `${heightPercent * 0.6}%`, minHeight: "4px" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span>Last 24 hours</span>
            <span>Current</span>
          </div>
        </div>

        {/* Domains Overview - Donut Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Domains Overview</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Distribution by Status</p>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-40 w-40">
              {/* Donut Chart SVG */}
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="15" />
                
                {/* Active segment (565 out of 779 ≈ 72.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="15"
                  strokeDasharray="163 225"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
                
                {/* Pending segment (89 out of 779 ≈ 11.4%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="15"
                  strokeDasharray="26 225"
                  strokeDashoffset="-163"
                  transform="rotate(-90 50 50)"
                />

                {/* Center text */}
                <text x="50" y="48" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
                  565
                </text>
                <text x="50" y="58" textAnchor="middle" className="text-xs fill-gray-500">
                  Active
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="ml-8 space-y-3">
              {domainStats.map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${stat.color}`} />
                  <span className="text-sm text-gray-600">{stat.name}</span>
                  <span className="ml-auto text-sm font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Services Table - Full Width */}
      <motion.section
        className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <div className="border-b border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Services</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Monitor and manage your services</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Service Name</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">CPU</th>
                <th className="px-6 py-3 font-medium">Memory</th>
                <th className="px-6 py-3 font-medium text-right">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-gray-600">{service.location}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{service.ip}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            service.cpu >= 80 ? "bg-red-500" : service.cpu >= 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${service.cpu}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{service.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${
                            service.memory >= 80 ? "bg-red-500" : service.memory >= 60 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${service.memory}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{service.memory}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-gray-600">{service.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Quick Stats Cards (full width) */}
      <motion.div
        className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bandwidth</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">2.4 TB</p>
          <p className="mt-2 text-xs text-gray-600">↑ 12.5% from last month</p>
          <div className="mt-3 h-1 w-full rounded-full bg-gray-100">
            <div className="h-full w-9/12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Storage Used</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">856 GB</p>
          <p className="mt-2 text-xs text-gray-600">of 2 TB available</p>
          <div className="mt-3 h-1 w-full rounded-full bg-gray-100">
            <div className="h-full w-5/12 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">API Quota</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">78.2%</p>
          <p className="mt-2 text-xs text-gray-600">3.91M of 5M requests</p>
          <div className="mt-3 h-1 w-full rounded-full bg-gray-100">
            <div className="h-full w-9/12 rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}