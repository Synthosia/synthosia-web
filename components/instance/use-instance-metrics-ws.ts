"use client";

import { useEffect, useRef, useState } from "react";
import { computeInstanceMetricsWebSocketUrl } from "@/lib/synthosia-api";

export type MetricsWsStatus = "idle" | "connecting" | "live" | "error";

/**
 * WebSocket `/metrics-ws`: envia o mesmo payload que o evento SSE `snapshot` sempre que há nova amostra na BD
 * (push via MetricHub após `metrics-batch`) ou a cada ~25 s (keep-alive).
 */
export function useInstanceMetricsWebSocket(
  bindingId: string | undefined,
  onSnapshot: (payload: Record<string, unknown>) => void,
) {
  const [status, setStatus] = useState<MetricsWsStatus>("idle");
  const reconnectAttempt = useRef(0);
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    if (!bindingId) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const url = computeInstanceMetricsWebSocketUrl(bindingId);
      setStatus((s) => (s === "idle" ? "connecting" : s));
      try {
        ws = new WebSocket(url);
      } catch {
        setStatus("error");
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        if (cancelled) return;
        reconnectAttempt.current = 0;
        setStatus("live");
      };

      ws.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const payload = JSON.parse(String(ev.data)) as Record<string, unknown>;
          onSnapshotRef.current(payload);
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        if (!cancelled) setStatus("error");
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("error");
        scheduleReconnect();
      };
    };

    function scheduleReconnect() {
      if (cancelled) return;
      const attempt = reconnectAttempt.current;
      const delay = Math.min(30_000, 1200 * 2 ** attempt);
      reconnectAttempt.current = Math.min(attempt + 1, 8);
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = undefined;
        connect();
      }, delay);
    }

    connect();

    const onVis = () => {
      if (document.visibilityState === "visible" && (!ws || ws.readyState === WebSocket.CLOSED)) {
        reconnectAttempt.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [bindingId]);

  return { status };
}
