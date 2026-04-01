"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { ToastPill, useToast } from "@/components/ui/toast";
import type { ActivityEntry, Card as BoardCard, MsrSection, PersonalMsr, ReportingCycle } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function MsrEditor({
  draft,
  cycle,
  assigned,
  collaborative,
  activity,
}: {
  draft: PersonalMsr;
  cycle: ReportingCycle;
  assigned: BoardCard[];
  collaborative: BoardCard[];
  activity: ActivityEntry[];
}) {
  const [sections, setSections] = useState<MsrSection[]>(draft.edited);
  const [openSubmit, setOpenSubmit] = useState(false);
  const { push } = useToast();

  function updateSection(index: number, value: string) {
    setSections((current) => current.map((section, sectionIndex) => (sectionIndex === index ? { ...section, body: value } : section)));
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ToastPill>Personal MSR</ToastPill>
              <Badge variant={draft.status === "submitted" ? "success" : "warning"}>{draft.status}</Badge>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{cycle.cadence} reporting cycle</h2>
            <p className="text-sm text-muted-foreground">
              The editor preserves generated, edited, and final versions so changes are never lost.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => push({ title: "Draft saved", description: "The edited MSR draft is stored locally in the demo." })}>
              Save draft
            </Button>
            <Button onClick={() => setOpenSubmit(true)}>Submit for review</Button>
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.bullets.length} bullets</p>
                  </div>
                  <Badge variant="accent">Editable</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Textarea value={section.body} onChange={(event) => updateSection(index, event.target.value)} />
                <ul className="space-y-2">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl bg-surface px-4 py-3 text-sm text-muted-foreground ring-1 ring-border">
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
              <h3 className="text-base font-semibold">Work included in this cycle</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <ListBlock title="Owned cards" items={assigned.map((card) => card.title)} />
              <ListBlock title="Collaborative contributions" items={collaborative.map((card) => card.title)} />
              <ListBlock title="Manual activity entries" items={activity.map((entry) => `${entry.title} · ${formatDateTime(entry.createdAt)}`)} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-base font-semibold">Version history</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {draft.versionHistory.map((version) => (
                <div key={`${version.label}-${version.at}`} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-semibold">{version.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {version.author} · {formatDateTime(version.at)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
      <Modal
        open={openSubmit}
        title="Submit personal MSR"
        description="This locks the current submission and marks it ready for manager review."
        onClose={() => setOpenSubmit(false)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            You are submitting a report for {cycle.startDate.slice(0, 10)} to {cycle.endDate.slice(0, 10)}.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpenSubmit(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpenSubmit(false);
                push({ title: "MSR submitted", description: "The report is now queued for manager review." });
              }}
            >
              Confirm submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">None yet.</div>
      )}
    </div>
  );
}
