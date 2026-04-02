using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDirectoryGroupMappings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationDirectoryGroupMappings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityProviderId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalGroupId = table.Column<string>(type: "text", nullable: false),
                    ExternalGroupName = table.Column<string>(type: "text", nullable: false),
                    DefaultRole = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SyncMembers = table.Column<bool>(type: "boolean", nullable: false),
                    LastSyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationDirectoryGroupMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationDirectoryGroupMappings_OrganizationIdentityProv~",
                        column: x => x.IdentityProviderId,
                        principalTable: "OrganizationIdentityProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationDirectoryGroupMappings_Organizations_Organizati~",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationDirectoryGroupMappings_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDirectoryGroupMappings_IdentityProviderId",
                table: "OrganizationDirectoryGroupMappings",
                column: "IdentityProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDirectoryGroupMappings_OrganizationId_IdentityP~",
                table: "OrganizationDirectoryGroupMappings",
                columns: new[] { "OrganizationId", "IdentityProviderId", "ExternalGroupId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDirectoryGroupMappings_OrganizationId_TeamId_Ex~",
                table: "OrganizationDirectoryGroupMappings",
                columns: new[] { "OrganizationId", "TeamId", "ExternalGroupName" });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationDirectoryGroupMappings_TeamId",
                table: "OrganizationDirectoryGroupMappings",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationDirectoryGroupMappings");
        }
    }
}
