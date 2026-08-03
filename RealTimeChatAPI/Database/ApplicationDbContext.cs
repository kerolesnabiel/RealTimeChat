using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Database;

internal sealed class ApplicationDbContext
    (DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    internal DbSet<User> Users { get; set; }
    internal DbSet<Message> Messages { get; set; }
    internal DbSet<Conversation> Conversations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Username)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.Username)
                .IsUnique();
        });

        builder.Entity<Conversation>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasOne(x => x.User1)
                .WithMany(x => x.ConversationsAsUser1)
                .HasForeignKey(x => x.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User2)
                .WithMany(x => x.ConversationsAsUser2)
                .HasForeignKey(x => x.User2Id)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new { x.User1Id, x.User2Id })
                .IsUnique();

            entity.HasIndex(x => x.LastMessageAt);
        });

        builder.Entity<Message>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasOne(x => x.Conversation)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(x => x.CipherText)
                .IsRequired();

            entity.HasIndex(x => new { x.ConversationId, x.CreatedAt });
        });
    }
}