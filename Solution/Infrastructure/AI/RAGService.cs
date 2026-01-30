using CompreoBooks.Application.Common.AI;
using CompreoBooks.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Infrastructure.AI;

public class RAGService : IRAGService
{
    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;

    public RAGService(IApplicationDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task AddDocumentAsync(string content, string source, CancellationToken cancellationToken)
    {
        var embedding = await _aiService.GenerateEmbeddingAsync(content, cancellationToken);
        
        var ragDoc = new Domain.Entities.AI.RagDocument
        {
            Content = content,
            Source = source,
            Embedding = new Vector(embedding)
        };
        
        _context.RagDocuments.Add(ragDoc);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<string>> SearchAsync(string query, int limit = 3, CancellationToken cancellationToken = default)
    {
        var queryEmbedding = await _aiService.GenerateEmbeddingAsync(query, cancellationToken);
        var vector = new Vector(queryEmbedding);

        var results = await _context.RagDocuments
            .OrderBy(x => x.Embedding!.CosineDistance(vector))
            .Take(limit)
            .Select(x => x.Content)
            .ToListAsync(cancellationToken);

        return results;
    }
}
