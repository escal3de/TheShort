using Microsoft.EntityFrameworkCore;
using TheShort.Persistence.Configuration;
using TheShort.Persistence.Entities;

namespace TheShort.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ShortLinkEntity> ShortLinks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ShortLinkConfiguration());
        
        base.OnModelCreating(modelBuilder);
    }
}