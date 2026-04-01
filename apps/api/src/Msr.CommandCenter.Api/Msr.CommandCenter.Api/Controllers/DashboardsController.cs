using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboards")]
public class DashboardsController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardsController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("me")]
    public Task<DashboardDto> GetMine(CancellationToken cancellationToken) =>
        _dashboardService.GetTeamMemberDashboardAsync(User.GetOrganizationId(), User.GetUserId(), cancellationToken);

    [HttpGet("manager/{teamId:guid}")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin")]
    public Task<DashboardDto> GetManager(Guid teamId, CancellationToken cancellationToken) =>
        _dashboardService.GetManagerDashboardAsync(User.GetOrganizationId(), teamId, cancellationToken);

    [HttpGet("executive")]
    [Authorize(Roles = "ExecutiveViewer,Manager,OrgAdmin,PlatformAdmin")]
    public Task<DashboardDto> GetExecutive(CancellationToken cancellationToken) =>
        _dashboardService.GetExecutiveDashboardAsync(User.GetOrganizationId(), cancellationToken);

    [HttpGet("notifications")]
    public Task<IReadOnlyCollection<NotificationDto>> GetNotifications(CancellationToken cancellationToken) =>
        _dashboardService.GetNotificationsAsync(User.GetOrganizationId(), User.GetUserId(), cancellationToken);

    [HttpGet("audit-logs")]
    [Authorize(Roles = "OrgAdmin,PlatformAdmin")]
    public Task<IReadOnlyCollection<AuditLogDto>> GetAuditLogs(CancellationToken cancellationToken) =>
        _dashboardService.GetAuditLogsAsync(User.GetOrganizationId(), cancellationToken);
}
