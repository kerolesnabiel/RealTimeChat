using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

internal static class Register
{
    public record Command(string Name, string Username, string Password) : ICommand<Guid>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Username)
                .NotEmpty()
                .Length(3, 25)
                .Matches(@"^[a-zA-Z0-9_]+$")
                .WithMessage("Username can only contain letters, numbers, and underscores.");

            RuleFor(x => x.Name).NotEmpty().Length(2, 25);

            RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        }
    }

    internal sealed class Handler(ApplicationDbContext dbContext, IPasswordHasher passwordHasher) 
        : ICommandHandler<Command, Guid>
    {
        public async Task<Guid> Handle(Command command, CancellationToken cancellationToken)
        {
            if(await dbContext.Users.AnyAsync(u => u.Username == command.Username, cancellationToken))
                throw new Exception("Username is already  used");  // edit later

            User user = new()
            {
                Name = command.Name,
                Username = command.Username,
                HashedPassword = passwordHasher.Hash(command.Password)
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync(cancellationToken);

            return user.Id;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("api/users/register", async (
                Command request, 
                ICommandHandler<Command, Guid> handler,
                CancellationToken cancellationToken) => 
            {
                await handler.Handle(request, cancellationToken);

                return Results.Created();
            });
        }
    }
}