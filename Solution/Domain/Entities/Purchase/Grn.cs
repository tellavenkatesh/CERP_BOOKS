using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public enum GrnStatus
{
    Draft = 0,
    Confirmed = 1,
    Cancelled = 2
}

public class Grn
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string GrnNumber { get; set; } = string.Empty;
    public DateTime GrnDate { get; set; }
    
    public Guid VendorId { get; set; }
    public Party Vendor { get; set; } = null!;

    public Guid? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public string VendorInvoiceNumber { get; set; } = string.Empty; // Challan No or Vendor Invoice No

    public GrnStatus Status { get; set; } = GrnStatus.Draft;

    public ICollection<GrnItem> Items { get; set; } = new List<GrnItem>();
}
