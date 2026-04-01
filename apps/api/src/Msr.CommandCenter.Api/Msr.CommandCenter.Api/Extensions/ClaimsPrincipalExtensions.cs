using System.Security.Claims;

namespace Msr.CommandCenter.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub") ?? throw new InvalidOperationException("Missing user id claim."));

    public static Guid GetOrganizationId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue("organization_id") ?? throw new InvalidOperationException("Missing organization claim."));
}
