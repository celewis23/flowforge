using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly MsrCommandCenterDbContext _dbContext;
    private readonly JwtOptions _jwtOptions;
    private readonly EnterpriseAuthOptions _enterpriseAuthOptions;
    private readonly IEnterpriseOidcService _enterpriseOidcService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        MsrCommandCenterDbContext dbContext,
        IOptions<JwtOptions> jwtOptions,
        IOptions<EnterpriseAuthOptions> enterpriseAuthOptions,
        IEnterpriseOidcService enterpriseOidcService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _jwtOptions = jwtOptions.Value;
        _enterpriseAuthOptions = enterpriseAuthOptions.Value;
        _enterpriseOidcService = enterpriseOidcService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var organization = new Organization
        {
            Name = request.OrganizationName,
            Slug = request.OrganizationSlug,
            Domain = $"{request.OrganizationSlug}.local",
            DefaultCadence = "Monthly"
        };

        _dbContext.Organizations.Add(organization);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = new ApplicationUser
        {
            FullName = request.FullName,
            Email = request.Email,
            UserName = request.Email,
            OrganizationId = organization.Id,
            EmailConfirmed = true,
            JobTitle = "Org Administrator"
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(x => x.Description)));
        }

        if (!await _roleManager.RoleExistsAsync(nameof(PlatformRole.OrgAdmin)))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(nameof(PlatformRole.OrgAdmin)));
        }

        var addToRoleResult = await _userManager.AddToRoleAsync(user, nameof(PlatformRole.OrgAdmin));
        if (!addToRoleResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", addToRoleResult.Errors.Select(x => x.Description)));
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        return await BuildAuthResponseAsync(user);
    }

    public async Task<EnterpriseLoginDiscoveryDto> DiscoverEnterpriseLoginAsync(EnterpriseLoginDiscoveryRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new InvalidOperationException("A valid work email is required.");
        }

        var domain = email.Split('@').Last().Trim().ToLowerInvariant();
        var discovery = await GetEnterpriseDiscoveryAsync(email, domain, cancellationToken);

        if (discovery is null)
        {
            return new EnterpriseLoginDiscoveryDto(email, domain, false, false, true, Array.Empty<EnterpriseIdentityProviderOptionDto>());
        }

        return new EnterpriseLoginDiscoveryDto(
            email,
            domain,
            discovery.Providers.Count > 0,
            discovery.AuthenticationMode == OrganizationAuthenticationMode.SsoRequired,
            discovery.AllowLocalPasswordSignIn,
            discovery.Providers
                .Select(x => new EnterpriseIdentityProviderOptionDto(
                    x.IdentityProviderId,
                    discovery.OrganizationId,
                    discovery.OrganizationName,
                    discovery.OrganizationSlug,
                    x.ProviderType.ToString(),
                    x.Name,
                    x.IsPrimary,
                    discovery.AuthenticationMode == OrganizationAuthenticationMode.SsoRequired,
                    discovery.AllowLocalPasswordSignIn))
                .ToList());
    }

    public async Task<EnterpriseAuthorizationUrlDto> InitiateEnterpriseLoginAsync(EnterpriseLoginInitiateRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            throw new InvalidOperationException("A valid work email is required.");
        }

        var domain = email.Split('@').Last().Trim().ToLowerInvariant();
        var discovery = await GetEnterpriseDiscoveryAsync(email, domain, cancellationToken)
            ?? throw new InvalidOperationException("No enterprise identity provider is configured for that organization.");

        var provider = discovery.Providers.SingleOrDefault(x => x.IdentityProviderId == request.IdentityProviderId && x.IsEnabled)
            ?? throw new InvalidOperationException("Requested identity provider is not enabled for this organization.");

        if (!_enterpriseOidcService.SupportsProvider(provider.ProviderType.ToString()))
        {
            throw new InvalidOperationException("Identity provider type is not yet supported.");
        }

        var session = new EnterpriseAuthSession
        {
            OrganizationId = discovery.OrganizationId,
            IdentityProviderId = provider.IdentityProviderId,
            ProviderType = provider.ProviderType.ToString(),
            StateToken = Convert.ToHexString(Guid.NewGuid().ToByteArray()).ToLowerInvariant(),
            ExchangeToken = Convert.ToHexString(Guid.NewGuid().ToByteArray()).ToLowerInvariant(),
            RedirectUri = $"{_enterpriseAuthOptions.ApiBaseUrl.TrimEnd('/')}/api/auth/enterprise/callback",
            ReturnUrl = string.IsNullOrWhiteSpace(request.ReturnUrl) ? $"{_enterpriseAuthOptions.FrontendBaseUrl.TrimEnd('/')}/auth/enterprise/callback" : request.ReturnUrl!,
            EmailHint = email,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(10)
        };

        _dbContext.EnterpriseAuthSessions.Add(session);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var authorizationRequest = await _enterpriseOidcService.BuildAuthorizationUrlAsync(provider, session, cancellationToken);
        return new EnterpriseAuthorizationUrlDto(authorizationRequest.Url, provider.ProviderType.ToString(), provider.Name);
    }

    public async Task<AuthResponseDto> ExchangeEnterpriseLoginAsync(EnterpriseLoginExchangeRequest request, CancellationToken cancellationToken)
    {
        var session = await _dbContext.EnterpriseAuthSessions
            .SingleOrDefaultAsync(x => x.ExchangeToken == request.ExchangeToken && x.CompletedAtUtc != null && x.ExpiresAtUtc > DateTime.UtcNow, cancellationToken)
            ?? throw new UnauthorizedAccessException("Enterprise sign-in session is not ready.");

        if (!session.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("Enterprise sign-in session does not have a resolved user.");
        }

        var user = await _userManager.Users.SingleAsync(x => x.Id == session.UserId.Value, cancellationToken);
        session.ExpiresAtUtc = DateTime.UtcNow.AddMinutes(-1);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(user);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new("full_name", user.FullName),
            new("organization_id", user.OrganizationId.ToString())
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes);

        var jwt = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        var organization = await _dbContext.Organizations.SingleAsync(x => x.Id == user.OrganizationId);
        return new AuthResponseDto(
            new JwtSecurityTokenHandler().WriteToken(jwt),
            expiresAtUtc,
            new UserProfileDto(user.Id, user.FullName, user.Email ?? string.Empty, roles.FirstOrDefault() ?? nameof(PlatformRole.TeamMember), user.OrganizationId, user.DefaultTeamId),
            organization.Slug);
    }

    public async Task<string> CompleteEnterpriseLoginAsync(string code, string state, CancellationToken cancellationToken)
    {
        var session = await _dbContext.EnterpriseAuthSessions
            .SingleOrDefaultAsync(x => x.StateToken == state && x.ExpiresAtUtc > DateTime.UtcNow && x.CompletedAtUtc == null, cancellationToken)
            ?? throw new UnauthorizedAccessException("Enterprise sign-in session is invalid or expired.");

        var provider = await _dbContext.OrganizationIdentityProviders
            .Where(x => x.Id == session.IdentityProviderId && x.OrganizationId == session.OrganizationId)
            .Select(x => new EnterpriseProviderOption(
                x.Id,
                x.Name,
                x.ProviderType,
                x.ClientId,
                x.ClientSecretReference,
                x.Authority,
                x.MetadataUrl,
                x.TenantIdentifier,
                SplitCsv(x.ScopesCsv),
                SplitCsv(x.DomainHintsCsv),
                x.IsPrimary,
                x.IsEnabled))
            .SingleAsync(cancellationToken);

        var principal = await _enterpriseOidcService.ExchangeCodeAsync(provider, session, code, cancellationToken);
        var user = await ResolveOrProvisionEnterpriseUserAsync(principal, cancellationToken);

        var link = await _dbContext.ExternalIdentityLinks
            .SingleOrDefaultAsync(x => x.OrganizationId == principal.OrganizationId && x.UserId == user.Id && x.ProviderType == principal.ProviderType, cancellationToken);

        if (link is null)
        {
            link = new ExternalIdentityLink
            {
                OrganizationId = principal.OrganizationId,
                UserId = user.Id,
                IdentityProviderId = principal.IdentityProviderId,
                ProviderType = principal.ProviderType,
                ExternalSubject = principal.Subject,
                ExternalEmail = principal.Email,
                ExternalDisplayName = principal.DisplayName,
                LinkedAtUtc = DateTime.UtcNow,
                LastSignInAtUtc = DateTime.UtcNow
            };
            _dbContext.ExternalIdentityLinks.Add(link);
        }
        else
        {
            link.ExternalSubject = principal.Subject;
            link.ExternalEmail = principal.Email;
            link.ExternalDisplayName = principal.DisplayName;
            link.LastSignInAtUtc = DateTime.UtcNow;
        }

        session.UserId = user.Id;
        session.ExternalSubject = principal.Subject;
        session.ExternalEmail = principal.Email;
        session.CompletedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return $"{session.ReturnUrl}?ticket={Uri.EscapeDataString(session.ExchangeToken)}";
    }

    private async Task<ApplicationUser> ResolveOrProvisionEnterpriseUserAsync(EnterprisePrincipal principal, CancellationToken cancellationToken)
    {
        var existingByLink = await _dbContext.ExternalIdentityLinks
            .Where(x => x.OrganizationId == principal.OrganizationId && x.ProviderType == principal.ProviderType && x.ExternalSubject == principal.Subject)
            .Select(x => x.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingByLink != Guid.Empty)
        {
            return await _userManager.Users.SingleAsync(x => x.Id == existingByLink, cancellationToken);
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(x => x.OrganizationId == principal.OrganizationId && x.Email == principal.Email, cancellationToken);
        if (user is not null)
        {
            return user;
        }

        var authSettings = await _dbContext.OrganizationAuthenticationSettings
            .SingleOrDefaultAsync(x => x.OrganizationId == principal.OrganizationId, cancellationToken);

        if (authSettings?.AllowJustInTimeProvisioning != true)
        {
            throw new UnauthorizedAccessException("This organization does not allow just-in-time enterprise provisioning.");
        }

        user = new ApplicationUser
        {
            OrganizationId = principal.OrganizationId,
            Email = principal.Email,
            UserName = principal.Email,
            EmailConfirmed = true,
            FullName = principal.DisplayName,
            JobTitle = "Enterprise User",
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user);
        if (!createResult.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(x => x.Description)));
        }

        if (!await _roleManager.RoleExistsAsync(nameof(PlatformRole.TeamMember)))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(nameof(PlatformRole.TeamMember)));
        }

        await _userManager.AddToRoleAsync(user, nameof(PlatformRole.TeamMember));
        return user;
    }

    private async Task<EnterpriseProviderDiscovery?> GetEnterpriseDiscoveryAsync(string email, string domain, CancellationToken cancellationToken)
    {
        var organizations = await _dbContext.Organizations
            .Where(x => x.Domain.ToLower() == domain)
            .Select(x => new { x.Id, x.Name, x.Slug })
            .ToListAsync(cancellationToken);

        var organization = organizations.FirstOrDefault();
        if (organization is null)
        {
            return null;
        }

        var authSettings = await _dbContext.OrganizationAuthenticationSettings
            .SingleOrDefaultAsync(x => x.OrganizationId == organization.Id, cancellationToken);

        var providers = await _dbContext.OrganizationIdentityProviders
            .Where(x => x.OrganizationId == organization.Id && x.IsEnabled)
            .OrderByDescending(x => x.IsPrimary)
            .ThenBy(x => x.Name)
            .Select(x => new EnterpriseProviderOption(
                x.Id,
                x.Name,
                x.ProviderType,
                x.ClientId,
                x.ClientSecretReference,
                x.Authority,
                x.MetadataUrl,
                x.TenantIdentifier,
                SplitCsv(x.ScopesCsv),
                SplitCsv(x.DomainHintsCsv),
                x.IsPrimary,
                x.IsEnabled))
            .ToListAsync(cancellationToken);

        return new EnterpriseProviderDiscovery(
            organization.Id,
            organization.Name,
            organization.Slug,
            authSettings?.AuthenticationMode ?? OrganizationAuthenticationMode.LocalOnly,
            authSettings?.AllowLocalPasswordSignIn ?? true,
            providers);
    }

    private static IReadOnlyCollection<string> SplitCsv(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? Array.Empty<string>()
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
