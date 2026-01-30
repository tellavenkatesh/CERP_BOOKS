using System;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public class PurchaseOrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    
    // For tracking received quantity against ordered quantity
    public decimal ReceivedQuantity { get; set; }
    
    public Guid? AccountId { get; set; }
    public Guid? TaxId { get; set; }
}
