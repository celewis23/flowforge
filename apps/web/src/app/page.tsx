import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { marketingNav } from "@/lib/navigation";
import { getMarketingStats } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function Home() {
  const stats = await getMarketingStats();

  return (
    <main className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <section className="grid items-start gap-6 pb-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-5">
          <div className="space-y-5">
            <BrandLogo hero className="w-fit" />
            <div className="inline-flex flex-wrap items-center gap-2 rounded-[0.65rem] border border-border bg-surface px-3 py-2 text-sm shadow-soft">
              <Badge variant="accent">FlowForge platform</Badge>
              <span>Boards, reporting, and team visibility in one product</span>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-[3rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[3.8rem] lg:text-[3.8rem]">
                Workforce clarity, forged into a real operating dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                FlowForge gives leaders and teams one place to manage boards, assignments, reporting cycles, MSRs, and executive-ready summaries without patching workflows together.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href="/dashboard" size="lg">
                Open demo dashboard
              </ButtonLink>
              <ButtonLink href="/pricing" variant="secondary" size="lg">
                See pricing
              </ButtonLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Organizations" value={`${stats.organizations}+`} detail="isolated tenants" />
              <Metric label="Teams" value={`${stats.teams}+`} detail="boards in sync" />
              <Metric label="MSR completion" value={`${stats.msrCompletion}%`} detail="report cycles on time" />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <header className="flex items-center justify-start gap-3 sm:justify-end">
              <nav className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                {marketingNav.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted sm:px-4">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Live product snapshot</p>
                    <h2 className="mt-2 text-xl font-semibold">Operations console</h2>
                  </div>
                  <Badge variant="warning">2 blockers</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Snapshot label="OEE trend" value="89%" detail="up 4.5 this month" />
                  <Snapshot label="Output" value="1.2k" detail="units completed" />
                  <Snapshot label="Scrap" value="2.1%" detail="under target band" />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1.25fr_0.75fr]">
                  <div className="rounded-[0.65rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Production forecast vs. actual</p>
                    <div className="mt-5 grid h-44 grid-cols-7 items-end gap-3">
                      {[
                        [44, 68, 26],
                        [58, 80, 34],
                        [52, 76, 28],
                        [60, 86, 22],
                        [63, 91, 25],
                        [55, 84, 31],
                        [49, 73, 27],
                      ].map((bars, index) => (
                        <div key={index} className="flex h-full flex-col justify-end gap-1">
                          <div className="rounded-t bg-[#f7b733]" style={{ height: `${bars[2]}px` }} />
                          <div className="rounded-t bg-accent-2" style={{ height: `${bars[1]}px` }} />
                          <div className="rounded-t bg-success" style={{ height: `${bars[0]}px` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[0.65rem] border border-border bg-surface-2 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quality alerts</p>
                    <div className="mt-4 space-y-2">
                      <AlertRow label="Machine 4 down" value="14m" />
                      <AlertRow label="Machine 2 down" value="12m" />
                      <AlertRow label="Material shortage" value="7m" />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "01",
              title: "Manager-assigned work stays visible",
              description:
                "Assign priorities directly onto each teammate's board, require acknowledgment, and keep ownership clear without losing context.",
            },
            {
              label: "02",
              title: "Reporting writes itself from real work",
              description:
                "Cards, blockers, notes, and progress updates roll into personal MSRs and team summaries so reporting reflects what actually happened.",
            },
            {
              label: "03",
              title: "One console for team-wide visibility",
              description:
                "See the aggregated board, overdue work, blocked trends, and project health in one operating view built for managers and executives.",
            },
          ].map((item) => (
            <Card key={item.title} className="h-full">
              <CardBody className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold text-accent">
                  {item.label}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </CardBody>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Built for managers and teams</h2>
            </CardHeader>
            <CardBody className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>
                Every user gets a personal board, manager-assigned tasks stay visible, and collaborative work is tracked without
                losing clear ownership.
              </p>
              <p>
                The reporting engine compiles cards, activity entries, and manual notes into editable personal MSRs and final team
                summaries.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Demo-safe, production-minded UX</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-muted-foreground">
              <p>Accessible forms, polished cards, command palette navigation, and audit-friendly report states.</p>
              <p>Responsive layouts stay usable on smaller screens while preserving the dense desktop view managers need.</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Last refreshed {formatDate(new Date())}</p>
            </CardBody>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
      <Card>
      <CardBody className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardBody>
    </Card>
  );
}

function Snapshot({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[0.65rem] border border-border bg-surface-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function AlertRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[0.55rem] border border-danger/35 bg-danger/5 px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant="danger">{value}</Badge>
    </div>
  );
}
