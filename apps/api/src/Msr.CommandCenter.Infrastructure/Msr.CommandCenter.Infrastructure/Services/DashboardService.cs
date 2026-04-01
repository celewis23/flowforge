using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public DashboardService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<DashboardDto> GetTeamMemberDashboardAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken)
    {
        var cards = await _dbContext.Cards.Where(x => x.OrganizationId == organizationId && x.OwnerId == userId).ToListAsync(cancellationToken);
        return await BuildDashboardAsync(cards, organizationId, userId: userId, cancellationToken: cancellationToken);
    }

    public async Task<DashboardDto> GetManagerDashboardAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        var ownerIds = await _dbContext.TeamMemberships.Where(x => x.OrganizationId == organizationId && x.TeamId == teamId && x.IsActive).Select(x => x.UserId).ToListAsync(cancellationToken);
        var cards = await _dbContext.Cards.Where(x => x.OrganizationId == organizationId && ownerIds.Contains(x.OwnerId)).ToListAsync(cancellationToken);
        return await BuildDashboardAsync(cards, organizationId, teamId, cancellationToken: cancellationToken);
    }

    public async Task<DashboardDto> GetExecutiveDashboardAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        var cards = await _dbContext.Cards.Where(x => x.OrganizationId == organizationId).ToListAsync(cancellationToken);
        return await BuildDashboardAsync(cards, organizationId, cancellationToken: cancellationToken);
    }

    public async Task<IReadOnlyCollection<NotificationDto>> GetNotificationsAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.Notifications
            .Where(x => x.OrganizationId == organizationId && x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(25)
            .Select(x => new NotificationDto(x.Id, x.Type, x.Title, x.Message, x.Link, x.CreatedAtUtc, x.ReadAtUtc))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<AuditLogDto>> GetAuditLogsAsync(Guid? organizationId, CancellationToken cancellationToken)
    {
        return await _dbContext.AuditLogs
            .Where(x => !organizationId.HasValue || x.OrganizationId == organizationId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(100)
            .Select(x => new AuditLogDto(x.Id, x.Action, x.EntityName, x.EntityId, x.Details, x.CreatedAtUtc, x.CorrelationId))
            .ToListAsync(cancellationToken);
    }

    private async Task<DashboardDto> BuildDashboardAsync(IReadOnlyCollection<WorkCard> cards, Guid organizationId, Guid? teamId = null, Guid? userId = null, CancellationToken cancellationToken = default)
    {
        var projects = await _dbContext.Projects.Where(x => x.OrganizationId == organizationId).ToDictionaryAsync(x => x.Id, x => x.Name, cancellationToken);
        var users = await _dbContext.Users.Where(x => x.OrganizationId == organizationId).ToDictionaryAsync(x => x.Id, x => x.FullName, cancellationToken);
        var msrCompletionBase = teamId.HasValue
            ? await _dbContext.PersonalMsrs.Where(x => x.OrganizationId == organizationId && x.TeamId == teamId).ToListAsync(cancellationToken)
            : await _dbContext.PersonalMsrs.Where(x => x.OrganizationId == organizationId).ToListAsync(cancellationToken);

        var repeatedBlockers = await _dbContext.ActivityEntries
            .Where(x => x.OrganizationId == organizationId && (!teamId.HasValue || x.TeamId == teamId) && x.EntryType == ActivityEntryType.Blocker)
            .GroupBy(x => x.Title)
            .OrderByDescending(x => x.Count())
            .Select(x => x.Key)
            .Take(5)
            .ToListAsync(cancellationToken);

        var nextMsrDueDate = await _dbContext.ReportingCycles
            .Where(x => x.OrganizationId == organizationId && (!teamId.HasValue || x.TeamId == teamId))
            .OrderBy(x => x.DueDateUtc)
            .Select(x => (DateTime?)x.DueDateUtc)
            .FirstOrDefaultAsync(cancellationToken);

        var dueSoon = cards.Where(x => x.DueDateUtc is not null && x.DueDateUtc <= DateTime.UtcNow.AddDays(7) && x.AssignmentState != AssignmentState.Done).ToList();
        var blocked = cards.Where(x => x.AssignmentState == AssignmentState.Blocked).ToList();
        var recent = cards.Where(x => x.AssignmentState == AssignmentState.Done).OrderByDescending(x => x.CompletedAtUtc).Take(8).ToList();

        var workloadByPerson = cards.GroupBy(x => users.GetValueOrDefault(x.OwnerId, "Unknown")).ToDictionary(x => x.Key, x => x.Count(y => y.AssignmentState != AssignmentState.Done));
        var workloadByProject = cards.GroupBy(x => x.ProjectId.HasValue ? projects.GetValueOrDefault(x.ProjectId.Value, "Unassigned") : "Unassigned").ToDictionary(x => x.Key, x => x.Count(y => y.AssignmentState != AssignmentState.Done));
        var submissionCompletionRate = msrCompletionBase.Count == 0 ? 0 : (decimal)msrCompletionBase.Count(x => x.Status is MsrStatus.Submitted or MsrStatus.Finalized or MsrStatus.Locked) / msrCompletionBase.Count;

        return new DashboardDto(
            dueSoon.Select(x => ToCardDto(x, users)).ToList(),
            blocked.Select(x => ToCardDto(x, users)).ToList(),
            recent.Select(x => ToCardDto(x, users)).ToList(),
            workloadByPerson,
            workloadByProject,
            repeatedBlockers,
            nextMsrDueDate,
            Math.Round(submissionCompletionRate, 2));
    }

    private static CardDto ToCardDto(WorkCard card, IReadOnlyDictionary<Guid, string> users) =>
        new(card.Id, card.BoardId, card.ColumnId, card.OwnerId, users.GetValueOrDefault(card.OwnerId, "Unknown"), card.ProjectId, card.Title, card.Description, card.Instructions, card.TagsCsv, card.Priority, card.AssignmentState, card.Visibility, card.DueDateUtc, card.IncludeInMsr, card.AcknowledgmentRequired, card.AssignmentState == AssignmentState.Blocked, card.DueDateUtc.HasValue && card.DueDateUtc < DateTime.UtcNow && card.AssignmentState != AssignmentState.Done, Array.Empty<string>(), Array.Empty<CardCommentDto>(), Array.Empty<CardSubtaskDto>());
}
