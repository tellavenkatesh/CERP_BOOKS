using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public enum PurchaseOrderStatus
{
    Draft = 0,
    Sent = 1,
    PartiallyReceived = 2,
    FullyReceived = 3,
    Closed = 4,
    Cancelled = 5
}


public enum PurchaseOrderType
{
    Standard = 0,
    Service = 1,
    Blanket = 2
}

public enum ApprovalStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

public class PurchaseOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    
    public Guid VendorId { get; set; }
    public Party Vendor { get; set; } = null!;

    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public string ShipmentPreference { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Adjustment { get; set; }
    public decimal TotalAmount { get; set; }

    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    
    // New Fields
    public PurchaseOrderType OrderType { get; set; } = PurchaseOrderType.Standard;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;

    public string Notes { get; set; } = string.Empty;
    public string TermsAndConditions { get; set; } = string.Empty;
    
    public Guid? PurchaseRequestId { get; set; }
    public PurchaseRequest? PurchaseRequest { get; set; }

    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}

