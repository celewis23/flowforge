import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getAdminData } from "@/lib/api";

export default async function TeamSettingsPage() {
  const data = await getAdminData();

  return (
    <PageShell eyebrow="Team Settings" title="Teams, managers, and board defaults" description="Tune the configuration for each operating team.">
      <div className="grid gap-4 lg:grid-cols-3">
        {data.teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <h2 className="text-lg font-semibold">{team.name}</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Badge variant="accent">{team.cadence}</Badge>
              <p className="text-sm text-muted-foreground">{team.department}</p>
              <p className="text-sm text-muted-foreground">{team.focus}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
