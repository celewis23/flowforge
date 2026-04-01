using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IDashboardService
{
    Task<DashboardDto> GetTeamMemberDashboardAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken);
    Task<DashboardDto> GetManagerDashboardAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
    Task<DashboardDto> GetExecutiveDashboardAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<NotificationDto>> GetNotificationsAsync(Guid organizationId, Guid userId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<AuditLogDto>> GetAuditLogsAsync(Guid? organizationId, CancellationToken cancellationToken);
}
