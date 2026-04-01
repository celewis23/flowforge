import { PageShell } from "@/components/layout/page-shell";
import { MsrEditor } from "@/components/reports/msr-editor";
import { getPersonalMsrWorkspace } from "@/lib/api";

export default async function PersonalMsrEditorPage() {
  const data = await getPersonalMsrWorkspace();

  return (
    <PageShell eyebrow="Personal MSR Editor" title="Review and edit your monthly report" description="Generated sections stay editable before submission and manager review.">
      <MsrEditor draft={data.draft} cycle={data.cycle} assigned={data.assigned} collaborative={data.collaborative} activity={data.activity} />
    </PageShell>
  );
}
