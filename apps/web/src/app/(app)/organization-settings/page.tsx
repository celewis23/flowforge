import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createIdentityProviderAction, createIntegrationConnectionAction, updateEnterpriseAuthSettingsAction } from "@/lib/enterprise-settings-actions";
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
        <CardBody className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <Setting label="Auth mode" value={formatValue(data.enterprise.authentication.authenticationMode)} />
            <Setting label="Local sign-in" value={data.enterprise.authentication.allowLocalPasswordSignIn ? "Allowed" : "Disabled"} />
            <Setting label="MFA default" value={data.enterprise.authentication.requireMfaByDefault ? "Required" : "Optional"} />
            <Setting label="JIT provisioning" value={data.enterprise.authentication.allowJustInTimeProvisioning ? "Enabled" : "Disabled"} />
          </div>
          <form action={updateEnterpriseAuthSettingsAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="authenticationMode">
                Authentication mode
              </label>
              <select
                id="authenticationMode"
                name="authenticationMode"
                defaultValue={toAuthenticationModeValue(data.enterprise.authentication.authenticationMode)}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <option value="1">Local only</option>
                <option value="2">Mixed: local + SSO</option>
                <option value="3">SSO required</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="allowedDomains">
                Allowed domains
              </label>
              <Input id="allowedDomains" name="allowedDomains" defaultValue={data.enterprise.authentication.allowedDomains.join(", ")} placeholder="company.com, agency.gov" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="allowLocalPasswordSignIn" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.authentication.allowLocalPasswordSignIn} />
              Allow local password sign-in
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="requireMfaByDefault" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.authentication.requireMfaByDefault} />
              Require MFA by default
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="allowJustInTimeProvisioning" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.authentication.allowJustInTimeProvisioning} />
              Enable just-in-time provisioning
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="enforceDomainVerification" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.authentication.enforceDomainVerification} />
              Enforce domain verification
            </label>
            <div className="lg:col-span-2">
              <Button type="submit">Save enterprise auth policy</Button>
            </div>
          </form>
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
          <CardBody className="border-t border-border">
            <form action={createIdentityProviderAction} className="grid gap-4 lg:grid-cols-2">
              <input type="hidden" name="organizationId" value={data.organization.id} />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="provider-name">
                  Provider name
                </label>
                <Input id="provider-name" name="name" placeholder="Contoso Entra ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="provider-type">
                  Provider type
                </label>
                <select id="provider-type" name="providerType" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                  <option value="1">Microsoft Entra ID</option>
                  <option value="2">Google Workspace</option>
                  <option value="3">SAML</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="clientId">
                  Client ID
                </label>
                <Input id="clientId" name="clientId" placeholder="Application / OAuth client ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="clientSecretReference">
                  Client secret reference
                </label>
                <Input id="clientSecretReference" name="clientSecretReference" placeholder="Managed secret value or reference" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="authority">
                  Authority
                </label>
                <Input id="authority" name="authority" placeholder="https://login.microsoftonline.com/tenant-id" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="metadataUrl">
                  Metadata URL
                </label>
                <Input id="metadataUrl" name="metadataUrl" placeholder="Optional OIDC metadata URL override" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tenantIdentifier">
                  Tenant identifier
                </label>
                <Input id="tenantIdentifier" name="tenantIdentifier" placeholder="tenant-id or workspace customer ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="scopes">
                  Scopes
                </label>
                <Input id="scopes" name="scopes" defaultValue="openid, profile, email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="domainHints">
                  Domain hints
                </label>
                <Input id="domainHints" name="domainHints" placeholder="company.com, agency.gov" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="provisioningMode">
                  Provisioning mode
                </label>
                <select id="provisioningMode" name="provisioningMode" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                  <option value="1">None</option>
                  <option value="2">Just-in-time</option>
                  <option value="3">SCIM</option>
                </select>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium" htmlFor="roleMappingsJson">
                  Role mappings JSON
                </label>
                <Textarea id="roleMappingsJson" name="roleMappingsJson" defaultValue="{}" className="min-h-24" />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name="isEnabled" className="h-4 w-4 rounded border-border" defaultChecked />
                Enable provider
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name="isPrimary" className="h-4 w-4 rounded border-border" />
                Set as primary SSO provider
              </label>
              <div className="lg:col-span-2">
                <Button type="submit">Add identity provider</Button>
              </div>
            </form>
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
          <CardBody className="border-t border-border">
            <form action={createIntegrationConnectionAction} className="grid gap-4">
              <input type="hidden" name="organizationId" value={data.organization.id} />
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-name">
                    Connection name
                  </label>
                  <Input id="integration-name" name="name" placeholder="Microsoft 365 tenant" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-providerType">
                    Provider
                  </label>
                  <select id="integration-providerType" name="providerType" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                    <option value="1">Microsoft 365</option>
                    <option value="2">Google Workspace</option>
                    <option value="3">Slack</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-clientId">
                    Client ID
                  </label>
                  <Input id="integration-clientId" name="clientId" placeholder="App registration / OAuth client ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-clientSecretReference">
                    Client secret reference
                  </label>
                  <Input id="integration-clientSecretReference" name="clientSecretReference" placeholder="Managed secret value or reference" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-tenantIdentifier">
                    Tenant identifier
                  </label>
                  <Input id="integration-tenantIdentifier" name="tenantIdentifier" placeholder="tenant-id, directory-id, or workspace ID" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="integration-scopes">
                    Scopes
                  </label>
                  <Input id="integration-scopes" name="scopes" placeholder="Files.Read.All, Mail.Send, Calendars.Read" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="integration-configurationJson">
                  Configuration JSON
                </label>
                <Textarea id="integration-configurationJson" name="configurationJson" defaultValue="{}" className="min-h-24" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="integration-status">
                  Connection status
                </label>
                <select id="integration-status" name="status" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                  <option value="1">Draft</option>
                  <option value="2">Active</option>
                  <option value="3">Disabled</option>
                  <option value="4">Error</option>
                </select>
              </div>
              <div>
                <Button type="submit">Add integration connection</Button>
              </div>
            </form>
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

function toAuthenticationModeValue(value: string) {
  switch (value) {
    case "LocalOnly":
      return "1";
    case "SsoRequired":
      return "3";
    default:
      return "2";
  }
}
