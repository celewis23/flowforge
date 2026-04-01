namespace Msr.CommandCenter.Application.Contracts;

public interface IIdentityContext
{
    Guid UserId { get; }
    Guid OrganizationId { get; }
    string Email { get; }
    string Role { get; }
}
