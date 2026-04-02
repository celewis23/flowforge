import "server-only";

import { redirect } from "next/navigation";
import { auditLogs as fallbackAuditLogs, invitations as fallbackInvitations, organization as fallbackOrganization, personalMsrs as fallbackPersonalMsrs, projects as fallbackProjects, reportingCycles as fallbackCycles, teamMsrs as fallbackTeamMsrs, teams as fallbackTeams, templates as fallbackTemplates, users as fallbackUsers } from "@/lib/seed";
import type { ActivityEntry, AuditLogItem, BoardColumn, Card, CardStatus, NotificationItem, Organization, PersonalMsr, Priority, Project, ReportingCycle, Team, TeamMsr, User } from "@/lib/types";
import { getAccessToken, requireSessionUser } from "@/lib/session";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type OrganizationSummaryDto = { id: string; name: string; slug: string; domain: string; defaultCadence: string };
type TeamSummaryDto = { id: string; name: string; department: string; managerId: string; memberCount: number };
type ProjectSummaryDto = { id: string; name: string; workstream: string; status: string; health: number };
type BoardColumnDto = { id: string; name: string; position: number; color: string };
type CardCommentDto = { id: string; authorId: string; authorName: string; body: string; createdAtUtc: string };
type CardSubtaskDto = { id: string; title: string; assigneeId?: string | null; isCompleted: boolean };
type CardDto = {
  id: string;
  boardId: string;
  columnId: string;
  ownerId: string;
  ownerName: string;
  projectId?: string | null;
  title: string;
  description: string;
  instructions: string;
  tagsCsv: string;
  priority: number;
  assignmentState: number;
  visibility: number;
  dueDateUtc?: string | null;
  includeInMsr: boolean;
  acknowledgmentRequired: boolean;
  isBlocked: boolean;
  isOverdue: boolean;
  collaborators: string[];
  comments: CardCommentDto[];
  subtasks: CardSubtaskDto[];
};
type BoardDto = { id: string; name: string; ownerId: string; columns: BoardColumnDto[]; cards: CardDto[] };
type ActivityEntryDto = { id: string; entryType: number; title: string; content: string; includeInMsr: boolean; createdAtUtc: string };
type ReportingCycleDto = { id: string; teamId: string; name: string; cadence: string; startDateUtc: string; endDateUtc: string; dueDateUtc: string; submissionDeadlineUtc: string; status: number };
type ReportVersionDto = { id: string; versionLabel: string; changedById: string; createdAtUtc: string };
type PersonalMsrDto = { id: string; userId: string; teamId: string; reportingCycleId: string; status: number; generatedSummary: string; editedSummary: string; submittedSummary: string; submittedAtUtc?: string | null; feedback: string; versions: ReportVersionDto[] };
type TeamMsrDto = { id: string; teamId: string; reportingCycleId: string; status: number; executiveSummary: string; detailedSummary: string; managerNotes: string; finalizedAtUtc?: string | null; versions: ReportVersionDto[] };
type NotificationDto = { id: string; type: number; title: string; message: string; link: string; createdAtUtc: string; readAtUtc?: string | null };
type DashboardDto = { dueSoonCards: CardDto[]; blockedCards: CardDto[]; recentCompletions: CardDto[]; workloadByPerson: Record<string, number>; workloadByProject: Record<string, number>; repeatedBlockers: string[]; nextMsrDueDateUtc?: string | null; submissionCompletionRate: number };
type AuditLogDto = { id: string; action: string; entityName: string; entityId: string; details: string; createdAtUtc: string; correlationId: string };
type AdminUserDto = { id: string; fullName: string; email: string; role: string; title: string; teamId?: string | null; isActive: boolean };
type InvitationDto = { id: string; email: string; role: string; teamId: string; expiresAtUtc: string; acceptedAtUtc?: string | null };
type TemplateDto = { id: string; name: string; templateType: string; requiredSectionsJson: string; promptQuestionsJson: string; defaultBoardColumnsJson: string; brandingJson: string };
type AdminSummaryDto = { organization: OrganizationSummaryDto; teams: TeamSummaryDto[]; users: AdminUserDto[]; invitations: InvitationDto[]; templates: TemplateDto[]; auditLogs: AuditLogDto[] };
type OrganizationAuthenticationSettingsDto = {
  id: string;
  organizationId: string;
  authenticationMode: string;
  allowLocalPasswordSignIn: boolean;
  requireMfaByDefault: boolean;
  allowJustInTimeProvisioning: boolean;
  enforceDomainVerification: boolean;
  allowedDomains: string[];
  defaultIdentityProviderId?: string | null;
};
type OrganizationIdentityProviderDto = {
  id: string;
  organizationId: string;
  name: string;
  providerType: string;
  clientId: string;
  authority: string;
  metadataUrl: string;
  tenantIdentifier: string;
  scopes: string[];
  domainHints: string[];
  provisioningMode: string;
  isEnabled: boolean;
  isPrimary: boolean;
  validationStatus: string;
  lastValidationError: string;
  lastValidatedAtUtc?: string | null;
  lastSyncAtUtc?: string | null;
};
type OrganizationIntegrationConnectionDto = {
  id: string;
  organizationId: string;
  name: string;
  providerType: string;
  status: string;
  clientId: string;
  tenantIdentifier: string;
  scopes: string[];
  lastValidatedAtUtc?: string | null;
  lastSyncAtUtc?: string | null;
  lastError: string;
};
type OrganizationVerifiedDomainDto = {
  id: string;
  organizationId: string;
  domain: string;
  verificationMethod: string;
  status: string;
  challengeToken: string;
  verifiedAtUtc?: string | null;
  lastCheckedAtUtc?: string | null;
  failureReason: string;
};
type OrganizationProvisioningSettingsDto = {
  id: string;
  organizationId: string;
  syncMode: string;
  identityProviderId?: string | null;
  autoProvisionNewUsers: boolean;
  autoDeactivateMissingUsers: boolean;
  groupMappingStrategy: string;
  scimBaseUrl: string;
  lastSyncAtUtc?: string | null;
  lastSyncStatus: string;
  lastSyncError: string;
};
type OrganizationProvisioningJobDto = {
  id: string;
  organizationId: string;
  identityProviderId?: string | null;
  syncMode: string;
  status: string;
  triggeredBy: string;
  summary: string;
  usersProcessed: number;
  usersCreated: number;
  usersUpdated: number;
  usersDeactivated: number;
  errorDetails: string;
  startedAtUtc: string;
  completedAtUtc?: string | null;
};
type OrganizationDirectoryGroupMappingDto = {
  id: string;
  organizationId: string;
  identityProviderId: string;
  teamId: string;
  externalGroupId: string;
  externalGroupName: string;
  defaultRole: string;
  isActive: boolean;
  syncMembers: boolean;
  lastSyncedAtUtc?: string | null;
  lastSyncError: string;
};
type OrganizationNotificationRouteDto = {
  id: string;
  organizationId: string;
  integrationConnectionId: string;
  notificationType: string;
  targetType: string;
  destinationReference: string;
  destinationLabel: string;
  isActive: boolean;
  sendDailyDigest: boolean;
  lastDeliveredAtUtc?: string | null;
  lastDeliveryError: string;
};
type OrganizationExportDestinationDto = {
  id: string;
  organizationId: string;
  integrationConnectionId: string;
  destinationType: string;
  name: string;
  destinationReference: string;
  destinationPath: string;
  isDefault: boolean;
  isActive: boolean;
  lastValidatedAtUtc?: string | null;
  lastValidationError: string;
  lastDeliveredAtUtc?: string | null;
  lastDeliveryError: string;
};
type OrganizationCalendarSyncSettingDto = {
  id: string;
  organizationId: string;
  integrationConnectionId: string;
  eventType: string;
  calendarReference: string;
  calendarLabel: string;
  defaultReminderOffsets: number[];
  isEnabled: boolean;
  syncAllTeams: boolean;
  teamId?: string | null;
  lastSyncedAtUtc?: string | null;
  lastSyncError: string;
};
type OrganizationEnterpriseSettingsDto = {
  authentication: OrganizationAuthenticationSettingsDto;
  identityProviders: OrganizationIdentityProviderDto[];
  integrations: OrganizationIntegrationConnectionDto[];
  verifiedDomains: OrganizationVerifiedDomainDto[];
  provisioning: OrganizationProvisioningSettingsDto;
  provisioningJobs: OrganizationProvisioningJobDto[];
  directoryGroupMappings: OrganizationDirectoryGroupMappingDto[];
  notificationRoutes: OrganizationNotificationRouteDto[];
  exportDestinations: OrganizationExportDestinationDto[];
  calendarSyncSettings: OrganizationCalendarSyncSettingDto[];
};

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login?error=session-expired");
  }

  if (!response.ok) {
    throw new Error(`API request failed for ${path}`);
  }

  return (await response.json()) as T;
}

