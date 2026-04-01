"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { ToastPill, useToast } from "@/components/ui/toast";
import type { PersonalMsr, ReportingCycle, Team, TeamMsr, User } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function TeamMsrBuilder({
  team,
  cycle,
  draft,
  personal,
  users,
}: {
  team: Team;
  cycle: ReportingCycle;
  draft: TeamMsr;
  personal: PersonalMsr[];
  users: User[];
}) {
  const [summary, setSummary] = useState(draft.executiveSummary);
  const [confirm, setConfirm] = useState(false);
  const { push } = useToast();
  const getUserName = (userId: string) => users.find((user) => user.id === userId)?.name ?? userId;

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ToastPill>Team MSR Builder</ToastPill>
              <Badge variant={draft.status === "finalized" ? "success" : "warning"}>{draft.status}</Badge>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{team.name} team report</h2>
            <p className="text-sm text-muted-foreground">
              The manager can reorder sections, edit the narrative, and finalize a polished team report.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => push({ title: "Compiled report", description: "The current draft was refreshed from personal MSRs." })}>
              Recompile
            </Button>
            <Button onClick={() => setConfirm(true)}>Finalize report</Button>
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Executive summary</h3>
            </CardHeader>
            <CardBody>
              <Textarea rows={8} value={summary} onChange={(event) => setSummary(event.target.value)} />
            </CardBody>
          </Card>
          {draft.sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{section.title}</h3>
                  <Badge variant="neutral">{section.bullets.length} bullets</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
                <ul className="space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl bg-surface px-4 py-3 text-sm text-foreground ring-1 ring-border">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Appendix by team member</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {draft.appendix.map((entry) => (
                <div key={entry.userId} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold">{getUserName(entry.userId)}</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight}>• {highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Source personal MSRs</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {personal.map((msr) => (
                <div key={msr.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{getUserName(msr.userId)}</p>
                    <Badge variant={msr.status === "submitted" ? "success" : "warning"}>{msr.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Updated {formatDateTime(msr.updatedAt)}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
      <Modal
        open={confirm}
        title="Finalize team report"
        description="Finalized reports are locked from normal edits and marked ready for export."
        onClose={() => setConfirm(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This report covers the {cycle.cadence} cycle ending {formatDateTime(cycle.endDate)}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirm(false);
                push({ title: "Team report finalized", description: "The report is locked and ready for PDF or Word export." });
              }}
            >
              Confirm finalize
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
