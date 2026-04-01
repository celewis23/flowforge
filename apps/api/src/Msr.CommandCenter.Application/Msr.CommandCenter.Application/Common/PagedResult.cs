namespace Msr.CommandCenter.Application.Common;

public record PagedResult<T>(IReadOnlyCollection<T> Items, int TotalCount);
