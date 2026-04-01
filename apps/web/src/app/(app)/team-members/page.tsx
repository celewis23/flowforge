import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getMembersData } from "@/lib/api";

export default async function TeamMembersPage() {
  const data = await getMembersData();

  return (
    <PageShell eyebrow="Team Members" title="People, roles, and ownership" description="See who owns what, who manages which team, and who is awaiting invitation.">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.users.map((user) => (
          <Card key={user.id}>
            <CardBody className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} color={user.avatarColor} />
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant="accent">{user.role}</Badge>
                <Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
