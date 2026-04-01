namespace Msr.CommandCenter.Infrastructure.Services;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "MsrCommandCenter";
    public string Audience { get; set; } = "MsrCommandCenter.Web";
    public string SigningKey { get; set; } = "super-secret-development-key-change-me";
    public int ExpiryMinutes { get; set; } = 480;
}
