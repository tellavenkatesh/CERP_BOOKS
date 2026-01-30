using System;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Sales;

public class EstimateItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid EstimateId { get; set; }
    public Estimate Estimate { get; set; } = null!;

    public Guid ItemId { get; set; }
    public Item Item { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
}
