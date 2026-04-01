import Link from "next/link";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function RegisterPage() {
  return (
    <AuthShell title="Create your workspace" description="Register a new organization and start building boards, teams, and reporting cycles.">
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="name" defaultValue="Taylor Morgan" />
          <Field label="Email" id="email" type="email" defaultValue="taylor@company.com" />
        </div>
        <Field label="Organization name" id="org" defaultValue="Acme Operations" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="role">
              Role
            </label>
            <Select id="role" defaultValue="OrgAdmin">
              <option value="OrgAdmin">Org Admin</option>
              <option value="Manager">Manager</option>
              <option value="TeamMember">Team Member</option>
            </Select>
          </div>
          <Field label="Password" id="password" type="password" defaultValue="password123" />
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
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
      <Input id={id} type={type} defaultValue={defaultValue} />
    </div>
  );
}

