"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { type AccountSession } from "@/lib/account-session";
import { type ConsoleAlert, type ConsoleDashboard } from "@/lib/synthosia-api";
import { 
  ProjectIcon, 
  IntegrationIcon, 
  KeyIcon, 
  TerminalIcon,
  RefreshCwIcon,
  CloudIcon,
} from "@/components/auth-icons";

type DatabaseRow = {
  id: string;
  name: string;
  engine: "postgres" | "mongodb" | "mysql" | "redis" | "elasticsearch";
  version: string;
  region: string;
  size: string;
  healthy: boolean;
  cpu: number;
  memory: number;
  storage: number;
  connections: number;
  uptime: string;
};

const DEMO_DATABASES: DatabaseRow[] = [
  {
    id: "db-prod-main",
    name: "production-main",
    engine: "postgres",
    version: "18.0",
    region: "eu-west-1",
    size: "db.r6i.xlarge",
    healthy: true,
    cpu: 35,
    memory: 72,
    storage: 68,
    connections: 247,
    uptime: "99.97%",
  },
  {
    id: "db-prod-cache",
    name: "cache-layer",
    engine: "redis",
    version: "7.2",
    region: "eu-west-1",
    size: "cache.t3.medium",
    healthy: true,
    cpu: 18,
    memory: 42,
    storage: 15,
    connections: 1240,
    uptime: "99.99%",
  },
  {
    id: "db-prod-analytics",
    name: "analytics-cluster",
    engine: "mongodb",
    version: "7.0",
    region: "us-east-1",
    size: "cluster.m30",
    healthy: true,
    cpu: 52,
    memory: 81,
    storage: 85,
    connections: 89,
    uptime: "99.95%",
  },
  {
    id: "db-staging-test",
    name: "staging-test",
    engine: "postgres",
    version: "16.0",
    region: "eu-west-1",
    size: "db.t3.medium",
    healthy: true,
    cpu: 14,
    memory: 28,
    storage: 22,
    connections: 45,
    uptime: "98.5%",
  },
  {
    id: "db-search",
    name: "search-engine",
    engine: "elasticsearch",
    version: "8.11",
    region: "eu-central-1",
    size: "m5.2xlarge",
    healthy: false,
    cpu: 78,
    memory: 91,
    storage: 92,
    connections: 156,
    uptime: "97.2%",
  },
];

const DATABASE_ENGINES: Record<string, { color: string }> = {
  postgres: { color: "bg-blue-100 text-blue-700" },
  mongodb: { color: "bg-green-100 text-green-700" },
  mysql: { color: "bg-orange-100 text-orange-700" },
  redis: { color: "bg-red-100 text-red-700" },
  elasticsearch: { color: "bg-yellow-100 text-yellow-700" },
};

function barColor(pct: number): string {
  if (pct < 60) return "bg-emerald-500";
  if (pct < 85) return "bg-amber-500";
  return "bg-red-500";
}

