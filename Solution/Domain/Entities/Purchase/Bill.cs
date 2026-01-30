using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public enum BillStatus
{
    Draft = 0,
    Posted = 1,
    Paid = 2,
    Void = 3,
    PartiallyPaid = 4
}

public enum MatchStatus
{
    Pending = 0,
    Matched = 1,
    Mismatch = 2,
    Manual = 3
}

public class Bill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string BillNumber { get; set; } = string.Empty;
    public string VendorBillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public Guid VendorId { get; set; }
    public Party Vendor { get; set; } = null!;

    public Guid? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public Guid? GrnId { get; set; }
    public Grn? Grn { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    
    // TDS Section
    public string? TdsCategory { get; set; }
    public decimal TdsRate { get; set; }
    public decimal TdsAmount { get; set; }
    public decimal NetPayable => TotalAmount - TdsAmount;

    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount => NetPayable - PaidAmount;

    public BillStatus Status { get; set; } = BillStatus.Draft;
    public MatchStatus MatchStatus { get; set; } = MatchStatus.Pending;

    public ICollection<BillLine> Items { get; set; } = new List<BillLine>();
}