function avatarColorFor(id: string) {
  const palette = ["#0f766e", "#1d4ed8", "#b45309", "#be123c", "#2563eb", "#16a34a", "#7c3aed", "#db2777", "#0891b2", "#ea580c"];
  const total = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[total % palette.length];
}

function toPriority(value: number): Priority {
  switch (value) {
    case 4:
      return "Critical";
    case 3:
      return "High";
    case 1:
      return "Low";
    default:
      return "Medium";
  }
}

function toCardStatus(card: CardDto, columns: BoardColumnDto[]): CardStatus {
  return (columns.find((column) => column.id === card.columnId)?.name as CardStatus) ?? "To Do";
}

function toCycleCadence(value: string): ReportingCycle["cadence"] {
  const lowered = value.toLowerCase();
  if (lowered === "weekly" || lowered === "biweekly" || lowered === "monthly") {
    return lowered;
  }

  return "custom";
}

function toCycleStatus(value: number): ReportingCycle["status"] {
  switch (value) {
    case 4:
      return "archived";
    case 3:
      return "finalized";
    case 2:
      return "pending review";
    default:
      return "open";
  }
}

function toMsrStatus(value: number): PersonalMsr["status"] {
  switch (value) {
    case 5:
      return "locked";
    case 4:
      return "finalized";
    case 2:
      return "submitted";
    default:
      return "draft";
  }
}

