"use client";

import React from "react";
import { Globe, ShieldAlert, Activity, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mapData = () => {
  const data = [];
  let reqs = 1500;
  let blocked = 10;
  for (let i = 0; i < 24; i++) {
    reqs = reqs + (Math.random() - 0.4) * 400;
    blocked = Math.max(0, blocked + (Math.random() - 0.5) * 15);
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      requests: Math.floor(reqs),
      blocked: Math.floor(blocked)
    });
  }
  return data;
};

export default function NetworkPage() {
  const data = React.useMemo(() => mapData(), []);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Network & Edge
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Global traffic routing, DNS, and Web Application Firewall.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="h-8 px-3 rounded bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[12px] focus:outline-none text-[var(--text-secondary)] font-medium appearance-none">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Edge Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-panel p-4">
          <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Total Requests</div>
          <div className="text-2xl font-display font-semibold mt-2">42.5M</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--success)] font-medium">
            <ArrowUpRight className="w-3 h-3" /> 12% vs previous
          </div>
        </div>
        <div className="surface-panel p-4">
          <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Bandwidth Served</div>
          <div className="text-2xl font-display font-semibold mt-2">1.8 TB</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--success)] font-medium">
            <ArrowUpRight className="w-3 h-3" /> 5% vs previous
          </div>
        </div>
        <div className="surface-panel p-4">
          <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Threats Blocked</div>
          <div className="text-2xl font-display font-semibold mt-2 text-[var(--warning)]">14.2k</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--error)] font-medium">
            <ArrowUpRight className="w-3 h-3" /> 24% vs previous
          </div>
        </div>
        <div className="surface-panel p-4">
          <div className="text-[11px] text-[var(--text-muted)] font-mono uppercase tracking-wider mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Cache Hit Ratio</div>
          <div className="text-2xl font-display font-semibold mt-2">86.4%</div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--success)] font-medium">
            <ArrowUpRight className="w-3 h-3" /> 2.1% vs previous
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="surface-panel p-5 h-[400px] flex flex-col">
        <h3 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-6">Traffic Analysis</h3>
        <div className="flex-1 w-full h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }} dx={-10} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface-panel)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}
                labelStyle={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="requests" name="Total Requests" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorReqs)" />
              <Area type="monotone" dataKey="blocked" name="Blocked (WAF)" stroke="var(--warning)" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="font-display font-medium text-[14px]">Top Geographies</h3>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {[
              { country: "United States", reqs: "18.2M", percent: 42 },
              { country: "Germany", reqs: "8.4M", percent: 20 },
              { country: "Brazil", reqs: "5.1M", percent: 12 },
              { country: "United Kingdom", reqs: "3.8M", percent: 9 },
              { country: "Japan", reqs: "2.1M", percent: 5 },
            ].map((geo, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--surface-interactive)] transition-colors">
                <div className="text-[13px] font-medium">{geo.country}</div>
                <div className="flex items-center gap-4 w-1/2">
                  <div className="flex-1 h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${geo.percent}%` }} />
                  </div>
                  <div className="w-16 text-right text-[12px] font-mono text-[var(--text-secondary)]">{geo.reqs}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
            <h3 className="font-display font-medium text-[14px]">Recent Firewall Events</h3>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {[
              { rule: "SQL Injection Block", ip: "45.22.12.8", action: "Block", time: "2 min ago" },
              { rule: "Rate Limit Exceeded", ip: "189.12.44.2", action: "Challenge", time: "14 min ago" },
              { rule: "Bot Management", ip: "104.22.1.99", action: "Block", time: "1 hour ago" },
              { rule: "Country Block (RU)", ip: "89.44.12.1", action: "Block", time: "3 hours ago" },
              { rule: "Bad User Agent", ip: "12.44.2.1", action: "Block", time: "5 hours ago" },
            ].map((event, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--surface-interactive)] transition-colors">
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">{event.rule}</div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">{event.ip}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider",
                    event.action === 'Block' ? "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20" : "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20"
                  )}>
                    {event.action}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] w-16 text-right">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
