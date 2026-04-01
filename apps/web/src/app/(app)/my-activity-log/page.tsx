import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getActivityData } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default async function MyActivityLogPage() {
  const data = await getActivityData();

  return (
    <PageShell eyebrow="My Activity Log" title="Daily notes and work signals" description="Capture accomplishments, blockers, risks, and support requests for MSR generation.">
      <div className="space-y-3">
        {data.entries.map((entry) => (
          <Card key={entry.id}>
            <CardBody className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="accent">{entry.kind}</Badge>
                  <p className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                </div>
                <h2 className="text-base font-semibold">{entry.title}</h2>
                <p className="text-sm text-muted-foreground">{entry.body}</p>
              </div>
              {entry.cardId ? <Badge variant="neutral">Card linked</Badge> : <Badge variant="neutral">Manual note</Badge>}
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
