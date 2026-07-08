using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheShort.Application.Abstractions.Repositories;
using TheShort.Persistence.Realisations.Repositories;

namespace TheShort.Persistence.DI;

public static class Injection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            options.EnableSensitiveDataLogging();
        });
        
        services.AddScoped<IShortLinksRepository, ShortLinksRepository>();

        return services;
    }
}