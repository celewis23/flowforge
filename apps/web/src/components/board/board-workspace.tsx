"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToastPill, useToast } from "@/components/ui/toast";
import type { BoardColumn, Card as BoardCard, Project, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { demoNow } from "@/lib/seed";

const statusOrder: BoardColumn["status"][] = ["Backlog", "To Do", "In Progress", "Blocked", "Review", "Done"];
const dueSoonCutoff = new Date(demoNow.getTime() + 1000 * 60 * 60 * 24 * 7).getTime();

export function BoardWorkspace({
  title,
  scope,
  columns,
  cards,
  members,
  projects,
}: {
  title: string;
  scope: "personal" | "team";
  columns: BoardColumn[];
  cards: BoardCard[];
  members: User[];
  projects: Project[];
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(cards);
  const [dragging, setDragging] = useState<string | null>(null);
  const { push } = useToast();

  const filtered = useMemo(
    () =>
      items.filter(
        (card) =>
          card.title.toLowerCase().includes(query.toLowerCase()) ||
          card.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, query],
  );

  function moveCard(cardId: string, direction: -1 | 1) {
    setItems((current) =>
      current.map((card) => {
        if (card.id !== cardId) return card;
        const index = statusOrder.indexOf(card.status);
        const next = statusOrder[Math.max(0, Math.min(statusOrder.length - 1, index + direction))];
        return { ...card, status: next, updatedAt: new Date().toISOString() };
      }),
    );
    push({ title: "Card moved", description: "The board state updated locally in the demo shell." });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ToastPill>{scope === "personal" ? "My board" : "Aggregated team board"}</ToastPill>
              <Badge variant="accent">{title}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Drag cards between columns or use the keyboard-friendly move buttons. Managers can review work by owner, project, or status.
            </p>
          </div>
          <div className="grid w-full gap-3 lg:max-w-xl lg:grid-cols-[1fr_auto]">
            <Input placeholder="Search cards or tags..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <Button variant="secondary" onClick={() => push({ title: "Board filters applied", description: "Using the demo search and status controls." })}>
              Filter
            </Button>
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {columns.map((column) => {
              const columnCards = filtered.filter((card) => card.status === column.status);
              return (
                <Card key={column.id} className="min-h-[18rem]">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold">{column.title}</h2>
                        <p className="text-xs text-muted-foreground">{columnCards.length} cards</p>
                      </div>
                      <Badge variant={column.status === "Blocked" ? "danger" : column.status === "Done" ? "success" : "neutral"}>{column.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardBody
                    className="space-y-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (dragging) {
                        setItems((current) =>
                          current.map((item) => (item.id === dragging ? { ...item, status: column.status } : item)),
                        );
                        setDragging(null);
                        push({ title: "Card moved", description: `Moved to ${column.title}.` });
                      }
                    }}
                  >
                    {columnCards.length ? (
                      columnCards.map((card) => {
                        const project = projects.find((item) => item.id === card.projectId);
                        const owner = members.find((member) => member.id === card.ownerId);
                        return (
                          <article
                            key={card.id}
                            draggable
                            onDragStart={() => setDragging(card.id)}
                            className="rounded-3xl border border-border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">{card.title}</h3>
                                <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                              </div>
                              <Badge variant={card.priority === "Critical" ? "danger" : card.priority === "High" ? "warning" : "neutral"}>{card.priority}</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {card.assignedById !== card.ownerId ? <Badge variant="accent">Assigned by manager</Badge> : null}
                              {card.collaboratorIds.length ? <Badge variant="neutral">Collaborative</Badge> : null}
                              {card.status === "Blocked" ? <Badge variant="danger">Blocked</Badge> : null}
                              {new Date(card.dueDate).getTime() < Date.now() ? <Badge variant="warning">Overdue</Badge> : null}
                              <Badge variant="neutral">{formatDate(card.dueDate)}</Badge>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              {owner ? (
                                <div className="flex items-center gap-2">
                                  <Avatar name={owner.name} color={owner.avatarColor} className="h-8 w-8 rounded-full" />
                                  <div>
                                    <p className="text-sm font-medium">{owner.name}</p>
                                    <p className="text-xs text-muted-foreground">{project?.name}</p>
                                  </div>
                                </div>
                              ) : null}
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => moveCard(card.id, -1)}>
                                  Move back
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => moveCard(card.id, 1)}>
                                  Move forward
                                </Button>
                              </div>
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <div className="rounded-3xl border border-dashed border-border px-4 py-10 text-sm text-muted-foreground">
                        No cards in this column.
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Board Overview</h2>
            <p className="text-sm text-muted-foreground">Performance summary and collaboration signals</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryRow label="Visible cards" value={filtered.length.toString()} />
              <SummaryRow label="Collaborators" value={new Set(filtered.flatMap((card) => card.collaboratorIds)).size.toString()} />
              <SummaryRow label="Blocked" value={filtered.filter((card) => card.status === "Blocked").length.toString()} />
              <SummaryRow label="Due this week" value={filtered.filter((card) => new Date(card.dueDate).getTime() < dueSoonCutoff).length.toString()} />
            </div>
            <div className="rounded-3xl bg-surface p-4 ring-1 ring-border">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Keyboard controls</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Every card includes accessible move buttons so board changes work without drag and drop. This keeps the demo usable for keyboard and screen reader users.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
