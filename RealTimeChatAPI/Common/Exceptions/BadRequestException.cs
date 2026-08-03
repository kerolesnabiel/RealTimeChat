using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class BadRequestException(string message) 
    : AppException(message, HttpStatusCode.BadRequest)
{
}