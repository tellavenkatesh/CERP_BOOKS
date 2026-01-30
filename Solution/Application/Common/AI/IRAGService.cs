using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Common.AI;

public interface IRAGService
{
    Task AddDocumentAsync(string content, string source, CancellationToken cancellationToken);
    Task<List<string>> SearchAsync(string query, int limit = 3, CancellationToken cancellationToken = default);
}
