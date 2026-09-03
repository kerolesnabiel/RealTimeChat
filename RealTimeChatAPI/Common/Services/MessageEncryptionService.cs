using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;

namespace RealTimeChatAPI.Common.Services;

public interface IMessageEncryptionService
{
    string Encrypt(string message);
    string Decrypt(string encryptedMessage);
}

internal class MessageEncryptionService : IMessageEncryptionService
{

    private readonly byte[] key;

    public MessageEncryptionService(IConfiguration config)
    {
        var secret = config["MESSAGE_ENCRYPTION_KEY"]
            ?? throw new InvalidOperationException("MESSAGE_ENCRYPTION_KEY is missing");

        key = SHA256.HashData(Encoding.UTF8.GetBytes(secret));
    }

    public string Encrypt(string message)
    {
        var nonce = RandomNumberGenerator.GetBytes(12);
        var plaintext = Encoding.UTF8.GetBytes(message);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(key, 16);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        return Convert.ToBase64String([.. nonce, .. tag, .. ciphertext]);
    }

    public string Decrypt(string encryptedMessage)
    {
        var data = Convert.FromBase64String(encryptedMessage);

        var nonce = data[..12];
        var tag = data[12..28];
        var ciphertext = data[28..];
        var plaintext = new byte[ciphertext.Length];

        using var aes = new AesGcm(key, 16);
        aes.Decrypt(nonce, ciphertext, tag, plaintext);

        return Encoding.UTF8.GetString(plaintext);
    }
}