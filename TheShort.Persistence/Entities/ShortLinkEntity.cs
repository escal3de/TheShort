namespace TheShort.Persistence.Entities;

public class ShortLinkEntity
{
    public Guid Id { get; set; }
    public string SourceUrl { get; set; }
    public string ShortUrlCode { get; set; }
    public DateTime CreatedAt { get; set; }
}