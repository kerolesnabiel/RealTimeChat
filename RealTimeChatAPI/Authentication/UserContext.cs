using System.Security.Claims;
using RealTimeChatAPI.Common.Exceptions;

namespace RealTimeChatAPI.Authentication;

public interface IUserContext
{
    Guid UserId { get; }
}

internal sealed class UserContext(IHttpContextAccessor httpContextAccessor) : IUserContext
{
    public Guid UserId
    {
        get
        {
            string? value = httpContextAccessor.HttpContext?
                .User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(value, out Guid userId)
                ? userId
                : throw new UserContextUnavailableException();
        }
    }
}