function toTeamMsrStatus(value: number): TeamMsr["status"] {
  switch (value) {
    case 5:
      return "locked";
    case 4:
      return "finalized";
    case 2:
      return "submitted";
    default:
      return "draft";
  }
}

function parseSections(text: string) {
  return text
    .split(/\n(?=[A-Z][^:]+:)/g)
    .map((section, index) => {
      const [heading, ...rest] = section.split("\n");
      const body = rest.join("\n").trim();
      const title = heading.replace(":", "").trim() || `Section ${index + 1}`;
      const bullets = body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2));
      return {
        title,
        body,
        bullets,
      };
    })
    .filter((section) => section.title || section.body);
}

function mapOrganization(dto: OrganizationSummaryDto): Organization {
  return {
    id: dto.id,
    name: dto.name,
    plan: "Enterprise",
    industry: "Operations",
    region: "North America",
    cadence: toCycleCadence(dto.defaultCadence),
    branding: dto.slug,
  };
}

function mapTeam(dto: TeamSummaryDto, users: User[]): Team {
  return {
    id: dto.id,
    name: dto.name,
    department: dto.department,
    managerId: dto.managerId,
    memberIds: users.filter((user) => user.teamIds.includes(dto.id)).map((user) => user.id),
    cadence: "monthly",
    health: "green",
    focus: `${dto.department} execution and reporting`,
  };
}

function mapUser(dto: AdminUserDto): User {
  return {
    id: dto.id,
    name: dto.fullName,
    email: dto.email,
    role: dto.role as User["role"],
    title: dto.title,
    teamIds: dto.teamId ? [dto.teamId] : [],
    avatarColor: avatarColorFor(dto.id),
    status: dto.isActive ? "active" : "inactive",
  };
}

function mapProject(dto: ProjectSummaryDto, users: User[]): Project {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.health === 3 ? "at risk" : dto.health === 2 ? "watch" : "healthy",
    ownerId: users.find((user) => user.role === "Manager")?.id ?? users[0]?.id ?? "",
    teamIds: [],
    progress: dto.health === 1 ? 78 : dto.health === 2 ? 52 : 34,
    health: dto.workstream,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    summary: dto.status,
  };
}

