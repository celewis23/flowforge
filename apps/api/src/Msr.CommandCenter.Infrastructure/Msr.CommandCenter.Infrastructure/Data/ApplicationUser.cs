using Microsoft.AspNetCore.Identity;

namespace Msr.CommandCenter.Infrastructure.Data;

public class ApplicationUser : IdentityUser<Guid>
{
    public Guid OrganizationId { get; set; }
    public Guid? DefaultTeamId { get; set; }
    public Guid? ManagerUserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string OfficeLocation { get; set; } = string.Empty;
    public string ProfilePhotoUrl { get; set; } = string.Empty;
    public string ExternalManagerIdentifier { get; set; } = string.Empty;
    public DateTime? LastDirectorySyncAtUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public string ExternalEmployeeId { get; set; } = string.Empty;
}
