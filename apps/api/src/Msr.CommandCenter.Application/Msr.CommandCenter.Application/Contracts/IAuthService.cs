using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}
