using Msr.CommandCenter.Application.Dtos;

namespace Msr.CommandCenter.Application.Contracts;

public interface IExportService
{
    Task<byte[]> ExportPersonalMsrPdfAsync(Guid personalMsrId, CancellationToken cancellationToken);
    Task<byte[]> ExportTeamMsrPdfAsync(Guid teamMsrId, CancellationToken cancellationToken);
    Task<byte[]> ExportPersonalMsrWordAsync(Guid personalMsrId, CancellationToken cancellationToken);
    Task<byte[]> ExportTeamMsrWordAsync(Guid teamMsrId, CancellationToken cancellationToken);
    Task<string> ExportActivityCsvAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken);
}
