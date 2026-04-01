import { PageShell } from "@/components/layout/page-shell";
import { BoardWorkspace } from "@/components/board/board-workspace";
import { getTeamBoardData } from "@/lib/api";

export default async function TeamBoardPage() {
  const data = await getTeamBoardData();

  return (
    <PageShell
      eyebrow="Team Board"
      title="View the aggregated team board"
      description="Filter by person, project, priority, and blocked state to get a single operational picture."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {data.boardsByPerson.map((bundle) => (
          <div key={bundle.team.id} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <p className="text-sm font-semibold">{bundle.team.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{bundle.members.length} members · {bundle.cards.length} cards</p>
          </div>
        ))}
      </div>
      <BoardWorkspace title="Aggregated team board" scope="team" columns={data.columns} cards={data.allCards} members={data.boardsByPerson.flatMap((bundle) => bundle.members)} projects={data.projects} />
    </PageShell>
  );
}
