using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Application.Dtos;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string OrganizationName,
    string OrganizationSlug);

public record LoginRequest(string Email, string Password);

public record CreateTeamRequest(string Name, string Department, Guid ManagerId);

public record InviteUserRequest(Guid OrganizationId, Guid TeamId, string Email, string FullName, string Role, string Title);

public record CreateProjectRequest(Guid OrganizationId, string Name, string Workstream, string Description, Guid OwnerId);

public record CreateCardRequest(
    Guid OrganizationId,
    Guid BoardId,
    Guid ColumnId,
    Guid OwnerId,
    Guid? ProjectId,
    string Title,
    string Description,
    string Instructions,
    string TagsCsv,
    CardPriority Priority,
    CardVisibility Visibility,
    DateTime? DueDateUtc,
    bool IncludeInMsr,
    bool AcknowledgmentRequired);

public record UpdateCardRequest(
    Guid CardId,
    Guid ColumnId,
    string Title,
    string Description,
    string Instructions,
    string TagsCsv,
    CardPriority Priority,
    AssignmentState AssignmentState,
    CardVisibility Visibility,
    DateTime? DueDateUtc);

public record AddCommentRequest(Guid CardId, Guid AuthorId, string Body);

public record AddCollaboratorRequest(Guid CardId, Guid UserId, string Role);

public record CreateSubtaskRequest(Guid CardId, Guid? AssigneeId, string Title);

public record CreateActivityEntryRequest(Guid OrganizationId, Guid TeamId, Guid UserId, Guid ReportingCycleId, ActivityEntryType EntryType, string Title, string Content, bool IncludeInMsr);

public record GeneratePersonalMsrRequest(Guid OrganizationId, Guid TeamId, Guid UserId, Guid ReportingCycleId);

public record SubmitPersonalMsrRequest(Guid PersonalMsrId, string EditedSummary);

public record CompileTeamMsrRequest(Guid OrganizationId, Guid TeamId, Guid ReportingCycleId, Guid ManagerId);

public record FinalizeTeamMsrRequest(Guid TeamMsrId, Guid FinalizedById, string ManagerNotes);

public record UpdateOrganizationAuthenticationSettingsRequest(
    OrganizationAuthenticationMode AuthenticationMode,
    bool AllowLocalPasswordSignIn,
    bool RequireMfaByDefault,
    bool AllowJustInTimeProvisioning,
    bool EnforceDomainVerification,
    IReadOnlyCollection<string> AllowedDomains,
    Guid? DefaultIdentityProviderId);

public record UpsertOrganizationIdentityProviderRequest(
    Guid? IdentityProviderId,
    string Name,
    IdentityProviderType ProviderType,
    string ClientId,
    string ClientSecretReference,
    string Authority,
    string MetadataUrl,
    string TenantIdentifier,
    IReadOnlyCollection<string> Scopes,
    IReadOnlyCollection<string> DomainHints,
    string RoleMappingsJson,
    ProvisioningMode ProvisioningMode,
    bool IsEnabled,
    bool IsPrimary);

public record ValidateOrganizationIdentityProviderRequest(Guid IdentityProviderId);

public record UpsertOrganizationIntegrationConnectionRequest(
    Guid? IntegrationConnectionId,
    string Name,
    IntegrationProviderType ProviderType,
    string ClientId,
    string ClientSecretReference,
    string TenantIdentifier,
    IReadOnlyCollection<string> Scopes,
    string ConfigurationJson,
    IntegrationConnectionStatus Status);

public record UpsertOrganizationVerifiedDomainRequest(
    Guid? VerifiedDomainId,
    string Domain,
    string VerificationMethod);

public record VerifyOrganizationDomainRequest(
    Guid VerifiedDomainId,
    bool Verified,
    string FailureReason);

public record UpdateOrganizationProvisioningSettingsRequest(
    ProvisioningSyncMode SyncMode,
    Guid? IdentityProviderId,
    bool AutoProvisionNewUsers,
    bool AutoDeactivateMissingUsers,
    string GroupMappingStrategy,
    string ScimBaseUrl,
    string ScimSecretReference);

public record UpsertOrganizationDirectoryGroupMappingRequest(
    Guid? DirectoryGroupMappingId,
    Guid IdentityProviderId,
    Guid TeamId,
    string ExternalGroupId,
    string ExternalGroupName,
    PlatformRole DefaultRole,
    bool IsActive,
    bool SyncMembers);

public record UpsertOrganizationNotificationRouteRequest(
    Guid? NotificationRouteId,
    Guid IntegrationConnectionId,
    NotificationType NotificationType,
    ExternalNotificationTargetType TargetType,
    string DestinationReference,
    string DestinationLabel,
    bool IsActive,
    bool SendDailyDigest);

public record TriggerOrganizationProvisioningJobRequest(
    string TriggeredBy,
    string Summary);

public record EnterpriseLoginDiscoveryRequest(string Email);

public record EnterpriseLoginInitiateRequest(string Email, Guid IdentityProviderId, string? ReturnUrl);

public record EnterpriseLoginExchangeRequest(string ExchangeToken);
