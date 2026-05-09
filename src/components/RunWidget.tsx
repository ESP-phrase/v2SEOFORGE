"use client";

import { useState, useTransition } from "react";
import { runSingleAction } from "@/actions/runs";
import { Button } from "@/components/Button";
import type { RunResult } from "@/lib/runner";

export function RunWidget({ siteId }: { siteId: number }) {
  const [count, setCount] = useState(1);
  const [dryRun, setDryRun] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const [running, setRunning] = useState(false);
  const [, startTransition] = useTransition();

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setResults([]);
    const collected: RunResult[] = [];
    for (let i = 0; i < count; i++) {
      const r = await runSingleAction(siteId, dryRun);
      collected.push(r);
      setResults([...collected]);
      if (!r.ok) break;
    }
    setRunning(false);
    startTransition(() => {
      // Trigger server-component refresh so stats/articles update
      window.location.hash = `run-${Date.now()}`;
    });
  }

  return (
    <div>
      <form onSubmit={handleRun} className="flex gap-3 flex-wrap items-end">
        <div className="w-24">
          <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3 mb-1.5">
            Count
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            disabled={running}
          />
        </div>
        <div className="flex gap-4 pb-2">
          <label className="inline-flex items-center gap-1.5 text-sm text-text">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              disabled={running}
              className="!w-auto !p-0 accent-accent"
            />
            Dry run
          </label>
        </div>
        <div className="pb-1">
          <Button type="submit" disabled={running}>
            {running ? `Running ${results.length}/${count}…` : "Run"}
          </Button>
        </div>
      </form>

      {results.length > 0 ? (
        <div className="mt-5">
          <h4 className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">
            Last run
          </h4>
          <div className="border border-border rounded-lg overflow-hidden">
            {results.map((r, i) => (
              <div
                key={i}
                className="px-3 py-2 text-sm border-b border-border last:border-b-0 flex justify-between gap-3"
              >
                <span className="font-mono text-xs text-muted overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  {summarize(r)}
                </span>
                <span className={`text-xs font-semibold ${r.ok ? "text-accent" : "text-danger"}`}>
                  {r.ok ? "ok" : "fail"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function summarize(r: RunResult): string {
  if (r.skipped) return `skipped: ${r.skipped}`;
  if (r.error) return `${r.keyword ?? "?"}: ${r.error}`;
  const bits = [r.keyword ?? "?", r.title ?? ""].filter(Boolean);
  if (r.dryRun) bits.push("(dry-run)");
  if (r.wpUrl) bits.push(`→ ${r.wpUrl}`);
  if (r.qualityWarning) bits.push(`⚠ ${r.qualityWarning}`);
  if (r.costUsd != null) bits.push(`$${r.costUsd.toFixed(3)}`);
  return bits.join(" · ");
}
