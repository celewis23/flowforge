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

    [HttpPut("{organizationId:guid}/enterprise-settings/provisioning")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationProvisioningSettingsDto> UpdateProvisioning(Guid organizationId, UpdateOrganizationProvisioningSettingsRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpdateProvisioningSettingsAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/provisioning/jobs")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationProvisioningJobDto> TriggerProvisioning(Guid organizationId, TriggerOrganizationProvisioningJobRequest request, CancellationToken cancellationToken) =>
        _organizationService.TriggerProvisioningJobAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/directory-group-mappings")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationDirectoryGroupMappingDto> UpsertDirectoryGroupMapping(Guid organizationId, UpsertOrganizationDirectoryGroupMappingRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertDirectoryGroupMappingAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/notification-routes")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationNotificationRouteDto> UpsertNotificationRoute(Guid organizationId, UpsertOrganizationNotificationRouteRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertNotificationRouteAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/export-destinations")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationExportDestinationDto> UpsertExportDestination(Guid organizationId, UpsertOrganizationExportDestinationRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertExportDestinationAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/calendar-sync")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationCalendarSyncSettingDto> UpsertCalendarSyncSetting(Guid organizationId, UpsertOrganizationCalendarSyncSettingRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertCalendarSyncSettingAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/profile-sync")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationProfileSyncSettingDto> UpsertProfileSyncSetting(Guid organizationId, UpsertOrganizationProfileSyncSettingRequest request, CancellationToken cancellationToken) =>
        _organizationService.UpsertProfileSyncSettingAsync(organizationId, request, cancellationToken);

    [HttpPost("{organizationId:guid}/enterprise-settings/profile-sync/jobs")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<OrganizationProfileSyncJobDto> TriggerProfileSync(Guid organizationId, TriggerOrganizationProfileSyncRequest request, CancellationToken cancellationToken) =>
        _organizationService.TriggerProfileSyncAsync(organizationId, request, cancellationToken);
}
