import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getSettingsData } from "@/lib/api";

export default async function OrganizationSettingsPage() {
  const data = await getSettingsData();

  return (
    <PageShell eyebrow="Organization Settings" title="Tenant configuration and policy defaults" description="Adjust organization-level reporting, branding, and cadence settings.">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{data.organization.name}</h2>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-3">
          <Setting label="Plan" value={data.organization.plan} />
          <Setting label="Industry" value={data.organization.industry} />
          <Setting label="Cadence" value={data.organization.cadence} />
        </CardBody>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {data.teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <h3 className="text-base font-semibold">{team.name}</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Badge variant={team.health === "green" ? "success" : team.health === "amber" ? "warning" : "danger"}>{team.health}</Badge>
              <p className="text-sm text-muted-foreground">{team.focus}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
