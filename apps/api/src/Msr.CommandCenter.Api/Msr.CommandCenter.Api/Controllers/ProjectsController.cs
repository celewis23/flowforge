using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IWorkManagementService _workManagementService;

    public ProjectsController(IWorkManagementService workManagementService)
    {
        _workManagementService = workManagementService;
    }

    [HttpGet]
    public Task<IReadOnlyCollection<ProjectSummaryDto>> Get(CancellationToken cancellationToken) =>
        _workManagementService.GetProjectsAsync(User.GetOrganizationId(), cancellationToken);

    [HttpPost]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin")]
    public Task<ProjectSummaryDto> Create(CreateProjectRequest request, CancellationToken cancellationToken) =>
        _workManagementService.CreateProjectAsync(request with { OrganizationId = User.GetOrganizationId() }, cancellationToken);
}
