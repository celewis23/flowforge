"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function apiMutation(path: string, method: "PUT" | "POST", body: unknown) {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login?error=session-expired");
  }

  if (!response.ok) {
    throw new Error(`Enterprise settings request failed for ${path}`);
  }
}

export async function updateEnterpriseAuthSettingsAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const allowedDomains = String(formData.get("allowedDomains") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/authentication`, "PUT", {
    authenticationMode: Number(formData.get("authenticationMode") ?? 1),
    allowLocalPasswordSignIn: formData.get("allowLocalPasswordSignIn") === "on",
    requireMfaByDefault: formData.get("requireMfaByDefault") === "on",
    allowJustInTimeProvisioning: formData.get("allowJustInTimeProvisioning") === "on",
    enforceDomainVerification: formData.get("enforceDomainVerification") === "on",
    allowedDomains,
    defaultIdentityProviderId: formData.get("defaultIdentityProviderId") ? String(formData.get("defaultIdentityProviderId")) : null,
  });

  revalidatePath("/organization-settings");
}

export async function createIdentityProviderAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const scopes = String(formData.get("scopes") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const domainHints = String(formData.get("domainHints") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/identity-providers`, "POST", {
    identityProviderId: null,
    name: String(formData.get("name") ?? ""),
    providerType: Number(formData.get("providerType") ?? 1),
    clientId: String(formData.get("clientId") ?? ""),
    clientSecretReference: String(formData.get("clientSecretReference") ?? ""),
    authority: String(formData.get("authority") ?? ""),
    metadataUrl: String(formData.get("metadataUrl") ?? ""),
    tenantIdentifier: String(formData.get("tenantIdentifier") ?? ""),
    scopes,
    domainHints,
    roleMappingsJson: String(formData.get("roleMappingsJson") ?? "{}"),
    provisioningMode: Number(formData.get("provisioningMode") ?? 1),
    isEnabled: formData.get("isEnabled") === "on",
    isPrimary: formData.get("isPrimary") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function updateIdentityProviderStateAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const scopes = String(formData.get("scopes") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const domainHints = String(formData.get("domainHints") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/identity-providers`, "POST", {
    identityProviderId: String(formData.get("identityProviderId") ?? ""),
    name: String(formData.get("name") ?? ""),
    providerType: Number(formData.get("providerType") ?? 1),
    clientId: String(formData.get("clientId") ?? ""),
    clientSecretReference: String(formData.get("clientSecretReference") ?? ""),
    authority: String(formData.get("authority") ?? ""),
    metadataUrl: String(formData.get("metadataUrl") ?? ""),
    tenantIdentifier: String(formData.get("tenantIdentifier") ?? ""),
    scopes,
    domainHints,
    roleMappingsJson: String(formData.get("roleMappingsJson") ?? "{}"),
    provisioningMode: Number(formData.get("provisioningMode") ?? 1),
    isEnabled: formData.get("isEnabled") === "true",
    isPrimary: formData.get("isPrimary") === "true",
  });

  revalidatePath("/organization-settings");
}

export async function validateIdentityProviderAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/identity-providers/validate`, "POST", {
    identityProviderId: String(formData.get("identityProviderId") ?? ""),
  });

  revalidatePath("/organization-settings");
}

export async function createIntegrationConnectionAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const scopes = String(formData.get("scopes") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/integrations`, "POST", {
    integrationConnectionId: null,
    name: String(formData.get("name") ?? ""),
    providerType: Number(formData.get("providerType") ?? 1),
    clientId: String(formData.get("clientId") ?? ""),
    clientSecretReference: String(formData.get("clientSecretReference") ?? ""),
    tenantIdentifier: String(formData.get("tenantIdentifier") ?? ""),
    scopes,
    configurationJson: String(formData.get("configurationJson") ?? "{}"),
    status: Number(formData.get("status") ?? 1),
  });

  revalidatePath("/organization-settings");
}

export async function updateIntegrationConnectionStateAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const scopes = String(formData.get("scopes") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/integrations`, "POST", {
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    name: String(formData.get("name") ?? ""),
    providerType: Number(formData.get("providerType") ?? 1),
    clientId: String(formData.get("clientId") ?? ""),
    clientSecretReference: String(formData.get("clientSecretReference") ?? ""),
    tenantIdentifier: String(formData.get("tenantIdentifier") ?? ""),
    scopes,
    configurationJson: String(formData.get("configurationJson") ?? "{}"),
    status: Number(formData.get("status") ?? 1),
  });

  revalidatePath("/organization-settings");
}

export async function createVerifiedDomainAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/domains`, "POST", {
    verifiedDomainId: null,
    domain: String(formData.get("domain") ?? ""),
    verificationMethod: String(formData.get("verificationMethod") ?? "DnsTxt"),
  });

  revalidatePath("/organization-settings");
}

export async function updateVerifiedDomainAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/domains`, "POST", {
    verifiedDomainId: String(formData.get("verifiedDomainId") ?? ""),
    domain: String(formData.get("domain") ?? ""),
    verificationMethod: String(formData.get("verificationMethod") ?? "DnsTxt"),
  });

  revalidatePath("/organization-settings");
}

