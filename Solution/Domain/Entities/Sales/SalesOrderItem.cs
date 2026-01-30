using System;
using System.ComponentModel.DataAnnotations.Schema;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Sales;

public class SalesOrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SalesOrderId { get; set; }
    [ForeignKey(nameof(SalesOrderId))]
    public SalesOrder SalesOrder { get; set; } = null!;

    public Guid ItemId { get; set; }
    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }

    public decimal TotalAmount { get; set; }
    
    // Fulfillment Tracking
    public decimal QuantityDelivered { get; set; }
    public decimal QuantityInvoiced { get; set; }
}
