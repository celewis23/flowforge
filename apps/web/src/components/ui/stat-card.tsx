import { Card, CardBody } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          {trend ? <span className="rounded-full bg-white/7 px-2.5 py-1 text-xs font-semibold text-accent">{trend}</span> : null}
        </div>
        <div className="text-4xl font-semibold tracking-tight text-foreground">{value}</div>
        <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardBody>
    </Card>
  );
}
