"use client";

import type { MetricSeriesResponse } from "@/components/instance/cloud-metrics";

/** Métricas por instância: placeholder até o agente reportar séries à API. */
export function useCloudInstanceMetrics(
  _bindingId: string | undefined,
  _hours: number,
): { data: MetricSeriesResponse | null; loading: boolean; error: boolean } {
  return { data: null, loading: false, error: false };
}
