using Pgvector;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.AI;

public class RagDocument
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    
    [Column(TypeName = "vector(384)")] // Mistral usually 4096, but all-minilm is 384. Adjust based on model.
    public Vector? Embedding { get; set; }
}
