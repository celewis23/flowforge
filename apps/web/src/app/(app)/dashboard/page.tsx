import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getDashboardData } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const maxCards = Math.max(...data.workload.map((row) => row.cards), 1);

  return (
    <PageShell
      eyebrow="Dashboard"
      title="A clear view of team workload, reporting readiness, and current blockers"
      description="The dashboard keeps the most important operating signals visible without burying the team in visual noise."
      actions={
        <>
          <Badge variant="accent">Live data</Badge>
          <Badge variant="neutral">{data.workload.length} active contributors</Badge>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <KpiRing label="Open tasks" value={data.summary.myOpen.toString()} sublabel="Active work" tone="teal" />
            <KpiRing label="Blocked" value={data.summary.blocked.toString()} sublabel="Needs attention" tone="orange" />
            <KpiRing label="MSR due" value={formatDate(data.summary.msrDue)} sublabel="Current deadline" tone="red" />
          </div>
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Team capacity</p>
                <h2 className="mt-2 text-lg font-semibold">Workload by person</h2>
              </div>
              <Badge variant="neutral">Current cycle</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {data.workload.slice(0, 6).map((row) => (
                <div key={row.member.id} className="grid gap-3 rounded-[0.65rem] border border-accent/30 bg-surface-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                  <div>
                    <p className="font-semibold">{row.member.name}</p>
                    <p className="text-sm text-muted-foreground">{row.member.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--color-success),var(--color-accent-2))]" style={{ width: `${(row.cards / maxCards) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold">{row.cards}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant={row.blocked ? "danger" : "success"}>{row.blocked} blocked</Badge>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live alerts</p>
                <h2 className="mt-2 text-lg font-semibold">Quality summary</h2>
              </div>
              <Badge variant="warning">{data.blockerThemes.length} active</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {data.blockerThemes.length ? (
                data.blockerThemes.map((theme) => (
                  <div key={theme} className="flex items-center justify-between gap-3 rounded-[0.65rem] border border-danger/45 bg-danger/6 px-3 py-2.5">
                    <span className="text-sm font-medium">{theme}</span>
                    <Badge variant="danger">Critical</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-[0.65rem] border border-border bg-muted px-3 py-3 text-sm text-muted-foreground">No critical alerts in this cycle.</div>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Executive thread</p>
                <h2 className="mt-2 text-lg font-semibold">Latest report signals</h2>
              </div>
              <Badge variant="accent">Team MSR</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-[0.65rem] border border-accent/35 bg-muted p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-accent">Summary</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{data.latestReport.executiveSummary}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span>Shift change log</span>
                  <span>{data.summary.dueSoon} due soon</span>
                </div>
                {data.workload.slice(0, 3).map((row) => (
                  <div key={row.member.id} className="flex items-center gap-3 rounded-[0.65rem] border border-border bg-surface-2 px-3 py-2.5">
                    <div className="h-8 w-8 rounded-full bg-accent/12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{row.member.name}</p>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.max(18, (row.cards / maxCards) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function KpiRing({
  label,
  value,
  sublabel,
  tone,
}: {
  label: string;
  value: string;
  sublabel: string;
  tone: "teal" | "orange" | "red";
}) {
  const toneClass =
    tone === "teal"
      ? "from-success to-[#4fd1cc]"
      : tone === "orange"
        ? "from-warning to-accent-2"
        : "from-danger to-accent-2";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{label}</h2>
      </CardHeader>
      <CardBody className="flex flex-col items-center gap-3 text-center">
        <div className={`grid h-28 w-28 place-items-center rounded-full bg-[conic-gradient(from_210deg,var(--tw-gradient-stops))] ${toneClass} p-2`}>
          <div className="grid h-full w-full place-items-center rounded-full bg-surface-2">
            <span className="max-w-[5rem] text-center text-2xl font-semibold tracking-tight">{value}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </CardBody>
    </Card>
  );
}
