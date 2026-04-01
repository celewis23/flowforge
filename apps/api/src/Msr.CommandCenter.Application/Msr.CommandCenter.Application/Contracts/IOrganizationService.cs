using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IOrganizationService
{
    Task<IReadOnlyCollection<OrganizationSummaryDto>> GetOrganizationsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyCollection<TeamSummaryDto>> GetTeamsAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<TeamSummaryDto> CreateTeamAsync(Guid organizationId, CreateTeamRequest request, CancellationToken cancellationToken);
    Task InviteUserAsync(InviteUserRequest request, CancellationToken cancellationToken);
}
