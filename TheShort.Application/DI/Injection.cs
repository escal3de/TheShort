using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TheShort.Application.Contracts.ShortLinks;
using TheShort.Application.Handlers.ShortLinks;
using TheShort.Application.Validators.ShortLinks;

namespace TheShort.Application.DI;

public static class Injection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CreateShortLinkHandler>();

        services.AddScoped<IValidator<CreateShortLinkRequest>, CreateShortLinkRequestValidator>();
        
        return services;
    }
}