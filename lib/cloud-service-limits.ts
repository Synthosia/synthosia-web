/**
 * Normaliza o JSON `limits` devolvido pela API (DTO aninhado / limites de instância)
 * para edição em GB / vCPU e para cartões de métricas.
 */

const GB = 1024 ** 3;

function isLikelyMemoryBytes(n: number, keyLower: string): boolean {
  if (keyLower.includes("byte")) return true;
  if (keyLower.includes("memory") && !keyLower.includes("gb") && n >= 64 * 1024 * 1024) return true;
  return false;
}

/** Valores em string para inputs do formulário (memória sempre em GB legível). */
export function limitsFormStrings(limits: unknown): { memoryGb: string; vcpus: string } {
  let memoryGb = "";
  let vcpus = "";

  const walk = (x: unknown): void => {
    if (x == null) return;
    if (typeof x === "number" || typeof x === "string") return;
    if (Array.isArray(x)) {
      x.forEach(walk);
      return;
    }
    if (typeof x !== "object") return;

    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      const kl = k.toLowerCase();
      if (typeof v === "number") {
        if (!memoryGb && (kl.includes("memory") || kl === "mem" || kl.includes("ram"))) {
          memoryGb = isLikelyMemoryBytes(v, kl) ? (v / GB).toFixed(2) : String(v);
        }
        if (!vcpus && (kl.includes("vcpu") || kl === "cpu" || kl.includes("cpus"))) {
          vcpus = String(v);
        }
      } else {
        walk(v);
      }
    }
  };

  walk(limits);
  return { memoryGb, vcpus };
}

/** Números para cartão “Capacidade” / resumo. */
export function limitsProvisionedNumeric(limits: unknown): { memoryGb?: number; vcpus?: number } {
  const s = limitsFormStrings(limits);
  const memoryGb = s.memoryGb.trim() ? Number(s.memoryGb) : undefined;
  const vcpus = s.vcpus.trim() ? Number(s.vcpus) : undefined;
  return {
    memoryGb: memoryGb != null && !Number.isNaN(memoryGb) ? memoryGb : undefined,
    vcpus: vcpus != null && !Number.isNaN(vcpus) ? vcpus : undefined,
  };
}
