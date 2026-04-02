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

    [HttpGet("{organizationId:guid}/enterprise-settings")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationEnterpriseSettingsDto> GetEnterpriseSettings(Guid organizationId, CancellationToken cancellationToken) =>
        _organizationService.GetEnterpriseSettingsAsync(organizationId, cancellationToken);

    [HttpPut("{organizationId:guid}/enterprise-settings/authentication")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationAuthenticationSettingsDto> UpdateAuthenticationSettings(Guid organizationId, UpdateOrganizationAuthenticationSettingsRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpdateAuthenticationSettingsAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/identity-providers")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationIdentityProviderDto> UpsertIdentityProvider(Guid organizationId, UpsertOrganizationIdentityProviderRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertIdentityProviderAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/identity-providers/validate")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationIdentityProviderDto> ValidateIdentityProvider(Guid organizationId, ValidateOrganizationIdentityProviderRequest request, CancellationToken cancellationToken) =>
        _organizationService.ValidateIdentityProviderAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/integrations")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationIntegrationConnectionDto> UpsertIntegration(Guid organizationId, UpsertOrganizationIntegrationConnectionRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertIntegrationConnectionAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/domains")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationVerifiedDomainDto> UpsertVerifiedDomain(Guid organizationId, UpsertOrganizationVerifiedDomainRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertVerifiedDomainAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/domains/verify")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationVerifiedDomainDto> VerifyDomain(Guid organizationId, VerifyOrganizationDomainRequest request, CancellationToken cancellationToken) =>
        _organizationService.VerifyDomainAsync(organizationId, request, cancellationToken);
}
