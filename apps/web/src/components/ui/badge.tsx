import { cn } from "@/lib/utils";

type Variant = "neutral" | "success" | "warning" | "danger" | "accent";

const variants: Record<Variant, string> = {
  neutral: "bg-muted text-muted-foreground ring-1 ring-border",
  success: "bg-success/14 text-success ring-1 ring-success/22",
  warning: "bg-warning/14 text-warning ring-1 ring-warning/22",
  danger: "bg-danger/14 text-danger ring-1 ring-danger/22",
  accent: "bg-accent/14 text-accent ring-1 ring-accent/22",
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
  return <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold", variants[variant], className)}>{children}</span>;
}
