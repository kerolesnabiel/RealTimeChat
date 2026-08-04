using System.Net;

namespace RealTimeChatAPI.Common.Exceptions;

public class ConflictException(string message) : AppException(message, HttpStatusCode.Conflict) { }