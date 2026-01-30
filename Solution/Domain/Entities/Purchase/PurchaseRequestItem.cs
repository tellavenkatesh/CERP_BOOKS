using System;
using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Purchase;

public class PurchaseRequestItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PurchaseRequestId { get; set; }
    public PurchaseRequest PurchaseRequest { get; set; } = null!;
    
    public Guid ItemId { get; set; }
    [ForeignKey(nameof(ItemId))]
    public Item Item { get; set; } = null!;
    
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    
    public decimal EstimatedRate { get; set; }
    public decimal EstimatedAmount => Quantity * EstimatedRate;
}
