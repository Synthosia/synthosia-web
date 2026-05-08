"use client";

import type { ProvisionWizardState } from "@/lib/provision-wizard/schema";
import { planById, templateById } from "@/lib/provision-wizard/schema";

export function LaunchReview({
  state,
  regionLabel,
  labels,
}: {
  state: ProvisionWizardState;
  regionLabel: string;
  labels: {
    plan: string;
    template: string;
    image: string;
    port: string;
    domain: string;
    env: string;
    repo: string;
    branch: string;
    tier: string;
    region: string;
    instance: string;
    extras: string;
    envCount: string;
  };
}) {
  const plan = planById(state.planId);
  const tpl = templateById(state.templateId);
  const envCount = state.envRows.filter((r) => r.key.trim()).length;

  const rows: { k: string; v: string }[] = [
    { k: labels.instance, v: state.instanceName || "—" },
    { k: labels.tier, v: state.envTier },
    { k: labels.region, v: regionLabel },
    { k: labels.plan, v: `${plan.id} · ${plan.vcpu} vCPU · ${plan.ramGb} GB` },
    { k: labels.template, v: state.templateId },
    { k: labels.image, v: tpl.dockerImage },
    { k: labels.port, v: String(state.internalPort) },
    { k: labels.domain, v: state.domain.trim() || "—" },
    { k: labels.repo, v: state.repoUrl.trim() || "—" },
    { k: labels.branch, v: state.branch.trim() || "—" },
    { k: labels.envCount, v: String(envCount) },
    {
      k: labels.extras,
      v: [
        state.httpsEnabled ? "HTTPS" : null,
        state.autoDeploy ? "Auto-deploy" : null,
        state.persistentVolumes ? "Volumes" : null,
        state.backupsEnabled ? "Backups" : null,
      ]
        .filter(Boolean)
        .join(" · ") || "—",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)]/60">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.k} className="border-b border-[var(--border-subtle)] last:border-0">
              <th className="w-[36%] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {row.k}
              </th>
              <td className="px-4 py-3 text-[var(--text-primary)]">{row.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
