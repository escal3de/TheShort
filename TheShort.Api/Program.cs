using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Serilog;
using TheShort.Api.Common;
using TheShort.Api.Endpoints;
using TheShort.Api.ServiceCollections;
using TheShort.Application.DI;
using TheShort.Infrastructure.DI;
using TheShort.Persistence.DI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
var configuration = builder.Configuration;

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCustomRateLimiter();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(AppContext.BaseDirectory, "keys")))
    .SetApplicationName("TheShort");

builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4356")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddPersistence(configuration);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 1024 * 2;
});

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(configuration)
    .CreateLogger();
builder.Host.UseSerilog();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TheShort.Persistence.AppDbContext>();
    try
    {
        await db.Database.MigrateAsync();
        Log.Information("Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Failed to apply database migrations");
    }
}

app.UseExceptionHandler();

if (app.Environment.IsDevelopment()) app.MapOpenApi();

if (app.Environment.IsProduction()) app.UseHsts();

if (!app.Environment.IsProduction()) app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
    await next();
});

app.UseCors();
app.UseRateLimiter();
app.MapShortLinksEndpoints();

app.Run();