using CSharpFunctionalExtensions;
using FluentValidation;
using TheShort.Application.Abstractions.Caching;
using TheShort.Application.Abstractions.Repositories;
using TheShort.Application.Contracts.ShortLinks;
using TheShort.Application.Mappers;
using TheShort.Domain;

namespace TheShort.Application.Handlers.ShortLinks;

public class CreateShortLinkHandler(
    IShortLinksRepository repository,
    IValidator<CreateShortLinkRequest> validator,
    ICacheService cache)
{
    private readonly IShortLinksRepository _repository = repository;
    private readonly IValidator<CreateShortLinkRequest> _validator = validator;
    private readonly ICacheService _cache = cache;

    public async Task<Result<ShortLinkResponse>> HandleAsync(CreateShortLinkRequest request,
        CancellationToken cancellationToken)
    {
        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            return Result.Failure<ShortLinkResponse>(
                string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage)));

        var cached =
            await _cache.GetAsync<ShortLinkResponse>($"cache:short_link:{request.SourceUrl}", cancellationToken);
        if (cached is not null)
            return Result.Success(cached);
        
        var existsByShortLink = await _repository.GetByShortCodeAsync(request.SourceUrl, cancellationToken);

        var exists = await _repository.GetAsync(request.SourceUrl, cancellationToken);
        
        if (exists.IsSuccess || existsByShortLink.IsSuccess)
            return Result.Success(exists.Value.ToResponse());

        var shortLink = ShortLink.Create(request.SourceUrl);
        if (shortLink.IsFailure)
            return Result.Failure<ShortLinkResponse>(shortLink.Error);

        var result = await _repository.AddAsync(shortLink.Value, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<ShortLinkResponse>(result.Error);

        var response = shortLink.Value.ToResponse();
        await _cache.SetAsync($"cache:short_link:{request.SourceUrl}", response, TimeSpan.FromMinutes(2), cancellationToken);
        return Result.Success(response);
    }
}