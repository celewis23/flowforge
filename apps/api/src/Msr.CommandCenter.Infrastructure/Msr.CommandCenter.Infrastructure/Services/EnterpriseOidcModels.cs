using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Infrastructure.Services;

internal sealed record EnterpriseProviderDiscovery(
    Guid OrganizationId,
    string OrganizationName,
    string OrganizationSlug,
    OrganizationAuthenticationMode AuthenticationMode,
    bool AllowLocalPasswordSignIn,
    IReadOnlyCollection<EnterpriseProviderOption> Providers);

internal sealed record EnterpriseProviderOption(
    Guid IdentityProviderId,
    string Name,
    IdentityProviderType ProviderType,
    string ClientId,
    string ClientSecretReference,
    string Authority,
    string MetadataUrl,
    string TenantIdentifier,
    IReadOnlyCollection<string> Scopes,
    IReadOnlyCollection<string> DomainHints,
    bool IsPrimary,
    bool IsEnabled);

internal sealed record OidcAuthorizationRequest(string Url, string StateToken);

internal sealed record EnterprisePrincipal(
    Guid OrganizationId,
    Guid IdentityProviderId,
    IdentityProviderType ProviderType,
    string Subject,
    string Email,
    string DisplayName,
    string? GivenName,
    string? Surname);
