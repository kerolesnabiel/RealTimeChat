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
        var handler = serviceProvider.GetRequiredService<ICommandHandler<MarkMessagesAsDelivered.Command>>();
        await handler.Handle(new MarkMessagesAsDelivered.Command(), Context.ConnectionAborted);
    }

    public async Task MarkMessageAsDelivered(Guid messageId)
    {
        var handler = serviceProvider.GetRequiredService<ICommandHandler<MarkMessageAsDelivered.Command>>();
        await handler.Handle(new MarkMessageAsDelivered.Command(messageId), Context.ConnectionAborted);
    }
}