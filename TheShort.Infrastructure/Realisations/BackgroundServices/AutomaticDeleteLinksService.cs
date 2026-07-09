using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TheShort.Application.Abstractions.Repositories;

namespace TheShort.Infrastructure.Realisations.BackgroundServices;

public class AutomaticDeleteLinksService(
    IServiceScopeFactory scopeFactory,
    ILogger<AutomaticDeleteLinksService> logger) : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly ILogger<AutomaticDeleteLinksService> _logger = logger;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Automatic delete links service started");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Automatic delete links service started get all short links...");

                using (var scope = _scopeFactory.CreateScope())
                {
                    var repository = scope.ServiceProvider.GetRequiredService<IShortLinksRepository>();

                    var thresholdDate = DateTime.UtcNow.AddYears(-1);

                    var deleteResult = await repository.DeleteOlderThanAsync(thresholdDate, stoppingToken);
                    if (deleteResult.IsFailure)
                    {
                        _logger.LogError("Failed to delete old links: {Error}", deleteResult.Error);
                    }

                    _logger.LogInformation("Expired short links clean up execution finished successfully.");
                }
            }

            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while executing AutomaticDeleteLinksService.");
            }
            
            _logger.LogInformation("Service is sleeping for 2 days...");
            await Task.Delay(TimeSpan.FromDays(2), stoppingToken);
        }
    }
}