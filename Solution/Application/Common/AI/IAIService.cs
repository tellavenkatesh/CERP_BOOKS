using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Common.AI;

public interface IAIService
{
    Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken);
    Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken);
}
