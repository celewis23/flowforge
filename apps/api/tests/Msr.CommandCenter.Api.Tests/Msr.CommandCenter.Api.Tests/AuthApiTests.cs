using System.Net.Http.Json;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Api.Tests;

public class AuthApiTests : IClassFixture<TestApiFactory>
{
    private readonly HttpClient _client;
    private readonly TestApiFactory _factory;

    public AuthApiTests(TestApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_CreatesOrgAdminAndReturnsJwtPayload()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest("Test Admin", "test.admin@example.com", "Passw0rd!", "Test Org", $"test-org-{Guid.NewGuid():N}".Substring(0, 18)));
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<AuthResponseDto>();

        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload!.AccessToken));
        Assert.Equal("OrgAdmin", payload.User.Role);
        Assert.StartsWith("test-org-", payload.OrganizationSlug);
    }

    [Fact]
    public async Task EnterpriseDiscovery_ReturnsConfiguredProviderForMatchingDomain()
    {
        var organizationId = Guid.NewGuid();
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MsrCommandCenterDbContext>();

        dbContext.Organizations.Add(new Organization
        {
            Id = organizationId,
            Name = "Contoso Federal",
            Slug = "contoso-federal",
            Domain = "agency.gov",
            DefaultCadence = "Monthly"
        });

        dbContext.OrganizationAuthenticationSettings.Add(new OrganizationAuthenticationSettings
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            AuthenticationMode = OrganizationAuthenticationMode.SsoRequired,
            AllowLocalPasswordSignIn = false,
            RequireMfaByDefault = true,
            AllowJustInTimeProvisioning = true,
            EnforceDomainVerification = true,
            AllowedDomainsCsv = "agency.gov"
        });

        dbContext.OrganizationIdentityProviders.Add(new OrganizationIdentityProvider
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Name = "Contoso Entra ID",
            ProviderType = IdentityProviderType.MicrosoftEntraId,
            ClientId = "client-id",
            ClientSecretReference = "secret-ref",
            Authority = "https://login.microsoftonline.com/contoso",
            TenantIdentifier = "contoso-tenant",
            ScopesCsv = "openid,profile,email",
            DomainHintsCsv = "agency.gov",
            ProvisioningMode = ProvisioningMode.JustInTime,
            IsEnabled = true,
            IsPrimary = true
        });

        await dbContext.SaveChangesAsync();

        var response = await _client.PostAsJsonAsync("/api/auth/enterprise/discovery", new EnterpriseLoginDiscoveryRequest("analyst@agency.gov"));
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<EnterpriseLoginDiscoveryDto>();

        Assert.NotNull(payload);
        Assert.True(payload!.IsEnterpriseConfigured);
        Assert.True(payload.IsSsoRequired);
        Assert.False(payload.AllowLocalPasswordSignIn);
        Assert.Single(payload.Providers);
        var provider = payload.Providers.First();
        Assert.Equal("Contoso Entra ID", provider.DisplayName);
        Assert.Equal("contoso-federal", provider.OrganizationSlug);
    }
}