export async function verifyDomainStateAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/domains/verify`, "POST", {
    verifiedDomainId: String(formData.get("verifiedDomainId") ?? ""),
    verified: formData.get("verified") === "true",
    failureReason: String(formData.get("failureReason") ?? ""),
  });

  revalidatePath("/organization-settings");
}

export async function updateProvisioningSettingsAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/provisioning`, "PUT", {
    syncMode: Number(formData.get("syncMode") ?? 1),
    identityProviderId: formData.get("identityProviderId") ? String(formData.get("identityProviderId")) : null,
    autoProvisionNewUsers: formData.get("autoProvisionNewUsers") === "on",
    autoDeactivateMissingUsers: formData.get("autoDeactivateMissingUsers") === "on",
    groupMappingStrategy: String(formData.get("groupMappingStrategy") ?? "Manual"),
    scimBaseUrl: String(formData.get("scimBaseUrl") ?? ""),
    scimSecretReference: String(formData.get("scimSecretReference") ?? ""),
  });

  revalidatePath("/organization-settings");
}

export async function triggerProvisioningJobAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/provisioning/jobs`, "POST", {
    triggeredBy: String(formData.get("triggeredBy") ?? "OrgAdmin"),
    summary: String(formData.get("summary") ?? "Provisioning sync requested from admin console."),
  });

  revalidatePath("/organization-settings");
}

export async function createDirectoryGroupMappingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/directory-group-mappings`, "POST", {
    directoryGroupMappingId: null,
    identityProviderId: String(formData.get("identityProviderId") ?? ""),
    teamId: String(formData.get("teamId") ?? ""),
    externalGroupId: String(formData.get("externalGroupId") ?? ""),
    externalGroupName: String(formData.get("externalGroupName") ?? ""),
    defaultRole: Number(formData.get("defaultRole") ?? 4),
    isActive: formData.get("isActive") === "on",
    syncMembers: formData.get("syncMembers") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function updateDirectoryGroupMappingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/directory-group-mappings`, "POST", {
    directoryGroupMappingId: String(formData.get("directoryGroupMappingId") ?? ""),
    identityProviderId: String(formData.get("identityProviderId") ?? ""),
    teamId: String(formData.get("teamId") ?? ""),
    externalGroupId: String(formData.get("externalGroupId") ?? ""),
    externalGroupName: String(formData.get("externalGroupName") ?? ""),
    defaultRole: Number(formData.get("defaultRole") ?? 4),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
    syncMembers: formData.get("syncMembers") === "true" || formData.get("syncMembers") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function createNotificationRouteAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/notification-routes`, "POST", {
    notificationRouteId: null,
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    notificationType: Number(formData.get("notificationType") ?? 6),
    targetType: Number(formData.get("targetType") ?? 1),
    destinationReference: String(formData.get("destinationReference") ?? ""),
    destinationLabel: String(formData.get("destinationLabel") ?? ""),
    isActive: formData.get("isActive") === "on",
    sendDailyDigest: formData.get("sendDailyDigest") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function updateNotificationRouteAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/notification-routes`, "POST", {
    notificationRouteId: String(formData.get("notificationRouteId") ?? ""),
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    notificationType: Number(formData.get("notificationType") ?? 6),
    targetType: Number(formData.get("targetType") ?? 1),
    destinationReference: String(formData.get("destinationReference") ?? ""),
    destinationLabel: String(formData.get("destinationLabel") ?? ""),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
    sendDailyDigest: formData.get("sendDailyDigest") === "true" || formData.get("sendDailyDigest") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function createExportDestinationAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/export-destinations`, "POST", {
    exportDestinationId: null,
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    destinationType: Number(formData.get("destinationType") ?? 1),
    name: String(formData.get("name") ?? ""),
    destinationReference: String(formData.get("destinationReference") ?? ""),
    destinationPath: String(formData.get("destinationPath") ?? ""),
    isDefault: formData.get("isDefault") === "on",
    isActive: formData.get("isActive") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function updateExportDestinationAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/export-destinations`, "POST", {
    exportDestinationId: String(formData.get("exportDestinationId") ?? ""),
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    destinationType: Number(formData.get("destinationType") ?? 1),
    name: String(formData.get("name") ?? ""),
    destinationReference: String(formData.get("destinationReference") ?? ""),
    destinationPath: String(formData.get("destinationPath") ?? ""),
    isDefault: formData.get("isDefault") === "true" || formData.get("isDefault") === "on",
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function createCalendarSyncSettingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const defaultReminderOffsets = String(formData.get("defaultReminderOffsets") ?? "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item) && item >= 0);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/calendar-sync`, "POST", {
    calendarSyncSettingId: null,
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    eventType: Number(formData.get("eventType") ?? 2),
    calendarReference: String(formData.get("calendarReference") ?? ""),
    calendarLabel: String(formData.get("calendarLabel") ?? ""),
    defaultReminderOffsets,
    isEnabled: formData.get("isEnabled") === "on",
    syncAllTeams: formData.get("syncAllTeams") === "on",
    teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
  });

  revalidatePath("/organization-settings");
}

export async function updateCalendarSyncSettingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");
  const defaultReminderOffsets = String(formData.get("defaultReminderOffsets") ?? "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item) && item >= 0);

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/calendar-sync`, "POST", {
    calendarSyncSettingId: String(formData.get("calendarSyncSettingId") ?? ""),
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    eventType: Number(formData.get("eventType") ?? 2),
    calendarReference: String(formData.get("calendarReference") ?? ""),
    calendarLabel: String(formData.get("calendarLabel") ?? ""),
    defaultReminderOffsets,
    isEnabled: formData.get("isEnabled") === "true" || formData.get("isEnabled") === "on",
    syncAllTeams: formData.get("syncAllTeams") === "true" || formData.get("syncAllTeams") === "on",
    teamId: formData.get("teamId") ? String(formData.get("teamId")) : null,
  });

  revalidatePath("/organization-settings");
}

export async function createProfileSyncSettingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/profile-sync`, "POST", {
    profileSyncSettingId: null,
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    isEnabled: formData.get("isEnabled") === "on",
    syncJobTitles: formData.get("syncJobTitles") === "on",
    syncDepartments: formData.get("syncDepartments") === "on",
    syncManagerHierarchy: formData.get("syncManagerHierarchy") === "on",
    syncOfficeLocation: formData.get("syncOfficeLocation") === "on",
    syncProfilePhotos: formData.get("syncProfilePhotos") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function updateProfileSyncSettingAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/profile-sync`, "POST", {
    profileSyncSettingId: String(formData.get("profileSyncSettingId") ?? ""),
    integrationConnectionId: String(formData.get("integrationConnectionId") ?? ""),
    isEnabled: formData.get("isEnabled") === "true" || formData.get("isEnabled") === "on",
    syncJobTitles: formData.get("syncJobTitles") === "true" || formData.get("syncJobTitles") === "on",
    syncDepartments: formData.get("syncDepartments") === "true" || formData.get("syncDepartments") === "on",
    syncManagerHierarchy: formData.get("syncManagerHierarchy") === "true" || formData.get("syncManagerHierarchy") === "on",
    syncOfficeLocation: formData.get("syncOfficeLocation") === "true" || formData.get("syncOfficeLocation") === "on",
    syncProfilePhotos: formData.get("syncProfilePhotos") === "true" || formData.get("syncProfilePhotos") === "on",
  });

  revalidatePath("/organization-settings");
}

export async function triggerProfileSyncAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "");

  await apiMutation(`/api/organizations/${organizationId}/enterprise-settings/profile-sync/jobs`, "POST", {
    profileSyncSettingId: String(formData.get("profileSyncSettingId") ?? ""),
    triggeredBy: String(formData.get("triggeredBy") ?? "OrgAdmin"),
    summary: String(formData.get("summary") ?? "Directory profile sync requested from organization settings."),
  });

  revalidatePath("/organization-settings");
  revalidatePath("/team-members");
}
