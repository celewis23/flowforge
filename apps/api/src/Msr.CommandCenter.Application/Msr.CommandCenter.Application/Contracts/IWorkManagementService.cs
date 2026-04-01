using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IWorkManagementService
{
    Task<BoardDto> GetBoardAsync(Guid organizationId, Guid ownerId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<BoardDto>> GetAggregatedTeamBoardAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
    Task<CardDto> CreateCardAsync(CreateCardRequest request, Guid actorId, CancellationToken cancellationToken);
    Task<CardDto> UpdateCardAsync(UpdateCardRequest request, Guid actorId, CancellationToken cancellationToken);
    Task<CardCommentDto> AddCommentAsync(AddCommentRequest request, CancellationToken cancellationToken);
    Task AddCollaboratorAsync(AddCollaboratorRequest request, Guid actorId, CancellationToken cancellationToken);
    Task<CardSubtaskDto> AddSubtaskAsync(CreateSubtaskRequest request, Guid actorId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<ProjectSummaryDto>> GetProjectsAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<ProjectSummaryDto> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken);
}
