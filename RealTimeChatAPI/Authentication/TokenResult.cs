namespace RealTimeChatAPI.Authentication;

record TokenResult(Guid UserId, string Token, string RefreshToken);