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
    public sealed record Query(int PageNumber = 1) : IQuery<IEnumerable<ChatDto>>;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : IQueryHandler<Query, IEnumerable<ChatDto>>
    {
        public async Task<IEnumerable<ChatDto>> Handle(Query command, CancellationToken cancellationToken)
        {
            int pageSize = 10;

            var chats = await dbContext.Chats.Where(x =>
                x.Members.Any(x => x.UserId == userContext.UserId))
                .OrderByDescending(x => x.LastMessageAt)
                .Skip((command.PageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.Image,
                    x.Type,
                    x.LastMessageAt,
                    LastMessage = x.Messages.OrderByDescending(m => m.CreatedAt)
                        .Select(m => new
                        {
                            m.Text,
                            m.DeletedAt,
                        }).FirstOrDefault(),
                    OtherMember = x.Type == ChatType.Direct ? x.Members
                        .Where(m => m.UserId != userContext.UserId)
                        .Select(m => new
                        {
                            m.User.Name,
                            m.User.Image
                        }).SingleOrDefault() : null,
                })
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return chats.Select(x => new ChatDto
            {
                Id = x.Id,
                Name = x.Type == ChatType.Direct ? x.OtherMember?.Name : x.Name,
                Image = x.Type == ChatType.Direct ? x.OtherMember?.Image : x.Image,
                Type = x.Type,
                LastMessageAt = x.LastMessageAt,
                LastMessagePreview = GetMessagePreview(x.LastMessage?.Text, x.LastMessage?.DeletedAt)
            });
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
                IQueryHandler<Query, IEnumerable<ChatDto>> handler,
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