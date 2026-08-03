namespace RealTimeChatAPI.Models;

public class Message
{
    public Guid Id { get; set; }
    public string CipherText { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? EditedAt { get; set; }
    public DateTime? DeletedAt { get; set; }


    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = default!;


    public Guid SenderId { get; set; }
    public User Sender { get; set; } = default!;
}

