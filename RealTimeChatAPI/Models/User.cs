namespace RealTimeChatAPI.Models;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string HashedPassword { get; set; } = default!;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpiration { get; set; }
    public string? Image { get; set; }
    public string? About { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMember> ChatMembers { get; set; } = [];
    public ICollection<Message> SentMessages { get; set; } = [];
}
