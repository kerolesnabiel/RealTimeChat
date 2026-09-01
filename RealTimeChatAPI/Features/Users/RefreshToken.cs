using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;

namespace RealTimeChatAPI.Features.Users;

internal class RefreshToken
{
    public record Command(Guid UserId, string RefreshToken) : ICommand<TokenResult>;

    internal sealed class Handle(
        ApplicationDbContext dbContext,
        ITokenProvider tokenProvider,
        IConfiguration configuration) : ICommandHandler<Command, TokenResult>
    {
        async Task<TokenResult> ICommandHandler<Command, TokenResult>.Handle(Command command, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == command.UserId, cancellationToken);

            if (user == null ||
                user.RefreshTokenExpiration < DateTime.UtcNow ||
                user.RefreshToken != command.RefreshToken)
                throw new UnauthorizedAccessException("Invalid refresh token");

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
            app.MapPost("api/users/refresh-token", async (
                Command command,
                ICommandHandler<Command, TokenResult> handler,
                CancellationToken cancellationToken) =>
            {
                return await handler.Handle(command, cancellationToken);
            })
            .WithTags(Tags.Users);
        }
    }
}
