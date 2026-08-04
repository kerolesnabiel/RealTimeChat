using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

internal static class ChangePassword
{
    public sealed record Command(string Password, string NewPassword) : ICommand;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Password).NotEmpty();
            RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
        }
    }

    internal sealed class Handler(
        IUserContext userContext,
        ApplicationDbContext dbContext,
        IPasswordHasher passwordHasher) : ICommandHandler<Command>
    {
        public async Task Handle(Command command, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userContext.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), userContext.UserId.ToString());

            bool isValid = passwordHasher.Verify(command.Password, user.HashedPassword);
            if (!isValid)
                throw new BadRequestException("The current password is incorrect.");

            user.HashedPassword = passwordHasher.Hash(command.NewPassword);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("api/users/me/change-password", async (
                Command command,
                ICommandHandler<Command> handler,
                CancellationToken cancellationToken) =>
            {
                await handler.Handle(command, cancellationToken);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithTags(Tags.Users);
        }
    }
}