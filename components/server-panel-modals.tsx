"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { AccountSession } from "@/lib/account-session";
import {
  ApiClientError,
  createCloudManagedService,
  createServerInstance,
  getCloudServiceMetrics,
  listGithubRepositories,
  updateCloudServiceLimits,
  type CloudMetricsResponse,
  type GithubRepository,
} from "@/lib/synthosia-api";
import type { ServerRow } from "@/components/server-row-types";
import { CloudServiceConfigForm } from "@/components/cloud-service-config-form";

function smoothAreaPath(values: number[], w: number, h: number): { line: string; area: string } {
  if (values.length < 2) {
    return { line: "", area: "" };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y] as const;
  });
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[i + 1]!;
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const area = `${d} L ${last[0]} ${h} L ${first[0]} ${h} Z`;
  return { line: d, area };
}

function ModalChart({
  values,
  stroke,
  gradFrom,
  label,
}: {
  values: number[];
  stroke: string;
  gradFrom: string;
  label: string;
}) {
  const gid = useId();
  const w = 320;
  const h = 96;
  const pts = values.length >= 2 ? values : [0, 0];
  const { line, area } = smoothAreaPath(pts, w, h);
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
      <p className="mb-2 text-[11px] font-medium text-gray-600">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`${gid}-m`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradFrom} stopOpacity="0.35" />
            <stop offset="100%" stopColor={gradFrom} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid}-m)`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export type ServerPanelModalKind = "new" | "technical" | "config" | "monitoring" | null;

type ModalStrings = Record<string, string>;

const modalInputCls =
  "mt-1 w-full rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-cyan-600/35 focus:outline-none focus:ring-2 focus:ring-cyan-500/35";

type DeployMode = "image" | "repo";
type ProfileId = "web" | "api" | "worker" | "data" | "custom";

/** Perfis permitidos em Servidores cloud — sem «data»/BD (categoria Bases de dados). */
const CLOUD_PROFILE_ORDER: ProfileId[] = ["web", "api", "worker", "custom"];

const PROFILE_DEFAULTS: Record<
  ProfileId,
  { labelKey: string; image: string; mem: string; vcpu: string; branch: string }
> = {
  web: { labelKey: "modalProfileWeb", image: "nginx:alpine", mem: "0.5", vcpu: "0.25", branch: "main" },
  api: { labelKey: "modalProfileApi", image: "node:20-alpine", mem: "1", vcpu: "0.5", branch: "main" },
  worker: { labelKey: "modalProfileWorker", image: "node:20-alpine", mem: "1", vcpu: "0.5", branch: "main" },
  data: { labelKey: "modalProfileData", image: "postgres:16-alpine", mem: "1", vcpu: "0.5", branch: "main" },
  custom: { labelKey: "modalProfileCustom", image: "", mem: "", vcpu: "", branch: "" },
};

const DOCKER_TEMPLATE_KEYS = [
  { labelKey: "modalTplNginx", image: "nginx:alpine" },
  { labelKey: "modalTplNode", image: "node:20-alpine" },
  { labelKey: "modalTplPostgres", image: "postgres:16-alpine" },
  { labelKey: "modalTplRedis", image: "redis:7-alpine" },
  { labelKey: "modalTplCaddy", image: "caddy:2-alpine" },
] as const;

const CLOUD_DOCKER_TEMPLATE_KEYS = DOCKER_TEMPLATE_KEYS.filter(
  (row) => !/postgres|redis/i.test(row.image),
);

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 min-w-0 flex-1 rounded-md px-2 py-2 text-center text-xs font-semibold leading-tight transition sm:px-3",
        active
          ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
          : "text-gray-600 hover:bg-white/70 hover:text-gray-900",
      )}
    >
      {children}
    </button>
  );
}

function ModalFrame({
  title,
  subtitle,
  children,
  onClose,
  closeLabel,
  maxWidthClassName = "max-w-lg",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
  maxWidthClassName?: string;
}) {
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="server-modal-title"
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <motion.div
        className={cn(
          "relative z-[101] flex max-h-[min(92dvh,900px)] w-full flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:rounded-2xl",
          maxWidthClassName,
        )}
        initial={{ y: 24, opacity: 0.96 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 id="server-modal-title" className="text-sm font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-themed rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="sr-only">{closeLabel}</span>
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export function ServerPanelModals({
  kind,
  selected,
  t,
  onClose,
  onServersChanged,
  canManage,
  session,
}: {
  kind: ServerPanelModalKind;
  selected: ServerRow | null;
  t: ModalStrings;
  onClose: () => void;
  onServersChanged: () => Promise<void>;
  canManage: boolean;
  session?: AccountSession | null;
}) {
  const open = kind !== null;

  return (
    <AnimatePresence>
      {open && kind === "technical" ? (
        <TechnicalModal key="tech" selected={selected} t={t} onClose={onClose} />
      ) : null}
      {open && kind === "config" ? (
        <ConfigModal
          key="cfg"
          selected={selected}
          t={t}
          onClose={onClose}
          onServersChanged={onServersChanged}
          canManage={canManage}
        />
      ) : null}
      {open && kind === "monitoring" ? (
        <MonitoringModal key="mon" selected={selected} t={t} onClose={onClose} />
      ) : null}
      {open && kind === "new" ? (
        <NewServerModal
          key="new"
          t={t}
          session={session}
          onClose={onClose}
          onServersChanged={onServersChanged}
          canManage={canManage}
        />
      ) : null}
    </AnimatePresence>
  );
}

function TechnicalModal({
  selected,
  t,
  onClose,
}: {
  selected: ServerRow | null;
  t: ModalStrings;
  onClose: () => void;
}) {
  if (!selected) return null;
  const payload = selected.managedCloud
    ? {
        kind: "cloud" as const,
        bindingId: selected.managedCloud.id,
        cloudServiceId: selected.managedCloud.cloudServiceId,
        name: selected.managedCloud.name,
        region: selected.managedCloud.region,
        dockerImage: selected.managedCloud.dockerImage,
        limits: selected.managedCloud.limits,
      }
    : selected.sshInstance
      ? { kind: "ssh" as const, ...selected.sshInstance }
      : { kind: "unknown" as const, row: selected };

  return (
    <ModalFrame title={t.modalTechnicalTitle!} onClose={onClose} closeLabel={t.modalClose!}>
      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-800">
        {JSON.stringify(payload, null, 2)}
      </pre>
      <p className="mt-3 text-[11px] text-gray-500">{t.modalTechnicalFootnote!}</p>
    </ModalFrame>
  );
}

function ConfigModal({
  selected,
  t,
  onClose,
  onServersChanged,
  canManage,
}: {
  selected: ServerRow | null;
  t: ModalStrings;
  onClose: () => void;
  onServersChanged: () => Promise<void>;
  canManage: boolean;
}) {
  return (
    <ModalFrame title={t.modalConfigTitle!} onClose={onClose} closeLabel={t.modalClose!}>
      <CloudServiceConfigForm
        selected={selected}
        t={t}
        canManage={canManage}
        onRefresh={onServersChanged}
        onDeleted={onClose}
      />
    </ModalFrame>
  );
}

function MonitoringModal({
  selected,
  t,
  onClose,
}: {
  selected: ServerRow | null;
  t: ModalStrings;
  onClose: () => void;
}) {
  const rw = selected?.managedCloud;
  const [hours, setHours] = useState(6);
  const [refreshTick, setRefreshTick] = useState(0);
  const [data, setData] = useState<CloudMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!rw?.id) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    getCloudServiceMetrics(rw.id, hours)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          setErr(e instanceof ApiClientError ? e.message : t.modalError!);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rw?.id, hours, refreshTick, t.modalError]);

  return (
    <ModalFrame title={t.modalMonitoringTitle!} onClose={onClose} closeLabel={t.modalClose!}>
      {!selected ? (
        <p className="text-sm text-gray-600">{t.modalSelectServer!}</p>
      ) : !rw ? (
        <p className="text-sm text-gray-600">{t.modalMonitoringSshOnly!}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-gray-700">
              {t.modalMonitoringHours!}
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-1 block rounded-md border border-gray-200 px-2 py-1.5 text-sm"
              >
                {[1, 3, 6, 12, 24, 48, 72].map((h) => (
                  <option key={h} value={h}>
                    {h}h
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setRefreshTick((x) => x + 1)}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? t.modalMonitoringLoading! : t.modalMonitoringLoad!}
            </button>
          </div>
          {err ? <p className="text-sm text-red-700">{err}</p> : null}
          {!loading && data && data.series.length === 0 ? (
            <p className="text-sm text-gray-600">{t.modalMonitoringEmpty!}</p>
          ) : null}
          <div className="space-y-4">
            {data?.series.map((s) => {
              const vals = s.points.map((p) => p.value);
              const stroke = s.measurement.includes("CPU") ? "#14b8a6" : "#f59e0b";
              const grad = s.measurement.includes("CPU") ? "#14b8a6" : "#fbbf24";
              return (
                <ModalChart
                  key={s.measurement}
                  values={vals.length >= 2 ? vals : [...vals, ...vals]}
                  stroke={stroke}
                  gradFrom={grad}
                  label={s.measurement}
                />
              );
            })}
          </div>
          {data ? (
            <p className="text-[11px] text-gray-500">
              {t.modalMonitoringWindow!.replace("{h}", String(data.windowHours))}
            </p>
          ) : null}
        </div>
      )}
    </ModalFrame>
  );
}

function NewServerModal({
  t,
  session,
  onClose,
  onServersChanged,
  canManage,
}: {
  t: ModalStrings;
  session?: AccountSession | null;
  onClose: () => void;
  onServersChanged: () => Promise<void>;
  canManage: boolean;
}) {
  const [tab, setTab] = useState<"cloud" | "ssh">("cloud");
  const [deployMode, setDeployMode] = useState<DeployMode>("image");
  const [appProfile, setAppProfile] = useState<ProfileId>("custom");
  const [name, setName] = useState("");
  const [dockerImage, setDockerImage] = useState("");
  const [sourceRepo, setSourceRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [memoryGb, setMemoryGb] = useState("");
  const [vcpus, setVcpus] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("22");
  const [environment, setEnvironment] = useState("production");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepository[] | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubTried, setGithubTried] = useState(false);
  const [githubError, setGithubError] = useState(false);
  const [dockerResults, setDockerResults] = useState<{ name: string; description: string }[]>([]);
  const [dockerSearchBusy, setDockerSearchBusy] = useState(false);
  const [dockerListOpen, setDockerListOpen] = useState(false);
  const dockerComboRef = useRef<HTMLDivElement>(null);

  const debouncedDockerQ = useDebounced(dockerImage, 380);

  useEffect(() => {
    if (!dockerListOpen) return;
    function onDocDown(ev: MouseEvent) {
      const el = dockerComboRef.current;
      if (el && !el.contains(ev.target as Node)) setDockerListOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [dockerListOpen]);

  const applyProfile = useCallback((id: ProfileId) => {
    setAppProfile(id);
    const p = PROFILE_DEFAULTS[id];
    if (id === "custom") return;
    if (p.image) setDockerImage(p.image);
    setBranch(p.branch);
    setMemoryGb(p.mem);
    setVcpus(p.vcpu);
  }, []);

  useEffect(() => {
    if (tab !== "cloud") return;
    if (appProfile !== "data") return;
    setAppProfile("web");
    const p = PROFILE_DEFAULTS.web;
    setDockerImage(p.image);
    setBranch(p.branch);
    setMemoryGb(p.mem);
    setVcpus(p.vcpu);
  }, [tab, appProfile]);

  useEffect(() => {
    if (tab !== "cloud" || deployMode !== "repo") return;
    let cancelled = false;
    setGithubLoading(true);
    setGithubTried(true);
    setGithubRepos(null);
    setGithubError(false);
    listGithubRepositories()
      .then((repos) => {
        if (!cancelled) {
          setGithubRepos(repos);
          setGithubError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGithubRepos([]);
          setGithubError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setGithubLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, deployMode]);

  useEffect(() => {
    if (tab !== "cloud" || deployMode !== "image") {
      setDockerResults([]);
      return;
    }
    const q = debouncedDockerQ.trim();
    if (q.length < 2) {
      setDockerResults([]);
      setDockerSearchBusy(false);
      return;
    }
    let cancelled = false;
    setDockerSearchBusy(true);
    fetch(`/api/docker-search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d: { results?: { name: string; description: string }[] }) => {
        if (!cancelled) setDockerResults(d.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setDockerResults([]);
      })
      .finally(() => {
        if (!cancelled) setDockerSearchBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedDockerQ, tab, deployMode]);

  const pickGithubRepo = useCallback((r: GithubRepository) => {
    setSourceRepo(r.htmlUrl);
    if (r.defaultBranch?.trim()) setBranch(r.defaultBranch.trim());
  }, []);

  const submit = async () => {
    if (!canManage) return;
    const n = name.trim();
    if (!n) {
      setMsg(t.modalNameRequired!);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      if (tab === "cloud") {
        if (deployMode === "image") {
          const img = dockerImage.trim();
          if (!img) {
            setMsg(t.modalCloudImageRequired!);
            setBusy(false);
            return;
          }
          const created = await createCloudManagedService({
            name: n,
            dockerImage: img,
          });
          const mRaw = memoryGb.trim();
          const vRaw = vcpus.trim();
          const mParsed = mRaw ? Number(mRaw) : undefined;
          const vParsed = vRaw ? Number(vRaw) : undefined;
          const m = mParsed != null && !Number.isNaN(mParsed) ? mParsed : undefined;
          const v = vParsed != null && !Number.isNaN(vParsed) ? vParsed : undefined;
          if (m !== undefined || v !== undefined) {
            await updateCloudServiceLimits(created.id, { memoryGb: m, vcpus: v });
          }
        } else {
          const repo = sourceRepo.trim();
          if (!repo) {
            setMsg(t.modalCloudRepoRequired!);
            setBusy(false);
            return;
          }
          const created = await createCloudManagedService({
            name: n,
            sourceRepo: repo,
            branch: branch.trim() || undefined,
          });
          const mRaw = memoryGb.trim();
          const vRaw = vcpus.trim();
          const mParsed = mRaw ? Number(mRaw) : undefined;
          const vParsed = vRaw ? Number(vRaw) : undefined;
          const m = mParsed != null && !Number.isNaN(mParsed) ? mParsed : undefined;
          const v = vParsed != null && !Number.isNaN(vParsed) ? vParsed : undefined;
          if (m !== undefined || v !== undefined) {
            await updateCloudServiceLimits(created.id, { memoryGb: m, vcpus: v });
          }
        }
      } else {
        await createServerInstance({
          name: n,
          host: host.trim(),
          port: port.trim() ? Number(port) : 22,
          environment: environment.trim() || "production",
        });
      }
      await onServersChanged();
      onClose();
      setName("");
      setDockerImage("");
      setSourceRepo("");
      setBranch("");
      setMemoryGb("");
      setVcpus("");
      setHost("");
      setPort("22");
      setDeployMode("image");
      setAppProfile("custom");
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
    }
  };

  const cloudTabLabel = t.modalNewTypeCloud?.trim() || "Synthosia Cloud";
  const sshLabel = t.modalNewTypeSsh?.trim() || "SSH";

  return (
    <ModalFrame
      title={t.modalNewTitle!}
      subtitle={t.modalNewSubtitle!}
      onClose={onClose}
      closeLabel={t.modalClose!}
      maxWidthClassName="max-w-2xl"
    >
      {!canManage ? (
        <p className="text-sm text-amber-800">{t.modalViewerHint!}</p>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80">
            <div className="flex gap-0.5">
              <SegmentedButton active={tab === "cloud"} onClick={() => setTab("cloud")}>
                {cloudTabLabel}
              </SegmentedButton>
              <SegmentedButton active={tab === "ssh"} onClick={() => setTab("ssh")}>
                {sshLabel}
              </SegmentedButton>
            </div>
          </div>

          <label className="block text-xs font-medium text-gray-700">
            {t.modalNewName!}
            <input value={name} onChange={(e) => setName(e.target.value)} className={modalInputCls} />
          </label>

          {tab === "cloud" ? (
            <>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t.modalNewAppProfile!}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {CLOUD_PROFILE_ORDER.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => applyProfile(id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition",
                        appProfile === id
                          ? "border-cyan-700/40 bg-cyan-50 text-cyan-950 ring-1 ring-cyan-700/20"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                      )}
                    >
                      {t[PROFILE_DEFAULTS[id].labelKey] ?? PROFILE_DEFAULTS[id].labelKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80">
                <div className="flex gap-0.5">
                  <SegmentedButton active={deployMode === "image"} onClick={() => setDeployMode("image")}>
                    {t.modalNewDeployImage!}
                  </SegmentedButton>
                  <SegmentedButton active={deployMode === "repo"} onClick={() => setDeployMode("repo")}>
                    {t.modalNewDeployRepo!}
                  </SegmentedButton>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-gray-600">{t.modalNewDeployHint!}</p>

              {deployMode === "image" ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {t.modalDockerTemplates!}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {CLOUD_DOCKER_TEMPLATE_KEYS.map((row) => (
                        <button
                          key={row.image}
                          type="button"
                          onClick={() => setDockerImage(row.image)}
                          className="rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-[10px] font-medium text-gray-800 shadow-sm transition hover:border-cyan-600/35 hover:bg-cyan-50/50"
                        >
                          {t[row.labelKey] ?? row.labelKey}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative" ref={dockerComboRef}>
                    <label className="block text-xs font-medium text-gray-700">
                      {t.modalNewDockerImage!}
                      <input
                        value={dockerImage}
                        onChange={(e) => {
                          setDockerImage(e.target.value);
                          setDockerListOpen(true);
                        }}
                        onFocus={() => setDockerListOpen(true)}
                        autoComplete="off"
                        className={cn(modalInputCls, "font-mono text-[13px]")}
                      />
                    </label>
                    <p className="mt-1 text-[10px] text-gray-500">{t.modalDockerSearchHelp!}</p>
                    {dockerListOpen && debouncedDockerQ.trim().length >= 2 ? (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        {dockerSearchBusy ? (
                          <p className="px-3 py-2 text-xs text-gray-500">{t.modalDockerSearchLoading!}</p>
                        ) : dockerResults.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-gray-500">{t.modalDockerSearchEmpty!}</p>
                        ) : (
                          dockerResults.map((row) => (
                            <button
                              key={row.name}
                              type="button"
                              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-xs hover:bg-gray-50"
                              onClick={() => {
                                setDockerImage(row.name);
                                setDockerListOpen(false);
                              }}
                            >
                              <span className="font-mono font-semibold text-gray-900">{row.name}</span>
                              {row.description ? (
                                <span className="line-clamp-2 text-[10px] text-gray-500">{row.description}</span>
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {session?.authProvider === "github" || session?.integrations?.includes("ext-github") ? (
                    <p className="text-[10px] font-medium text-cyan-900/90">{t.modalGithubLinkedHint!}</p>
                  ) : null}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {t.modalGithubYourRepos!}
                    </p>
                    {githubLoading ? (
                      <p className="mt-2 text-xs text-gray-500">{t.modalGithubLoading!}</p>
                    ) : githubError ? (
                      <p className="mt-2 text-xs text-amber-800/90">{t.modalGithubUnavailable!}</p>
                    ) : githubTried && githubRepos && githubRepos.length === 0 ? (
                      <p className="mt-2 text-xs text-gray-600">{t.modalGithubEmpty!}</p>
                    ) : (
                      <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/80 p-2">
                        {(githubRepos ?? []).map((r) => (
                          <li key={r.fullName}>
                            <button
                              type="button"
                              onClick={() => pickGithubRepo(r)}
                              className="flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition hover:bg-white"
                            >
                              <span className="font-mono text-[11px] font-semibold text-gray-900">{r.fullName}</span>
                              <span className="text-[10px] text-gray-500">
                                {r.defaultBranch ? `default: ${r.defaultBranch}` : "—"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <label className="block text-xs font-medium text-gray-700">
                    {t.modalNewSourceRepo!}
                    <input
                      value={sourceRepo}
                      onChange={(e) => setSourceRepo(e.target.value)}
                      className={cn(modalInputCls, "font-mono text-[13px]")}
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-700">
                    {t.modalGithubUseBranch!}
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className={cn(modalInputCls, "font-mono text-[13px]")}
                    />
                  </label>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t.modalResourcesInitial!}
                </p>
                <p className="mt-1 text-[10px] text-gray-500">{t.modalResourcesCloudOnly!}</p>
                <p className="mt-1 text-[10px] text-gray-500">{t.modalDiskNote!}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-gray-700">
                    {t.modalMemoryGb!}
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={memoryGb}
                      onChange={(e) => setMemoryGb(e.target.value)}
                      className={cn(modalInputCls, "font-mono")}
                    />
                  </label>
                  <label className="block text-xs font-medium text-gray-700">
                    {t.modalVcpus!}
                    <input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={vcpus}
                      onChange={(e) => setVcpus(e.target.value)}
                      className={cn(modalInputCls, "font-mono")}
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[11px] text-gray-600">{t.modalResourcesSshNote!}</p>
              <label className="block text-xs font-medium text-gray-700">
                {t.modalNewHost!}
                <input value={host} onChange={(e) => setHost(e.target.value)} className={cn(modalInputCls, "font-mono")} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-gray-700">
                  {t.modalNewPort!}
                  <input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className={cn(modalInputCls, "font-mono")}
                  />
                </label>
                <label className="block text-xs font-medium text-gray-700">
                  {t.modalNewEnvironment!}
                  <input
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className={modalInputCls}
                  />
                </label>
              </div>
            </>
          )}

          {msg ? <p className="text-sm text-red-700">{msg}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="btn-primary focus-themed w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {t.modalNewCreate!}
          </button>
        </div>
      )}
    </ModalFrame>
  );
}
