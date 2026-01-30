using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public enum OrderStatus
{
    Draft,
    Confirmed,
    PartiallyDelivered,
    FullyDelivered,
    PartiallyInvoiced, 
    FullyInvoiced,
    Closed,
    Cancelled
}

public class SalesOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    
    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Party Customer { get; set; } = null!;

    public string? CustomerPONumber { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? PaymentTerms { get; set; }
    public string? Salesperson { get; set; }
    public string? PlaceOfSupply { get; set; }

    public decimal TotalAmount { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }

    // Tax Breakdown
    public decimal TotalCgstAmount { get; set; }
    public decimal TotalSgstAmount { get; set; }
    public decimal TotalIgstAmount { get; set; }

    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Draft;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public OrderType OrderType { get; set; } = OrderType.Standard;
    
    // Fulfillment Tracking
    public OrderStatus DeliveryStatus { get; set; } = OrderStatus.Draft;
    public OrderStatus InvoiceStatus { get; set; } = OrderStatus.Draft;

    // Public View & Approval
    public Guid? PublicViewToken { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ViewedAt { get; set; }

    public List<SalesOrderItem> Items { get; set; } = new();
}

public enum OrderType
{
    Standard,       // SO -> DC -> Invoice
    Service,        // SO -> Invoice (No DC)
    GoodsAutoDC     // SO -> Invoice (Auto Create DC)
}
