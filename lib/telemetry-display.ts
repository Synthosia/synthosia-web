/** Resumo legível de `extras.httpProbe` (agente → API). */

export function formatHttpProbeSummary(probe: unknown): string | undefined {
  if (probe == null || typeof probe !== "object") return undefined;
  const o = probe as Record<string, unknown>;
  const method = typeof o.method === "string" ? o.method : "";
  const status = typeof o.httpStatus === "number" ? o.httpStatus : undefined;
  const t = typeof o.timeTotalSecs === "number" ? o.timeTotalSecs : undefined;
  const tcp = o.tcpReachable;
  const url = typeof o.url === "string" ? o.url : "";

  if (status != null) {
    const ms = t != null ? ` · ${Math.round(t * 1000)} ms` : "";
    return `HTTP ${status}${ms}`;
  }
  if (tcp === true) return "TCP local OK";
  if (tcp === false) return "TCP local indisponível";
  if (method === "unsupported_platform") return "—";
  if (url) return `Probe ${url}`;
  return undefined;
}

/** `extras.container.memUsage` */
export function formatContainerMem(container: unknown): string | undefined {
  if (container == null || typeof container !== "object") return undefined;
  const m = (container as Record<string, unknown>).memUsage;
  return typeof m === "string" && m.trim() ? m.trim() : undefined;
}
