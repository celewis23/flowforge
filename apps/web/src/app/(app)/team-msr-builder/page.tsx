import { PageShell } from "@/components/layout/page-shell";
import { TeamMsrBuilder } from "@/components/reports/team-msr-builder";
import { getTeamMsrWorkspace } from "@/lib/api";

export default async function TeamMsrBuilderPage() {
  const data = await getTeamMsrWorkspace();

  return (
    <PageShell eyebrow="Team MSR Builder" title="Compile your team report" description="Merge personal submissions into a polished executive-ready summary.">
      <TeamMsrBuilder team={data.team} cycle={data.cycle} draft={data.draft} personal={data.personal} users={data.users} />
    </PageShell>
  );
}
