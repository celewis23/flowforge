using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class AdminReadService : IAdminReadService
{
    private readonly MsrCommandCenterDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminReadService(MsrCommandCenterDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    public async Task<AdminSummaryDto> GetSummaryAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        var organization = await _dbContext.Organizations
            .Where(x => x.Id == organizationId)
            .Select(x => new OrganizationSummaryDto(x.Id, x.Name, x.Slug, x.Domain, x.DefaultCadence))
            .SingleAsync(cancellationToken);

        var teams = await _dbContext.Teams
            .Where(x => x.OrganizationId == organizationId)
            .GroupJoin(_dbContext.TeamMemberships, team => team.Id, membership => membership.TeamId, (team, memberships) =>
                new TeamSummaryDto(team.Id, team.Name, team.Department, team.ManagerId, memberships.Count(x => x.IsActive)))
            .ToListAsync(cancellationToken);

        var users = await _dbContext.Users
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.FullName)
            .ToListAsync(cancellationToken);

        var userDtos = new List<AdminUserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new AdminUserDto(user.Id, user.FullName, user.Email ?? string.Empty, roles.FirstOrDefault() ?? "TeamMember", user.JobTitle, user.DefaultTeamId, user.IsActive));
        }

        var invitations = await _dbContext.OrganizationInvitations
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new InvitationDto(x.Id, x.Email, x.Role, x.TeamId, x.ExpiresAtUtc, x.AcceptedAtUtc))
            .ToListAsync(cancellationToken);

        var templates = await _dbContext.ReportTemplates
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.Name)
            .Select(x => new TemplateDto(x.Id, x.Name, x.TemplateType, x.RequiredSectionsJson, x.PromptQuestionsJson, x.DefaultBoardColumnsJson, x.BrandingJson))
            .ToListAsync(cancellationToken);

        var auditLogs = await _dbContext.AuditLogs
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(100)
            .Select(x => new AuditLogDto(x.Id, x.Action, x.EntityName, x.EntityId, x.Details, x.CreatedAtUtc, x.CorrelationId))
            .ToListAsync(cancellationToken);

        return new AdminSummaryDto(organization, teams, userDtos, invitations, templates, auditLogs);
    }
}
