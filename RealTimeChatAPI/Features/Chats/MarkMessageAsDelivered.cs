using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Hubs;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class MarkMessageAsDelivered
{
    public sealed record Command(Guid MessageId) : ICommand;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext,
        IHubContext<ChatHub> hub) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var userId = userContext.UserId;
            var deliveredAt = DateTime.UtcNow;

            var undeliveredMessage = await dbContext.Messages
                .Where(m =>
                    m.Id == command.MessageId &&
                    m.SenderId != userId &&
                    m.Chat.Members.Any(member => member.UserId == userId) &&
                    !m.Receipts.Any(receipt => receipt.UserId == userId))
                .Select(m => new { m.Id, m.ChatId, m.SenderId })
                .SingleOrDefaultAsync(cancellationToken);

            if (undeliveredMessage == null)
                return;

            var newReceipt = new MessageReceipt
            {
                MessageId = undeliveredMessage.Id,
                UserId = userId,
                DeliveredAt = deliveredAt
            };

            dbContext.MessageReceipts.Add(newReceipt);
            await dbContext.SaveChangesAsync(cancellationToken);

            await hub.Clients.User(undeliveredMessage.SenderId.ToString())
                .SendAsync(
                    ChatHubEvents.MessageDelivered,
                    new { undeliveredMessage.Id, undeliveredMessage.ChatId, DeliveredAt = deliveredAt },
                    cancellationToken);

        }
    }
}