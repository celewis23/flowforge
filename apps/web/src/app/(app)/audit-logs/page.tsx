import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminData } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default async function AuditLogsPage() {
  const data = await getAdminData();

  return (
    <PageShell eyebrow="Audit Logs" title="Permission-sensitive system events" description="Review assignments, report changes, and report finalization events.">
      <Table>
        <table className="w-full">
          <TableHeader>
            <tr>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>When</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.auditLogs.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.action}</TableCell>
                <TableCell>{entry.target}</TableCell>
                <TableCell><Badge variant="neutral">{entry.actorId}</Badge></TableCell>
                <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </Table>
    </PageShell>
  );
}
