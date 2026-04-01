using System.Globalization;
using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.EntityFrameworkCore;
using Msr.CommandCenter.Application.Contracts;
using Msr.CommandCenter.Infrastructure.Data;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Msr.CommandCenter.Infrastructure.Services;

public class ExportService : IExportService
{
    private readonly MsrCommandCenterDbContext _dbContext;

    public ExportService(MsrCommandCenterDbContext dbContext)
    {
        _dbContext = dbContext;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> ExportPersonalMsrPdfAsync(Guid personalMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.PersonalMsrs.SingleAsync(x => x.Id == personalMsrId, cancellationToken);
        return BuildPdf("Personal MSR", msr.SubmittedSummary);
    }

    public async Task<byte[]> ExportTeamMsrPdfAsync(Guid teamMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.TeamMsrs.SingleAsync(x => x.Id == teamMsrId, cancellationToken);
        return BuildPdf("Team MSR", $"{msr.ExecutiveSummary}\n\n{msr.DetailedSummary}");
    }

    public async Task<byte[]> ExportPersonalMsrWordAsync(Guid personalMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.PersonalMsrs.SingleAsync(x => x.Id == personalMsrId, cancellationToken);
        return BuildWord("Personal MSR", msr.SubmittedSummary);
    }

    public async Task<byte[]> ExportTeamMsrWordAsync(Guid teamMsrId, CancellationToken cancellationToken)
    {
        var msr = await _dbContext.TeamMsrs.SingleAsync(x => x.Id == teamMsrId, cancellationToken);
        return BuildWord("Team MSR", $"{msr.ExecutiveSummary}\n\n{msr.DetailedSummary}");
    }

    public async Task<string> ExportActivityCsvAsync(Guid organizationId, Guid teamId, CancellationToken cancellationToken)
    {
        var entries = await _dbContext.ActivityEntries
            .Where(x => x.OrganizationId == organizationId && x.TeamId == teamId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("CreatedAtUtc,EntryType,Title,Content");
        foreach (var entry in entries)
        {
            builder.AppendLine($"{entry.CreatedAtUtc:o},{entry.EntryType},\"{entry.Title.Replace("\"", "\"\"")}\",\"{entry.Content.Replace("\"", "\"\"")}\"");
        }

        return builder.ToString();
    }

    private static byte[] BuildPdf(string title, string body)
    {
        return QuestPDF.Fluent.Document.Create(container =>
            container.Page(page =>
            {
                page.Margin(32);
                page.Content().Column(column =>
                {
                    column.Item().Text(title).FontSize(22).Bold().FontColor(Colors.Blue.Medium);
                    column.Item().Text(DateTime.UtcNow.ToString("MMMM d, yyyy", CultureInfo.InvariantCulture));
                    column.Item().PaddingTop(16).Text(body);
                });
            })).GeneratePdf();
    }

    private static byte[] BuildWord(string title, string body)
    {
        using var memory = new MemoryStream();
        using (var word = WordprocessingDocument.Create(memory, DocumentFormat.OpenXml.WordprocessingDocumentType.Document))
        {
            var mainPart = word.AddMainDocumentPart();
            mainPart.Document = new DocumentFormat.OpenXml.Wordprocessing.Document(new Body(
                new Paragraph(new Run(new Text(title))),
                new Paragraph(new Run(new Text(body)))));
            mainPart.Document.Save();
        }

        return memory.ToArray();
    }
}
