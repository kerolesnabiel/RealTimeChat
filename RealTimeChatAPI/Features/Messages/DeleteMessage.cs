using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Hubs;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Messages;

internal static class DeleteMessage
{
    public sealed record Command(Guid Id) : ICommand;

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext,
        IHubContext<ChatHub> hub
    ) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var message = await dbContext.Messages
                .SingleOrDefaultAsync(x => x.Id == command.Id && x.DeletedAt == null, cancellationToken)
                ?? throw new NotFoundException(nameof(Message), command.Id.ToString());

            bool isAuthorized = await dbContext.ChatMembers.AnyAsync(x =>
                x.ChatId == message.ChatId &&
                x.UserId == userContext.UserId &&
                (x.UserId == message.SenderId || x.Role == ChatMemberRoles.Admin), cancellationToken);
            if (!isAuthorized)
                throw new ForbiddenException("You don't have access to delete this message");

            var deadline = message.CreatedAt.AddMinutes(15);
            if (DateTime.UtcNow > deadline)
                throw new ForbiddenException("Messages can only be deleted within 15 minutes of sending.");

            var chat = await dbContext.Chats.Select(x => new { x.Id, x.Type }).SingleOrDefaultAsync(x => x.Id == message.ChatId, cancellationToken)
                    ?? throw new NotFoundException("The message's chat is not found.");

            message.DeletedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);

            var deletedMessage = new { Id = message.Id, DeletedAt = message.DeletedAt };
            if (chat.Type == ChatType.Direct)
            {
                var receiverId = await dbContext.ChatMembers
                    .Where(x => x.ChatId == chat.Id && x.UserId != userContext.UserId)
                    .Select(x => x.UserId).SingleAsync(cancellationToken);
                await hub.Clients.User(receiverId.ToString())
                    .SendAsync(ChatHubEvents.MessageDeleted, deletedMessage, cancellationToken);
            }
            else
            {
                await hub.Clients.GroupExcept(chat.Id.ToString(), userContext.UserId.ToString())
                    .SendAsync(ChatHubEvents.MessageDeleted, deletedMessage, cancellationToken);
            }
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("api/messages/{id}", async (
                Guid id,
                ICommandHandler<Command> handler,
                CancellationToken cancellationToken) =>
            {
                await handler.Handle(new(id), cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithTags(Tags.Messages);
        }
    }
}