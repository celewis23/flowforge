using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class WorkManagementService : IWorkManagementService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public WorkManagementService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BoardDto> GetBoardAsync(Guid organizationId, Guid ownerId, CancellationToken cancellationToken)
    {
        var board = await _dbContext.Boards
            .Include(x => x.Columns)
            .Include(x => x.Cards).ThenInclude(x => x.Comments)
            .Include(x => x.Cards).ThenInclude(x => x.Subtasks)
            .Include(x => x.Cards).ThenInclude(x => x.Collaborators)
            .SingleAsync(x => x.OrganizationId == organizationId && x.OwnerId == ownerId && x.IsDefault, cancellationToken);

        return await MapBoardAsync(board, cancellationToken);
    }

    public async Task<IReadOnlyCollection<BoardDto>> GetAggregatedTeamBoardAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        var boards = await _dbContext.Boards
            .Include(x => x.Columns)
            .Include(x => x.Cards).ThenInclude(x => x.Comments)
            .Include(x => x.Cards).ThenInclude(x => x.Subtasks)
            .Include(x => x.Cards).ThenInclude(x => x.Collaborators)
            .Where(x => x.OrganizationId == organizationId && x.TeamId == teamId)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        var result = new List<BoardDto>();
        foreach (var board in boards)
        {
            result.Add(await MapBoardAsync(board, cancellationToken));
        }

        return result;
    }

    public async Task<CardDto> CreateCardAsync(CreateCardRequest request, Guid actorId, CancellationToken cancellationToken)
    {
        var card = new WorkCard
        {
            OrganizationId = request.OrganizationId,
            BoardId = request.BoardId,
            ColumnId = request.ColumnId,
            OwnerId = request.OwnerId,
            ProjectId = request.ProjectId,
            Title = request.Title,
            Description = request.Description,
            Instructions = request.Instructions,
            TagsCsv = request.TagsCsv,
            SearchText = $"{request.Title} {request.Description} {request.TagsCsv}".ToLowerInvariant(),
            Priority = request.Priority,
            Visibility = request.Visibility,
            DueDateUtc = request.DueDateUtc,
            IncludeInMsr = request.IncludeInMsr,
            AcknowledgmentRequired = request.AcknowledgmentRequired,
            AssignmentState = AssignmentState.Assigned,
            LastMovedAtUtc = DateTime.UtcNow
        };

        _dbContext.Cards.Add(card);
        _dbContext.CardAssignments.Add(new CardAssignment
        {
            OrganizationId = request.OrganizationId,
            CardId = card.Id,
            AssignedById = actorId,
            AssignedToId = request.OwnerId,
            CurrentOwnerId = request.OwnerId,
            State = AssignmentState.Assigned
        });
        _dbContext.CardActivityLogs.Add(new CardActivityLog
        {
            OrganizationId = request.OrganizationId,
            CardId = card.Id,
            PerformedById = actorId,
            EventType = "Created",
            Description = "Card created by manager workflow."
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetCardAsync(card.Id, cancellationToken);
    }

    public async Task<CardDto> UpdateCardAsync(UpdateCardRequest request, Guid actorId, CancellationToken cancellationToken)
    {
        var card = await _dbContext.Cards.SingleAsync(x => x.Id == request.CardId, cancellationToken);
        var previousColumnId = card.ColumnId;
        card.ColumnId = request.ColumnId;
        card.Title = request.Title;
        card.Description = request.Description;
        card.Instructions = request.Instructions;
        card.TagsCsv = request.TagsCsv;
        card.SearchText = $"{request.Title} {request.Description} {request.TagsCsv}".ToLowerInvariant();
        card.Priority = request.Priority;
        card.AssignmentState = request.AssignmentState;
        card.Visibility = request.Visibility;
        card.DueDateUtc = request.DueDateUtc;
        card.LastMovedAtUtc = previousColumnId != request.ColumnId ? DateTime.UtcNow : card.LastMovedAtUtc;
        card.CompletedAtUtc = request.AssignmentState == AssignmentState.Done ? DateTime.UtcNow : null;

        _dbContext.CardActivityLogs.Add(new CardActivityLog
        {
            OrganizationId = card.OrganizationId,
            CardId = card.Id,
            PerformedById = actorId,
            EventType = previousColumnId != request.ColumnId ? "Moved" : "Updated",
            Description = previousColumnId != request.ColumnId ? "Card moved between columns." : "Card details updated."
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetCardAsync(card.Id, cancellationToken);
    }

    public async Task<CardCommentDto> AddCommentAsync(AddCommentRequest request, CancellationToken cancellationToken)
    {
        var organizationId = await _dbContext.Cards.Where(x => x.Id == request.CardId).Select(x => x.OrganizationId).SingleAsync(cancellationToken);
        var comment = new CardComment
        {
            OrganizationId = organizationId,
            CardId = request.CardId,
            AuthorId = request.AuthorId,
            Body = request.Body
        };

        _dbContext.CardComments.Add(comment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var author = await _dbContext.Users.Where(x => x.Id == request.AuthorId).Select(x => x.FullName).SingleAsync(cancellationToken);
        return new CardCommentDto(comment.Id, request.AuthorId, author, comment.Body, comment.CreatedAtUtc);
    }

    public async Task AddCollaboratorAsync(AddCollaboratorRequest request, Guid actorId, CancellationToken cancellationToken)
    {
        var card = await _dbContext.Cards.SingleAsync(x => x.Id == request.CardId, cancellationToken);
        if (!await _dbContext.CardCollaborators.AnyAsync(x => x.CardId == request.CardId && x.UserId == request.UserId, cancellationToken))
        {
            _dbContext.CardCollaborators.Add(new CardCollaborator
            {
                OrganizationId = card.OrganizationId,
                CardId = request.CardId,
                UserId = request.UserId,
                Role = request.Role
            });
        }

        _dbContext.CardActivityLogs.Add(new CardActivityLog
        {
            OrganizationId = card.OrganizationId,
            CardId = request.CardId,
            PerformedById = actorId,
            EventType = "CollaboratorAdded",
            Description = $"Collaborator added as {request.Role}."
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<CardSubtaskDto> AddSubtaskAsync(CreateSubtaskRequest request, Guid actorId, CancellationToken cancellationToken)
    {
        var card = await _dbContext.Cards.SingleAsync(x => x.Id == request.CardId, cancellationToken);
        var subtask = new CardSubtask
        {
            OrganizationId = card.OrganizationId,
            CardId = request.CardId,
            AssigneeId = request.AssigneeId,
            Title = request.Title
        };

        _dbContext.CardSubtasks.Add(subtask);
        _dbContext.CardActivityLogs.Add(new CardActivityLog
        {
            OrganizationId = card.OrganizationId,
            CardId = request.CardId,
            PerformedById = actorId,
            EventType = "SubtaskAdded",
            Description = request.Title
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return new CardSubtaskDto(subtask.Id, subtask.Title, subtask.AssigneeId, subtask.IsCompleted);
    }

    public async Task<IReadOnlyCollection<ProjectSummaryDto>> GetProjectsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        return await _dbContext.Projects
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.Name)
            .Select(x => new ProjectSummaryDto(x.Id, x.Name, x.Workstream, x.Status, x.Health))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProjectSummaryDto> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            OrganizationId = request.OrganizationId,
            Name = request.Name,
            Workstream = request.Workstream,
            Description = request.Description,
            OwnerId = request.OwnerId
        };

        _dbContext.Projects.Add(project);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return new ProjectSummaryDto(project.Id, project.Name, project.Workstream, project.Status, project.Health);
    }

    private async Task<CardDto> GetCardAsync(Guid cardId, CancellationToken cancellationToken)
    {
        var card = await _dbContext.Cards
            .Include(x => x.Comments)
            .Include(x => x.Subtasks)
            .Include(x => x.Collaborators)
            .SingleAsync(x => x.Id == cardId, cancellationToken);

        var userIds = card.Collaborators.Select(x => x.UserId).Append(card.OwnerId).Append(card.Comments.FirstOrDefault()?.AuthorId ?? Guid.Empty).Distinct().Where(x => x != Guid.Empty).ToList();
        var users = await _dbContext.Users.Where(x => userIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.FullName, cancellationToken);

        return new CardDto(
            card.Id,
            card.BoardId,
            card.ColumnId,
            card.OwnerId,
            users.GetValueOrDefault(card.OwnerId, "Unknown"),
            card.ProjectId,
            card.Title,
            card.Description,
            card.Instructions,
            card.TagsCsv,
            card.Priority,
            card.AssignmentState,
            card.Visibility,
            card.DueDateUtc,
            card.IncludeInMsr,
            card.AcknowledgmentRequired,
            card.AssignmentState == AssignmentState.Blocked,
            card.DueDateUtc.HasValue && card.DueDateUtc < DateTime.UtcNow && card.AssignmentState != AssignmentState.Done,
            card.Collaborators.Select(x => users.GetValueOrDefault(x.UserId, "Unknown")).ToList(),
            card.Comments.Select(x => new CardCommentDto(x.Id, x.AuthorId, users.GetValueOrDefault(x.AuthorId, "Unknown"), x.Body, x.CreatedAtUtc)).ToList(),
            card.Subtasks.Select(x => new CardSubtaskDto(x.Id, x.Title, x.AssigneeId, x.IsCompleted)).ToList());
    }

    private async Task<BoardDto> MapBoardAsync(Board board, CancellationToken cancellationToken)
    {
        var owner = await _dbContext.Users.Where(x => x.Id == board.OwnerId).Select(x => x.FullName).SingleAsync(cancellationToken);
        var cards = new List<CardDto>();
        foreach (var card in board.Cards.OrderByDescending(x => x.Priority).ThenBy(x => x.DueDateUtc))
        {
            cards.Add(await GetCardAsync(card.Id, cancellationToken));
        }

        return new BoardDto(
            board.Id,
            $"{board.Name} ({owner})",
            board.OwnerId,
            board.Columns.OrderBy(x => x.Position).Select(x => new BoardColumnDto(x.Id, x.Name, x.Position, x.Color)).ToList(),
            cards);
    }
}
