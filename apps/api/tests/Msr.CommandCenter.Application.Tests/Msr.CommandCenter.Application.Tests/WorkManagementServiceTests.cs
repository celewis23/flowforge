using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;
using Msr.CommandCenter.Infrastructure.Services;

namespace Msr.CommandCenter.Application.Tests;

public class WorkManagementServiceTests
{
    [Fact]
    public async Task CreateCardAsync_PersistsAssignmentAndReturnsCard()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var board = new Board { OrganizationId = organizationId, OwnerId = ownerId, Name = "Test Board", IsDefault = true };
        var column = new BoardColumn { OrganizationId = organizationId, BoardId = board.Id, Name = "To Do", Position = 1, Color = "#2563eb" };
        dbContext.Boards.Add(board);
        dbContext.BoardColumns.Add(column);
        dbContext.Users.Add(new ApplicationUser { Id = ownerId, FullName = "Owner", Email = "owner@test.com", UserName = "owner@test.com", OrganizationId = organizationId });
        await dbContext.SaveChangesAsync();

        var service = new WorkManagementService(dbContext);
        var card = await service.CreateCardAsync(
            new CreateCardRequest(organizationId, board.Id, column.Id, ownerId, null, "Prepare MSR", "Draft accomplishments", "Use the default template", "msr,report", CardPriority.High, CardVisibility.Team, DateTime.UtcNow.AddDays(2), true, true),
            ownerId,
            CancellationToken.None);

        Assert.Equal("Prepare MSR", card.Title);
        Assert.True(await dbContext.CardAssignments.AnyAsync());
        Assert.Equal(AssignmentState.Assigned, card.AssignmentState);
    }

    private static MsrCommandCenterDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MsrCommandCenterDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new MsrCommandCenterDbContext(options);
    }
}
