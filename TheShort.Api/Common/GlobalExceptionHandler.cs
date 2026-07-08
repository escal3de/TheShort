using Microsoft.AspNetCore.Diagnostics;
using Serilog;

namespace TheShort.Api.Common;

public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception,
        CancellationToken cancellationToken)
    {
        Log.Error(exception, "An unhandled exception occurred. {Method} {RequestPath}",
            httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(new
        {
            error = "Internal server error",
        }, cancellationToken);

        return true;
    }
}