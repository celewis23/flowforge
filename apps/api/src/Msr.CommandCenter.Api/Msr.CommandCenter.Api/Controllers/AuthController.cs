using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    public Task<AuthResponseDto> Register(RegisterRequest request, CancellationToken cancellationToken) =>
        _authService.RegisterAsync(request, cancellationToken);

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    public Task<AuthResponseDto> Login(LoginRequest request, CancellationToken cancellationToken) =>
        _authService.LoginAsync(request, cancellationToken);
}
