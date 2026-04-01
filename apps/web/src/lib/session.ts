import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_TOKEN_COOKIE = "msr_access_token";
const USER_COOKIE = "msr_user";

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  organizationId: string;
  teamId?: string | null;
};

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser() {
  const raw = (await cookies()).get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function storeSession(input: { accessToken: string; user: SessionUser }) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, input.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  cookieStore.set(USER_COOKIE, JSON.stringify(input.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
}
