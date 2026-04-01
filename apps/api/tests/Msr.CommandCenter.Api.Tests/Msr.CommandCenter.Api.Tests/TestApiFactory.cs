using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Msr.CommandCenter.Infrastructure.Data;

namespace Msr.CommandCenter.Api.Tests;

public class TestApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<MsrCommandCenterDbContext>));
            services.RemoveAll(typeof(MsrCommandCenterDbContext));
            services.AddDbContext<MsrCommandCenterDbContext>(options =>
                options.UseInMemoryDatabase($"msr-command-center-tests-{Guid.NewGuid():N}"));
        });
    }
}
