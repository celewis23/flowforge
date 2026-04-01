import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="Set a secure new password and continue back into the dashboard.">
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            New password
          </label>
          <Input id="password" type="password" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm">
            Confirm password
          </label>
          <Input id="confirm" type="password" />
        </div>
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Need a fresh link?{" "}
        <Link href="/forgot-password" className="font-medium text-accent">
          Request another reset
        </Link>
      </p>
    </AuthShell>
  );
}

