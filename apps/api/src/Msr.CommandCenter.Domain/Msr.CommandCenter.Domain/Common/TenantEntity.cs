namespace Msr.CommandCenter.Domain.Common;

public abstract class TenantEntity : BaseEntity
{
    public Guid OrganizationId { get; set; }
}
