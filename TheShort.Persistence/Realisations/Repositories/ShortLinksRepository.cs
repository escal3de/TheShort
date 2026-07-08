using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TheShort.Application.Abstractions.Repositories;
using TheShort.Domain;
using TheShort.Persistence.Mappers;

namespace TheShort.Persistence.Realisations.Repositories;

public class ShortLinksRepository(AppDbContext dbContext) : IShortLinksRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<Result> AddAsync(ShortLink shortLink, CancellationToken cancellationToken)
    {
        await _dbContext.ShortLinks.AddAsync(shortLink.ToEntity(), cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result<ShortLink>> GetAsync(string sourceUrl, CancellationToken cancellationToken)
    {
        var result = await _dbContext.ShortLinks
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SourceUrl == sourceUrl, cancellationToken);

        return result is not null
            ? Result.Success(result.ToDomain())
            : Result.Failure<ShortLink>("Source link not found");
    }

    public async Task<Result<ShortLink>> GetByShortCodeAsync(string shortCode, CancellationToken cancellationToken)
    {
        var result = await _dbContext.ShortLinks
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.ShortUrlCode == shortCode, cancellationToken);

        return result is not null
            ? Result.Success(result.ToDomain())
            : Result.Failure<ShortLink>("Short link not found");
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await _dbContext.ShortLinks
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken);
        
        return Result.Success();
    }
}