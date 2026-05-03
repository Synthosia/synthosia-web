"use client";

import { useEffect, useState } from "react";
import type { MetricSeriesResponse } from "@/components/instance/cloud-metrics";
import { getComputeInstanceMetricsSeries } from "@/lib/synthosia-api";

/** Métricas por instância: séries minuto-a-minuto na API (`metrics-series`). */
export function useCloudInstanceMetrics(
  bindingId: string | undefined,
  hours: number,
): { data: MetricSeriesResponse | null; loading: boolean; error: boolean } {
  const [data, setData] = useState<MetricSeriesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bindingId) {
      setData(null);
      setLoading(false);
      setError(false);
      return;
    }
    const minutes = Math.min(1440, Math.max(1, Math.round(hours * 60)));
    let cancelled = false;
    setLoading(true);
    setError(false);
    getComputeInstanceMetricsSeries(bindingId, minutes)
      .then((res) => {
        if (cancelled) return;
        const mapped: MetricSeriesResponse = {
          series: res.series.map((s) => ({
            measurement: s.measurement,
            points: s.points.map((p) => ({ ts: p.ts, value: p.value })),
          })),
          windowHours: res.windowHours,
        };
        setData(mapped);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bindingId, hours]);

  return { data, loading, error };
}
