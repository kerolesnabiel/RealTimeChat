using System;
using Mapster;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;

namespace RealTimeChatAPI.Features.Users;

internal static class GetById
{
    public sealed record UserDto(Guid Id, string Name, string Username, string? Image, string? About);

    public sealed record Query(Guid UserId) : IQuery<UserDto>;

    internal sealed class Handler(ApplicationDbContext dbContext) : IQueryHandler<Query, UserDto>
    {
        public async Task<UserDto> Handle(Query query, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == query.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), query.UserId.ToString());

            return user.Adapt<UserDto>();
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("api/users/{id}", async (
                Guid id,
                IQueryHandler<Query, UserDto> handler,
                CancellationToken cancellationToken) =>
            {
                var user = await handler.Handle(new(id), cancellationToken);
                return Results.Ok(user);
            })
            .RequireAuthorization()
            .WithTags(Tags.Users);
        }
    }
}