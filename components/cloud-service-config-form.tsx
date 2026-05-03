"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ServerRow } from "@/components/server-row-types";
import {
  ApiClientError,
  deleteComputeInstance,
  jobProvisioningEventsUrl,
  patchComputeInstance,
} from "@/lib/synthosia-api";

export type ModalStrings = Record<string, string>;

const inputCls =
  "mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-cyan-600/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/25";

function hostsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const x = [...a].map((s) => s.trim()).sort();
  const y = [...b].map((s) => s.trim()).sort();
  return x.every((v, i) => v === y[i]);
}

/** Configuração de instância compute: leitura, edição com reinício no agente (PATCH), eliminar. */
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
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editMemoryMb, setEditMemoryMb] = useState("");
  const [editCpuVcores, setEditCpuVcores] = useState("");
  const [editInternalPort, setEditInternalPort] = useState("");
  const [editTraefikCsv, setEditTraefikCsv] = useState("");
  const [jobLogLines, setJobLogLines] = useState<string[]>([]);
  const [awaitJobId, setAwaitJobId] = useState<string | null>(null);
  const jobEndedRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsg(null);
    setConfirmDelete(false);
    setAwaitJobId(null);
    setJobLogLines([]);
  }, [rw?.id]);

  useEffect(() => {
    if (!rw) return;
    setEditName(rw.name);
    setEditImage(rw.dockerImage);
    setEditMemoryMb(String(rw.memoryMb));
    setEditCpuVcores(String(rw.cpuMillicores / 1000));
    setEditInternalPort(String(rw.internalContainerPort ?? 80));
    setEditTraefikCsv((rw.traefikHosts ?? []).join(", "));
  }, [rw?.id, rw?.updatedAt]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [jobLogLines]);

  useEffect(() => {
    if (!awaitJobId) return;
    jobEndedRef.current = false;
    const url = jobProvisioningEventsUrl(awaitJobId);
    const es = new EventSource(url, { withCredentials: true });
    const onLog = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data as string) as { message?: string };
        const line = d.message?.trim();
        if (line) setJobLogLines((prev) => [...prev, line]);
      } catch {
        /* ignore */
      }
    };
    const onDone = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data as string) as { status?: string; error?: string | null };
        jobEndedRef.current = true;
        es.close();
        void onRefresh();
        if (d.status === "succeeded") {
          setMsg("Reconfiguração concluída.");
          setAwaitJobId(null);
        } else {
          setMsg(d.error ?? "A reconfiguração falhou no agente.");
          setAwaitJobId(null);
        }
      } catch {
        jobEndedRef.current = true;
        es.close();
        setMsg("Resposta inválida do servidor.");
        setAwaitJobId(null);
      }
    };
    es.addEventListener("log", onLog as EventListener);
    es.addEventListener("done", onDone as EventListener);
    es.onerror = () => {
      if (jobEndedRef.current) return;
      es.close();
      void onRefresh();
      setMsg((prev) => prev ?? "Ligação em tempo real interrompida — atualize o estado manualmente.");
      setAwaitJobId(null);
    };
    return () => {
      es.close();
    };
  }, [awaitJobId, onRefresh]);

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

  const saveEdits = useCallback(async () => {
    if (!bindingId || !rw || !canManage) return;
    const mem = Number(editMemoryMb);
    const vcpu = Number(editCpuVcores);
    const internal = Number(editInternalPort);
    if (!Number.isFinite(mem) || mem < 32 || mem > 65536) {
      setMsg("Memória (MB) inválida.");
      return;
    }
    if (!Number.isFinite(vcpu) || vcpu < 0.05 || vcpu > 32) {
      setMsg("CPU (vCPU) inválida.");
      return;
    }
    if (!Number.isFinite(internal) || internal < 1 || internal > 65535 || !Number.isInteger(internal)) {
      setMsg("Porta interna inválida (1–65535).");
      return;
    }
    const cpuMillicores = Math.round(vcpu * 1000);
    const traefikHostsNext = editTraefikCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const managed = !!(rw.publicHostname?.trim() && rw.slug?.trim());

    const patch: Parameters<typeof patchComputeInstance>[1] = {};
    if (editName.trim() !== rw.name) patch.name = editName.trim();
    if (editImage.trim() !== rw.dockerImage) patch.dockerImage = editImage.trim();
    if (mem !== rw.memoryMb) patch.memoryMb = Math.round(mem);
    if (cpuMillicores !== rw.cpuMillicores) patch.cpuMillicores = cpuMillicores;
    if (internal !== (rw.internalContainerPort ?? 80)) patch.internalPort = internal;
    if (!managed && !hostsEqual(traefikHostsNext, rw.traefikHosts ?? [])) {
      patch.traefikHosts = traefikHostsNext;
    }

    if (Object.keys(patch).length === 0) {
      setMsg("Sem alterações para aplicar.");
      return;
    }

    setBusy(true);
    setMsg(null);
    setJobLogLines([]);
    try {
      const { jobId } = await patchComputeInstance(bindingId, patch);
      setAwaitJobId(jobId);
      setJobLogLines(["À espera do agente (reconfiguração em curso)…"]);
      await onRefresh();
    } catch (e) {
      setMsg(e instanceof ApiClientError ? e.message : t.modalError!);
    } finally {
      setBusy(false);
    }
  }, [
    bindingId,
    rw,
    canManage,
    editName,
    editImage,
    editMemoryMb,
    editCpuVcores,
    editInternalPort,
    editTraefikCsv,
    onRefresh,
    t,
  ]);

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

  const managed = !!(rw.publicHostname?.trim() && rw.slug?.trim());
  const blocked =
    rw.status === "provisioning_requested" ||
    rw.status === "provisioning" ||
    rw.status === "reconfiguring" ||
    rw.status === "destroying";

  return (
    <div className="space-y-6">
      {managed ? (
        <div className="rounded-xl border border-cyan-200/60 bg-cyan-50/50 px-3 py-2.5 text-[12px] leading-snug text-cyan-950 ring-1 ring-cyan-100">
          <p className="font-semibold">Domínio do serviço</p>
          <p className="mt-1 font-mono text-[11px]">
            {rw.publicHostname ? (
              <>
                <span className="select-all">https://{rw.publicHostname}</span>
                {rw.slug ? (
                  <span className="mt-1 block text-[10px] font-sans text-cyan-900/80">slug: {rw.slug}</span>
                ) : null}
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 text-sm space-y-4">
        <p className={labelCls}>Editar e aplicar</p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          Ao guardar, o agente na VPS remove e recria o contentor na mesma porta local; há um breve downtime. Memória
          e CPU são limites do contentor.
        </p>

        <label className={labelCls}>
          Nome
          <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} disabled={blocked} />
        </label>

        <label className={labelCls}>
          Imagem Docker
          <input
            value={editImage}
            onChange={(e) => setEditImage(e.target.value)}
            className={cn(inputCls, "font-mono text-[12px]")}
            disabled={blocked}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            Memória (MB)
            <input
              type="number"
              min={32}
              max={65536}
              value={editMemoryMb}
              onChange={(e) => setEditMemoryMb(e.target.value)}
              className={cn(inputCls, "font-mono")}
              disabled={blocked}
            />
          </label>
          <label className={labelCls}>
            CPU (vCPU)
            <input
              type="number"
              step="0.05"
              min={0.05}
              max={32}
              value={editCpuVcores}
              onChange={(e) => setEditCpuVcores(e.target.value)}
              className={cn(inputCls, "font-mono")}
              disabled={blocked}
            />
          </label>
        </div>

        <label className={labelCls}>
          Porta interna do serviço
          <input
            type="number"
            min={1}
            max={65535}
            value={editInternalPort}
            onChange={(e) => setEditInternalPort(e.target.value)}
            className={cn(inputCls, "font-mono")}
            disabled={blocked}
          />
          <span className="mt-1 block text-[10px] text-[var(--text-muted)]">
            Porta em que a aplicação escuta dentro do contentor (ex.: 80 para nginx, 5000, 8080). O mapa para o exterior
            mantém-se em 127.0.0.1:{rw.hostBindPort ?? "…"}→porta interna.
          </span>
        </label>

        {!managed ? (
          <label className={labelCls}>
            Hosts Traefik (separados por vírgula)
            <input
              value={editTraefikCsv}
              onChange={(e) => setEditTraefikCsv(e.target.value)}
              className={cn(inputCls, "font-mono text-[12px]")}
              disabled={blocked}
            />
          </label>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)]">
            Hosts Traefik são fixos para instâncias geridas (ligadas ao domínio acima).
          </p>
        )}

        <button
          type="button"
          disabled={!canManage || busy || blocked || !!awaitJobId}
          onClick={() => void saveEdits()}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-50"
        >
          Guardar e reiniciar no agente
        </button>
      </div>

      {awaitJobId ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[#0f1115] p-3 font-mono text-[11px] leading-relaxed text-gray-100 max-h-48 overflow-y-auto">
          {jobLogLines.map((l, i) => (
            <div key={`${i}-${l.slice(0, 48)}`}>{l}</div>
          ))}
          <div ref={logEndRef} />
        </div>
      ) : null}

      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 text-sm">
        <p className={labelCls}>Estado na API</p>
        <p className="mt-1 text-[var(--text-primary)]">{rw.status}</p>
        {rw.hostBindPort != null ? (
          <p className={`${labelCls} mt-3`}>Porta no host (local)</p>
        ) : null}
        {rw.hostBindPort != null ? (
          <p className="mt-1 font-mono text-xs text-[var(--text-primary)]">{rw.hostBindPort}</p>
        ) : null}
      </div>

      {msg ? <p className="text-sm text-amber-800">{msg}</p> : null}

      <div className="border-t border-[var(--border-subtle)] pt-4">
        {!confirmDelete ? (
          <button
            type="button"
            disabled={!canManage || busy || !!awaitJobId}
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
