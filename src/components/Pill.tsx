const PILL_STYLES: Record<string, string> = {
  queued: "bg-[rgba(246,196,83,0.12)] text-warning",
  published: "bg-accent-dim text-accent",
  publish: "bg-accent-dim text-accent",
  draft: "bg-[rgba(108,182,255,0.12)] text-info",
  processing: "bg-[rgba(108,182,255,0.12)] text-info",
  failed: "bg-[rgba(255,84,112,0.12)] text-danger",
  publish_failed: "bg-[rgba(255,84,112,0.12)] text-danger",
  needs_review: "bg-[rgba(108,182,255,0.12)] text-info",
  "needs-review": "bg-[rgba(108,182,255,0.12)] text-info",
  dry_run: "bg-surface-2 text-muted",
  active: "bg-accent-dim text-accent",
  inactive: "bg-[rgba(255,84,112,0.12)] text-danger",
};

export function Pill({ status, children }: { status: string; children?: React.ReactNode }) {
  const cls = PILL_STYLES[status] ?? "bg-surface-2 text-muted";
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold ${cls}`}
    >
      {children ?? status}
    </span>
  );
}
