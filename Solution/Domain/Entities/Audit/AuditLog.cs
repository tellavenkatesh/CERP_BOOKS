using System;

namespace CompreoBooks.Domain.Entities.Audit;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EntityName { get; set; } = string.Empty; // e.g. "Invoice"
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // "Create", "Update", "Delete"
    public string UserId { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string OldValues { get; set; } = string.Empty; // JSON
    public string NewValues { get; set; } = string.Empty; // JSON
}
