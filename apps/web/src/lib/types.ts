export type Role =
  | "PlatformAdmin"
  | "OrgAdmin"
  | "Manager"
  | "TeamMember"
  | "Viewer"
  | "ExecutiveViewer";

export type CardStatus = "Backlog" | "To Do" | "In Progress" | "Blocked" | "Review" | "Done";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type CycleCadence = "weekly" | "biweekly" | "monthly" | "custom";
export type CycleStatus = "open" | "pending review" | "finalized" | "archived";
export type NotificationKind =
  | "assignment"
  | "mention"
  | "reminder"
  | "report"
  | "review"
  | "system";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  teamIds: string[];
  avatarColor: string;
  status: "active" | "invited" | "inactive";
  managerId?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  industry: string;
  region: string;
  cadence: CycleCadence;
  branding: string;
}

export interface Team {
  id: string;
  name: string;
  department: string;
  managerId: string;
  memberIds: string[];
  cadence: CycleCadence;
  health: "green" | "amber" | "red";
  focus: string;
}

export interface Project {
  id: string;
  name: string;
  status: "healthy" | "watch" | "at risk";
  ownerId: string;
  teamIds: string[];
  progress: number;
  health: string;
  dueDate: string;
  summary: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  status: CardStatus;
  order: number;
  color?: string;
}

export interface Card {
  id: string;
  boardId?: string;
  columnId?: string;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  dueDate: string;
  projectId: string;
  ownerId: string;
  assignedById: string;
  assignedAt: string;
  acknowledgedAt?: string;
  collaboratorIds: string[];
  tags: string[];
  includeInMsr: boolean;
  ackRequired: boolean;
  visibility: "team" | "private" | "manager";
  archived: boolean;
  blockedReason?: string;
  updatedAt: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  cardId: string;
  title: string;
  assigneeId?: string;
  completed: boolean;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  cardId?: string;
  projectId?: string;
  kind:
    | "daily note"
    | "accomplishment"
    | "blocker"
    | "risk"
    | "support request"
    | "next step"
    | "card update";
  title: string;
  body: string;
  createdAt: string;
}

export interface ReportingCycle {
  id: string;
  name?: string;
  teamId: string;
  cadence: CycleCadence;
  startDate: string;
  endDate: string;
  dueDate: string;
  submissionDeadline: string;
  status: CycleStatus;
}

export interface MsrSection {
  title: string;
  body: string;
  bullets: string[];
}

export interface PersonalMsr {
  id: string;
  userId: string;
  cycleId: string;
  teamId?: string;
  status: "draft" | "submitted" | "approved" | "finalized" | "locked";
  generated: MsrSection[];
  edited: MsrSection[];
  final: MsrSection[];
  updatedAt: string;
  versionHistory: Array<{ label: string; author: string; at: string }>;
}

export interface TeamMsr {
  id: string;
  teamId: string;
  cycleId: string;
  status: "draft" | "finalized" | "submitted" | "locked";
  executiveSummary: string;
  sections: MsrSection[];
  appendix: Array<{ userId: string; highlights: string[] }>;
  updatedAt: string;
  versionHistory: Array<{ label: string; author: string; at: string }>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  target: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  cadence: CycleCadence;
  requiredSections: string[];
  questionPrompts: string[];
  branding: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  teamId?: string;
  sentBy: string;
  status: "pending" | "accepted" | "expired";
}
