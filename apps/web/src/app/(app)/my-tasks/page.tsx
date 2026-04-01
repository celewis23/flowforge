import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTasksData } from "@/lib/mock-api";
import { formatDate } from "@/lib/utils";

export default async function MyTasksPage() {
  const data = await getTasksData();

  return (
    <PageShell eyebrow="My Tasks" title="Everything assigned to you" description="Track ownership, subtasks, and discussion threads from one place.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">Total tasks</p>
            <p className="mt-2 text-3xl font-semibold">{data.myTasks.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">Collaborative comments</p>
            <p className="mt-2 text-3xl font-semibold">{data.comments.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted-foreground">Subtasks</p>
            <p className="mt-2 text-3xl font-semibold">{data.subtasks.length}</p>
          </CardBody>
        </Card>
      </div>
      <Table>
        <table className="w-full">
          <TableHeader>
            <tr>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Flags</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.myTasks.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="font-medium">{card.title}</TableCell>
                <TableCell><Badge variant={card.status === "Blocked" ? "danger" : card.status === "Done" ? "success" : "neutral"}>{card.status}</Badge></TableCell>
                <TableCell><Badge variant={card.priority === "Critical" ? "danger" : card.priority === "High" ? "warning" : "neutral"}>{card.priority}</Badge></TableCell>
                <TableCell>{formatDate(card.dueDate)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {card.includeInMsr ? <Badge variant="accent">MSR</Badge> : null}
                    {card.collaboratorIds.length ? <Badge variant="neutral">Collaborative</Badge> : null}
                    {card.ackRequired ? <Badge variant="warning">Ack required</Badge> : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </Table>
    </PageShell>
  );
}
