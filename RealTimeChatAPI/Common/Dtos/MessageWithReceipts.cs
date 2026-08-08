namespace RealTimeChatAPI.Common.Dtos;

public sealed record MessageWithReceiptsDto(
    Guid Id,
    Guid ChatId,
    Guid SenderId,
    string Text,
    DateTime CreatedAt,
    DateTime? EditedAt,
    DateTime? DeletedAt,
    ICollection<MessageReceiptDto> Receipts
);