function mapBoardColumn(dto: BoardColumnDto): BoardColumn {
  return {
    id: dto.id,
    title: dto.name,
    status: dto.name as CardStatus,
    order: dto.position,
    color: dto.color,
  };
}

function mapCard(dto: CardDto, columns: BoardColumnDto[]): Card {
  return {
    id: dto.id,
    boardId: dto.boardId,
    columnId: dto.columnId,
    title: dto.title,
    description: dto.description,
    status: toCardStatus(dto, columns),
    priority: toPriority(dto.priority),
    dueDate: dto.dueDateUtc ?? new Date().toISOString(),
    projectId: dto.projectId ?? "",
    ownerId: dto.ownerId,
    assignedById: dto.ownerId,
    assignedAt: dto.comments[0]?.createdAtUtc ?? new Date().toISOString(),
    collaboratorIds: dto.collaborators,
    tags: dto.tagsCsv ? dto.tagsCsv.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    includeInMsr: dto.includeInMsr,
    ackRequired: dto.acknowledgmentRequired,
    visibility: dto.visibility === 1 ? "private" : dto.visibility === 3 ? "manager" : "team",
    archived: false,
    blockedReason: dto.isBlocked ? dto.description : undefined,
    updatedAt: dto.comments[0]?.createdAtUtc ?? dto.dueDateUtc ?? new Date().toISOString(),
    acknowledgedAt: dto.acknowledgmentRequired ? dto.comments[0]?.createdAtUtc : undefined,
  };
}

function mapActivity(dto: ActivityEntryDto): ActivityEntry {
  const kindMap: Record<number, ActivityEntry["kind"]> = {
    1: "daily note",
    2: "accomplishment",
    3: "blocker",
    4: "risk",
    5: "support request",
    6: "next step",
    7: "card update",
  };

  return {
    id: dto.id,
    userId: "",
    kind: kindMap[dto.entryType] ?? "daily note",
    title: dto.title,
    body: dto.content,
    createdAt: dto.createdAtUtc,
  };
}

function mapCycle(dto: ReportingCycleDto): ReportingCycle {
  return {
    id: dto.id,
    name: dto.name,
    teamId: dto.teamId,
    cadence: toCycleCadence(dto.cadence),
    startDate: dto.startDateUtc,
    endDate: dto.endDateUtc,
    dueDate: dto.dueDateUtc,
    submissionDeadline: dto.submissionDeadlineUtc,
    status: toCycleStatus(dto.status),
  };
}

function mapPersonalMsr(dto: PersonalMsrDto): PersonalMsr {
  const generated = parseSections(dto.generatedSummary);
  const edited = parseSections(dto.editedSummary || dto.generatedSummary);
  const final = parseSections(dto.submittedSummary || dto.editedSummary || dto.generatedSummary);

  return {
    id: dto.id,
    userId: dto.userId,
    teamId: dto.teamId,
    cycleId: dto.reportingCycleId,
    status: toMsrStatus(dto.status),
    generated,
    edited,
    final,
    updatedAt: dto.submittedAtUtc ?? dto.versions[0]?.createdAtUtc ?? new Date().toISOString(),
    versionHistory: dto.versions.map((version) => ({
      label: version.versionLabel,
      author: version.changedById,
      at: version.createdAtUtc,
    })),
  };
}

function mapTeamMsr(dto: TeamMsrDto, personal: PersonalMsr[]): TeamMsr {
  return {
    id: dto.id,
    teamId: dto.teamId,
    cycleId: dto.reportingCycleId,
    status: toTeamMsrStatus(dto.status),
    executiveSummary: dto.executiveSummary,
    sections: parseSections(dto.detailedSummary),
    appendix: personal
      .filter((msr) => msr.teamId === dto.teamId)
      .map((msr) => ({
        userId: msr.userId,
        highlights: msr.final.flatMap((section) => section.bullets).slice(0, 3),
      })),
    updatedAt: dto.finalizedAtUtc ?? dto.versions[0]?.createdAtUtc ?? new Date().toISOString(),
    versionHistory: dto.versions.map((version) => ({
      label: version.versionLabel,
      author: version.changedById,
      at: version.createdAtUtc,
    })),
  };
}

