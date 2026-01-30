using System;

namespace CompreoBooks.Domain.Entities.Sales;

public enum EstimateActivityType
{
    Created = 0,
    Sent = 1,
    Viewed = 2,
    Accepted = 3,
    Declined = 4,
    Expired = 5
}

public class EstimateActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid EstimateId { get; set; }
    // Navigation property if needed, but keeping it loose for log speed often valid
    
    public EstimateActivityType ActivityType { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
}
