using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Domain.Entities;

namespace Msr.CommandCenter.Infrastructure.Data;

public class MsrCommandCenterDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public MsrCommandCenterDbContext(DbContextOptions<MsrCommandCenterDbContext> options) : base(options)
    {
    }

    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMembership> TeamMemberships => Set<TeamMembership>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMembership> ProjectMemberships => Set<ProjectMembership>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
    public DbSet<WorkCard> Cards => Set<WorkCard>();
    public DbSet<CardAssignment> CardAssignments => Set<CardAssignment>();
    public DbSet<CardCollaborator> CardCollaborators => Set<CardCollaborator>();
    public DbSet<CardComment> CardComments => Set<CardComment>();
    public DbSet<CardAttachment> CardAttachments => Set<CardAttachment>();
    public DbSet<CardSubtask> CardSubtasks => Set<CardSubtask>();
    public DbSet<CardActivityLog> CardActivityLogs => Set<CardActivityLog>();
    public DbSet<ReportingCycle> ReportingCycles => Set<ReportingCycle>();
    public DbSet<ActivityEntry> ActivityEntries => Set<ActivityEntry>();
    public DbSet<PersonalMsr> PersonalMsrs => Set<PersonalMsr>();
    public DbSet<PersonalMsrVersion> PersonalMsrVersions => Set<PersonalMsrVersion>();
    public DbSet<TeamMsr> TeamMsrs => Set<TeamMsr>();
    public DbSet<TeamMsrVersion> TeamMsrVersions => Set<TeamMsrVersion>();
    public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<OrganizationInvitation> OrganizationInvitations => Set<OrganizationInvitation>();
    public DbSet<FeatureFlag> FeatureFlags => Set<FeatureFlag>();
    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();
    public DbSet<OrganizationAuthenticationSettings> OrganizationAuthenticationSettings => Set<OrganizationAuthenticationSettings>();
    public DbSet<OrganizationIdentityProvider> OrganizationIdentityProviders => Set<OrganizationIdentityProvider>();
    public DbSet<OrganizationIntegrationConnection> OrganizationIntegrationConnections => Set<OrganizationIntegrationConnection>();
    public DbSet<OrganizationVerifiedDomain> OrganizationVerifiedDomains => Set<OrganizationVerifiedDomain>();
    public DbSet<OrganizationProvisioningSettings> OrganizationProvisioningSettings => Set<OrganizationProvisioningSettings>();
    public DbSet<OrganizationProvisioningJob> OrganizationProvisioningJobs => Set<OrganizationProvisioningJob>();
    public DbSet<OrganizationDirectoryGroupMapping> OrganizationDirectoryGroupMappings => Set<OrganizationDirectoryGroupMapping>();
    public DbSet<OrganizationNotificationRoute> OrganizationNotificationRoutes => Set<OrganizationNotificationRoute>();
    public DbSet<ExternalIdentityLink> ExternalIdentityLinks => Set<ExternalIdentityLink>();
    public DbSet<EnterpriseAuthSession> EnterpriseAuthSessions => Set<EnterpriseAuthSession>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (entityType.FindProperty("CreatedAtUtc") is not null)
            {
                builder.Entity(entityType.ClrType).Property("CreatedAtUtc").HasDefaultValueSql("NOW()");
            }

            if (entityType.FindProperty("UpdatedAtUtc") is not null)
            {
                builder.Entity(entityType.ClrType).Property("UpdatedAtUtc").HasDefaultValueSql("NOW()");
            }
        }

        builder.Entity<Organization>().HasIndex(x => x.Slug).IsUnique();
        builder.Entity<ApplicationUser>().HasIndex(x => new { x.OrganizationId, x.Email });
        builder.Entity<ApplicationUser>().Property(x => x.ExternalEmployeeId).HasMaxLength(200);
        builder.Entity<TeamMembership>().HasIndex(x => new { x.TeamId, x.UserId }).IsUnique();
        builder.Entity<ProjectMembership>().HasIndex(x => new { x.ProjectId, x.UserId }).IsUnique();
        builder.Entity<Board>().HasIndex(x => new { x.OrganizationId, x.OwnerId, x.Name });
        builder.Entity<BoardColumn>().HasIndex(x => new { x.BoardId, x.Position }).IsUnique();
        builder.Entity<WorkCard>().HasIndex(x => new { x.OrganizationId, x.BoardId, x.ColumnId });
        builder.Entity<WorkCard>().HasIndex(x => new { x.OrganizationId, x.OwnerId, x.DueDateUtc });
        builder.Entity<WorkCard>().Property(x => x.Title).HasMaxLength(200);
        builder.Entity<CardComment>().Property(x => x.Body).HasMaxLength(4000);
        builder.Entity<Notification>().HasIndex(x => new { x.OrganizationId, x.UserId, x.ReadAtUtc });
        builder.Entity<AuditLog>().HasIndex(x => new { x.OrganizationId, x.CreatedAtUtc });
        builder.Entity<ReportingCycle>().HasIndex(x => new { x.OrganizationId, x.TeamId, x.StartDateUtc, x.EndDateUtc });
        builder.Entity<OrganizationInvitation>().HasIndex(x => x.Token).IsUnique();
        builder.Entity<RefreshSession>().HasIndex(x => x.Token).IsUnique();
        builder.Entity<OrganizationAuthenticationSettings>().HasIndex(x => x.OrganizationId).IsUnique();
        builder.Entity<OrganizationIdentityProvider>().HasIndex(x => new { x.OrganizationId, x.ProviderType, x.Name }).IsUnique();
        builder.Entity<OrganizationIntegrationConnection>().HasIndex(x => new { x.OrganizationId, x.ProviderType, x.Name }).IsUnique();
        builder.Entity<OrganizationVerifiedDomain>().HasIndex(x => new { x.OrganizationId, x.Domain }).IsUnique();
        builder.Entity<OrganizationProvisioningSettings>().HasIndex(x => x.OrganizationId).IsUnique();
        builder.Entity<OrganizationProvisioningJob>().HasIndex(x => new { x.OrganizationId, x.StartedAtUtc });
        builder.Entity<OrganizationDirectoryGroupMapping>().HasIndex(x => new { x.OrganizationId, x.IdentityProviderId, x.ExternalGroupId }).IsUnique();
        builder.Entity<OrganizationDirectoryGroupMapping>().HasIndex(x => new { x.OrganizationId, x.TeamId, x.ExternalGroupName });
        builder.Entity<OrganizationNotificationRoute>().HasIndex(x => new { x.OrganizationId, x.IntegrationConnectionId, x.NotificationType, x.DestinationReference }).IsUnique();
        builder.Entity<ExternalIdentityLink>().HasIndex(x => new { x.OrganizationId, x.ProviderType, x.ExternalSubject }).IsUnique();
        builder.Entity<ExternalIdentityLink>().HasIndex(x => new { x.OrganizationId, x.UserId, x.ProviderType }).IsUnique();
        builder.Entity<EnterpriseAuthSession>().HasIndex(x => x.StateToken).IsUnique();
        builder.Entity<EnterpriseAuthSession>().HasIndex(x => x.ExchangeToken).IsUnique();

        builder.Entity<Organization>()
            .HasOne(x => x.AuthenticationSettings)
            .WithOne(x => x.Organization)
            .HasForeignKey<OrganizationAuthenticationSettings>(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.IdentityProviders)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.IntegrationConnections)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.VerifiedDomains)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasOne(x => x.ProvisioningSettings)
            .WithOne(x => x.Organization)
            .HasForeignKey<OrganizationProvisioningSettings>(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.ProvisioningJobs)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.DirectoryGroupMappings)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.NotificationRoutes)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Organization>()
            .HasMany(x => x.ExternalIdentityLinks)
            .WithOne(x => x.Organization)
            .HasForeignKey(x => x.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ExternalIdentityLink>()
            .HasOne(x => x.IdentityProvider)
            .WithMany()
            .HasForeignKey(x => x.IdentityProviderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<OrganizationDirectoryGroupMapping>()
            .HasOne(x => x.IdentityProvider)
            .WithMany()
            .HasForeignKey(x => x.IdentityProviderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<OrganizationDirectoryGroupMapping>()
            .HasOne(x => x.Team)
            .WithMany(x => x.DirectoryGroupMappings)
            .HasForeignKey(x => x.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<OrganizationNotificationRoute>()
            .HasOne(x => x.IntegrationConnection)
            .WithMany()
            .HasForeignKey(x => x.IntegrationConnectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Board>()
            .HasMany(x => x.Columns)
            .WithOne(x => x.Board)
            .HasForeignKey(x => x.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Board>()
            .HasMany(x => x.Cards)
            .WithOne(x => x.Board)
            .HasForeignKey(x => x.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkCard>()
            .HasMany(x => x.Assignments)
            .WithOne(x => x.Card)
            .HasForeignKey(x => x.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkCard>()
            .HasMany(x => x.Collaborators)
            .WithOne(x => x.Card)
            .HasForeignKey(x => x.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkCard>()
            .HasMany(x => x.Comments)
            .WithOne(x => x.Card)
            .HasForeignKey(x => x.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkCard>()
            .HasMany(x => x.Subtasks)
            .WithOne(x => x.Card)
            .HasForeignKey(x => x.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<WorkCard>()
            .HasMany(x => x.ActivityLogs)
            .WithOne(x => x.Card)
            .HasForeignKey(x => x.CardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PersonalMsr>()
            .HasMany(x => x.Versions)
            .WithOne(x => x.PersonalMsr)
            .HasForeignKey(x => x.PersonalMsrId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<TeamMsr>()
            .HasMany(x => x.Versions)
            .WithOne(x => x.TeamMsr)
            .HasForeignKey(x => x.TeamMsrId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(x => x.Entity is not null && x.State is EntityState.Modified or EntityState.Added);

        foreach (var entry in entries)
        {
            if (entry.Properties.Any(x => x.Metadata.Name == "UpdatedAtUtc"))
            {
                entry.Property("UpdatedAtUtc").CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
