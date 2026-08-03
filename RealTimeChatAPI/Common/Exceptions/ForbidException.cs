using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class ForbidException : AppException
{
    public ForbidException()
        : base("You don't have permission to access this resource", HttpStatusCode.Forbidden)
    {
    }

    public ForbidException(string resourceType) :
    base($"You don't have permission to access this {resourceType}", HttpStatusCode.Forbidden)
    {
    }
}