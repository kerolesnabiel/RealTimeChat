using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Features.Users.Common.Messaging;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

internal static class Register
{
    public record Command(string Name, string Username, string Password) : ICommand<Guid>;

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
            app.MapPost("users/register", async (
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