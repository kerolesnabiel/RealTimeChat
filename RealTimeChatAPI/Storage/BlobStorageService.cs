using Azure.Storage.Blobs;

namespace RealTimeChatAPI.Storage;

public interface IBlobStorageService
{
    Task<string> UploadToBlob(Stream data, string filename, string containerName);
}

internal class BlobStorageService(BlobServiceClient blobServiceClient) : IBlobStorageService
{
    public async Task<string> UploadToBlob(Stream data, string filename, string containerName)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

        var blobClient = containerClient.GetBlobClient(filename);

        await blobClient.UploadAsync(data);

        return blobClient.Uri.ToString();
    }
}