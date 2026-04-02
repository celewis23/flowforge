using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;
using Msr.CommandCenter.Infrastructure.Services;

namespace Msr.CommandCenter.Application.Tests;

public class OrganizationServiceTests
{
    [Fact]
    public async Task ValidateIdentityProviderAsync_FlagsGoogleProviderWithoutVerifiedDomain()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var providerId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Federal",
            Slug = "flowforge-federal",
            Domain = "agency.gov",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationIdentityProviders.Add(new OrganizationIdentityProvider
        {
            Id = providerId,
            OrganizationId = organizationId,
            Name = "Google Workspace",
            ProviderType = IdentityProviderType.GoogleWorkspace,
            ClientId = "google-client",
            ClientSecretReference = "secret-ref",
            MetadataUrl = "https://accounts.google.com/.well-known/openid-configuration",
            IsEnabled = true
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.ValidateIdentityProviderAsync(organizationId, new ValidateOrganizationIdentityProviderRequest(providerId), CancellationToken.None);

        Assert.Equal("Invalid", result.ValidationStatus);
        Assert.Contains("verified domain", result.LastValidationError, StringComparison.OrdinalIgnoreCase);
        Assert.NotNull(result.LastValidatedAtUtc);
    }

    [Fact]
    public async Task TriggerProvisioningJobAsync_CreatesLifecycleJobAndUpdatesProvisioningStatus()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Enterprise",
            Slug = "flowforge-enterprise",
            Domain = "enterprise.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationProvisioningSettings.Add(new OrganizationProvisioningSettings
        {
            OrganizationId = organizationId,
            SyncMode = ProvisioningSyncMode.Scim,
            AutoProvisionNewUsers = true,
            AutoDeactivateMissingUsers = true,
            GroupMappingStrategy = "IdpGroup"
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.TriggerProvisioningJobAsync(
            organizationId,
            new TriggerOrganizationProvisioningJobRequest("OrgAdmin", "SCIM sync kicked off from admin console."),
            CancellationToken.None);

        Assert.Equal("Pending", result.Status);
        Assert.Equal("Scim", result.SyncMode);
        Assert.Equal("OrgAdmin", result.TriggeredBy);
        Assert.True(result.StartedAtUtc > DateTime.MinValue);

        var settings = await dbContext.OrganizationProvisioningSettings.SingleAsync(x => x.OrganizationId == organizationId);
        Assert.Equal("Pending", settings.LastSyncStatus);
        Assert.NotNull(settings.LastSyncAtUtc);
    }

    [Fact]
    public async Task UpsertDirectoryGroupMappingAsync_CreatesTeamRoleMapping()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var providerId = Guid.NewGuid();
        var teamId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Manufacturing",
            Slug = "flowforge-manufacturing",
            Domain = "flowforge.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.Teams.Add(new Team
        {
            Id = teamId,
            OrganizationId = organizationId,
            Name = "Assembly Operations",
            Department = "Manufacturing",
            ManagerId = Guid.NewGuid()
        });

