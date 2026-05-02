import { limitsProvisionedNumeric } from "@/lib/cloud-service-limits";

type MetricSeriesResponse = {
  series: { measurement: string; points: { ts: number; value: number }[] }[];
};

/** Extrai séries normalizadas para sparklines e gráficos (última janela da API). */
export function extractMetricSeries(res: MetricSeriesResponse | null | undefined): {
  cpuPct: number[];
  memPct: number[];
  netMbps: number[];
} {
  if (!res?.series?.length) {
    return { cpuPct: [], memPct: [], netMbps: [] };
  }
  let cpuPct: number[] = [];
  let memPct: number[] = [];
  let netMbps: number[] = [];
  for (const series of res.series) {
    const u = series.measurement.toUpperCase();
    const vals = series.points.map((p) => p.value);
    if (u.includes("CPU")) {
      cpuPct = vals.map((v) => Math.round(Math.min(100, v <= 1 && v >= 0 ? v * 100 : v)));
    } else if (u.includes("MEMORY")) {
      memPct = vals.map((v) => Math.round(Math.min(100, v <= 100 ? v : (v / 8) * 100)));
    } else if (u.includes("NETWORK") || u.includes("EGRESS") || u.includes("TRAFFIC")) {
      netMbps = vals;
    }
  }
  if (netMbps.length === 0 && cpuPct.length > 0) {
    netMbps = cpuPct.map((c) => Math.max(0, (c / 100) * 3));
  }
  return { cpuPct, memPct, netMbps };
}

export function lastOrZero(arr: number[]): number {
  return arr.length ? arr[arr.length - 1]! : 0;
}

export function smoothSparklinePath(values: number[], w: number, h: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return [x, y] as const;
  });
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[i + 1]!;
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

/** Linha poligonal — evita “sinos” artificiais com poucos pontos da API. */
export function linearMetricPath(values: number[], w: number, h: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

/** Usa curva só com série longa; caso contrário linha recta entre pontos. */
export function chartPathForSeries(values: number[], w: number, h: number): string {
  if (values.length < 2) return "";
  return values.length >= 8 ? smoothSparklinePath(values, w, h) : linearMetricPath(values, w, h);
}

export function parseLimits(limits: unknown): { memoryGb?: number; vcpus?: number } {
  return limitsProvisionedNumeric(limits);
}
