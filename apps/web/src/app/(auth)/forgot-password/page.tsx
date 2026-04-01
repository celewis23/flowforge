import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your access" description="We'll send a secure password reset link to your email address.">
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="name@company.com" />
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-accent">
          Return to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

