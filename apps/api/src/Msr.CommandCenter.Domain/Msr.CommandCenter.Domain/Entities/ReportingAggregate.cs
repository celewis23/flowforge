using Msr.CommandCenter.Domain.Common;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Domain.Entities;

public class ReportingCycle : TenantEntity
{
    public Guid TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Cadence { get; set; } = "Monthly";
    public DateTime StartDateUtc { get; set; }
    public DateTime EndDateUtc { get; set; }
    public DateTime DueDateUtc { get; set; }
    public DateTime SubmissionDeadlineUtc { get; set; }
    public ReportingCycleStatus Status { get; set; } = ReportingCycleStatus.Open;
    public Team? Team { get; set; }
    public ICollection<ActivityEntry> ActivityEntries { get; set; } = new List<ActivityEntry>();
    public ICollection<PersonalMsr> PersonalMsrs { get; set; } = new List<PersonalMsr>();
    public ICollection<TeamMsr> TeamMsrs { get; set; } = new List<TeamMsr>();
}

public class ActivityEntry : TenantEntity
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public Guid? CardId { get; set; }
    public Guid ReportingCycleId { get; set; }
    public ActivityEntryType EntryType { get; set; } = ActivityEntryType.Note;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IncludeInMsr { get; set; } = true;
    public ReportingCycle? ReportingCycle { get; set; }
}

public class PersonalMsr : TenantEntity
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public Guid ReportingCycleId { get; set; }
    public MsrStatus Status { get; set; } = MsrStatus.Draft;
    public string GeneratedSummary { get; set; } = string.Empty;
    public string EditedSummary { get; set; } = string.Empty;
    public string SubmittedSummary { get; set; } = string.Empty;
    public DateTime? SubmittedAtUtc { get; set; }
    public Guid? ReviewedById { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public ReportingCycle? ReportingCycle { get; set; }
    public ICollection<PersonalMsrVersion> Versions { get; set; } = new List<PersonalMsrVersion>();
}

public class PersonalMsrVersion : TenantEntity
{
    public Guid PersonalMsrId { get; set; }
    public Guid ChangedById { get; set; }
    public string VersionLabel { get; set; } = string.Empty;
    public string Snapshot { get; set; } = string.Empty;
    public PersonalMsr? PersonalMsr { get; set; }
}

public class TeamMsr : TenantEntity
{
    public Guid TeamId { get; set; }
    public Guid ReportingCycleId { get; set; }
    public MsrStatus Status { get; set; } = MsrStatus.Draft;
    public string ExecutiveSummary { get; set; } = string.Empty;
    public string DetailedSummary { get; set; } = string.Empty;
    public string ManagerNotes { get; set; } = string.Empty;
    public DateTime? FinalizedAtUtc { get; set; }
    public Guid? FinalizedById { get; set; }
    public ReportingCycle? ReportingCycle { get; set; }
    public ICollection<TeamMsrVersion> Versions { get; set; } = new List<TeamMsrVersion>();
}

public class TeamMsrVersion : TenantEntity
{
    public Guid TeamMsrId { get; set; }
    public Guid ChangedById { get; set; }
    public string VersionLabel { get; set; } = string.Empty;
    public string Snapshot { get; set; } = string.Empty;
    public TeamMsr? TeamMsr { get; set; }
}

public class Notification : TenantEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public NotificationChannel Channel { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public DateTime? ReadAtUtc { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? OrganizationId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
}

public class OrganizationInvitation : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid TeamId { get; set; }
    public Guid InvitedById { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? AcceptedAtUtc { get; set; }
}
