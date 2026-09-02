using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Hubs;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class MarkMessagesAsReadUpTo
{
    public sealed record Command(Guid MessageId, Guid CurrentUserId) : ICommand;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IHubContext<ChatHub> hub) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var userId = command.CurrentUserId;
            var readAt = DateTime.UtcNow;

            var target = await dbContext.Messages
                .Where(m =>
                    m.Id == command.MessageId &&
                    m.SenderId != userId &&
                    m.Chat.Members.Any(member => member.UserId == userId))
                .Select(m => new
                {
                    m.Id,
                    m.ChatId,
                    m.CreatedAt,
                    Member = m.Chat.Members
                        .Where(member => member.UserId == userId)
                        .Select(member => new
                        {
                            Member = member,
                            member.LastReadMessageId,
                            LastReadMessageCreatedAt = member.LastReadMessage != null
                                ? member.LastReadMessage.CreatedAt : (DateTime?)null
                        })
                        .Single()
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (target is null)
                return;

            if (target.Member.LastReadMessageId == target.Id)
                return;

            if (target.Member.LastReadMessageId != null)
            {
                bool targetIsBeforeLastRead =
                    target.CreatedAt < target.Member.LastReadMessageCreatedAt ||
                    (
                        target.CreatedAt == target.Member.LastReadMessageCreatedAt &&
                        target.Id.CompareTo(target.Member.LastReadMessageId) < 0
                    );

                if (targetIsBeforeLastRead)
                    return;
            }

            var messagesToRead = await dbContext.Messages
                .Where(m =>
                    m.ChatId == target.ChatId &&
                    m.SenderId != userId &&
                    (
                        target.Member.LastReadMessageId == null ||
                        m.CreatedAt > target.Member.LastReadMessageCreatedAt
                    )
                    &&
                    (m.CreatedAt <= target.CreatedAt)
                    &&
                    (
                        !m.Receipts.Any(r => r.UserId == userId) ||
                        m.Receipts.Any(r => r.UserId == userId && r.ReadAt == null)
                    ))
                .Select(m => new
                {
                    m.Id,
                    m.SenderId,
                    Receipt = m.Receipts.SingleOrDefault(r => r.UserId == userId)
                })
                .ToListAsync(cancellationToken);

            foreach (var message in messagesToRead)
            {
                if (message.Receipt == null)
                    dbContext.MessageReceipts.Add(new MessageReceipt
                    {
                        MessageId = message.Id,
                        UserId = userId,
                        DeliveredAt = readAt,
                        ReadAt = readAt
                    });
                else
                    message.Receipt.ReadAt = readAt;
            }

            target.Member.Member.LastReadMessageId = target.Id;
            await dbContext.SaveChangesAsync(cancellationToken);

            foreach (var group in messagesToRead.GroupBy(m => m.SenderId))
            {
                var messageIds = group.Select(m => m.Id).ToList();

                await hub.Clients.User(group.Key.ToString())
                    .SendAsync(ChatHubEvents.MessagesRead,
                        new { target.ChatId, MessageIds = messageIds, ReadAt = readAt },
                        cancellationToken);
            }

        }
    }
}