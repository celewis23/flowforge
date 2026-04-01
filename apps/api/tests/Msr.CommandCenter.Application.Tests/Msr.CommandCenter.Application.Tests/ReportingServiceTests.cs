using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;
using Msr.CommandCenter.Infrastructure.Services;

namespace Msr.CommandCenter.Application.Tests;

public class ReportingServiceTests
{
    [Fact]
    public async Task GeneratePersonalMsrAsync_BuildsDeterministicSectionsFromCardsAndEntries()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var teamId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var cycle = new ReportingCycle
        {
            OrganizationId = organizationId,
            TeamId = teamId,
            Name = "April 2026",
            StartDateUtc = DateTime.UtcNow.AddDays(-30),
            EndDateUtc = DateTime.UtcNow,
            DueDateUtc = DateTime.UtcNow.AddDays(2),
            SubmissionDeadlineUtc = DateTime.UtcNow.AddDays(3)
        };

        dbContext.ReportingCycles.Add(cycle);
        dbContext.Cards.AddRange(
            new WorkCard
            {
                OrganizationId = organizationId,
                OwnerId = userId,
                BoardId = Guid.NewGuid(),
                ColumnId = Guid.NewGuid(),
                ReportingCycleId = cycle.Id,
                Title = "Ship KPI cleanup",
                AssignmentState = AssignmentState.Done,
                IncludeInMsr = true
            },
            new WorkCard
            {
                OrganizationId = organizationId,
                OwnerId = userId,
                BoardId = Guid.NewGuid(),
                ColumnId = Guid.NewGuid(),
                ReportingCycleId = cycle.Id,
                Title = "Finish vendor escalation",
                AssignmentState = AssignmentState.Blocked,
                IncludeInMsr = true,
                DueDateUtc = DateTime.UtcNow.AddDays(1)
            });
        dbContext.ActivityEntries.Add(new ActivityEntry
        {
            OrganizationId = organizationId,
            TeamId = teamId,
            UserId = userId,
            ReportingCycleId = cycle.Id,
            EntryType = ActivityEntryType.Accomplishment,
            Title = "Cycle win",
            Content = "Closed month-end reporting gaps."
        });
        await dbContext.SaveChangesAsync();

        var service = new ReportingService(dbContext);
        var result = await service.GeneratePersonalMsrAsync(new GeneratePersonalMsrRequest(organizationId, teamId, userId, cycle.Id), CancellationToken.None);

        Assert.Contains("Accomplishments:", result.GeneratedSummary);
        Assert.Contains("Ship KPI cleanup", result.GeneratedSummary);
        Assert.Contains("Closed month-end reporting gaps.", result.GeneratedSummary);
        Assert.Contains("Blockers and risks:", result.GeneratedSummary);
        Assert.Contains("Finish vendor escalation", result.GeneratedSummary);
    }

    private static MsrCommandCenterDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MsrCommandCenterDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new MsrCommandCenterDbContext(options);
    }
}
