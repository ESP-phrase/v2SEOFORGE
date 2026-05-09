"use client";

import { useState } from "react";
import { testWordPressAction } from "@/actions/sites";
import { Button } from "@/components/Button";

export function TestWordPressButton({ siteId }: { siteId: number }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleClick() {
    setBusy(true);
    try {
      const r = await testWordPressAction(siteId);
      setResult(r);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={handleClick} disabled={busy}>
        {busy ? "Testing…" : "Test WordPress connection"}
      </Button>
      {result ? (
        <div
          className={`mt-3 px-3 py-2 rounded-lg text-sm border ${
            result.ok
              ? "bg-accent-dim text-accent border-accent-border"
              : "bg-[rgba(255,84,112,0.12)] text-danger border-[rgba(255,84,112,0.3)]"
          }`}
        >
          {result.ok ? "Connected" : "Failed"}: {result.message}
        </div>
      ) : null}
    </div>
  );
}
