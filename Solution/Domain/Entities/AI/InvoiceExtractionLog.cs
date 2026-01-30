using System;
using System;

namespace CompreoBooks.Domain.Entities.AI;

public class InvoiceExtractionLog
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string RawJsonResponse { get; set; } = string.Empty;
    public DateTime ExtractionDate { get; set; } = DateTime.UtcNow;
    public bool IsSuccess { get; set; }
}
