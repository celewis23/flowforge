import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get("ticket");
  if (!ticket) {
    return NextResponse.redirect(new URL("/login?error=enterprise-callback-failed", request.url));
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/enterprise/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exchangeToken: ticket }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/login?error=enterprise-exchange-failed", request.url));
  }

  const payload = (await response.json()) as AuthApiResponse;
  const redirectUrl = new URL("/dashboard", request.url);
  const result = NextResponse.redirect(redirectUrl);

  result.cookies.set("msr_access_token", payload.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  result.cookies.set("msr_user", JSON.stringify(payload.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return result;
}
