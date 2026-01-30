using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public enum PurchaseRequestStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    Rejected = 3,
    Closed = 4 // Converted to PO or Manually Closed
}

public enum PurchaseRequestPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

public class PurchaseRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RequestNumber { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    
    public string RequestedBy { get; set; } = string.Empty; // User Name or ID
    public string Department { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty; // Renamed from Description
    public PurchaseRequestPriority Priority { get; set; } = PurchaseRequestPriority.Medium;
    
    public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;
    
    public string? ApprovedBy { get; set; }
    public string? Remarks { get; set; } // Approval/Rejection Remarks

    public ICollection<PurchaseRequestItem> Items { get; set; } = new List<PurchaseRequestItem>();
}
