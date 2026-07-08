using FluentValidation;
using TheShort.Application.Contracts.ShortLinks;

namespace TheShort.Application.Validators.ShortLinks;

public class CreateShortLinkRequestValidator : AbstractValidator<CreateShortLinkRequest>
{
    public CreateShortLinkRequestValidator()
    {
        RuleFor(x => x.SourceUrl)
            .NotEmpty()
            .WithMessage("Source url cannot be empty.")
            .MaximumLength(1024)
            .WithMessage("Source url is too long.")
            .Must(value =>
            {
                if (string.IsNullOrWhiteSpace(value))
                    return false;

                if (!Uri.TryCreate(value, UriKind.Absolute, out Uri? parsedUri))
                    return false;

                if (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps)
                    return false;

                if (string.IsNullOrWhiteSpace(parsedUri.Host) || !parsedUri.Host.Contains('.'))
                    return false;

                return true;
            })
            .WithMessage("Invalid URL format.")
            .Must(value =>
            {
                if (string.IsNullOrWhiteSpace(value))
                    return true;
                if (!Uri.TryCreate(value, UriKind.Absolute, out Uri? parsedUri))
                    return true;
                return !parsedUri.Host.EndsWith("theshort.ru", StringComparison.OrdinalIgnoreCase);
            })
            .WithMessage("Cannot shorten links from theshort.ru domain.");
    }
}