function mapNotification(dto: NotificationDto): NotificationItem {
  const kindMap: Record<number, NotificationItem["kind"]> = {
    1: "assignment",
    2: "mention",
    3: "mention",
    4: "reminder",
    5: "report",
    6: "system",
  };

  return {
    id: dto.id,
    userId: "",
    kind: kindMap[dto.type] ?? "system",
    title: dto.title,
    body: dto.message,
    href: dto.link,
    createdAt: dto.createdAtUtc,
    read: Boolean(dto.readAtUtc),
  };
}

function mapAuditLog(dto: AuditLogDto): AuditLogItem {
  return {
    id: dto.id,
    actorId: dto.correlationId,
    action: dto.action,
    target: dto.entityName,
    targetId: dto.entityId,
    details: dto.details,
    createdAt: dto.createdAtUtc,
  };
}

async function getAdminSummarySafe() {
  try {
    return await apiFetch<AdminSummaryDto>("/api/admin/summary");
  } catch {
    return {
      organization: { id: fallbackOrganization.id, name: fallbackOrganization.name, slug: fallbackOrganization.branding, domain: "", defaultCadence: fallbackOrganization.cadence },
      teams: fallbackTeams.map((team) => ({ id: team.id, name: team.name, department: team.department, managerId: team.managerId, memberCount: team.memberIds.length })),
      users: fallbackUsers.map((user) => ({ id: user.id, fullName: user.name, email: user.email, role: user.role, title: user.title, teamId: user.teamIds[0], isActive: user.status === "active" })),
      invitations: fallbackInvitations.map((invite) => ({ id: invite.id, email: invite.email, role: invite.role, teamId: invite.teamId ?? "", expiresAtUtc: new Date().toISOString(), acceptedAtUtc: invite.status === "accepted" ? new Date().toISOString() : null })),
      templates: fallbackTemplates.map((template) => ({ id: template.id, name: template.name, templateType: "MSR", requiredSectionsJson: JSON.stringify(template.requiredSections), promptQuestionsJson: JSON.stringify(template.questionPrompts), defaultBoardColumnsJson: "[]", brandingJson: JSON.stringify({ branding: template.branding }) })),
      auditLogs: fallbackAuditLogs.map((audit) => ({ id: audit.id, action: audit.action, entityName: audit.target, entityId: audit.targetId, details: audit.details, createdAtUtc: audit.createdAt, correlationId: audit.actorId })),
    } satisfies AdminSummaryDto;
  }
}

export async function getMarketingStats() {
  return {
    organizations: 128,
    teams: 842,
    msrCompletion: 94,
    blockedItems: fallbackProjects.length,
  };
}

export async function getLandingHighlights() {
  return {
    pillars: [
      "Personal boards with manager-assigned work and collaborative accountability.",
      "Deterministic MSR generation that rolls card movement and manual notes into reports.",
      "Executive-ready dashboards, exports, and audit trails for multi-tenant organizations.",
    ],
  };
}

export async function getAppSummary() {
  const sessionUser = await requireSessionUser();
  const admin = await getAdminSummarySafe();
  const notifications = await apiFetch<NotificationDto[]>("/api/dashboards/notifications");
  const cycles = admin.teams.length > 0 ? await apiFetch<ReportingCycleDto[]>(`/api/reporting/cycles/${admin.teams[0].id}`) : [];
  const users = admin.users.map(mapUser);
  const currentUser = users.find((user) => user.id === sessionUser.id) ?? {
    id: sessionUser.id,
    name: sessionUser.fullName,
    email: sessionUser.email,
    role: sessionUser.role as User["role"],
    title: sessionUser.role,
    teamIds: sessionUser.teamId ? [sessionUser.teamId] : [],
    avatarColor: avatarColorFor(sessionUser.id),
    status: "active" as const,
  };

  return {
    currentUser,
    organization: mapOrganization(admin.organization),
    teams: admin.teams.map((team) => mapTeam(team, users)),
    projects: fallbackProjects,
    reportingCycles: cycles.map(mapCycle),
    cards: [] as Card[],
    boardColumns: [] as BoardColumn[],
    myCards: [] as Card[],
    blockedCards: [] as Card[],
    dueSoon: [] as Card[],
    notifications: notifications.map(mapNotification),
    unreadNotifications: notifications.filter((item) => !item.readAtUtc).length,
    activeCycle: cycles[0] ? mapCycle(cycles[0]) : undefined,
  };
}

