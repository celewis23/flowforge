using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IOrganizationService
{
    Task<IReadOnlyCollection<OrganizationSummaryDto>> GetOrganizationsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyCollection<TeamSummaryDto>> GetTeamsAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<TeamSummaryDto> CreateTeamAsync(Guid organizationId, CreateTeamRequest request, CancellationToken cancellationToken);
    Task InviteUserAsync(InviteUserRequest request, CancellationToken cancellationToken);
    Task<OrganizationEnterpriseSettingsDto> GetEnterpriseSettingsAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<OrganizationAuthenticationSettingsDto> UpdateAuthenticationSettingsAsync(Guid organizationId, UpdateOrganizationAuthenticationSettingsRequest request, CancellationToken cancellationToken);
    Task<OrganizationIdentityProviderDto> UpsertIdentityProviderAsync(Guid organizationId, UpsertOrganizationIdentityProviderRequest request, CancellationToken cancellationToken);
    Task<OrganizationIdentityProviderDto> ValidateIdentityProviderAsync(Guid organizationId, ValidateOrganizationIdentityProviderRequest request, CancellationToken cancellationToken);
    Task<OrganizationIntegrationConnectionDto> UpsertIntegrationConnectionAsync(Guid organizationId, UpsertOrganizationIntegrationConnectionRequest request, CancellationToken cancellationToken);
    Task<OrganizationVerifiedDomainDto> UpsertVerifiedDomainAsync(Guid organizationId, UpsertOrganizationVerifiedDomainRequest request, CancellationToken cancellationToken);
    Task<OrganizationVerifiedDomainDto> VerifyDomainAsync(Guid organizationId, VerifyOrganizationDomainRequest request, CancellationToken cancellationToken);
    Task<OrganizationProvisioningSettingsDto> UpdateProvisioningSettingsAsync(Guid organizationId, UpdateOrganizationProvisioningSettingsRequest request, CancellationToken cancellationToken);
    Task<OrganizationProvisioningJobDto> TriggerProvisioningJobAsync(Guid organizationId, TriggerOrganizationProvisioningJobRequest request, CancellationToken cancellationToken);
    Task<OrganizationDirectoryGroupMappingDto> UpsertDirectoryGroupMappingAsync(Guid organizationId, UpsertOrganizationDirectoryGroupMappingRequest request, CancellationToken cancellationToken);
    Task<OrganizationNotificationRouteDto> UpsertNotificationRouteAsync(Guid organizationId, UpsertOrganizationNotificationRouteRequest request, CancellationToken cancellationToken);
    Task<OrganizationExportDestinationDto> UpsertExportDestinationAsync(Guid organizationId, UpsertOrganizationExportDestinationRequest request, CancellationToken cancellationToken);
    Task<OrganizationCalendarSyncSettingDto> UpsertCalendarSyncSettingAsync(Guid organizationId, UpsertOrganizationCalendarSyncSettingRequest request, CancellationToken cancellationToken);
    Task<OrganizationProfileSyncSettingDto> UpsertProfileSyncSettingAsync(Guid organizationId, UpsertOrganizationProfileSyncSettingRequest request, CancellationToken cancellationToken);
    Task<OrganizationProfileSyncJobDto> TriggerProfileSyncAsync(Guid organizationId, TriggerOrganizationProfileSyncRequest request, CancellationToken cancellationToken);
}
