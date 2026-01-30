using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public enum CreditNoteStatus
{
    Draft,
    Posted,
    Cancelled
}

public class CreditNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CreditNoteNumber { get; set; } = string.Empty;
    public DateTime CreditNoteDate { get; set; }
    
    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Party Customer { get; set; } = null!;

    public Guid? InvoiceId { get; set; }
    [ForeignKey(nameof(InvoiceId))]
    public Invoice? Invoice { get; set; }

    public string? Reason { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public CreditNoteStatus Status { get; set; } = CreditNoteStatus.Draft;

    public List<CreditNoteLine> Lines { get; set; } = new();
}
