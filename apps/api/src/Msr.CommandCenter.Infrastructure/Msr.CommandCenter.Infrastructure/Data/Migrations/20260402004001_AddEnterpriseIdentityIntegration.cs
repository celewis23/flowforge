using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Msr.CommandCenter.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddEnterpriseIdentityIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalEmployeeId",
                table: "AspNetUsers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "EnterpriseAuthSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityProviderId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProviderType = table.Column<string>(type: "text", nullable: false),
                    StateToken = table.Column<string>(type: "text", nullable: false),
                    CodeVerifier = table.Column<string>(type: "text", nullable: false),
                    RedirectUri = table.Column<string>(type: "text", nullable: false),
                    ReturnUrl = table.Column<string>(type: "text", nullable: false),
                    EmailHint = table.Column<string>(type: "text", nullable: false),
                    ExternalSubject = table.Column<string>(type: "text", nullable: false),
                    ExternalEmail = table.Column<string>(type: "text", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExchangeToken = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnterpriseAuthSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationAuthenticationSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthenticationMode = table.Column<int>(type: "integer", nullable: false),
                    AllowLocalPasswordSignIn = table.Column<bool>(type: "boolean", nullable: false),
                    RequireMfaByDefault = table.Column<bool>(type: "boolean", nullable: false),
                    AllowJustInTimeProvisioning = table.Column<bool>(type: "boolean", nullable: false),
                    EnforceDomainVerification = table.Column<bool>(type: "boolean", nullable: false),
                    AllowedDomainsCsv = table.Column<string>(type: "text", nullable: false),
                    DefaultIdentityProviderId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationAuthenticationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationAuthenticationSettings_Organizations_Organizati~",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationIdentityProviders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProviderType = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<string>(type: "text", nullable: false),
                    ClientSecretReference = table.Column<string>(type: "text", nullable: false),
                    Authority = table.Column<string>(type: "text", nullable: false),
                    MetadataUrl = table.Column<string>(type: "text", nullable: false),
                    TenantIdentifier = table.Column<string>(type: "text", nullable: false),
                    ScopesCsv = table.Column<string>(type: "text", nullable: false),
                    DomainHintsCsv = table.Column<string>(type: "text", nullable: false),
                    RoleMappingsJson = table.Column<string>(type: "text", nullable: false),
                    ProvisioningMode = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    LastValidatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationIdentityProviders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationIdentityProviders_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrganizationIntegrationConnections",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProviderType = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<string>(type: "text", nullable: false),
                    ClientSecretReference = table.Column<string>(type: "text", nullable: false),
                    TenantIdentifier = table.Column<string>(type: "text", nullable: false),
                    ScopesCsv = table.Column<string>(type: "text", nullable: false),
                    ConfigurationJson = table.Column<string>(type: "text", nullable: false),
                    LastValidatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastError = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganizationIntegrationConnections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganizationIntegrationConnections_Organizations_Organizati~",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExternalIdentityLinks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentityProviderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProviderType = table.Column<int>(type: "integer", nullable: false),
                    ExternalSubject = table.Column<string>(type: "text", nullable: false),
                    ExternalEmail = table.Column<string>(type: "text", nullable: false),
                    ExternalDisplayName = table.Column<string>(type: "text", nullable: false),
                    LinkedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSignInAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalIdentityLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExternalIdentityLinks_OrganizationIdentityProviders_Identit~",
                        column: x => x.IdentityProviderId,
                        principalTable: "OrganizationIdentityProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ExternalIdentityLinks_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnterpriseAuthSessions_ExchangeToken",
                table: "EnterpriseAuthSessions",
                column: "ExchangeToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EnterpriseAuthSessions_StateToken",
                table: "EnterpriseAuthSessions",
                column: "StateToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalIdentityLinks_IdentityProviderId",
                table: "ExternalIdentityLinks",
                column: "IdentityProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalIdentityLinks_OrganizationId_ProviderType_ExternalS~",
                table: "ExternalIdentityLinks",
                columns: new[] { "OrganizationId", "ProviderType", "ExternalSubject" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExternalIdentityLinks_OrganizationId_UserId_ProviderType",
                table: "ExternalIdentityLinks",
                columns: new[] { "OrganizationId", "UserId", "ProviderType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationAuthenticationSettings_OrganizationId",
                table: "OrganizationAuthenticationSettings",
                column: "OrganizationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationIdentityProviders_OrganizationId_ProviderType_N~",
                table: "OrganizationIdentityProviders",
                columns: new[] { "OrganizationId", "ProviderType", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrganizationIntegrationConnections_OrganizationId_ProviderT~",
                table: "OrganizationIntegrationConnections",
                columns: new[] { "OrganizationId", "ProviderType", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnterpriseAuthSessions");

            migrationBuilder.DropTable(
                name: "ExternalIdentityLinks");

            migrationBuilder.DropTable(
                name: "OrganizationAuthenticationSettings");

            migrationBuilder.DropTable(
                name: "OrganizationIntegrationConnections");

            migrationBuilder.DropTable(
                name: "OrganizationIdentityProviders");

            migrationBuilder.DropColumn(
                name: "ExternalEmployeeId",
                table: "AspNetUsers");
        }
    }
}
