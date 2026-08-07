
using FluentValidation;
using Mapster;
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

internal static class GetChat
{
    public sealed record Query(Guid ChatId) : IQuery<ChatDto>;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : IQueryHandler<Query, ChatDto>
    {
        public async Task<ChatDto> Handle(Query command, CancellationToken cancellationToken)
        {
            var chat = await dbContext.Chats.SingleOrDefaultAsync(x => x.Id == command.ChatId, cancellationToken)
                ?? throw new NotFoundException(nameof(Chat), command.ChatId.ToString());

            bool isMember = await dbContext.ChatMembers
                .AnyAsync(x => x.ChatId == chat.Id && x.UserId == userContext.UserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member in this chat.");

            ChatDto dto = chat.Adapt<ChatDto>();
            if (chat.Type != ChatType.Direct)
                return dto;

            var otherUser = await dbContext.ChatMembers
                .Include(x => x.User)
                .Where(x => x.ChatId == chat.Id && x.UserId != userContext.UserId)
                .Select(x => x.User)
                .AsNoTracking()
                .SingleAsync(cancellationToken);

            dto.Name = otherUser.Name;
            dto.Image = otherUser.Image;

            return dto;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/chats/{id}", async (
                Guid id,
                IQueryHandler<Query, ChatDto> handler,
                CancellationToken cancellationToken) =>
            {
                ChatDto chat = await handler.Handle(new(id), cancellationToken);
                return Results.Ok(chat);
            })
            .RequireAuthorization()
            .WithName(RouteNames.GetChat)
            .WithTags(Tags.Chats);
        }
    }
}