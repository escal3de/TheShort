using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheShort.Persistence.Entities;

namespace TheShort.Persistence.Configuration;

public class ShortLinkConfiguration : IEntityTypeConfiguration<ShortLinkEntity>
{
    public void Configure(EntityTypeBuilder<ShortLinkEntity> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceUrl)
            .IsRequired();

        builder.HasIndex(x => x.SourceUrl)
            .IsUnique();
        
        builder.HasIndex(x => x.ShortUrlCode)
            .IsUnique();

        builder.Property(x => x.ShortUrlCode)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}