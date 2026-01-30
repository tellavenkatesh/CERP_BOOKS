using System;

namespace CompreoBooks.Domain.Entities.Sales;

public class EstimateVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid EstimateId { get; set; }
    public Estimate Estimate { get; set; } = null!;

    public int VersionNumber { get; set; }
    
    // Serialized JSON of the Estimate at this point in time
    public string SnapshotJson { get; set; } = string.Empty;

    public string CreatedBy { get; set; } = string.Empty; // "Seller" or "Customer"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
