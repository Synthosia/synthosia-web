"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { ServerRow } from "@/components/server-row-types";
import { ApiClientError, deleteComputeInstance } from "@/lib/synthosia-api";

export type ModalStrings = Record<string, string>;

/** Configuração de instância compute (leitura + eliminar; alterações via jobs futuros). */
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
  onDeleted?: () => void;
  surface?: "default" | "instance";
}) {
  const rw = selected?.managedCompute;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setMsg(null);
    setConfirmDelete(false);
  }, [rw?.id]);

  const bindingId = rw?.id;

  const doDelete = useCallback(async () => {
    if (!bindingId || !canManage) return;
    setBusy(true);
    setMsg(null);
    try {
      await deleteComputeInstance(bindingId);
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 text-sm">
        <p className={labelCls}>Imagem</p>
        <p className="mt-1 break-all font-mono text-xs text-[var(--text-primary)]">{rw.dockerImage}</p>
        <p className={`${labelCls} mt-4`}>Memória / CPU (pedido)</p>
        <p className="mt-1 text-[var(--text-primary)]">
          {rw.memoryMb} MB · {rw.cpuMillicores} mCPU
        </p>
        <p className={`${labelCls} mt-4`}>Traefik (hosts)</p>
        <p className="mt-1 text-[var(--text-primary)]">
          {rw.traefikHosts?.length ? rw.traefikHosts.join(", ") : "—"}
        </p>
        <p className={`${labelCls} mt-4`}>Estado</p>
        <p className="mt-1 text-[var(--text-primary)]">{rw.status}</p>
      </div>

      {msg ? <p className="text-sm text-amber-800">{msg}</p> : null}

      <div className="border-t border-[var(--border-subtle)] pt-4">
        {!confirmDelete ? (
          <button
            type="button"
            disabled={!canManage || busy}
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 disabled:opacity-50"
          >
            {t.actionDelete ?? "Eliminar"}
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void doDelete()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {t.modalConfirmDelete ?? "Confirmar eliminação"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm"
            >
              {t.modalCancel ?? "Cancelar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
