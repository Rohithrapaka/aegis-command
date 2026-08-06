export function PageHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{index}</p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.2vw,2.8rem)] leading-none">{title}</h1>
      </div>
      <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}