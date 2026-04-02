using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileSyncAndEnrichedUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExternalManagerIdentifier",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastDirectorySyncAtUtc",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ManagerUserId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OfficeLocation",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProfilePhotoUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "OrganizationProfileSyncSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IntegrationConnectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SyncJobTitles = table.Column<bool>(type: "boolean", nullable: false),
                    SyncDepartments = table.Column<bool>(type: "boolean", nullable: false),
                    SyncManagerHierarchy = table.Column<bool>(type: "boolean", nullable: false),
                    SyncOfficeLocation = table.Column<bool>(type: "boolean", nullable: false),
                    SyncProfilePhotos = table.Column<bool>(type: "boolean", nullable: false),
                    LastSyncedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationProfileSyncSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationProfileSyncSettings_OrganizationIntegrationConn~",
                        column: x => x.IntegrationConnectionId,
                        principalTable: "OrganizationIntegrationConnections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationProfileSyncSettings_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_OrganizationId_ManagerUserId",
                table: "AspNetUsers",
                columns: new[] { "OrganizationId", "ManagerUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProfileSyncSettings_IntegrationConnectionId",
                table: "OrganizationProfileSyncSettings",
                column: "IntegrationConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationProfileSyncSettings_OrganizationId_IntegrationC~",
                table: "OrganizationProfileSyncSettings",
                columns: new[] { "OrganizationId", "IntegrationConnectionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationProfileSyncSettings");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_OrganizationId_ManagerUserId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ExternalManagerIdentifier",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastDirectorySyncAtUtc",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ManagerUserId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "OfficeLocation",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ProfilePhotoUrl",
                table: "AspNetUsers");
        }
    }
}
