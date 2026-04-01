using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Api.Extensions;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/organizations")]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _organizationService;

    public OrganizationsController(IOrganizationService organizationService)
    {
        _organizationService = organizationService;
    }

    [HttpGet]
    public Task<IReadOnlyCollection<OrganizationSummaryDto>> GetOrganizations(CancellationToken cancellationToken) =>
        _organizationService.GetOrganizationsAsync(cancellationToken);

    [HttpGet("{organizationId:guid}/teams")]
    public Task<IReadOnlyCollection<TeamSummaryDto>> GetTeams(Guid organizationId, CancellationToken cancellationToken) =>
        _organizationService.GetTeamsAsync(organizationId, cancellationToken);

    [HttpPost("{organizationId:guid}/teams")]
    [Authorize(Roles = "OrgAdmin,Manager,PlatformAdmin")]
    public Task<TeamSummaryDto> CreateTeam(Guid organizationId, CreateTeamRequest request, CancellationToken cancellationToken) =>
        _organizationService.CreateTeamAsync(organizationId, request, cancellationToken);

    [HttpPost("invite")]
    [Authorize(Roles = "OrgAdmin,Manager,PlatformAdmin")]
    public async Task<IActionResult> Invite(InviteUserRequest request, CancellationToken cancellationToken)
    {
        await _organizationService.InviteUserAsync(request, cancellationToken);
        return Accepted();
    }
}
