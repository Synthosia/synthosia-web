"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { chartPathForSeries } from "@/components/instance/cloud-metrics";

const W = 120;
const H = 40;

export function InstanceMetricSparkline({
  values,
  stroke = "#1a73e8",
  className,
}: {
  values: number[];
  stroke?: string;
  className?: string;
}) {
  const gid = useId();
  const pts = values.length >= 2 ? values : values.length === 1 ? [values[0]!, values[0]!] : [0, 0];
  const line = chartPathForSeries(pts, W, H);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-10 w-full max-w-[7.5rem]", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {line ? (
        <>
          <path
            d={`${line} L ${W} ${H} L 0 ${H} Z`}
            fill={`url(#${gid}-g)`}
          />
          <path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#e5e7eb" strokeWidth="1" />
      )}
    </svg>
  );
}
