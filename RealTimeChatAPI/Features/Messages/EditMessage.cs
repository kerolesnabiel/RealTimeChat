using FluentValidation;
using Mapster;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Constants;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Hubs;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Messages;

internal static class EditMessage
{
    public sealed record Command(Guid Id, string Text) : ICommand<MessageDto>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Text)
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Message text cannot be empty.")
                .MaximumLength(4000);
        }
    }

    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext,
        IHubContext<ChatHub> hub
    ) : ICommandHandler<Command, MessageDto>
    {
        public async Task<MessageDto> Handle(Command command, CancellationToken cancellationToken)
        {
            var message = await dbContext.Messages
                .SingleOrDefaultAsync(x =>
                    x.Id == command.Id &&
                    x.SenderId == userContext.UserId &&
                    x.DeletedAt == null, cancellationToken)
                ?? throw new NotFoundException(nameof(Message), command.Id.ToString());

            var deadline = message.CreatedAt.AddMinutes(15);
            if (DateTime.UtcNow > deadline)
                throw new ForbiddenException("Messages can only be edited within 15 minutes of sending.");

            var chat = await dbContext.Chats.Select(x => new { x.Id, x.Type }).SingleOrDefaultAsync(x => x.Id == message.ChatId, cancellationToken)
                    ?? throw new NotFoundException("The message's chat is not found.");

            message.Text = command.Text.Trim();
            message.EditedAt = DateTime.UtcNow;
            await dbContext.MessageReceipts.Where(x => x.MessageId == message.Id).ExecuteDeleteAsync(cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            var dto = message.Adapt<MessageDto>();

            if (chat.Type == ChatType.Direct)
            {
                var receiverId = await dbContext.ChatMembers
                    .Where(x => x.ChatId == chat.Id && x.UserId != userContext.UserId)
                    .Select(x => x.UserId).SingleAsync(cancellationToken);
                await hub.Clients.User(receiverId.ToString()).SendAsync(ChatHubEvents.MessageEdited, dto, cancellationToken);
            }
            else
                await hub.Clients.GroupExcept(chat.Id.ToString(), userContext.UserId.ToString())
                    .SendAsync(ChatHubEvents.MessageEdited, dto, cancellationToken);

            return dto;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        private sealed record Request(string Text);
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPatch("api/messages/{id}", async (
                Guid id,
                Request request,
                ICommandHandler<Command, MessageDto> handler,
                CancellationToken cancellationToken) =>
            {
                MessageDto message = await handler.Handle(new(id, request.Text), cancellationToken);
                return Results.Ok(message);
            })
            .RequireAuthorization()
            .WithTags(Tags.Messages);
        }
    }
}