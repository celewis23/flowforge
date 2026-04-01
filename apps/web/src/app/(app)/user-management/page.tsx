import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminData } from "@/lib/api";

export default async function UserManagementPage() {
  const data = await getAdminData();

  return (
    <PageShell eyebrow="User Management" title="Invite, activate, and govern users" description="Manage roles, team assignment, and invitation state from one screen.">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Invitations</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {data.invitations.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="font-medium">{invite.email}</p>
                <p className="text-sm text-muted-foreground">{invite.role}</p>
              </div>
              <Badge variant={invite.status === "accepted" ? "success" : "warning"}>{invite.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
      <Table>
        <table className="w-full">
          <TableHeader>
            <tr>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Teams</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell><Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge></TableCell>
                <TableCell>{user.teamIds.length ? user.teamIds.join(", ") : "None"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </Table>
    </PageShell>
  );
}
