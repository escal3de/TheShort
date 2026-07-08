using TheShort.Application.Contracts.ShortLinks;
using TheShort.Domain;

namespace TheShort.Application.Mappers;

public static class ResponseMapper
{
    public static ShortLinkResponse ToResponse(this ShortLink shortLink)
        => new ShortLinkResponse(shortLink.ShortUrlCode);
}