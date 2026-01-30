using System;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Sales;

public class DeliveryChallanLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid DeliveryChallanId { get; set; }
    [ForeignKey(nameof(DeliveryChallanId))]
    public DeliveryChallan DeliveryChallan { get; set; } = null!;

    public Guid? SalesOrderItemId { get; set; }
    [ForeignKey(nameof(SalesOrderItemId))]
    public SalesOrderItem? SalesOrderItem { get; set; }

    public Guid ItemId { get; set; }
    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    
    // Qty from SO
    public decimal OrderedQuantity { get; set; }
    
    // Actual delivered
    public decimal DeliveredQuantity { get; set; }
    
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal Amount { get; set; }

    // To track how much has been invoiced from this challan
    public decimal InvoicedQuantity { get; set; }
}
