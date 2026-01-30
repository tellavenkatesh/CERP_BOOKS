using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Purchase;

public enum DebitNoteStatus
{
    Draft,
    Posted,
    Cancelled
}

public class DebitNote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string DebitNoteNumber { get; set; } = string.Empty;
    public DateTime DebitNoteDate { get; set; }
    
    public Guid VendorId { get; set; }
    [ForeignKey(nameof(VendorId))]
    public Party Vendor { get; set; } = null!;

    public Guid? BillId { get; set; }
    [ForeignKey(nameof(BillId))]
    public Bill? Bill { get; set; }

    public string? Reason { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public DebitNoteStatus Status { get; set; } = DebitNoteStatus.Draft;

    public List<DebitNoteLine> Lines { get; set; } = new();
}
