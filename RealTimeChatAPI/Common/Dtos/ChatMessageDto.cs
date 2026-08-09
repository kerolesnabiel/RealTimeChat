using RealTimeChatAPI.Common.Constants;

namespace RealTimeChatAPI.Common.Dtos;

public sealed record ChatMessageDto(
    Guid Id,
    Guid SenderId,
    string Text,
    DateTime CreatedAt,
    DateTime? EditedAt,
    DateTime? DeletedAt,
    MessageStatus? Status
);