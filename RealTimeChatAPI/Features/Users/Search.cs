using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;

namespace RealTimeChatAPI.Features.Users;

internal static class Search
{
    public sealed record UserDto(Guid Id, string Username, string Name, string? Image);
    public sealed record Query(string SearchName) : IQuery<IEnumerable<UserDto>>;

    internal sealed class Handler(ApplicationDbContext dbContext, IUserContext userContext) : IQueryHandler<Query, IEnumerable<UserDto>>
    {
        public async Task<IEnumerable<UserDto>> Handle(Query query, CancellationToken cancellationToken)
        {
            var search = query.SearchName.Trim();

            if (search.Length < 3)
                return [];

            var users = await dbContext.Users
                .Where(x => (x.Username.StartsWith(search) || x.Name.Contains(search)) &&
                    x.Id != userContext.UserId)
                .OrderByDescending(x => x.Username.StartsWith(search))
                .ThenBy(x => x.Username)
                .ThenBy(x => x.Name)
                .Take(5)
                .Select(x => x.Adapt<UserDto>())
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return users;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/users", async (
                [FromQuery] string SearchName,
                IQueryHandler<Query, IEnumerable<UserDto>> Handler,
                CancellationToken cancellationToken) =>
            {
                var users = await Handler.Handle(new(SearchName), cancellationToken);
                return Results.Ok(users);
            })
            .RequireAuthorization()
            .WithTags(Tags.Users);
        }
    }
}