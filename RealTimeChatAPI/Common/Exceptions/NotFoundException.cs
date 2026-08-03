using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class NotFoundException(string resourceType, string resourceIdentifier)
    : AppException($"{resourceType} with Id: {resourceIdentifier} doesn't exist", HttpStatusCode.NotFound)
{
}