export async function getDashboardData() {
  const sessionUser = await requireSessionUser();
  const canViewTeamReports =
    sessionUser.role === "Manager" ||
    sessionUser.role === "OrgAdmin" ||
    sessionUser.role === "PlatformAdmin" ||
    sessionUser.role === "ExecutiveViewer";
  const dashboardPath =
    sessionUser.role === "Manager" && sessionUser.teamId
      ? `/api/dashboards/manager/${sessionUser.teamId}`
      : sessionUser.role === "OrgAdmin" || sessionUser.role === "PlatformAdmin" || sessionUser.role === "ExecutiveViewer"
        ? "/api/dashboards/executive"
        : "/api/dashboards/me";

  const [dashboard, admin, cycles, teamMsrs] = await Promise.all([
    apiFetch<DashboardDto>(dashboardPath),
    getAdminSummarySafe(),
    sessionUser.teamId ? apiFetch<ReportingCycleDto[]>(`/api/reporting/cycles/${sessionUser.teamId}`) : Promise.resolve([] as ReportingCycleDto[]),
    sessionUser.teamId && canViewTeamReports ? apiFetch<TeamMsrDto[]>(`/api/reporting/team-msrs/${sessionUser.teamId}`) : Promise.resolve([] as TeamMsrDto[]),
  ]);

  const users = admin.users.map(mapUser);
  const personalMsrs = sessionUser.teamId && canViewTeamReports ? await apiFetch<PersonalMsrDto[]>(`/api/reporting/personal-msrs/${sessionUser.teamId}`) : [];
  const latestReport = teamMsrs[0] ? mapTeamMsr(teamMsrs[0], personalMsrs.map(mapPersonalMsr)) : fallbackTeamMsrs[0];

  return {
    currentUser: users.find((user) => user.id === sessionUser.id) ?? fallbackUsers[0],
    summary: {
      myOpen: Object.values(dashboard.workloadByPerson).reduce((sum, value) => sum + value, 0),
      blocked: dashboard.blockedCards.length,
      dueSoon: dashboard.dueSoonCards.length,
      msrDue: dashboard.nextMsrDueDateUtc ?? cycles[0]?.submissionDeadlineUtc ?? new Date().toISOString(),
    },
    workload: Object.entries(dashboard.workloadByPerson).map(([name, count]) => ({
      member: users.find((user) => user.name === name) ?? { ...fallbackUsers[0], id: name, name, title: "Team member" },
      cards: count,
      blocked: dashboard.blockedCards.filter((card) => card.ownerName === name).length,
    })),
    projectHealth: fallbackProjects,
    latestReport,
    blockerThemes: dashboard.repeatedBlockers,
  };
}

export async function getBoardData(scope: "personal" | "team" = "personal") {
  const [admin, sessionUser] = await Promise.all([getAdminSummarySafe(), requireSessionUser()]);
  const users = admin.users.map(mapUser);

  if (scope === "team" && sessionUser.teamId) {
    const boards = await apiFetch<BoardDto[]>(`/api/boards/team/${sessionUser.teamId}`);
    const columns = boards[0]?.columns.map(mapBoardColumn) ?? [];
    const cards = boards.flatMap((board) => board.cards.map((card) => mapCard(card, board.columns)));
    return { scope, columns, cards, projects: fallbackProjects, teamMembers: users, collaborators: users };
  }

  const board = await apiFetch<BoardDto>("/api/boards/me");
  return {
    scope,
    columns: board.columns.map(mapBoardColumn),
    cards: board.cards.map((card) => mapCard(card, board.columns)),
    projects: fallbackProjects,
    teamMembers: users,
    collaborators: users,
  };
}

