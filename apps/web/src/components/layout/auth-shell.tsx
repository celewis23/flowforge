import { BrandLogo } from "@/components/layout/brand-logo";
import { PublicFooter } from "@/components/layout/public-footer";
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
    <main className="min-h-screen">
      <div className="relative flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between rounded-[0.7rem] border border-border bg-surface-2 px-8 py-8 text-foreground shadow-soft sm:px-10 sm:py-10">
            <div className="space-y-6">
              <BrandLogo />
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
                <p className="max-w-lg text-base leading-7 text-muted-foreground">{description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[0.65rem] border border-border bg-muted p-4">
                  <div className="text-2xl font-semibold">Live boards</div>
                  <p className="mt-1 text-sm text-muted-foreground">manager assignments, collaboration, and reporting in one stream</p>
                </div>
                <div className="rounded-[0.65rem] border border-border bg-muted p-4">
                  <div className="text-2xl font-semibold">Enterprise fit</div>
                  <p className="mt-1 text-sm text-muted-foreground">Google Workspace and Microsoft setup paths built into the platform</p>
                </div>
                <div className="rounded-[0.65rem] border border-border bg-muted p-4">
                  <div className="text-2xl font-semibold">Report ready</div>
                  <p className="mt-1 text-sm text-muted-foreground">MSRs, dashboards, and exports built for operating reviews</p>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <ButtonLink href="/dashboard" variant="secondary">
                Open demo dashboard
              </ButtonLink>
              <span>Accessible boards, reports, admin controls, and integration onboarding.</span>
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
      </div>
      <PublicFooter />
    </main>
  );
}
