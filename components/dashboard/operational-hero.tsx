import React from "react";
import { Server, Activity, Globe2, AlertCircle, ArrowUpRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface OperationalHeroProps {
  metrics?: {
    activeInstances: number;
    latency: number;
    reqPerMin: string;
    status: "healthy" | "degraded" | "down";
  };
  isLoading?: boolean;
}

export function OperationalHero({ metrics, isLoading }: OperationalHeroProps) {
  if (isLoading || !metrics) {
    return (
      <div className="w-full h-32 rounded-xl bg-[var(--surface-panel)] border border-[var(--border-subtle)] shadow-sm animate-pulse flex items-center p-6">
        <div className="h-4 w-32 bg-[var(--surface-raised)] rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-xl bg-[var(--surface-panel)] border border-[var(--border-subtle)] shadow-sm overflow-hidden relative"
    >
      {/* Top thin line representing status */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[var(--success)] shadow-[0_0_10px_rgba(31,138,101,0.5)]"></div>

      <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Section: Context */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--surface-interactive)] to-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Server className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--surface-panel)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-xl text-[var(--text-primary)] tracking-tight">Personal Workspace</h2>
              <span className="px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-[10px] font-mono font-medium uppercase tracking-wider border border-[var(--success)]/20 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-current" /> All Systems Operational
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5" /> US-East (N. Virginia) • <span className="text-[var(--text-primary)] font-medium">14 Active Resources</span>
            </p>
          </div>
        </div>

        {/* Right Section: Aggregated Metrics */}
        <div className="flex flex-wrap lg:flex-nowrap gap-8 lg:gap-12">
          <div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Requests / Min
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-display font-semibold text-2xl text-[var(--text-primary)]">{metrics.reqPerMin}</p>
              <span className="text-xs text-[var(--success)] flex items-center mb-1"><ArrowUpRight className="w-3 h-3" /> 12%</span>
            </div>
          </div>
          
          <div className="w-px h-10 bg-[var(--border-subtle)] hidden lg:block"></div>

          <div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Server className="w-3 h-3" /> P95 Latency
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-display font-semibold text-2xl text-[var(--text-primary)]">{metrics.latency}ms</p>
              <span className="text-xs text-[var(--text-secondary)] mb-1">Global Avg</span>
            </div>
          </div>

          <div className="w-px h-10 bg-[var(--border-subtle)] hidden lg:block"></div>

          <div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> Incidents
            </p>
            <div className="flex items-baseline gap-2">
              <p className="font-display font-semibold text-2xl text-[var(--text-primary)]">0</p>
              <span className="text-xs text-[var(--text-secondary)] mb-1">Last 30 days</span>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
