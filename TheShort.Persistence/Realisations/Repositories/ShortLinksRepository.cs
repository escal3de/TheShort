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

    public async Task<Result<IEnumerable<ShortLink>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var result = await _dbContext.ShortLinks
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return result.Count != 0
            ? Result.Success(result.Select(x => x.ToDomain()))
            : Result.Failure<IEnumerable<ShortLink>>($"Short links list is empty");;
    }

    public async Task<Result> DeleteOlderThanAsync(DateTime dateTime, CancellationToken cancellationToken)
    {
        try
        {
            await _dbContext.ShortLinks
                .Where(x => x.CreatedAt < dateTime)
                .ExecuteDeleteAsync(cancellationToken);

            return Result.Success();
        }

        catch (Exception ex)
        {
            return Result.Failure($"Database error during batch deletion: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await _dbContext.ShortLinks
            .Where(x => x.Id == id)
            .ExecuteDeleteAsync(cancellationToken);
        
        return Result.Success();
    }
}