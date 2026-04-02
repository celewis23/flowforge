using System.Net.Http.Headers;
using System.Text.Json;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Infrastructure.Services;

public sealed class EnterpriseDirectorySyncService : IEnterpriseDirectorySyncService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public EnterpriseDirectorySyncService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public bool SupportsProvider(string providerType) =>
        string.Equals(providerType, IntegrationProviderType.Microsoft365.ToString(), StringComparison.OrdinalIgnoreCase)
        || string.Equals(providerType, IntegrationProviderType.GoogleWorkspace.ToString(), StringComparison.OrdinalIgnoreCase);

    public async Task<EnterpriseDirectoryProfileResult> FetchProfilesAsync(OrganizationIntegrationConnection integrationConnection, CancellationToken cancellationToken)
    {
        var configuration = ParseConfiguration(integrationConnection.ConfigurationJson);
        var accessToken = ReadString(configuration, "accessToken");

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            throw new InvalidOperationException("Directory profile sync requires an accessToken in the integration configuration JSON.");
        }

        var httpClient = _httpClientFactory.CreateClient(nameof(EnterpriseDirectorySyncService));
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        return integrationConnection.ProviderType switch
        {
            IntegrationProviderType.Microsoft365 => new EnterpriseDirectoryProfileResult(
                integrationConnection.ProviderType,
                await FetchMicrosoftProfilesAsync(httpClient, configuration, cancellationToken)),
            IntegrationProviderType.GoogleWorkspace => new EnterpriseDirectoryProfileResult(
                integrationConnection.ProviderType,
                await FetchGoogleProfilesAsync(httpClient, configuration, cancellationToken)),
            _ => throw new InvalidOperationException($"Provider '{integrationConnection.ProviderType}' does not support directory profile sync.")
        };
    }

    private static JsonElement ParseConfiguration(string configurationJson)
    {
        if (string.IsNullOrWhiteSpace(configurationJson))
        {
            using var document = JsonDocument.Parse("{}");
            return document.RootElement.Clone();
        }

        using var parsed = JsonDocument.Parse(configurationJson);
        return parsed.RootElement.Clone();
    }

    private static string ReadString(JsonElement element, string propertyName)
    {
        return element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var value)
            ? value.GetString() ?? string.Empty
            : string.Empty;
    }

    private static async Task<IReadOnlyCollection<EnterpriseDirectoryUserProfile>> FetchMicrosoftProfilesAsync(HttpClient httpClient, JsonElement configuration, CancellationToken cancellationToken)
    {
        var baseUrl = ReadString(configuration, "directoryApiBaseUrl");
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = "https://graph.microsoft.com/v1.0";
        }

        var usersResponse = await httpClient.GetAsync(
            $"{baseUrl.TrimEnd('/')}/users?$top=999&$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,employeeId",
            cancellationToken);
        usersResponse.EnsureSuccessStatusCode();

        using var usersDocument = JsonDocument.Parse(await usersResponse.Content.ReadAsStringAsync(cancellationToken));
        var managerMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var profiles = new List<EnterpriseDirectoryUserProfile>();

        foreach (var userElement in usersDocument.RootElement.GetProperty("value").EnumerateArray())
        {
            var externalId = ReadString(userElement, "id");
            if (string.IsNullOrWhiteSpace(externalId))
            {
                continue;
            }

            var email = ReadString(userElement, "mail");
            if (string.IsNullOrWhiteSpace(email))
            {
                email = ReadString(userElement, "userPrincipalName");
            }

            if (!managerMap.ContainsKey(externalId))
            {
                managerMap[externalId] = await FetchMicrosoftManagerIdentifierAsync(httpClient, baseUrl, externalId, cancellationToken);
            }

            profiles.Add(new EnterpriseDirectoryUserProfile(
                externalId,
                email,
                ReadString(userElement, "displayName"),
                ReadString(userElement, "jobTitle"),
                ReadString(userElement, "department"),
                ReadString(userElement, "officeLocation"),
                managerMap[externalId],
                string.Empty,
                ReadString(userElement, "employeeId")));
        }

        return profiles;
    }

    private static async Task<string> FetchMicrosoftManagerIdentifierAsync(HttpClient httpClient, string baseUrl, string userId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetAsync(
                $"{baseUrl.TrimEnd('/')}/users/{Uri.EscapeDataString(userId)}/manager?$select=id,mail,userPrincipalName,employeeId",
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return string.Empty;
            }

            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var employeeId = ReadString(document.RootElement, "employeeId");
            if (!string.IsNullOrWhiteSpace(employeeId))
            {
                return employeeId;
            }

            var mail = ReadString(document.RootElement, "mail");
            if (!string.IsNullOrWhiteSpace(mail))
            {
                return mail;
            }

            return ReadString(document.RootElement, "userPrincipalName");
        }
        catch
        {
            return string.Empty;
        }
    }

    private static async Task<IReadOnlyCollection<EnterpriseDirectoryUserProfile>> FetchGoogleProfilesAsync(HttpClient httpClient, JsonElement configuration, CancellationToken cancellationToken)
    {
        var baseUrl = ReadString(configuration, "directoryApiBaseUrl");
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = "https://admin.googleapis.com/admin/directory/v1";
        }

        var customerId = ReadString(configuration, "customerId");
        if (string.IsNullOrWhiteSpace(customerId))
        {
            customerId = "my_customer";
        }

        var usersResponse = await httpClient.GetAsync(
            $"{baseUrl.TrimEnd('/')}/users?customer={Uri.EscapeDataString(customerId)}&maxResults=500&projection=full",
            cancellationToken);
        usersResponse.EnsureSuccessStatusCode();

        using var usersDocument = JsonDocument.Parse(await usersResponse.Content.ReadAsStringAsync(cancellationToken));
        var profiles = new List<EnterpriseDirectoryUserProfile>();

        if (!usersDocument.RootElement.TryGetProperty("users", out var users))
        {
            return profiles;
        }

        foreach (var userElement in users.EnumerateArray())
        {
            var organizations = userElement.TryGetProperty("organizations", out var orgs) && orgs.ValueKind == JsonValueKind.Array && orgs.GetArrayLength() > 0
                ? orgs[0]
                : default;

            var locations = userElement.TryGetProperty("locations", out var locs) && locs.ValueKind == JsonValueKind.Array && locs.GetArrayLength() > 0
                ? locs[0]
                : default;

            profiles.Add(new EnterpriseDirectoryUserProfile(
                ReadString(userElement, "id"),
                ReadString(userElement, "primaryEmail"),
                userElement.TryGetProperty("name", out var name) ? ReadString(name, "fullName") : string.Empty,
                ReadString(organizations, "title"),
                ReadString(organizations, "department"),
                ReadString(locations, "area"),
                ResolveGoogleManagerIdentifier(userElement),
                string.Empty,
                ReadString(userElement, "employeeId")));
        }

        return profiles;
    }

    private static string ResolveGoogleManagerIdentifier(JsonElement userElement)
    {
        if (!userElement.TryGetProperty("relations", out var relations) || relations.ValueKind != JsonValueKind.Array)
        {
            return string.Empty;
        }

        foreach (var relation in relations.EnumerateArray())
        {
            if (!string.Equals(ReadString(relation, "type"), "manager", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var value = ReadString(relation, "value");
            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return string.Empty;
    }
}