export function DatabaseMonitoringDashboard({
  session,
  dashboard,
}: {
  session: AccountSession;
  dashboard: ConsoleDashboard | null;
}) {
  const { dictionary } = useLanguage();
  const [selectedDb, setSelectedDb] = useState<DatabaseRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDbEngine, setNewDbEngine] = useState<string>("postgres");
  const [newDbName, setNewDbName] = useState("");
  const [newDbVersion, setNewDbVersion] = useState("18.0");
  const [newDbSize, setNewDbSize] = useState("db.t3.medium");
  const [newDbRegion, setNewDbRegion] = useState("eu-west-1");

  const engineVersions: Record<string, string[]> = {
    postgres: ["18.0", "17.0", "16.0", "15.0"],
    mongodb: ["7.0", "6.3", "6.0", "5.0"],
    mysql: ["8.4", "8.3", "8.0", "5.7"],
    redis: ["7.2", "7.0", "6.2", "6.0"],
    elasticsearch: ["8.11", "8.10", "8.0", "7.10"],
  };

  const instanceSizes = [
    { id: "db.t3.micro", label: "Micro (0.5GB RAM)" },
    { id: "db.t3.small", label: "Small (2GB RAM)" },
    { id: "db.t3.medium", label: "Medium (4GB RAM)" },
    { id: "db.r6i.large", label: "Large (16GB RAM)" },
    { id: "db.r6i.xlarge", label: "XLarge (32GB RAM)" },
  ];

  const regions = [
    { id: "eu-west-1", label: "EU - Ireland" },
    { id: "eu-central-1", label: "EU - Frankfurt" },
    { id: "us-east-1", label: "US - N. Virginia" },
    { id: "us-west-2", label: "US - Oregon" },
    { id: "ap-south-1", label: "Asia - Mumbai" },
  ];

  const dbMetrics = [
    { label: "Total Databases", value: DEMO_DATABASES.length, icon: ProjectIcon, color: "text-emerald-600" },
    { label: "Healthy", value: DEMO_DATABASES.filter(d => d.healthy).length, icon: IntegrationIcon, color: "text-blue-600" },
    { label: "Avg Storage", value: "292 GB", icon: KeyIcon, color: "text-purple-600" },
    { label: "Total Connections", value: "1,777", icon: TerminalIcon, color: "text-orange-600" },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.section
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 w-full"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <p className="font-sans text-xs font-medium uppercase tracking-wide text-gray-500">Databases</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">
          Database Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and manage all your database instances across regions
        </p>
      </motion.section>

      {/* Metrics Cards */}
      <motion.section
        className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {dbMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{metric.label}</p>
                <p className={`mt-3 text-3xl font-bold tabular-nums ${metric.color}`}>{metric.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color.replace('text-', 'bg-').replace('600', '100')} ${metric.color}`}>
                <metric.icon className="size-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Create New Database Button */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <CloudIcon className="size-4" />
          Create Database
        </button>
      </motion.div>

      {/* Create Database Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Database Instance</h2>
              <p className="mt-1 text-sm text-gray-600">Configure your new database with advanced options</p>
            </div>

            <div className="space-y-6 p-6">
              {/* Database Name & Engine Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instance Name</label>
                  <input
                    type="text"
                    value={newDbName}
                    onChange={(e) => setNewDbName(e.target.value)}
                    placeholder="e.g., production-main"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database Engine</label>
                  <select
                    value={newDbEngine}
                    onChange={(e) => {
                      setNewDbEngine(e.target.value);
                      setNewDbVersion(engineVersions[e.target.value]?.[0] || "");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.keys(DATABASE_ENGINES).map((engine) => (
                      <option key={engine} value={engine} className="capitalize">
                        {engine.charAt(0).toUpperCase() + engine.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Version & Size Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Engine Version</label>
                  <select
                    value={newDbVersion}
                    onChange={(e) => setNewDbVersion(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {(engineVersions[newDbEngine] || []).map((version) => (
                      <option key={version} value={version}>
                        v{version}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instance Type</label>
                  <select
                    value={newDbSize}
                    onChange={(e) => setNewDbSize(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {instanceSizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Deployment Region</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setNewDbRegion(region.id)}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all text-left",
                        newDbRegion === region.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <p className="font-medium">{region.label}</p>
                      <p className="text-xs opacity-75">{region.id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Configuration Summary</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instance:</span>
                    <span className="font-mono font-medium text-gray-900">{newDbName || "not-set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Engine:</span>
                    <span className="font-mono font-medium text-gray-900">{newDbEngine}@{newDbVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-mono font-medium text-gray-900">{newDbSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-mono font-medium text-gray-900">{newDbRegion}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 flex gap-3 bg-gray-50 p-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle create
                  setShowCreateModal(false);
                  setNewDbName("");
                }}
                disabled={!newDbName}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Instance
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Databases List - Full Width */}
      <motion.section
        className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <div className="border-b border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Databases</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">Monitor and manage your database instances</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">Database</th>
                <th className="px-6 py-3 font-medium">Engine</th>
                <th className="px-6 py-3 font-medium">Region</th>
                <th className="px-6 py-3 font-medium">CPU</th>
                <th className="px-6 py-3 font-medium">Memory</th>
                <th className="px-6 py-3 font-medium">Storage</th>
                <th className="px-6 py-3 font-medium">Connections</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DEMO_DATABASES.map((db) => (
                <motion.tr
                  key={db.id}
                  onClick={() => setSelectedDb(db)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{db.name}</p>
                      <p className="text-xs text-gray-500">{db.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${DATABASE_ENGINES[db.engine]?.color}`}>
                      {db.engine}@{db.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{db.region}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${barColor(db.cpu)}`}
                          style={{ width: `${db.cpu}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{db.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${barColor(db.memory)}`}
                          style={{ width: `${db.memory}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{db.memory}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${barColor(db.storage)}`}
                          style={{ width: `${db.storage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{db.storage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{db.connections}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      db.healthy
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${db.healthy ? "bg-emerald-500" : "bg-red-500"}`} />
                      {db.healthy ? "Healthy" : "Warning"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Database Details Panel */}
      {selectedDb && (
        <motion.section
          className="w-full rounded-lg border border-gray-200 bg-white shadow-sm"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Database Details</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">{selectedDb.name}</h2>
              </div>
              <button
                onClick={() => setSelectedDb(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engine</p>
              <p className="mt-2 text-sm font-semibold text-gray-900 capitalize">{selectedDb.engine}</p>
              <p className="text-xs text-gray-600">Version {selectedDb.version}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instance Type</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{selectedDb.size}</p>
              <p className="text-xs text-gray-600">{selectedDb.region}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uptime</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{selectedDb.uptime}</p>
              <p className="text-xs text-gray-600">Last 30 days</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connections</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{selectedDb.connections}</p>
              <p className="text-xs text-gray-600">Active now</p>
            </div>
          </div>

          <div className="border-t border-gray-200 grid gap-4 p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CPU Usage</p>
              <div className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${barColor(selectedDb.cpu)}`}
                      style={{ width: `${selectedDb.cpu}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">{selectedDb.cpu}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Memory Usage</p>
              <div className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${barColor(selectedDb.memory)}`}
                      style={{ width: `${selectedDb.memory}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">{selectedDb.memory}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Storage Usage</p>
              <div className="mt-2 flex items-end gap-2">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${barColor(selectedDb.storage)}`}
                      style={{ width: `${selectedDb.storage}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 tabular-nums">{selectedDb.storage}%</p>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
