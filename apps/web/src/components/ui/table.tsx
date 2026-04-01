import { cn } from "@/lib/utils";

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("overflow-hidden rounded-3xl border border-border bg-surface", className)}>{children}</div>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-t border-border">{children}</tr>;
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-4 text-sm text-foreground", className)}>{children}</td>;
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}
