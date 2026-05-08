"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { listGithubRepositories, type GithubRepository } from "@/lib/synthosia-api";

export function RepoSelector({
  repoUrl,
  branch,
  gitProvider,
  detectedStack,
  onRepoUrl,
  onBranch,
  onProvider,
  onDetect,
  labels,
}: {
  repoUrl: string;
  branch: string;
  gitProvider: "github" | "gitlab" | "bitbucket" | "manual";
  detectedStack: string | null;
  onRepoUrl: (v: string) => void;
  onBranch: (v: string) => void;
  onProvider: (v: "github" | "gitlab" | "bitbucket" | "manual") => void;
  onDetect: (hint: string) => void;
  labels: {
    title: string;
    subtitle: string;
    manual: string;
    branch: string;
    loadRepos: string;
    loading: string;
    empty: string;
    error: string;
    detect: string;
    detected: string;
    roadmapHint: string;
  };
}) {
  const [repos, setRepos] = useState<GithubRepository[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (gitProvider !== "github") {
      setRepos(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr(false);
    void listGithubRepositories()
      .then((r) => {
        if (!cancelled) setRepos(r);
      })
      .catch(() => {
        if (!cancelled) {
          setErr(true);
          setRepos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gitProvider]);

  const pickRepo = (r: GithubRepository) => {
    onRepoUrl(r.htmlUrl);
    if (r.defaultBranch?.trim()) onBranch(r.defaultBranch.trim());
    onDetect(`GitHub · ${r.fullName}`);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{labels.title}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{labels.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["github", "gitlab", "bitbucket", "manual"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onProvider(p)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 transition",
              gitProvider === p
                ? "bg-[var(--surface-interactive)] text-[var(--text-primary)] ring-[var(--brand-accent)]/40"
                : "bg-[var(--surface-panel)] text-[var(--text-muted)] ring-[var(--border-subtle)] hover:text-[var(--text-primary)]",
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {gitProvider === "github" ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {labels.loadRepos}
          </p>
          {loading ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{labels.loading}</p> : null}
          {err ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{labels.error}</p> : null}
          {!loading && repos && repos.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--text-muted)]">{labels.empty}</p>
          ) : null}
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {(repos ?? []).slice(0, 40).map((r) => (
              <li key={r.fullName}>
                <button
                  type="button"
                  onClick={() => pickRepo(r)}
                  className="flex w-full flex-col rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-[var(--surface-interactive)]"
                >
                  <span className="font-medium text-[var(--text-primary)]">{r.fullName}</span>
                  <span className="text-[var(--text-muted)]">{r.private ? "private" : "public"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {labels.manual}
        </label>
        <input
          value={repoUrl}
          onChange={(e) => onRepoUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {labels.branch}
        </label>
        <input
          value={branch}
          onChange={(e) => onBranch(e.target.value)}
          placeholder="main"
          className="w-full max-w-xs rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onDetect(
              repoUrl.match(/package\.json|pnpm-lock|yarn\.lock/)
                ? "Node · lockfile"
                : repoUrl.match(/requirements\.txt|pyproject/)
                  ? "Python"
                  : repoUrl.match(/Dockerfile/)
                    ? "Dockerfile"
                    : "Genérico (revise a imagem base)",
            )
          }
          className="rounded-lg bg-[var(--surface-interactive)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] ring-1 ring-[var(--border-subtle)]"
        >
          {labels.detect}
        </button>
        {detectedStack ? (
          <span className="text-xs text-[var(--text-secondary)]">
            {labels.detected}: <strong className="text-[var(--text-primary)]">{detectedStack}</strong>
          </span>
        ) : null}
      </div>

      <p className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
        {labels.roadmapHint}
      </p>
    </div>
  );
}
