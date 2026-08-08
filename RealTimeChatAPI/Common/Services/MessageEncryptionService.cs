using Microsoft.AspNetCore.DataProtection;

namespace RealTimeChatAPI.Common.Services;

public interface IMessageEncryptionService
{
    string Encrypt(string message);
    string Decrypt(string encryptedMessage);
}

internal class MessageEncryptionService(IDataProtectionProvider provider) : IMessageEncryptionService
{
    private readonly IDataProtector protector = provider.CreateProtector("Chat.Messages");

    public string Encrypt(string message)
        => protector.Protect(message);

    public string Decrypt(string encryptedMessage)
        => protector.Unprotect(encryptedMessage);
}