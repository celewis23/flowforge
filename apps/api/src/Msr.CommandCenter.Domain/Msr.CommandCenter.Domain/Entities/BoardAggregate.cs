using Msr.CommandCenter.Domain.Common;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Domain.Entities;

public class Board : TenantEntity
{
    public Guid OwnerId { get; set; }
    public Guid? TeamId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public Organization? Organization { get; set; }
    public ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
    public ICollection<WorkCard> Cards { get; set; } = new List<WorkCard>();
}

public class BoardColumn : TenantEntity
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public string Color { get; set; } = string.Empty;
    public Board? Board { get; set; }
}

public class WorkCard : TenantEntity
{
    public Guid BoardId { get; set; }
    public Guid ColumnId { get; set; }
    public Guid OwnerId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? ReportingCycleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public string TagsCsv { get; set; } = string.Empty;
    public string SearchText { get; set; } = string.Empty;
    public CardPriority Priority { get; set; } = CardPriority.Medium;
    public AssignmentState AssignmentState { get; set; } = AssignmentState.Assigned;
    public CardVisibility Visibility { get; set; } = CardVisibility.Team;
    public DateTime? DueDateUtc { get; set; }
    public bool IncludeInMsr { get; set; } = true;
    public bool AcknowledgmentRequired { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? LastMovedAtUtc { get; set; }
    public Board? Board { get; set; }
    public BoardColumn? Column { get; set; }
    public Project? Project { get; set; }
    public ICollection<CardAssignment> Assignments { get; set; } = new List<CardAssignment>();
    public ICollection<CardCollaborator> Collaborators { get; set; } = new List<CardCollaborator>();
    public ICollection<CardComment> Comments { get; set; } = new List<CardComment>();
    public ICollection<CardAttachment> Attachments { get; set; } = new List<CardAttachment>();
    public ICollection<CardSubtask> Subtasks { get; set; } = new List<CardSubtask>();
    public ICollection<CardActivityLog> ActivityLogs { get; set; } = new List<CardActivityLog>();
}

public class CardAssignment : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid AssignedById { get; set; }
    public Guid AssignedToId { get; set; }
    public Guid CurrentOwnerId { get; set; }
    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? AcknowledgedAtUtc { get; set; }
    public DateTime? ReassignedAtUtc { get; set; }
    public Guid? ReassignedById { get; set; }
    public AssignmentState State { get; set; } = AssignmentState.Assigned;
    public WorkCard? Card { get; set; }
}

public class CardCollaborator : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Contributor";
    public WorkCard? Card { get; set; }
}

public class CardComment : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid AuthorId { get; set; }
    public string Body { get; set; } = string.Empty;
    public WorkCard? Card { get; set; }
}

public class CardAttachment : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid UploadedById { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public WorkCard? Card { get; set; }
}

public class CardSubtask : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid? AssigneeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public WorkCard? Card { get; set; }
}

public class CardActivityLog : TenantEntity
{
    public Guid CardId { get; set; }
    public Guid PerformedById { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string MetadataJson { get; set; } = "{}";
    public WorkCard? Card { get; set; }
}
