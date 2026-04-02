using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Infrastructure.Services;

internal sealed class EnterpriseOidcService : IEnterpriseOidcService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public EnterpriseOidcService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public bool SupportsProvider(string providerType) =>
        providerType.Equals(nameof(IdentityProviderType.MicrosoftEntraId), StringComparison.OrdinalIgnoreCase) ||
        providerType.Equals(nameof(IdentityProviderType.GoogleWorkspace), StringComparison.OrdinalIgnoreCase);

    public async Task<OidcAuthorizationRequest> BuildAuthorizationUrlAsync(EnterpriseProviderOption provider, EnterpriseAuthSession session, CancellationToken cancellationToken)
    {
        var metadata = await GetConfigurationAsync(provider, cancellationToken);
        var state = session.StateToken;
        var scopes = provider.Scopes.Count > 0 ? provider.Scopes : new[] { "openid", "profile", "email" };
        var parameters = new Dictionary<string, string?>
        {
            ["client_id"] = provider.ClientId,
            ["response_type"] = "code",
            ["redirect_uri"] = session.RedirectUri,
            ["response_mode"] = "query",
            ["scope"] = string.Join(' ', scopes),
            ["state"] = state,
            ["login_hint"] = string.IsNullOrWhiteSpace(session.EmailHint) ? null : session.EmailHint
        };

        if (provider.ProviderType == IdentityProviderType.GoogleWorkspace && provider.DomainHints.Count > 0)
        {
            parameters["hd"] = provider.DomainHints.First();
        }

        var query = string.Join("&", parameters.Where(x => !string.IsNullOrWhiteSpace(x.Value)).Select(x => $"{Uri.EscapeDataString(x.Key)}={Uri.EscapeDataString(x.Value!)}"));
        return new OidcAuthorizationRequest($"{metadata.AuthorizationEndpoint}?{query}", state);
    }

    public async Task<EnterprisePrincipal> ExchangeCodeAsync(EnterpriseProviderOption provider, EnterpriseAuthSession session, string code, CancellationToken cancellationToken)
    {
        var metadata = await GetConfigurationAsync(provider, cancellationToken);
        using var client = _httpClientFactory.CreateClient(nameof(EnterpriseOidcService));
        using var response = await client.PostAsync(
            metadata.TokenEndpoint,
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["code"] = code,
                ["redirect_uri"] = session.RedirectUri,
                ["client_id"] = provider.ClientId,
                ["client_secret"] = provider.ClientSecretReference
            }),
            cancellationToken);

        response.EnsureSuccessStatusCode();
        var tokenResponse = await response.Content.ReadFromJsonAsync<OidcTokenResponse>(cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException("OIDC token response was empty.");

        if (string.IsNullOrWhiteSpace(tokenResponse.IdToken))
        {
            throw new InvalidOperationException("OIDC provider did not return an ID token.");
        }

        var principal = await ValidateIdTokenAsync(tokenResponse.IdToken, metadata, provider, cancellationToken);
        var subject = principal.FindFirst("sub")?.Value ?? throw new InvalidOperationException("OIDC subject claim missing.");
        var email = principal.FindFirst("email")?.Value ?? principal.FindFirst("preferred_username")?.Value
            ?? throw new InvalidOperationException("OIDC email claim missing.");
        var displayName = principal.FindFirst("name")?.Value ?? email;

        return new EnterprisePrincipal(
            session.OrganizationId,
            session.IdentityProviderId,
            provider.ProviderType,
            subject,
            email,
            displayName,
            principal.FindFirst("given_name")?.Value,
            principal.FindFirst("family_name")?.Value);
    }

    private async Task<OpenIdConnectConfiguration> GetConfigurationAsync(EnterpriseProviderOption provider, CancellationToken cancellationToken)
    {
        var metadataAddress = string.IsNullOrWhiteSpace(provider.MetadataUrl)
            ? BuildMetadataUrl(provider)
            : provider.MetadataUrl;

        var manager = new ConfigurationManager<OpenIdConnectConfiguration>(
            metadataAddress,
            new OpenIdConnectConfigurationRetriever(),
            new HttpDocumentRetriever { RequireHttps = metadataAddress.StartsWith("https://", StringComparison.OrdinalIgnoreCase) });

        return await manager.GetConfigurationAsync(cancellationToken);
    }

    private static string BuildMetadataUrl(EnterpriseProviderOption provider)
    {
        if (provider.ProviderType == IdentityProviderType.GoogleWorkspace)
        {
            return "https://accounts.google.com/.well-known/openid-configuration";
        }

        var authority = provider.Authority.TrimEnd('/');
        return $"{authority}/v2.0/.well-known/openid-configuration";
    }

    private static async Task<System.Security.Claims.ClaimsPrincipal> ValidateIdTokenAsync(
        string idToken,
        OpenIdConnectConfiguration metadata,
        EnterpriseProviderOption provider,
        CancellationToken cancellationToken)
    {
        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuers = metadata.Issuer is null ? null : new[] { metadata.Issuer },
            ValidateAudience = true,
            ValidAudience = provider.ClientId,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = metadata.SigningKeys,
            ClockSkew = TimeSpan.FromMinutes(2)
        };

        return await Task.Run(() => handler.ValidateToken(idToken, parameters, out _), cancellationToken);
    }

    private sealed class OidcTokenResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string IdToken { get; set; } = string.Empty;
    }
}
