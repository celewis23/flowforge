import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getReportingData, getUserById } from "@/lib/mock-api";
import { formatDateTime } from "@/lib/utils";

export default async function ReportsArchivePage() {
  const data = await getReportingData();

  return (
    <PageShell eyebrow="Reports Archive" title="Approved reports and exports" description="Access submitted personal MSRs, finalized team reports, and export-ready artifacts.">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.teamMsrs.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{report.teamId}</h2>
                <Badge variant="success">{report.status}</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.executiveSummary}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">PDF</Button>
                <Button size="sm" variant="secondary">Word</Button>
                <Button size="sm" variant="secondary">Copy summary</Button>
              </div>
              <p className="text-xs text-muted-foreground">Updated {formatDateTime(report.updatedAt)}</p>
            </CardBody>
          </Card>
        ))}
        {data.personalMsrs.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{getUserById(report.userId)?.name ?? report.userId}</h2>
                <Badge variant={report.status === "submitted" ? "success" : "warning"}>{report.status}</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.final[0]?.body}</p>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/personal-msr-editor" size="sm" variant="secondary">
                  Open
                </ButtonLink>
                <Button size="sm" variant="secondary">
                  PDF
                </Button>
                <Button size="sm" variant="secondary">
                  Word
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
