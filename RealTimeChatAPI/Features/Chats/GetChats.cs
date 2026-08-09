using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;

namespace RealTimeChatAPI.Features.Chats;

internal static class GetChats
{
    public sealed record GetChatsResponse(
        IReadOnlyList<ChatDto> Chats,
        int PageNumber,
        int PageSize,
        bool HasNextPage
    );

    public sealed record Query(int PageNumber = 1) : IQuery<GetChatsResponse>;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : IQueryHandler<Query, GetChatsResponse>
    {
        private const int PageSize = 15;

        public async Task<GetChatsResponse> Handle(Query query, CancellationToken cancellationToken)
        {
            var userId = userContext.UserId;

            var chats = await dbContext.Chats
                .Where(chat => chat.Members.Any(m => m.UserId == userId))
                .OrderByDescending(chat => chat.LastMessageAt)
                .ThenByDescending(chat => chat.Id)
                .Skip((query.PageNumber - 1) * PageSize)
                .Take(PageSize + 1)
                .Select(chat => new
                {
                    Chat = chat,
                    Member = chat.Members
                            .Where(m => m.UserId == userId)
                            .Select(m => new
                            {
                                m.LastReadMessageId,
                                LastReadAt = m.LastReadMessage!.CreatedAt
                            })
                            .Single()
                })
                .Select(x => new
                {
                    x.Chat.Id,
                    x.Chat.Name,
                    x.Chat.Image,
                    x.Chat.Type,
                    x.Chat.LastMessageAt,

                    LastMessage = x.Chat.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .ThenByDescending(m => m.Id)
                        .Select(m => new { m.Text, m.DeletedAt })
                        .FirstOrDefault(),

                    OtherMember = x.Chat.Type == ChatType.Direct
                        ? x.Chat.Members
                            .Where(m => m.UserId != userId)
                            .Select(m => new { m.User.Name, m.User.Image })
                            .SingleOrDefault()
                        : null,

                    UnreadMessagesCount = x.Chat.Messages.Count(m => m.SenderId != userId &&
                        (
                            x.Member.LastReadMessageId == null ||
                            m.CreatedAt > x.Member.LastReadAt ||
                            (
                                m.CreatedAt == x.Member.LastReadAt &&
                                m.Id > x.Member.LastReadMessageId
                            )
                        ))
                })
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            bool hasNextPage = chats.Count > PageSize;
            if (hasNextPage)
                chats.RemoveAt(chats.Count - 1);

            var chatsDto = chats
                .Select(x => new ChatDto
                {
                    Id = x.Id,
                    Name = x.Type == ChatType.Direct ? x.OtherMember?.Name : x.Name,
                    Image = x.Type == ChatType.Direct ? x.OtherMember?.Image : x.Image,
                    Type = x.Type,
                    LastMessageAt = x.LastMessageAt,
                    LastMessagePreview = GetMessagePreview(x.LastMessage?.Text, x.LastMessage?.DeletedAt),
                    UnreadMessagesCount = x.UnreadMessagesCount
                })
                .ToList();

            return new(chatsDto, query.PageNumber, PageSize, hasNextPage);
        }

        private static string? GetMessagePreview(string? text, DateTime? deletedAt)
        {
            if (deletedAt != null)
                return "This message was deleted";

            if (string.IsNullOrWhiteSpace(text))
                return null;

            const int maxLength = 80;
            return text.Length <= maxLength ? text : $"{text[..maxLength].TrimEnd()}...";
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/chats", async (
                IQueryHandler<Query, GetChatsResponse> handler,
                CancellationToken cancellationToken,
                [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1) =>
            {
                var chats = await handler.Handle(new(pageNumber), cancellationToken);
                return Results.Ok(chats);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}