        dbContext.OrganizationIdentityProviders.Add(new OrganizationIdentityProvider
        {
            Id = providerId,
            OrganizationId = organizationId,
            Name = "Contoso Entra ID",
            ProviderType = IdentityProviderType.MicrosoftEntraId,
            ClientId = "entra-client",
            ClientSecretReference = "entra-secret",
            Authority = "https://login.microsoftonline.com/tenant-id",
            IsEnabled = true
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.UpsertDirectoryGroupMappingAsync(
            organizationId,
            new UpsertOrganizationDirectoryGroupMappingRequest(
                null,
                providerId,
                teamId,
                "group-001",
                "Assembly Supervisors",
                PlatformRole.Manager,
                true,
                true),
            CancellationToken.None);

        Assert.Equal("Assembly Supervisors", result.ExternalGroupName);
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal(providerId, result.IdentityProviderId);
        Assert.Equal("Manager", result.DefaultRole);
        Assert.True(result.IsActive);
        Assert.True(result.SyncMembers);
    }

    [Fact]
    public async Task UpsertNotificationRouteAsync_CreatesEnterpriseChatRoute()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var integrationId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Healthcare",
            Slug = "flowforge-healthcare",
            Domain = "health.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationIntegrationConnections.Add(new OrganizationIntegrationConnection
        {
            Id = integrationId,
            OrganizationId = organizationId,
            Name = "Contoso Microsoft 365",
            ProviderType = IntegrationProviderType.Microsoft365,
            ClientId = "m365-client",
            ClientSecretReference = "m365-secret",
            TenantIdentifier = "tenant-id",
            Status = IntegrationConnectionStatus.Active
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.UpsertNotificationRouteAsync(
            organizationId,
            new UpsertOrganizationNotificationRouteRequest(
                null,
                integrationId,
                NotificationType.Assignment,
                ExternalNotificationTargetType.TeamsChannel,
                "19:ops@thread.tacv2",
                "Operations Leadership",
                true,
                false),
            CancellationToken.None);

        Assert.Equal(integrationId, result.IntegrationConnectionId);
        Assert.Equal("Assignment", result.NotificationType);
        Assert.Equal("TeamsChannel", result.TargetType);
        Assert.Equal("Operations Leadership", result.DestinationLabel);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task UpsertExportDestinationAsync_CreatesCloudDocumentTarget()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var integrationId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Public Sector",
            Slug = "flowforge-public-sector",
            Domain = "public.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationIntegrationConnections.Add(new OrganizationIntegrationConnection
        {
            Id = integrationId,
            OrganizationId = organizationId,
            Name = "Civic Microsoft 365",
            ProviderType = IntegrationProviderType.Microsoft365,
            ClientId = "m365-client",
            ClientSecretReference = "m365-secret",
            TenantIdentifier = "tenant-id",
            Status = IntegrationConnectionStatus.Active
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.UpsertExportDestinationAsync(
            organizationId,
            new UpsertOrganizationExportDestinationRequest(
                null,
                integrationId,
                ExportDestinationType.SharePointLibrary,
                "Leadership Reports",
                "site-id:library-id",
                "/Shared Documents/MSRs",
                true,
                true),
            CancellationToken.None);

        Assert.Equal(integrationId, result.IntegrationConnectionId);
        Assert.Equal("SharePointLibrary", result.DestinationType);
        Assert.Equal("Leadership Reports", result.Name);
        Assert.True(result.IsDefault);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task UpsertCalendarSyncSettingAsync_CreatesDeadlineSyncRule()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var integrationId = Guid.NewGuid();
        var teamId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Energy",
            Slug = "flowforge-energy",
            Domain = "energy.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.Teams.Add(new Team
        {
            Id = teamId,
            OrganizationId = organizationId,
            Name = "Grid Reliability",
            Department = "Operations",
            ManagerId = Guid.NewGuid()
        });

        dbContext.OrganizationIntegrationConnections.Add(new OrganizationIntegrationConnection
        {
            Id = integrationId,
            OrganizationId = organizationId,
            Name = "Northwind Google Workspace",
            ProviderType = IntegrationProviderType.GoogleWorkspace,
            ClientId = "gw-client",
            ClientSecretReference = "gw-secret",
            TenantIdentifier = "workspace-id",
            Status = IntegrationConnectionStatus.Active
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.UpsertCalendarSyncSettingAsync(
            organizationId,
            new UpsertOrganizationCalendarSyncSettingRequest(
                null,
                integrationId,
                CalendarSyncEventType.SubmissionDeadline,
                "primary-calendar-id",
                "Reporting Deadlines",
                new[] { 7, 3, 1 },
                true,
                false,
                teamId),
            CancellationToken.None);

        Assert.Equal(integrationId, result.IntegrationConnectionId);
        Assert.Equal("SubmissionDeadline", result.EventType);
        Assert.Equal("Reporting Deadlines", result.CalendarLabel);
        Assert.Equal(teamId, result.TeamId);
        Assert.Equal(new[] { 1, 3, 7 }, result.DefaultReminderOffsets.OrderBy(x => x).ToArray());
        Assert.True(result.IsEnabled);
    }

    [Fact]
    public async Task UpsertProfileSyncSettingAsync_CreatesDirectoryProfilePolicy()
    {
        await using var dbContext = CreateDbContext();
        var organizationId = Guid.NewGuid();
        var integrationId = Guid.NewGuid();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "FlowForge Transit",
            Slug = "flowforge-transit",
            Domain = "transit.example.com",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationIntegrationConnections.Add(new OrganizationIntegrationConnection
        {
            Id = integrationId,
            OrganizationId = organizationId,
            Name = "Transit Microsoft 365",
            ProviderType = IntegrationProviderType.Microsoft365,
            ClientId = "client-id",
            ClientSecretReference = "secret-ref",
            TenantIdentifier = "tenant-id",
            Status = IntegrationConnectionStatus.Active
        });

        await dbContext.SaveChangesAsync();

        var service = new OrganizationService(dbContext);
        var result = await service.UpsertProfileSyncSettingAsync(
            organizationId,
            new UpsertOrganizationProfileSyncSettingRequest(
                null,
                integrationId,
                true,
                true,
                true,
                true,
                false,
                true),
            CancellationToken.None);

        Assert.Equal(integrationId, result.IntegrationConnectionId);
        Assert.True(result.IsEnabled);
        Assert.True(result.SyncJobTitles);
        Assert.True(result.SyncDepartments);
        Assert.True(result.SyncManagerHierarchy);
        Assert.False(result.SyncOfficeLocation);
        Assert.True(result.SyncProfilePhotos);
    }

    private static MsrCommandCenterDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MsrCommandCenterDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new MsrCommandCenterDbContext(options);
    }
}
