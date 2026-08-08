using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, HttpStatusCode.NotFound) { }
    public NotFoundException(string resourceType, string resourceIdentifier)
        : base($"{resourceType} with Id: {resourceIdentifier} doesn't exist", HttpStatusCode.NotFound) { }

}