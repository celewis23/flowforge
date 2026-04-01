using System.Text;
using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class ReportingService : IReportingService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public ReportingService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<ReportingCycleDto>> GetReportingCyclesAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        return await _dbContext.ReportingCycles
            .Where(x => x.OrganizationId == organizationId && x.TeamId == teamId)
            .OrderByDescending(x => x.StartDateUtc)
            .Select(x => new ReportingCycleDto(x.Id, x.TeamId, x.Name, x.Cadence, x.StartDateUtc, x.EndDateUtc, x.DueDateUtc, x.SubmissionDeadlineUtc, x.Status))
            .ToListAsync(cancellationToken);
    }

    public async Task<ActivityEntryDto> CreateActivityEntryAsync(CreateActivityEntryRequest request, CancellationToken cancellationToken)
    {
        var entry = new ActivityEntry
        {
            OrganizationId = request.OrganizationId,
            TeamId = request.TeamId,
            UserId = request.UserId,
            ReportingCycleId = request.ReportingCycleId,
            EntryType = request.EntryType,
            Title = request.Title,
            Content = request.Content,
            IncludeInMsr = request.IncludeInMsr
        };
        _dbContext.ActivityEntries.Add(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return new ActivityEntryDto(entry.Id, entry.EntryType, entry.Title, entry.Content, entry.IncludeInMsr, entry.CreatedAtUtc);
    }

    public async Task<PersonalMsrDto> GeneratePersonalMsrAsync(GeneratePersonalMsrRequest request, CancellationToken cancellationToken)
    {
        var cycle = await _dbContext.ReportingCycles.SingleAsync(x => x.Id == request.ReportingCycleId, cancellationToken);
        var cards = await _dbContext.Cards
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        x.OwnerId == request.UserId &&
                        x.IncludeInMsr &&
                        x.ReportingCycleId == request.ReportingCycleId)
            .ToListAsync(cancellationToken);

        var collaboratorCards = await _dbContext.CardCollaborators
            .Include(x => x.Card)
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        x.UserId == request.UserId &&
                        x.Card!.ReportingCycleId == request.ReportingCycleId)
            .Select(x => x.Card!)
            .ToListAsync(cancellationToken);

        var entries = await _dbContext.ActivityEntries
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        x.UserId == request.UserId &&
                        x.ReportingCycleId == request.ReportingCycleId &&
                        x.IncludeInMsr)
            .ToListAsync(cancellationToken);

        var generated = BuildPersonalSummary(cards, collaboratorCards, entries, cycle);

        var existing = await _dbContext.PersonalMsrs
            .Include(x => x.Versions)
            .FirstOrDefaultAsync(x => x.OrganizationId == request.OrganizationId &&
                                      x.UserId == request.UserId &&
                                      x.ReportingCycleId == request.ReportingCycleId, cancellationToken);

        if (existing is null)
        {
            existing = new PersonalMsr
            {
                OrganizationId = request.OrganizationId,
                TeamId = request.TeamId,
                UserId = request.UserId,
                ReportingCycleId = request.ReportingCycleId
            };
            _dbContext.PersonalMsrs.Add(existing);
        }

        existing.GeneratedSummary = generated;
        existing.EditedSummary = string.IsNullOrWhiteSpace(existing.EditedSummary) ? generated : existing.EditedSummary;
        existing.SubmittedSummary = string.IsNullOrWhiteSpace(existing.SubmittedSummary) ? existing.EditedSummary : existing.SubmittedSummary;
        existing.Status = MsrStatus.Draft;

        await _dbContext.SaveChangesAsync(cancellationToken);

        _dbContext.PersonalMsrVersions.Add(new PersonalMsrVersion
        {
            OrganizationId = request.OrganizationId,
            PersonalMsrId = existing.Id,
            ChangedById = request.UserId,
            VersionLabel = $"generated-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Snapshot = generated
        });
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetPersonalMsrAsync(existing.Id, cancellationToken);
    }

    public async Task<PersonalMsrDto> SubmitPersonalMsrAsync(SubmitPersonalMsrRequest request, Guid actorId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.PersonalMsrs.Include(x => x.Versions).SingleAsync(x => x.Id == request.PersonalMsrId, cancellationToken);
        msr.EditedSummary = request.EditedSummary;
        msr.SubmittedSummary = request.EditedSummary;
        msr.Status = MsrStatus.Submitted;
        msr.SubmittedAtUtc = DateTime.UtcNow;
        _dbContext.PersonalMsrVersions.Add(new PersonalMsrVersion
        {
            OrganizationId = msr.OrganizationId,
            PersonalMsrId = msr.Id,
            ChangedById = actorId,
            VersionLabel = $"submitted-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Snapshot = msr.SubmittedSummary
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetPersonalMsrAsync(msr.Id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<PersonalMsrDto>> GetPersonalMsrsAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        var msrs = await _dbContext.PersonalMsrs
            .Include(x => x.Versions)
            .Where(x => x.OrganizationId == organizationId && x.TeamId == teamId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return msrs.Select(MapPersonalMsr).ToList();
    }

    public async Task<TeamMsrDto> CompileTeamMsrAsync(CompileTeamMsrRequest request, CancellationToken cancellationToken)
    {
        var cycle = await _dbContext.ReportingCycles.SingleAsync(x => x.Id == request.ReportingCycleId, cancellationToken);
        var personalMsrs = await _dbContext.PersonalMsrs
            .Where(x => x.OrganizationId == request.OrganizationId && x.TeamId == request.TeamId && x.ReportingCycleId == request.ReportingCycleId)
            .ToListAsync(cancellationToken);

        var executiveSummary = $"Cycle {cycle.Name}: {personalMsrs.Count} personal MSRs reviewed. " +
                               $"{personalMsrs.Count(x => x.Status == MsrStatus.Submitted || x.Status == MsrStatus.Finalized)} submitted on time.";

        var groupedBlockers = await _dbContext.ActivityEntries
            .Where(x => x.OrganizationId == request.OrganizationId &&
                        x.TeamId == request.TeamId &&
                        x.ReportingCycleId == request.ReportingCycleId &&
                        x.EntryType == ActivityEntryType.Blocker)
            .GroupBy(x => x.Title)
            .OrderByDescending(x => x.Count())
            .Select(x => $"{x.Key} ({x.Count()})")
            .Take(5)
            .ToListAsync(cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("Accomplishments Rollup");
        foreach (var msr in personalMsrs)
        {
            builder.AppendLine($"- {msr.SubmittedSummary}");
        }
        builder.AppendLine();
        builder.AppendLine("Repeated Blockers");
        foreach (var blocker in groupedBlockers)
        {
            builder.AppendLine($"- {blocker}");
        }

        var teamMsr = await _dbContext.TeamMsrs
            .Include(x => x.Versions)
            .FirstOrDefaultAsync(x => x.OrganizationId == request.OrganizationId &&
                                      x.TeamId == request.TeamId &&
                                      x.ReportingCycleId == request.ReportingCycleId, cancellationToken);

        if (teamMsr is null)
        {
            teamMsr = new TeamMsr
            {
                OrganizationId = request.OrganizationId,
                TeamId = request.TeamId,
                ReportingCycleId = request.ReportingCycleId
            };
            _dbContext.TeamMsrs.Add(teamMsr);
        }

        teamMsr.ExecutiveSummary = executiveSummary;
        teamMsr.DetailedSummary = builder.ToString().Trim();
        teamMsr.Status = MsrStatus.Draft;

        await _dbContext.SaveChangesAsync(cancellationToken);

        _dbContext.TeamMsrVersions.Add(new TeamMsrVersion
        {
            OrganizationId = request.OrganizationId,
            TeamMsrId = teamMsr.Id,
            ChangedById = request.ManagerId,
            VersionLabel = $"compiled-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Snapshot = teamMsr.DetailedSummary
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetTeamMsrAsync(teamMsr.Id, cancellationToken);
    }

    public async Task<TeamMsrDto> FinalizeTeamMsrAsync(FinalizeTeamMsrRequest request, CancellationToken cancellationToken)
    {
        var teamMsr = await _dbContext.TeamMsrs.Include(x => x.Versions).SingleAsync(x => x.Id == request.TeamMsrId, cancellationToken);
        teamMsr.Status = MsrStatus.Finalized;
        teamMsr.ManagerNotes = request.ManagerNotes;
        teamMsr.FinalizedAtUtc = DateTime.UtcNow;
        teamMsr.FinalizedById = request.FinalizedById;
        _dbContext.TeamMsrVersions.Add(new TeamMsrVersion
        {
            OrganizationId = teamMsr.OrganizationId,
            TeamMsrId = teamMsr.Id,
            ChangedById = request.FinalizedById,
            VersionLabel = $"final-{DateTime.UtcNow:yyyyMMddHHmmss}",
            Snapshot = $"{teamMsr.ExecutiveSummary}\n\n{teamMsr.DetailedSummary}"
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetTeamMsrAsync(teamMsr.Id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<TeamMsrDto>> GetTeamMsrsAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        var teamMsrs = await _dbContext.TeamMsrs
            .Include(x => x.Versions)
            .Where(x => x.OrganizationId == organizationId && x.TeamId == teamId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return teamMsrs.Select(MapTeamMsr).ToList();
    }

    private static string BuildPersonalSummary(
        IReadOnlyCollection<WorkCard> ownedCards,
        IReadOnlyCollection<WorkCard> collaboratorCards,
        IReadOnlyCollection<ActivityEntry> entries,
        ReportingCycle cycle)
    {
        var accomplishments = ownedCards.Where(x => x.AssignmentState == AssignmentState.Done).Select(x => x.Title)
            .Concat(entries.Where(x => x.EntryType == ActivityEntryType.Accomplishment).Select(x => x.Content))
            .Distinct()
            .ToList();
        var inProgress = ownedCards.Where(x => x.AssignmentState == AssignmentState.InProgress).Select(x => x.Title).ToList();
        var blocked = ownedCards.Where(x => x.AssignmentState == AssignmentState.Blocked).Select(x => x.Title)
            .Concat(entries.Where(x => x.EntryType == ActivityEntryType.Blocker).Select(x => x.Content))
            .Distinct()
            .ToList();
        var upcoming = ownedCards.Where(x => x.AssignmentState != AssignmentState.Done && x.DueDateUtc >= DateTime.UtcNow).Select(x => x.Title).Take(5).ToList();
        var collaborative = collaboratorCards.Select(x => x.Title).Distinct().ToList();

        var builder = new StringBuilder();
        builder.AppendLine($"Reporting cycle: {cycle.Name}");
        builder.AppendLine("Accomplishments:");
        foreach (var line in accomplishments.DefaultIfEmpty("No completed accomplishments captured."))
        {
            builder.AppendLine($"- {line}");
        }
        builder.AppendLine("Current work:");
        foreach (var line in inProgress.DefaultIfEmpty("No in-progress owned work captured."))
        {
            builder.AppendLine($"- {line}");
        }
        builder.AppendLine("Blockers and risks:");
        foreach (var line in blocked.DefaultIfEmpty("No blockers reported."))
        {
            builder.AppendLine($"- {line}");
        }
        builder.AppendLine("Upcoming work:");
        foreach (var line in upcoming.DefaultIfEmpty("No upcoming work identified."))
        {
            builder.AppendLine($"- {line}");
        }
        builder.AppendLine("Collaborative contributions:");
        foreach (var line in collaborative.DefaultIfEmpty("No collaborative contributions recorded."))
        {
            builder.AppendLine($"- {line}");
        }

        return builder.ToString().Trim();
    }

    private async Task<PersonalMsrDto> GetPersonalMsrAsync(Guid personalMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.PersonalMsrs.Include(x => x.Versions).SingleAsync(x => x.Id == personalMsrId, cancellationToken);
        return MapPersonalMsr(msr);
    }

    private async Task<TeamMsrDto> GetTeamMsrAsync(Guid teamMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.TeamMsrs.Include(x => x.Versions).SingleAsync(x => x.Id == teamMsrId, cancellationToken);
        return MapTeamMsr(msr);
    }

    private static PersonalMsrDto MapPersonalMsr(PersonalMsr msr) =>
        new(msr.Id, msr.UserId, msr.TeamId, msr.ReportingCycleId, msr.Status, msr.GeneratedSummary, msr.EditedSummary, msr.SubmittedSummary, msr.SubmittedAtUtc, msr.Feedback, msr.Versions.OrderByDescending(x => x.CreatedAtUtc).Select(x => new ReportVersionDto(x.Id, x.VersionLabel, x.ChangedById, x.CreatedAtUtc)).ToList());

    private static TeamMsrDto MapTeamMsr(TeamMsr msr) =>
        new(msr.Id, msr.TeamId, msr.ReportingCycleId, msr.Status, msr.ExecutiveSummary, msr.DetailedSummary, msr.ManagerNotes, msr.FinalizedAtUtc, msr.Versions.OrderByDescending(x => x.CreatedAtUtc).Select(x => new ReportVersionDto(x.Id, x.VersionLabel, x.ChangedById, x.CreatedAtUtc)).ToList());
}
