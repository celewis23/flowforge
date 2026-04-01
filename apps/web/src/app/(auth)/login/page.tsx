import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to review boards, compile MSRs, and keep your teams moving.">
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="name@company.com" defaultValue="maya@northstar.example" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="••••••••" defaultValue="password123" />
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
      </form>
      <div className="space-y-3 text-sm text-muted-foreground">
        <Badge variant="neutral">Demo tenant ready</Badge>
        <p>Use the seeded manager account to explore boards, reporting cycles, and exports.</p>
        <Link href="/dashboard" className="font-medium text-accent">
          Go straight to the dashboard
        </Link>
      </div>
    </AuthShell>
  );
}

