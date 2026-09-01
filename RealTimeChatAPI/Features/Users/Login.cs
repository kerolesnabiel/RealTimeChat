using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

public record Command(string Username, string Password) : ICommand<TokenResult>;

internal sealed class Handler(
    ApplicationDbContext dbContext,
    IPasswordHasher passwordHasher,
    ITokenProvider tokenProvider,
    IConfiguration configuration)
    : ICommandHandler<Command, TokenResult>
{
    public async Task<TokenResult> Handle(
        Command command,
        CancellationToken cancellationToken)
    {
        User user = await dbContext.Users.SingleOrDefaultAsync
            (x => x.Username == command.Username, cancellationToken: cancellationToken)
                ?? throw new UnauthorizedAccessException("Invalid username or password");

        bool isValid = passwordHasher.Verify(command.Password, user.HashedPassword);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid username or password");

        string token = tokenProvider.Create(user);

        string refreshToken = tokenProvider.GenerateRefreshToken();
        user.RefreshToken = refreshToken;

        int.TryParse(configuration["Jwt:RefreshTokenExpirationInDays"], out int days);
        user.RefreshTokenExpiration = DateTime.UtcNow.AddDays(days);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new(user.Id, token, refreshToken);
    }
}

public sealed class Endpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/users/login", async (
            Command request,
            ICommandHandler<Command, TokenResult> handler,
            CancellationToken cancellationToken) =>
        {
            return await handler.Handle(request, cancellationToken);
        })
        .WithTags(Tags.Users);
    }
}