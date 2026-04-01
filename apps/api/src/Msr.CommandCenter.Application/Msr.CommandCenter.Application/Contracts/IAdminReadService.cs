using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IAdminReadService
{
    Task<AdminSummaryDto> GetSummaryAsync(Guid organizationId, CancellationToken cancellationToken);
}
