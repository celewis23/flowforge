using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Application.Dtos;

public record AuthResponseDto(
    string AccessToken,
    DateTime ExpiresAtUtc,
    UserProfileDto User,
    string OrganizationSlug);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    Guid OrganizationId,
    Guid? TeamId);

public record OrganizationSummaryDto(Guid Id, string Name, string Slug, string Domain, string DefaultCadence);

public record TeamSummaryDto(Guid Id, string Name, string Department, Guid ManagerId, int MemberCount);

public record ProjectSummaryDto(Guid Id, string Name, string Workstream, string Status, ProjectHealth Health);

public record BoardColumnDto(Guid Id, string Name, int Position, string Color);

public record CardCommentDto(Guid Id, Guid AuthorId, string AuthorName, string Body, DateTime CreatedAtUtc);

public record CardSubtaskDto(Guid Id, string Title, Guid? AssigneeId, bool IsCompleted);

public record CardDto(
    Guid Id,
    Guid BoardId,
    Guid ColumnId,
    Guid OwnerId,
    string OwnerName,
    Guid? ProjectId,
    string Title,
    string Description,
    string Instructions,
    string TagsCsv,
    CardPriority Priority,
    AssignmentState AssignmentState,
    CardVisibility Visibility,
    DateTime? DueDateUtc,
    bool IncludeInMsr,
    bool AcknowledgmentRequired,
    bool IsBlocked,
    bool IsOverdue,
    IReadOnlyCollection<string> Collaborators,
    IReadOnlyCollection<CardCommentDto> Comments,
    IReadOnlyCollection<CardSubtaskDto> Subtasks);

public record BoardDto(
    Guid Id,
    string Name,
    Guid OwnerId,
    IReadOnlyCollection<BoardColumnDto> Columns,
    IReadOnlyCollection<CardDto> Cards);

public record ActivityEntryDto(
    Guid Id,
    ActivityEntryType EntryType,
    string Title,
    string Content,
    bool IncludeInMsr,
    DateTime CreatedAtUtc);

public record PersonalMsrDto(
    Guid Id,
    Guid UserId,
    Guid TeamId,
    Guid ReportingCycleId,
    MsrStatus Status,
    string GeneratedSummary,
    string EditedSummary,
    string SubmittedSummary,
    DateTime? SubmittedAtUtc,
    string Feedback,
    IReadOnlyCollection<ReportVersionDto> Versions);

public record TeamMsrDto(
    Guid Id,
    Guid TeamId,
    Guid ReportingCycleId,
    MsrStatus Status,
    string ExecutiveSummary,
    string DetailedSummary,
    string ManagerNotes,
    DateTime? FinalizedAtUtc,
    IReadOnlyCollection<ReportVersionDto> Versions);

public record ReportVersionDto(Guid Id, string VersionLabel, Guid ChangedById, DateTime CreatedAtUtc);

public record ReportingCycleDto(
    Guid Id,
    Guid TeamId,
    string Name,
    string Cadence,
    DateTime StartDateUtc,
    DateTime EndDateUtc,
    DateTime DueDateUtc,
    DateTime SubmissionDeadlineUtc,
    ReportingCycleStatus Status);

public record NotificationDto(Guid Id, NotificationType Type, string Title, string Message, string Link, DateTime CreatedAtUtc, DateTime? ReadAtUtc);

public record DashboardDto(
    IReadOnlyCollection<CardDto> DueSoonCards,
    IReadOnlyCollection<CardDto> BlockedCards,
    IReadOnlyCollection<CardDto> RecentCompletions,
    IReadOnlyDictionary<string, int> WorkloadByPerson,
    IReadOnlyDictionary<string, int> WorkloadByProject,
    IReadOnlyCollection<string> RepeatedBlockers,
    DateTime? NextMsrDueDateUtc,
    decimal SubmissionCompletionRate);

public record AuditLogDto(Guid Id, string Action, string EntityName, string EntityId, string Details, DateTime CreatedAtUtc, string CorrelationId);
