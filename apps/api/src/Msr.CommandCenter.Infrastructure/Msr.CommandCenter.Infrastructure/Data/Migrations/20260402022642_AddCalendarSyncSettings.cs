using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarSyncSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationCalendarSyncSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IntegrationConnectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    CalendarReference = table.Column<string>(type: "text", nullable: false),
                    CalendarLabel = table.Column<string>(type: "text", nullable: false),
                    DefaultReminderOffsetsCsv = table.Column<string>(type: "text", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SyncAllTeams = table.Column<bool>(type: "boolean", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: true),
                    LastSyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationCalendarSyncSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationCalendarSyncSettings_OrganizationIntegrationCon~",
                        column: x => x.IntegrationConnectionId,
                        principalTable: "OrganizationIntegrationConnections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationCalendarSyncSettings_Organizations_Organization~",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationCalendarSyncSettings_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationCalendarSyncSettings_IntegrationConnectionId",
                table: "OrganizationCalendarSyncSettings",
                column: "IntegrationConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationCalendarSyncSettings_OrganizationId_Integration~",
                table: "OrganizationCalendarSyncSettings",
                columns: new[] { "OrganizationId", "IntegrationConnectionId", "EventType", "CalendarReference", "TeamId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationCalendarSyncSettings_TeamId",
                table: "OrganizationCalendarSyncSettings",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationCalendarSyncSettings");
        }
    }
}
