"use client";

import React from "react";
import { Plus, Search, Database, HardDrive, Zap, Network, ShieldCheck, MoreVertical, Terminal } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DatabasesPage() {
  const databases = [
    { id: "db_1", name: "prod-postgres-main", engine: "PostgreSQL 15", status: "healthy", region: "eu-central", size: "45.2 GB", connections: 142, replicas: 2 },
    { id: "db_2", name: "redis-cache-tier", engine: "Redis 7.0", status: "healthy", region: "eu-central", size: "2.1 GB", connections: 845, replicas: 1 },
    { id: "db_3", name: "analytics-warehouse", engine: "ClickHouse", status: "syncing", region: "us-east", size: "450.8 GB", connections: 12, replicas: 0 },
    { id: "db_4", name: "staging-db", engine: "MySQL 8.0", status: "degraded", region: "us-west", size: "12.4 GB", connections: 45, replicas: 0 },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Databases
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Managed database clusters, replicas, and connection pooling.
          </p>
        </div>
        <button className="h-8 px-3 text-[13px] font-medium rounded-md bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--accent-hover)] transition-all flex items-center gap-1.5 shadow-premium">
          <Plus className="w-3.5 h-3.5" />
          Create Cluster
        </button>
      </div>

      {/* Grid of Database Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {databases.map((db) => (
          <div key={db.id} className="surface-panel p-5 relative group hover:border-[var(--border-medium)] transition-colors">
            <div className="flex justify-between items-start mb-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-interactive)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 shadow-sm">
                  <Database className={cn("w-5 h-5", db.engine.includes('Redis') ? "text-red-500" : "text-blue-500")} />
                </div>
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">{db.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-[var(--text-secondary)] font-mono">{db.engine}</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border-medium)]" />
                    <span className="text-[12px] text-[var(--text-muted)] font-mono">{db.region}</span>
                  </div>
                </div>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium capitalize flex items-center gap-1.5",
                db.status === 'healthy' ? "text-[var(--success)] bg-[var(--success)]/10" :
                db.status === 'syncing' ? "text-blue-500 bg-blue-500/10" :
                "text-[var(--warning)] bg-[var(--warning)]/10"
              )}>
                {db.status === 'healthy' && <ShieldCheck className="w-3 h-3" />}
                {db.status === 'syncing' && <Zap className="w-3 h-3" />}
                {db.status === 'degraded' && <Zap className="w-3 h-3" />}
                {db.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-[var(--surface-raised)]/50 border border-[var(--border-subtle)]">
              <div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Size
                </div>
                <div className="text-[13px] font-medium text-[var(--text-primary)] font-mono">{db.size}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Network className="w-3 h-3" /> Conns
                </div>
                <div className="text-[13px] font-medium text-[var(--text-primary)] font-mono">{db.connections} <span className="text-[var(--text-muted)] text-[10px]">active</span></div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Replicas
                </div>
                <div className="text-[13px] font-medium text-[var(--text-primary)] font-mono">{db.replicas} <span className="text-[var(--text-muted)] text-[10px]">nodes</span></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
              <div className="text-[12px] text-[var(--text-muted)] font-mono">
                {db.id}
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors">
                  Connect
                </button>
                <button className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded hover:bg-[var(--surface-raised)] transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
