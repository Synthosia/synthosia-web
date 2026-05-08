import { infraMetricsStreamWebSocketUrl, type ConsoleInstanceLiveMetric } from "@/lib/synthosia-api";

export type InfraMetricsFleetSnapshot = {
  type: "fleetSnapshot";
  instances: Array<{ instanceId: string; snapshot: Record<string, unknown> }>;
};

export type InfraMetricsInstanceUpdate = {
  type: "instanceUpdate";
  instanceId: string;
  snapshot: Record<string, unknown>;
};

export type InfraMetricsStreamPush = InfraMetricsFleetSnapshot | InfraMetricsInstanceUpdate;

export type InfraMetricsWsStatus = "idle" | "connecting" | "live" | "error";

/** Converte o snapshot cloud (`cloud_snapshot_json`) para a forma usada no dashboard / lista. */
export function snapshotToConsoleLiveMetric(
  instanceId: string,
  snapshot: Record<string, unknown>,
): ConsoleInstanceLiveMetric | null {
  const metrics = snapshot.metrics as { liveSample?: Record<string, unknown> } | undefined;
  const ls = metrics?.liveSample;
  if (!ls || typeof ls !== "object") return null;
  return {
    instanceId,
    recordedAt: String(ls.recordedAt ?? ""),
    cpuPercent: typeof ls.cpuPercent === "number" ? ls.cpuPercent : undefined,
    memoryPercent: typeof ls.memoryPercent === "number" ? ls.memoryPercent : undefined,
    networkInMbps: typeof ls.networkInMbps === "number" ? ls.networkInMbps : undefined,
    networkOutMbps: typeof ls.networkOutMbps === "number" ? ls.networkOutMbps : undefined,
    httpProbe: ls.httpProbe,
    container: ls.container,
  };
}

type FleetCb = (msg: InfraMetricsStreamPush) => void;
type InstanceCb = (msg: InfraMetricsInstanceUpdate) => void;

/**
 * Um WebSocket por sessão: `subscribe` frota (lista + gráficos agregados na UI) ou instância (detalhe).
 * Push via MetricHub na API; HTTP fica para reload / séries / http-access.
 */
class InfraMetricsStreamClient {
  private ws: WebSocket | null = null;
  private fleetRefCount = 0;
  private instanceRefCounts = new Map<string, number>();
  private fleetCallbacks = new Set<FleetCb>();
  private instanceCallbacks = new Map<string, Set<InstanceCb>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectAttempt = 0;
  private statusListeners = new Set<(s: InfraMetricsWsStatus) => void>();
  private pingTimer: ReturnType<typeof setInterval> | undefined;

  private emitStatus(s: InfraMetricsWsStatus) {
    for (const l of this.statusListeners) l(s);
  }

  subscribeStatus(cb: (s: InfraMetricsWsStatus) => void): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private stopPing() {
    if (this.pingTimer !== undefined) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25_000);
  }

  private resyncSubscriptions() {
    const w = this.ws;
    if (!w || w.readyState !== WebSocket.OPEN) return;
    if (this.fleetRefCount > 0) {
      w.send(JSON.stringify({ type: "subscribe", channel: "fleet" }));
    }
    for (const [instanceId, n] of this.instanceRefCounts) {
      if (n > 0) {
        w.send(JSON.stringify({ type: "subscribe", channel: "instance", instanceId }));
      }
    }
  }

  private ensureConnected() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    if (this.fleetRefCount <= 0 && this.instanceRefCounts.size === 0) return;

    this.emitStatus("connecting");
    const url = infraMetricsStreamWebSocketUrl();
    try {
      this.ws = new WebSocket(url);
    } catch {
      this.emitStatus("error");
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.emitStatus("live");
      this.resyncSubscriptions();
      this.startPing();
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data)) as Record<string, unknown>;
        const t = msg.type;
        if (t === "fleetSnapshot") {
          const fs = msg as unknown as InfraMetricsFleetSnapshot;
          for (const cb of this.fleetCallbacks) cb(fs);
        } else if (t === "instanceUpdate") {
          const iu = msg as unknown as InfraMetricsInstanceUpdate;
          const set = this.instanceCallbacks.get(iu.instanceId);
          if (set) {
            for (const cb of set) cb(iu);
          }
          for (const cb of this.fleetCallbacks) cb(iu);
        }
      } catch {
        /* ignore */
      }
    };

    this.ws.onerror = () => this.emitStatus("error");

    this.ws.onclose = () => {
      this.stopPing();
      this.emitStatus("error");
      this.ws = null;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.fleetRefCount <= 0 && this.instanceRefCounts.size === 0) return;
    if (this.reconnectTimer !== undefined) return;
    const attempt = this.reconnectAttempt;
    const delay = Math.min(30_000, 1200 * 2 ** attempt);
    this.reconnectAttempt = Math.min(attempt + 1, 8);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.ensureConnected();
    }, delay);
  }

  private maybeDisconnect() {
    if (this.fleetRefCount > 0) return;
    if (this.instanceRefCounts.size > 0) return;
    this.stopPing();
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempt = 0;
    this.ws?.close();
    this.ws = null;
    this.emitStatus("idle");
  }

  subscribeFleet(cb: FleetCb): () => void {
    this.fleetCallbacks.add(cb);
    this.fleetRefCount++;
    this.ensureConnected();
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", channel: "fleet" }));
    }

    const onVis = () => {
      if (document.visibilityState === "visible") {
        this.reconnectAttempt = 0;
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.ensureConnected();
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      this.fleetCallbacks.delete(cb);
      this.fleetRefCount = Math.max(0, this.fleetRefCount - 1);
      if (this.fleetRefCount === 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "unsubscribe", channel: "fleet" }));
      }
      this.maybeDisconnect();
    };
  }

  subscribeInstance(instanceId: string, cb: InstanceCb): () => void {
    let set = this.instanceCallbacks.get(instanceId);
    if (!set) {
      set = new Set();
      this.instanceCallbacks.set(instanceId, set);
    }
    set.add(cb);
    const next = (this.instanceRefCounts.get(instanceId) ?? 0) + 1;
    this.instanceRefCounts.set(instanceId, next);

    this.ensureConnected();
    if (next === 1 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "subscribe", channel: "instance", instanceId }));
    }

    const onVis = () => {
      if (document.visibilityState === "visible") {
        this.reconnectAttempt = 0;
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.ensureConnected();
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      const s = this.instanceCallbacks.get(instanceId);
      if (!s) {
        this.maybeDisconnect();
        return;
      }
      s.delete(cb);
      const left = (this.instanceRefCounts.get(instanceId) ?? 1) - 1;
      if (left <= 0) {
        this.instanceCallbacks.delete(instanceId);
        this.instanceRefCounts.delete(instanceId);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "unsubscribe", channel: "instance", instanceId }));
        }
      } else {
        this.instanceRefCounts.set(instanceId, left);
      }
      this.maybeDisconnect();
    };
  }
}

export const infraMetricsStream = new InfraMetricsStreamClient();
