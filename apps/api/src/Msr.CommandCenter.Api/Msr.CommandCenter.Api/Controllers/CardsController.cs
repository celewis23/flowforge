using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Api.Extensions;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/cards")]
public class CardsController : ControllerBase
{
    private readonly IWorkManagementService _workManagementService;

    public CardsController(IWorkManagementService workManagementService)
    {
        _workManagementService = workManagementService;
    }

    [HttpPost]
    public Task<CardDto> Create(CreateCardRequest request, CancellationToken cancellationToken) =>
        _workManagementService.CreateCardAsync(request, User.GetUserId(), cancellationToken);

    [HttpPut("{cardId:guid}")]
    public Task<CardDto> Update(Guid cardId, UpdateCardRequest request, CancellationToken cancellationToken) =>
        _workManagementService.UpdateCardAsync(request with { CardId = cardId }, User.GetUserId(), cancellationToken);

    [HttpPost("{cardId:guid}/comments")]
    public Task<CardCommentDto> AddComment(Guid cardId, AddCommentRequest request, CancellationToken cancellationToken) =>
        _workManagementService.AddCommentAsync(request with { CardId = cardId, AuthorId = User.GetUserId() }, cancellationToken);

    [HttpPost("{cardId:guid}/collaborators")]
    [Authorize(Roles = "Manager,OrgAdmin,PlatformAdmin,TeamMember")]
    public async Task<IActionResult> AddCollaborator(Guid cardId, AddCollaboratorRequest request, CancellationToken cancellationToken)
    {
        await _workManagementService.AddCollaboratorAsync(request with { CardId = cardId }, User.GetUserId(), cancellationToken);
        return Accepted();
    }

    [HttpPost("{cardId:guid}/subtasks")]
    public Task<CardSubtaskDto> AddSubtask(Guid cardId, CreateSubtaskRequest request, CancellationToken cancellationToken) =>
        _workManagementService.AddSubtaskAsync(request with { CardId = cardId }, User.GetUserId(), cancellationToken);
}
