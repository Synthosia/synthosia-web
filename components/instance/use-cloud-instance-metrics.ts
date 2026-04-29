"use client";

import { useEffect, useState } from "react";
import { type CloudMetricsResponse, getCloudServiceMetrics } from "@/lib/synthosia-api";

export function useCloudInstanceMetrics(bindingId: string | undefined, hours: number) {
  const [data, setData] = useState<CloudMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bindingId) {
      setData(null);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    void getCloudServiceMetrics(bindingId, hours)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setError(true);
        }
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
