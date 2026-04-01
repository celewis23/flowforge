import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getReportingData } from "@/lib/mock-api";
import { formatDate } from "@/lib/utils";

export default async function ReportingCyclesPage() {
  const data = await getReportingData();

  return (
    <PageShell eyebrow="Reporting Cycles" title="Cadence, deadlines, and templates" description="Manage weekly, biweekly, monthly, or custom reporting rhythms.">
      <div className="grid gap-4 lg:grid-cols-3">
        {data.templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <h2 className="text-lg font-semibold">{template.name}</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Badge variant="accent">{template.cadence}</Badge>
              <p className="text-sm text-muted-foreground">{template.branding}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <Table>
        <table className="w-full">
          <TableHeader>
            <tr>
              <TableHead>Cycle</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell className="font-medium">{cycle.id}</TableCell>
                <TableCell>{cycle.cadence}</TableCell>
                <TableCell>{formatDate(cycle.startDate)}</TableCell>
                <TableCell>{formatDate(cycle.endDate)}</TableCell>
                <TableCell><Badge variant={cycle.status === "finalized" ? "success" : "warning"}>{cycle.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </Table>
    </PageShell>
  );
}

