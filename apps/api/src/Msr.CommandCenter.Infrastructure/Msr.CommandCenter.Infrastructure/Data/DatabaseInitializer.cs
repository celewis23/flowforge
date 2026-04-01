using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Domain.Entities;
using Msr.CommandCenter.Domain.Enums;

namespace Msr.CommandCenter.Infrastructure.Data;

public class DatabaseInitializer
{
    private readonly MsrCommandCenterDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public DatabaseInitializer(
        MsrCommandCenterDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        if (_dbContext.Database.IsRelational())
        {
            await _dbContext.Database.MigrateAsync(cancellationToken);
        }
        else
        {
            await _dbContext.Database.EnsureCreatedAsync(cancellationToken);
        }

        foreach (var role in Enum.GetNames<PlatformRole>())
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        if (await _dbContext.Organizations.AnyAsync(cancellationToken))
        {
            return;
        }

        var organization = new Organization
        {
            Id = DemoIds.OrganizationId,
            Name = "Demo Manufacturing Systems",
            Slug = "demo-manufacturing",
            Domain = "demo.example.com",
            DefaultCadence = "Monthly",
            BrandingPrimaryColor = "#0f766e"
        };

        var teamAlpha = new Team
        {
            Id = DemoIds.TeamAlphaId,
            OrganizationId = organization.Id,
            Name = "Operations Excellence",
            Department = "Operations",
            ManagerId = DemoIds.ManagerAId
        };

        var teamBeta = new Team
        {
            Id = DemoIds.TeamBetaId,
            OrganizationId = organization.Id,
            Name = "Customer Delivery",
            Department = "Delivery",
            ManagerId = DemoIds.ManagerBId
        };

        _dbContext.Organizations.Add(organization);
        _dbContext.Teams.AddRange(teamAlpha, teamBeta);

        var users = BuildUsers(organization.Id);
        foreach (var user in users)
        {
            await _userManager.CreateAsync(user, "Passw0rd!");
        }

        await AddRoleAsync(DemoIds.PlatformAdminId, nameof(PlatformRole.PlatformAdmin));
        await AddRoleAsync(DemoIds.OrgAdminId, nameof(PlatformRole.OrgAdmin));
        await AddRoleAsync(DemoIds.ManagerAId, nameof(PlatformRole.Manager));
        await AddRoleAsync(DemoIds.ManagerBId, nameof(PlatformRole.Manager));
        await AddRoleAsync(DemoIds.ViewerId, nameof(PlatformRole.ExecutiveViewer));

        foreach (var teamMemberId in users.Where(x => x.Id != DemoIds.PlatformAdminId &&
                                                      x.Id != DemoIds.OrgAdminId &&
                                                      x.Id != DemoIds.ManagerAId &&
                                                      x.Id != DemoIds.ManagerBId &&
                                                      x.Id != DemoIds.ViewerId)
                                          .Select(x => x.Id))
        {
            await AddRoleAsync(teamMemberId, nameof(PlatformRole.TeamMember));
        }

        var memberships = users
            .Where(x => x.DefaultTeamId.HasValue)
            .Select(x => new TeamMembership
            {
                OrganizationId = organization.Id,
                TeamId = x.DefaultTeamId!.Value,
                UserId = x.Id,
                Title = x.JobTitle
            })
            .ToList();

        _dbContext.TeamMemberships.AddRange(memberships);

        var projects = new[]
        {
            new Project
            {
                OrganizationId = organization.Id,
                Name = "Plant Digitization",
                Workstream = "Smart Factory",
                Description = "Rollout of the production telemetry dashboard.",
                OwnerId = DemoIds.ManagerAId,
                Health = ProjectHealth.OnTrack
            },
            new Project
            {
                OrganizationId = organization.Id,
                Name = "On-Time Delivery Recovery",
                Workstream = "Customer Operations",
                Description = "Reduce delayed customer shipments across key accounts.",
                OwnerId = DemoIds.ManagerBId,
                Health = ProjectHealth.AtRisk
            },
            new Project
            {
                OrganizationId = organization.Id,
                Name = "Q2 Cost Takeout",
                Workstream = "Lean Ops",
                Description = "Cross-functional cost reduction plan across sites.",
                OwnerId = DemoIds.OrgAdminId,
                Health = ProjectHealth.OnTrack
            }
        };

        _dbContext.Projects.AddRange(projects);

        var cycle = new ReportingCycle
        {
            OrganizationId = organization.Id,
            TeamId = teamAlpha.Id,
            Name = "March 2026 MSR",
            Cadence = "Monthly",
            StartDateUtc = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDateUtc = new DateTime(2026, 3, 31, 23, 59, 0, DateTimeKind.Utc),
            DueDateUtc = new DateTime(2026, 4, 3, 12, 0, 0, DateTimeKind.Utc),
            SubmissionDeadlineUtc = new DateTime(2026, 4, 4, 0, 0, 0, DateTimeKind.Utc),
            Status = ReportingCycleStatus.PendingReview
        };

        _dbContext.ReportingCycles.Add(cycle);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var boardColumns = new[]
        {
            ("Backlog", "#94a3b8"),
            ("To Do", "#2563eb"),
            ("In Progress", "#f59e0b"),
            ("Blocked", "#dc2626"),
            ("Review", "#7c3aed"),
            ("Done", "#16a34a")
        };

        var boardOwners = users.Where(x => x.DefaultTeamId.HasValue).Take(10).ToList();
        foreach (var owner in boardOwners)
        {
            var board = new Board
            {
                OrganizationId = organization.Id,
                OwnerId = owner.Id,
                TeamId = owner.DefaultTeamId,
                Name = $"{owner.FullName.Split(' ')[0]}'s Board",
                IsDefault = true
            };
            _dbContext.Boards.Add(board);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var columns = boardColumns.Select((x, index) => new BoardColumn
            {
                OrganizationId = organization.Id,
                BoardId = board.Id,
                Name = x.Item1,
                Color = x.Item2,
                Position = index
            }).ToList();

            _dbContext.BoardColumns.AddRange(columns);
            await _dbContext.SaveChangesAsync(cancellationToken);

            var doneColumn = columns.Single(x => x.Name == "Done");
            var progressColumn = columns.Single(x => x.Name == "In Progress");
            var blockedColumn = columns.Single(x => x.Name == "Blocked");

            _dbContext.Cards.AddRange(
                new WorkCard
                {
                    OrganizationId = organization.Id,
                    BoardId = board.Id,
                    ColumnId = progressColumn.Id,
                    OwnerId = owner.Id,
                    ProjectId = projects[0].Id,
                    ReportingCycleId = cycle.Id,
                    Title = $"Advance telemetry integration for {owner.FullName}",
                    Description = "Coordinate plant telemetry event capture and validation.",
                    Instructions = "Close the site data gaps and document blockers.",
                    TagsCsv = "telemetry,plant,data",
                    SearchText = "telemetry plant data",
                    Priority = CardPriority.High,
                    AssignmentState = AssignmentState.InProgress,
                    DueDateUtc = DateTime.UtcNow.AddDays(3),
                    LastMovedAtUtc = DateTime.UtcNow.AddDays(-1)
                },
                new WorkCard
                {
                    OrganizationId = organization.Id,
                    BoardId = board.Id,
                    ColumnId = blockedColumn.Id,
                    OwnerId = owner.Id,
                    ProjectId = projects[1].Id,
                    ReportingCycleId = cycle.Id,
                    Title = $"Resolve shipping blocker for {owner.FullName}",
                    Description = "Blocked on partner ETA data from logistics vendor.",
                    Instructions = "Escalate if unchanged for 48 hours.",
                    TagsCsv = "shipping,blocked,eta",
                    SearchText = "shipping blocked eta",
                    Priority = CardPriority.Critical,
                    AssignmentState = AssignmentState.Blocked,
                    DueDateUtc = DateTime.UtcNow.AddDays(1),
                    LastMovedAtUtc = DateTime.UtcNow.AddDays(-2)
                },
                new WorkCard
                {
                    OrganizationId = organization.Id,
                    BoardId = board.Id,
                    ColumnId = doneColumn.Id,
                    OwnerId = owner.Id,
                    ProjectId = projects[2].Id,
                    ReportingCycleId = cycle.Id,
                    Title = $"Complete lean review for {owner.FullName}",
                    Description = "Published line balancing recommendations.",
                    Instructions = "Summarize in personal MSR.",
                    TagsCsv = "lean,cost,review",
                    SearchText = "lean cost review",
                    Priority = CardPriority.Medium,
                    AssignmentState = AssignmentState.Done,
                    DueDateUtc = DateTime.UtcNow.AddDays(-3),
                    CompletedAtUtc = DateTime.UtcNow.AddDays(-1),
                    LastMovedAtUtc = DateTime.UtcNow.AddDays(-1)
                });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var sampleCards = await _dbContext.Cards.Take(4).ToListAsync(cancellationToken);
        foreach (var card in sampleCards)
        {
            _dbContext.CardAssignments.Add(new CardAssignment
            {
                OrganizationId = organization.Id,
                CardId = card.Id,
                AssignedById = card.OwnerId == boardOwners.First().Id ? DemoIds.ManagerAId : DemoIds.ManagerBId,
                AssignedToId = card.OwnerId,
                CurrentOwnerId = card.OwnerId,
                State = card.AssignmentState,
                AcknowledgedAtUtc = DateTime.UtcNow.AddDays(-2)
            });

            _dbContext.CardCollaborators.Add(new CardCollaborator
            {
                OrganizationId = organization.Id,
                CardId = card.Id,
                UserId = boardOwners.Last().Id,
                Role = "Reviewer"
            });

            _dbContext.CardComments.Add(new CardComment
            {
                OrganizationId = organization.Id,
                CardId = card.Id,
                AuthorId = DemoIds.ManagerAId,
                Body = "Please capture the blocker clearly for the cycle report."
            });

            _dbContext.CardSubtasks.Add(new CardSubtask
            {
                OrganizationId = organization.Id,
                CardId = card.Id,
                AssigneeId = card.OwnerId,
                Title = "Update stakeholder note",
                IsCompleted = card.AssignmentState == AssignmentState.Done
            });

            _dbContext.CardActivityLogs.Add(new CardActivityLog
            {
                OrganizationId = organization.Id,
                CardId = card.Id,
                PerformedById = card.OwnerId,
                EventType = "CardUpdated",
                Description = "Card seeded with current workflow state."
            });
        }

        foreach (var member in boardOwners.Take(6))
        {
            _dbContext.ActivityEntries.AddRange(
                new ActivityEntry
                {
                    OrganizationId = organization.Id,
                    TeamId = teamAlpha.Id,
                    UserId = member.Id,
                    ReportingCycleId = cycle.Id,
                    EntryType = ActivityEntryType.Accomplishment,
                    Title = "Key win",
                    Content = "Closed a major workflow bottleneck in the monthly production report.",
                    IncludeInMsr = true
                },
                new ActivityEntry
                {
                    OrganizationId = organization.Id,
                    TeamId = teamAlpha.Id,
                    UserId = member.Id,
                    ReportingCycleId = cycle.Id,
                    EntryType = ActivityEntryType.Blocker,
                    Title = "Current blocker",
                    Content = "Waiting on external vendor timeline confirmation."
                });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        foreach (var member in boardOwners.Take(4))
        {
            var personalMsr = new PersonalMsr
            {
                OrganizationId = organization.Id,
                TeamId = teamAlpha.Id,
                UserId = member.Id,
                ReportingCycleId = cycle.Id,
                Status = MsrStatus.Submitted,
                GeneratedSummary = $"Accomplishments: closed line review items for {member.FullName}. Current work: telemetry integration.",
                EditedSummary = $"Delivered lean review updates and coordinated telemetry follow-ups for {member.FullName}.",
                SubmittedSummary = $"Delivered lean review updates and coordinated telemetry follow-ups for {member.FullName}. Current blocker is vendor ETA visibility.",
                SubmittedAtUtc = DateTime.UtcNow.AddDays(-1)
            };
            _dbContext.PersonalMsrs.Add(personalMsr);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _dbContext.PersonalMsrVersions.Add(new PersonalMsrVersion
            {
                OrganizationId = organization.Id,
                PersonalMsrId = personalMsr.Id,
                ChangedById = member.Id,
                VersionLabel = "v1",
                Snapshot = personalMsr.SubmittedSummary
            });
        }

        var teamMsr = new TeamMsr
        {
            OrganizationId = organization.Id,
            TeamId = teamAlpha.Id,
            ReportingCycleId = cycle.Id,
            Status = MsrStatus.Finalized,
            ExecutiveSummary = "Operations Excellence improved reporting discipline, reduced stale work, and surfaced repeat blockers around vendor ETA data.",
            DetailedSummary = "The team closed multiple lean operations improvements, moved telemetry work forward, and identified a recurring shipping dependency that remains at risk.",
            ManagerNotes = "Use this report as the baseline for the April operating review.",
            FinalizedAtUtc = DateTime.UtcNow.AddHours(-12),
            FinalizedById = DemoIds.ManagerAId
        };

        _dbContext.TeamMsrs.Add(teamMsr);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _dbContext.TeamMsrVersions.Add(new TeamMsrVersion
        {
            OrganizationId = organization.Id,
            TeamMsrId = teamMsr.Id,
            ChangedById = DemoIds.ManagerAId,
            VersionLabel = "final",
            Snapshot = teamMsr.DetailedSummary
        });

        _dbContext.Notifications.AddRange(
            new Notification
            {
                OrganizationId = organization.Id,
                UserId = DemoIds.ManagerAId,
                Type = NotificationType.Report,
                Channel = NotificationChannel.InApp,
                Title = "Team MSR finalized",
                Message = "March 2026 team MSR is locked and ready for distribution.",
                Link = $"/reports/team/{teamMsr.Id}"
            },
            new Notification
            {
                OrganizationId = organization.Id,
                UserId = boardOwners.First().Id,
                Type = NotificationType.Assignment,
                Channel = NotificationChannel.InApp,
                Title = "New manager assignment",
                Message = "A high-priority delivery recovery item was added to your board.",
                Link = "/my-board"
            });

        _dbContext.ReportTemplates.Add(new ReportTemplate
        {
            OrganizationId = organization.Id,
            Name = "Default Monthly MSR",
            TemplateType = "MSR",
            RequiredSectionsJson = """["Accomplishments","Current Work","Blockers","Upcoming Work","Manager Priorities","Collaborative Contributions"]""",
            PromptQuestionsJson = """["What moved forward this cycle?","What is blocked?","What needs manager support next?"]""",
            DefaultBoardColumnsJson = """["Backlog","To Do","In Progress","Blocked","Review","Done"]""",
            BrandingJson = """{"logoText":"Demo Manufacturing Systems","accentColor":"#0f766e"}"""
        });

        _dbContext.AuditLogs.Add(new AuditLog
        {
            OrganizationId = organization.Id,
            UserId = DemoIds.ManagerAId,
            Action = "SeedCompleted",
            EntityName = "Organization",
            EntityId = organization.Id.ToString(),
            Details = "Initial demo environment created.",
            CorrelationId = "seed-001",
            IpAddress = "127.0.0.1"
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task AddRoleAsync(Guid userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is not null && !await _userManager.IsInRoleAsync(user, role))
        {
            await _userManager.AddToRoleAsync(user, role);
        }
    }

    private static List<ApplicationUser> BuildUsers(Guid organizationId)
    {
        var users = new List<ApplicationUser>
        {
            new() { Id = DemoIds.PlatformAdminId, FullName = "Priya Platform", Email = "platform.admin@demo.example.com", UserName = "platform.admin@demo.example.com", OrganizationId = organizationId, JobTitle = "Platform Administrator" },
            new() { Id = DemoIds.OrgAdminId, FullName = "Olivia Orgadmin", Email = "org.admin@demo.example.com", UserName = "org.admin@demo.example.com", OrganizationId = organizationId, JobTitle = "Org Administrator" },
            new() { Id = DemoIds.ManagerAId, FullName = "Marcus Reed", Email = "marcus.reed@demo.example.com", UserName = "marcus.reed@demo.example.com", OrganizationId = organizationId, DefaultTeamId = DemoIds.TeamAlphaId, JobTitle = "Operations Manager" },
            new() { Id = DemoIds.ManagerBId, FullName = "Nina Patel", Email = "nina.patel@demo.example.com", UserName = "nina.patel@demo.example.com", OrganizationId = organizationId, DefaultTeamId = DemoIds.TeamBetaId, JobTitle = "Delivery Manager" },
            new() { Id = DemoIds.ViewerId, FullName = "Evan Executive", Email = "executive.viewer@demo.example.com", UserName = "executive.viewer@demo.example.com", OrganizationId = organizationId, JobTitle = "Executive Viewer" }
        };

        for (var i = 1; i <= 8; i++)
        {
            users.Add(new ApplicationUser
            {
                Id = Guid.Parse($"22222222-2222-2222-2222-{i.ToString().PadLeft(12, '0')}"),
                FullName = $"Team Member {i}",
                Email = $"team.member{i}@demo.example.com",
                UserName = $"team.member{i}@demo.example.com",
                OrganizationId = organizationId,
                DefaultTeamId = i <= 4 ? DemoIds.TeamAlphaId : DemoIds.TeamBetaId,
                JobTitle = i <= 4 ? "Operations Specialist" : "Delivery Specialist"
            });
        }

        return users;
    }
}
