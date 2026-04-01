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
      <div className="flex flex-col gap-4 rounded-[0.7rem] border border-border bg-surface px-5 py-5 shadow-soft sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p> : null}
            <h1 className="text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.25rem]">{title}</h1>
            {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
