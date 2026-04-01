import {
  activityEntries,
  auditLogs,
  boardColumns,
  cards,
  cardComments,
  demoNow,
  invitations,
  notifications,
  organization,
  personalMsrs,
  projects,
  reportingCycles,
  teamMsrs,
  teams,
  templates,
  users,
  subtasks,
} from "@/lib/seed";
import type { Card, CardStatus } from "@/lib/types";
import { addDays } from "@/lib/utils";

const pause = (ms = 70) => new Promise((resolve) => setTimeout(resolve, ms));

export const currentUser = users.find((user) => user.id === "user-manager-1") ?? users[0];

function teamByMember(memberId: string) {
  return teams.find((team) => team.memberIds.includes(memberId));
}

export async function getMarketingStats() {
  await pause();
  return {
    organizations: 128,
    teams: 842,
    msrCompletion: 94,
    blockedItems: cards.filter((card) => card.status === "Blocked").length,
  };
}

export async function getLandingHighlights() {
  await pause();
  return {
    pillars: [
      "Personal boards with manager-assigned work and collaborative accountability.",
      "Deterministic MSR generation that rolls card movement and manual notes into reports.",
      "Executive-ready dashboards, exports, and audit trails for multi-tenant organizations.",
    ],
  };
}

export async function getAppSummary() {
  await pause();
  const myCards = cards.filter((card) => card.ownerId === currentUser.id);
  const blockedCards = myCards.filter((card) => card.status === "Blocked");
  const dueSoon = myCards.filter((card) => new Date(card.dueDate).getTime() <= addDays(demoNow, 3).getTime());
  return {
    currentUser,
    organization,
    teams,
    projects,
    reportingCycles,
    cards,
    boardColumns,
    myCards,
    blockedCards,
    dueSoon,
    notifications: notifications.filter((item) => item.userId === currentUser.id),
    unreadNotifications: notifications.filter((item) => item.userId === currentUser.id && !item.read).length,
    activeCycle: reportingCycles.find((cycle) => cycle.teamId === currentUser.teamIds[0]),
  };
}

export async function getDashboardData() {
  await pause();
  const myCards = cards.filter((card) => card.ownerId === currentUser.id);
  const dueSoon = myCards.filter((card) => new Date(card.dueDate).getTime() <= addDays(demoNow, 4).getTime());
  return {
    currentUser,
    summary: {
      myOpen: myCards.filter((card) => card.status !== "Done" && !card.archived).length,
      blocked: myCards.filter((card) => card.status === "Blocked").length,
      dueSoon: dueSoon.length,
      msrDue: reportingCycles.find((cycle) => cycle.teamId === currentUser.teamIds[0])?.submissionDeadline ?? "",
    },
    workload: teams.flatMap((team) =>
      team.memberIds.map((memberId) => ({
        member: users.find((user) => user.id === memberId)!,
        cards: cards.filter((card) => card.ownerId === memberId && !card.archived).length,
        blocked: cards.filter((card) => card.ownerId === memberId && card.status === "Blocked").length,
      })),
    ),
    projectHealth: projects,
    latestReport: teamMsrs[0],
    blockerThemes: ["Waiting on approvals", "Vendor handoffs", "Review turnaround"],
  };
}

export async function getBoardData(scope: "personal" | "team" = "personal") {
  await pause();
  const relevantCards =
    scope === "personal"
      ? cards.filter((card) => card.ownerId === currentUser.id)
      : cards.filter((card) => currentUser.teamIds.includes(teamByMember(card.ownerId)?.id ?? ""));
  return {
    scope,
    columns: boardColumns,
    cards: relevantCards,
    projects,
    teamMembers: teams.flatMap((team) => team.memberIds.map((memberId) => users.find((user) => user.id === memberId)!)),
    collaborators: users,
  };
}

