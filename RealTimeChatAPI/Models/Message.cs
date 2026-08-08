namespace RealTimeChatAPI.Models;

public class Message
{
    public Guid Id { get; set; }
    public string Text { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EditedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = default!;

    public Guid SenderId { get; set; }
    public User Sender { get; set; } = default!;

    public ICollection<MessageReceipt> Receipts { get; set; } = [];
}