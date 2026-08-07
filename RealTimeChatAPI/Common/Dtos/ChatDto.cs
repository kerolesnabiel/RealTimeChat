using System.Net.Mime;
using RealTimeChatAPI.Common.Constants;

namespace RealTimeChatAPI.Common.Dtos;

public record ChatDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Image { get; set; }
    public ChatType Type { get; set; }
    public string? LastMessagePreview { get; set; }
    public DateTime? LastMessageAt { get; set; }
}