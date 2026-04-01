import Link from "next/link";
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.22),transparent_30%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,113,133,0.16),transparent_24%)]" />
      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2.25rem] border border-white/10 bg-[linear-gradient(155deg,rgba(10,18,32,0.98),rgba(11,20,38,0.88))] px-8 py-8 text-background shadow-2xl sm:px-10 sm:py-10">
          <div className="space-y-6">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              MSR Command Center
            </Link>
            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              <p className="max-w-lg text-base leading-7 text-background/72">{description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <div className="text-2xl font-semibold">Live boards</div>
                <p className="mt-1 text-sm text-background/70">manager assignments, collaboration, and reporting in one stream</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <div className="text-2xl font-semibold">Role aware</div>
                <p className="mt-1 text-sm text-background/70">team member, manager, and executive perspectives stay aligned</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4 backdrop-blur-md">
                <div className="text-2xl font-semibold">Report ready</div>
                <p className="mt-1 text-sm text-background/70">MSRs, dashboards, and exports built for operating reviews</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-background/75">
            <ButtonLink href="/dashboard" variant="secondary">
              Open demo dashboard
            </ButtonLink>
            <span>Accessible boards, reports, and admin controls.</span>
          </div>
        </section>
        <Card className="bg-white/6">
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
