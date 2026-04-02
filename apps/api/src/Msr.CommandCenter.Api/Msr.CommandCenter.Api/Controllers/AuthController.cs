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

    [HttpPost("enterprise/discovery")]
    [ProducesResponseType(typeof(EnterpriseLoginDiscoveryDto), StatusCodes.Status200OK)]
    public Task<EnterpriseLoginDiscoveryDto> DiscoverEnterpriseLogin(EnterpriseLoginDiscoveryRequest request, CancellationToken cancellationToken) =>
        _authService.DiscoverEnterpriseLoginAsync(request, cancellationToken);

    [HttpPost("enterprise/initiate")]
    [ProducesResponseType(typeof(EnterpriseAuthorizationUrlDto), StatusCodes.Status200OK)]
    public Task<EnterpriseAuthorizationUrlDto> InitiateEnterpriseLogin(EnterpriseLoginInitiateRequest request, CancellationToken cancellationToken) =>
        _authService.InitiateEnterpriseLoginAsync(request, cancellationToken);

    [HttpGet("enterprise/callback")]
    public async Task<IActionResult> EnterpriseCallback([FromQuery] string code, [FromQuery] string state, CancellationToken cancellationToken)
    {
        var redirectUrl = await _authService.CompleteEnterpriseLoginAsync(code, state, cancellationToken);
        return Redirect(redirectUrl);
    }

    [HttpPost("enterprise/exchange")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    public Task<AuthResponseDto> ExchangeEnterpriseLogin(EnterpriseLoginExchangeRequest request, CancellationToken cancellationToken) =>
        _authService.ExchangeEnterpriseLoginAsync(request, cancellationToken);
}
