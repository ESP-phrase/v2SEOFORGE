export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
      <div className="text-muted text-[0.7rem] uppercase tracking-wider mt-1.5">{label}</div>
    </div>
  );
}
