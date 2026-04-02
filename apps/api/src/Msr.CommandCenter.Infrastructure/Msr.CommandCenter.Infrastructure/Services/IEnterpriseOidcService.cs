using Msr.CommandCenter.Domain.Entities;

namespace Msr.CommandCenter.Infrastructure.Services;

public interface IEnterpriseOidcService
{
    bool SupportsProvider(string providerType);
    Task<OidcAuthorizationRequest> BuildAuthorizationUrlAsync(EnterpriseProviderOption provider, EnterpriseAuthSession session, CancellationToken cancellationToken);
    Task<EnterprisePrincipal> ExchangeCodeAsync(EnterpriseProviderOption provider, EnterpriseAuthSession session, string code, CancellationToken cancellationToken);
}
