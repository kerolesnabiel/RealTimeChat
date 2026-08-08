using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Common.Services;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Database;

internal sealed class ApplicationDbContext
    (DbContextOptions<ApplicationDbContext> options, IMessageEncryptionService encryption) : DbContext(options)
{
    internal DbSet<User> Users { get; set; }
    internal DbSet<Chat> Chats { get; set; }
    internal DbSet<ChatMember> ChatMembers { get; set; }
    internal DbSet<Message> Messages { get; set; }
    internal DbSet<MessageReceipt> MessageReceipts { get; set; }

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

        builder.Entity<Chat>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.ChatKey).IsUnique();

            entity.Property(x => x.Type)
                .HasConversion<byte>();

            entity.Property(x => x.Name)
                .HasMaxLength(100);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => x.LastMessageAt);
        });


        builder.Entity<ChatMember>(entity =>
        {
            entity.HasKey(x => new { x.ChatId, x.UserId });

            entity.Property(x => x.Role)
                .HasConversion<byte>();

            entity.HasOne(x => x.Chat)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany(x => x.ChatMembers)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => x.UserId);
        });

        builder.Entity<Message>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Text)
                .IsRequired()
                .HasConversion(
                    value => encryption.Encrypt(value),
                    value => encryption.Decrypt(value));

            entity.HasOne(x => x.Chat)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Sender)
                .WithMany(x => x.SentMessages)
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new { x.ChatId, x.CreatedAt });
        });

        builder.Entity<MessageReceipt>(entity =>
        {
            entity.HasKey(x => new { x.MessageId, x.UserId });

            entity.HasOne(x => x.Message)
                .WithMany(x => x.Receipts)
                .HasForeignKey(x => x.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => x.UserId);
        });
    }
}