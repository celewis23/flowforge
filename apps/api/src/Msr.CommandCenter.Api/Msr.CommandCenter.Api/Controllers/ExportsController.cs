using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Msr.CommandCenter.Application.Contracts;

namespace Msr.CommandCenter.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/exports")]
public class ExportsController : ControllerBase
{
    private readonly IExportService _exportService;

    public ExportsController(IExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpGet("personal-msr/{personalMsrId:guid}/pdf")]
    public async Task<FileContentResult> PersonalMsrPdf(Guid personalMsrId, CancellationToken cancellationToken) =>
        File(await _exportService.ExportPersonalMsrPdfAsync(personalMsrId, cancellationToken), "application/pdf", "personal-msr.pdf");

    [HttpGet("team-msr/{teamMsrId:guid}/pdf")]
    public async Task<FileContentResult> TeamMsrPdf(Guid teamMsrId, CancellationToken cancellationToken) =>
        File(await _exportService.ExportTeamMsrPdfAsync(teamMsrId, cancellationToken), "application/pdf", "team-msr.pdf");

    [HttpGet("personal-msr/{personalMsrId:guid}/word")]
    public async Task<FileContentResult> PersonalMsrWord(Guid personalMsrId, CancellationToken cancellationToken) =>
        File(await _exportService.ExportPersonalMsrWordAsync(personalMsrId, cancellationToken), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "personal-msr.docx");

    [HttpGet("team-msr/{teamMsrId:guid}/word")]
    public async Task<FileContentResult> TeamMsrWord(Guid teamMsrId, CancellationToken cancellationToken) =>
        File(await _exportService.ExportTeamMsrWordAsync(teamMsrId, cancellationToken), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "team-msr.docx");

    [HttpGet("activity/{organizationId:guid}/{teamId:guid}/csv")]
    public async Task<FileContentResult> ActivityCsv(Guid organizationId, Guid teamId, CancellationToken cancellationToken) =>
        File(System.Text.Encoding.UTF8.GetBytes(await _exportService.ExportActivityCsvAsync(organizationId, teamId, cancellationToken)), "text/csv", "activity.csv");
}
