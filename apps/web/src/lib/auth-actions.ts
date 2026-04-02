"use server";

import { redirect } from "next/navigation";
import { storeSession } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type AuthApiResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    organizationId: string;
    teamId?: string | null;
  };
  organizationSlug: string;
};

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login?error=invalid-credentials");
  }

  const payload = (await response.json()) as AuthApiResponse;
  await storeSession({
    accessToken: payload.accessToken,
    user: payload.user,
  });

  redirect("/dashboard");
}

type EnterpriseDiscoveryResponse = {
  email: string;
  domain: string;
  isEnterpriseConfigured: boolean;
  isSsoRequired: boolean;
  allowLocalPasswordSignIn: boolean;
  providers: Array<{
    identityProviderId: string;
    providerType: string;
    displayName: string;
    isPrimary: boolean;
  }>;
};

type EnterpriseAuthorizationResponse = {
  authorizeUrl: string;
  providerType: string;
  displayName: string;
};

export async function enterpriseLoginAction(formData: FormData) {
  const email = String(formData.get("enterpriseEmail") ?? "").trim();

  if (!email) {
    redirect("/login?error=enterprise-email-required");
  }

  const discoveryResponse = await fetch(`${apiBaseUrl}/api/auth/enterprise/discovery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });

  if (!discoveryResponse.ok) {
    redirect("/login?error=enterprise-discovery-failed");
  }

  const discovery = (await discoveryResponse.json()) as EnterpriseDiscoveryResponse;
  const provider = discovery.providers.find((item) => item.isPrimary) ?? discovery.providers[0];

  if (!provider) {
    redirect("/login?error=enterprise-not-configured");
  }

  const initiateResponse = await fetch(`${apiBaseUrl}/api/auth/enterprise/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      identityProviderId: provider.identityProviderId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000"}/auth/enterprise/callback`,
    }),
    cache: "no-store",
  });

  if (!initiateResponse.ok) {
    redirect("/login?error=enterprise-initiate-failed");
  }

  const payload = (await initiateResponse.json()) as EnterpriseAuthorizationResponse;
  redirect(payload.authorizeUrl);
}

export async function registerAction(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const organizationName = String(formData.get("organizationName") ?? "");
  const password = String(formData.get("password") ?? "");
  const slugBase = organizationName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName,
      email,
      password,
      organizationName,
      organizationSlug: slugBase || `org-${Date.now()}`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/register?error=registration-failed");
  }

  const payload = (await response.json()) as AuthApiResponse;
  await storeSession({
    accessToken: payload.accessToken,
    user: payload.user,
  });

  redirect("/dashboard");
}
