import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { marketingNav } from "@/lib/navigation";
import { getLandingHighlights, getMarketingStats } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function Home() {
  const [stats, highlights] = await Promise.all([getMarketingStats(), getLandingHighlights()]);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.1),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            MSR Command Center
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            {marketingNav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm shadow-soft">
              <Badge variant="accent">Enterprise workflow platform</Badge>
              <span>Boards, reporting, and team visibility in one product</span>
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                Keep work, reporting cycles, and executive summaries in one clean operating system.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                MSR Command Center gives every team member a personal board, helps managers coordinate assignments across the team,
                and turns day-to-day execution into reporting, dashboards, and exports without duplicate admin work.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Live product snapshot</p>
                  <h2 className="mt-2 text-xl font-semibold">Team overview</h2>
                </div>
                <Badge variant="warning">2 blockers</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Snapshot label="Assigned work" value="18" detail="across personal boards" />
                <Snapshot label="Due soon" value="6" detail="next 7 days" />
                <Snapshot label="Personal MSRs" value="9/10" detail="submitted or drafted" />
                <Snapshot label="Reports ready" value="1" detail="team MSR finalized" />
              </div>
              <div className="rounded-[1rem] border border-border bg-muted p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Cycle timeline</p>
                <div className="mt-4 space-y-3 text-sm">
                  <TimelineRow label="Capture" value="cards, notes, blockers, and manager asks move through one system of record" />
                  <TimelineRow label="Compile" value="personal MSRs roll into team reporting without duplicate manual formatting" />
                  <TimelineRow label="Broadcast" value="exec-ready summaries, exports, and dashboards stay aligned with real work" />
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {highlights.pillars.map((pillar, index) => (
            <Card key={pillar} className="h-full">
              <CardBody className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-sm font-semibold text-accent">
                  0{index + 1}
                </div>
                <h3 className="text-lg font-semibold">Product pillar</h3>
                <p className="text-sm leading-6 text-muted-foreground">{pillar}</p>
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
    <div className="rounded-[1rem] border border-border bg-surface-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium">{label}</span>
      <span className="max-w-sm text-right text-muted-foreground">{value}</span>
    </div>
  );
}
