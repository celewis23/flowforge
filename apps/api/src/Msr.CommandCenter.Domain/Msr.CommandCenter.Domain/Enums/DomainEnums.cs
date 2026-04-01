namespace Msr.CommandCenter.Domain.Enums;

public enum PlatformRole
{
    PlatformAdmin = 1,
    OrgAdmin = 2,
    Manager = 3,
    TeamMember = 4,
    ExecutiveViewer = 5
}

public enum CardPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public enum AssignmentState
{
    Assigned = 1,
    Acknowledged = 2,
    InProgress = 3,
    Blocked = 4,
    Done = 5
}

public enum CardVisibility
{
    Private = 1,
    Team = 2,
    Managers = 3,
    Organization = 4
}

public enum ProjectHealth
{
    OnTrack = 1,
    AtRisk = 2,
    OffTrack = 3
}

public enum ReportingCycleStatus
{
    Open = 1,
    PendingReview = 2,
    Finalized = 3,
    Archived = 4
}

public enum MsrStatus
{
    Draft = 1,
    Submitted = 2,
    NeedsRevision = 3,
    Finalized = 4,
    Locked = 5
}

public enum NotificationType
{
    Assignment = 1,
    Collaboration = 2,
    Mention = 3,
    Reminder = 4,
    Report = 5,
    System = 6
}

public enum NotificationChannel
{
    InApp = 1,
    Email = 2
}

public enum ActivityEntryType
{
    Note = 1,
    Accomplishment = 2,
    Blocker = 3,
    Risk = 4,
    SupportRequest = 5,
    NextStep = 6,
    AdHocWork = 7
}