export async function getTeamBoardData() {
  const [admin, sessionUser] = await Promise.all([getAdminSummarySafe(), requireSessionUser()]);
  const users = admin.users.map(mapUser);
  const teams = admin.teams.map((team) => mapTeam(team, users));
  const teamId = sessionUser.teamId ?? teams[0]?.id;

  if (!teamId) {
    return { columns: fallbackProjects as never, projects: fallbackProjects, boardsByPerson: [], allCards: [] as Card[] };
  }

  const boards = await apiFetch<BoardDto[]>(`/api/boards/team/${teamId}`);
  const columns = boards[0]?.columns.map(mapBoardColumn) ?? [];
  const boardsByPerson = boards.map((board) => ({
    team: teams.find((team) => team.id === teamId) ?? fallbackTeams[0],
    members: users.filter((user) => user.id === board.ownerId),
    cards: board.cards.map((card) => mapCard(card, board.columns)),
  }));

  return {
    columns,
    projects: fallbackProjects,
    boardsByPerson,
    allCards: boards.flatMap((board) => board.cards.map((card) => mapCard(card, board.columns))),
  };
}

export async function getTasksData() {
  const board = await getBoardData("personal");
  return {
    myTasks: board.cards,
    comments: [] as never[],
    subtasks: [] as never[],
  };
}

export async function getActivityData() {
  const entries = await apiFetch<ActivityEntryDto[]>("/api/reporting/activity");
  return {
    entries: entries.map(mapActivity),
  };
}

export async function getMsrData() {
  const [sessionUser, personal, team, admin] = await Promise.all([
    requireSessionUser(),
    requireSessionUser().then((user) => apiFetch<PersonalMsrDto[]>(`/api/reporting/personal-msrs/${user.teamId}`)),
    requireSessionUser().then((user) => apiFetch<TeamMsrDto[]>(`/api/reporting/team-msrs/${user.teamId}`)),
    getAdminSummarySafe(),
  ]);

  const cycles = sessionUser.teamId ? await apiFetch<ReportingCycleDto[]>(`/api/reporting/cycles/${sessionUser.teamId}`) : [];
  const personalMapped = personal.map(mapPersonalMsr);

  return {
    personal: personalMapped.filter((msr) => msr.userId === sessionUser.id),
    team: team.map((item) => mapTeamMsr(item, personalMapped)),
    cycles: cycles.map(mapCycle),
    activity: await getActivityData().then((data) => data.entries),
    users: admin.users.map(mapUser),
  };
}

export async function getMembersData() {
  const admin = await getAdminSummarySafe();
  const users = admin.users.map(mapUser);
  return {
    teams: admin.teams.map((team) => mapTeam(team, users)),
    users,
    currentUser: users[0] ?? fallbackUsers[0],
    invites: admin.invitations.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role as User["role"],
      teamId: invite.teamId,
      sentBy: "",
      status: invite.acceptedAtUtc ? "accepted" : "pending",
    })),
  };
}

export async function getProjectsData() {
  const [projects, admin, board] = await Promise.all([
    apiFetch<ProjectSummaryDto[]>("/api/projects"),
    getAdminSummarySafe(),
    getBoardData("team"),
  ]);
  const users = admin.users.map(mapUser);
  return {
    projects: projects.map((project) => mapProject(project, users)),
    cards: board.cards,
    teamMembers: users,
  };
}

export async function getReportingData() {
  const [admin, sessionUser, msrs] = await Promise.all([getAdminSummarySafe(), requireSessionUser(), getMsrData()]);
  const cycles = sessionUser.teamId ? await apiFetch<ReportingCycleDto[]>(`/api/reporting/cycles/${sessionUser.teamId}`) : [];
  return {
    cycles: cycles.map(mapCycle),
    templates: admin.templates.map((template) => ({
      id: template.id,
      name: template.name,
      cadence: "monthly" as const,
      requiredSections: JSON.parse(template.requiredSectionsJson || "[]"),
      questionPrompts: JSON.parse(template.promptQuestionsJson || "[]"),
      branding: template.brandingJson,
    })),
    personalMsrs: msrs.personal,
    teamMsrs: msrs.team,
  };
}

export async function getPersonalMsrWorkspace() {
  const [sessionUser, msrData, board, activity, cycles] = await Promise.all([
    requireSessionUser(),
    getMsrData(),
    getBoardData("personal"),
    getActivityData(),
    requireSessionUser().then((user) => (user.teamId ? apiFetch<ReportingCycleDto[]>(`/api/reporting/cycles/${user.teamId}`) : Promise.resolve([] as ReportingCycleDto[]))),
  ]);

  const draft = msrData.personal[0] ?? fallbackPersonalMsrs[0];
  const cycle = cycles.find((item) => item.id === draft.cycleId);
  return {
    draft,
    assigned: board.cards.filter((card) => card.ownerId === sessionUser.id && card.includeInMsr),
    collaborative: board.cards.filter((card) => card.collaboratorIds.includes(sessionUser.id)),
    cycle: cycle ? mapCycle(cycle) : fallbackCycles[0],
    activity: activity.entries,
    versionHistory: draft.versionHistory,
  };
}

