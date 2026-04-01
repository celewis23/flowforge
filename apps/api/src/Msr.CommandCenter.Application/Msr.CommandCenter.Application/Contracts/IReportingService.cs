using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IReportingService
{
    Task<IReadOnlyCollection<ReportingCycleDto>> GetReportingCyclesAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
    Task<ActivityEntryDto> CreateActivityEntryAsync(CreateActivityEntryRequest request, CancellationToken cancellationToken);
    Task<PersonalMsrDto> GeneratePersonalMsrAsync(GeneratePersonalMsrRequest request, CancellationToken cancellationToken);
    Task<PersonalMsrDto> SubmitPersonalMsrAsync(SubmitPersonalMsrRequest request, Guid actorId, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<PersonalMsrDto>> GetPersonalMsrsAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
    Task<TeamMsrDto> CompileTeamMsrAsync(CompileTeamMsrRequest request, CancellationToken cancellationToken);
    Task<TeamMsrDto> FinalizeTeamMsrAsync(FinalizeTeamMsrRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<TeamMsrDto>> GetTeamMsrsAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
}
