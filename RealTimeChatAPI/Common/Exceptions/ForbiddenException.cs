using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class ForbiddenException : AppException
{
    public ForbiddenException() : base("You don't have permission to access this resource", HttpStatusCode.Forbidden) { }

    public ForbiddenException(string message) : base(message, HttpStatusCode.Forbidden) { }
}