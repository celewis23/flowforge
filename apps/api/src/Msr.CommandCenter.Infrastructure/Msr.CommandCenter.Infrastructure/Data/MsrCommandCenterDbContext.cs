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
