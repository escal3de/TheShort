using Microsoft.AspNetCore.Mvc;
using Serilog;
using TheShort.Application.Contracts.ShortLinks;
using TheShort.Application.Handlers.ShortLinks;

namespace TheShort.Api.Endpoints;

public static class ShortLinksEndpoints
{
    public static IEndpointRouteBuilder MapShortLinksEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/short-links");

        group.MapPost("/", async (
            CreateShortLinkRequest request,
            [FromServices] CreateShortLinkHandler handler,
            CancellationToken cancellationToken = default) =>
        {
            Log.Debug("Start creating short link");

            var result = await handler.HandleAsync(request, cancellationToken);
            if (result.IsFailure)
            {
                Log.Warning("Failed to create short link: {Error}", result.Error);
                return Results.BadRequest(result.Error);
            }
            
            Log.Information("Created short link: {ShortLink}", result.Value);
            return Results.Ok(result.Value);
        });

        group.MapGet("/{code}", async (
            string code,
            [FromServices] ResolveShortLinkHandler handler,
            CancellationToken cancellationToken = default) =>
        {
            Log.Debug("Resolving short code: {Code}", code);

            var result = await handler.HandleAsync(code, cancellationToken);
            if (result.IsFailure)
            {
                Log.Warning("Short code not found: {Code}", code);
                return Results.NotFound(new { error = result.Error });
            }

            return Results.Ok(new { sourceUrl = result.Value });
        });

        return group;
    }
}