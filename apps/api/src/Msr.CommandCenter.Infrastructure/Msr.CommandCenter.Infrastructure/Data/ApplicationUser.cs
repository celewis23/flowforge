using Microsoft.AspNetCore.Identity;

namespace Msr.CommandCenter.Infrastructure.Data;

public class ApplicationUser : IdentityUser<Guid>
{
    public Guid OrganizationId { get; set; }
    public Guid? DefaultTeamId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
