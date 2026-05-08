"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import type { EnvVarRow } from "@/lib/provision-wizard/schema";

function newRowId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function EnvEditor({
  rows,
  onChange,
  labels,
}: {
  rows: EnvVarRow[];
  onChange: (rows: EnvVarRow[]) => void;
  labels: {
    add: string;
    key: string;
    value: string;
    secret: string;
    remove: string;
    import: string;
    importPlaceholder: string;
    applyImport: string;
    presets: string;
  };
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const updateRow = useCallback(
    (id: string, patch: Partial<EnvVarRow>) => {
      onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [rows, onChange],
  );

  const removeRow = useCallback(
    (id: string) => {
      onChange(rows.filter((r) => r.id !== id));
    },
    [rows, onChange],
  );

  const addRow = useCallback(() => {
    onChange([
      ...rows,
      { id: newRowId(), key: "", value: "", secret: false },
    ]);
  }, [rows, onChange]);

  const applyImport = useCallback(() => {
    const lines = importText.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
    const parsed: EnvVarRow[] = [];
    for (const line of lines) {
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!key) continue;
      parsed.push({
        id: newRowId(),
        key,
        value,
        secret: /secret|password|token|key/i.test(key),
      });
    }
    if (parsed.length) onChange([...rows.filter((r) => r.key.trim()), ...parsed]);
    setImportText("");
    setImportOpen(false);
  }, [importText, rows, onChange]);

  const applyPreset = useCallback(() => {
    const preset: EnvVarRow[] = [
      {
        id: newRowId(),
        key: "DATABASE_URL",
        value: "postgresql://user:pass@localhost:5432/app",
        secret: true,
        required: true,
      },
      {
        id: newRowId(),
        key: "REDIS_URL",
        value: "redis://localhost:6379",
        secret: false,
      },
      {
        id: newRowId(),
        key: "SECRET_KEY",
        value: "",
        secret: true,
        required: true,
      },
    ];
    onChange([...rows.filter((r) => r.key.trim()), ...preset]);
  }, [rows, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-raised)]"
        >
          {labels.add}
        </button>
        <button
          type="button"
          onClick={() => setImportOpen((v) => !v)}
          className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-raised)]"
        >
          {labels.import}
        </button>
        <button
          type="button"
          onClick={applyPreset}
          className="rounded-lg border border-dashed border-[var(--brand-accent)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--brand-accent)] transition hover:bg-[var(--surface-interactive)]"
        >
          {labels.presets}
        </button>
      </div>

      {importOpen ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)]/40 p-3">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={labels.importPlaceholder}
            rows={5}
            className="w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] px-3 py-2 font-mono text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/40"
          />
          <button
            type="button"
            onClick={applyImport}
            className="mt-2 rounded-lg bg-[var(--button-primary-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--button-primary-text)]"
          >
            {labels.applyImport}
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-panel)]/60 p-3 sm:flex-row sm:items-center"
          >
            <input
              value={row.key}
              onChange={(e) => updateRow(row.id, { key: e.target.value })}
              placeholder={labels.key}
              className="min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] px-2.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
            />
            <input
              type={row.secret ? "password" : "text"}
              value={row.value}
              onChange={(e) => updateRow(row.id, { value: e.target.value })}
              placeholder={labels.value}
              className="min-w-0 flex-[1.2] rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] px-2.5 py-2 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]/35"
            />
            <label className="flex shrink-0 items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={row.secret}
                onChange={(e) => updateRow(row.id, { secret: e.target.checked })}
                className="rounded border-[var(--border-subtle)]"
              />
              {labels.secret}
            </label>
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              className={cn(
                "shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10",
                "dark:text-red-400",
              )}
            >
              {labels.remove}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
