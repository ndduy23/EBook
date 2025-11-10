using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace BookDb.Models
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Document> Documents { get; set; }
        public DbSet<DocumentPage> DocumentPages { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Author> Authors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Document - Bookmark relationship
            modelBuilder.Entity<Bookmark>()
                .HasOne(b => b.Document)
                .WithMany(d => d.Bookmarks)
                .HasForeignKey(b => b.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Create index for faster bookmark lookups
            modelBuilder.Entity<Bookmark>()
                .HasIndex(b => new { b.DocumentId, b.PageNumber });

            // Document - Author relationship (store author name but link optional)
            modelBuilder.Entity<Document>()
                .HasOne<Author>()
                .WithMany()
                .HasForeignKey(d => d.Author)
                .HasPrincipalKey(a => a.Name)
                .OnDelete(DeleteBehavior.SetNull);

            // RefreshToken configuration
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.UserId);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => new { rt.UserId, rt.IsRevoked, rt.IsUsed });
        }
    }
}