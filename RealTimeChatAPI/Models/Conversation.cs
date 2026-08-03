namespace RealTimeChatAPI.Models;

public class Conversation
{
    public Guid Id { get; set; }
    public DateTime LastMessageAt { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid User1Id { get; set; }
    public User? User1 { get; set; }

    public Guid User2Id { get; set; }
    public User? User2 { get; set; }

    public ICollection<Message> Messages { get; set; } = [];
}