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
            RuleFor(x => x.Text).NotEmpty().MaximumLength(4000);
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
            var chat = await dbContext.Chats.SingleOrDefaultAsync(x => x.Id == command.ChatId, cancellationToken)
                ?? throw new NotFoundException(nameof(Chat), command.ChatId.ToString());

            bool isMember = await dbContext.ChatMembers
                .AnyAsync(x => x.ChatId == chat.Id && x.UserId == userContext.UserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("You are not a member of this chat.");

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
                await dbContext.Entry(chat).Collection(x => x.Members).LoadAsync(cancellationToken);
                string receiverId = chat.Members.Select(x => x.UserId).Single(x => x != userContext.UserId).ToString();
                await hub.Clients.User(receiverId).SendAsync(ChatHubEvents.MessageReceived, dto, cancellationToken);
            }
            else
                await hub.Clients.GroupExcept(chat.Id.ToString(), userContext.UserId.ToString())
                    .SendAsync(ChatHubEvents.MessageReceived, dto, cancellationToken);

            return dto;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        private sealed record Request(string Message);
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("api/chats/{id}/messages", async (
                Guid id,
                Request request,
                ICommandHandler<Command, MessageDto> handler,
                CancellationToken cancellationToken) =>
            {
                MessageDto message = await handler.Handle(new(id, request.Message), cancellationToken);
                return Results.Created($"api/messages/{message.Id}", message);
            })
            .RequireAuthorization()
            .WithTags(Tags.Chats);
        }
    }
}