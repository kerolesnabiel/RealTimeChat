namespace RealTimeChatAPI.Models;

public class MessageReceipt
{
    public Guid MessageId { get; set; }
    public Message Message { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public DateTime DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
}