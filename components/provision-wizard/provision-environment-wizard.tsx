"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import {
  ApiClientError,
  createComputeInstance,
} from "@/lib/synthosia-api";
import type { AccountSession } from "@/lib/account-session";
import { provisionWizardEn } from "@/lib/provision-wizard/i18n";
import {
  initialWizardState,
  PLAN_PRESETS,
  planById,
  planToApiResources,
  REGIONS,
  STACK_TEMPLATES,
  templateById,
  type EnvVarRow,
  type ProvisionWizardState,
} from "@/lib/provision-wizard/schema";
import { WizardStepper } from "@/components/provision-wizard/wizard-stepper";
import { PlanCard } from "@/components/provision-wizard/plan-card";
import { ResourceEstimator } from "@/components/provision-wizard/resource-estimator";
import { ImageMarketplace } from "@/components/provision-wizard/image-marketplace";
import { RepoSelector } from "@/components/provision-wizard/repo-selector";
import { EnvEditor } from "@/components/provision-wizard/env-editor";
import { LaunchReview } from "@/components/provision-wizard/launch-review";
import { LiveDeployConsole } from "@/components/provision-wizard/live-deploy-console";

const STEP_KEYS = ["project", "plan", "template", "repo", "env", "deploy", "review"] as const;

function envRowsToEnvironment(rows: EnvVarRow[]): Record<string, string> | undefined {
  const o: Record<string, string> = {};
  for (const r of rows) {
    const k = r.key.trim();
    if (!k) continue;
    o[k] = r.value;
  }
  return Object.keys(o).length > 0 ? o : undefined;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
}

type WizardCopy = typeof provisionWizardEn;

function useWizardCopy(): WizardCopy {
  const { dictionary } = useLanguage();
  const raw = (dictionary.panel as { provisionWizard?: WizardCopy }).provisionWizard;
  return raw ?? provisionWizardEn;
}

