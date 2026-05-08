"use client";

import { useEffect, useState } from "react";
import { getComputeInstanceMetricsLatest, type ComputeInstanceMetricsLatest } from "@/lib/synthosia-api";

/** Última linha na BD (`GET .../metrics-latest`), atualizada por polling (complementa SSE). */
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
    const id = window.setInterval(tick, pollMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [bindingId, pollMs]);

  return { data, loading };
}
