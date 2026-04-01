using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Msr.CommandCenter.Infrastructure.Data;

public class MsrCommandCenterDbContextFactory : IDesignTimeDbContextFactory<MsrCommandCenterDbContext>
{
    public MsrCommandCenterDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MsrCommandCenterDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=msr_command_center;Username=postgres;Password=postgres");
        return new MsrCommandCenterDbContext(optionsBuilder.Options);
    }
}