export function ProvisionEnvironmentWizard({
  session,
  onCancel,
  onComplete,
}: {
  session: AccountSession;
  onCancel: () => void;
  onComplete: (instanceId: string) => void;
}) {
  const copy = useWizardCopy();
  const [state, setState] = useState<ProvisionWizardState>(() => initialWizardState());
  const [deployJobId, setDeployJobId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const doneNavRef = useRef(false);
  const canManage = session.role !== "viewer";

  const stepLabels = useMemo(() => {
    const o: Record<string, string> = {};
    for (const k of STEP_KEYS) o[k] = copy.stepLabels[k];
    return o;
  }, [copy.stepLabels]);

  const regionLabel = copy.regions[state.region] ?? state.region;

  const setStep = (n: number) => setState((s) => ({ ...s, step: n }));

  const suggestNames = useCallback(() => {
    const base = slugify(state.projectName) || `app-${Math.floor(Math.random() * 9000 + 1000)}`;
    setState((s) => ({
      ...s,
      instanceName: `${base}-${s.envTier === "production" ? "prd" : s.envTier === "staging" ? "stg" : "dev"}`,
    }));
  }, [state.projectName, state.envTier]);

  const validateStep = (n: number): boolean => {
    setErr(null);
    if (n === 1) {
      if (!state.projectName.trim()) {
        setErr(copy.errors.project);
        return false;
      }
      if (!state.instanceName.trim()) {
        setErr(copy.errors.instance);
        return false;
      }
    }
    if (n === 6) {
      const p = state.internalPort;
      if (!Number.isInteger(p) || p < 1 || p > 65535) {
        setErr(copy.errors.port);
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(state.step)) return;
    setStep(Math.min(7, state.step + 1));
  };

  const goBack = () => {
    setErr(null);
    setStep(Math.max(1, state.step - 1));
  };

  const launch = async () => {
    if (!canManage) return;
    setBusy(true);
    setErr(null);
    try {
      const plan = planById(state.planId);
      const tpl = templateById(state.templateId);
      const { memoryMb, cpuMillicores } = planToApiResources(plan);
      const hosts = state.domain.trim()
        ? [state.domain.trim().replace(/^https?:\/\//i, "")]
        : [];
      const environment = envRowsToEnvironment(state.envRows);
      const created = await createComputeInstance({
        name: state.instanceName.trim(),
        dockerImage: tpl.dockerImage,
        memoryMb,
        cpuMillicores,
        internalPort: state.internalPort,
        traefikHosts: hosts,
        ...(environment ? { environment } : {}),
      });
      setCreatedId(created.instance.id);
      setDeployJobId(created.jobId);
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : copy.errors.launch);
    } finally {
      setBusy(false);
    }
  };

  const handleDeploySuccess = useCallback(() => {
    if (doneNavRef.current || !createdId) return;
    doneNavRef.current = true;
    onComplete(createdId);
  }, [createdId, onComplete]);

  const handleDeployFailure = useCallback((msg: string) => {
    setErr(msg);
  }, []);

  if (deployJobId && createdId) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-2 py-4">
        <LiveDeployConsole
          jobId={deployJobId}
          labels={{
            title: copy.title,
            subtitle: copy.subtitle,
            doneOk: "",
            doneFail: copy.errors.launch,
          }}
          onSuccess={handleDeploySuccess}
          onFailure={handleDeployFailure}
        />
        {err ? <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-[var(--text-muted)] underline-offset-2 hover:underline"
        >
          {copy.cancel}
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl pb-16">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-25",
          "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]",
        )}
      />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
            Synthosia Cloud
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">{copy.subtitle}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-raised)]"
          >
            {copy.cancel}
          </button>
        </div>
      </header>

      <WizardStepper steps={STEP_KEYS as unknown as string[]} current={state.step} labels={stepLabels} />

      {!canManage ? <p className="mt-6 text-sm text-amber-800 dark:text-amber-200">{copy.viewer}</p> : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          role="tabpanel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="mt-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-panel)]/55 p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)] backdrop-blur-xl dark:bg-[var(--surface-panel)]/45 md:p-8"
        >
          {state.step === 1 ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {copy.project.name}
                  </label>
                  <input
                    value={state.projectName}
                    onChange={(e) => setState((s) => ({ ...s, projectName: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
                    placeholder="Neon Atlas"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">{copy.project.nameHint}</p>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {copy.project.tier}
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["production", "staging", "development"] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setState((s) => ({ ...s, envTier: tier }))}
                        className={cn(
                          "rounded-full px-4 py-2 text-xs font-semibold capitalize ring-1 transition",
                          state.envTier === tier
                            ? "bg-[var(--surface-interactive)] text-[var(--text-primary)] ring-[var(--brand-accent)]/45"
                            : "bg-transparent text-[var(--text-muted)] ring-[var(--border-subtle)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {copy.project.region}
                  </label>
                  <select
                    value={state.region}
                    onChange={(e) =>
                      setState((s) => ({ ...s, region: e.target.value as ProvisionWizardState["region"] }))
                    }
                    className="mt-2 w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {copy.regions[r.id] ?? r.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      {copy.project.instance}
                    </label>
                    <button
                      type="button"
                      onClick={suggestNames}
                      className="text-[11px] font-semibold text-[var(--brand-accent)] hover:underline"
                    >
                      {copy.project.genName}
                    </button>
                  </div>
                  <input
                    value={state.instanceName}
                    onChange={(e) => setState((s) => ({ ...s, instanceName: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">{copy.project.instanceHint}</p>
                </div>
              </div>
              <ResourceEstimator plan={planById(state.planId)} regionLabel={regionLabel} labels={copy.estimator} />
            </div>
          ) : null}

          {state.step === 2 ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {PLAN_PRESETS.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={state.planId === plan.id}
                    onSelect={() => setState((s) => ({ ...s, planId: plan.id }))}
                    ideal={copy.plan.ideals[plan.id] ?? ""}
                    labels={copy.planCard}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">{copy.plan.footnote}</p>
            </div>
          ) : null}

          {state.step === 3 ? (
            <ImageMarketplace
              templates={STACK_TEMPLATES}
              selected={state.templateId}
              onSelect={(id) =>
                setState((s) => ({
                  ...s,
                  templateId: id,
                  internalPort: templateById(id).defaultInternalPort,
                }))
              }
              templateCopy={copy.templates}
              badgeLabels={{
                official: copy.templateBadge.official ?? "Official",
                community: copy.templateBadge.community ?? "Community",
                optimized: copy.templateBadge.optimized ?? "Optimized",
              }}
            />
          ) : null}

          {state.step === 4 ? (
            <RepoSelector
              repoUrl={state.repoUrl}
              branch={state.branch}
              gitProvider={state.gitProvider}
              detectedStack={state.detectedStack}
              onRepoUrl={(repoUrl) => setState((s) => ({ ...s, repoUrl }))}
              onBranch={(branch) => setState((s) => ({ ...s, branch }))}
              onProvider={(gitProvider) => setState((s) => ({ ...s, gitProvider }))}
              onDetect={(hint) => setState((s) => ({ ...s, detectedStack: hint }))}
              labels={copy.repo}
            />
          ) : null}

          {state.step === 5 ? (
            <EnvEditor rows={state.envRows} onChange={(envRows) => setState((s) => ({ ...s, envRows }))} labels={copy.env} />
          ) : null}

          {state.step === 6 ? (
            <div className="mx-auto max-w-lg space-y-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {copy.deploy.port}
                </label>
                <input
                  type="number"
                  min={1}
                  max={65535}
                  value={state.internalPort}
                  onChange={(e) =>
                    setState((s) => ({ ...s, internalPort: Number(e.target.value) || s.internalPort }))
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
                />
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{copy.deploy.portHint}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {copy.deploy.domain}
                </label>
                <input
                  value={state.domain}
                  onChange={(e) => setState((s) => ({ ...s, domain: e.target.value }))}
                  placeholder="app.example.com"
                  className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={state.httpsEnabled}
                  onChange={(e) => setState((s) => ({ ...s, httpsEnabled: e.target.checked }))}
                />
                {copy.deploy.https}
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={state.autoDeploy}
                  onChange={(e) => setState((s) => ({ ...s, autoDeploy: e.target.checked }))}
                />
                {copy.deploy.autoDeploy}
              </label>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {copy.deploy.restart}
                </label>
                <select
                  value={state.restartPolicy}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      restartPolicy: e.target.value as ProvisionWizardState["restartPolicy"],
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-page)] px-4 py-3 text-sm"
                >
                  <option value="unless-stopped">{copy.deploy.rUnless}</option>
                  <option value="always">{copy.deploy.rAlways}</option>
                  <option value="on-failure">{copy.deploy.rOnFailure}</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={state.persistentVolumes}
                  disabled
                  onChange={(e) => setState((s) => ({ ...s, persistentVolumes: e.target.checked }))}
                />
                {copy.deploy.volumes}
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={state.backupsEnabled}
                  disabled
                  onChange={(e) => setState((s) => ({ ...s, backupsEnabled: e.target.checked }))}
                />
                {copy.deploy.backups}
              </label>
            </div>
          ) : null}

          {state.step === 7 ? (
            <div className="space-y-4">
              <LaunchReview state={state} regionLabel={regionLabel} labels={copy.review} />
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{copy.roadmapBackend}</p>
            </div>
          ) : null}

          {err ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{err}</p> : null}

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={state.step <= 1}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:opacity-40"
            >
              {copy.back}
            </button>
            <div className="flex gap-2">
              {state.step < 7 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canManage}
                  className="rounded-xl bg-[var(--button-primary-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--button-primary-text)] shadow-lg shadow-black/10 transition hover:opacity-95 disabled:opacity-40"
                >
                  {copy.next}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void launch()}
                  disabled={!canManage || busy}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:opacity-40 dark:from-violet-500 dark:to-blue-500"
                >
                  {busy ? "…" : copy.launch}
                </button>
              )}
            </div>
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
