using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<EnterpriseLoginDiscoveryDto> DiscoverEnterpriseLoginAsync(EnterpriseLoginDiscoveryRequest request, CancellationToken cancellationToken);
    Task<EnterpriseAuthorizationUrlDto> InitiateEnterpriseLoginAsync(EnterpriseLoginInitiateRequest request, CancellationToken cancellationToken);
    Task<string> CompleteEnterpriseLoginAsync(string code, string state, CancellationToken cancellationToken);
    Task<AuthResponseDto> ExchangeEnterpriseLoginAsync(EnterpriseLoginExchangeRequest request, CancellationToken cancellationToken);
}
