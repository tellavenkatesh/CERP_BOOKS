using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public enum InvoiceStatus
{
    Draft,
    Posted,
    Paid,
    Overdue,
    Cancelled,
    PartiallyPaid,
    Void
}

public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }

    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Party Customer { get; set; } = null!;

    public Guid? SalesOrderId { get; set; }
    [ForeignKey(nameof(SalesOrderId))]
    public SalesOrder? SalesOrder { get; set; }

    public Guid? DeliveryChallanId { get; set; }
    [ForeignKey(nameof(DeliveryChallanId))]
    public DeliveryChallan? DeliveryChallan { get; set; }

    public string? ReferenceNumber { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? PaymentTerms { get; set; }
    public string? Salesperson { get; set; }

    public decimal SubTotal { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }
    public decimal RoundOff { get; set; }
    public decimal TaxAmount { get; set; }
    
    // Tax Breakdown
    public decimal TotalCgstAmount { get; set; }
    public decimal TotalSgstAmount { get; set; }
    public decimal TotalIgstAmount { get; set; }

    public decimal TotalAmount { get; set; }
    
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount => TotalAmount - PaidAmount;

    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }

    public DateTime Created { get; set; } = DateTime.UtcNow;

    public List<InvoiceLine> Items { get; set; } = new();
}
