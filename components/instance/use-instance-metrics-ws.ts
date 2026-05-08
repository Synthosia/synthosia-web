"use client";

import { useEffect, useRef, useState } from "react";
import { infraMetricsStream } from "@/lib/infra-metrics-stream";

export type MetricsWsStatus = "idle" | "connecting" | "live" | "error";

/**
 * Métricas por instância via `/v1/infrastructure/metrics-stream` (subscribe `instance`).
 * Mesmo payload JSON que o SSE `snapshot` / antigo `metrics-ws`.
 */
export function useInstanceMetricsWebSocket(
  bindingId: string | undefined,
  onSnapshot: (payload: Record<string, unknown>) => void,
) {
  const [status, setStatus] = useState<MetricsWsStatus>("idle");
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    if (!bindingId) {
      setStatus("idle");
      return;
    }

    const unsubStatus = infraMetricsStream.subscribeStatus(setStatus);
    const unsubInstance = infraMetricsStream.subscribeInstance(bindingId, (msg) => {
      setStatus("live");
      onSnapshotRef.current(msg.snapshot);
    });

    return () => {
      unsubInstance();
      unsubStatus();
      setStatus("idle");
    };
  }, [bindingId]);

  return { status };
}
