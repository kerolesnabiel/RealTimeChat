using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class GetChatMessages
{
    public sealed record ChatMessagesResponse(
    IReadOnlyList<ChatMessageDto> Messages,
    Guid? FirstUnreadMessageId,
    bool HasMoreBefore,
    bool HasMoreAfter);

    public sealed record Query(Guid ChatId) : IQuery<ChatMessagesResponse>;

    public static IQueryable<ChatMessageDto> SelectChatMessages(
    this IQueryable<Message> query,
    Guid currentUserId,
    ChatType chatType)
    {
        return query.Select(x => new ChatMessageDto(
            x.Id,
            x.SenderId,
            x.DeletedAt == null
                ? x.Text
                : "This message was deleted.",
            x.CreatedAt,
            x.DeletedAt == null
                ? x.EditedAt
                : null,
            x.DeletedAt,

            x.DeletedAt != null ||
            x.SenderId != currentUserId ||
            chatType != ChatType.Direct
                ? null
                : x.Receipts.Any(r =>
                    r.UserId != currentUserId &&
                    r.ReadAt != null)
                    ? MessageStatus.Read
                : x.Receipts.Any(r =>
                    r.UserId != currentUserId &&
                    r.DeliveredAt != null)
                    ? MessageStatus.Delivered
                : MessageStatus.Sent
        ));
    }

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : IQueryHandler<Query, ChatMessagesResponse>
    {
        private const int MessagesBefore = 10;
        private const int MessagesAfter = 20;
        private const int LatestMessagesCount = 20;

        public async Task<ChatMessagesResponse> Handle(Query query, CancellationToken cancellationToken)
        {
            var chat = await dbContext.Chats
                .Where(x => x.Id == query.ChatId && x.Members.Any(m => m.UserId == userContext.UserId))
                .Select(x => new
                {
                    x.Id,
                    x.Type,

                    LastReadMessageId = x.Members
                    .Where(m => m.UserId == userContext.UserId)
                    .Select(m => m.LastReadMessageId)
                    .Single()
                }).SingleOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException(nameof(Chat), query.ChatId.ToString());

            var firstUnreadMessage = await GetFirstUnreadMessageAsync(
                chat.LastReadMessageId,
                query.ChatId,
                cancellationToken);

            if (firstUnreadMessage is null)
            {
                var msgs = await dbContext.Messages
                    .Where(x => x.ChatId == query.ChatId)
                    .OrderByDescending(x => x.CreatedAt)
                    .ThenByDescending(x => x.Id)
                    .Take(LatestMessagesCount)
                    .SelectChatMessages(userContext.UserId, chat.Type)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                var hasMoreMsgsBefore = msgs.Count == LatestMessagesCount;

                msgs.Reverse();

                return new ChatMessagesResponse(msgs, null, hasMoreMsgsBefore, false);
            }

            var before = await dbContext.Messages
                .Where(x => x.ChatId == query.ChatId &&
                    (
                        x.CreatedAt < firstUnreadMessage.CreatedAt ||
                        (
                            x.CreatedAt == firstUnreadMessage.CreatedAt &&
                            x.Id.CompareTo(firstUnreadMessage.Id) < 0
                        )
                    ))
                .OrderByDescending(x => x.CreatedAt)
                .ThenByDescending(x => x.Id)
                .Take(MessagesBefore)
                .SelectChatMessages(userContext.UserId, chat.Type)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var after = await dbContext.Messages
            .Where(x => x.ChatId == query.ChatId &&
                (
                    x.CreatedAt > firstUnreadMessage.CreatedAt ||
                    (
                        x.CreatedAt == firstUnreadMessage.CreatedAt &&
                        x.Id.CompareTo(firstUnreadMessage.Id) >= 0
                    )
                ))
            .OrderBy(x => x.CreatedAt)
            .ThenBy(x => x.Id)
            .Take(MessagesAfter)
            .SelectChatMessages(userContext.UserId, chat.Type)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

            before.Reverse();

            var messages = before.Concat(after).ToList();
            var hasMoreBefore = before.Count == MessagesBefore;
            var hasMoreAfter = after.Count == MessagesAfter;

            return new ChatMessagesResponse(messages, firstUnreadMessage.Id, hasMoreBefore, hasMoreAfter);
        }

        private async Task<UnreadMessageInfo?> GetFirstUnreadMessageAsync(
            Guid? lastReadMessageId,
            Guid chatId,
            CancellationToken cancellationToken)
        {
            if (lastReadMessageId is null)
                return await GetFirstChatMessage(chatId, cancellationToken);

            var lastReadMessage = await dbContext.Messages
                .Where(x => x.Id == lastReadMessageId.Value && x.ChatId == chatId)
                .Select(x => new { x.Id, x.CreatedAt })
                .SingleOrDefaultAsync(cancellationToken);

            if (lastReadMessage is null)
                return await GetFirstChatMessage(chatId, cancellationToken);

            return await dbContext.Messages
                .Where(x => x.ChatId == chatId && x.SenderId != userContext.UserId &&
                    (
                        x.CreatedAt > lastReadMessage.CreatedAt ||
                        (
                            x.CreatedAt == lastReadMessage.CreatedAt &&
                            x.Id.CompareTo(lastReadMessage.Id) > 0
                        )
                    ))
                .OrderBy(x => x.CreatedAt)
                .ThenBy(x => x.Id)
                .Select(x => new UnreadMessageInfo(x.Id, x.CreatedAt))
                .FirstOrDefaultAsync(cancellationToken);
        }

        private sealed record UnreadMessageInfo(Guid Id, DateTime CreatedAt);

        private async Task<UnreadMessageInfo?> GetFirstChatMessage(Guid chatId, CancellationToken cancellationToken)
        {
            return await dbContext.Messages
                .Where(x => x.ChatId == chatId && x.SenderId != userContext.UserId)
                .OrderBy(x => x.CreatedAt)
                .ThenBy(x => x.Id)
                .Select(x => new UnreadMessageInfo(x.Id, x.CreatedAt))
                .FirstOrDefaultAsync(cancellationToken);
        }

    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/chats/{chatId}/messages", async (
                Guid chatId,
                IQueryHandler<Query, ChatMessagesResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var messages = await handler.Handle(new(chatId), cancellationToken);
                return Results.Ok(messages);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}