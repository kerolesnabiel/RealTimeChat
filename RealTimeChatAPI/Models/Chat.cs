using RealTimeChatAPI.Common.Constants;

namespace RealTimeChatAPI.Models;

public class Chat
{
    public Guid Id { get; set; }
    public string? ChatKey { get; set; }
    public string? Name { get; set; }
    public string? Image { get; set; }
    public ChatType Type { get; set; } = ChatType.Direct;
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastMessageAt { get; set; }

    public ICollection<ChatMember> Members { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}