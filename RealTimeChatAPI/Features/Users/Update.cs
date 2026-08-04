using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

internal static class Update
{
    public record Command(string? Name, string? Username, string? About) : ICommand;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Username)
                .Length(3, 25)
                .Matches(@"^[a-zA-Z0-9_]+$")
                .WithMessage("Username can only contain letters, numbers, and underscores.")
                .When(x => x.Username != null);

            RuleFor(x => x.Name).Length(2, 25).When(x => x.Name != null);

            RuleFor(x => x.About).MaximumLength(150);
        }
    }

    internal sealed class Handler(
        IUserContext userContext,
        ApplicationDbContext dbContext) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userContext.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), userContext.UserId.ToString());

            if (command.Username != null &&
                await dbContext.Users.AnyAsync(x => x.Username == command.Username, cancellationToken))
                throw new ConflictException("The username is already in use.");

            if (command.Username != null)
                user.Username = command.Username;
            if (command.Name != null)
                user.Name = command.Name;
            if (command.About != null)
                user.About = command.About;

            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPatch("api/users/me", async (
                Command command,
                ICommandHandler<Command> handler,
                CancellationToken cancellationToken) =>
            {
                await handler.Handle(command, cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization();
        }
    }
}