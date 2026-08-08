using System;
using Mapster;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Dtos;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Messages;

internal static class GetMessage
{
    public sealed record Query(Guid Id) : IQuery<MessageWithReceiptsDto>;
    internal sealed class Handler(
        ApplicationDbContext dbContext,
        IUserContext userContext
    ) : IQueryHandler<Query, MessageWithReceiptsDto>
    {
        public async Task<MessageWithReceiptsDto> Handle(Query query, CancellationToken cancellationToken)
        {
            var message = await dbContext.Messages.SingleOrDefaultAsync(x => x.Id == query.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(Message), query.Id.ToString());

            bool isMember = await dbContext.ChatMembers
                .AnyAsync(x => x.ChatId == message.ChatId && x.UserId == userContext.UserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("You can't access this message.");

            await dbContext.Entry(message).Collection(x => x.Receipts).LoadAsync(cancellationToken);

            return message.Adapt<MessageWithReceiptsDto>();
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/messages/{id}", async (
                Guid id,
                IQueryHandler<Query, MessageWithReceiptsDto> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var message = await handler.Handle(new(id), cancellationToken);
                return Results.Ok(message);
            })
            .RequireAuthorization()
            .WithName(RouteNames.GetMessage)
            .WithTags(Tags.Messages);
        }
    }
}