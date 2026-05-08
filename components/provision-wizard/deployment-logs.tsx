"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type LogLevel = "info" | "success" | "warn" | "error" | "plain";

export function classifyLogLine(raw: string): { level: LogLevel; text: string } {
  const t = raw.trim();
  const upper = t.toUpperCase();
  if (upper.includes("[SUCCESS]") || upper.includes("SUCCESS")) return { level: "success", text: t };
  if (upper.includes("[ERROR]") || upper.includes("FAILED")) return { level: "error", text: t };
  if (upper.includes("[WARN]")) return { level: "warn", text: t };
  if (upper.includes("[INFO]")) return { level: "info", text: t };
  return { level: "plain", text: t };
}

export function DeploymentLogs({ lines }: { lines: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="max-h-[min(52vh,420px)] overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[#07080c] p-3 font-mono text-[11px] leading-relaxed shadow-inner">
      {lines.length === 0 ? (
        <p className="text-zinc-500">…</p>
      ) : (
        lines.map((line, i) => {
          const { level, text } = classifyLogLine(line);
          const color =
            level === "success"
              ? "text-emerald-400"
              : level === "error"
                ? "text-rose-400"
                : level === "warn"
                  ? "text-amber-400"
                  : level === "info"
                    ? "text-sky-400"
                    : "text-zinc-300";
          return (
            <div key={`${i}-${text.slice(0, 24)}`} className={cn("break-words", color)}>
              {text}
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
