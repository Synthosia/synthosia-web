"use client";

import { useEffect, useState } from "react";
import { infraMetricsStream } from "@/lib/infra-metrics-stream";
import { getComputeInstanceMetricsLatest, type ComputeInstanceMetricsLatest } from "@/lib/synthosia-api";

function mergeLatestFromSnapshot(
  prev: ComputeInstanceMetricsLatest | null,
  snapshot: Record<string, unknown>,
): ComputeInstanceMetricsLatest {
  const metrics = snapshot.metrics as { liveSample?: Record<string, unknown> } | undefined;
  const ls = metrics?.liveSample;
  if (!ls || typeof ls !== "object") {
    return prev ?? { recordedAt: null, extras: {} };
  }
  const extras = { ...(prev?.extras ?? {}) };
  if (ls.httpProbe !== undefined) extras.httpProbe = ls.httpProbe;
  if (ls.container !== undefined) extras.container = ls.container;
  return {
    recordedAt: ls.recordedAt != null ? String(ls.recordedAt) : (prev?.recordedAt ?? null),
    cpuPercent: typeof ls.cpuPercent === "number" ? ls.cpuPercent : prev?.cpuPercent,
    memoryPercent: typeof ls.memoryPercent === "number" ? ls.memoryPercent : prev?.memoryPercent,
    networkInMbps: typeof ls.networkInMbps === "number" ? ls.networkInMbps : prev?.networkInMbps,
    networkOutMbps: typeof ls.networkOutMbps === "number" ? ls.networkOutMbps : prev?.networkOutMbps,
    extras,
  };
}

/**
 * Última amostra na BD: `GET .../metrics-latest` no mount e opcionalmente polling.
 * Com `pollMs === 0`, só HTTP inicial + atualizações do stream infra (subscribe instance).
 */
export function useCloudInstanceMetricsLatest(bindingId: string | undefined, pollMs: number) {
  const [data, setData] = useState<ComputeInstanceMetricsLatest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bindingId) {
      setData(null);
      return;
    }
    let cancelled = false;
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      setLoading(true);
      void getComputeInstanceMetricsLatest(bindingId)
        .then((res) => {
          if (!cancelled) setData(res);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    tick();
    let intervalId: number | undefined;
    if (pollMs > 0) {
      intervalId = window.setInterval(tick, pollMs);
      document.addEventListener("visibilitychange", tick);
    }

    const unsubStream =
      pollMs <= 0
        ? infraMetricsStream.subscribeInstance(bindingId, (msg) => {
            if (cancelled) return;
            setData((prev) => mergeLatestFromSnapshot(prev, msg.snapshot));
          })
        : () => {};

    return () => {
      cancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", tick);
      unsubStream();
    };
  }, [bindingId, pollMs]);

  return { data, loading };
}
