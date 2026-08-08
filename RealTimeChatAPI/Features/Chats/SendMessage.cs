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

namespace RealTimeChatAPI.Features.Chats;

internal static class SendMessage
{
    public sealed record Command(Guid ChatId, string Text) : ICommand<MessageDto>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Text)
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Message text cannot be empty.")
                .MaximumLength(4000);
            RuleFor(x => x.ChatId).NotEmpty();
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
            var chat = await dbContext.Chats.SingleOrDefaultAsync(x =>
                    x.Id == command.ChatId &&
                    x.Members.Any(x => x.UserId == userContext.UserId), cancellationToken)
                ?? throw new NotFoundException(nameof(Chat), command.ChatId.ToString());

            Message message = new()
            {
                ChatId = chat.Id,
                SenderId = userContext.UserId,
                Text = command.Text.Trim(),
            };

            dbContext.Messages.Add(message);
            chat.LastMessageAt = message.CreatedAt;
            await dbContext.SaveChangesAsync(cancellationToken);

            var dto = message.Adapt<MessageDto>();

            if (chat.Type == ChatType.Direct)
            {
                var receiverId = await dbContext.ChatMembers
                    .Where(x => x.ChatId == chat.Id && x.UserId != userContext.UserId)
                    .Select(x => x.UserId).SingleAsync(cancellationToken);
                await hub.Clients.User(receiverId.ToString()).SendAsync(ChatHubEvents.MessageReceived, dto, cancellationToken);
            }
            else
                await hub.Clients.GroupExcept(chat.Id.ToString(), userContext.UserId.ToString())
                    .SendAsync(ChatHubEvents.MessageReceived, dto, cancellationToken);

            return dto;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        private sealed record Request(string Text);
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("api/chats/{id}/messages", async (
                Guid id,
                Request request,
                ICommandHandler<Command, MessageDto> handler,
                CancellationToken cancellationToken) =>
            {
                MessageDto message = await handler.Handle(new(id, request.Text), cancellationToken);
                return Results.CreatedAtRoute(RouteNames.GetMessage, new { message.Id }, message);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}