export async function getTeamMsrWorkspace() {
  const [, msrData, admin] = await Promise.all([requireSessionUser(), getMsrData(), getAdminSummarySafe()]);
  const users = admin.users.map(mapUser);
  const teams = admin.teams.map((team) => mapTeam(team, users));
  const draft = msrData.team[0] ?? fallbackTeamMsrs[0];
  return {
    team: teams.find((team) => team.id === draft.teamId) ?? fallbackTeams[0],
    draft,
    personal: msrData.personal,
    cycle: msrData.cycles.find((cycle) => cycle.id === draft.cycleId) ?? fallbackCycles[0],
    versionHistory: draft.versionHistory,
    users,
  };
}

export async function getNotificationsData() {
  const notifications = await apiFetch<NotificationDto[]>("/api/dashboards/notifications");
  return {
    notifications: notifications.map(mapNotification),
  };
}

export async function getSettingsData() {
  const admin = await getAdminSummarySafe();
  const users = admin.users.map(mapUser);
  const enterprise = await getEnterpriseSettingsData(admin.organization.id);
  return {
    currentUser: users[0] ?? fallbackUsers[0],
    organization: mapOrganization(admin.organization),
    teams: admin.teams.map((team) => mapTeam(team, users)),
    enterprise,
    templates: admin.templates.map((template) => ({
      id: template.id,
      name: template.name,
      cadence: "monthly" as const,
      requiredSections: JSON.parse(template.requiredSectionsJson || "[]"),
      questionPrompts: JSON.parse(template.promptQuestionsJson || "[]"),
      branding: template.brandingJson,
    })),
  };
}

async function getEnterpriseSettingsData(organizationId: string) {
  try {
    return await apiFetch<OrganizationEnterpriseSettingsDto>(`/api/organizations/${organizationId}/enterprise-settings`);
  } catch {
    return {
      authentication: {
        id: "enterprise-auth-fallback",
        organizationId,
        authenticationMode: "Mixed",
        allowLocalPasswordSignIn: true,
        requireMfaByDefault: false,
        allowJustInTimeProvisioning: false,
        enforceDomainVerification: false,
        allowedDomains: [],
        defaultIdentityProviderId: null,
      },
      identityProviders: [],
      integrations: [],
      verifiedDomains: [],
      provisioning: {
        id: "enterprise-provisioning-fallback",
        organizationId,
        syncMode: "Manual",
        identityProviderId: null,
        autoProvisionNewUsers: false,
        autoDeactivateMissingUsers: false,
        groupMappingStrategy: "Manual",
        scimBaseUrl: "",
        lastSyncAtUtc: null,
        lastSyncStatus: "NotStarted",
        lastSyncError: "",
      },
      provisioningJobs: [],
      directoryGroupMappings: [],
      notificationRoutes: [],
      exportDestinations: [],
      calendarSyncSettings: [],
    } satisfies OrganizationEnterpriseSettingsDto;
  }
}

export async function getAdminData() {
  const admin = await getAdminSummarySafe();
  const users = admin.users.map(mapUser);
  return {
    organization: mapOrganization(admin.organization),
    teams: admin.teams.map((team) => mapTeam(team, users)),
    users,
    invitations: admin.invitations.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role as User["role"],
      teamId: invite.teamId,
      sentBy: "",
      status: invite.acceptedAtUtc ? "accepted" : "pending",
    })),
    auditLogs: admin.auditLogs.map(mapAuditLog),
    templates: admin.templates.map((template) => ({
      id: template.id,
      name: template.name,
      cadence: "monthly" as const,
      requiredSections: JSON.parse(template.requiredSectionsJson || "[]"),
      questionPrompts: JSON.parse(template.promptQuestionsJson || "[]"),
      branding: template.brandingJson,
    })),
  };
}
