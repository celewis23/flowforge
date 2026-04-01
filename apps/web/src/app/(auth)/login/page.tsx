import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { loginAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title="Welcome back" description="Sign in to review boards, compile MSRs, and keep your teams moving.">
      <form action={loginAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="name@company.com" defaultValue="marcus.reed@demo.example.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input id="password" name="password" type="password" placeholder="••••••••" defaultValue="Passw0rd!" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border" defaultChecked />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-accent">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        {params?.error ? <p className="text-sm font-medium text-red-600">Sign-in failed. Check your email and password.</p> : null}
      </form>
      <div className="space-y-3 text-sm text-muted-foreground">
        <Badge variant="neutral">Demo tenant ready</Badge>
        <p>Use `marcus.reed@demo.example.com` and `Passw0rd!` to enter the live API-backed demo workspace.</p>
      </div>
    </AuthShell>
  );
}
