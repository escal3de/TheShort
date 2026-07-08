using System.Security.Cryptography;
using CSharpFunctionalExtensions;

namespace TheShort.Domain;

public class ShortLink
{
    private const string Alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private const int MaxSourceUrlLength = 1024;

    public Guid Id { get; private set; }
    public string SourceUrl { get; private set; }
    public string ShortUrlCode { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private ShortLink(Guid id, string sourceUrl, string shortUrlCode, DateTime createdAt)
    {
        Id = id;
        SourceUrl = sourceUrl;
        ShortUrlCode = shortUrlCode;
        CreatedAt  = createdAt;
    }

    public static Result<ShortLink> Create(string sourceUrl)
    {
        var validate = Validate(sourceUrl);
        if (validate.IsFailure)
            return Result.Failure<ShortLink>(validate.Error);

        var shortUrlCode = ShortLinkGenerate();

        var shortLink = new ShortLink(Guid.NewGuid(), sourceUrl, shortUrlCode, DateTime.UtcNow);

        return Result.Success(shortLink);
    }

    public static ShortLink Load(Guid id, string sourceUrl, string shortUrlCode, DateTime createdAt)
        => new ShortLink(id, sourceUrl, shortUrlCode, createdAt);

    private static Result Validate(string sourceUrl)
    {
        if (string.IsNullOrWhiteSpace(sourceUrl))
            return Result.Failure("Source url cannot be empty.");

        if (sourceUrl.Length > MaxSourceUrlLength)
            return Result.Failure("Source url is too long.");

        if (!Uri.TryCreate(sourceUrl, UriKind.Absolute, out Uri? parsedUri))
            return Result.Failure("Invalid URL format.");

        if (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps)
            return Result.Failure("Only HTTP and HTTPS protocols are supported.");

        if (string.IsNullOrWhiteSpace(parsedUri.Host) || !parsedUri.Host.Contains('.'))
            return Result.Failure("URL must contain a valid domain name.");

        return Result.Success();
    }

    private static string ShortLinkGenerate(int length = 6) => RandomNumberGenerator.GetString(Alphabet, length);
}