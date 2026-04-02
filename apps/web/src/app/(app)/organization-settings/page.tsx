import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createVerifiedDomainAction,
  createIdentityProviderAction,
  createIntegrationConnectionAction,
  updateEnterpriseAuthSettingsAction,
  updateIdentityProviderStateAction,
  updateIntegrationConnectionStateAction,
  updateVerifiedDomainAction,
  verifyDomainStateAction,
} from "@/lib/enterprise-settings-actions";
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
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="defaultIdentityProviderId">
                Default identity provider
              </label>
              <select
                id="defaultIdentityProviderId"
                name="defaultIdentityProviderId"
                defaultValue={data.enterprise.authentication.defaultIdentityProviderId ?? ""}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <option value="">None</option>
                {data.enterprise.identityProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
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
                          <div className="mt-2 flex flex-wrap gap-2">
                            <form action={updateIdentityProviderStateAction}>
                              <input type="hidden" name="organizationId" value={data.organization.id} />
                              <input type="hidden" name="identityProviderId" value={provider.id} />
                              <input type="hidden" name="name" value={provider.name} />
                              <input type="hidden" name="providerType" value={toProviderTypeValue(provider.providerType)} />
                              <input type="hidden" name="clientId" value={provider.clientId} />
                              <input type="hidden" name="clientSecretReference" value="" />
                              <input type="hidden" name="authority" value={provider.authority} />
                              <input type="hidden" name="metadataUrl" value={provider.metadataUrl} />
                              <input type="hidden" name="tenantIdentifier" value={provider.tenantIdentifier} />
                              <input type="hidden" name="scopes" value={provider.scopes.join(",")} />
                              <input type="hidden" name="domainHints" value={provider.domainHints.join(",")} />
                              <input type="hidden" name="roleMappingsJson" value="{}" />
                              <input type="hidden" name="provisioningMode" value={toProvisioningModeValue(provider.provisioningMode)} />
                              <input type="hidden" name="isEnabled" value={provider.isEnabled ? "false" : "true"} />
                              <input type="hidden" name="isPrimary" value={provider.isPrimary ? "true" : "false"} />
                              <Button type="submit" size="sm" variant="secondary">{provider.isEnabled ? "Disable" : "Enable"}</Button>
                            </form>
                            {!provider.isPrimary ? (
                              <form action={updateIdentityProviderStateAction}>
                                <input type="hidden" name="organizationId" value={data.organization.id} />
                                <input type="hidden" name="identityProviderId" value={provider.id} />
                                <input type="hidden" name="name" value={provider.name} />
                                <input type="hidden" name="providerType" value={toProviderTypeValue(provider.providerType)} />
                                <input type="hidden" name="clientId" value={provider.clientId} />
                                <input type="hidden" name="clientSecretReference" value="" />
                                <input type="hidden" name="authority" value={provider.authority} />
                                <input type="hidden" name="metadataUrl" value={provider.metadataUrl} />
                                <input type="hidden" name="tenantIdentifier" value={provider.tenantIdentifier} />
                                <input type="hidden" name="scopes" value={provider.scopes.join(",")} />
                                <input type="hidden" name="domainHints" value={provider.domainHints.join(",")} />
                                <input type="hidden" name="roleMappingsJson" value="{}" />
                                <input type="hidden" name="provisioningMode" value={toProvisioningModeValue(provider.provisioningMode)} />
                                <input type="hidden" name="isEnabled" value={provider.isEnabled ? "true" : "false"} />
                                <input type="hidden" name="isPrimary" value="true" />
                                <Button type="submit" size="sm" variant="ghost">Make primary</Button>
                              </form>
                            ) : null}
                          </div>
                          <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Edit provider
                            </summary>
                            <form action={updateIdentityProviderStateAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                              <input type="hidden" name="organizationId" value={data.organization.id} />
                              <input type="hidden" name="identityProviderId" value={provider.id} />
                              <input type="hidden" name="isEnabled" value={provider.isEnabled ? "true" : "false"} />
                              <input type="hidden" name="isPrimary" value={provider.isPrimary ? "true" : "false"} />
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-name-${provider.id}`}>
                                  Provider name
                                </label>
                                <Input id={`provider-name-${provider.id}`} name="name" defaultValue={provider.name} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-type-${provider.id}`}>
                                  Provider type
                                </label>
                                <select
                                  id={`provider-type-${provider.id}`}
                                  name="providerType"
                                  defaultValue={toProviderTypeValue(provider.providerType)}
                                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                                >
                                  <option value="1">Microsoft Entra ID</option>
                                  <option value="2">Google Workspace</option>
                                  <option value="3">SAML</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-client-${provider.id}`}>
                                  Client ID
                                </label>
                                <Input id={`provider-client-${provider.id}`} name="clientId" defaultValue={provider.clientId} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-secret-${provider.id}`}>
                                  Client secret reference
                                </label>
                                <Input id={`provider-secret-${provider.id}`} name="clientSecretReference" placeholder="Keep current secret or enter a new reference" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-authority-${provider.id}`}>
                                  Authority
                                </label>
                                <Input id={`provider-authority-${provider.id}`} name="authority" defaultValue={provider.authority} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-metadata-${provider.id}`}>
                                  Metadata URL
                                </label>
                                <Input id={`provider-metadata-${provider.id}`} name="metadataUrl" defaultValue={provider.metadataUrl} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-tenant-${provider.id}`}>
                                  Tenant identifier
                                </label>
                                <Input id={`provider-tenant-${provider.id}`} name="tenantIdentifier" defaultValue={provider.tenantIdentifier} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-scopes-${provider.id}`}>
                                  Scopes
                                </label>
                                <Input id={`provider-scopes-${provider.id}`} name="scopes" defaultValue={provider.scopes.join(", ")} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-domain-hints-${provider.id}`}>
                                  Domain hints
                                </label>
                                <Input id={`provider-domain-hints-${provider.id}`} name="domainHints" defaultValue={provider.domainHints.join(", ")} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium" htmlFor={`provider-provisioning-${provider.id}`}>
                                  Provisioning mode
                                </label>
                                <select
                                  id={`provider-provisioning-${provider.id}`}
                                  name="provisioningMode"
                                  defaultValue={toProvisioningModeValue(provider.provisioningMode)}
                                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                                >
                                  <option value="1">None</option>
                                  <option value="2">Just-in-time</option>
                                  <option value="3">SCIM</option>
                                </select>
                              </div>
                              <div className="space-y-2 lg:col-span-2">
                                <label className="text-xs font-medium" htmlFor={`provider-role-mapping-${provider.id}`}>
                                  Role mappings JSON
                                </label>
                                <Textarea id={`provider-role-mapping-${provider.id}`} name="roleMappingsJson" defaultValue="{}" className="min-h-24" />
                              </div>
                              <div className="lg:col-span-2">
                                <Button type="submit" size="sm">Save provider details</Button>
                              </div>
                            </form>
                          </details>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={updateIntegrationConnectionStateAction}>
                      <input type="hidden" name="organizationId" value={data.organization.id} />
                      <input type="hidden" name="integrationConnectionId" value={integration.id} />
                      <input type="hidden" name="name" value={integration.name} />
                      <input type="hidden" name="providerType" value={toIntegrationProviderValue(integration.providerType)} />
                      <input type="hidden" name="clientId" value={integration.clientId} />
                      <input type="hidden" name="clientSecretReference" value="" />
                      <input type="hidden" name="tenantIdentifier" value={integration.tenantIdentifier} />
                      <input type="hidden" name="scopes" value={integration.scopes.join(",")} />
                      <input type="hidden" name="configurationJson" value="{}" />
                      <input type="hidden" name="status" value={integration.status === "Active" ? "3" : "2"} />
                      <Button type="submit" size="sm" variant="secondary">{integration.status === "Active" ? "Disable" : "Activate"}</Button>
                    </form>
                  </div>
                  <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Edit connection
                    </summary>
                    <form action={updateIntegrationConnectionStateAction} className="mt-3 grid gap-3">
                      <input type="hidden" name="organizationId" value={data.organization.id} />
                      <input type="hidden" name="integrationConnectionId" value={integration.id} />
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-name-${integration.id}`}>
                            Connection name
                          </label>
                          <Input id={`integration-name-${integration.id}`} name="name" defaultValue={integration.name} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-provider-${integration.id}`}>
                            Provider
                          </label>
                          <select
                            id={`integration-provider-${integration.id}`}
                            name="providerType"
                            defaultValue={toIntegrationProviderValue(integration.providerType)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="1">Microsoft 365</option>
                            <option value="2">Google Workspace</option>
                            <option value="3">Slack</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-client-${integration.id}`}>
                            Client ID
                          </label>
                          <Input id={`integration-client-${integration.id}`} name="clientId" defaultValue={integration.clientId} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-secret-${integration.id}`}>
                            Client secret reference
                          </label>
                          <Input id={`integration-secret-${integration.id}`} name="clientSecretReference" placeholder="Keep current secret or enter a new reference" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-tenant-${integration.id}`}>
                            Tenant identifier
                          </label>
                          <Input id={`integration-tenant-${integration.id}`} name="tenantIdentifier" defaultValue={integration.tenantIdentifier} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`integration-scopes-${integration.id}`}>
                            Scopes
                          </label>
                          <Input id={`integration-scopes-${integration.id}`} name="scopes" defaultValue={integration.scopes.join(", ")} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium" htmlFor={`integration-config-${integration.id}`}>
                          Configuration JSON
                        </label>
                        <Textarea id={`integration-config-${integration.id}`} name="configurationJson" defaultValue="{}" className="min-h-24" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium" htmlFor={`integration-status-${integration.id}`}>
                          Connection status
                        </label>
                        <select
                          id={`integration-status-${integration.id}`}
                          name="status"
                          defaultValue={toIntegrationStatusValue(integration.status)}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                        >
                          <option value="1">Draft</option>
                          <option value="2">Active</option>
                          <option value="3">Disabled</option>
                          <option value="4">Error</option>
                        </select>
                      </div>
                      <div>
                        <Button type="submit" size="sm">Save connection details</Button>
                      </div>
                    </form>
                  </details>
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
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Verified domains</h2>
            <p className="text-sm text-muted-foreground">Track the domains that are approved for enterprise sign-in and future directory provisioning.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {data.enterprise.verifiedDomains.length > 0 ? (
            data.enterprise.verifiedDomains.map((domain) => (
              <div key={domain.id} className="rounded-[0.7rem] border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(domain.verificationMethod)}</p>
                  </div>
                  <Badge variant={domain.status === "Verified" ? "success" : domain.status === "Failed" ? "danger" : "neutral"}>
                    {formatValue(domain.status)}
                  </Badge>
                </div>
                <div className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Challenge token</p>
                  <p className="mt-2 break-all font-mono text-sm text-foreground">{domain.challengeToken}</p>
                </div>
                {domain.failureReason ? <p className="mt-3 text-sm text-danger">{domain.failureReason}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {domain.status !== "Verified" ? (
                    <form action={verifyDomainStateAction}>
                      <input type="hidden" name="organizationId" value={data.organization.id} />
                      <input type="hidden" name="verifiedDomainId" value={domain.id} />
                      <input type="hidden" name="verified" value="true" />
                      <input type="hidden" name="failureReason" value="" />
                      <Button type="submit" size="sm" variant="secondary">Mark verified</Button>
                    </form>
                  ) : null}
                  <form action={verifyDomainStateAction}>
                    <input type="hidden" name="organizationId" value={data.organization.id} />
                    <input type="hidden" name="verifiedDomainId" value={domain.id} />
                    <input type="hidden" name="verified" value="false" />
                    <input type="hidden" name="failureReason" value="Verification check still pending." />
                    <Button type="submit" size="sm" variant="ghost">Mark pending issue</Button>
                  </form>
                </div>
                <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Edit domain
                  </summary>
                  <form action={updateVerifiedDomainAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                    <input type="hidden" name="organizationId" value={data.organization.id} />
                    <input type="hidden" name="verifiedDomainId" value={domain.id} />
                    <div className="space-y-2">
                      <label className="text-xs font-medium" htmlFor={`domain-name-${domain.id}`}>
                        Domain
                      </label>
                      <Input id={`domain-name-${domain.id}`} name="domain" defaultValue={domain.domain} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium" htmlFor={`domain-method-${domain.id}`}>
                        Verification method
                      </label>
                      <select
                        id={`domain-method-${domain.id}`}
                        name="verificationMethod"
                        defaultValue={domain.verificationMethod}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                      >
                        <option value="DnsTxt">DNS TXT</option>
                        <option value="HtmlFile">HTML file</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <Button type="submit" size="sm">Save domain</Button>
                    </div>
                  </form>
                </details>
              </div>
            ))
          ) : (
            <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              No verified domains have been configured yet.
            </div>
          )}
        </CardBody>
        <CardBody className="border-t border-border">
          <form action={createVerifiedDomainAction} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="verified-domain">
                Domain
              </label>
              <Input id="verified-domain" name="domain" placeholder="company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="verified-domain-method">
                Verification method
              </label>
              <select
                id="verified-domain-method"
                name="verificationMethod"
                defaultValue="DnsTxt"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <option value="DnsTxt">DNS TXT</option>
                <option value="HtmlFile">HTML file</option>
                <option value="Email">Email</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit">Add verified domain</Button>
            </div>
          </form>
        </CardBody>
      </Card>
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

function toProviderTypeValue(value: string) {
  switch (value) {
    case "GoogleWorkspace":
      return "2";
    case "Saml":
      return "3";
    default:
      return "1";
  }
}

function toProvisioningModeValue(value: string) {
  switch (value) {
    case "JustInTime":
      return "2";
    case "Scim":
      return "3";
    default:
      return "1";
  }
}

function toIntegrationProviderValue(value: string) {
  switch (value) {
    case "GoogleWorkspace":
      return "2";
    case "Slack":
      return "3";
    default:
      return "1";
  }
}

function toIntegrationStatusValue(value: string) {
  switch (value) {
    case "Active":
      return "2";
    case "Disabled":
      return "3";
    case "Error":
      return "4";
    default:
      return "1";
  }
}