export async function getTeamBoardData() {
  await pause();
  return {
    columns: boardColumns,
    projects,
    boardsByPerson: teams.map((team) => ({
      team,
      members: team.memberIds.map((memberId) => users.find((user) => user.id === memberId)!),
      cards: cards.filter((card) => team.memberIds.includes(card.ownerId)),
    })),
    allCards: cards.filter((card) => currentUser.teamIds.includes(teamByMember(card.ownerId)?.id ?? "")),
  };
}

export async function getTasksData() {
  await pause();
  return {
    myTasks: cards.filter((card) => card.ownerId === currentUser.id),
    comments: cardComments.filter((comment) => comment.authorId === currentUser.id),
    subtasks: subtasks.filter((item) => cards.find((card) => card.id === item.cardId)?.ownerId === currentUser.id),
  };
}

export async function getActivityData() {
  await pause();
  return {
    entries: activityEntries.filter((entry) => entry.userId === currentUser.id || entry.kind !== "daily note"),
  };
}

export async function getMsrData() {
  await pause();
  return {
    personal: personalMsrs.filter((msr) => msr.userId === currentUser.id),
    team: teamMsrs.filter((msr) => currentUser.teamIds.includes(msr.teamId)),
    cycles: reportingCycles,
    activity: activityEntries,
  };
}

export async function getMembersData() {
  await pause();
  return {
    teams,
    users,
    currentUser,
    invites: invitations,
  };
}

export async function getProjectsData() {
  await pause();
  return {
    projects,
    cards,
    teamMembers: users,
  };
}

export async function getReportingData() {
  await pause();
  return {
    cycles: reportingCycles,
    templates,
    personalMsrs,
    teamMsrs,
  };
}

export async function getPersonalMsrWorkspace() {
  await pause();
  const draft = personalMsrs.find((msr) => msr.userId === currentUser.id) ?? personalMsrs[0];
  const assigned = cards.filter((card) => card.ownerId === currentUser.id && card.includeInMsr);
  const collaborative = cards.filter((card) => card.collaboratorIds.includes(currentUser.id));
  return {
    draft,
    assigned,
    collaborative,
    cycle: reportingCycles.find((cycle) => cycle.id === draft.cycleId) ?? reportingCycles[0],
    activity: activityEntries.filter((entry) => entry.userId === currentUser.id),
    versionHistory: draft.versionHistory,
  };
}

export async function getTeamMsrWorkspace() {
  await pause();
  const team = teams.find((item) => item.id === currentUser.teamIds[0]) ?? teams[0];
  const draft = teamMsrs.find((msr) => msr.teamId === team.id) ?? teamMsrs[0];
  const personal = personalMsrs.filter((msr) => team.memberIds.includes(msr.userId));
  return {
    team,
    draft,
    personal,
    cycle: reportingCycles.find((cycle) => cycle.id === draft.cycleId) ?? reportingCycles[0],
    versionHistory: draft.versionHistory,
  };
}

export async function getNotificationsData() {
  await pause();
  return {
    notifications: notifications.filter((item) => item.userId === currentUser.id),
  };
}

export async function getSettingsData() {
  await pause();
  return {
    currentUser,
    organization,
    teams,
    templates,
  };
}

export async function getAdminData() {
  await pause();
  return {
    organization,
    teams,
    users,
    invitations,
    auditLogs,
    templates,
  };
}

export function getCardById(id: string) {
  return cards.find((card) => card.id === id);
}

export function getUserById(id: string) {
  return users.find((user) => user.id === id);
}

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

export function getMembersForTeam(teamId: string) {
  const team = teams.find((item) => item.id === teamId);
  if (!team) return [];
  return team.memberIds.map((memberId) => users.find((user) => user.id === memberId)!).filter(Boolean);
}

export function groupCardsByStatus(items: Card[]) {
  return boardColumns.reduce<Record<CardStatus, Card[]>>(
    (acc, column) => {
      acc[column.status] = items.filter((card) => card.status === column.status);
      return acc;
    },
    {
      Backlog: [],
      "To Do": [],
      "In Progress": [],
      Blocked: [],
      Review: [],
      Done: [],
    },
  );
}
