import { BrandLogo } from "@/components/layout/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(235,90,36,0.12),transparent_26%),radial-gradient(circle_at_top_right,_rgba(28,163,166,0.1),transparent_24%)]" />
      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[1rem] border border-border bg-surface-2 px-8 py-8 text-foreground shadow-soft sm:px-10 sm:py-10">
          <div className="space-y-6">
            <BrandLogo />
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              <p className="max-w-lg text-base leading-7 text-muted-foreground">{description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[0.85rem] border border-border bg-muted p-4">
                <div className="text-2xl font-semibold">Live boards</div>
                <p className="mt-1 text-sm text-muted-foreground">manager assignments, collaboration, and reporting in one stream</p>
              </div>
              <div className="rounded-[0.85rem] border border-border bg-muted p-4">
                <div className="text-2xl font-semibold">Role aware</div>
                <p className="mt-1 text-sm text-muted-foreground">team member, manager, and executive perspectives stay aligned</p>
              </div>
              <div className="rounded-[0.85rem] border border-border bg-muted p-4">
                <div className="text-2xl font-semibold">Report ready</div>
                <p className="mt-1 text-sm text-muted-foreground">MSRs, dashboards, and exports built for operating reviews</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <ButtonLink href="/dashboard" variant="secondary">
              Open demo dashboard
            </ButtonLink>
            <span>Accessible boards, reports, and admin controls.</span>
          </div>
        </section>
        <Card>
          <CardBody className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Secure access</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
            </div>
            {children}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
