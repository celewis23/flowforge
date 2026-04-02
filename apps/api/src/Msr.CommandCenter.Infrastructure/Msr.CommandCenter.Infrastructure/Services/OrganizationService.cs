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
    private readonly IEnterpriseOidcService? _enterpriseOidcService;

    public OrganizationService(MsrCommandCenterDbContext dbContext, IEnterpriseOidcService? enterpriseOidcService = null)
    {
        _dbContext = dbContext;
        _enterpriseOidcService = enterpriseOidcService;
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
        var provisioning = await EnsureProvisioningSettingsAsync(organizationId, cancellationToken);
        var provisioningJobs = await _dbContext.OrganizationProvisioningJobs
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.StartedAtUtc)
            .Take(10)
            .ToListAsync(cancellationToken);
        var directoryGroupMappings = await _dbContext.OrganizationDirectoryGroupMappings
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.ExternalGroupName)
            .ToListAsync(cancellationToken);
        var notificationRoutes = await _dbContext.OrganizationNotificationRoutes
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.NotificationType)
            .ThenBy(x => x.DestinationLabel)
            .ToListAsync(cancellationToken);
        var exportDestinations = await _dbContext.OrganizationExportDestinations
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.IsDefault)
            .ThenByDescending(x => x.IsActive)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        var calendarSyncSettings = await _dbContext.OrganizationCalendarSyncSettings
            .Where(x => x.OrganizationId == organizationId)
            .OrderByDescending(x => x.IsEnabled)
            .ThenBy(x => x.EventType)
            .ThenBy(x => x.CalendarLabel)
            .ToListAsync(cancellationToken);

        return new OrganizationEnterpriseSettingsDto(
            MapAuthenticationSettings(auth),
            identityProviders.Select(MapIdentityProvider).ToList(),
            integrations.Select(MapIntegrationConnection).ToList(),
            verifiedDomains.Select(MapVerifiedDomain).ToList(),
            MapProvisioningSettings(provisioning),
            provisioningJobs.Select(MapProvisioningJob).ToList(),
            directoryGroupMappings.Select(MapDirectoryGroupMapping).ToList(),
            notificationRoutes.Select(MapNotificationRoute).ToList(),
            exportDestinations.Select(MapExportDestination).ToList(),
            calendarSyncSettings.Select(MapCalendarSyncSetting).ToList());
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
        provider.LastValidationError = await ValidateProviderConfigurationAsync(provider, verifiedDomains, cancellationToken);

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

    public async Task<OrganizationProvisioningSettingsDto> UpdateProvisioningSettingsAsync(Guid organizationId, UpdateOrganizationProvisioningSettingsRequest request, CancellationToken cancellationToken)
    {
        var settings = await EnsureProvisioningSettingsAsync(organizationId, cancellationToken);
        settings.SyncMode = request.SyncMode;
        settings.IdentityProviderId = request.IdentityProviderId;
        settings.AutoProvisionNewUsers = request.AutoProvisionNewUsers;
        settings.AutoDeactivateMissingUsers = request.AutoDeactivateMissingUsers;
        settings.GroupMappingStrategy = string.IsNullOrWhiteSpace(request.GroupMappingStrategy) ? "Manual" : request.GroupMappingStrategy.Trim();
        settings.ScimBaseUrl = request.ScimBaseUrl.Trim();
        settings.ScimSecretReference = request.ScimSecretReference.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(organizationId, "ProvisioningSettingsUpdated", "OrganizationProvisioningSettings", settings.Id.ToString(), "Provisioning settings updated.", cancellationToken);
        return MapProvisioningSettings(settings);
    }

    public async Task<OrganizationProvisioningJobDto> TriggerProvisioningJobAsync(Guid organizationId, TriggerOrganizationProvisioningJobRequest request, CancellationToken cancellationToken)
    {
        var settings = await EnsureProvisioningSettingsAsync(organizationId, cancellationToken);
        var job = new OrganizationProvisioningJob
        {
            OrganizationId = organizationId,
            IdentityProviderId = settings.IdentityProviderId,
            SyncMode = settings.SyncMode,
            Status = settings.SyncMode == ProvisioningSyncMode.Manual ? ProvisioningJobStatus.Succeeded : ProvisioningJobStatus.Pending,
            TriggeredBy = string.IsNullOrWhiteSpace(request.TriggeredBy) ? "OrgAdmin" : request.TriggeredBy.Trim(),
            Summary = string.IsNullOrWhiteSpace(request.Summary)
                ? "Provisioning sync requested from admin console."
                : request.Summary.Trim(),
            UsersProcessed = 0,
            UsersCreated = 0,
            UsersUpdated = 0,
            UsersDeactivated = 0,
            ErrorDetails = string.Empty,
            StartedAtUtc = DateTime.UtcNow,
            CompletedAtUtc = settings.SyncMode == ProvisioningSyncMode.Manual ? DateTime.UtcNow : null
        };

        settings.LastSyncAtUtc = DateTime.UtcNow;
        settings.LastSyncStatus = job.Status.ToString();
        settings.LastSyncError = string.Empty;

        _dbContext.OrganizationProvisioningJobs.Add(job);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(organizationId, "ProvisioningJobTriggered", "OrganizationProvisioningJob", job.Id.ToString(), job.Summary, cancellationToken);

        return MapProvisioningJob(job);
    }

    public async Task<OrganizationDirectoryGroupMappingDto> UpsertDirectoryGroupMappingAsync(Guid organizationId, UpsertOrganizationDirectoryGroupMappingRequest request, CancellationToken cancellationToken)
    {
        var identityProvider = await _dbContext.OrganizationIdentityProviders
            .Where(x => x.OrganizationId == organizationId && x.Id == request.IdentityProviderId)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("The selected identity provider does not belong to this organization.");

        var team = await _dbContext.Teams
            .Where(x => x.OrganizationId == organizationId && x.Id == request.TeamId)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("The selected team does not belong to this organization.");

        if (string.IsNullOrWhiteSpace(request.ExternalGroupId))
        {
            throw new InvalidOperationException("An external group ID is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ExternalGroupName))
        {
            throw new InvalidOperationException("An external group name is required.");
        }

        OrganizationDirectoryGroupMapping mapping;
        if (request.DirectoryGroupMappingId.HasValue)
        {
            mapping = await _dbContext.OrganizationDirectoryGroupMappings
                .Where(x => x.OrganizationId == organizationId && x.Id == request.DirectoryGroupMappingId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            mapping = new OrganizationDirectoryGroupMapping
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationDirectoryGroupMappings.Add(mapping);
        }

        mapping.IdentityProviderId = identityProvider.Id;
        mapping.TeamId = team.Id;
        mapping.ExternalGroupId = request.ExternalGroupId.Trim();
        mapping.ExternalGroupName = request.ExternalGroupName.Trim();
        mapping.DefaultRole = request.DefaultRole;
        mapping.IsActive = request.IsActive;
        mapping.SyncMembers = request.SyncMembers;
        mapping.LastSyncError = string.Empty;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            "DirectoryGroupMappingUpserted",
            "OrganizationDirectoryGroupMapping",
            mapping.Id.ToString(),
            $"Mapped {identityProvider.Name} group '{mapping.ExternalGroupName}' to team '{team.Name}' with default role {mapping.DefaultRole}.",
            cancellationToken);

        return MapDirectoryGroupMapping(mapping);
    }

    public async Task<OrganizationNotificationRouteDto> UpsertNotificationRouteAsync(Guid organizationId, UpsertOrganizationNotificationRouteRequest request, CancellationToken cancellationToken)
    {
        var integration = await _dbContext.OrganizationIntegrationConnections
            .Where(x => x.OrganizationId == organizationId && x.Id == request.IntegrationConnectionId)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("The selected integration connection does not belong to this organization.");

        if (integration.ProviderType == IntegrationProviderType.Slack)
        {
            throw new InvalidOperationException("Use Microsoft 365 or Google Workspace connections for enterprise chat routing.");
        }

        if (string.IsNullOrWhiteSpace(request.DestinationReference))
        {
            throw new InvalidOperationException("A destination reference is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DestinationLabel))
        {
            throw new InvalidOperationException("A destination label is required.");
        }

        if (integration.ProviderType == IntegrationProviderType.Microsoft365 && request.TargetType != ExternalNotificationTargetType.TeamsChannel)
        {
            throw new InvalidOperationException("Microsoft 365 routes must target a Teams channel.");
        }

        if (integration.ProviderType == IntegrationProviderType.GoogleWorkspace && request.TargetType != ExternalNotificationTargetType.GoogleChatSpace)
        {
            throw new InvalidOperationException("Google Workspace routes must target a Google Chat space.");
        }

        OrganizationNotificationRoute route;
        if (request.NotificationRouteId.HasValue)
        {
            route = await _dbContext.OrganizationNotificationRoutes
                .Where(x => x.OrganizationId == organizationId && x.Id == request.NotificationRouteId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            route = new OrganizationNotificationRoute
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationNotificationRoutes.Add(route);
        }

        route.IntegrationConnectionId = integration.Id;
        route.NotificationType = request.NotificationType;
        route.TargetType = request.TargetType;
        route.DestinationReference = request.DestinationReference.Trim();
        route.DestinationLabel = request.DestinationLabel.Trim();
        route.IsActive = request.IsActive;
        route.SendDailyDigest = request.SendDailyDigest;
        route.LastDeliveryError = string.Empty;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            "NotificationRouteUpserted",
            "OrganizationNotificationRoute",
            route.Id.ToString(),
            $"Mapped {route.NotificationType} notifications to {route.TargetType} destination '{route.DestinationLabel}' via {integration.Name}.",
            cancellationToken);

        return MapNotificationRoute(route);
    }

    public async Task<OrganizationExportDestinationDto> UpsertExportDestinationAsync(Guid organizationId, UpsertOrganizationExportDestinationRequest request, CancellationToken cancellationToken)
    {
        var integration = await _dbContext.OrganizationIntegrationConnections
            .Where(x => x.OrganizationId == organizationId && x.Id == request.IntegrationConnectionId)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("The selected integration connection does not belong to this organization.");

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("A destination name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DestinationReference))
        {
            throw new InvalidOperationException("A destination reference is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DestinationPath))
        {
            throw new InvalidOperationException("A destination path is required.");
        }

        if (integration.ProviderType == IntegrationProviderType.Microsoft365 &&
            request.DestinationType is not (ExportDestinationType.SharePointLibrary or ExportDestinationType.OneDriveFolder))
        {
            throw new InvalidOperationException("Microsoft 365 destinations must target SharePoint or OneDrive.");
        }

        if (integration.ProviderType == IntegrationProviderType.GoogleWorkspace &&
            request.DestinationType != ExportDestinationType.GoogleDriveFolder)
        {
            throw new InvalidOperationException("Google Workspace destinations must target Google Drive.");
        }

        if (integration.ProviderType == IntegrationProviderType.Slack)
        {
            throw new InvalidOperationException("Slack integrations cannot be used for document export destinations.");
        }

        OrganizationExportDestination destination;
        if (request.ExportDestinationId.HasValue)
        {
            destination = await _dbContext.OrganizationExportDestinations
                .Where(x => x.OrganizationId == organizationId && x.Id == request.ExportDestinationId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            destination = new OrganizationExportDestination
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationExportDestinations.Add(destination);
        }

        destination.IntegrationConnectionId = integration.Id;
        destination.DestinationType = request.DestinationType;
        destination.Name = request.Name.Trim();
        destination.DestinationReference = request.DestinationReference.Trim();
        destination.DestinationPath = request.DestinationPath.Trim();
        destination.IsDefault = request.IsDefault;
        destination.IsActive = request.IsActive;
        destination.LastValidationError = string.Empty;
        destination.LastValidatedAtUtc = DateTime.UtcNow;

        if (request.IsDefault)
        {
            var others = await _dbContext.OrganizationExportDestinations
                .Where(x => x.OrganizationId == organizationId && x.Id != destination.Id)
                .ToListAsync(cancellationToken);

            foreach (var other in others)
            {
                other.IsDefault = false;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            "ExportDestinationUpserted",
            "OrganizationExportDestination",
            destination.Id.ToString(),
            $"Configured {destination.DestinationType} export destination '{destination.Name}' via {integration.Name}.",
            cancellationToken);

        return MapExportDestination(destination);
    }

    public async Task<OrganizationCalendarSyncSettingDto> UpsertCalendarSyncSettingAsync(Guid organizationId, UpsertOrganizationCalendarSyncSettingRequest request, CancellationToken cancellationToken)
    {
        var integration = await _dbContext.OrganizationIntegrationConnections
            .Where(x => x.OrganizationId == organizationId && x.Id == request.IntegrationConnectionId)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("The selected integration connection does not belong to this organization.");

        if (integration.ProviderType == IntegrationProviderType.Slack)
        {
            throw new InvalidOperationException("Slack integrations cannot be used for calendar sync.");
        }

        if (string.IsNullOrWhiteSpace(request.CalendarReference))
        {
            throw new InvalidOperationException("A calendar reference is required.");
        }

        if (string.IsNullOrWhiteSpace(request.CalendarLabel))
        {
            throw new InvalidOperationException("A calendar label is required.");
        }

        Team? team = null;
        if (!request.SyncAllTeams)
        {
            if (!request.TeamId.HasValue)
            {
                throw new InvalidOperationException("Select a team or sync all teams.");
            }

            team = await _dbContext.Teams
                .Where(x => x.OrganizationId == organizationId && x.Id == request.TeamId.Value)
                .SingleOrDefaultAsync(cancellationToken)
                ?? throw new InvalidOperationException("The selected team does not belong to this organization.");
        }

        var reminderOffsets = request.DefaultReminderOffsets
            .Distinct()
            .Where(x => x >= 0)
            .OrderBy(x => x)
            .ToArray();

        OrganizationCalendarSyncSetting setting;
        if (request.CalendarSyncSettingId.HasValue)
        {
            setting = await _dbContext.OrganizationCalendarSyncSettings
                .Where(x => x.OrganizationId == organizationId && x.Id == request.CalendarSyncSettingId.Value)
                .SingleAsync(cancellationToken);
        }
        else
        {
            setting = new OrganizationCalendarSyncSetting
            {
                OrganizationId = organizationId
            };
            _dbContext.OrganizationCalendarSyncSettings.Add(setting);
        }

        setting.IntegrationConnectionId = integration.Id;
        setting.EventType = request.EventType;
        setting.CalendarReference = request.CalendarReference.Trim();
        setting.CalendarLabel = request.CalendarLabel.Trim();
        setting.DefaultReminderOffsetsCsv = JoinCsv(reminderOffsets.Select(x => x.ToString()));
        setting.IsEnabled = request.IsEnabled;
        setting.SyncAllTeams = request.SyncAllTeams;
        setting.TeamId = request.SyncAllTeams ? null : team?.Id;
        setting.LastSyncError = string.Empty;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await WriteEnterpriseAuditAsync(
            organizationId,
            "CalendarSyncSettingUpserted",
            "OrganizationCalendarSyncSetting",
            setting.Id.ToString(),
            $"Configured {setting.EventType} calendar sync to '{setting.CalendarLabel}' via {integration.Name}.",
            cancellationToken);

        return MapCalendarSyncSetting(setting);
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

    private async Task<OrganizationProvisioningSettings> EnsureProvisioningSettingsAsync(Guid organizationId, CancellationToken cancellationToken)
    {
        var settings = await _dbContext.OrganizationProvisioningSettings
            .SingleOrDefaultAsync(x => x.OrganizationId == organizationId, cancellationToken);

        if (settings is not null)
        {
            return settings;
        }

        settings = new OrganizationProvisioningSettings
        {
            OrganizationId = organizationId,
            SyncMode = ProvisioningSyncMode.Manual,
            GroupMappingStrategy = "Manual",
            LastSyncStatus = "NotStarted"
        };

        _dbContext.OrganizationProvisioningSettings.Add(settings);
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

    private static OrganizationProvisioningSettingsDto MapProvisioningSettings(OrganizationProvisioningSettings settings) =>
        new(
            settings.Id,
            settings.OrganizationId,
            settings.SyncMode.ToString(),
            settings.IdentityProviderId,
            settings.AutoProvisionNewUsers,
            settings.AutoDeactivateMissingUsers,
            settings.GroupMappingStrategy,
            settings.ScimBaseUrl,
            settings.LastSyncAtUtc,
            settings.LastSyncStatus,
            settings.LastSyncError);

    private static OrganizationProvisioningJobDto MapProvisioningJob(OrganizationProvisioningJob job) =>
        new(
            job.Id,
            job.OrganizationId,
            job.IdentityProviderId,
            job.SyncMode.ToString(),
            job.Status.ToString(),
            job.TriggeredBy,
            job.Summary,
            job.UsersProcessed,
            job.UsersCreated,
            job.UsersUpdated,
            job.UsersDeactivated,
            job.ErrorDetails,
            job.StartedAtUtc,
            job.CompletedAtUtc);

    private static OrganizationDirectoryGroupMappingDto MapDirectoryGroupMapping(OrganizationDirectoryGroupMapping mapping) =>
        new(
            mapping.Id,
            mapping.OrganizationId,
            mapping.IdentityProviderId,
            mapping.TeamId,
            mapping.ExternalGroupId,
            mapping.ExternalGroupName,
            mapping.DefaultRole.ToString(),
            mapping.IsActive,
            mapping.SyncMembers,
            mapping.LastSyncedAtUtc,
            mapping.LastSyncError);

    private static OrganizationNotificationRouteDto MapNotificationRoute(OrganizationNotificationRoute route) =>
        new(
            route.Id,
            route.OrganizationId,
            route.IntegrationConnectionId,
            route.NotificationType.ToString(),
            route.TargetType.ToString(),
            route.DestinationReference,
            route.DestinationLabel,
            route.IsActive,
            route.SendDailyDigest,
            route.LastDeliveredAtUtc,
            route.LastDeliveryError);

    private static OrganizationExportDestinationDto MapExportDestination(OrganizationExportDestination destination) =>
        new(
            destination.Id,
            destination.OrganizationId,
            destination.IntegrationConnectionId,
            destination.DestinationType.ToString(),
            destination.Name,
            destination.DestinationReference,
            destination.DestinationPath,
            destination.IsDefault,
            destination.IsActive,
            destination.LastValidatedAtUtc,
            destination.LastValidationError,
            destination.LastDeliveredAtUtc,
            destination.LastDeliveryError);

    private static OrganizationCalendarSyncSettingDto MapCalendarSyncSetting(OrganizationCalendarSyncSetting setting) =>
        new(
            setting.Id,
            setting.OrganizationId,
            setting.IntegrationConnectionId,
            setting.EventType.ToString(),
            setting.CalendarReference,
            setting.CalendarLabel,
            SplitCsv(setting.DefaultReminderOffsetsCsv).Select(value => int.TryParse(value, out var parsed) ? parsed : -1).Where(value => value >= 0).ToArray(),
            setting.IsEnabled,
            setting.SyncAllTeams,
            setting.TeamId,
            setting.LastSyncedAtUtc,
            setting.LastSyncError);

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

    private async Task<string> ValidateProviderConfigurationAsync(OrganizationIdentityProvider provider, IReadOnlyCollection<string> verifiedDomains, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(provider.Name))
        {
            return "Provider name is required.";
        }

        if (string.IsNullOrWhiteSpace(provider.ClientId))
        {
            return "Client ID is required.";
        }

        var configError = provider.ProviderType switch
        {
            IdentityProviderType.MicrosoftEntraId when string.IsNullOrWhiteSpace(provider.Authority) && string.IsNullOrWhiteSpace(provider.TenantIdentifier)
                => "Microsoft Entra ID providers require an authority URL or tenant identifier.",
            IdentityProviderType.GoogleWorkspace when !SplitCsv(provider.DomainHintsCsv).Any() && verifiedDomains.Count == 0
                => "Google Workspace providers require at least one verified domain or domain hint.",
            IdentityProviderType.Saml when string.IsNullOrWhiteSpace(provider.MetadataUrl)
                => "SAML providers require a metadata URL.",
            _ => string.Empty
        };

        if (!string.IsNullOrWhiteSpace(configError))
        {
            return configError;
        }

        if (_enterpriseOidcService is null || !_enterpriseOidcService.SupportsProvider(provider.ProviderType.ToString()))
        {
            return string.Empty;
        }

        try
        {
            await _enterpriseOidcService.ValidateProviderAsync(
                new EnterpriseProviderOption(
                    provider.Id,
                    provider.Name,
                    provider.ProviderType,
                    provider.ClientId,
                    provider.ClientSecretReference,
                    provider.Authority,
                    provider.MetadataUrl,
                    provider.TenantIdentifier,
                    SplitCsv(provider.ScopesCsv),
                    SplitCsv(provider.DomainHintsCsv),
                    provider.IsPrimary,
                    provider.IsEnabled),
                cancellationToken);

            return string.Empty;
        }
        catch (Exception ex)
        {
            return $"Live metadata validation failed: {ex.Message}";
        }
    }
}
