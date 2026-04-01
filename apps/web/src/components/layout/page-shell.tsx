import { cn } from "@/lib/utils";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-7", className)}>
      <div className="rounded-[0.8rem] border border-accent/55 bg-surface px-6 py-6 shadow-soft sm:px-8 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.65rem]">{title}</h1>
            {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
