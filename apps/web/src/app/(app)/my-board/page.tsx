import { PageShell } from "@/components/layout/page-shell";
import { BoardWorkspace } from "@/components/board/board-workspace";
import { getBoardData } from "@/lib/api";

export default async function MyBoardPage() {
  const data = await getBoardData("personal");

  return (
    <PageShell eyebrow="My Board" title="Manage your personal board" description="Move cards, review due dates, and keep manager-assigned work visible.">
      <BoardWorkspace title="Personal board" scope="personal" columns={data.columns} cards={data.cards} members={data.teamMembers} projects={data.projects} />
    </PageShell>
  );
}
