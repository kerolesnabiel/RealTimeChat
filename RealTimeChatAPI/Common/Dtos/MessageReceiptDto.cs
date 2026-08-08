namespace RealTimeChatAPI.Common.Dtos;

public sealed record MessageReceiptDto(Guid UserId, DateTime? DeliveredAt, DateTime? ReadAt);