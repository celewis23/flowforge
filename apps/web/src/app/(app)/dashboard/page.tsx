import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardData } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <PageShell
      eyebrow="Dashboard"
      title="A live view of work pressure, reporting readiness, and team momentum"
      description="Managers get a signal-rich operating layer. Team members stay anchored on due work, blockers, and what will roll into the next reporting cycle."
      actions={
        <>
          <Badge variant="accent">Live team signal</Badge>
          <Badge variant="neutral">{data.workload.length} active contributors</Badge>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Open tasks" value={data.summary.myOpen.toString()} detail="cards still in motion" trend="+2 this week" />
        <StatCard label="Blocked" value={data.summary.blocked.toString()} detail="needs manager attention" trend="watch" />
        <StatCard label="Due soon" value={data.summary.dueSoon.toString()} detail="next 4 days" trend="risk" />
        <StatCard label="MSR due" value={formatDate(data.summary.msrDue)} detail="current reporting deadline" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Team capacity</p>
              <h2 className="mt-2 text-lg font-semibold">Workload by person</h2>
            </div>
            <Badge variant="neutral">Dynamic view</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {data.workload.slice(0, 6).map((row) => (
              <div
                key={row.member.id}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-md"
              >
                <div>
                  <p className="font-semibold">{row.member.name}</p>
                  <p className="text-sm text-muted-foreground">{row.member.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{row.cards} cards</Badge>
                  <Badge variant={row.blocked ? "danger" : "success"}>{row.blocked} blocked</Badge>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Executive thread</p>
              <h2 className="mt-2 text-lg font-semibold">Latest report signals</h2>
            </div>
            <Badge variant="warning">{data.blockerThemes.length} themes</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(145deg,rgba(45,212,191,0.15),rgba(96,165,250,0.12))] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-accent">Team MSR</p>
              <p className="mt-3 text-lg font-semibold text-foreground">{data.latestReport.executiveSummary}</p>
            </div>
            <div className="space-y-2">
              {data.blockerThemes.map((theme) => (
                <div key={theme} className="rounded-[1.3rem] border border-white/10 bg-white/6 px-4 py-3 text-sm backdrop-blur-md">
                  {theme}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </PageShell>
  );
}
