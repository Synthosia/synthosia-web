"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { mapComputeLifecycleFromStatus } from "@/components/server-row-types";
import type { AccountSession } from "@/lib/account-session";
import { ApiClientError, deleteComputeInstance, listComputeInstances, type ComputeInstance } from "@/lib/synthosia-api";

/**
 * Consola de instância no compute plane (VPS / jobs).
 * Stream SSE na página de detalhe (separador «Consola de stream»).
 */
export function CloudServiceConsole({
  session,
  cloudBindingId,
  onNavigateCloud,
  onBackToServerList,
}: {
  session: AccountSession;
  cloudBindingId: string | null;
  onNavigateCloud: (bindingId: string | null) => void;
  onBackToServerList: () => void;
}) {
  const { dictionary } = useLanguage();
  const sm = dictionary.panel.serverMonitoring as Record<string, string>;
  const canManage = session.role !== "viewer";

  const [instance, setInstance] = useState<ComputeInstance | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!cloudBindingId) {
      setInstance(null);
      return;
    }
    try {
      const list = await listComputeInstances();
      setInstance(list.find((s) => s.id === cloudBindingId) ?? null);
      setLoadErr(false);
    } catch {
      setInstance(null);
      setLoadErr(true);
    }
  }, [cloudBindingId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runDelete = useCallback(async () => {
    if (!cloudBindingId || !canManage) return;
    if (!window.confirm(sm.deleteConfirm ?? "Eliminar esta instância?")) return;
    setLifecycleBusy(true);
    try {
      await deleteComputeInstance(cloudBindingId);
      onNavigateCloud(null);
      onBackToServerList();
    } catch (e) {
      window.alert(e instanceof ApiClientError ? e.message : sm.modalError ?? "Erro");
    } finally {
      setLifecycleBusy(false);
    }
  }, [cloudBindingId, canManage, onNavigateCloud, onBackToServerList, sm.deleteConfirm, sm.modalError]);

  if (!cloudBindingId) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">{sm.consolePickService}</p>
        <p className="mt-2 text-xs text-gray-600">{sm.consolePickServiceHint}</p>
        <button
          type="button"
          onClick={onBackToServerList}
          className="btn-primary focus-themed mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium"
        >
          {sm.consoleBackToServerList}
        </button>
      </div>
    );
  }

  if (loadErr) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {sm.consoleLoadServiceError}
      </p>
    );
  }

  const lc = instance ? mapComputeLifecycleFromStatus(instance.status) : "unknown";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-gray-900">{sm.consoleStreamPageTitle}</h1>
          <p className="mt-1 text-xs text-gray-600">
            {instance?.name ? (
              <>
                <span className="font-medium text-gray-800">{instance.name}</span>
                <span className="text-gray-400"> · </span>
              </>
            ) : null}
            {sm.consoleStreamPageSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToServerList}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          {sm.consoleBackToServerList}
        </button>
      </div>

      {instance ? (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {sm.consoleInstanceActions}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canManage || lifecycleBusy}
              onClick={() => void runDelete()}
              className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-900 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
            >
              {sm.actionDelete}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            Estado: {instance.status} ({lc}). Deploy/restart/stop são tratados pelo agente via jobs.
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">{sm.loadingServers}</p>
      )}

      {instance ? (
        <pre className="max-h-[min(60vh,32rem)] overflow-auto rounded-xl border border-gray-200 bg-gray-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-100/95">
          {JSON.stringify(instance, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
