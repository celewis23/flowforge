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
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {trend ? <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">{trend}</span> : null}
        </div>
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardBody>
    </Card>
  );
}
