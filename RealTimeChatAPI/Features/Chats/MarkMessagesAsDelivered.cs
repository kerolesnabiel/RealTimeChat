using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Hubs;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class MarkMessagesAsDelivered
{
    public sealed record Command : ICommand;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext,
        IHubContext<ChatHub> hub) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var userId = userContext.UserId;
            var deliveredAt = DateTime.UtcNow;

            var undeliveredMessages = await dbContext.Messages
                .Where(m =>
                    m.SenderId != userId &&
                    m.Chat.Members.Any(member => member.UserId == userId) &&
                    !m.Receipts.Any(receipt => receipt.UserId == userId))
                .Select(m => new { m.Id, m.ChatId, m.SenderId })
                .ToListAsync(cancellationToken);

            if (undeliveredMessages.Count == 0)
                return;

            var newReceipts = undeliveredMessages
                .Select(m => new MessageReceipt
                {
                    MessageId = m.Id,
                    UserId = userId,
                    DeliveredAt = deliveredAt
                })
                .ToList();

            dbContext.MessageReceipts.AddRange(newReceipts);
            await dbContext.SaveChangesAsync(cancellationToken);

            foreach (var senderGroup in undeliveredMessages.GroupBy(m => m.SenderId))
            {
                var payload = new
                {
                    Chats = senderGroup.GroupBy(m => m.ChatId).Select(chatGroup => new
                    {
                        ChatId = chatGroup.Key,
                        MessageIds = chatGroup.Select(m => m.Id).ToList()
                    }).ToList(),
                    DeliveredAt = deliveredAt
                };

                await hub.Clients.User(senderGroup.Key.ToString())
                    .SendAsync(ChatHubEvents.MessagesDelivered, payload, cancellationToken);
            }
        }
    }
}