using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationRoutes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrganizationNotificationRoutes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IntegrationConnectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    NotificationType = table.Column<int>(type: "integer", nullable: false),
                    TargetType = table.Column<int>(type: "integer", nullable: false),
                    DestinationReference = table.Column<string>(type: "text", nullable: false),
                    DestinationLabel = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SendDailyDigest = table.Column<bool>(type: "boolean", nullable: false),
                    LastDeliveredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastDeliveryError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationNotificationRoutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationNotificationRoutes_OrganizationIntegrationConne~",
                        column: x => x.IntegrationConnectionId,
                        principalTable: "OrganizationIntegrationConnections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganizationNotificationRoutes_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationNotificationRoutes_IntegrationConnectionId",
                table: "OrganizationNotificationRoutes",
                column: "IntegrationConnectionId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationNotificationRoutes_OrganizationId_IntegrationCo~",
                table: "OrganizationNotificationRoutes",
                columns: new[] { "OrganizationId", "IntegrationConnectionId", "NotificationType", "DestinationReference" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrganizationNotificationRoutes");
        }
    }
}
