using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public enum DeliveryChallanStatus
{
    Draft,
    Dispatched,
    Delivered,
    Invoiced,
    Cancelled
}

public enum DeliveryPurpose
{
    Sale,
    BranchTransfer,
    JobWork,
    Sample,
    Other
}

public class DeliveryChallan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ChallanNumber { get; set; } = string.Empty;
    public DateTime ChallanDate { get; set; }
    
    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Party Customer { get; set; } = null!;

    public Guid? SalesOrderId { get; set; }
    [ForeignKey(nameof(SalesOrderId))]
    public SalesOrder? SalesOrder { get; set; }

    public string? DeliveryAddress { get; set; }
    public string? VehicleNumber { get; set; }
    public string? EWayBillNumber { get; set; }
    public DeliveryPurpose Purpose { get; set; } = DeliveryPurpose.Sale;
    public DeliveryChallanStatus Status { get; set; } = DeliveryChallanStatus.Draft;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public string? ReferenceNumber { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? ChallanType { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Adjustment { get; set; }
    public decimal RoundOff { get; set; }
    public decimal TotalAmount { get; set; }

    public string? Notes { get; set; }

    public List<DeliveryChallanLine> Lines { get; set; } = new();
}
