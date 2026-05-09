"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/Button";

type Suggestion = { keyword: string; intent: string };

export function ResearchForm({ siteId }: { siteId: number }) {
  const router = useRouter();
  const [seed, setSeed] = useState("");
  const [count, setCount] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [cost, setCost] = useState(0);
  const [textareaValue, setTextareaValue] = useState("");
  const [adding, setAdding] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) {
      setError("Seed term required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch(`/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, seed: seed.trim(), count }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Research failed: HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as {
        keywords: Suggestion[];
        cost_usd: number;
      };
      setSuggestions(data.keywords);
      setCost(data.cost_usd);
      setTextareaValue(
        data.keywords.map((k) => `${k.keyword} | ${k.intent}`).join("\n"),
      );
      if (data.keywords.length === 0) {
        setError("Claude returned no keywords. Try a different seed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function addToQueue() {
    setAdding(true);
    const fd = new FormData();
    fd.set("keywords", textareaValue);
    const resp = await fetch(`/api/sites/${siteId}/keywords`, { method: "POST", body: fd });
    setAdding(false);
    if (resp.ok) router.push(`/sites/${siteId}`);
  }

  return (
    <>
      <form onSubmit={generate} className="flex flex-col gap-1">
        <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3 mb-1.5">
          Seed term or topic
        </label>
        <input
          type="text"
          required
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="e.g. polymarket withdrawal"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <div>
            <label className="block text-muted text-[0.7rem] uppercase tracking-wider font-semibold mt-3 mb-1.5">
              How many?
            </label>
            <input
              type="number"
              min={10}
              max={60}
              value={count}
              onChange={(e) => setCount(Math.max(10, Math.min(60, Number(e.target.value) || 30)))}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button type="submit" disabled={busy}>
            {busy ? "Generating…" : "Generate suggestions"}
          </Button>
        </div>
      </form>

      {error ? (
        <div className="bg-[rgba(255,84,112,0.12)] text-danger border border-[rgba(255,84,112,0.3)] rounded-lg px-3.5 py-2.5 mt-4 text-sm">
          {error}
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-base font-bold m-0">Suggestions ({suggestions.length})</h3>
            <span className="text-muted text-xs">Cost: ${cost.toFixed(3)}</span>
          </div>
          <p className="text-muted text-sm mb-2">
            Edit the textarea — uncheck or delete lines you don&apos;t want — then add to the queue.
          </p>
          <textarea
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button type="button" onClick={addToQueue} disabled={adding}>
              {adding ? "Adding…" : "Add all to queue"}
            </Button>
            <LinkButton href={`/sites/${siteId}`} variant="secondary">
              Cancel
            </LinkButton>
          </div>
        </div>
      ) : null}
    </>
  );
}
