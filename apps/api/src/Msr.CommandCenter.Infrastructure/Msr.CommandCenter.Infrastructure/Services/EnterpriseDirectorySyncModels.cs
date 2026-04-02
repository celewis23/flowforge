using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Infrastructure.Services;

public sealed record EnterpriseDirectoryUserProfile(
    string ExternalId,
    string Email,
    string DisplayName,
    string JobTitle,
    string Department,
    string OfficeLocation,
    string ManagerExternalId,
    string ProfilePhotoUrl,
    string ExternalEmployeeId);

public sealed record EnterpriseDirectoryProfileResult(
    IntegrationProviderType ProviderType,
    IReadOnlyCollection<EnterpriseDirectoryUserProfile> Profiles);
