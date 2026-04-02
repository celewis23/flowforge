import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { PageShell } from "@/components/layout/page-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createDirectoryGroupMappingAction,
  createCalendarSyncSettingAction,
  createExportDestinationAction,
  createNotificationRouteAction,
  createVerifiedDomainAction,
  createIdentityProviderAction,
  createIntegrationConnectionAction,
  triggerProvisioningJobAction,
  updateCalendarSyncSettingAction,
  updateDirectoryGroupMappingAction,
  updateEnterpriseAuthSettingsAction,
  updateExportDestinationAction,
  updateIdentityProviderStateAction,
  updateIntegrationConnectionStateAction,
  updateNotificationRouteAction,
  updateProvisioningSettingsAction,
  updateVerifiedDomainAction,
  validateIdentityProviderAction,
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
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Calendar sync</h2>
            <p className="text-sm text-muted-foreground">Sync reporting cycle windows, submission deadlines, and manager review deadlines into Outlook or Google Calendar through your enterprise integrations.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {data.enterprise.calendarSyncSettings.length > 0 ? (
            <div className="space-y-3">
              {data.enterprise.calendarSyncSettings.map((setting) => {
                const integration = data.enterprise.integrations.find((item) => item.id === setting.integrationConnectionId);
                const team = setting.teamId ? data.teams.find((item) => item.id === setting.teamId) : null;

                return (
                  <div key={setting.id} className="rounded-[0.8rem] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{setting.calendarLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatValue(setting.eventType)} via {integration?.name ?? "Unknown integration"}{team ? ` for ${team.name}` : " for all teams"}
                        </p>
                      </div>
                      <Badge variant={setting.isEnabled ? "success" : "neutral"}>{setting.isEnabled ? "Enabled" : "Paused"}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Calendar reference: {setting.calendarReference}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Reminder offsets: {setting.defaultReminderOffsets.length > 0 ? setting.defaultReminderOffsets.join(", ") : "None"} days</p>
                    {setting.lastSyncedAtUtc ? (
                      <p className="mt-2 text-xs text-muted-foreground">Last synced {new Date(setting.lastSyncedAtUtc).toLocaleString()}</p>
                    ) : null}
                    {setting.lastSyncError ? <p className="mt-2 text-xs text-danger">{setting.lastSyncError}</p> : null}
                    <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Edit calendar sync
                      </summary>
                      <form action={updateCalendarSyncSettingAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                        <input type="hidden" name="organizationId" value={data.organization.id} />
                        <input type="hidden" name="calendarSyncSettingId" value={setting.id} />
                        <input type="hidden" name="isEnabled" value={setting.isEnabled ? "true" : "false"} />
                        <input type="hidden" name="syncAllTeams" value={setting.syncAllTeams ? "true" : "false"} />
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-integration-${setting.id}`}>
                            Integration connection
                          </label>
                          <select
                            id={`calendar-integration-${setting.id}`}
                            name="integrationConnectionId"
                            defaultValue={setting.integrationConnectionId}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            {data.enterprise.integrations
                              .filter((integrationOption) => integrationOption.providerType !== "Slack")
                              .map((integrationOption) => (
                                <option key={integrationOption.id} value={integrationOption.id}>
                                  {integrationOption.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-event-${setting.id}`}>
                            Event type
                          </label>
                          <select
                            id={`calendar-event-${setting.id}`}
                            name="eventType"
                            defaultValue={toCalendarSyncEventTypeValue(setting.eventType)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="1">Reporting cycle window</option>
                            <option value="2">Submission deadline</option>
                            <option value="3">Manager review deadline</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-reference-${setting.id}`}>
                            Calendar reference
                          </label>
                          <Input id={`calendar-reference-${setting.id}`} name="calendarReference" defaultValue={setting.calendarReference} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-label-${setting.id}`}>
                            Calendar label
                          </label>
                          <Input id={`calendar-label-${setting.id}`} name="calendarLabel" defaultValue={setting.calendarLabel} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-reminders-${setting.id}`}>
                            Reminder offsets
                          </label>
                          <Input id={`calendar-reminders-${setting.id}`} name="defaultReminderOffsets" defaultValue={setting.defaultReminderOffsets.join(", ")} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`calendar-team-${setting.id}`}>
                            Team scope
                          </label>
                          <select
                            id={`calendar-team-${setting.id}`}
                            name="teamId"
                            defaultValue={setting.teamId ?? ""}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="">All teams</option>
                            {data.teams.map((teamOption) => (
                              <option key={teamOption.id} value={teamOption.id}>
                                {teamOption.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="isEnabled" className="h-4 w-4 rounded border-border" defaultChecked={setting.isEnabled} />
                            Sync enabled
                          </label>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="syncAllTeams" className="h-4 w-4 rounded border-border" defaultChecked={setting.syncAllTeams} />
                            Apply to all teams
                          </label>
                        </div>
                        <div className="lg:col-span-2">
                          <Button type="submit" size="sm">Save calendar sync</Button>
                        </div>
                      </form>
                    </details>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              No Outlook or Google Calendar sync settings configured yet.
            </div>
          )}
          <form action={createCalendarSyncSettingAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-integration">
                Integration connection
              </label>
              <select id="calendar-sync-integration" name="integrationConnectionId" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                {data.enterprise.integrations
                  .filter((integration) => integration.providerType !== "Slack")
                  .map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-event">
                Event type
              </label>
              <select id="calendar-sync-event" name="eventType" defaultValue="2" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="1">Reporting cycle window</option>
                <option value="2">Submission deadline</option>
                <option value="3">Manager review deadline</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-reference">
                Calendar reference
              </label>
              <Input id="calendar-sync-reference" name="calendarReference" placeholder="calendar-id or group calendar key" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-label">
                Calendar label
              </label>
              <Input id="calendar-sync-label" name="calendarLabel" placeholder="Operations reporting calendar" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-reminders">
                Reminder offsets
              </label>
              <Input id="calendar-sync-reminders" name="defaultReminderOffsets" placeholder="7, 3, 1" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="calendar-sync-team">
                Team scope
              </label>
              <select id="calendar-sync-team" name="teamId" defaultValue="" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="">All teams</option>
                {data.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isEnabled" className="h-4 w-4 rounded border-border" defaultChecked />
              Enable sync
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="syncAllTeams" className="h-4 w-4 rounded border-border" defaultChecked />
              Apply to all teams
            </label>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0}>
                Add calendar sync
              </Button>
              {data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Add a Microsoft 365 or Google Workspace integration before creating calendar sync settings.</p>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Cloud export destinations</h2>
            <p className="text-sm text-muted-foreground">Send team and personal MSR exports to SharePoint, OneDrive, or Google Drive destinations connected through your enterprise integrations.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {data.enterprise.exportDestinations.length > 0 ? (
            <div className="space-y-3">
              {data.enterprise.exportDestinations.map((destination) => {
                const integration = data.enterprise.integrations.find((item) => item.id === destination.integrationConnectionId);

                return (
                  <div key={destination.id} className="rounded-[0.8rem] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{destination.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatValue(destination.destinationType)} via {integration?.name ?? "Unknown integration"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {destination.isDefault ? <Badge variant="accent">Default</Badge> : null}
                        <Badge variant={destination.isActive ? "success" : "neutral"}>{destination.isActive ? "Active" : "Paused"}</Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Reference: {destination.destinationReference}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Path: {destination.destinationPath}</p>
                    {destination.lastValidatedAtUtc ? (
                      <p className="mt-2 text-xs text-muted-foreground">Last validated {new Date(destination.lastValidatedAtUtc).toLocaleString()}</p>
                    ) : null}
                    {destination.lastValidationError ? <p className="mt-2 text-xs text-danger">{destination.lastValidationError}</p> : null}
                    {destination.lastDeliveryError ? <p className="mt-2 text-xs text-danger">{destination.lastDeliveryError}</p> : null}
                    <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Edit destination
                      </summary>
                      <form action={updateExportDestinationAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                        <input type="hidden" name="organizationId" value={data.organization.id} />
                        <input type="hidden" name="exportDestinationId" value={destination.id} />
                        <input type="hidden" name="isDefault" value={destination.isDefault ? "true" : "false"} />
                        <input type="hidden" name="isActive" value={destination.isActive ? "true" : "false"} />
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`export-integration-${destination.id}`}>
                            Integration connection
                          </label>
                          <select
                            id={`export-integration-${destination.id}`}
                            name="integrationConnectionId"
                            defaultValue={destination.integrationConnectionId}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            {data.enterprise.integrations
                              .filter((integrationOption) => integrationOption.providerType !== "Slack")
                              .map((integrationOption) => (
                                <option key={integrationOption.id} value={integrationOption.id}>
                                  {integrationOption.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`export-type-${destination.id}`}>
                            Destination type
                          </label>
                          <select
                            id={`export-type-${destination.id}`}
                            name="destinationType"
                            defaultValue={toExportDestinationTypeValue(destination.destinationType)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="1">SharePoint library</option>
                            <option value="2">OneDrive folder</option>
                            <option value="3">Google Drive folder</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`export-name-${destination.id}`}>
                            Destination name
                          </label>
                          <Input id={`export-name-${destination.id}`} name="name" defaultValue={destination.name} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`export-reference-${destination.id}`}>
                            Destination reference
                          </label>
                          <Input id={`export-reference-${destination.id}`} name="destinationReference" defaultValue={destination.destinationReference} />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-xs font-medium" htmlFor={`export-path-${destination.id}`}>
                            Path / folder
                          </label>
                          <Input id={`export-path-${destination.id}`} name="destinationPath" defaultValue={destination.destinationPath} />
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border" defaultChecked={destination.isDefault} />
                            Make default destination
                          </label>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked={destination.isActive} />
                            Destination active
                          </label>
                        </div>
                        <div className="lg:col-span-2">
                          <Button type="submit" size="sm">Save destination</Button>
                        </div>
                      </form>
                    </details>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              No SharePoint, OneDrive, or Google Drive destinations configured yet.
            </div>
          )}
          <form action={createExportDestinationAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="export-destination-integration">
                Integration connection
              </label>
              <select id="export-destination-integration" name="integrationConnectionId" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                {data.enterprise.integrations
                  .filter((integration) => integration.providerType !== "Slack")
                  .map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="export-destination-type">
                Destination type
              </label>
              <select id="export-destination-type" name="destinationType" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="1">SharePoint library</option>
                <option value="2">OneDrive folder</option>
                <option value="3">Google Drive folder</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="export-destination-name">
                Destination name
              </label>
              <Input id="export-destination-name" name="name" placeholder="Executive reports library" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="export-destination-reference">
                Destination reference
              </label>
              <Input id="export-destination-reference" name="destinationReference" placeholder="site-id, drive-id, folder-id" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="export-destination-path">
                Path / folder
              </label>
              <Input id="export-destination-path" name="destinationPath" placeholder="/Shared Documents/MSRs/2026" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border" />
              Make default destination
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked />
              Activate destination
            </label>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0}>
                Add export destination
              </Button>
              {data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Add a Microsoft 365 or Google Workspace integration before creating export destinations.</p>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Provisioning and lifecycle</h2>
            <p className="text-sm text-muted-foreground">Configure how enterprise identities are provisioned, mapped, and synchronized into FlowForge.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <Setting label="Sync mode" value={formatValue(data.enterprise.provisioning.syncMode)} />
            <Setting label="Auto provision" value={data.enterprise.provisioning.autoProvisionNewUsers ? "Enabled" : "Disabled"} />
            <Setting label="Auto deactivate" value={data.enterprise.provisioning.autoDeactivateMissingUsers ? "Enabled" : "Disabled"} />
            <Setting label="Last sync" value={data.enterprise.provisioning.lastSyncStatus} />
          </div>
          <form action={updateProvisioningSettingsAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="provisioning-syncMode">
                Sync mode
              </label>
              <select
                id="provisioning-syncMode"
                name="syncMode"
                defaultValue={toProvisioningSyncModeValue(data.enterprise.provisioning.syncMode)}
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <option value="1">Manual</option>
                <option value="2">Just-in-time</option>
                <option value="3">SCIM</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="provisioning-identityProviderId">
                Identity provider
              </label>
              <select
                id="provisioning-identityProviderId"
                name="identityProviderId"
                defaultValue={data.enterprise.provisioning.identityProviderId ?? ""}
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
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="provisioning-groupMappingStrategy">
                Group mapping strategy
              </label>
              <Input id="provisioning-groupMappingStrategy" name="groupMappingStrategy" defaultValue={data.enterprise.provisioning.groupMappingStrategy} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="provisioning-scimBaseUrl">
                SCIM base URL
              </label>
              <Input id="provisioning-scimBaseUrl" name="scimBaseUrl" defaultValue={data.enterprise.provisioning.scimBaseUrl} placeholder="https://app.flowforge.com/scim/v2" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="provisioning-scimSecretReference">
                SCIM secret reference
              </label>
              <Input id="provisioning-scimSecretReference" name="scimSecretReference" placeholder="Managed secret value or reference" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="autoProvisionNewUsers" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.provisioning.autoProvisionNewUsers} />
              Automatically provision new users
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="autoDeactivateMissingUsers" className="h-4 w-4 rounded border-border" defaultChecked={data.enterprise.provisioning.autoDeactivateMissingUsers} />
              Automatically deactivate missing users
            </label>
            <div className="lg:col-span-2">
              <Button type="submit">Save provisioning settings</Button>
            </div>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[0.8rem] border border-border bg-surface p-4">
            <div className="space-y-1">
              <p className="font-medium">Trigger provisioning sync</p>
              <p className="text-sm text-muted-foreground">Create a provisioning job record for admin-triggered lifecycle syncs.</p>
            </div>
            <form action={triggerProvisioningJobAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="organizationId" value={data.organization.id} />
              <input type="hidden" name="triggeredBy" value="OrgAdmin" />
              <input type="hidden" name="summary" value="Provisioning sync requested from organization settings." />
              <Button type="submit" variant="secondary">Run sync</Button>
            </form>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recent provisioning jobs</h3>
            {data.enterprise.provisioningJobs.length > 0 ? (
              data.enterprise.provisioningJobs.map((job) => (
                <div key={job.id} className="rounded-[0.7rem] border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{job.summary}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatValue(job.syncMode)} sync started {new Date(job.startedAtUtc).toLocaleString()} by {job.triggeredBy}
                      </p>
                    </div>
                    <Badge variant={job.status === "Succeeded" ? "success" : job.status === "Failed" ? "danger" : "neutral"}>
                      {formatValue(job.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Processed {job.usersProcessed} users, created {job.usersCreated}, updated {job.usersUpdated}, deactivated {job.usersDeactivated}.
                  </p>
                  {job.errorDetails ? <p className="mt-2 text-sm text-danger">{job.errorDetails}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
                No provisioning jobs have been recorded yet.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Directory group mappings</h2>
            <p className="text-sm text-muted-foreground">Map Microsoft Entra ID or Google Workspace groups to FlowForge teams so provisioning can place users with the right default role.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {data.enterprise.directoryGroupMappings.length > 0 ? (
            <div className="space-y-3">
              {data.enterprise.directoryGroupMappings.map((mapping) => {
                const provider = data.enterprise.identityProviders.find((item) => item.id === mapping.identityProviderId);
                const team = data.teams.find((item) => item.id === mapping.teamId);

                return (
                  <div key={mapping.id} className="rounded-[0.8rem] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{mapping.externalGroupName}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider?.name ?? "Unknown provider"} to {team?.name ?? "Unknown team"} as {formatValue(mapping.defaultRole)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={mapping.isActive ? "success" : "neutral"}>{mapping.isActive ? "Active" : "Paused"}</Badge>
                        <Badge variant={mapping.syncMembers ? "accent" : "neutral"}>{mapping.syncMembers ? "Sync members" : "Metadata only"}</Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">External group ID: {mapping.externalGroupId}</p>
                    {mapping.lastSyncedAtUtc ? (
                      <p className="mt-2 text-xs text-muted-foreground">Last synced {new Date(mapping.lastSyncedAtUtc).toLocaleString()}</p>
                    ) : null}
                    {mapping.lastSyncError ? <p className="mt-2 text-xs text-danger">{mapping.lastSyncError}</p> : null}
                    <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Edit mapping
                      </summary>
                      <form action={updateDirectoryGroupMappingAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                        <input type="hidden" name="organizationId" value={data.organization.id} />
                        <input type="hidden" name="directoryGroupMappingId" value={mapping.id} />
                        <input type="hidden" name="isActive" value={mapping.isActive ? "true" : "false"} />
                        <input type="hidden" name="syncMembers" value={mapping.syncMembers ? "true" : "false"} />
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`group-provider-${mapping.id}`}>
                            Identity provider
                          </label>
                          <select
                            id={`group-provider-${mapping.id}`}
                            name="identityProviderId"
                            defaultValue={mapping.identityProviderId}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            {data.enterprise.identityProviders.map((providerOption) => (
                              <option key={providerOption.id} value={providerOption.id}>
                                {providerOption.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`group-team-${mapping.id}`}>
                            FlowForge team
                          </label>
                          <select
                            id={`group-team-${mapping.id}`}
                            name="teamId"
                            defaultValue={mapping.teamId}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            {data.teams.map((teamOption) => (
                              <option key={teamOption.id} value={teamOption.id}>
                                {teamOption.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`group-external-id-${mapping.id}`}>
                            External group ID
                          </label>
                          <Input id={`group-external-id-${mapping.id}`} name="externalGroupId" defaultValue={mapping.externalGroupId} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`group-name-${mapping.id}`}>
                            External group name
                          </label>
                          <Input id={`group-name-${mapping.id}`} name="externalGroupName" defaultValue={mapping.externalGroupName} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`group-role-${mapping.id}`}>
                            Default role
                          </label>
                          <select
                            id={`group-role-${mapping.id}`}
                            name="defaultRole"
                            defaultValue={toPlatformRoleValue(mapping.defaultRole)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="2">Org admin</option>
                            <option value="3">Manager</option>
                            <option value="4">Team member</option>
                            <option value="5">Executive viewer</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked={mapping.isActive} />
                            Mapping active
                          </label>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="syncMembers" className="h-4 w-4 rounded border-border" defaultChecked={mapping.syncMembers} />
                            Sync members into team
                          </label>
                        </div>
                        <div className="lg:col-span-2">
                          <Button type="submit" size="sm">Save mapping</Button>
                        </div>
                      </form>
                    </details>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              No directory group mappings configured yet.
            </div>
          )}
          <form action={createDirectoryGroupMappingAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="directory-provider">
                Identity provider
              </label>
              <select id="directory-provider" name="identityProviderId" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                {data.enterprise.identityProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="directory-team">
                FlowForge team
              </label>
              <select id="directory-team" name="teamId" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                {data.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="directory-externalGroupId">
                External group ID
              </label>
              <Input id="directory-externalGroupId" name="externalGroupId" placeholder="group object ID or directory group key" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="directory-externalGroupName">
                External group name
              </label>
              <Input id="directory-externalGroupName" name="externalGroupName" placeholder="Field Operations Managers" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="directory-defaultRole">
                Default role
              </label>
              <select id="directory-defaultRole" name="defaultRole" defaultValue="4" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="2">Org admin</option>
                <option value="3">Manager</option>
                <option value="4">Team member</option>
                <option value="5">Executive viewer</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked />
                Activate mapping
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name="syncMembers" className="h-4 w-4 rounded border-border" defaultChecked />
                Sync members into team
              </label>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={data.enterprise.identityProviders.length === 0 || data.teams.length === 0}>
                Add directory group mapping
              </Button>
              {data.enterprise.identityProviders.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Add an identity provider before creating directory group mappings.</p>
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">External notification routes</h2>
            <p className="text-sm text-muted-foreground">Route assignment, blocker, reminder, and report events into Microsoft Teams or Google Chat through your configured enterprise integrations.</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {data.enterprise.notificationRoutes.length > 0 ? (
            <div className="space-y-3">
              {data.enterprise.notificationRoutes.map((route) => {
                const integration = data.enterprise.integrations.find((item) => item.id === route.integrationConnectionId);

                return (
                  <div key={route.id} className="rounded-[0.8rem] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{route.destinationLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatValue(route.notificationType)} via {integration?.name ?? "Unknown integration"} to {formatValue(route.targetType)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={route.isActive ? "success" : "neutral"}>{route.isActive ? "Active" : "Paused"}</Badge>
                        {route.sendDailyDigest ? <Badge variant="accent">Daily digest</Badge> : null}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Destination reference: {route.destinationReference}</p>
                    {route.lastDeliveredAtUtc ? (
                      <p className="mt-2 text-xs text-muted-foreground">Last delivered {new Date(route.lastDeliveredAtUtc).toLocaleString()}</p>
                    ) : null}
                    {route.lastDeliveryError ? <p className="mt-2 text-xs text-danger">{route.lastDeliveryError}</p> : null}
                    <details className="mt-3 rounded-[0.7rem] border border-border bg-surface-2 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Edit route
                      </summary>
                      <form action={updateNotificationRouteAction} className="mt-3 grid gap-3 lg:grid-cols-2">
                        <input type="hidden" name="organizationId" value={data.organization.id} />
                        <input type="hidden" name="notificationRouteId" value={route.id} />
                        <input type="hidden" name="isActive" value={route.isActive ? "true" : "false"} />
                        <input type="hidden" name="sendDailyDigest" value={route.sendDailyDigest ? "true" : "false"} />
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`route-integration-${route.id}`}>
                            Integration connection
                          </label>
                          <select
                            id={`route-integration-${route.id}`}
                            name="integrationConnectionId"
                            defaultValue={route.integrationConnectionId}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            {data.enterprise.integrations
                              .filter((integrationOption) => integrationOption.providerType !== "Slack")
                              .map((integrationOption) => (
                                <option key={integrationOption.id} value={integrationOption.id}>
                                  {integrationOption.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`route-type-${route.id}`}>
                            Notification event
                          </label>
                          <select
                            id={`route-type-${route.id}`}
                            name="notificationType"
                            defaultValue={toNotificationTypeValue(route.notificationType)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="1">Assignment</option>
                            <option value="3">Mention</option>
                            <option value="4">Reminder</option>
                            <option value="5">Report</option>
                            <option value="6">System</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`route-target-${route.id}`}>
                            Destination type
                          </label>
                          <select
                            id={`route-target-${route.id}`}
                            name="targetType"
                            defaultValue={toNotificationTargetTypeValue(route.targetType)}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm"
                          >
                            <option value="1">Teams channel</option>
                            <option value="2">Google Chat space</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium" htmlFor={`route-destination-reference-${route.id}`}>
                            Destination reference
                          </label>
                          <Input id={`route-destination-reference-${route.id}`} name="destinationReference" defaultValue={route.destinationReference} />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-xs font-medium" htmlFor={`route-destination-label-${route.id}`}>
                            Destination label
                          </label>
                          <Input id={`route-destination-label-${route.id}`} name="destinationLabel" defaultValue={route.destinationLabel} />
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked={route.isActive} />
                            Route active
                          </label>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" name="sendDailyDigest" className="h-4 w-4 rounded border-border" defaultChecked={route.sendDailyDigest} />
                            Send daily digest
                          </label>
                        </div>
                        <div className="lg:col-span-2">
                          <Button type="submit" size="sm">Save route</Button>
                        </div>
                      </form>
                    </details>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[0.7rem] border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              No Teams or Google Chat notification routes configured yet.
            </div>
          )}
          <form action={createNotificationRouteAction} className="grid gap-4 rounded-[0.8rem] border border-border bg-surface p-4 lg:grid-cols-2">
            <input type="hidden" name="organizationId" value={data.organization.id} />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notification-route-integration">
                Integration connection
              </label>
              <select id="notification-route-integration" name="integrationConnectionId" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                {data.enterprise.integrations
                  .filter((integration) => integration.providerType !== "Slack")
                  .map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notification-route-type">
                Notification event
              </label>
              <select id="notification-route-type" name="notificationType" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="1">Assignment</option>
                <option value="3">Mention</option>
                <option value="4">Reminder</option>
                <option value="5">Report</option>
                <option value="6">System</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notification-route-target">
                Destination type
              </label>
              <select id="notification-route-target" name="targetType" defaultValue="1" className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground shadow-sm">
                <option value="1">Teams channel</option>
                <option value="2">Google Chat space</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="notification-route-reference">
                Destination reference
              </label>
              <Input id="notification-route-reference" name="destinationReference" placeholder="channel-id or spaces/AAAA..." />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium" htmlFor="notification-route-label">
                Destination label
              </label>
              <Input id="notification-route-label" name="destinationLabel" placeholder="Ops leadership channel" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isActive" className="h-4 w-4 rounded border-border" defaultChecked />
              Activate route
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="sendDailyDigest" className="h-4 w-4 rounded border-border" />
              Send daily digest
            </label>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0}>
                Add notification route
              </Button>
              {data.enterprise.integrations.filter((integration) => integration.providerType !== "Slack").length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Add a Microsoft 365 or Google Workspace integration before creating external notification routes.</p>
              ) : null}
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
                          <Badge
                            variant={
                              provider.validationStatus === "Valid"
                                ? "success"
                                : provider.validationStatus === "Invalid"
                                  ? "danger"
                                  : "neutral"
                            }
                          >
                            {formatValue(provider.validationStatus)}
                          </Badge>
                          {provider.lastValidatedAtUtc ? (
                            <p className="mt-2 text-xs text-muted-foreground">Last validated {new Date(provider.lastValidatedAtUtc).toLocaleString()}</p>
                          ) : null}
                          {provider.lastValidationError ? (
                            <p className="mt-2 text-xs text-danger">{provider.lastValidationError}</p>
                          ) : null}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <form action={validateIdentityProviderAction}>
                              <input type="hidden" name="organizationId" value={data.organization.id} />
                              <input type="hidden" name="identityProviderId" value={provider.id} />
                              <Button type="submit" size="sm" variant="secondary">Validate</Button>
                            </form>
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
                              <Button type="submit" size="sm" variant="ghost">{provider.isEnabled ? "Disable" : "Enable"}</Button>
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

function toProvisioningSyncModeValue(value: string) {
  switch (value) {
    case "JustInTime":
      return "2";
    case "Scim":
      return "3";
    default:
      return "1";
  }
}

function toPlatformRoleValue(value: string) {
  switch (value) {
    case "OrgAdmin":
      return "2";
    case "Manager":
      return "3";
    case "ExecutiveViewer":
      return "5";
    default:
      return "4";
  }
}

function toNotificationTypeValue(value: string) {
  switch (value) {
    case "Assignment":
      return "1";
    case "Mention":
      return "3";
    case "Reminder":
      return "4";
    case "Report":
      return "5";
    default:
      return "6";
  }
}

function toNotificationTargetTypeValue(value: string) {
  switch (value) {
    case "GoogleChatSpace":
      return "2";
    default:
      return "1";
  }
}

function toExportDestinationTypeValue(value: string) {
  switch (value) {
    case "OneDriveFolder":
      return "2";
    case "GoogleDriveFolder":
      return "3";
    default:
      return "1";
  }
}

function toCalendarSyncEventTypeValue(value: string) {
  switch (value) {
    case "ReportingCycleWindow":
      return "1";
    case "ManagerReviewDeadline":
      return "3";
    default:
      return "2";
  }
}
