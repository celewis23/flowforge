import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getSettingsData } from "@/lib/api";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <PageShell eyebrow="Settings" title="Profile and workspace preferences" description="Update personal preferences, cadence defaults, and reporting shortcuts.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Profile</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="font-medium">{data.currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{data.currentUser.email}</p>
            <Badge variant="accent">{data.currentUser.role}</Badge>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Workspace cadence</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-sm text-muted-foreground">{data.organization.name}</p>
            <Badge variant="neutral">{data.organization.cadence} reporting</Badge>
            <Badge variant="neutral">{data.organization.region}</Badge>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
