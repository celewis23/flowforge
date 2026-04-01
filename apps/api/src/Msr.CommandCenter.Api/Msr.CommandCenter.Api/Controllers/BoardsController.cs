using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/boards")]
public class BoardsController : ControllerBase
{
    private readonly IWorkManagementService _workManagementService;

    public BoardsController(IWorkManagementService workManagementService)
    {
        _workManagementService = workManagementService;
    }

    [HttpGet("me")]
    public Task<BoardDto> GetMyBoard(CancellationToken cancellationToken) =>
        _workManagementService.GetBoardAsync(User.GetOrganizationId(), User.GetUserId(), cancellationToken);

    [HttpGet("team/{teamId:guid}")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin,ExecutiveViewer")]
    public Task<IReadOnlyCollection<BoardDto>> GetTeamBoard(Guid teamId, CancellationToken cancellationToken) =>
        _workManagementService.GetAggregatedTeamBoardAsync(User.GetOrganizationId(), teamId, cancellationToken);
}
