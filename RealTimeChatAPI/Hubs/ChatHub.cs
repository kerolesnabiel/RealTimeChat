using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Features.Chats;

namespace RealTimeChatAPI.Hubs;

[Authorize]
internal class ChatHub(IServiceProvider serviceProvider) : Hub
{
    public override Task OnConnectedAsync()
    {
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        return base.OnDisconnectedAsync(exception);
    }

    public async Task MarkMessagesAsDelivered()
    {
        Guid.TryParse(Context.UserIdentifier, out Guid userId);
        var handler = serviceProvider.GetRequiredService<ICommandHandler<MarkMessagesAsDelivered.Command>>();
        await handler.Handle(new MarkMessagesAsDelivered.Command(userId), Context.ConnectionAborted);
    }

    public async Task MarkMessageAsDelivered(Guid messageId)
    {
        Guid.TryParse(Context.UserIdentifier, out Guid userId);
        var handler = serviceProvider.GetRequiredService<ICommandHandler<MarkMessageAsDelivered.Command>>();
        await handler.Handle(new MarkMessageAsDelivered.Command(messageId, userId), Context.ConnectionAborted);
    }

    public async Task MarkMessagesAsReadUpTo(Guid messageId)
    {
        Guid.TryParse(Context.UserIdentifier, out Guid userId);
        var handler = serviceProvider.GetRequiredService<ICommandHandler<MarkMessagesAsReadUpTo.Command>>();
        await handler.Handle(new MarkMessagesAsReadUpTo.Command(messageId, userId), Context.ConnectionAborted);
    }
}