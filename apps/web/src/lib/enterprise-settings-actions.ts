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
