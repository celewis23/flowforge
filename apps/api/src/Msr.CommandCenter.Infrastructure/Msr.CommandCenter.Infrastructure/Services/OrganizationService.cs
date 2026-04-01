using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class OrganizationService : IOrganizationService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public OrganizationService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<OrganizationSummaryDto>> GetOrganizationsAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Organizations
            .OrderBy(x => x.Name)
            .Select(x => new OrganizationSummaryDto(x.Id, x.Name, x.Slug, x.Domain, x.DefaultCadence))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<TeamSummaryDto>> GetTeamsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        return await _dbContext.Teams
            .Where(x => x.OrganizationId == organizationId)
            .GroupJoin(
                _dbContext.TeamMemberships,
                team => team.Id,
                membership => membership.TeamId,
                (team, memberships) => new TeamSummaryDto(team.Id, team.Name, team.Department, team.ManagerId, memberships.Count(x => x.IsActive)))
            .ToListAsync(cancellationToken);
    }

    public async Task<TeamSummaryDto> CreateTeamAsync(Guid organizationId, CreateTeamRequest request, CancellationToken cancellationToken)
    {
        var team = new Team
        {
            OrganizationId = organizationId,
            Name = request.Name,
            Department = request.Department,
            ManagerId = request.ManagerId
        };

        _dbContext.Teams.Add(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new TeamSummaryDto(team.Id, team.Name, team.Department, team.ManagerId, 0);
    }

    public async Task InviteUserAsync(InviteUserRequest request, CancellationToken cancellationToken)
    {
        _dbContext.OrganizationInvitations.Add(new OrganizationInvitation
        {
            OrganizationId = request.OrganizationId,
            TeamId = request.TeamId,
            Email = request.Email,
            Role = request.Role,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });

        _dbContext.AuditLogs.Add(new AuditLog
        {
            OrganizationId = request.OrganizationId,
            Action = "UserInvited",
            EntityName = "Invitation",
            EntityId = request.Email,
            Details = $"{request.FullName} invited as {request.Role}.",
            CorrelationId = Guid.NewGuid().ToString("N")
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
