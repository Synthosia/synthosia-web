"use client";

/** Métricas por instância: placeholder até o agente reportar séries à API. */
export function useCloudInstanceMetrics(_bindingId: string | undefined, _hours: number) {
  return { data: null, loading: false, error: false };
}
