import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Enterprise identity</h2>
            <p className="text-sm text-muted-foreground">Tenant-level authentication policy, SSO posture, and enterprise provisioning defaults.</p>
          </div>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-4">
          <Setting label="Auth mode" value={formatValue(data.enterprise.authentication.authenticationMode)} />
          <Setting label="Local sign-in" value={data.enterprise.authentication.allowLocalPasswordSignIn ? "Allowed" : "Disabled"} />
          <Setting label="MFA default" value={data.enterprise.authentication.requireMfaByDefault ? "Required" : "Optional"} />
          <Setting label="JIT provisioning" value={data.enterprise.authentication.allowJustInTimeProvisioning ? "Enabled" : "Disabled"} />
        </CardBody>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Identity providers</h2>
              <p className="text-sm text-muted-foreground">Microsoft Entra ID, Google Workspace, and future SAML connections configured for this organization.</p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {data.enterprise.identityProviders.length > 0 ? (
              <Table className="rounded-none border-0 bg-transparent">
                <table className="w-full">
                  <TableHeader>
                    <tr>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provisioning</TableHead>
                      <TableHead>Status</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {data.enterprise.identityProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">{provider.tenantIdentifier || provider.authority || "No tenant configured yet"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatValue(provider.providerType)}</TableCell>
                        <TableCell>{formatValue(provider.provisioningMode)}</TableCell>
                        <TableCell className="space-x-2">
                          {provider.isPrimary ? <Badge variant="accent">Primary</Badge> : null}
                          <Badge variant={provider.isEnabled ? "success" : "neutral"}>{provider.isEnabled ? "Enabled" : "Disabled"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </Table>
            ) : (
              <div className="px-5 py-5 text-sm text-muted-foreground sm:px-6">No enterprise identity providers configured yet.</div>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Productivity integrations</h2>
              <p className="text-sm text-muted-foreground">Connected suites for mail, files, calendar, directory sync, and collaboration workflows.</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {data.enterprise.integrations.length > 0 ? (
              data.enterprise.integrations.map((integration) => (
                <div key={integration.id} className="rounded-[0.7rem] border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{formatValue(integration.providerType)}</p>
                    </div>
                    <Badge variant={integration.status === "Active" ? "success" : integration.status === "Error" ? "danger" : "neutral"}>
                      {formatValue(integration.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {integration.lastError || integration.tenantIdentifier || "No tenant or sync metadata available yet."}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
                No Microsoft 365 or Google Workspace productivity integrations configured yet.
              </div>
            )}
            <div className="rounded-[0.7rem] border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground">
              Allowed domains:{" "}
              {data.enterprise.authentication.allowedDomains.length > 0
                ? data.enterprise.authentication.allowedDomains.join(", ")
                : "No verified domains configured yet."}
            </div>
          </CardBody>
        </Card>
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

function formatValue(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
