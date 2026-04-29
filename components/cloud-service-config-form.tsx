"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { ServerRow } from "@/components/server-row-types";
import {
  ApiClientError,
  deleteCloudManagedService,
  patchCloudServiceSettings,
  restartCloudService,
  updateCloudServiceImage,
  updateCloudServiceLimits,
} from "@/lib/synthosia-api";
import { limitsFormStrings } from "@/lib/cloud-service-limits";

export type ModalStrings = Record<string, string>;

/** Formulário de configuração cloud (sem modal) — página de detalhes ou modal. */
export function CloudServiceConfigForm({
  selected,
  t,
  canManage,
  onRefresh,
  onDeleted,
  surface = "default",
}: {
  selected: ServerRow | null;
  t: ModalStrings;
  canManage: boolean;
  onRefresh: () => Promise<void>;
  /** Chamado após eliminar o serviço com sucesso. */
  onDeleted?: () => void;
  /** `instance` — contraste forte em tema escuro (página de detalhe). */
  surface?: "default" | "instance";
}) {
  const rw = selected?.managedCloud;
  const [displayName, setDisplayName] = useState("");
  const [memoryGb, setMemoryGb] = useState("");
  const [vcpus, setVcpus] = useState("");
  const [dockerImage, setDockerImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    setMsg(null);
    setConfirmDelete(false);
    setNeedsRestart(false);
    setDockerImage(rw?.dockerImage?.trim() ?? "");
    setDisplayName(rw?.name?.trim() ?? "");
    const parsed = limitsFormStrings(rw?.limits);
    setMemoryGb(parsed.memoryGb);
    setVcpus(parsed.vcpus);
  }, [rw?.id, rw?.dockerImage, rw?.name, rw?.limits]);

  const bindingId = rw?.id;

  const saveDisplayName = useCallback(async () => {
    if (!bindingId || !canManage) return;
    const n = displayName.trim();
    if (!n) {
      setMsg(t.modalDisplayNameRequired!);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await patchCloudServiceSettings(bindingId, { displayName: n });
      setMsg(t.modalSuccess!);
      await onRefresh();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
    }
  }, [bindingId, canManage, displayName, onRefresh, t]);

  const saveLimits = useCallback(async () => {
    if (!bindingId || !canManage) return;
    const m = memoryGb.trim() ? Number(memoryGb) : undefined;
    const v = vcpus.trim() ? Number(vcpus) : undefined;
    if (m === undefined && v === undefined) {
      setMsg(t.modalConfigLimitsNeedOne!);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await updateCloudServiceLimits(bindingId, { memoryGb: m, vcpus: v });
      setMsg(t.modalSuccess!);
      setNeedsRestart(true);
      await onRefresh();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
    }
  }, [bindingId, canManage, memoryGb, vcpus, onRefresh, t]);

  const saveImage = useCallback(async () => {
    if (!bindingId || !canManage) return;
    const img = dockerImage.trim();
    if (!img) {
      setMsg(t.modalImageRequired!);
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await updateCloudServiceImage(bindingId, img);
      setMsg(t.modalSuccess!);
      setNeedsRestart(true);
      await onRefresh();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
    }
  }, [bindingId, canManage, dockerImage, onRefresh, t]);

  const doDelete = useCallback(async () => {
    if (!bindingId || !canManage) return;
    setBusy(true);
    setMsg(null);
    try {
      await deleteCloudManagedService(bindingId);
      await onRefresh();
      onDeleted?.();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }, [bindingId, canManage, onRefresh, onDeleted, t]);

  if (!selected) {
    return <p className="text-sm text-gray-600">{t.modalSelectServer!}</p>;
  }
  if (!rw) {
    return <p className="text-sm text-gray-600">{t.modalSshConfigHint!}</p>;
  }

  const inst = surface === "instance";
  const labelCls = cn(
    "block text-xs font-medium",
    inst ? "text-[var(--text-secondary)]" : "text-gray-700",
  );
  const inputCls = cn(
    "mt-1 w-full rounded-lg px-3 py-2 font-mono text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-[var(--brand-accent-2)]/35",
    inst
      ? "border border-[var(--border-subtle)] bg-[var(--console-search-bg)] text-[var(--text-primary)]"
      : "border border-gray-200",
  );
  const sectionTitleCls = cn(
    "text-[11px] font-semibold uppercase tracking-wide",
    inst ? "text-[var(--text-muted)]" : "text-gray-500",
  );
  const dividerCls = inst ? "border-[var(--border-subtle)]" : "border-gray-100";
  const btnPrimaryCls = cn(
    "focus-themed mt-3 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50",
    inst
      ? "bg-[var(--brand-accent-2)] text-white shadow-sm hover:opacity-90"
      : "btn-primary",
  );
  const btnSecondaryCls = cn(
    "focus-themed mt-3 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50",
    inst
      ? "border border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-interactive)]"
      : "btn-secondary border border-gray-200 bg-white",
  );

  return (
    <div className="space-y-5">
      {!canManage ? (
        <p className={cn("text-sm", inst ? "text-amber-800 dark:text-amber-200" : "text-amber-800")}>
          {t.modalViewerHint!}
        </p>
      ) : null}
      <div>
        <p className={sectionTitleCls}>{t.modalDisplayNameSection!}</p>
        <label className={cn("mt-2", labelCls)}>
          {t.modalDisplayName!}
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
        </label>
        <button type="button" disabled={busy || !canManage} onClick={() => void saveDisplayName()} className={btnPrimaryCls}>
          {t.modalSaveDisplayName!}
        </button>
      </div>
      <div className={cn("border-t pt-4", dividerCls)}>
        <p className={sectionTitleCls}>{t.modalLimitsSection!}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            {t.modalMemoryGb!}
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={memoryGb}
              onChange={(e) => setMemoryGb(e.target.value)}
              className={inputCls}
              placeholder="e.g. 2"
            />
          </label>
          <label className={labelCls}>
            {t.modalVcpus!}
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={vcpus}
              onChange={(e) => setVcpus(e.target.value)}
              className={inputCls}
              placeholder="e.g. 2"
            />
          </label>
        </div>
        <button type="button" disabled={busy || !canManage} onClick={() => void saveLimits()} className={btnPrimaryCls}>
          {t.modalSaveLimits!}
        </button>
      </div>
      <div className={cn("border-t pt-4", dividerCls)}>
        <p className={sectionTitleCls}>{t.modalImageSection!}</p>
        <label className={cn("mt-2", labelCls)}>
          {t.modalDockerImage!}
          <input
            type="text"
            value={dockerImage}
            onChange={(e) => setDockerImage(e.target.value)}
            className={inputCls}
            placeholder="nginx:alpine"
          />
        </label>
        <button type="button" disabled={busy || !canManage} onClick={() => void saveImage()} className={btnSecondaryCls}>
          {t.modalSaveImage!}
        </button>
      </div>
      {needsRestart && canManage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-3 text-sm text-amber-950">
          <p>{t.modalRestartRecommended}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void (async () => {
              if (!bindingId) return;
              setBusy(true);
              setMsg(null);
              try {
                await restartCloudService(bindingId);
                setNeedsRestart(false);
                setMsg(t.modalSuccess!);
                await onRefresh();
              } catch (e) {
                setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
              } finally {
                setBusy(false);
              }
            })()}
            className="focus-themed mt-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 disabled:opacity-50"
          >
            {t.modalRestartNow}
          </button>
        </div>
      ) : null}
      <div className={cn("border-t pt-4", inst ? "border-red-200/80 dark:border-red-900/50" : "border-red-100")}>
        <p className={cn("text-[11px] font-semibold uppercase tracking-wide", inst ? "text-red-600 dark:text-red-400" : "text-red-700")}>
          {t.modalDangerZone!}
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            disabled={busy || !canManage}
            onClick={() => setConfirmDelete(true)}
            className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 disabled:opacity-50"
          >
            {t.modalDeleteService!}
          </button>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void doDelete()}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {t.modalDeleteConfirm!}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              {t.modalCancel!}
            </button>
          </div>
        )}
      </div>
      {msg ? (
        <p className={cn("text-sm", inst ? "text-[var(--text-primary)]" : "text-gray-700")}>{msg}</p>
      ) : null}
    </div>
  );
}
