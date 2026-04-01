import { cn } from "@/lib/utils";

type Variant = "neutral" | "success" | "warning" | "danger" | "accent";

const variants: Record<Variant, string> = {
  neutral: "bg-surface text-muted-foreground ring-1 ring-border",
  success: "bg-success/12 text-success ring-1 ring-success/20",
  warning: "bg-warning/12 text-warning ring-1 ring-warning/20",
  danger: "bg-danger/12 text-danger ring-1 ring-danger/20",
  accent: "bg-accent/12 text-accent ring-1 ring-accent/20",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", variants[variant], className)}>{children}</span>;
}
