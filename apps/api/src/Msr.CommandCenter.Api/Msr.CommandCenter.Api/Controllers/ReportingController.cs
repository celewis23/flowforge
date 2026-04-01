using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reporting")]
public class ReportingController : ControllerBase
{
    private readonly IReportingService _reportingService;

    public ReportingController(IReportingService reportingService)
    {
        _reportingService = reportingService;
    }

    [HttpGet("cycles/{teamId:guid}")]
    public Task<IReadOnlyCollection<ReportingCycleDto>> GetCycles(Guid teamId, CancellationToken cancellationToken) =>
        _reportingService.GetReportingCyclesAsync(User.GetOrganizationId(), teamId, cancellationToken);

    [HttpPost("activity")]
    public Task<ActivityEntryDto> AddActivity(CreateActivityEntryRequest request, CancellationToken cancellationToken) =>
        _reportingService.CreateActivityEntryAsync(request with { OrganizationId = User.GetOrganizationId(), UserId = User.GetUserId() }, cancellationToken);

    [HttpPost("personal-msrs/generate")]
    public Task<PersonalMsrDto> GeneratePersonalMsr(GeneratePersonalMsrRequest request, CancellationToken cancellationToken) =>
        _reportingService.GeneratePersonalMsrAsync(request with { OrganizationId = User.GetOrganizationId(), UserId = request.UserId == Guid.Empty ? User.GetUserId() : request.UserId }, cancellationToken);

    [HttpPost("personal-msrs/submit")]
    public Task<PersonalMsrDto> SubmitPersonalMsr(SubmitPersonalMsrRequest request, CancellationToken cancellationToken) =>
        _reportingService.SubmitPersonalMsrAsync(request, User.GetUserId(), cancellationToken);

    [HttpGet("personal-msrs/{teamId:guid}")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin")]
    public Task<IReadOnlyCollection<PersonalMsrDto>> GetPersonalMsrs(Guid teamId, CancellationToken cancellationToken) =>
        _reportingService.GetPersonalMsrsAsync(User.GetOrganizationId(), teamId, cancellationToken);

    [HttpPost("team-msrs/compile")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin")]
    public Task<TeamMsrDto> CompileTeamMsr(CompileTeamMsrRequest request, CancellationToken cancellationToken) =>
        _reportingService.CompileTeamMsrAsync(request with { OrganizationId = User.GetOrganizationId(), ManagerId = User.GetUserId() }, cancellationToken);

    [HttpPost("team-msrs/finalize")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin")]
    public Task<TeamMsrDto> FinalizeTeamMsr(FinalizeTeamMsrRequest request, CancellationToken cancellationToken) =>
        _reportingService.FinalizeTeamMsrAsync(request with { FinalizedById = User.GetUserId() }, cancellationToken);

    [HttpGet("team-msrs/{teamId:guid}")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin,ExecutiveViewer")]
    public Task<IReadOnlyCollection<TeamMsrDto>> GetTeamMsrs(Guid teamId, CancellationToken cancellationToken) =>
        _reportingService.GetTeamMsrsAsync(User.GetOrganizationId(), teamId, cancellationToken);
}
