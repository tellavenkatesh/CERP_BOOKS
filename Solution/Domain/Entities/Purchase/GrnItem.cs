using System;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Purchase;

public class GrnItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid GrnId { get; set; }
    public Grn Grn { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } // Received Quantity
}
