using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public sealed class UserContextUnavailableException()
    : AppException("User context is unavailable", HttpStatusCode.Unauthorized)
{

}