using TheShort.Domain;
using TheShort.Persistence.Entities;

namespace TheShort.Persistence.Mappers;

public static class ShortLinkMapper
{
    public static ShortLinkEntity ToEntity(this ShortLink link)
        => new ShortLinkEntity
        {
            Id = link.Id,
            SourceUrl = link.SourceUrl,
            ShortUrlCode = link.ShortUrlCode,
            CreatedAt = link.CreatedAt,
        };

    public static ShortLink ToDomain(this ShortLinkEntity entity)
        => ShortLink.Load(entity.Id, entity.SourceUrl, entity.ShortUrlCode, entity.CreatedAt);
}