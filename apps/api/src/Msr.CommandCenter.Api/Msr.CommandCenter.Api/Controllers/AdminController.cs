using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminReadService _adminReadService;

    public AdminController(IAdminReadService adminReadService)
    {
        _adminReadService = adminReadService;
    }

    [HttpGet("summary")]
    [Authorize(Roles = "OrgAdmin,Manager,PlatformAdmin,ExecutiveViewer")]
    public Task<AdminSummaryDto> GetSummary(CancellationToken cancellationToken) =>
        _adminReadService.GetSummaryAsync(User.GetOrganizationId(), cancellationToken);
}
