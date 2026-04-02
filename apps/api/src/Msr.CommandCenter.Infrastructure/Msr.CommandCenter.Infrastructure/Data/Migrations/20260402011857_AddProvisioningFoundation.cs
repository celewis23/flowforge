using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProvisioningFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationProvisioningJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityProviderId = table.Column<Guid>(type: "uuid", nullable: true),
                    SyncMode = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TriggeredBy = table.Column<string>(type: "text", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    UsersProcessed = table.Column<int>(type: "integer", nullable: false),
                    UsersCreated = table.Column<int>(type: "integer", nullable: false),
                    UsersUpdated = table.Column<int>(type: "integer", nullable: false),
                    UsersDeactivated = table.Column<int>(type: "integer", nullable: false),
                    ErrorDetails = table.Column<string>(type: "text", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationProvisioningJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationProvisioningJobs_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationProvisioningSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SyncMode = table.Column<int>(type: "integer", nullable: false),
                    IdentityProviderId = table.Column<Guid>(type: "uuid", nullable: true),
                    AutoProvisionNewUsers = table.Column<bool>(type: "boolean", nullable: false),
                    AutoDeactivateMissingUsers = table.Column<bool>(type: "boolean", nullable: false),
                    GroupMappingStrategy = table.Column<string>(type: "text", nullable: false),
                    ScimBaseUrl = table.Column<string>(type: "text", nullable: false),
                    ScimSecretReference = table.Column<string>(type: "text", nullable: false),
                    LastSyncAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "text", nullable: false),
                    LastSyncError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationProvisioningSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationProvisioningSettings_Organizations_Organization~",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProvisioningJobs_OrganizationId_StartedAtUtc",
                table: "OrganizationProvisioningJobs",
                columns: new[] { "OrganizationId", "StartedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProvisioningSettings_OrganizationId",
                table: "OrganizationProvisioningSettings",
                column: "OrganizationId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationProvisioningJobs");

            migrationBuilder.DropTable(
                name: "OrganizationProvisioningSettings");
        }
    }
}
