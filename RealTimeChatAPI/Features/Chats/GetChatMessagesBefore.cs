using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class GetChatMessagesBefore
{
    public sealed record ChatMessagesResponse(IReadOnlyList<ChatMessageDto> Messages, bool HasMoreBefore);

    public sealed record Query(Guid ChatId, Guid MessageId) : IQuery<ChatMessagesResponse>;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : IQueryHandler<Query, ChatMessagesResponse>
    {
        private const int MessagesCount = 20;

        public async Task<ChatMessagesResponse> Handle(Query query, CancellationToken cancellationToken)
        {
            var chat = await dbContext.Chats
                .Where(x => x.Id == query.ChatId && x.Members.Any(m => m.UserId == userContext.UserId))
                .Select(x => new { x.Id, x.Type })
                .SingleOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException(nameof(Chat), query.ChatId.ToString());

            var message = await dbContext.Messages
                .Where(x => x.Id == query.MessageId && x.ChatId == query.ChatId)
                .Select(x => new { x.Id, x.CreatedAt })
                .SingleOrDefaultAsync(cancellationToken)
                ?? throw new NotFoundException(nameof(Message), query.MessageId.ToString());

            var messages = await dbContext.Messages
                .Where(x => x.ChatId == query.ChatId &&
                    (
                        x.CreatedAt < message.CreatedAt ||
                        (
                            x.CreatedAt == message.CreatedAt &&
                            x.Id.CompareTo(message.Id) < 0
                        )
                    ))
                .OrderByDescending(x => x.CreatedAt)
                .ThenByDescending(x => x.Id)
                .Take(MessagesCount + 1)
                .SelectChatMessages(userContext.UserId, chat.Type)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var hasMoreBefore = messages.Count > MessagesCount;
            if (hasMoreBefore)
                messages.RemoveAt(messages.Count - 1);

            messages.Reverse();

            return new ChatMessagesResponse(messages, hasMoreBefore);
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/chats/{chatId}/messages/before/{messageId}", async (
                Guid chatId,
                Guid messageId,
                IQueryHandler<Query, ChatMessagesResponse> handler,
                CancellationToken cancellationToken) =>
            {
                var messages = await handler.Handle(new(chatId, messageId), cancellationToken);
                return Results.Ok(messages);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}