using RealTimeChatAPI.Common.Constants;

namespace RealTimeChatAPI.Models;

public class ChatMember
{
    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = default!;

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ChatMemberRoles Role { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    public DateTime? MutedUntil { get; set; }

}