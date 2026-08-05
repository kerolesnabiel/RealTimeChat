using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealTimeChatAPI.Authentication;
using RealTimeChatAPI.Common.Endpoints;
using RealTimeChatAPI.Common.Exceptions;
using RealTimeChatAPI.Common.Messaging;
using RealTimeChatAPI.Database;
using RealTimeChatAPI.Models;
using RealTimeChatAPI.Storage;

namespace RealTimeChatAPI.Features.Users;

internal static class ChangeImage
{
    public sealed record Command(IFormFile File) : ICommand<string>;

    public sealed class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.File)
            .Must(file => file!.ContentType.StartsWith("image/"))
            .WithMessage("Only image files are allowed.")
            .Must(file => file!.Length <= 5 * 1024 * 1024) // 5MB
            .WithMessage("Image must be less than or equal to 5MB.")
            .When(x => x.File != null);
        }
    }

    internal sealed class Handler(
        IUserContext userContext,
        ApplicationDbContext dbContext,
        IBlobStorageService blobStorageService) : ICommandHandler<Command, string>
    {
        public async Task<string> Handle(Command command, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == userContext.UserId, cancellationToken)
                ?? throw new NotFoundException(nameof(User), userContext.UserId.ToString());

            using var stream = command.File.OpenReadStream();
            string filename = $"user-{user.Id}-img-{Guid.NewGuid()}.{command.File.ContentType.Split('/')[1]}";

            var imageUrl = await blobStorageService.UploadToBlob(stream, filename, ContainerNames.Users);
            user.Image = imageUrl;
            await dbContext.SaveChangesAsync(cancellationToken);

            return imageUrl;
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("api/users/me/image", async (
                IFormFile? file,
                ICommandHandler<Command, string> handler,
                CancellationToken cancellationToken
            ) =>
            {
                if (file == null)
                    throw new BadRequestException("Image file is required.");

                string imageUrl = await handler.Handle(new(file), cancellationToken);
                return Results.Ok(imageUrl);
            })
            .RequireAuthorization()
            .DisableAntiforgery()
            .WithTags(Tags.Users);
        }
    }
}