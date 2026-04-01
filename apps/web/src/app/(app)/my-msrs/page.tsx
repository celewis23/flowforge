import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getMsrData } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default async function MyMsrsPage() {
  const data = await getMsrData();

  return (
    <PageShell eyebrow="My MSRs" title="Personal reporting history" description="Review drafts, submissions, and the current manager feedback state.">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.personal.map((msr) => (
          <Card key={msr.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{data.users.find((user) => user.id === msr.userId)?.name ?? msr.userId}</h2>
                <Badge variant={msr.status === "submitted" ? "success" : "warning"}>{msr.status}</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {msr.final.slice(0, 2).map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-sm font-semibold">{section.title}</p>
                  <p className="text-sm text-muted-foreground">{section.body}</p>
                </div>
              ))}
              <Link href="/personal-msr-editor" className="text-sm font-medium text-accent">
                Open editor
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Cycle snapshots</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {data.cycles.map((cycle) => (
            <div key={cycle.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="font-medium">{cycle.id}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(cycle.startDate)} to {formatDateTime(cycle.endDate)}
                </p>
              </div>
              <Badge variant="neutral">{cycle.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </PageShell>
  );
}
