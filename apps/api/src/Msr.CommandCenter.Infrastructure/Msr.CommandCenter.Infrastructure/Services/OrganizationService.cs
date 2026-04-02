using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class OrganizationService : IOrganizationService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public OrganizationService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<OrganizationSummaryDto>> GetOrganizationsAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Organizations
            .OrderBy(x => x.Name)
            .Select(x => new OrganizationSummaryDto(x.Id, x.Name, x.Slug, x.Domain, x.DefaultCadence))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<TeamSummaryDto>> GetTeamsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        return await _dbContext.Teams
            .Where(x => x.OrganizationId == organizationId)
            .GroupJoin(
                _dbContext.TeamMemberships,
                team => team.Id,
                membership => membership.TeamId,
                (team, memberships) => new TeamSummaryDto(team.Id, team.Name, team.Department, team.ManagerId, memberships.Count(x => x.IsActive)))
            .ToListAsync(cancellationToken);
    }

    public async Task<TeamSummaryDto> CreateTeamAsync(Guid organizationId, CreateTeamRequest request, CancellationToken cancellationToken)
    {
        var team = new Team
        {
            OrganizationId = organizationId,
            Name = request.Name,
            Department = request.Department,
            ManagerId = request.ManagerId
        };

        _dbContext.Teams.Add(team);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new TeamSummaryDto(team.Id, team.Name, team.Department, team.ManagerId, 0);
    }

    public async Task InviteUserAsync(InviteUserRequest request, CancellationToken cancellationToken)
    {
        _dbContext.OrganizationInvitations.Add(new OrganizationInvitation
        {
            OrganizationId = request.OrganizationId,
            TeamId = request.TeamId,
            Email = request.Email,
            Role = request.Role,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });

        _dbContext.AuditLogs.Add(new AuditLog
        {
            OrganizationId = request.OrganizationId,
            Action = "UserInvited",
            EntityName = "Invitation",
            EntityId = request.Email,
            Details = $"{request.FullName} invited as {request.Role}.",
            CorrelationId = Guid.NewGuid().ToString("N")
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<OrganizationEnterpriseSettingsDto> GetEnterpriseSettingsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        var auth = await EnsureAuthenticationSettingsAsync(organizationId, cancellationToken);
        var identityProviders = await _dbContext.OrganizationIdentityProviders
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        var integrations = await _dbContext.OrganizationIntegrationConnections
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.ProviderType)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        var verifiedDomains = await _dbContext.OrganizationVerifiedDomains
            .Where(x => x.OrganizationId == organizationId)
            .OrderBy(x => x.Domain)
            .ToListAsync(cancellationToken);

        return new OrganizationEnterpriseSettingsDto(
            MapAuthenticationSettings(auth),
            identityProviders.Select(MapIdentityProvider).ToList(),
            integrations.Select(MapIntegrationConnection).ToList(),
            verifiedDomains.Select(MapVerifiedDomain).ToList());
    }

    public async Task<OrganizationAuthenticationSettingsDto> UpdateAuthenticationSettingsAsync(Guid organizationId, UpdateOrganizationAuthenticationSettingsRequest request, CancellationToken cancellationToken)
    {
        var settings = await EnsureAuthenticationSettingsAsync(organizationId, cancellationToken);
        settings.AuthenticationMode = request.AuthenticationMode;
        settings.AllowLocalPasswordSignIn = request.AllowLocalPasswordSignIn;
        settings.RequireMfaByDefault = request.RequireMfaByDefault;
        settings.AllowJustInTimeProvisioning = request.AllowJustInTimeProvisioning;
        settings.EnforceDomainVerification = request.EnforceDomainVerification;
        settings.AllowedDomainsCsv = string.Join(",", request.AllowedDomains.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase));
        settings.DefaultIdentityProviderId = request.DefaultIdentityProviderId;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(organizationId, "AuthenticationSettingsUpdated", "OrganizationAuthenticationSettings", settings.Id.ToString(), "Enterprise authentication settings updated.", cancellationToken);

        return MapAuthenticationSettings(settings);
    }

    public async Task<OrganizationIdentityProviderDto> UpsertIdentityProviderAsync(Guid organizationId, UpsertOrganizationIdentityProviderRequest request, CancellationToken cancellationToken)
    {
        OrganizationIdentityProvider provider;
        if (request.IdentityProviderId.HasValue)
        {
            provider = await _dbContext.OrganizationIdentityProviders
                .Where(x => x.OrganizationId == organizationId && x.Id == request.IdentityProviderId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            provider = new OrganizationIdentityProvider
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationIdentityProviders.Add(provider);
        }

        provider.Name = request.Name;
        provider.ProviderType = request.ProviderType;
        provider.ClientId = request.ClientId;
        provider.ClientSecretReference = request.ClientSecretReference;
        provider.Authority = request.Authority;
        provider.MetadataUrl = request.MetadataUrl;
        provider.TenantIdentifier = request.TenantIdentifier;
        provider.ScopesCsv = JoinCsv(request.Scopes);
        provider.DomainHintsCsv = JoinCsv(request.DomainHints);
        provider.RoleMappingsJson = string.IsNullOrWhiteSpace(request.RoleMappingsJson) ? "{}" : request.RoleMappingsJson;
        provider.ProvisioningMode = request.ProvisioningMode;
        provider.IsEnabled = request.IsEnabled;
        provider.IsPrimary = request.IsPrimary;
        provider.LastValidatedAtUtc = request.IsEnabled ? DateTime.UtcNow : provider.LastValidatedAtUtc;

        if (request.IsPrimary)
        {
            var others = await _dbContext.OrganizationIdentityProviders
                .Where(x => x.OrganizationId == organizationId && x.Id != provider.Id)
                .ToListAsync(cancellationToken);

            foreach (var other in others)
            {
                other.IsPrimary = false;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var authSettings = await EnsureAuthenticationSettingsAsync(organizationId, cancellationToken);
        if (provider.IsPrimary)
        {
            authSettings.DefaultIdentityProviderId = provider.Id;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        await WriteEnterpriseAuditAsync(organizationId, "IdentityProviderUpserted", "OrganizationIdentityProvider", provider.Id.ToString(), $"{provider.ProviderType} provider '{provider.Name}' saved.", cancellationToken);

        return MapIdentityProvider(provider);
    }

    public async Task<OrganizationIdentityProviderDto> ValidateIdentityProviderAsync(Guid organizationId, ValidateOrganizationIdentityProviderRequest request, CancellationToken cancellationToken)
    {
        var provider = await _dbContext.OrganizationIdentityProviders
            .Where(x => x.OrganizationId == organizationId && x.Id == request.IdentityProviderId)
            .SingleAsync(cancellationToken);

        var verifiedDomains = await _dbContext.OrganizationVerifiedDomains
            .Where(x => x.OrganizationId == organizationId && x.Status == DomainVerificationStatus.Verified)
            .Select(x => x.Domain)
            .ToListAsync(cancellationToken);

        provider.LastValidatedAtUtc = DateTime.UtcNow;
        provider.LastValidationError = ValidateProviderConfiguration(provider, verifiedDomains);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            string.IsNullOrWhiteSpace(provider.LastValidationError) ? "IdentityProviderValidated" : "IdentityProviderValidationFailed",
            "OrganizationIdentityProvider",
            provider.Id.ToString(),
            string.IsNullOrWhiteSpace(provider.LastValidationError)
                ? $"{provider.ProviderType} provider '{provider.Name}' validation passed."
                : $"{provider.ProviderType} provider '{provider.Name}' validation failed: {provider.LastValidationError}",
            cancellationToken);

        return MapIdentityProvider(provider);
    }

    public async Task<OrganizationIntegrationConnectionDto> UpsertIntegrationConnectionAsync(Guid organizationId, UpsertOrganizationIntegrationConnectionRequest request, CancellationToken cancellationToken)
    {
        OrganizationIntegrationConnection connection;
        if (request.IntegrationConnectionId.HasValue)
        {
            connection = await _dbContext.OrganizationIntegrationConnections
                .Where(x => x.OrganizationId == organizationId && x.Id == request.IntegrationConnectionId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            connection = new OrganizationIntegrationConnection
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationIntegrationConnections.Add(connection);
        }

        connection.Name = request.Name;
        connection.ProviderType = request.ProviderType;
        connection.ClientId = request.ClientId;
        connection.ClientSecretReference = request.ClientSecretReference;
        connection.TenantIdentifier = request.TenantIdentifier;
        connection.ScopesCsv = JoinCsv(request.Scopes);
        connection.ConfigurationJson = string.IsNullOrWhiteSpace(request.ConfigurationJson) ? "{}" : request.ConfigurationJson;
        connection.Status = request.Status;
        connection.LastValidatedAtUtc = request.Status == IntegrationConnectionStatus.Active ? DateTime.UtcNow : connection.LastValidatedAtUtc;
        connection.LastError = request.Status == IntegrationConnectionStatus.Error ? "Connection requires validation." : string.Empty;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(organizationId, "IntegrationConnectionUpserted", "OrganizationIntegrationConnection", connection.Id.ToString(), $"{connection.ProviderType} integration '{connection.Name}' saved.", cancellationToken);

        return MapIntegrationConnection(connection);
    }

    public async Task<OrganizationVerifiedDomainDto> UpsertVerifiedDomainAsync(Guid organizationId, UpsertOrganizationVerifiedDomainRequest request, CancellationToken cancellationToken)
    {
        var normalizedDomain = request.Domain.Trim().ToLowerInvariant();
        OrganizationVerifiedDomain domain;
        if (request.VerifiedDomainId.HasValue)
        {
            domain = await _dbContext.OrganizationVerifiedDomains
                .Where(x => x.OrganizationId == organizationId && x.Id == request.VerifiedDomainId.Value)
                .SingleAsync(cancellationToken);

            var changed = !string.Equals(domain.Domain, normalizedDomain, StringComparison.OrdinalIgnoreCase) ||
                          !string.Equals(domain.VerificationMethod, request.VerificationMethod, StringComparison.Ordinal);
            domain.Domain = normalizedDomain;
            domain.VerificationMethod = request.VerificationMethod;
            if (changed)
            {
                domain.Status = DomainVerificationStatus.Pending;
                domain.ChallengeToken = GenerateChallengeToken();
                domain.VerifiedAtUtc = null;
                domain.LastCheckedAtUtc = null;
                domain.FailureReason = string.Empty;
            }
        }
        else
        {
            domain = new OrganizationVerifiedDomain
            {
                OrganizationId = organizationId,
                Domain = normalizedDomain,
                VerificationMethod = request.VerificationMethod,
                Status = DomainVerificationStatus.Pending,
                ChallengeToken = GenerateChallengeToken()
            };
            _dbContext.OrganizationVerifiedDomains.Add(domain);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(organizationId, "VerifiedDomainUpserted", "OrganizationVerifiedDomain", domain.Id.ToString(), $"Verified domain '{domain.Domain}' saved.", cancellationToken);
        return MapVerifiedDomain(domain);
    }

    public async Task<OrganizationVerifiedDomainDto> VerifyDomainAsync(Guid organizationId, VerifyOrganizationDomainRequest request, CancellationToken cancellationToken)
    {
        var domain = await _dbContext.OrganizationVerifiedDomains
            .Where(x => x.OrganizationId == organizationId && x.Id == request.VerifiedDomainId)
            .SingleAsync(cancellationToken);

        domain.Status = request.Verified ? DomainVerificationStatus.Verified : DomainVerificationStatus.Failed;
        domain.VerifiedAtUtc = request.Verified ? DateTime.UtcNow : null;
        domain.LastCheckedAtUtc = DateTime.UtcNow;
        domain.FailureReason = request.Verified ? string.Empty : request.FailureReason.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            request.Verified ? "VerifiedDomainConfirmed" : "VerifiedDomainCheckFailed",
            "OrganizationVerifiedDomain",
            domain.Id.ToString(),
            request.Verified ? $"Verified domain '{domain.Domain}' confirmed." : $"Verified domain '{domain.Domain}' check failed.",
            cancellationToken);

        return MapVerifiedDomain(domain);
    }

    private async Task<OrganizationAuthenticationSettings> EnsureAuthenticationSettingsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        var settings = await _dbContext.OrganizationAuthenticationSettings
            .SingleOrDefaultAsync(x => x.OrganizationId == organizationId, cancellationToken);

        if (settings is not null)
        {
            return settings;
        }

        settings = new OrganizationAuthenticationSettings
        {
            OrganizationId = organizationId,
            AuthenticationMode = OrganizationAuthenticationMode.LocalOnly,
            AllowLocalPasswordSignIn = true
        };

        _dbContext.OrganizationAuthenticationSettings.Add(settings);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return settings;
    }

    private async Task WriteEnterpriseAuditAsync(Guid organizationId, string action, string entityName, string entityId, string details, CancellationToken cancellationToken)
    {
        _dbContext.AuditLogs.Add(new AuditLog
        {
            OrganizationId = organizationId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            CorrelationId = Guid.NewGuid().ToString("N")
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string JoinCsv(IEnumerable<string> values) =>
        string.Join(",", values.Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase));

    private static IReadOnlyCollection<string> SplitCsv(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? Array.Empty<string>()
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static OrganizationAuthenticationSettingsDto MapAuthenticationSettings(OrganizationAuthenticationSettings settings) =>
        new(
            settings.Id,
            settings.OrganizationId,
            settings.AuthenticationMode.ToString(),
            settings.AllowLocalPasswordSignIn,
            settings.RequireMfaByDefault,
            settings.AllowJustInTimeProvisioning,
            settings.EnforceDomainVerification,
            SplitCsv(settings.AllowedDomainsCsv),
            settings.DefaultIdentityProviderId);

    private static OrganizationIdentityProviderDto MapIdentityProvider(OrganizationIdentityProvider provider) =>
        new(
            provider.Id,
            provider.OrganizationId,
            provider.Name,
            provider.ProviderType.ToString(),
            provider.ClientId,
            provider.Authority,
            provider.MetadataUrl,
            provider.TenantIdentifier,
            SplitCsv(provider.ScopesCsv),
            SplitCsv(provider.DomainHintsCsv),
            provider.ProvisioningMode.ToString(),
            provider.IsEnabled,
            provider.IsPrimary,
            ResolveValidationStatus(provider),
            provider.LastValidationError,
            provider.LastValidatedAtUtc,
            provider.LastSyncAtUtc);

    private static OrganizationIntegrationConnectionDto MapIntegrationConnection(OrganizationIntegrationConnection connection) =>
        new(
            connection.Id,
            connection.OrganizationId,
            connection.Name,
            connection.ProviderType.ToString(),
            connection.Status.ToString(),
            connection.ClientId,
            connection.TenantIdentifier,
            SplitCsv(connection.ScopesCsv),
            connection.LastValidatedAtUtc,
            connection.LastSyncAtUtc,
            connection.LastError);

    private static OrganizationVerifiedDomainDto MapVerifiedDomain(OrganizationVerifiedDomain domain) =>
        new(
            domain.Id,
            domain.OrganizationId,
            domain.Domain,
            domain.VerificationMethod,
            domain.Status.ToString(),
            domain.ChallengeToken,
            domain.VerifiedAtUtc,
            domain.LastCheckedAtUtc,
            domain.FailureReason);

    private static string GenerateChallengeToken() =>
        $"flowforge-verification={Convert.ToHexString(Guid.NewGuid().ToByteArray()).ToLowerInvariant()}";

    private static string ResolveValidationStatus(OrganizationIdentityProvider provider)
    {
        if (!provider.LastValidatedAtUtc.HasValue)
        {
            return "NotValidated";
        }

        return string.IsNullOrWhiteSpace(provider.LastValidationError) ? "Valid" : "Invalid";
    }

    private static string ValidateProviderConfiguration(OrganizationIdentityProvider provider, IReadOnlyCollection<string> verifiedDomains)
    {
        if (string.IsNullOrWhiteSpace(provider.Name))
        {
            return "Provider name is required.";
        }

        if (string.IsNullOrWhiteSpace(provider.ClientId))
        {
            return "Client ID is required.";
        }

        return provider.ProviderType switch
        {
            IdentityProviderType.MicrosoftEntraId when string.IsNullOrWhiteSpace(provider.Authority) && string.IsNullOrWhiteSpace(provider.TenantIdentifier)
                => "Microsoft Entra ID providers require an authority URL or tenant identifier.",
            IdentityProviderType.GoogleWorkspace when !SplitCsv(provider.DomainHintsCsv).Any() && verifiedDomains.Count == 0
                => "Google Workspace providers require at least one verified domain or domain hint.",
            IdentityProviderType.Saml when string.IsNullOrWhiteSpace(provider.MetadataUrl)
                => "SAML providers require a metadata URL.",
            _ => string.Empty
        };
    }
}
