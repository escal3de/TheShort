using CSharpFunctionalExtensions;
using TheShort.Application.Abstractions.Caching;
using TheShort.Application.Abstractions.Repositories;

namespace TheShort.Application.Handlers.ShortLinks;

public class ResolveShortLinkHandler(
    IShortLinksRepository repository,
    ICacheService cache)
{
    private readonly IShortLinksRepository _repository = repository;
    private readonly ICacheService _cache = cache;

    public async Task<Result<string>> HandleAsync(string shortCode, CancellationToken cancellationToken)
    {
        var cached = await _cache.GetAsync<string>($"cache:short_code:{shortCode}", cancellationToken);
        if (cached is not null)
            return Result.Success(cached);

        var result = await _repository.GetByShortCodeAsync(shortCode, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<string>(result.Error);

        var sourceUrl = result.Value.SourceUrl;
        await _cache.SetAsync($"cache:short_code:{shortCode}", sourceUrl, TimeSpan.FromMinutes(60), cancellationToken);
        return Result.Success(sourceUrl);
    }
}
