using Microsoft.Extensions.DependencyInjection;
using TheShort.Application.Abstractions.Caching;
using TheShort.Infrastructure.Realisations.BackgroundServices;
using TheShort.Infrastructure.Realisations.Caching;
using TheShort.Infrastructure.Realisations.Caching.Options;

namespace TheShort.Infrastructure.DI;

public static class Injection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddMemoryCache();
        services.Configure<CacheOptions>(options =>
        {
            options.DefaultExpirationSeconds = 300;
        });
        services.AddScoped<ICacheService, CacheService>();

        services.AddHostedService<AutomaticDeleteLinksService>();

        return services;
    }
}