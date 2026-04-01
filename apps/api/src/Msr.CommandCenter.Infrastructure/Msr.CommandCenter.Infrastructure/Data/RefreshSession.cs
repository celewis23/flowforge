using Msr.CommandCenter.Domain.Common;

namespace Msr.CommandCenter.Infrastructure.Data;

public class RefreshSession : BaseEntity
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string UserAgent { get; set; } = string.Empty;
}
