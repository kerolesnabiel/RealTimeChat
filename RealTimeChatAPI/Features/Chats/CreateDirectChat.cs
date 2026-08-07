
using FluentValidation;
using Mapster;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Chats;

internal static class CreateDirectChat
{
    public sealed record Command(Guid UserId) : ICommand<ChatDto>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.UserId).NotEmpty();
        }
    }

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext) : ICommandHandler<Command, ChatDto>
    {
        public async Task<ChatDto> Handle(Command command, CancellationToken cancellationToken)
        {
            var sender = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userContext.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), userContext.UserId.ToString());
            var receiver = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == command.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), command.UserId.ToString());

            string chatKey = CreateChatKey(userContext.UserId, command.UserId);
            var chat = await dbContext.Chats.SingleOrDefaultAsync(x => x.ChatKey == chatKey, cancellationToken)
                ?? await CreateDirectChat(userContext.UserId, command.UserId, chatKey, cancellationToken);

            ChatDto dto = chat.Adapt<ChatDto>();
            dto.Name = receiver.Name;

            return dto;
        }

        private static string CreateChatKey(Guid user1Id, Guid user2Id)
        {
            return user1Id.CompareTo(user2Id) < 0 ? $"{user1Id}:{user2Id}" : $"{user2Id}:{user1Id}";
        }

        private async Task<Chat> CreateDirectChat(Guid senderId, Guid receiverId, string chatKey, CancellationToken cancellationToken)
        {
            Chat chat = new()
            {
                ChatKey = chatKey,
                CreatedByUserId = senderId,
                Members = [
                    new() {UserId = senderId},
                    new() {UserId = receiverId},
                ]
            };

            try
            {
                dbContext.Chats.Add(chat);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                return await dbContext.Chats
                    .Include(x => x.Members)
                    .SingleAsync(x => x.ChatKey == chat.ChatKey, cancellationToken);
            }

            return chat;
        }

        private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        {
            return ex.InnerException is SqlException sql &&
                   (sql.Number == 2601 || sql.Number == 2627);
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("api/chats/direct/{userId}", async (
                Guid userId,
                ICommandHandler<Command, ChatDto> handler,
                CancellationToken cancellationToken) =>
            {
                ChatDto chat = await handler.Handle(new(userId), cancellationToken);
                return Results.Ok(chat);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}