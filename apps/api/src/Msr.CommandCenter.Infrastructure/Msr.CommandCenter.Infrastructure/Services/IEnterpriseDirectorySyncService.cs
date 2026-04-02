using Msr.CommandCenter.Domain.Entities;

namespace Msr.CommandCenter.Infrastructure.Services;

public interface IEnterpriseDirectorySyncService
{
    bool SupportsProvider(string providerType);
    Task<EnterpriseDirectoryProfileResult> FetchProfilesAsync(OrganizationIntegrationConnection integrationConnection, CancellationToken cancellationToken);
}
