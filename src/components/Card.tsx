export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-5 my-3 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  title,
  desc,
  right,
}: {
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between mb-2 gap-3">
      <h3 className="text-base font-bold m-0">{title}</h3>
      {right ?? (desc ? <span className="text-muted text-xs">{desc}</span> : null)}
    </div>
  );
}
