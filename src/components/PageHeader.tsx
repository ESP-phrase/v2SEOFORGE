export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight m-0">{title}</h1>
        {subtitle ? <div className="text-muted text-sm mt-1">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex gap-2 flex-wrap">{actions}</div> : null}
    </div>
  );
}
