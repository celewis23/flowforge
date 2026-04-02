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

    private static MsrCommandCenterDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MsrCommandCenterDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new MsrCommandCenterDbContext(options);
    }
}
