import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getAdminData } from "@/lib/api";

export default async function PlatformAdminPage() {
  const data = await getAdminData();

  return (
    <PageShell eyebrow="Platform Admin" title="Global controls and tenant overview" description="Monitor organizations, feature flags, and admin-only operations.">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Organizations</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-semibold">1</p>
            <p className="mt-2 text-sm text-muted-foreground">{data.organization.name}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Users</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-semibold">{data.users.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Seeded demo accounts</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Templates</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-semibold">{data.templates.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Report defaults available</p>
          </CardBody>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Feature flags</h2>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2">
          <Badge variant="accent">Impersonation safe mode</Badge>
          <Badge variant="neutral">Audit review</Badge>
          <Badge variant="neutral">Plan scaffolding</Badge>
          <Badge variant="neutral">Health checks</Badge>
        </CardBody>
      </Card>
    </PageShell>
  );
}
