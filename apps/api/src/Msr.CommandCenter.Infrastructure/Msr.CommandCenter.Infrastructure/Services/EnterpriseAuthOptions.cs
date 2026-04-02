namespace Msr.CommandCenter.Infrastructure.Services;

public class EnterpriseAuthOptions
{
    public const string SectionName = "EnterpriseAuth";

    public string ApiBaseUrl { get; set; } = "http://localhost:8080";
    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";
}
