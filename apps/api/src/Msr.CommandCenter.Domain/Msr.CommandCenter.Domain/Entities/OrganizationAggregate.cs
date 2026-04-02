using Msr.CommandCenter.Domain.Common;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Domain.Entities;

public class Organization : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string BrandingPrimaryColor { get; set; } = "#1d4ed8";
    public string TimeZone { get; set; } = "America/New_York";
    public string DefaultCadence { get; set; } = "Monthly";
    public bool IsActive { get; set; } = true;
    public ICollection<Team> Teams { get; set; } = new List<Team>();
    public ICollection<Board> Boards { get; set; } = new List<Board>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<ReportingCycle> ReportingCycles { get; set; } = new List<ReportingCycle>();
    public ICollection<ReportTemplate> Templates { get; set; } = new List<ReportTemplate>();
    public OrganizationAuthenticationSettings? AuthenticationSettings { get; set; }
    public ICollection<OrganizationIdentityProvider> IdentityProviders { get; set; } = new List<OrganizationIdentityProvider>();
    public ICollection<OrganizationIntegrationConnection> IntegrationConnections { get; set; } = new List<OrganizationIntegrationConnection>();
    public ICollection<OrganizationVerifiedDomain> VerifiedDomains { get; set; } = new List<OrganizationVerifiedDomain>();
    public OrganizationProvisioningSettings? ProvisioningSettings { get; set; }
    public ICollection<OrganizationProvisioningJob> ProvisioningJobs { get; set; } = new List<OrganizationProvisioningJob>();
    public ICollection<OrganizationDirectoryGroupMapping> DirectoryGroupMappings { get; set; } = new List<OrganizationDirectoryGroupMapping>();
    public ICollection<OrganizationNotificationRoute> NotificationRoutes { get; set; } = new List<OrganizationNotificationRoute>();
    public ICollection<OrganizationExportDestination> ExportDestinations { get; set; } = new List<OrganizationExportDestination>();
    public ICollection<OrganizationCalendarSyncSetting> CalendarSyncSettings { get; set; } = new List<OrganizationCalendarSyncSetting>();
    public ICollection<ExternalIdentityLink> ExternalIdentityLinks { get; set; } = new List<ExternalIdentityLink>();
}

public class Team : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public Guid ManagerId { get; set; }
    public Organization? Organization { get; set; }
    public ICollection<TeamMembership> Memberships { get; set; } = new List<TeamMembership>();
    public ICollection<ReportingCycle> ReportingCycles { get; set; } = new List<ReportingCycle>();
    public ICollection<OrganizationDirectoryGroupMapping> DirectoryGroupMappings { get; set; } = new List<OrganizationDirectoryGroupMapping>();
    public ICollection<OrganizationCalendarSyncSetting> CalendarSyncSettings { get; set; } = new List<OrganizationCalendarSyncSetting>();
}

public class TeamMembership : TenantEntity
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LeftAtUtc { get; set; }
    public Team? Team { get; set; }
}

public class Project : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Workstream { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public ProjectHealth Health { get; set; } = ProjectHealth.OnTrack;
    public string Status { get; set; } = "Active";
    public ICollection<ProjectMembership> Members { get; set; } = new List<ProjectMembership>();
}

public class ProjectMembership : TenantEntity
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Contributor";
    public Project? Project { get; set; }
}

public class ReportTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string TemplateType { get; set; } = "MSR";
    public string RequiredSectionsJson { get; set; } = "[]";
    public string PromptQuestionsJson { get; set; } = "[]";
    public string DefaultBoardColumnsJson { get; set; } = "[]";
    public string BrandingJson { get; set; } = "{}";
}

public class FeatureFlag : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Enabled { get; set; }
    public Guid? OrganizationId { get; set; }
}
