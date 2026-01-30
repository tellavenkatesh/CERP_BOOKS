using System;
using System;

namespace CompreoBooks.Domain.Entities.AI;

public class AiChatLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserMessage { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
