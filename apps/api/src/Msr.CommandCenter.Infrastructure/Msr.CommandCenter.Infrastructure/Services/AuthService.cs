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

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        MsrCommandCenterDbContext dbContext,
        IOptions<JwtOptions> jwtOptions)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _jwtOptions = jwtOptions.Value;
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
}
