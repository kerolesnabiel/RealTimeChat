using RealTimeChatAPI.Common.Constants;

namespace RealTimeChatAPI.Models;

public class Chat
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public ChatType Type { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastMessageAt { get; set; }

    public ICollection<ChatMember> Members { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}