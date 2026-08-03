using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Database;

namespace RealTimeChatAPI;

public static class DependencyInjection
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("RealTimeChatDb");
        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString));
        return services;
    }
}