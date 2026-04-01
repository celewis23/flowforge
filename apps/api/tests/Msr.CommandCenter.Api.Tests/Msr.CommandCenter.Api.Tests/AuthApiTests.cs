using System.Net.Http.Json;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Tests;

public class AuthApiTests : IClassFixture<TestApiFactory>
{
    private readonly HttpClient _client;

    public AuthApiTests(TestApiFactory factory)
    {
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
}
