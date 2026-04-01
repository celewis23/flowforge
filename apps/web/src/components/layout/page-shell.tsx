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
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,28,49,0.92),rgba(8,17,31,0.82))] px-6 py-6 shadow-soft sm:px-8 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.18),transparent_24%),radial-gradient(circle_at_left,rgba(96,165,250,0.18),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
            {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
