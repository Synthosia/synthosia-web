"use client";

import { useEffect, useRef, useState } from "react";
import { jobProvisioningEventsUrl } from "@/lib/synthosia-api";
import { DeploymentLogs } from "@/components/provision-wizard/deployment-logs";

export function LiveDeployConsole({
  jobId,
  labels,
  onSuccess,
  onFailure,
}: {
  jobId: string;
  labels: {
    title: string;
    subtitle: string;
    doneOk: string;
    doneFail: string;
  };
  onSuccess: () => void;
  onFailure: (message: string) => void;
}) {
  const [lines, setLines] = useState<string[]>([
    "[INFO] Enviado para a fila do agente…",
    "[INFO] A aguardar ligação em tempo real…",
  ]);
  const endedRef = useRef(false);

  useEffect(() => {
    endedRef.current = false;
    const url = jobProvisioningEventsUrl(jobId);
    const es = new EventSource(url, { withCredentials: true });
    const onLog = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data as string) as { message?: string };
        const line = d.message?.trim();
        if (line) setLines((prev) => [...prev, line]);
      } catch {
        /* ignore */
      }
    };
    const onDone = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data as string) as { status?: string; error?: string | null };
        endedRef.current = true;
        es.close();
        if (d.status === "succeeded") {
          setLines((prev) => [...prev, "[SUCCESS] Ambiente pronto."]);
          onSuccess();
        } else {
          const msg = d.error ?? labels.doneFail;
          setLines((prev) => [...prev, `[ERROR] ${msg}`]);
          onFailure(msg);
        }
      } catch {
        endedRef.current = true;
        es.close();
        onFailure(labels.doneFail);
      }
    };
    es.addEventListener("log", onLog as EventListener);
    es.addEventListener("done", onDone as EventListener);
    es.onerror = () => {
      if (endedRef.current) return;
      es.close();
      onFailure("Ligação em tempo real interrompida.");
    };
    return () => es.close();
  }, [jobId, labels.doneFail, onFailure, onSuccess]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{labels.title}</h3>
        <p className="text-xs text-[var(--text-muted)]">{labels.subtitle}</p>
      </div>
      <DeploymentLogs lines={lines} />
    </div>
  );
}
