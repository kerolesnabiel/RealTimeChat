
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;

namespace RealTimeChatAPI.Features.Users;

internal static class Delete
{
    public sealed record Command : ICommand;

    internal sealed class Handler(IUserContext userContext, ApplicationDbContext dbContext)
        : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userContext.UserId, cancellationToken);

            if (user == null)
                return;

            dbContext.Users.Remove(user);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("api/users/me", async (
                ICommandHandler<Command> handler,
                CancellationToken cancellationToken) =>
            {
                await handler.Handle(new(), cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithTags(Tags.Users);
        }
    }
}