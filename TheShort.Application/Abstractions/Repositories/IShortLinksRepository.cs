using CSharpFunctionalExtensions;
using TheShort.Application.Contracts.ShortLinks;
using TheShort.Domain;

namespace TheShort.Application.Abstractions.Repositories;

public interface IShortLinksRepository
{
    Task<Result> AddAsync(ShortLink shortLink, CancellationToken cancellationToken);
    Task<Result<ShortLink>> GetAsync(string sourceUrl, CancellationToken cancellationToken);
    Task<Result<ShortLink>> GetByShortCodeAsync(string shortCode, CancellationToken cancellationToken);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken);
}