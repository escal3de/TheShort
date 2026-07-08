using System.Threading.RateLimiting;

namespace TheShort.Api.ServiceCollections;

public static class CustomRateLimiter
{
    private static string GetPartitionKey(HttpContext context)
        => context.User.Identity?.Name
           ?? context.Connection.RemoteIpAddress?.ToString()
           ?? "anonymous";

    public static IServiceCollection AddCustomRateLimiter(this IServiceCollection services)
        => services.AddRateLimiter(options =>
        {
            options.GlobalLimiter =
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                    RateLimitPartition.GetFixedWindowLimiter(
                        partitionKey: GetPartitionKey(context),
                        factory: _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 1000,
                            QueueLimit = 0,
                            Window = TimeSpan.FromMinutes(1)
                        }));

            options.OnRejected = async (context, token) =>
            {
                var response = context.HttpContext.Response;
                response.ContentType = "application/json";
                response.StatusCode = StatusCodes.Status429TooManyRequests;
                response.Headers["Retry-After"] = "60";

                await response.WriteAsJsonAsync("""{"error": "Too many requests"}""", token);
            };
        });
}