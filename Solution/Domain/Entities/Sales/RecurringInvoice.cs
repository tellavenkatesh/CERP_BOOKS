using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public enum RecurringInterval
{
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Yearly
}

public enum RecurringStatus
{
    Active,
    Paused,
    Stopped
}

public class RecurringInvoice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ProfileName { get; set; } = string.Empty; // e.g. "Monthly AMC"
    
    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Party Customer { get; set; } = null!;

    public RecurringInterval Interval { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? LastRunDate { get; set; }
    public DateTime NextRunDate { get; set; }
    
    public RecurringStatus Status { get; set; } = RecurringStatus.Active;
    
    // Template Data for Invoice Generation
    public string PaymentTerms { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }

    public ICollection<RecurringInvoiceItem> Items { get; set; } = new List<RecurringInvoiceItem>();
}

public class RecurringInvoiceItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid RecurringInvoiceId { get; set; }
    [ForeignKey(nameof(RecurringInvoiceId))]
    public RecurringInvoice RecurringInvoice { get; set; } = null!;

    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
}
