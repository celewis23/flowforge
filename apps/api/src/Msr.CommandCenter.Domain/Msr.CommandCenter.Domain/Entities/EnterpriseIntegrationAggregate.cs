using Msr.CommandCenter.Domain.Common;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Domain.Entities;

public class OrganizationAuthenticationSettings : TenantEntity
{
    public OrganizationAuthenticationMode AuthenticationMode { get; set; } = OrganizationAuthenticationMode.LocalOnly;
    public bool AllowLocalPasswordSignIn { get; set; } = true;
    public bool RequireMfaByDefault { get; set; }
    public bool AllowJustInTimeProvisioning { get; set; }
    public bool EnforceDomainVerification { get; set; }
    public string AllowedDomainsCsv { get; set; } = string.Empty;
    public Guid? DefaultIdentityProviderId { get; set; }
    public Organization? Organization { get; set; }
}

public class OrganizationIdentityProvider : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public IdentityProviderType ProviderType { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecretReference { get; set; } = string.Empty;
    public string Authority { get; set; } = string.Empty;
    public string MetadataUrl { get; set; } = string.Empty;
    public string TenantIdentifier { get; set; } = string.Empty;
    public string ScopesCsv { get; set; } = string.Empty;
    public string DomainHintsCsv { get; set; } = string.Empty;
    public string RoleMappingsJson { get; set; } = "{}";
    public ProvisioningMode ProvisioningMode { get; set; } = ProvisioningMode.None;
    public bool IsEnabled { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime? LastValidatedAtUtc { get; set; }
    public string LastValidationError { get; set; } = string.Empty;
    public DateTime? LastSyncAtUtc { get; set; }
    public Organization? Organization { get; set; }
}

public class OrganizationIntegrationConnection : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public IntegrationProviderType ProviderType { get; set; }
    public IntegrationConnectionStatus Status { get; set; } = IntegrationConnectionStatus.Draft;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecretReference { get; set; } = string.Empty;
    public string TenantIdentifier { get; set; } = string.Empty;
    public string ScopesCsv { get; set; } = string.Empty;
    public string ConfigurationJson { get; set; } = "{}";
    public DateTime? LastValidatedAtUtc { get; set; }
    public DateTime? LastSyncAtUtc { get; set; }
    public string LastError { get; set; } = string.Empty;
    public Organization? Organization { get; set; }
}

public class OrganizationVerifiedDomain : TenantEntity
{
    public string Domain { get; set; } = string.Empty;
    public string VerificationMethod { get; set; } = "DnsTxt";
    public DomainVerificationStatus Status { get; set; } = DomainVerificationStatus.Pending;
    public string ChallengeToken { get; set; } = string.Empty;
    public DateTime? VerifiedAtUtc { get; set; }
    public DateTime? LastCheckedAtUtc { get; set; }
    public string FailureReason { get; set; } = string.Empty;
    public Organization? Organization { get; set; }
}

public class ExternalIdentityLink : TenantEntity
{
    public Guid UserId { get; set; }
    public Guid? IdentityProviderId { get; set; }
    public IdentityProviderType ProviderType { get; set; }
    public string ExternalSubject { get; set; } = string.Empty;
    public string ExternalEmail { get; set; } = string.Empty;
    public string ExternalDisplayName { get; set; } = string.Empty;
    public DateTime LinkedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastSignInAtUtc { get; set; }
    public Organization? Organization { get; set; }
    public OrganizationIdentityProvider? IdentityProvider { get; set; }
}

public class EnterpriseAuthSession : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid IdentityProviderId { get; set; }
    public Guid? UserId { get; set; }
    public string ProviderType { get; set; } = string.Empty;
    public string StateToken { get; set; } = string.Empty;
    public string CodeVerifier { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
    public string ReturnUrl { get; set; } = string.Empty;
    public string EmailHint { get; set; } = string.Empty;
    public string ExternalSubject { get; set; } = string.Empty;
    public string ExternalEmail { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public string ExchangeToken { get; set; } = string.Empty;
}
