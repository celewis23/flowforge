import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { registerAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title="Create your workspace" description="Register a new organization and start building boards, teams, and reporting cycles.">
      <form action={registerAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="fullName" defaultValue="Taylor Morgan" />
          <Field label="Email" id="email" type="email" defaultValue="taylor@company.com" />
        </div>
        <Field label="Organization name" id="organizationName" defaultValue="Acme Operations" />
        <Field label="Password" id="password" type="password" defaultValue="Passw0rd!" />
        <Button type="submit" className="w-full">
          Create account
        </Button>
        {params?.error ? <p className="text-sm font-medium text-red-600">Registration failed. Try a different email or organization name.</p> : null}
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({
  label,
  id,
  type = "text",
  defaultValue,
}: {
  label: string;
  id: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Input id={id} name={id} type={type} defaultValue={defaultValue} />
    </div>
  );
}
