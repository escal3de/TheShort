using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using TheShort.Application.Abstractions.Caching;
using TheShort.Infrastructure.Realisations.Caching.Options;

namespace TheShort.Infrastructure.Realisations.Caching;

public class CacheService(
    IMemoryCache cache,
    IOptions<CacheOptions> options) : ICacheService
{
    private readonly IMemoryCache _cache = cache;
    private readonly CacheOptions _options = options.Value;
    
    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        _cache.TryGetValue(key, out T? value);
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        _cache.Set(key, value, TimeSpan.FromSeconds(expiration?.TotalSeconds 
                                                    ?? _options.DefaultExpirationSeconds));
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }
}